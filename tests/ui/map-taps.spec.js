// 勢力・都市 → 詳細シート → カードのつながり（地図の全年代・カードのある全勢力と都市）。
// 復元テスト world/ui-world.mjs・asia/ui-asia.mjs・imp-ui-test.mjs・route-tap-test.mjs を統合したもの。
// ここでは「その勢力・都市を押すと、その勢力のカードが正しい数だけ引ける」ことを見る。画面外の要素も含めて全件を押すため、
// 要素へ直接 click を送る（画面上の当たり判定は map-camera.spec.js と map-hit.spec.js で実際のタップを使って確かめる）。
// データの対応の検査なので、画面の大きさに左右されない PC の側だけで流す（playwright.config.js の mobile の testIgnore）
import { test, expect } from "./fixtures.js";
import { formatYear } from "./helpers/spec.js";
import { buildTapPlan } from "./helpers/plan.js";

const PLAN = buildTapPlan();

test.describe("勢力・都市のタップでその勢力のカードが引ける", () => {
  test("検査計画が組めている", () => {
    expect(PLAN.length, "地図の年代の数").toBeGreaterThanOrEqual(40);
  });

  for (const snap of PLAN) {
    test(`${formatYear(snap.year)}：勢力 ${snap.regions.length}・都市 ${snap.cities.length}`, async ({ ui }) => {
      await ui.openMap();
      if (snap.year !== 1648) await ui.moveToYear(snap.year);
      const problems = [];
      for (const [id, n] of snap.regions) {
        if (!(await ui.openByLabel(`${id}の詳細を見る`))) { problems.push(`勢力 ${id}：地図にない`); continue; }
        await expect.poll(ui.sheetTitle).toBe(id);
        const cta = await ui.sheetCta();
        if (!cta?.includes(`（${n}問）`)) problems.push(`勢力 ${id}：${cta ?? "ボタンなし"}（期待 ${n}問）`);
        await ui.closeSheet();
      }
      for (const [name, region] of snap.cities) {
        if (!(await ui.openByLabel(`${name}（${region}）の詳細を見る`))) { problems.push(`都市 ${name}（${region}）：地図にない`); continue; }
        await expect.poll(ui.sheetTitle, { message: `都市 ${name} → ${region}` }).toBe(region);
        await ui.closeSheet();
      }
      expect(problems).toEqual([]);
    });
  }

  // 海の勢力：航路の線に重ねた透明な当たり判定（App.jsx の renderMaritimeRegion）を押すと、その勢力のカードが開く
  for (const [year, id] of [[962, "ヴァイキング"], [1204, "ポリネシア"], [1204, "トンガ大洋帝国"], [-660, "ポリネシア"]]) {
    test(`${formatYear(year)} ${id}：航路の線を押すと詳細が開く`, async ({ page, ui }) => {
      await ui.openMap();
      await ui.moveToYear(year);
      const info = await page.evaluate((label) => {
        const g = document.querySelector(`[aria-label="${label}"]`);
        if (!g) return null;
        const lines = [...g.querySelectorAll("polyline")];
        const hit = lines.filter((p) => p.getAttribute("stroke") === "transparent");
        const dash = lines.filter((p) => p.getAttribute("stroke-dasharray"));
        hit[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        return { hit: hit.length, dash: dash.length };
      }, `${id}の詳細を見る`);
      expect(info, `${id} が地図にある`).not.toBeNull();
      expect(info.hit, "航路ごとに当たり判定がある").toBeGreaterThan(0);
      expect(info.hit).toBe(info.dash);
      await expect.poll(ui.sheetTitle).toBe(id);
      expect(await ui.sheetCta()).toMatch(/（\d+問）/);
    });
  }
});
