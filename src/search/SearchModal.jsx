// 横断検索のモーダル。ヘッダーの虫眼鏡ボタン、または Cmd+K / Ctrl+K で開く。
// 入力のたびに勢力・都市・地理・問題カードをまとめて引き、カテゴリ別に並べる。
// スマホではソフトウェアキーボードに隠れないよう、表示領域（visualViewport）の高さに合わせて全画面で開き、
// PC では画面上寄りに浮かせて ↑↓・Enter・Esc で操作できるようにする
import React, { useEffect, useMemo, useRef, useState, useDeferredValue } from "react";
import { Search, X, Landmark, MapPin, Mountain, BookOpen, CornerDownLeft } from "lucide-react";
import { search, matchRanges, SEARCH_CATEGORIES, isMacLike } from "./searchIndex.js";

const CATEGORY_ICON = { region: Landmark, city: MapPin, geo: Mountain, card: BookOpen };
const CATEGORY_COLOR = { region: "#E9C46A", city: "#F1E6CF", geo: "#9CC9EE", card: "#A5E3D0" };
const COLLAPSED_COUNT = 5; // 「すべて」表示で各カテゴリに最初に出す件数
const EXAMPLES = ["ローマ", "ナイル", "ナポレオン", "シルクロード", "モンゴル", "ばいきんぐ"];

// 一致した部分を強調して描く
function Highlighted({ text, tokens, ranges }) {
  const rs = ranges ?? matchRanges(text, tokens);
  if (!rs.length) return text;
  const out = [];
  let pos = 0;
  rs.forEach(([a, b], i) => {
    if (a > pos) out.push(text.slice(pos, a));
    out.push(<mark key={i} style={{ background: "rgba(233,196,106,0.28)", color: "#FFF4D6", borderRadius: 3, padding: "0 1px" }}>{text.slice(a, b)}</mark>);
    pos = b;
  });
  if (pos < text.length) out.push(text.slice(pos));
  return out;
}

// スマホのキーボード表示中も入力欄と結果が見える高さ（visualViewport の高さ）を追う
function useVisualViewportHeight(active) {
  const [h, setH] = useState(() => (typeof window !== "undefined" ? (window.visualViewport?.height ?? window.innerHeight) : 800));
  useEffect(() => {
    if (!active) return;
    const vv = window.visualViewport;
    const update = () => setH(vv?.height ?? window.innerHeight);
    update();
    vv?.addEventListener("resize", update);
    window.addEventListener("resize", update);
    return () => { vv?.removeEventListener("resize", update); window.removeEventListener("resize", update); };
  }, [active]);
  return h;
}

