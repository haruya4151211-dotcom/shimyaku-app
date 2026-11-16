// UI テストの操作・観測の部品。DOM の構造に依存する書き方（セレクタ）はこのファイルに集め、
// アプリの見た目が変わったときに直す場所を1か所にする。
// 入力はできるだけ実際の入力イベント（マウス・タッチ）で送る。要素の click() を直接呼ぶと、
// 地図の「ドラッグ直後のタップを止める」処理（App.jsx の onClickCapture）と食い違い、利用者の操作と違う結果になるため。
import { expect } from "@playwright/test";
import { SPEC, formatYear, yearToPct } from "./spec.js";

export const MAP_SVG = ".grid-bg svg[preserveAspectRatio]";
const THUMB = ".glass-thumb-gold[role=slider]";

export function createUi(page, cdp, testInfo) {
  const mobile = testInfo.project.use.isMobile === true;
  const sleep = (ms) => page.waitForTimeout(ms);

  // ---- 入力 ----
  const tapAt = async (x, y) => {
    if (mobile) await page.touchscreen.tap(x, y);
    else await page.mouse.click(x, y);
  };
  // ボタンなどの要素を、その端末らしい入力（スマホはタップ、PC はクリック）で押す
  // （click / tap は画面内へのスクロールと、要素が描き直されたときの再取得を自分で行う）
  const press = async (locator) => {
    if (mobile) await locator.tap();
    else await locator.click();
  };
  const touch = (type, points) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });
  // 地図などをドラッグする。離す前に止まって慣性を出さない（hold=false なら勢いをつけたまま離す）
  const drag = async (x0, y0, dx, dy, { steps = 10, hold = true } = {}) => {
    if (mobile) {
      await touch("touchStart", [{ x: x0, y: y0, id: 1 }]);
      for (let i = 1; i <= steps; i++) { await touch("touchMove", [{ x: x0 + (dx * i) / steps, y: y0 + (dy * i) / steps, id: 1 }]); await sleep(16); }
      if (hold) await sleep(150);
      await touch("touchEnd", []);
    } else {
      await page.mouse.move(x0, y0);
      await page.mouse.down();
      for (let i = 1; i <= steps; i++) { await page.mouse.move(x0 + (dx * i) / steps, y0 + (dy * i) / steps); await sleep(16); }
      if (hold) await sleep(150);
      await page.mouse.up();
    }
  };
  const pinch = async (cx, cy, d0, d1, steps = 10) => {
    const pts = (d) => [{ x: cx - d / 2, y: cy, id: 1 }, { x: cx + d / 2, y: cy, id: 2 }];
    await touch("touchStart", pts(d0));
    for (let i = 1; i <= steps; i++) { await touch("touchMove", pts(d0 + ((d1 - d0) * i) / steps)); await sleep(16); }
    await touch("touchEnd", []);
  };
  // トラックパッドのピンチ（ctrl+ホイール）。App.jsx の onWheel は 1 イベントで exp(-deltaY*0.012) 倍にする
  const ctrlWheel = async (x, y, factor) => {
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseWheel", x, y, deltaX: 0, deltaY: -Math.log(factor) / 0.012, modifiers: 2 });
  };
  // 拡大・縮小の操作：スマホはピンチ、PC は ctrl+ホイール
  const zoomGesture = async (x, y, factor) => {
    if (mobile) await pinch(x, y, 100, 100 * factor);
    else await ctrlWheel(x, y, factor);
    await waitCameraStable();
  };

  // ---- 地図の観測 ----
  const camera = () => page.evaluate((sel) => {
    const s = document.querySelector(sel);
    if (!s) return null;
    const [left, top, w, h] = s.getAttribute("viewBox").split(" ").map(Number);
    const s0 = Math.max(s.clientWidth / 1024, s.clientHeight / 620);
    // 中心 x はアプリのカメラと同じく 0〜1024 にラップした値（viewBox の左端はラップ済みなので、右に半幅足すと 1024 を超えうる）
    return { left, top, w, h, cx: (left + w / 2) % 1024, cy: top + h / 2, zoom: s.clientWidth / w / s0, size: { w: s.clientWidth, h: s.clientHeight }, tiles: s.querySelectorAll(":scope > g").length };
  }, MAP_SVG);
  // カメラのアニメーション（最大 0.52 秒）や慣性が止まるまで待つ
  const waitCameraStable = async () => {
    let prev = JSON.stringify(await camera());
    for (let i = 0; i < 60; i++) {
      await sleep(120);
      const cur = JSON.stringify(await camera());
      if (cur === prev) return;
      prev = cur;
    }
    throw new Error("地図のカメラが止まらない");
  };
  // 年代切り替えの演出が終わり、カメラも止まった状態を待つ
  const waitMapSettled = async () => {
    // 地図は遅延描画（useDeferredValue）なので、演出が始まるまで少し間がある。始まらなければ（勢力図が同じ年など）そのまま進む
    const fading = () => page.evaluate(() => document.querySelectorAll(".territory-out, .territory-in").length);
    for (let i = 0; i < 14 && !(await fading()); i++) await sleep(50);
    await expect.poll(() => page.evaluate(() => document.querySelectorAll(".territory-out, .territory-in").length), { message: "年代切り替えの演出が終わる" }).toBe(0);
    await waitCameraStable();
  };
  // 地図領域のうち、いま画面に見えている部分（スマホでは地図が画面の下へはみ出すことがある）
  const mapRect = () => page.evaluate((sel) => {
    const r = document.querySelector(sel).getBoundingClientRect();
    return { x: r.x, y: Math.max(0, r.y), r: r.right, b: Math.min(r.bottom, innerHeight) };
  }, MAP_SVG);
  const mapCenter = async () => { const r = await mapRect(); return [(r.x + r.r) / 2, (r.y + r.b) / 2]; };
  const sliderYearText = () => page.evaluate((sel) => {
    // スライダーの上に出ている年（EraScrubber の先頭の span）
    const t = document.querySelector(sel);
    return t?.parentElement?.parentElement?.parentElement?.firstElementChild?.textContent?.trim() ?? null;
  }, THUMB);

  // 画面に見えていて、実際にその点を押すとその都市が反応する都市マーカー
  const visibleCities = () => page.evaluate((sel) => {
    const m = document.querySelector(sel).getBoundingClientRect();
    const b = Math.min(m.bottom, innerHeight);
    return [...document.querySelectorAll('[aria-label*="）の詳細を見る"]')].map((e) => {
      const r = e.querySelector("circle").getBoundingClientRect();
      return { label: e.getAttribute("aria-label"), x: r.x + r.width / 2, y: r.y + r.height / 2, o: +getComputedStyle(e).opacity };
    }).filter((p) => p.o > 0.9 && p.x > m.x + 8 && p.x < m.right - 60 && p.y > m.y + 40 && p.y < b - 8
      && document.elementFromPoint(p.x, p.y)?.closest("[role=button]")?.getAttribute("aria-label") === p.label);
  }, MAP_SVG);
  // 画面内で、その勢力の塗りの上にあり、文字や都市マーカーに重ならない点
  const regionPoint = (id, { margin = 0 } = {}) => page.evaluate(([sel, label, margin]) => {
    const m = document.querySelector(sel).getBoundingClientRect();
    const b = Math.min(m.bottom, innerHeight);
    const owner = (x, y) => { const e = document.elementFromPoint(x, y); const g = e?.closest("[role=button]"); return g && e.tagName !== "text" && e.tagName !== "circle" ? g.getAttribute("aria-label") : null; };
    for (let y = m.y + 60; y < b - 20; y += 9) for (let x = m.x + 12; x < m.right - 50; x += 9) {
      if (owner(x, y) !== label) continue;
      // margin：周囲 margin px の点もすべて同じ勢力（境界ぎわを避ける）
      if (margin && [[margin, 0], [-margin, 0], [0, margin], [0, -margin]].some(([dx, dy]) => owner(x + dx, y + dy) !== label)) continue;
      return [x, y];
    }
    return null;
  }, [MAP_SVG, `${id}の詳細を見る`, margin]);
  // 画面に見えている範囲で、押すとその勢力が開く点（塗り・勢力名・その勢力の都市の印と名前）のうち、
  // 「押すと別の勢力が開く場所・何も開かない場所（海など）」から最も離れた点と、その距離（px）。
  // （ジュネーヴのような小さな都市国家は、寄っても塗りの大部分を都市の印と名前が覆う。利用者はその名前を押して開く）
  const deepestRegionPoint = (id) => page.evaluate(([sel, id]) => {
    const m = document.querySelector(sel).getBoundingClientRect();
    const top = Math.max(m.y, 0), b = Math.min(m.bottom, innerHeight);
    const opens = (x, y) => {
      if (x < m.x || x > m.right || y < top || y > b) return null;
      const label = document.elementFromPoint(x, y)?.closest("[role=button]")?.getAttribute("aria-label");
      return label?.match(/（(.+)）の詳細を見る$/)?.[1] ?? label?.replace(/の詳細を見る$/, "") ?? null;
    };
    // 探す範囲は、その勢力を開く要素（塗り・勢力名・都市）の外接矩形と地図の重なりだけ（地図全体を走査すると、勢力の多い年で遅すぎる）
    const own = [...document.querySelectorAll(`${sel} [aria-label="${id}の詳細を見る"], ${sel} [aria-label$="（${id}）の詳細を見る"]`)]
      .flatMap((el) => [...el.getClientRects()]).filter((r) => r.width > 0 && r.height > 0);
    if (!own.length) return null;
    const x0 = Math.max(m.x, Math.min(...own.map((r) => r.left))), x1 = Math.min(m.right, Math.max(...own.map((r) => r.right)));
    const y0 = Math.max(top, Math.min(...own.map((r) => r.top))), y1 = Math.min(b, Math.max(...own.map((r) => r.bottom)));
    // 余白 r の円周（12方向）がすべてその勢力を開くか。余白は外れる最初の r（40px まで外れなければ 42）
    const ringOk = (x, y, r) => [...Array(12).keys()].every((k) => opens(x + r * Math.cos((k * Math.PI) / 6), y + r * Math.sin((k * Math.PI) / 6)) === id);
    // 走査の間隔は 6px。範囲が広いとき（植民地を含むイギリスなど）は約 4,000 点に収まるよう広げる（小さな勢力の精度は変えない）
    const step = Math.max(6, Math.sqrt(((x1 - x0) * (y1 - y0)) / 4000));
    let best = null;
    for (let y = y0 + 2; y < y1; y += step) for (let x = x0 + 2; x < x1; x += step) {
      if (opens(x, y) !== id) continue;
      // 今の最良の余白を超えられない点は、その半径の円周だけ見て打ち切る（画面を覆う大きな勢力で全点を測ると数分かかる）
      if (best && !ringOk(x, y, best.clearance)) continue;
      let r = 2;
      while (r <= 40 && ringOk(x, y, r)) r += 2;
      if (!best || r > best.clearance) best = { x, y, clearance: r };
      if (best.clearance > 40) return best; // 測れる上限に届いたらそれ以上は探さない
    }
    return best;
  }, [MAP_SVG, id]);
  // その勢力の塗りの中心が、見えている地図の中央に来るまで地図をドラッグする（利用者が指で寄せる操作）。
  // 1 回のドラッグは見えている地図の幅・高さの 40% まで
  const centerRegion = async (id) => {
    for (let i = 0; i < 12; i++) {
      const box = await page.evaluate((label) => {
        const shape = document.querySelector(`[aria-label="${label}"] path, [aria-label="${label}"] polygon`);
        if (!shape) return null;
        const r = shape.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      }, `${id}の詳細を見る`);
      if (!box) throw new Error(`${id} が地図にない`);
      const r = await mapRect();
      const [cx, cy] = [(r.x + r.r) / 2, (r.y + r.b) / 2];
      let dx = cx - box.x, dy = cy - box.y;
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      dx = Math.max(-(r.r - r.x) * 0.4, Math.min((r.r - r.x) * 0.4, dx));
      dy = Math.max(-(r.b - r.y) * 0.4, Math.min((r.b - r.y) * 0.4, dy));
      await drag(cx - dx / 2, cy - dy / 2, dx, dy);
      await waitCameraStable();
    }
  };
  // 地図の上端が画面の上端に来るまでページをスクロールする（スマホでは地図が画面の下へはみ出しているため）
  const scrollMapIntoView = async () => {
    await page.evaluate((sel) => window.scrollTo(0, document.querySelector(sel).getBoundingClientRect().top + window.scrollY), MAP_SVG);
    await sleep(200);
  };
  // スライダーで年を選ぶ1回の操作：年号チップがあればチップを、なければ目盛りの点を実際に押す（演出の途中を観察するテスト用）
  const pressYear = async (year) => {
    const chip = page.getByRole("button", { name: formatYear(year), exact: true });
    await press((await chip.count()) ? chip.first() : page.locator(`[aria-label="${formatYear(year)}へ移動"]`));
  };
  // 地図にある勢力の ID。largestFirst のときは、画面に見えている塗りの外接矩形の面積が大きい順（大きな勢力から試すテスト用）
  const regionIdsOnMap = ({ largestFirst = false } = {}) => page.evaluate(([sel, largestFirst]) => {
    const m = document.querySelector(sel).getBoundingClientRect();
    const area = new Map();
    for (const g of document.querySelectorAll(".region-hitbox")) {
      const id = g.getAttribute("aria-label").replace("の詳細を見る", "");
      const r = g.getBoundingClientRect();
      const w = Math.max(0, Math.min(r.right, m.right, innerWidth) - Math.max(r.left, m.left, 0));
      const h = Math.max(0, Math.min(r.bottom, m.bottom, innerHeight) - Math.max(r.top, m.top, 0));
      area.set(id, (area.get(id) ?? 0) + w * h);
    }
    const ids = [...area.keys()];
    return largestFirst ? ids.sort((a, b) => area.get(b) - area.get(a)) : ids;
  }, [MAP_SVG, largestFirst]);

  // ---- 詳細シート ----
  const sheetTitle = () => page.evaluate(() => {
    const s = document.querySelector(".map-sheet");
    if (!s || getComputedStyle(s).pointerEvents === "none") return null;
    return s.querySelector("h3")?.textContent ?? null;
  });
  const sheetCta = () => page.evaluate(() => [...document.querySelectorAll(".map-sheet button")].find((b) => b.textContent.includes("通史をまとめて学習"))?.textContent ?? null);
  const closeSheet = async () => {
    if ((await sheetTitle()) === null) return;
    // 開くアニメーション（高さの変化 0.4 秒）が終わってから押す（利用者もシートが開ききってから閉じる）
    const height = () => page.evaluate(() => Math.round(document.querySelector(".map-sheet")?.getBoundingClientRect().height ?? 0));
    let prev = await height();
    for (let i = 0; i < 20; i++) { await sleep(80); const h = await height(); if (h === prev) break; prev = h; }
    await press(page.locator(".map-sheet").getByRole("button", { name: "閉じる" }));
    await expect.poll(sheetTitle).toBeNull();
  };
  // 画面外の勢力・都市も含めて、地図の要素からシートを開く（カードと勢力のつながりの確認用。見た目の当たり判定は別のテストで確かめる）
  const openByLabel = async (label) => {
    const ok = await page.evaluate((l) => {
      const e = document.querySelector(`[aria-label="${l}"]`);
      if (!e) return false;
      e.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      return true;
    }, label);
    return ok;
  };

  // ---- 画面遷移 ----
  // Web フォント（Google Fonts、外部サイト）の読み込みを待つ。読み込み中に文字の幅が変わると位置の計測がずれるため。
  // 通信が遅い・つながらないときは 5 秒で諦めて代わりのフォントのまま進む（外部の都合でテストを止めない）
  const waitFonts = () => page.evaluate(() => Promise.race([document.fonts.ready.then(() => true), new Promise((r) => setTimeout(() => r(false), 5000))]));
  const goto = async (path = "/") => { await page.goto(path); await waitFonts(); };
  // 記録用のスクリーンショット（検査項目ではない）。撮影はフォントの読み込みを待つため、外部の通信が遅いと時間切れになる。
  // そのときは失敗にせず、省略したことを結果に残す
  const snapshot = async (name) => {
    try { await page.screenshot({ path: testInfo.outputPath(name), timeout: 5000 }); }
    catch (e) { testInfo.annotations.push({ type: "note", description: `スクリーンショット ${name} を省略（${e.message.split("\n")[0]}）` }); }
  };
  const openMap = async () => {
    await goto("/");
    await press(page.getByRole("button", { name: "地図", exact: true }));
    await expect(page.locator(MAP_SVG)).toBeVisible();
    await expect.poll(sliderYearText).toBe(formatYear(SPEC.initialYear));
    await waitCameraStable();
  };
  const mapButton = (name) => page.getByRole("button", { name, exact: true });
  const resetView = async () => { await press(mapButton("表示をリセット")); await waitCameraStable(); };

  // 年代スライダーで指定の年へ移る。つまみをその年の位置へドラッグし、スライダーの下に出る年号チップ（「800年」）を押して正確に合わせる。
  // スライダー上の目盛りの点（「800年へ移動」、幅 20px）は、近い年どうしが重なって隣の年の点に覆われることがあり、
  // 実際に押すと隣の年が選ばれる（2026-11-15 の調査）。そのため利用者が年を確実に選べる年号チップを使う。
  // チップはつまみの位置の前後150年・近い順に最大6つなので、まずその年の近くまでつまみを動かす。出なければ少しずらしてやり直す
  const moveToYear = async (year) => {
    const chip = page.getByRole("button", { name: formatYear(year), exact: true });
    for (const offset of [0, 30, -30, 60, -60]) {
      if (await chip.count()) break;
      const [tx, ty, left, width] = await page.evaluate((sel) => {
        const t = document.querySelector(sel); const r = t.getBoundingClientRect(); const w = t.parentElement.getBoundingClientRect();
        return [r.x + r.width / 2, r.y + r.height / 2, w.x, w.width];
      }, THUMB);
      const x = left + (yearToPct(year + offset) / 100) * width;
      await page.mouse.move(tx, ty); await page.mouse.down();
      await page.mouse.move((tx + x) / 2, ty, { steps: 3 }); await page.mouse.move(x, ty, { steps: 3 });
      await page.mouse.up();
      await sleep(250);
    }
    if (!(await chip.count())) throw new Error(`スライダーの下に「${formatYear(year)}」の年号チップが出ない`);
    await press(chip.first());
    await expect.poll(sliderYearText, { message: `スライダーが ${formatYear(year)} を指す` }).toBe(formatYear(year));
    await waitMapSettled();
  };

  return {
    mobile, sleep, tapAt, press, drag, pinch, ctrlWheel, zoomGesture, touch,
    camera, waitCameraStable, waitMapSettled, mapRect, mapCenter, sliderYearText,
    visibleCities, regionPoint, deepestRegionPoint, centerRegion, scrollMapIntoView, pressYear, regionIdsOnMap, sheetTitle, sheetCta, closeSheet, openByLabel,
    goto, snapshot, openMap, mapButton, resetView, moveToYear,
  };
}
