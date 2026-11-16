// 勢力の詳細シート（ボトムシート）：上スワイプでフル表示、下スワイプでハーフ表示、さらに下スワイプで閉じる。
// 復元テスト sheet-test.mjs の移行。シートは高さが変わる作りなので、上端のつまみの位置と高さで判定する
import { test, expect } from "./fixtures.js";

test("詳細シートをスワイプで開閉する", { tag: "@viewport" }, async ({ ui, page }) => {
  test.skip(!ui.mobile, "スワイプでのシート操作はスマホの操作");
  await ui.openMap();
  const pt = await ui.regionPoint("フランス王国", { margin: 12 });
  await ui.tapAt(pt[0], pt[1]);
  await expect.poll(ui.sheetTitle).toBe("フランス王国");
  await ui.sleep(450); // 開くアニメーション（0.4 秒）
  const handle = () => page.evaluate(() => {
    const s = document.querySelector(".map-sheet");
    const r = s.getBoundingClientRect();
    return r.y >= innerHeight - 2 || getComputedStyle(s).pointerEvents === "none" ? null : { x: r.x + r.width / 2, y: r.y + 12, h: Math.round(innerHeight - r.y) };
  });
  const swipe = async (dy) => {
    const h = await handle();
    await ui.touch("touchStart", [{ x: h.x, y: h.y, id: 1 }]);
    for (let i = 1; i <= 10; i++) { await ui.touch("touchMove", [{ x: h.x, y: h.y + (dy * i) / 10, id: 1 }]); await ui.sleep(16); }
    await ui.touch("touchEnd", []);
    await ui.sleep(550);
  };
  const half = await handle();
  expect(half).not.toBeNull();
  await swipe(-200);
  const full = await handle();
  expect(full.h, `上スワイプでフル表示（${half.h} → ${full.h}px）`).toBeGreaterThan(half.h + 100);
  await swipe(220);
  const half2 = await handle();
  expect(half2.h, "下スワイプでハーフ表示").toBeLessThan(full.h - 100);
  await swipe(220);
  expect(await handle(), "さらに下スワイプで閉じる").toBeNull();
  expect(await ui.sheetTitle()).toBeNull();
});

test("詳細シートの「閉じる」ボタンで閉じ、地図は操作できるまま", { tag: "@viewport" }, async ({ ui }) => {
  await ui.openMap();
  const pt = await ui.regionPoint("フランス王国", { margin: 12 });
  await ui.tapAt(pt[0], pt[1]);
  await expect.poll(ui.sheetTitle).toBe("フランス王国");
  expect(await ui.sheetCta()).toMatch(/（\d+問）/);
  // シートはノンモーダル：開いたまま別の勢力を押すと、そちらに切り替わる
  const other = (await ui.regionIdsOnMap()).find((id) => id !== "フランス王国");
  const pt2 = await ui.regionPoint(other, { margin: 12 });
  if (pt2 && (await ui.sheetTitle()) && pt2[1] < (await ui.mapRect()).b * 0.45) {
    await ui.tapAt(pt2[0], pt2[1]);
    await expect.poll(ui.sheetTitle).toBe(other);
  }
  await ui.closeSheet();
});