export default function SearchModal({ open, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState(() => new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const viewportH = useVisualViewportHeight(open);
  const deferredQuery = useDeferredValue(query);
  const result = useMemo(() => search(deferredQuery), [deferredQuery]);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // 開いたら入力欄にフォーカスし、背面のスクロールを止める。閉じたら開く前の要素へフォーカスを戻す
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      restoreFocusRef.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  // 表示中の結果（カテゴリの絞り込み・折りたたみを反映）を、キーボード操作用に1列に並べる
  const sections = useMemo(() => SEARCH_CATEGORIES
    .filter((c) => category === "all" || category === c.id)
    .map((c) => {
      const g = result.groups[c.id];
      const limit = category === "all" && !expanded.has(c.id) ? COLLAPSED_COUNT : g.results.length;
      return { ...c, count: g.count, results: g.results.slice(0, limit), hiddenCount: Math.min(g.results.length, g.count) - Math.min(limit, g.results.length) };
    })
    .filter((s) => s.count > 0), [result, category, expanded]);
  const flat = useMemo(() => sections.flatMap((s) => s.results.map((r) => r.item)), [sections]);

  // 入力やカテゴリが変わったら、選択位置を先頭に戻す（描画中に前回の値と比べて直す）
  const resetKey = `${deferredQuery}\u0000${category}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setActiveIndex(0);
    setExpanded(new Set());
  }
  const safeActive = Math.min(activeIndex, Math.max(0, flat.length - 1));

  useEffect(() => {
    listRef.current?.querySelector(`[data-search-index="${safeActive}"]`)?.scrollIntoView({ block: "nearest" });
  }, [safeActive]);

  if (!open) return null;

  const choose = (item) => { onSelect?.(item); onClose(); };
  const onKeyDown = (e) => {
    if (e.key === "Escape") { e.preventDefault(); onClose(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => Math.min(flat.length - 1, Math.min(i, flat.length - 1) + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => Math.max(0, Math.min(i, flat.length - 1) - 1)); }
    else if (e.key === "Enter" && !e.nativeEvent.isComposing && flat[safeActive]) { e.preventDefault(); choose(flat[safeActive]); }
  };

  const tokens = result.tokens;
  const panelStyle = isMobile
    ? { position: "fixed", left: 0, right: 0, top: 0, height: viewportH, borderRadius: 0 }
    : { position: "relative", margin: "10vh auto 0", width: "min(640px, calc(100vw - 32px))", maxHeight: Math.min(viewportH * 0.78, 640), borderRadius: 18 };
  let runningIndex = -1;

  return (
    <div
      className="fixed inset-0 font-body"
      style={{ zIndex: 80, background: "rgba(8,11,18,0.62)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="キーワード検索"
        className="flex flex-col overflow-hidden"
        style={{ ...panelStyle, background: "linear-gradient(180deg, #1E2836 0%, #18202C 100%)", border: isMobile ? "none" : "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
        onKeyDown={onKeyDown}
      >
        {/* 入力欄 */}
        <div className="shrink-0 flex items-center gap-2 px-4" style={{ paddingTop: isMobile ? "max(12px, env(safe-area-inset-top))" : 14, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Search size={18} color="#8A93A6" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="勢力・都市・地名・人物・出来事で検索"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            role="combobox"
            aria-expanded={flat.length > 0}
            aria-controls="search-results"
            aria-activedescendant={flat[safeActive] ? `search-opt-${safeActive}` : undefined}
            aria-label="検索キーワード"
            className="flex-1 bg-transparent outline-none"
            style={{ color: "#EFE3C8", fontSize: 16, minWidth: 0, height: 32 }}
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); inputRef.current?.focus(); }} aria-label="入力を消す" className="fluid-tap flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: 999, color: "#8A93A6" }}>
              <X size={16} />
            </button>
          )}
          <button type="button" onClick={onClose} className="fluid-tap shrink-0" style={{ color: "#C7D3EA", fontSize: 13, padding: "4px 8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.14)" }}>
            {isMobile ? "閉じる" : "Esc"}
          </button>
        </div>

        {/* カテゴリの絞り込み */}
        {tokens.length > 0 && (
          <div className="shrink-0 flex gap-1.5 px-4 py-2 overflow-x-auto" style={{ scrollbarWidth: "none", borderBottom: "1px solid rgba(255,255,255,0.06)" }} role="tablist" aria-label="カテゴリ">
            {[{ id: "all", label: "すべて", count: result.total }, ...SEARCH_CATEGORIES.map((c) => ({ ...c, count: result.groups[c.id].count }))].map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={category === c.id}
                onClick={() => setCategory(c.id)}
                disabled={c.count === 0 && c.id !== "all"}
                className={`fluid-tap shrink-0 rounded-full px-3 ${category === c.id ? "glass-chip-active" : "glass-chip"}`}
                style={{ height: 28, fontSize: 12, color: category === c.id ? "#f0f9ff" : "#c7d3ea", opacity: c.count === 0 && c.id !== "all" ? 0.4 : 1, whiteSpace: "nowrap" }}
              >
                {c.label} <span style={{ opacity: 0.7 }}>{c.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* 結果 */}
        <div ref={listRef} id="search-results" role="listbox" aria-label="検索結果" className="flex-1 overflow-y-auto px-2 pb-3" style={{ overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }}>
          {tokens.length === 0 ? (
            <div className="px-3 py-5" style={{ color: "#8A93A6", fontSize: 13, lineHeight: 1.8 }}>
              <p>全時代の勢力・都市・遺跡・河川や山脈などの地名と、全カードの設問・解答・解説をまとめて検索します。</p>
              <p className="mt-1">ひらがな・カタカナ、ヴァ／バ、中黒の有無などの表記ゆれは区別しません。空白で区切ると複数の語をすべて含むものを探します。</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {EXAMPLES.map((ex) => (
                  <button key={ex} type="button" onClick={() => { setQuery(ex); inputRef.current?.focus(); }} className="fluid-tap glass-chip rounded-full px-3" style={{ height: 28, fontSize: 12, color: "#c7d3ea" }}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          ) : flat.length === 0 ? (
            <div className="px-3 py-8 text-center" style={{ color: "#8A93A6", fontSize: 13 }}>
              「{query.trim()}」に一致するものは見つかりませんでした
            </div>
          ) : (
            sections.map((s) => {
              const Icon = CATEGORY_ICON[s.id];
              return (
                <section key={s.id} aria-label={s.label} className="mt-2">
                  <h3 className="flex items-center gap-1.5 px-3 pt-2 pb-1" style={{ fontSize: 11, letterSpacing: "0.12em", color: "#8A93A6" }}>
                    <Icon size={12} color={CATEGORY_COLOR[s.id]} aria-hidden="true" />
                    {s.label}
                    <span style={{ opacity: 0.7 }}>{s.count}件</span>
                  </h3>
                  {s.results.map(({ item, snippet }) => {
                    runningIndex += 1;
                    const index = runningIndex;
                    const active = index === safeActive;
                    return (
                      <div
                        key={item.key}
                        id={`search-opt-${index}`}
                        data-search-index={index}
                        role="option"
                        aria-selected={active}
                        tabIndex={-1}
                        onMouseMove={() => { if (!active) setActiveIndex(index); }}
                        onClick={() => choose(item)}
                        className="flex items-start gap-2.5 px-3 py-2 rounded-xl cursor-pointer"
                        style={{ background: active ? "rgba(56,189,248,0.12)" : "transparent", outline: active ? "1px solid rgba(56,189,248,0.35)" : "none" }}
                      >
                        <span className="shrink-0 flex items-center justify-center mt-0.5" style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(255,255,255,0.05)" }}>
                          <Icon size={14} color={CATEGORY_COLOR[s.id]} aria-hidden="true" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block" style={{ color: "#EFE3C8", fontSize: item.type === "card" ? 13.5 : 14.5, lineHeight: 1.45, fontWeight: item.type === "card" ? 400 : 600 }}>
                            <Highlighted text={item.name} tokens={tokens} />
                            {item.aliases?.length > 0 && <span style={{ color: "#8A93A6", fontWeight: 400, fontSize: 12 }}>（<Highlighted text={item.aliases.join("・")} tokens={tokens} />）</span>}
                          </span>
                          <span className="block mt-0.5" style={{ color: "#8A93A6", fontSize: 11.5 }}>{item.subtitle}</span>
                          {snippet && (
                            <span className="block mt-1" style={{ color: "#B8C1D1", fontSize: 12, lineHeight: 1.6 }}>
                              {snippet.answer && <span style={{ color: "#A5E3D0", marginRight: 4 }}>解答</span>}
                              <Highlighted text={snippet.text} ranges={snippet.ranges} />
                            </span>
                          )}
                        </span>
                        {active && !isMobile && <CornerDownLeft size={14} color="#8A93A6" className="shrink-0 mt-1.5" aria-hidden="true" />}
                      </div>
                    );
                  })}
                  {s.hiddenCount > 0 && (
                    <button type="button" onClick={() => setExpanded((prev) => new Set(prev).add(s.id))} className="fluid-tap ml-3 mt-0.5 mb-1" style={{ color: "#7DD3FC", fontSize: 12, padding: "4px 0" }}>
                      {s.label}をさらに{s.hiddenCount}件表示
                    </button>
                  )}
                  {s.count > result.groups[s.id].results.length && (category !== "all" || expanded.has(s.id)) && (
                    <p className="px-3 pb-1" style={{ color: "#6B7487", fontSize: 11.5 }}>ほか{s.count - result.groups[s.id].results.length}件（語を足すと絞り込めます）</p>
                  )}
                </section>
              );
            })
          )}
        </div>

        {/* キー操作の案内（PC のみ） */}
        {!isMobile && (
          <div className="shrink-0 flex items-center gap-4 px-4 py-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", color: "#6B7487", fontSize: 11.5 }}>
            <span>↑↓ 移動</span><span>Enter 選択</span><span>Esc 閉じる</span>
            <span className="ml-auto">{isMacLike() ? "⌘K" : "Ctrl+K"} で開閉</span>
          </div>
        )}
      </div>
    </div>
  );
}
