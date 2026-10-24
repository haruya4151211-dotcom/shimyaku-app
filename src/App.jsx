import { CARDS,
  MAP_YEARS,
  WORLD_LAND_PATH,
  HRE_POINTS_1618,
  HRE_POINTS_1648,
  FR_POINTS_1618,
  FR_POINTS_1648,
  NL_POINTS,
  SPAIN_AUSTRIA_PATH,
  HRE_AUSTRIA_SUB,
  HRE_BOHEMIA_SUB,
  BACKGROUND_TERRITORIES,
  OTTOMAN_PATH,
  MAP_REGIONS,
  CAPITAL_CITIES,
  RIVERS,
  SEA_LABELS,
  REGION_BLURB, } from './data/historyData';
import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef } from "react";
import { Star, Heart, RotateCw, RotateCcw, Filter, Sparkles, ChevronRight, ChevronLeft, ChevronDown, ArrowRight, X, BookMarked, RefreshCw, Check, Tag, Map as MapIcon, BookOpen, Info, Search } from "lucide-react";

// ---------------------------------------------------------------------------
// サンプルコンテンツ（Phase 1: 検証用に「近世ヨーロッパ／三十年戦争〜ウェストファリア体制」1テーマのみ収録）
// ---------------------------------------------------------------------------


const BOX_INTERVAL_DAYS = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
const DIFF_BAND = (d) => (d <= 1 ? "基礎" : d <= 3 ? "早慶標準" : "東大論述");

// 検索の表記揺れ吸収：全角英数字→半角、全角スペース→半角、カタカナ→ひらがな、大文字→小文字
function normalizeSearchText(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/　/g, " ")
    .replace(/[\u30a1-\u30f6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

const cardMode = (c) => (c.cloze ? "文脈穴埋め" : "一問一答");

function cardSearchBlob(c) {
  const parts = [c.front, c.back, ...c.theme, c.region, c.era];
  if (c.cloze) {
    parts.push(c.cloze.template);
    c.cloze.slots.forEach((s) => parts.push(s.answer, s.category));
    c.cloze.points.forEach((p) => parts.push(p.label, p.text));
  }
  if (c.anecdote) parts.push(c.anecdote);
  return normalizeSearchText(parts.filter(Boolean).join(" "));
}

// フィルタ・プレビュー双方から共有する判定ロジック（アプリ適用中の条件／シート内ドラフトの両方で使う）
function matchesFilters(c, f) {
  if (f.selectedThemes.size > 0 && !c.theme.some((t) => f.selectedThemes.has(t))) return false;
  if (f.selectedRegions.size > 0 && !f.selectedRegions.has(c.region)) return false;
  if (f.selectedEras.size > 0 && !f.selectedEras.has(c.era)) return false;
  if (f.modeFilter !== "両方とも" && cardMode(c) !== f.modeFilter) return false;
  if (c.difficulty < f.diffMin || c.difficulty > f.diffMax) return false;
  if (f.favOnly && !f.favorites.includes(c.id)) return false;
  if (f.queryTokens && f.queryTokens.length > 0) {
    const blob = cardSearchBlob(c);
    if (!f.queryTokens.every((t) => blob.includes(t))) return false;
  }
  return true;
}

const STORAGE_PROGRESS_KEY = "shimyaku:progress";
const STORAGE_FAVORITES_KEY = "shimyaku:favorites";
const STORAGE_PRESETS_KEY = "shimyaku:presets";

function useStorageState(key, fallback) {
  const [value, setValue] = useState(fallback);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await window.storage.get(key, false);
        if (!cancelled && res && res.value) setValue(JSON.parse(res.value));
      } catch (e) {
        // キーが存在しない場合はフォールバックのまま
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [key]);

  const persist = useCallback(async (next) => {
    setValue(next);
    try {
      await window.storage.set(key, JSON.stringify(next), false);
    } catch (e) {
      console.error("storage save failed", e);
    }
  }, [key]);

  return [value, persist, loaded];
}

// フルード・グラスモーフィズム：タップ位置基準の波紋エフェクトを生成
function spawnRipple(e) {
  const btn = e.currentTarget;
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.8;
  const x = (e.clientX ?? rect.left + rect.width / 2) - rect.left - size / 2;
  const y = (e.clientY ?? rect.top + rect.height / 2) - rect.top - size / 2;
  const span = document.createElement("span");
  span.className = "fluid-ripple";
  span.style.width = `${size}px`;
  span.style.height = `${size}px`;
  span.style.left = `${x}px`;
  span.style.top = `${y}px`;
  btn.appendChild(span);
  setTimeout(() => span.remove(), 650);
}

export default function App() {
  const [progress, setProgress, progressLoaded] = useStorageState(STORAGE_PROGRESS_KEY, {});
  const [favorites, setFavorites, favLoaded] = useStorageState(STORAGE_FAVORITES_KEY, []);
  const [presets, setPresets, presetsLoaded] = useStorageState(STORAGE_PRESETS_KEY, []);

  const [view, setView] = useState("study"); // 'study' | 'favorites'
  // ここから下は「適用中（Applied）」の出題条件。実際のセッションはこれらの値だけを見る
  const [selectedThemes, setSelectedThemes] = useState(new Set());
  const [selectedRegions, setSelectedRegions] = useState(new Set());
  const [selectedEras, setSelectedEras] = useState(new Set());
  const [modeFilter, setModeFilter] = useState("両方とも");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [diffMin, setDiffMin] = useState(0);
  const [diffMax, setDiffMax] = useState(5);
  const [favOnly, setFavOnly] = useState(false);
  const [activePresetId, setActivePresetId] = useState(null);

  // ここから下は「出題範囲の設定」ボトムシート内だけで編集するドラフト状態。
  // フッターの決定ボタンを押すまでは適用中の条件に一切反映されない（キャンセル可能）
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftThemes, setDraftThemes] = useState(new Set());
  const [draftRegions, setDraftRegions] = useState(new Set());
  const [draftEras, setDraftEras] = useState(new Set());
  const [draftMode, setDraftMode] = useState("両方とも");
  const [draftSearch, setDraftSearch] = useState("");
  const [draftDebouncedSearch, setDraftDebouncedSearch] = useState("");
  const [draftDiffMin, setDraftDiffMin] = useState(0);
  const [draftDiffMax, setDraftDiffMax] = useState(5);
  const [draftFavOnly, setDraftFavOnly] = useState(false);
  const [draftActivePresetId, setDraftActivePresetId] = useState(null);

  const [confirmingReset, setConfirmingReset] = useState(false);
  const [listOpen, setListOpen] = useState(false); // 全量一覧の展開トグル

  const [queue, setQueue] = useState(CARDS.map((c) => c.id));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showAnecdote, setShowAnecdote] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [tooltipShown, setTooltipShown] = useState(false); // このセッションでヒントの吹き出しを既に見せたか（文脈穴埋めカードの初出現1回のみ）

  // シートを開いた瞬間、現在適用中の条件をドラフトへコピーする（キャンセル時に元へ戻せるように）
  useEffect(() => {
    if (filterOpen) {
      setDraftThemes(new Set(selectedThemes));
      setDraftRegions(new Set(selectedRegions));
      setDraftEras(new Set(selectedEras));
      setDraftMode(modeFilter);
      setDraftSearch(searchQuery);
      setDraftDiffMin(diffMin);
      setDraftDiffMax(diffMax);
      setDraftFavOnly(favOnly);
      setDraftActivePresetId(activePresetId);
    }
  }, [filterOpen]); // eslint-disable-line

  // フリーワード検索：タイピング中の過度な再描画を防ぐデバウンス（200ms）
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 200);
    return () => clearTimeout(t);
  }, [searchQuery]);
  useEffect(() => {
    const t = setTimeout(() => setDraftDebouncedSearch(draftSearch), 200);
    return () => clearTimeout(t);
  }, [draftSearch]);

  const allThemes = useMemo(() => [...new Set(CARDS.flatMap((c) => c.theme))], []);
  const allRegions = useMemo(() => [...new Set(CARDS.map((c) => c.region))], []);
  const allEras = useMemo(() => [...new Set(CARDS.map((c) => c.era))], []);

  const filteredCards = useMemo(() => {
    const q = normalizeSearchText(debouncedQuery).trim();
    const queryTokens = q ? q.split(/\s+/).filter(Boolean) : [];
    return CARDS.filter((c) => matchesFilters(c, {
      selectedThemes, selectedRegions, selectedEras, modeFilter, diffMin, diffMax, favOnly, favorites, queryTokens,
    }));
  }, [selectedThemes, selectedRegions, selectedEras, modeFilter, diffMin, diffMax, favOnly, favorites, debouncedQuery]);

  // ボトムシート内の決定ボタンに表示するライブプレビュー件数（ドラフト条件ベース）
  const draftResultCount = useMemo(() => {
    const q = normalizeSearchText(draftDebouncedSearch).trim();
    const queryTokens = q ? q.split(/\s+/).filter(Boolean) : [];
    return CARDS.filter((c) => matchesFilters(c, {
      selectedThemes: draftThemes, selectedRegions: draftRegions, selectedEras: draftEras,
      modeFilter: draftMode, diffMin: draftDiffMin, diffMax: draftDiffMax, favOnly: draftFavOnly,
      favorites, queryTokens,
    })).length;
  }, [draftThemes, draftRegions, draftEras, draftMode, draftDiffMin, draftDiffMax, draftFavOnly, favorites, draftDebouncedSearch]);

  const startSession = useCallback(() => {
    setQueue(filteredCards.map((c) => c.id));
    setIndex(0);
    setFlipped(false);
    setShowAnecdote(false);
    setSessionDone(filteredCards.length === 0);
    setReviewedCount(0);
    setTooltipShown(false);
  }, [filteredCards]);

  useEffect(() => { startSession(); }, [selectedThemes, selectedRegions, selectedEras, modeFilter, diffMin, diffMax, favOnly, debouncedQuery]); // eslint-disable-line

  const currentCard = useMemo(() => {
    if (sessionDone || queue.length === 0) return null;
    const id = queue[index];
    return CARDS.find((c) => c.id === id) || null;
  }, [queue, index, sessionDone]);

  const toggleDraftSet = (setter, current, value) => {
    const next = new Set(current);
    next.has(value) ? next.delete(value) : next.add(value);
    setter(next);
    setDraftActivePresetId(null);
  };

  const toggleFavorite = (id) => {
    const next = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(next);
  };

  const savePreset = (name) => {
    if (!name || !name.trim()) return;
    const preset = {
      id: `p_${Date.now()}`,
      name: name.trim(),
      themes: [...draftThemes],
      regions: [...draftRegions],
      eras: [...draftEras],
      diffMin: draftDiffMin, diffMax: draftDiffMax, favOnly: draftFavOnly,
      modeFilter: draftMode,
    };
    setPresets([...presets, preset]);
    setDraftActivePresetId(preset.id);
  };

  const applyPresetToDraft = (preset) => {
    setDraftThemes(new Set(preset.themes));
    setDraftRegions(new Set(preset.regions));
    setDraftEras(new Set(preset.eras));
    setDraftDiffMin(preset.diffMin);
    setDraftDiffMax(preset.diffMax);
    setDraftFavOnly(preset.favOnly);
    setDraftMode(preset.modeFilter || "両方とも");
    setDraftActivePresetId(preset.id);
  };

  const deletePreset = (id) => {
    setPresets(presets.filter((p) => p.id !== id));
    if (draftActivePresetId === id) setDraftActivePresetId(null);
  };

  // ボトムシートのフッター「この条件で学習を開始する」：ドラフトを適用中の条件へ確定し、セッションを開始してシートを閉じる
  const applyDraftFilters = () => {
    setSelectedThemes(draftThemes);
    setSelectedRegions(draftRegions);
    setSelectedEras(draftEras);
    setModeFilter(draftMode);
    setSearchQuery(draftSearch);
    setDiffMin(draftDiffMin);
    setDiffMax(draftDiffMax);
    setFavOnly(draftFavOnly);
    setActivePresetId(draftActivePresetId);
    setFilterOpen(false);
  };

  const grade = (label) => {
    if (!currentCard) return;
    const prevBox = progress[currentCard.id]?.box || 1;
    let nextBox;
    if (label === "again") nextBox = 1;
    else if (label === "hard") nextBox = Math.max(prevBox - 1, 1);
    else if (label === "good") nextBox = Math.min(prevBox + 1, 5);
    else nextBox = Math.min(prevBox + 2, 5); // easy

    const next = { ...progress, [currentCard.id]: { box: nextBox, last: new Date().toISOString() } };
    setProgress(next);
    setReviewedCount((n) => n + 1);

    if (index + 1 >= queue.length) {
      setSessionDone(true);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
      setShowAnecdote(false);
    }
  };

  const goPrev = () => {
    if (index === 0) return;
    setIndex((i) => i - 1);
    setFlipped(false);
    setShowAnecdote(false);
  };

  const jumpToCard = (id) => {
    setQueue([id]);
    setIndex(0);
    setFlipped(false);
    setShowAnecdote(false);
    setSessionDone(false);
    setView("study");
    setListOpen(false);
    setTooltipShown(false);
  };

  const startFromList = (orderedIds, theme, startIndex = 0) => {
    setQueue(orderedIds);
    setIndex(startIndex);
    setFlipped(false);
    setShowAnecdote(false);
    setSessionDone(orderedIds.length === 0);
    setListOpen(false);
    setTooltipShown(false);
    if (theme) {
      setSelectedThemes(new Set([theme]));
      setSelectedRegions(new Set());
      setSelectedEras(new Set());
      setActivePresetId(null);
    }
  };

  const startFavoritesSession = (ids) => {
    setQueue(ids);
    setIndex(0);
    setFlipped(false);
    setShowAnecdote(false);
    setSessionDone(ids.length === 0);
    setTooltipShown(false);
    setView("study");
  };

  const studyByRegion = (region) => {
    setSelectedRegions(new Set([region]));
    setSelectedThemes(new Set());
    setSelectedEras(new Set());
    setActivePresetId(null);
    setView("study");
    setFilterOpen(false);
  };

  const studyByTheme = (theme) => {
    setSelectedThemes(new Set([theme]));
    setSelectedRegions(new Set());
    setSelectedEras(new Set());
    setActivePresetId(null);
    setView("study");
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setDraftThemes(new Set());
    setDraftRegions(new Set());
    setDraftEras(new Set());
    setDraftMode("両方とも");
    setDraftSearch("");
    setDraftDiffMin(0);
    setDraftDiffMax(5);
    setDraftFavOnly(false);
    setDraftActivePresetId(null);
  };

  const resetAllData = async () => {
    setProgress({});
    setFavorites([]);
    setPresets([]);
    try {
      await window.storage.set(STORAGE_PROGRESS_KEY, JSON.stringify({}), false);
      await window.storage.set(STORAGE_FAVORITES_KEY, JSON.stringify([]), false);
      await window.storage.set(STORAGE_PRESETS_KEY, JSON.stringify([]), false);
    } catch (e) { console.error(e); }
  };

  const dataLoaded = progressLoaded && favLoaded && presetsLoaded;

  return (
    <div className="min-h-screen w-full" style={{ background: "#1B2430" }}>
      <FontStyles />
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <Header view={view} setView={setView} favCount={favorites.length} />

        {!dataLoaded ? (
          <div className="text-center py-24" style={{ color: "#C7CDD9", fontFamily: "'Zen Kaku Gothic New', sans-serif" }}>
            読み込み中…
          </div>
        ) : view === "favorites" ? (
          <FavoritesView
            favorites={favorites}
            onJump={jumpToCard}
            onToggleFavorite={toggleFavorite}
            onStartAll={startFavoritesSession}
          />
        ) : view === "map" ? (
          <MapView onStudyRegion={studyByRegion} onStudyTheme={studyByTheme} onJumpToCard={jumpToCard} />
        ) : (
          <>
            <FilterPanel
              open={filterOpen}
              onClose={() => setFilterOpen(false)}
              onOpenTrigger={() => setFilterOpen(true)}
              onApply={applyDraftFilters}
              appliedCount={filteredCards.length}
              allThemes={allThemes}
              allRegions={allRegions}
              allEras={allEras}
              selectedThemes={draftThemes}
              selectedRegions={draftRegions}
              selectedEras={draftEras}
              modeFilter={draftMode}
              setModeFilter={(m) => { setDraftMode(m); setDraftActivePresetId(null); }}
              searchQuery={draftSearch}
              setSearchQuery={setDraftSearch}
              diffMin={draftDiffMin}
              diffMax={draftDiffMax}
              favOnly={draftFavOnly}
              setDiffMin={(v) => { setDraftDiffMin(v); setDraftActivePresetId(null); }}
              setDiffMax={(v) => { setDraftDiffMax(v); setDraftActivePresetId(null); }}
              setFavOnly={(v) => { setDraftFavOnly(v); setDraftActivePresetId(null); }}
              toggleTheme={(t) => toggleDraftSet(setDraftThemes, draftThemes, t)}
              toggleRegion={(r) => toggleDraftSet(setDraftRegions, draftRegions, r)}
              toggleEra={(e) => toggleDraftSet(setDraftEras, draftEras, e)}
              onReset={resetFilters}
              resultCount={draftResultCount}
              presets={presets}
              activePresetId={draftActivePresetId}
              onSavePreset={savePreset}
              onApplyPreset={applyPresetToDraft}
              onDeletePreset={deletePreset}
              confirmingReset={confirmingReset}
              setConfirmingReset={setConfirmingReset}
              onResetAllData={resetAllData}
            />

            {sessionDone || !currentCard ? (
              <SessionEnd
                total={filteredCards.length}
                reviewed={reviewedCount}
                onRestart={startSession}
                onOpenFilter={() => setFilterOpen(true)}
                empty={filteredCards.length === 0}
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery("")}
              />
            ) : (
              <StudyStage
                card={currentCard}
                index={index}
                total={queue.length}
                onPrev={goPrev}
                listOpen={listOpen}
                setListOpen={setListOpen}
                filteredCards={filteredCards}
                onSelectCard={(ids, i, theme) => startFromList(ids, theme, i)}
                onStartWithOrder={startFromList}
                tooltipArmed={!tooltipShown && !!currentCard.cloze}
                onTooltipDismiss={() => setTooltipShown(true)}
                flipped={flipped}
                setFlipped={setFlipped}
                showAnecdote={showAnecdote}
                setShowAnecdote={setShowAnecdote}
                isFavorite={favorites.includes(currentCard.id)}
                onToggleFavorite={() => toggleFavorite(currentCard.id)}
                onGrade={grade}
                boxIntervals={BOX_INTERVAL_DAYS}
                currentBox={progress[currentCard.id]?.box || 1}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// UI パーツ
// ---------------------------------------------------------------------------

function FontStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap');

      .font-display { font-family: 'Shippori Mincho', serif; }
      .font-body { font-family: 'Zen Kaku Gothic New', sans-serif; }

      .grid-bg {
        background-image:
          radial-gradient(circle at 1px 1px, rgba(201,162,39,0.10) 1px, transparent 0);
        background-size: 28px 28px;
      }

      .card-face {
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }
      .card-flip {
        transition: transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1);
        transform-style: preserve-3d;
      }
      @media (prefers-reduced-motion: reduce) {
        .card-flip { transition: none; }
      }

      .torn-edge {
        clip-path: polygon(
          0% 2%, 3% 0%, 97% 0%, 100% 2%,
          100% 98%, 97% 100%, 3% 100%, 0% 98%
        );
      }

      button:focus-visible, [tabindex]:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(56,189,248,0.32), 0 0 12px rgba(56,189,248,0.4);
        border-radius: inherit;
      }

      /* 水滴レンズ：ドロップダウンのホバー追従カプセル。ガラスの屈折を思わせる薄いプリズム光彩を縁に乗せる */
      .liquid-lens {
        background: linear-gradient(135deg, rgba(56,189,248,0.20) 0%, rgba(99,102,241,0.14) 100%);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        box-shadow:
          inset 0 0 0 1px rgba(255,255,255,0.22),
          0 0 14px rgba(56,189,248,0.30),
          inset 1px 1px 2px rgba(165,255,220,0.12),
          inset -1px -1px 2px rgba(255,180,220,0.10);
      }

      /* フィルタパネル専用：ガラス風サブテーマ（シアン×ブルー） */
      .glass-filter-body {
        background:
          radial-gradient(circle at 20% -10%, rgba(56,189,248,0.10), transparent 55%),
          radial-gradient(circle at 100% 110%, rgba(99,102,241,0.10), transparent 55%),
          #12182a;
        border-top: 1px solid rgba(255,255,255,0.08);
      }
      .glass-chip {
        background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.12);
      }
      .glass-chip-active {
        background: linear-gradient(135deg, rgba(6,182,212,0.35) 0%, rgba(59,130,246,0.25) 100%);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(56,189,248,0.55);
        box-shadow: 0 4px 14px rgba(14,165,233,0.25), inset 0 1px 0.5px rgba(255,255,255,0.5);
      }

      /* 破壊的操作（削除する）：クリムゾン〜ルビー系の半透明リキッドグラス */
      .glass-danger-btn {
        color: #ffe3e3;
        background: linear-gradient(160deg, rgba(220,38,38,0.5) 0%, rgba(136,19,55,0.4) 100%);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255,120,120,0.35);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 16px rgba(239,68,68,0.25);
      }
      .glass-danger-btn.fluid-tap:active {
        transform: scale(0.95);
        filter: saturate(1.3) brightness(1.05);
      }

      /* キャンセル：無色〜薄いスレート系の透過グラス */
      .glass-ghost-btn {
        color: #c7d3ea;
        background: rgba(255,255,255,0.06);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid rgba(255,255,255,0.15);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.18);
      }
      .glass-ghost-btn.fluid-tap:active {
        transform: scale(0.95);
      }

      /* 一覧の「この並び順で学習を開始」：アクリル調のリキッドグラス・プライマリボタン */
      .glass-action-btn {
        color: #2A2118;
        background: linear-gradient(160deg, rgba(255,224,150,0.85) 0%, rgba(224,184,110,0.75) 100%);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255,238,200,0.85);
        box-shadow: inset 0 1px 1px rgba(255,250,235,0.7), inset 0 0 20px rgba(255,220,150,0.25), 0 6px 22px rgba(201,162,39,0.4);
        transition: box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .glass-action-btn:hover {
        box-shadow: inset 0 1px 1px rgba(255,250,235,0.85), inset 0 0 24px rgba(255,220,150,0.35), 0 8px 28px rgba(201,162,39,0.55);
        border-color: rgba(255,244,220,1);
        transform: translateY(-1px) scale(1.02);
      }
      .glass-action-btn.fluid-tap:active {
        transform: scale(0.96, 0.92);
      }

      /* 同期完了の吹き出しトースト */
      .sync-toast {
        position: absolute;
        left: 50%;
        bottom: calc(100% + 8px);
        transform: translateX(-50%);
        white-space: nowrap;
        font-size: 11px;
        color: #eafcff;
        padding: 6px 12px;
        border-radius: 999px;
        background: linear-gradient(135deg, rgba(6,182,212,0.35) 0%, rgba(59,130,246,0.28) 100%);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(125,216,236,0.4);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), 0 4px 14px rgba(14,165,233,0.3);
        animation: syncToastInOut 2s ease forwards;
        pointer-events: none;
        z-index: 10;
      }
      @keyframes syncToastInOut {
        0% { opacity: 0; transform: translateX(-50%) translateY(4px) scale(0.9); }
        12% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        82% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        100% { opacity: 0; transform: translateX(-50%) translateY(4px) scale(0.92); }
      }
      @media (prefers-reduced-motion: reduce) {
        .glass-action-btn { transition: none; }
        .sync-toast { animation: none; opacity: 1; }
      }

      .safety-reset-pill {
        color: #94a3b8;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
      }
      .safety-reset-pill:hover, .safety-reset-pill:focus-visible {
        color: #f87171;
        border-color: rgba(248,113,113,0.45);
        background: rgba(248,113,113,0.06);
        box-shadow: 0 0 10px rgba(248,113,113,0.18);
      }

      /* パネル内部要素のスタッガー・フェードイン（開くたびに上から下へ時間差で浮き上がる） */
      @keyframes staggerFadeUp {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .stagger-item { opacity: 0; }
      .stagger-item.stagger-in {
        animation: staggerFadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      @media (prefers-reduced-motion: reduce) {
        .stagger-item { opacity: 1 !important; animation: none !important; }
      }


      /* 出題範囲設定ボトムシート：親画面のスクロールと完全に分離したオーバーレイ */
      .filter-sheet-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(10,14,22,0.6);
        backdrop-filter: blur(2px);
        z-index: 60;
        transition: opacity 0.3s ease;
      }
      .filter-sheet {
        position: fixed;
        left: 0; right: 0; bottom: 0;
        z-index: 61;
        max-width: 640px;
        margin: 0 auto;
        max-height: 93vh;
        display: flex;
        flex-direction: column;
        border-radius: 24px 24px 0 0;
        background: linear-gradient(180deg, #1b2433 0%, #141a26 100%);
        border: 1px solid rgba(255,255,255,0.1);
        border-bottom: none;
        box-shadow: 0 -8px 40px rgba(0,0,0,0.45);
        overscroll-behavior: contain;
      }

      /* 地図：エリア詳細パネルのボトムシート（ハーフ↔フル可変ドロワー） */
      .map-sheet {
        position: fixed;
        left: 0; right: 0; bottom: 0;
        z-index: 61;
        max-width: 640px;
        margin: 0 auto;
        max-height: 94vh;
        min-height: 30vh;
        display: flex;
        flex-direction: column;
        border-radius: 24px 24px 0 0;
        background: linear-gradient(180deg, #1b2433 0%, #141a26 100%);
        border: 1px solid rgba(255,255,255,0.1);
        border-bottom: none;
        box-shadow: 0 -8px 40px rgba(0,0,0,0.45);
        overscroll-behavior: contain;
      }

      /* 地図：勢力エリアのタップアフォーダンス（未選択でも「触れるオブジェクト」だと伝える） */
      /* transform:scale() による拡大は Safari/モバイルで transform-box:fill-box と組み合わさると
         中心座標(cx/cy)がズレて描画崩れを起こすリスクがあるため廃止。色・不透明度・線幅は
         Vol4の数値をそのまま維持し、glow（drop-shadow）の点滅だけを新たに追加する。 */
      .region-hitbox {
        transition: filter 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .region-ellipse-unselected {
        fill-opacity: 0.55;
        stroke-opacity: 0.4;
        stroke-width: 0.6px;
        transition: stroke-opacity 0.3s ease, filter 0.3s ease;
      }
      .region-hitbox:hover .region-ellipse-unselected,
      .region-hitbox:focus-visible .region-ellipse-unselected,
      .region-hitbox:active .region-ellipse-unselected {
        animation: regionCyanPulse 1.1s ease-in-out infinite;
      }
      @keyframes regionCyanPulse {
        0%, 100% { filter: drop-shadow(0 0 0px rgba(93,208,232,0)); stroke-opacity: 0.35; }
        50% { filter: drop-shadow(0 0 9px rgba(93,208,232,0.65)); stroke-opacity: 0.8; }
      }
      .region-ellipse-selected {
        stroke: #7DE3F0;
        stroke-width: 0.7px;
        stroke-opacity: 0.85;
        fill-opacity: 0.75;
        animation: regionSelectedGlow 1.6s ease-in-out infinite;
      }
      @keyframes regionSelectedGlow {
        0%, 100% { filter: drop-shadow(0 0 0px rgba(125,227,240,0)); }
        50% { filter: drop-shadow(0 0 8px rgba(125,227,240,0.8)); }
      }
      @media (prefers-reduced-motion: reduce) {
        .region-ellipse-unselected, .region-ellipse-selected { transition: none; }
        .region-hitbox:hover .region-ellipse-unselected,
        .region-hitbox:active .region-ellipse-unselected,
        .region-ellipse-selected { animation: none; }
      }

      /* 地図：初回操作誘導ツールチップ（勢力タップで即座に破棄／枠内右上のⓘで手動再表示）。
         右上端にコンパクトに配置し、地図中央〜上部の空間を最大限開放する */
      .map-tip-pill {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 3px 8px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 600;
        color: #9db2d6;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        opacity: 0;
        transform: translateY(4px);
        transition: opacity 0.35s ease, transform 0.35s ease;
        white-space: nowrap;
        pointer-events: none;
      }
      .map-tip-pill.map-tip-visible {
        opacity: 1;
        transform: translateY(0);
      }
      @media (prefers-reduced-motion: reduce) {
        .map-tip-pill { transition: none; }
      }

      /* 問題一覧ドロワー：フルスクリーンのオーバーレイ。薄い固定ヘッダー／独立スクロールするリスト／最下部固定CTAの3段構成 */
      .list-drawer-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(10,14,22,0.6);
        backdrop-filter: blur(2px);
        z-index: 50;
        transition: opacity 0.3s ease;
      }
      .list-drawer {
        position: fixed;
        left: 0; right: 0; bottom: 0; top: 4vh;
        z-index: 51;
        max-width: 640px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        border-radius: 24px 24px 0 0;
        background: #1B2430;
        border: 1px solid rgba(255,255,255,0.1);
        border-bottom: none;
        box-shadow: 0 -8px 40px rgba(0,0,0,0.45);
        overscroll-behavior: contain;
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .filter-bar-card {
        border: 1px solid rgba(255,255,255,0.12);
        background: linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.14);
        transition: border-color 0.25s ease, box-shadow 0.25s ease;
      }
      .filter-bar-card:hover, .filter-bar-card:focus-within {
        border-color: rgba(56,189,248,0.45);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 0 16px rgba(14,165,233,0.28);
      }

      /* 初期化（破壊的操作）：通常時は控えめなミューテッドレッド、押した瞬間だけ赤くグラス発光する */
      .reset-link-btn {
        color: rgba(248,113,113,0.8);
        border: 1px solid transparent;
        background: transparent;
        transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .reset-link-btn:hover, .reset-link-btn:focus-visible {
        color: #F87171;
        background: rgba(239,68,68,0.15);
        border-color: rgba(239,68,68,0.35);
        box-shadow: 0 0 12px rgba(239,68,68,0.4);
      }
      .reset-link-btn:active {
        color: #F87171;
        background: rgba(239,68,68,0.22);
        border-color: rgba(239,68,68,0.5);
        box-shadow: 0 0 14px rgba(239,68,68,0.5);
      }

      /* 展開中は親ピル・子パネルが同一レイヤーであることを示す共有のシアン発光 */
      .filter-bar-linked {
        border-color: rgba(56,189,248,0.55) !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 0 18px rgba(14,165,233,0.32) !important;
      }
      /* パネル側は上端の境界線だけ消し、ビークだけで親ピルへ継ぎ目なく繋がって見えるようにする */
      .filter-bar-card.filter-panel-top-open {
        border-top-color: transparent !important;
      }

      /* カード上部ユーティリティ3点（前へ・進捗・難易度）共通の同規格グラスピル */
      .util-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border-radius: 9999px;
        padding: 6px 14px;
        background: rgba(255,255,255,0.04);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.09);
      }

      /* カード上部ユーティリティ3点：モバイル幅でも重ならないコンパクト統一規格（高さ・角丸・素材を完全統一） */
      .util-pill-mobile {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        height: 44px;
        border-radius: 9999px;
        padding: 4px 12px;
        max-width: 100%;
        background: rgba(255,255,255,0.06);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.14);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
        white-space: nowrap;
      }
      .util-pill-mobile.glass-chip-active {
        background: linear-gradient(135deg, rgba(6,182,212,0.35) 0%, rgba(59,130,246,0.25) 100%);
        border-color: rgba(56,189,248,0.55);
        box-shadow: 0 4px 14px rgba(14,165,233,0.25), inset 0 1px 0.5px rgba(255,255,255,0.5);
      }

      /* 「前の問題」ピル：util-pillをベースに、ホバーでシアン発光しつつ左へ吸い込まれ、タップでわずかに沈む */
      .prev-card-pill {
        color: #DCE4F0;
        transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
      }
      .prev-card-pill:hover {
        background: rgba(6,182,212,0.15);
        border-color: rgba(56,189,248,0.35);
        color: #eafcff;
        transform: translateX(-3px);
      }
      .prev-card-pill.fluid-tap:active {
        transform: scale(0.94);
      }
      .list-toggle-pill.fluid-tap:active {
        transform: scale(0.95);
      }

      /* 文脈穴埋め：スロットバッジ（Liquid Glassのピル型、タップで段階的ヒント開示） */
      .cloze-slot {
        display: inline-flex;
        align-items: baseline;
        gap: 5px;
        margin: 0 2px;
        padding: 1px 10px;
        border-radius: 9999px;
        font-size: 0.9em;
        background: linear-gradient(160deg, rgba(56,189,248,0.22) 0%, rgba(14,165,233,0.12) 100%);
        border: 1px solid rgba(14,165,233,0.4);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 0 0 8px rgba(56,189,248,0.2);
      }
      .cloze-slot-index {
        font-weight: 800;
        color: #0a4a6e;
      }
      .cloze-slot-body {
        font-weight: 600;
        color: #0f3a52;
        letter-spacing: 0.02em;
      }
      /* 文脈穴埋め：問題文コンテナ全体のラッパー。ツールチップ用の上部余白を確保する */
      .cloze-front-wrap {
        position: relative;
        padding-top: 34px;
      }
      /* カード上部の予約セーフゾーンに常時固定（Y軸は問題文と絶対に重ならない）。X軸のみJSでスロット1に追従 */
      .cloze-tip-top {
        position: absolute;
        top: 4px;
        white-space: nowrap;
        font-size: 10px;
        font-weight: 600;
        color: #1B4B66;
        background: #E3EFF4;
        border: 1px solid #B8D8E5;
        border-radius: 999px;
        padding: 3px 10px;
        box-shadow: 0 3px 8px rgba(184,216,229,0.5);
        pointer-events: none;
        z-index: 5;
        opacity: 0;
        transform: translateY(4px);
        transition: opacity 0.35s ease, transform 0.35s ease, left 0.15s ease;
      }
      /* しっぽ（▼）：スロット1の水平中央を指すようX位置をCSS変数で可変にする */
      .cloze-tip-top::after {
        content: "";
        position: absolute;
        top: 100%;
        left: var(--tail-left, 18px);
        border: 5px solid transparent;
        border-top-color: #E3EFF4;
        filter: drop-shadow(0 1px 0 #B8D8E5);
      }
      .cloze-tip-top.cloze-tip-visible {
        opacity: 1;
        transform: translateY(0);
      }
      /* 文脈穴埋め：裏面の完成語（連番付きで発光ハイライト） */
      .cloze-answer {
        display: inline-flex;
        align-items: baseline;
        margin: 0 2px;
        padding: 0 6px;
        border-radius: 6px;
        font-weight: 700;
        color: #7a4a00;
        background: linear-gradient(160deg, rgba(255,214,120,0.35) 0%, rgba(201,162,39,0.2) 100%);
      }


      /* 全体件数カウンター：シアン発光のグラスカプセル */
      .count-badge {
        background: linear-gradient(135deg, rgba(6,182,212,0.32) 0%, rgba(59,130,246,0.22) 100%);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(56,189,248,0.5);
        box-shadow: 0 0 14px rgba(14,165,233,0.35), inset 0 1px 0.5px rgba(255,255,255,0.4);
      }

      .glass-row {
        background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.09);
        transition: background 0.2s ease, border-color 0.2s ease;
      }
      .glass-row:hover, .glass-row:focus-visible {
        background: linear-gradient(135deg, rgba(6,182,212,0.14) 0%, rgba(59,130,246,0.08) 100%);
        border-color: rgba(56,189,248,0.35);
      }

      /* リスト行のピンポイント選択時：一瞬シアンに発光してから一覧が折りたたまれる */
      @keyframes rowPulse {
        0% { background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%); border-color: rgba(255,255,255,0.09); }
        40% { background: linear-gradient(135deg, rgba(6,182,212,0.4) 0%, rgba(59,130,246,0.28) 100%); border-color: rgba(56,189,248,0.7); box-shadow: 0 0 16px rgba(14,165,233,0.4); }
        100% { background: linear-gradient(135deg, rgba(6,182,212,0.4) 0%, rgba(59,130,246,0.28) 100%); border-color: rgba(56,189,248,0.7); box-shadow: 0 0 16px rgba(14,165,233,0.4); }
      }
      .row-pulse {
        animation: rowPulse 0.4s ease-out forwards;
      }

      /* 現在解いている問題のハイライト：他の非アクティブ行と区別する繊細なシアンアクセント */
      .current-row {
        border-color: rgba(56,189,248,0.5) !important;
        box-shadow: 0 0 10px rgba(14,165,233,0.25), inset 0 0 0 1px rgba(56,189,248,0.15);
        background: linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(59,130,246,0.05) 100%) !important;
      }

      /* デュアルスライダーのつまみ：横長カプセル形（iOS設定のスライダー風）＋控えめな輪郭の本物のガラス質感 */
      .glass-thumb {
        width: 34px; height: 20px;
        border-radius: 999px;
        background: linear-gradient(150deg, rgba(255,255,255,0.32) 0%, rgba(210,236,253,0.22) 45%, rgba(56,189,248,0.24) 100%);
        backdrop-filter: blur(6px) saturate(180%);
        -webkit-backdrop-filter: blur(6px) saturate(180%);
        border: 1px solid rgba(255,255,255,0.2);
        box-shadow: 0 4px 14px rgba(14,165,233,0.35), 0 1px 3px rgba(0,0,0,0.3), inset 0 1px 1.5px rgba(255,255,255,0.3), inset 0 -3px 5px rgba(56,189,248,0.25);
      }
      .glass-thumb:focus-visible {
        outline: 2px solid #7dd8ec;
        outline-offset: 3px;
      }
      .glass-thumb-gold {
        width: 34px; height: 20px;
        border-radius: 999px;
        background: linear-gradient(150deg, rgba(255,255,255,0.32) 0%, rgba(245,232,190,0.26) 45%, rgba(201,162,39,0.32) 100%);
        backdrop-filter: blur(6px) saturate(180%);
        -webkit-backdrop-filter: blur(6px) saturate(180%);
        border: 1px solid rgba(255,255,255,0.22);
        box-shadow: 0 4px 14px rgba(201,162,39,0.35), 0 1px 3px rgba(0,0,0,0.3), inset 0 1px 1.5px rgba(255,255,255,0.3), inset 0 -3px 5px rgba(201,162,39,0.28);
      }
      .glass-thumb-gold:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(56,189,248,0.35), 0 0 12px rgba(56,189,248,0.45);
      }

      /* 拡大ポップアップ内の年号テキスト切り替え：チカつき防止のための軽いクロスフェード */
      @keyframes popupTextIn {
        from { opacity: 0; transform: translateY(3px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .popup-text-anim {
        animation: popupTextIn 0.15s ease-out;
      }
      @media (prefers-reduced-motion: reduce) {
        .popup-text-anim { animation: none !important; }
      }

      /* セグメントコントロールのピル：タップ切り替え時の、水滴が着地するような柔らかい弾み */
      @keyframes segmentPillBounce {
        0%   { transform: scale(1, 1); }
        40%  { transform: scale(1.1, 0.92); }
        70%  { transform: scale(0.97, 1.03); }
        100% { transform: scale(1, 1); }
      }
      .segment-pill-bounce {
        animation: segmentPillBounce 0.4s cubic-bezier(0.34, 1.2, 0.64, 1) both;
      }
      @media (prefers-reduced-motion: reduce) {
        .segment-pill-bounce { animation: none !important; }
      }

      /* タップジャンプ時：控えめな着地バウンス（縦の跳ねは最小限、横のスクイーズを軽く） */
      @keyframes pillJump {
        0%   { transform: translateX(-50%) translateY(0px)  scale(1, 1); }
        45%  { transform: translateX(-50%) translateY(-2px) scale(1.17, 0.89); }
        100% { transform: translateX(-50%) translateY(0px)  scale(1, 1); }
      }
      .pill-jump {
        animation: pillJump 0.38s cubic-bezier(0.34, 1.5, 0.64, 1) both;
      }
      @media (prefers-reduced-motion: reduce) {
        .pill-jump { animation: none !important; }
      }

      /* フルード・グラスモーフィズム：プレス時の弾性スクイーズ（水滴のように非対称に伸縮）＋バネ系リリース */
      .fluid-tap {
        position: relative;
        overflow: hidden;
        transition: transform 0.55s cubic-bezier(0.34, 1.8, 0.64, 1), border-radius 0.55s cubic-bezier(0.34, 1.8, 0.64, 1);
        will-change: transform;
      }
      .fluid-tap:hover {
        transform: scale(1.025);
      }
      .fluid-tap:active {
        transform: scale(1.12, 0.76);
        transition: transform 0.09s ease-out, border-radius 0.09s ease-out;
      }

      /* 横幅いっぱいのバー要素向け：同じバネ感だが伸縮量を控えめに（角の欠けを防ぐ） */
      .fluid-tap-wide {
        position: relative;
        overflow: hidden;
        transition: transform 0.55s cubic-bezier(0.34, 1.8, 0.64, 1);
        will-change: transform;
      }
      .fluid-tap-wide:active {
        transform: scale(1.01, 0.94);
        transition: transform 0.09s ease-out;
      }
      .fluid-ripple {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(165,232,248,0.7) 0%, rgba(56,189,248,0.35) 45%, rgba(56,189,248,0) 72%);
        transform: scale(0);
        opacity: 1;
        animation: fluid-ripple-anim 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        pointer-events: none;
      }
      @keyframes fluid-ripple-anim {
        to { transform: scale(1); opacity: 0; }
      }

      @media (prefers-reduced-motion: reduce) {
        .fluid-tap, .fluid-tap:hover, .fluid-tap-wide, .glass-thumb {
          transition: none !important;
        }
        .fluid-tap:active, .fluid-tap-wide:active { transform: none; }
        .fluid-ripple { display: none; }
      }
    `}</style>
  );
}

function Header({ view, setView, favCount }) {
  return (
    <header className="pt-10 pb-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2" style={{ color: "#C9A227" }}>
            <span className="text-xs tracking-[0.3em] font-body">SEKAISHI ACTIVE RECALL — PROTOTYPE</span>
          </div>
          <h1 className="font-display text-3xl mt-1" style={{ color: "#EFE3C8" }}>史脈 <span style={{ color: "#8C2F2F" }}>・</span> 三十年戦争</h1>
          <p className="font-body text-sm mt-1" style={{ color: "#8A93A6" }}>覚えるのではなく、思い出す。</p>
        </div>
      </div>

      <div className="flex gap-1.5 mt-5 font-body text-xs">
        <NavTab active={view === "study"} onClick={() => setView("study")} icon={<BookOpen size={14} />} label="学習" />
        <NavTab active={view === "map"} onClick={() => setView("map")} icon={<MapIcon size={14} />} label="地図" />
        <NavTab active={view === "favorites"} onClick={() => setView("favorites")} icon={<Heart size={14} />} label={`お気に入り (${favCount})`} />
      </div>
    </header>
  );
}

function NavTab({ active, onClick, icon, label }) {
  return (
    <button
      onClick={(e) => { spawnRipple(e); onClick(); }}
      className={`fluid-tap flex items-center gap-1.5 rounded-full px-3 py-1.5 ${active ? "glass-chip-active font-medium" : "glass-chip"}`}
      style={{ color: active ? "#f0f9ff" : "#c7d3ea" }}
    >
      {icon}{label}
    </button>
  );
}


function StarRow({ difficulty, size = 12 }) {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} fill={i <= difficulty ? "#D9BE6B" : "none"} stroke={i <= difficulty ? "#D9BE6B" : "#4A5468"} />
      ))}
    </div>
  );
}

// 件数変化を滑らかにロールさせるカウントアップフック
function useCountUp(target, duration = 420) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  useEffect(() => {
    const start = prevRef.current;
    const diff = target - start;
    if (diff === 0) return;
    const t0 = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + diff * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prevRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]); // eslint-disable-line
  return display;
}

// 全体件数を一目で伝えるための、シアン発光のグラスカプセル・カウンター
function CountBadge({ count, label = "問", compact = false }) {
  const display = useCountUp(count);
  return (
    <span className={`count-badge inline-flex items-baseline gap-1 rounded-full ${compact ? "px-1.5 py-0.5" : "px-3 py-1"}`}>
      <span className="font-display font-bold" style={{ fontSize: compact ? 11 : 16, color: "#eafcff", lineHeight: 1 }}>{display}</span>
      {label && <span className="font-body" style={{ fontSize: compact ? 8 : 10, color: "#bfe3f5" }}>{label}</span>}
    </span>
  );
}

// 一覧系UIで使う、難易度を示すタグ（丸数字バッジは問題番号と誤読されやすいため廃止／色分け・テキストは省き星の数だけで表現）
function DiffTag({ difficulty }) {
  return <StarRow difficulty={difficulty} size={13} />;
}

function FilterPanel(props) {
  const {
    open, onClose, onApply, onOpenTrigger, appliedCount, allThemes, allRegions, allEras,
    selectedThemes, selectedRegions, selectedEras,
    modeFilter, setModeFilter, searchQuery, setSearchQuery,
    diffMin, diffMax, favOnly, setDiffMin, setDiffMax, setFavOnly,
    toggleTheme, toggleRegion, toggleEra, onReset, resultCount,
    presets, activePresetId, onSavePreset, onApplyPreset, onDeletePreset,
    confirmingReset, setConfirmingReset, onResetAllData,
  } = props;

  const [savingName, setSavingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [dragDelta, setDragDelta] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartY = useRef(0);
  const bodyRef = useRef(null);

  const confirmSave = () => {
    onSavePreset(nameDraft);
    setNameDraft("");
    setSavingName(false);
  };

  const startDrag = (e) => {
    dragStartY.current = e.touches ? e.touches[0].clientY : e.clientY;
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setDragDelta(Math.max(0, clientY - dragStartY.current));
    };
    const onUp = () => {
      setDragging(false);
      setDragDelta((delta) => {
        if (delta > 90) onClose(); // 下にクイッ：閉じる（不十分ならバネで復帰）
        return 0;
      });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging]); // eslint-disable-line

  // シート表示中は背後の学習画面のスクロールをロックする
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  return (
    <>
      {/* トリガーピル：常設。タップでシートが下からせり上がる */}
      <div className="mb-6">
        <button
          onClick={(e) => { spawnRipple(e); onOpenTrigger(); }}
          className="fluid-tap-wide filter-bar-card w-full flex items-center justify-between px-5 cursor-pointer font-body text-sm rounded-full"
          style={{ color: "#EFE3C8", minHeight: 46 }}
        >
          <span className="flex items-center gap-2">
            <Filter size={15} style={{ color: "#C9A227" }} />
            出題範囲を絞り込む
          </span>
          <span className="flex items-center gap-1.5">
            <span style={{ color: "#9db2d6", fontSize: 11 }}>該当</span>
            <CountBadge count={appliedCount} label="問" compact />
          </span>
        </button>
      </div>

      {/* バックドロップ */}
      <div
        className="filter-sheet-backdrop"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        onClick={onClose}
      />

      {/* ボトムシート本体：ヘッダー固定／ボディはシート内だけスクロール／フッター固定 */}
      <div
        className="filter-sheet"
        style={{
          height: "93vh",
          transform: open ? `translateY(${dragDelta}px)` : "translateY(100%)",
          transition: dragging ? "none" : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: open ? "auto" : "none",
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* ヘッダー（固定） */}
        <div className="shrink-0">
          <div
            onMouseDown={startDrag}
            onTouchStart={startDrag}
            style={{ touchAction: "none", cursor: "grab" }}
          >
            <div className="flex justify-center pt-2.5 pb-1">
              <div style={{ width: 40, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.25)" }} />
            </div>
            <div className="flex items-center justify-between px-5 pt-1 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-display text-base" style={{ color: "#EFE3C8" }}>出題範囲の設定</span>
                <CountBadge count={resultCount} label="問" compact />
              </div>
              <button onClick={onClose} aria-label="変更を破棄して閉じる" className="fluid-tap rounded-full p-1.5" style={{ background: "rgba(255,255,255,0.06)" }}>
                <X size={16} style={{ color: "#c7d3ea" }} />
              </button>
            </div>
          </div>

          {/* プリセット：レベル1（メタ・全体プリセット）としてヘッダー直下に配置 */}
          <div className="px-5 pb-3 space-y-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.14)" }}>
            <div className="flex justify-between items-center text-xs">
              <span style={{ color: "#9db2d6" }}>マイ保存プリセット</span>
              <div className="flex items-center gap-3">
                <button onClick={onReset} className="reset-link-btn font-body flex items-center gap-1 text-[11px] rounded-full px-2 py-1">
                  <RefreshCw size={11} /> 初期化
                </button>
                <button onClick={() => setSavingName(!savingName)} className="font-body flex items-center gap-1 text-[11px] font-medium" style={{ color: "#5fd0e8" }}>
                  <BookMarked size={12} /> 現在の条件で保存
                </button>
              </div>
            </div>
            {savingName && (
              <div className="flex gap-2">
                <div className="glass-chip flex-1 rounded-full px-3 py-1.5 overflow-hidden" style={{ height: 30 }}>
                  <input
                    autoFocus
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && confirmSave()}
                    placeholder="プリセット名（例：中世ヨーロッパ_フランク王国隆盛）"
                    className="font-body w-full bg-transparent outline-none"
                    style={{
                      color: "#f0f9ff",
                      fontSize: 16, // iOSの自動ズームは実サイズ16px未満で発生するため、実際のサイズは16pxを維持
                      transform: "scale(0.75)",
                      transformOrigin: "left center",
                      width: "133.33%",
                    }}
                  />
                </div>
                <button
                  onClick={(e) => { spawnRipple(e); confirmSave(); }}
                  className="font-body fluid-tap glass-chip-active rounded-full px-3 py-1.5 text-xs shrink-0"
                  style={{ color: "#FFFFFF", fontWeight: 400 }}
                >
                  保存
                </button>
              </div>
            )}
            {presets.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                {presets.map((p) => (
                  <div key={p.id} className="flex items-center shrink-0">
                    <button
                      onClick={(e) => { spawnRipple(e); onApplyPreset(p); }}
                      className={`font-body fluid-tap px-3 py-1.5 rounded-full whitespace-nowrap ${activePresetId === p.id ? "glass-chip-active font-medium" : "glass-chip"}`}
                      style={{ color: activePresetId === p.id ? "#f0f9ff" : "#c7d3ea" }}
                    >
                      {p.name}
                    </button>
                    <button onClick={() => onDeletePreset(p.id)} aria-label="プリセットを削除" className="ml-0.5 opacity-60 hover:opacity-100">
                      <X size={12} style={{ color: "#9db2d6" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ボディ（シート内だけ独立してスクロール） */}
        <div
          ref={bodyRef}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-5 font-body text-sm"
        >
          {/* レベル2：学習形式・母集団（前提条件） */}
          <ModeSegmentedControl value={modeFilter} onChange={setModeFilter} />

          <FavoritesOnlyToggle value={favOnly} onChange={setFavOnly} />

          {/* レベル3：フリーワード抽出（即時バイパス） */}
          <SearchInput value={searchQuery} onChange={setSearchQuery} resultCount={resultCount} />

          {/* レベル4：コンテンツ個別条件（詳細絞り込み） */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-display" style={{ color: "#9db2d6" }}>難易度レンジ</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: "#7dd8ec", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
                ⭐️{diffMin} 〜 ⭐️{diffMax}
              </span>
            </div>
            <DualRangeSlider
              min={0} max={5}
              lo={diffMin} hi={diffMax}
              onChangeLo={(v) => setDiffMin(Math.min(v, diffMax))}
              onChangeHi={(v) => setDiffMax(Math.max(v, diffMin))}
            />
            <div className="flex justify-between text-[10px] mt-1" style={{ color: "#8fa0c2" }}>
              <span>⭐️0 基礎</span><span>⭐️2 標準</span><span>⭐️4 難関</span><span>⭐️5 論述</span>
            </div>
          </div>

          <FilterGroup label="時代区分">
            {allEras.map((e) => (
              <GlassChip key={e} active={selectedEras.has(e)} onClick={() => toggleEra(e)}>{e}</GlassChip>
            ))}
          </FilterGroup>

          <FilterGroup label="横断テーマ">
            {allThemes.map((t) => (
              <GlassChip key={t} active={selectedThemes.has(t)} onClick={() => toggleTheme(t)} icon><Tag size={11} />{t}</GlassChip>
            ))}
          </FilterGroup>

          <FilterGroup label="地域">
            {allRegions.map((r) => (
              <GlassChip key={r} active={selectedRegions.has(r)} onClick={() => toggleRegion(r)}>{r}</GlassChip>
            ))}
          </FilterGroup>

          {/* 危険操作は誤タップ防止のため、ボトムシートの最深部（スクロールしないと出てこない位置）に隔離する */}
          <div className="pt-2 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {confirmingReset ? (
              <div className="inline-flex flex-wrap items-center justify-center gap-2 font-body text-xs pt-3">
                <span style={{ color: "#C7CDD9" }}>本当にお気に入り・学習履歴・プリセットをすべて削除しますか？</span>
                <button
                  onClick={(e) => { spawnRipple(e); onResetAllData(); setConfirmingReset(false); }}
                  className="fluid-tap glass-danger-btn rounded-full px-3.5 py-1.5"
                >
                  削除する
                </button>
                <button
                  onClick={(e) => { spawnRipple(e); setConfirmingReset(false); }}
                  className="fluid-tap glass-ghost-btn rounded-full px-3.5 py-1.5"
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingReset(true)}
                className="safety-reset-pill font-body text-xs flex items-center gap-1.5 mx-auto rounded-full px-3.5 py-1.5 mt-3"
              >
                <RotateCcw size={12} />
                学習履歴・お気に入りをすべてリセット
              </button>
            )}
          </div>
        </div>

        {/* レベル5：確定アクション（Sticky Footer） */}
        <div className="shrink-0 px-5 pt-3 pb-5" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={(e) => { if (resultCount > 0) { spawnRipple(e); onApply(); } }}
            disabled={resultCount === 0}
            className="glass-action-btn fluid-tap w-full rounded-full py-3.5 font-body text-sm"
            style={{ opacity: resultCount === 0 ? 0.4 : 1, pointerEvents: resultCount === 0 ? "none" : "auto" }}
          >
            {resultCount === 0 ? "該当する問題がありません（0問）" : `この条件で学習を開始する（該当: ${resultCount}問）`}
          </button>
        </div>
      </div>
    </>
  );
}

function FavoritesOnlyToggle({ value, onChange }) {
  return (
    <div>
      <div className="text-xs font-display mb-1.5" style={{ color: "#9db2d6" }}>出題対象</div>
      <DraggableSegmented
        options={[
          { value: false, label: "すべて" },
          { value: true, label: "お気に入りのみ", icon: <Heart size={11} fill={value ? "#f0f9ff" : "none"} /> },
        ]}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-display" style={{ color: "#9db2d6" }}>{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function GlassChip({ active, onClick, children, icon }) {
  return (
    <button
      onClick={(e) => { spawnRipple(e); onClick(); }}
      className={`fluid-tap font-display px-3.5 py-1.5 rounded-full text-xs transition-colors flex items-center gap-1.5 ${active ? "glass-chip-active font-medium" : "glass-chip"}`}
      style={{ color: active ? "#f0f9ff" : "#c7d3ea" }}
    >
      {icon && <Tag size={11} style={{ color: active ? "#7dd8ec" : "#8fa0c2" }} />}
      {children}
    </button>
  );
}

function DualRangeSlider({ min, max, lo, hi, onChangeLo, onChangeHi }) {
  const trackRef = useRef(null);
  const [rawLo, setRawLo] = useState(lo);
  const [rawHi, setRawHi] = useState(hi);
  const [drag, setDrag] = useState(null); // 'lo' | 'hi' | null
  const [stretch, setStretch] = useState({ lo: 1, hi: 1 });
  const lastX = useRef(null);
  const rawRef = useRef({ lo, hi });
  rawRef.current = { lo: rawLo, hi: rawHi };

  useEffect(() => { if (drag !== "lo") setRawLo(lo); }, [lo]); // eslint-disable-line
  useEffect(() => { if (drag !== "hi") setRawHi(hi); }, [hi]); // eslint-disable-line

  const pct = (v) => ((v - min) / (max - min)) * 100;

  const valueFromClientX = (clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return min + ratio * (max - min);
  };

  const startDrag = (which) => (e) => {
    e.preventDefault();
    lastX.current = e.touches ? e.touches[0].clientX : e.clientX;
    setDrag(which);
  };

  useEffect(() => {
    if (!drag) return;

    const onMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const v = valueFromClientX(clientX);
      const dx = lastX.current == null ? 0 : clientX - lastX.current;
      lastX.current = clientX;
      const stretchAmt = Math.min(0.7, Math.abs(dx) * 0.06);
      setStretch((s) => ({ ...s, [drag]: 1 + stretchAmt }));

      if (drag === "lo") {
        const clamped = Math.min(v, rawRef.current.hi);
        setRawLo(clamped);
        const rounded = Math.round(clamped);
        if (rounded !== lo) onChangeLo(rounded);
      } else {
        const clamped = Math.max(v, rawRef.current.lo);
        setRawHi(clamped);
        const rounded = Math.round(clamped);
        if (rounded !== hi) onChangeHi(rounded);
      }
    };

    const onUp = () => {
      const which = drag;
      setDrag(null);
      lastX.current = null;
      setStretch((s) => ({ ...s, [which]: 1 }));
      if (which === "lo") setRawLo(Math.round(rawRef.current.lo));
      else setRawHi(Math.round(rawRef.current.hi));
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [drag, lo, hi]); // eslint-disable-line

  const nudge = (which, delta) => {
    if (which === "lo") {
      const next = Math.min(Math.max(min, lo + delta), hi);
      onChangeLo(next);
    } else {
      const next = Math.max(Math.min(max, hi + delta), lo);
      onChangeHi(next);
    }
  };

  return (
    <div className="relative pt-3 pb-1" style={{ touchAction: "none" }}>
      <div ref={trackRef} className="h-2 w-full rounded-full relative overflow-hidden" style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div
          className="absolute h-full rounded-full"
          style={{
            left: `${pct(rawLo)}%`, right: `${100 - pct(rawHi)}%`,
            background: "linear-gradient(90deg, #38bdf8, #6366f1)",
            boxShadow: "0 0 10px rgba(99,102,241,0.45)",
          }}
        />
      </div>
      <GlassThumb leftPct={pct(rawLo)} stretch={stretch.lo} dragging={drag === "lo"}
        onDown={startDrag("lo")}
        onKeyDown={(e) => { if (e.key === "ArrowLeft") nudge("lo", -1); if (e.key === "ArrowRight") nudge("lo", 1); }} />
      <GlassThumb leftPct={pct(rawHi)} stretch={stretch.hi} dragging={drag === "hi"}
        onDown={startDrag("hi")}
        onKeyDown={(e) => { if (e.key === "ArrowLeft") nudge("hi", -1); if (e.key === "ArrowRight") nudge("hi", 1); }} />
    </div>
  );
}

function GlassThumb({ leftPct, stretch, dragging, onDown, onKeyDown }) {
  const squishY = dragging ? Math.max(0.62, 2 - stretch) : 1;
  return (
    <div
      role="slider"
      tabIndex={0}
      onMouseDown={onDown}
      onTouchStart={onDown}
      onKeyDown={onKeyDown}
      className="glass-thumb"
      style={{
        position: "absolute",
        top: 6,
        left: `${leftPct}%`,
        transform: `translateX(-50%) scale(${stretch}, ${squishY})`,
        transition: dragging
          ? "box-shadow 0.15s ease"
          : "transform 0.6s cubic-bezier(0.34, 1.8, 0.64, 1), left 0.32s cubic-bezier(0.34, 1.8, 0.64, 1), box-shadow 0.25s ease",
        cursor: dragging ? "grabbing" : "grab",
        zIndex: dragging ? 6 : 3,
      }}
    />
  );
}

// カード上部の進捗表示：現在位置はシアン、総数はスレートグレーでトーン分け
function ProgressDifficultyCapsule({ index, total, difficulty }) {
  const displayTotal = useCountUp(total);
  return (
    <div
      className="util-pill-mobile"
      style={{ flexDirection: "column", gap: 2, background: "transparent", border: "none", boxShadow: "none" }}
    >
      <span className="font-display" style={{ fontSize: 11, fontWeight: 600, lineHeight: 1 }}>
        <span className="inline-block overflow-hidden align-bottom" style={{ height: 13 }}>
          <span key={index} className="popup-text-anim inline-block" style={{ color: "#38bdf8", fontWeight: 700 }}>{index + 1}</span>
        </span>
        <span style={{ color: "#f1f5f9" }}> / {displayTotal}問</span>
      </span>
      <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.12)" }} />
      <StarRow difficulty={difficulty} size={10} />
    </div>
  );
}

// 文脈穴埋め：タップごとに段階的ヒントが開示されるスロットバッジ
function ClozeSlot({ slot, onInteract, slotRef }) {
  const [level, setLevel] = useState(0); // 0=初期 → 1=頭文字 → 2=最大1/3開示 → 0=リセット（循環ループ）
  const chars = [...slot.answer];
  const cycle = (e) => {
    e.stopPropagation();
    onInteract();
    setLevel((l) => (l + 1) % 3);
  };

  let body = null;
  if (level === 1) {
    // 1タップ目：頭文字を開示し、残りは下線で文字数感を提供
    body = chars.map((c, i) => (i === 0 ? c : "_")).join(" ");
  } else if (level === 2) {
    // 2タップ目：開示文字数は正解全文字数の最大1/3（四捨五入・最低1文字）まで
    const revealed = Math.max(1, Math.round(chars.length * 0.33));
    body = chars.slice(0, revealed).join(" ") + " " + chars.slice(revealed).map(() => "_").join(" ");
  }

  return (
    <button ref={slotRef} onClick={cycle} className="cloze-slot fluid-tap font-display" aria-label={`スロット${slot.id}のヒントを開く`}>
      <span className="cloze-slot-index">{slot.id}</span>
      {body != null && <span className="cloze-slot-body">{body}</span>}
    </button>
  );
}

function ClozeFront({ cloze, tooltipArmed, onTooltipDismiss }) {
  const [anchor, setAnchor] = useState(null); // { left, tailLeft }
  const wrapRef = useRef(null);
  const slot1Ref = useRef(null);
  const tipRef = useRef(null);
  const parts = cloze.template.split(/(\{\{\d+\}\})/g);
  const firstSlotId = cloze.slots[0]?.id;

  const updateAnchor = useCallback(() => {
    const wrapEl = wrapRef.current;
    const slotEl = slot1Ref.current;
    const tipEl = tipRef.current;
    if (!wrapEl || !slotEl || !tipEl) return;
    const wrapRect = wrapEl.getBoundingClientRect();
    const slotRect = slotEl.getBoundingClientRect();
    const tipWidth = tipEl.offsetWidth || 190;
    const pad = 4; // カード内側でのクランプ余白

    // X軸のみスロット1に追従（しっぽの先端がスロット1の水平中央を指す）。
    // Y軸は問題文の行数・スロット位置に関わらず、常にカード上部の予約セーフゾーンに固定するため、
    // テキストの行間に割り込むことが構造的に発生しない（文字重なりゼロを保証）。
    const slotCenterX = slotRect.left + slotRect.width / 2 - wrapRect.left;
    let left = slotCenterX - tipWidth / 2;
    const maxLeft = Math.max(pad, wrapRect.width - tipWidth - pad);
    left = Math.min(Math.max(left, pad), maxLeft);
    const tailLeft = Math.min(Math.max(slotCenterX - left, 10), tipWidth - 10);

    setAnchor({ left, tailLeft });
  }, []);

  useLayoutEffect(() => {
    updateAnchor();
  }, [updateAnchor, cloze]);

  useEffect(() => {
    window.addEventListener("resize", updateAnchor);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateAnchor) : null;
    if (ro && wrapRef.current) ro.observe(wrapRef.current);
    return () => {
      window.removeEventListener("resize", updateAnchor);
      if (ro) ro.disconnect();
    };
  }, [updateAnchor]);

  return (
    <div className="cloze-front-wrap" ref={wrapRef}>
      {/* ツールチップはカード上部のセーフゾーンに固定（Y軸は問題文へ絶対に重ならない）。X軸としっぽだけがスロット1を追従する */}
      <span
        ref={tipRef}
        className={`cloze-tip-top${tooltipArmed && anchor ? " cloze-tip-visible" : ""}`}
        style={anchor ? { left: anchor.left, "--tail-left": `${anchor.tailLeft}px` } : { left: 4 }}
        aria-hidden="true"
      >
        💡 タップして段階的にヒントを得る
      </span>
      <p className="font-display text-lg leading-relaxed" style={{ color: "#2A2118" }}>
        {parts.map((part, i) => {
          const m = part.match(/\{\{(\d+)\}\}/);
          if (m) {
            const slot = cloze.slots.find((s) => String(s.id) === m[1]);
            return (
              <ClozeSlot
                key={i}
                slot={slot}
                slotRef={slot.id === firstSlotId ? slot1Ref : undefined}
                onInteract={onTooltipDismiss}
              />
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
    </div>
  );
}


function ClozeBack({ cloze }) {
  const parts = cloze.template.split(/(\{\{\d+\}\})/g);
  return (
    <div>
      <p className="font-body text-base leading-relaxed" style={{ color: "#2A2118" }}>
        {parts.map((part, i) => {
          const m = part.match(/\{\{(\d+)\}\}/);
          if (m) {
            const slot = cloze.slots.find((s) => String(s.id) === m[1]);
            return (
              <span key={i} className="cloze-answer">
                <sup style={{ fontSize: 9, marginRight: 1 }}>{slot.id}</sup>{slot.answer}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
      <div className="mt-3 space-y-1.5">
        {cloze.points.map((p, i) => (
          <div key={i} className="flex gap-2 text-xs">
            <span className="font-display shrink-0" style={{ color: "#8C2F2F", fontWeight: 700, minWidth: 32 }}>{p.label}</span>
            <span style={{ color: "#5C4E33" }}>{p.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudyStage({
  card, index, total, onPrev, listOpen, setListOpen, filteredCards, onSelectCard, onStartWithOrder,
  tooltipArmed, onTooltipDismiss,
  flipped, setFlipped, showAnecdote, setShowAnecdote,
  isFavorite, onToggleFavorite, onGrade, boxIntervals, currentBox,
}) {
  const [sortKey, setSortKey] = useState("difficulty"); // どちらのピッカーが実際に効いているか
  const [yearDir, setYearDir] = useState("asc");
  const [diffDir, setDiffDir] = useState("asc");
  const [showSyncToast, setShowSyncToast] = useState(false);
  const [pulseId, setPulseId] = useState(null);
  const toastTimer = useRef(null);
  const pulseTimer = useRef(null);

  const shownCards = useMemo(() => {
    const dir = sortKey === "year" ? yearDir : diffDir;
    return [...filteredCards].sort((a, b) => {
      const diff = sortKey === "year" ? a.year - b.year : a.difficulty - b.difficulty;
      return dir === "asc" ? diff : -diff;
    });
  }, [filteredCards, sortKey, yearDir, diffDir]);

  const handleStart = (e) => {
    spawnRipple(e);
    onStartWithOrder(shownCards.map((c) => c.id), null);
    setShowSyncToast(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setShowSyncToast(false), 2000);
  };

  const handleSelect = (e, i) => {
    spawnRipple(e);
    setPulseId(shownCards[i].id);
    clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => {
      onSelectCard(shownCards.map((c) => c.id), i, null);
    }, 140);
  };

  useEffect(() => () => { clearTimeout(toastTimer.current); clearTimeout(pulseTimer.current); }, []);

  useEffect(() => {
    if (listOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [listOpen]);

  // 一覧ドロワー：フィルタのボトムシートと同じ「ハンドルバーを下にスワイプで閉じる」ジェスチャー
  const [listDragDelta, setListDragDelta] = useState(0);
  const [listDragging, setListDragging] = useState(false);
  const listDragStartY = useRef(0);

  const startListDrag = (e) => {
    listDragStartY.current = e.touches ? e.touches[0].clientY : e.clientY;
    setListDragging(true);
  };

  useEffect(() => {
    if (!listDragging) return;
    const onMove = (e) => {
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setListDragDelta(Math.max(0, clientY - listDragStartY.current));
    };
    const onUp = () => {
      setListDragging(false);
      setListDragDelta((delta) => {
        if (delta > 90) setListOpen(false);
        return 0;
      });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [listDragging]); // eslint-disable-line

  return (
    <div className="grid-bg rounded-3xl px-4 sm:px-8 pt-10 pb-6" style={{ border: "1px solid #2E3849" }}>
      {/* 常設ヘッダー：前へ／進捗／一覧トグルのみ（一覧が開いている間は、下のドロワーの1段目と入れ替わる） */}
      <div className="grid grid-cols-3 items-center gap-4 mb-6 font-body" style={{ color: "#8A93A6" }}>
        <div className="justify-self-start min-w-0">
          <button
            onClick={onPrev}
            disabled={index === 0}
            className="util-pill-mobile prev-card-pill fluid-tap"
            style={{ opacity: index === 0 ? 0.4 : 1, pointerEvents: index === 0 ? "none" : "auto", padding: "4px 18px" }}
            aria-label="前の問題に戻る"
          >
            <ChevronLeft size={13} strokeWidth={2.5} style={{ flexShrink: 0 }} />
            <span className="font-body truncate" style={{ fontSize: 11, fontWeight: 600, color: "#f1f5f9" }}>前の問題へ</span>
          </button>
        </div>
        <div className="justify-self-center min-w-0">
          <ProgressDifficultyCapsule index={index} total={total} difficulty={card.difficulty} />
        </div>
        <div className="justify-self-end min-w-0">
          <button
            onClick={(e) => { spawnRipple(e); setListOpen(true); }}
            className="list-toggle-pill fluid-tap util-pill-mobile glass-chip"
            style={{ color: "#f1f5f9", flexDirection: "column", gap: 2 }}
          >
            <span style={{ fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              全<CountBadge count={filteredCards.length} label="" compact />問を
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
              一覧を表示する
              <ChevronDown size={10} style={{ flexShrink: 0 }} />
            </span>
          </button>
        </div>
      </div>

      {/* 問題一覧ドロワー：フィルタと同じボトムシート作法（ハンドルバー・スワイプダウンで閉じる）に統一 */}
      <div
        className="list-drawer-backdrop"
        style={{ opacity: listOpen ? 1 : 0, pointerEvents: listOpen ? "auto" : "none" }}
        onClick={() => setListOpen(false)}
      />
      <div
        className="list-drawer"
        style={{
          transform: listOpen ? `translateY(${listDragDelta}px)` : "translateY(100%)",
          transition: listDragging ? "none" : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: listOpen ? "auto" : "none",
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* 薄い固定ヘッダー：ハンドルバー＋元通りの3分割ナビ（前へ／進捗／✕）＋ソート */}
        <div className="shrink-0 px-4 sm:px-6 pt-2 pb-3" onMouseDown={startListDrag} onTouchStart={startListDrag} style={{ touchAction: "none", cursor: "grab" }}>
          <div className="flex justify-center pt-1.5 pb-2">
            <div style={{ width: 40, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.25)" }} />
          </div>
          <div className="grid grid-cols-3 items-center gap-2 pb-3 font-body" style={{ color: "#8A93A6", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="justify-self-start min-w-0">
              <button
                onClick={onPrev}
                disabled={index === 0}
                className="util-pill-mobile prev-card-pill fluid-tap"
                style={{ opacity: index === 0 ? 0.4 : 1, pointerEvents: index === 0 ? "none" : "auto", padding: "4px 14px", height: 34 }}
                aria-label="前の問題に戻る"
              >
                <ChevronLeft size={12} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                <span className="font-body truncate" style={{ fontSize: 10, fontWeight: 600, color: "#f1f5f9" }}>前の問題へ</span>
              </button>
            </div>
            <div className="justify-self-center min-w-0 font-display" style={{ fontSize: 12, color: "#f1f5f9" }}>
              <span style={{ color: "#38bdf8", fontWeight: 700 }}>{index + 1}</span> / {total}問
            </div>
            <div className="justify-self-end min-w-0">
              <button onClick={() => setListOpen(false)} aria-label="一覧を閉じる" className="fluid-tap rounded-full p-1.5" style={{ background: "rgba(255,255,255,0.06)" }}>
                <X size={16} style={{ color: "#c7d3ea" }} />
              </button>
            </div>
          </div>
          {/* ソート行のみ（薄く・コンパクトに）。下のリストとは区切り線を引かず、余白の近接だけで「これはリストの操作コントローラーである」ことを示す */}
          <div className="flex items-center gap-1.5 pt-3">
            <GlassSelect
              active={sortKey === "year"}
              value={yearDir}
              onChange={(v) => { setYearDir(v); setSortKey("year"); }}
              options={YEAR_SORT_OPTIONS}
            />
            <GlassSelect
              active={sortKey === "difficulty"}
              value={diffDir}
              onChange={(v) => { setDiffDir(v); setSortKey("difficulty"); }}
              options={DIFF_SORT_OPTIONS}
            />
          </div>
        </div>

        {/* 独立スクロール領域：ヘッダーとフッターに挟まれた広いリスト表示エリア */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-3 pb-24">
          <CardListView cards={shownCards} onSelectItem={handleSelect} pulseId={pulseId} listOpen={listOpen} currentCardId={card.id} />
        </div>

        {/* 最下部固定フッター：CTAをここへ集約 */}
        <div className="shrink-0 px-4 sm:px-6 pt-3 pb-5 relative" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "#1B2430" }}>
          <button
            onClick={handleStart}
            disabled={shownCards.length === 0}
            className="glass-action-btn fluid-tap w-full rounded-full py-3 font-body text-sm flex items-center justify-center gap-2"
            style={{ opacity: shownCards.length === 0 ? 0.4 : 1, pointerEvents: shownCards.length === 0 ? "none" : "auto" }}
          >
            この並び順で学習を開始 <ChevronRight size={14} />
          </button>
          {showSyncToast && (
            <div className="sync-toast font-body">
              💡 出題範囲と並び順を現在の条件に同期しました
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto" style={{ perspective: "1400px", maxWidth: 460 }}>
        <div
          className="card-flip relative w-full"
          style={{ height: "clamp(360px, 58vh, 500px)", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* 表 */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => { if (!flipped) { setFlipped(true); if (tooltipArmed) onTooltipDismiss(); } }}
            onKeyDown={(e) => { if (!flipped && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setFlipped(true); if (tooltipArmed) onTooltipDismiss(); } }}
            className="card-face torn-edge absolute inset-0 rounded-lg p-6 flex flex-col h-full"
            style={{ background: "#EFE3C8", boxShadow: "0 18px 40px -12px rgba(0,0,0,0.55)", cursor: flipped ? "default" : "pointer" }}
          >
            <div className="flex items-center justify-end shrink-0">
              <FavButton active={isFavorite} onClick={onToggleFavorite} />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto my-3 pr-1">
              {card.image && (
                <img
                  src={card.image.url}
                  alt={card.image.alt}
                  className="w-full h-32 object-cover rounded-md mb-3"
                  style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.25)" }}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}
              {card.cloze ? (
                <ClozeFront cloze={card.cloze} tooltipArmed={tooltipArmed} onTooltipDismiss={onTooltipDismiss} />
              ) : (
                <p className="font-display text-lg leading-relaxed" style={{ color: "#2A2118" }}>{card.front}</p>
              )}
            </div>
            <div className="flex items-center justify-between font-body text-xs shrink-0" style={{ color: "#7A6A4E" }}>
              <span>{card.region} ／ {card.theme.join("・")}</span>
              <span>{DIFF_BAND(card.difficulty)}</span>
            </div>
          </div>

          {/* 裏 */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setFlipped(false)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setFlipped(false); } }}
            className="card-face torn-edge absolute inset-0 rounded-lg p-6 flex flex-col h-full"
            style={{ background: "#F5EFDD", boxShadow: "0 18px 40px -12px rgba(0,0,0,0.55)", transform: "rotateY(180deg)", cursor: "pointer" }}
          >
            <div className="flex items-start justify-between shrink-0">
              <span className="font-body text-xs" style={{ color: "#8C2F2F" }}>解答（タップで問題文に戻る）</span>
              <FavButton active={isFavorite} onClick={onToggleFavorite} />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto my-2 pr-1">
              {card.image && (
                <img
                  src={card.image.url}
                  alt={card.image.alt}
                  className="w-full h-28 object-cover rounded-md mb-3"
                  style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.25)" }}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}
              {card.cloze ? (
                <ClozeBack cloze={card.cloze} />
              ) : (
                <p className="font-body text-base leading-relaxed" style={{ color: "#2A2118" }}>{card.back}</p>
              )}
              {card.image?.credit && (
                <p className="font-body text-[10px] mt-1.5" style={{ color: "#9B8A63" }}>出典：{card.image.credit}</p>
              )}
              {card.anecdote && (
                <div className="mt-3">
                  {showAnecdote ? (
                    <p
                      onClick={(e) => e.stopPropagation()}
                      className="font-body text-xs leading-relaxed rounded-lg px-3 py-2"
                      style={{ background: "#E8DCBE", color: "#5C4E33" }}
                    >
                      <Sparkles size={11} className="inline mr-1 -mt-0.5" />
                      {card.anecdote}
                      {card.anecdoteLink && (
                        <>
                          {" "}
                          <a
                            href={card.anecdoteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="underline"
                            style={{ color: "#8C2F2F" }}
                          >
                            もっと詳しく見る
                          </a>
                        </>
                      )}
                    </p>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowAnecdote(true); }}
                      className="font-body text-xs flex items-center gap-1"
                      style={{ color: "#8C2F2F" }}
                    >
                      <Sparkles size={12} /> 豆知識を見る
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!flipped ? (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => { setFlipped(true); if (tooltipArmed) onTooltipDismiss(); }}
            className="glass-action-btn fluid-tap rounded-full px-8 py-2.5 font-body text-sm flex items-center gap-2"
          >
            <RotateCw size={14} /> カードをタップして解答を確認
          </button>
        </div>
      ) : (
        <GradeAndAdvance
          boxIntervals={boxIntervals}
          currentBox={currentBox}
          onGrade={onGrade}
        />
      )}
    </div>
  );
}

function GradeAndAdvance({ onGrade }) {
  const [exiting, setExiting] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);

  const grades = [
    { key: "again", sub: "今日中", tint: "amber", icon: RotateCcw },
    { key: "hard", sub: "明日", tint: "slate", icon: ArrowRight },
    { key: "good", sub: "3日後", tint: "cyan", icon: Check },
    { key: "easy", sub: "7日後", tint: "teal", icon: Sparkles },
  ];

  const handleSelect = (e, key) => {
    spawnRipple(e);
    setSelectedKey(key);
    setExiting(true);
    setTimeout(() => {
      onGrade(key);
      setExiting(false);
      setSelectedKey(null);
    }, 240);
  };

  return (
    <div
      className="mt-8"
      style={{
        transform: exiting ? "translateX(-40px)" : "translateX(0)",
        opacity: exiting ? 0 : 1,
        transition: exiting ? "transform 0.24s ease-in, opacity 0.24s ease-in" : "transform 0.24s ease-out, opacity 0.24s ease-out",
      }}
    >
      {/* 目的の言語化：脳（記憶定着）のアイコンで視線を誘導。末尾に矢印は付けない（これ自体はタップ対象ではないため） */}
      <p className="font-body text-xs text-center mb-2 flex items-center justify-center gap-1.5" style={{ color: "#9db2d6" }}>
        <span style={{ fontSize: 13, lineHeight: 1 }}>🧠</span>
        次回復習日を選んで次へ進む
      </p>

      {/* 復習日ボタン（4段階）：待機時はニュートラルなトーンに、アイコン＋文字色で定着度を直感化。タップした瞬間だけシアンに発光し、記録＋次の問題へ即座に遷移 */}
      <div className="grid grid-cols-4 gap-2">
        {grades.map((g) => (
          <GradeChip key={g.key} sub={g.sub} tint={g.tint} icon={g.icon} selected={selectedKey === g.key} onClick={(e) => handleSelect(e, g.key)} />
        ))}
      </div>
    </div>
  );
}

const GRADE_TINTS = {
  // 待機時は全ボタン共通のニュートラルな背景をベースに、枠線・アイコン・サブ文字色に段階的な色相遷移をつける（案A）
  amber: { border: "rgba(245,158,11,0.42)", accent: "#F59E0B" },  // 今日中：Warm Amber（要復習）
  slate: { border: "rgba(165,196,212,0.35)", accent: "#A5C4D4" }, // 明日：Muted Slate Blue（前向きな保留）
  cyan: { border: "rgba(103,232,249,0.4)", accent: "#67E8F9" },   // 3日後：Pale Cyan（標準的な合格）
  teal: { border: "rgba(45,212,191,0.42)", accent: "#2DD4BF" },   // 7日後：Mint Teal（完全定着）
};

function GradeChip({ sub, tint, icon: Icon, selected, onClick }) {
  const t = GRADE_TINTS[tint];
  return (
    <button
      onClick={onClick}
      className="fluid-tap font-body py-4 px-1 flex flex-col items-center justify-center gap-1 text-sm"
      style={{
        background: selected
          ? "linear-gradient(160deg, rgba(56,189,248,0.55) 0%, rgba(14,165,233,0.42) 100%)"
          : "linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: `1px solid ${selected ? "rgba(125,216,236,0.9)" : t.border}`,
        boxShadow: selected ? "0 0 20px rgba(56,189,248,0.55)" : "none",
        color: "#F1F5F9",
        minHeight: 64,
        borderRadius: 20,
        transform: selected ? "scale(0.96)" : "scale(1)",
        transition: "background 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease, transform 0.12s ease",
      }}
    >
      <Icon size={15} style={{ color: selected ? "#eafcff" : t.accent, flexShrink: 0 }} />
      <span style={{ fontWeight: 700, color: selected ? "#eafcff" : t.accent }}>{sub}</span>
    </button>
  );
}

function FavButton({ active, onClick }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} aria-label="お気に入り登録">
      <Heart size={20} fill={active ? "#8C2F2F" : "none"} stroke={active ? "#8C2F2F" : "#9B8A63"} />
    </button>
  );
}

function SessionEnd({ total, reviewed, onRestart, onOpenFilter, empty, searchQuery, onClearSearch }) {
  return (
    <div className="rounded-3xl px-8 py-14 text-center" style={{ border: "1px solid #2E3849", background: "#202A3A" }}>
      {empty ? (
        searchQuery ? (
          <>
            <p className="font-display text-lg" style={{ color: "#EFE3C8" }}>該当する問題が見つかりませんでした</p>
            <p className="font-body text-sm mt-2" style={{ color: "#8A93A6" }}>別の単語でお試しください。</p>
            <button onClick={onClearSearch} className="mt-6 font-body text-sm rounded-full px-5 py-2" style={{ background: "#C9A227", color: "#1B2430" }}>
              検索をリセット
            </button>
          </>
        ) : (
          <>
            <p className="font-display text-lg" style={{ color: "#EFE3C8" }}>条件に合うカードがありません</p>
            <p className="font-body text-sm mt-2" style={{ color: "#8A93A6" }}>フィルタの範囲を広げてみてください。</p>
            <button onClick={onOpenFilter} className="mt-6 font-body text-sm rounded-full px-5 py-2" style={{ background: "#C9A227", color: "#1B2430" }}>
              フィルタを開く
            </button>
          </>
        )
      ) : (
        <>
          <Check size={28} style={{ color: "#C9A227", margin: "0 auto" }} />
          <p className="font-display text-lg mt-3" style={{ color: "#EFE3C8" }}>このセッションは完了です</p>
          <p className="font-body text-sm mt-2" style={{ color: "#8A93A6" }}>{reviewed} / {total} 枚を復習しました</p>
          <button onClick={onRestart} className="mt-6 font-body text-sm rounded-full px-5 py-2 flex items-center gap-2 mx-auto" style={{ background: "#C9A227", color: "#1B2430" }}>
            <RefreshCw size={14} /> もう一度学習する
          </button>
        </>
      )}
    </div>
  );
}

const GLASS_SELECT_ITEM_H = 34;

const MODE_SEGMENTS = ["文脈穴埋め", "一問一答", "両方とも"];

// 汎用セグメントコントロール：タップに加え、アクティブなピルを掴んでドラッグ→指を離した位置に最も近い選択肢へスナップ（不十分な移動はバネで元へ復帰）
function DraggableSegmented({ options, value, onChange }) {
  const [bouncing, setBouncing] = useState(false);
  const [pressed, setPressed] = useState(false);
  const prevIdxRef = useRef(null);
  const n = options.length;
  const idx = Math.max(0, options.findIndex((o) => o.value === value));

  // タップで選択が切り替わった時、水滴が着地するような柔らかい弾みを発生させる
  useEffect(() => {
    if (prevIdxRef.current === null) { prevIdxRef.current = idx; return; }
    if (prevIdxRef.current !== idx) {
      setBouncing(true);
      const t = setTimeout(() => setBouncing(false), 420);
      prevIdxRef.current = idx;
      return () => clearTimeout(t);
    }
    prevIdxRef.current = idx;
  }, [idx]);

  return (
    <div
      className="relative flex rounded-full p-1"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <div
        className={`absolute top-1 bottom-1 rounded-full${bouncing ? " segment-pill-bounce" : ""}`}
        style={{
          left: `calc(${idx} * 100% / ${n} + 4px)`,
          width: `calc(100% / ${n} - 8px)`,
          background: "linear-gradient(135deg, rgba(6,182,212,0.48) 0%, rgba(59,130,246,0.36) 100%)",
          border: "1px solid rgba(56,189,248,0.65)",
          boxShadow: pressed ? "0 1px 4px rgba(14,165,233,0.3)" : "0 2px 12px rgba(14,165,233,0.4)",
          transform: bouncing ? undefined : `scale(${pressed ? 0.96 : 1}, 1)`,
          transformOrigin: "center",
          transition: "left 0.4s cubic-bezier(0.34, 1.4, 0.64, 1), transform 0.25s ease, box-shadow 0.2s ease",
          zIndex: 15,
        }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onMouseLeave={() => setPressed(false)}
          onTouchStart={() => setPressed(true)}
          onTouchEnd={() => setPressed(false)}
          onClick={(e) => { spawnRipple(e); onChange(o.value); }}
          className="relative z-10 flex-1 fluid-tap rounded-full py-2 font-body text-xs flex items-center justify-center gap-1"
          style={{ color: value === o.value ? "#f0f9ff" : "#c7d3ea", fontWeight: value === o.value ? 600 : 400 }}
        >
          {o.icon}{o.label}
        </button>
      ))}
    </div>
  );
}

// 出題モード：1トラックの中に排他選択を収めるセグメントコントロール。0個選択状態が発生しないことを構造的に保証する
function ModeSegmentedControl({ value, onChange }) {
  return (
    <div>
      <div className="text-xs font-display mb-1.5" style={{ color: "#9db2d6" }}>出題モード</div>
      <DraggableSegmented
        options={MODE_SEGMENTS.map((m) => ({ value: m, label: m }))}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

// フリーワード検索：トグル群とは明確に異なる「入力フィールド」としてのシグニファイア
function SearchInput({ value, onChange, resultCount }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div className="text-xs font-display mb-1.5" style={{ color: "#9db2d6" }}>絞り込みたい任意の条件ワードを検索</div>
      <div
        className="flex items-center gap-2 rounded-full px-3.5 py-2.5"
        style={{
          background: "#141a26",
          border: `1px solid ${focused ? "rgba(56,189,248,0.7)" : "rgba(150,200,225,0.28)"}`,
          boxShadow: focused ? "0 0 0 3px rgba(56,189,248,0.18), 0 0 14px rgba(56,189,248,0.3)" : "none",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        <Search size={14} style={{ color: "#7dd8ec", flexShrink: 0 }} />
        <div className="flex-1 overflow-hidden" style={{ height: 18 }}>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="用語・概念・地域などで問題を検索..."
            className="font-body w-full bg-transparent outline-none"
            style={{
              color: "#f0f9ff",
              fontSize: 16, // iOSの自動ズームは実サイズ16px未満で発生するため、実際のサイズは16pxを維持
              transform: "scale(0.75)",
              transformOrigin: "left center",
              width: "133.33%",
            }}
          />
        </div>
        {value && (
          <button onClick={() => onChange("")} aria-label="検索をクリア" className="shrink-0">
            <X size={14} style={{ color: "#7a8699" }} />
          </button>
        )}
      </div>
      {value.trim() && (
        <p className="font-body text-[11px] mt-1.5" style={{ color: "#7dd8ec" }}>該当: {resultCount}件</p>
      )}
    </div>
  );
}

function GlassSelect({ value, onChange, options, active = false }) {
  const [open, setOpen] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);
  const ref = useRef(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    const onDocDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  useEffect(() => { if (!open) setHoverIndex(null); }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { spawnRipple(e); setOpen(!open); }}
        className={`fluid-tap flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-body whitespace-nowrap ${active ? "glass-chip-active font-medium" : "glass-chip"}`}
        style={{ color: active ? "#f0f9ff" : "#c7d3ea" }}
      >
        {current?.label}
      </button>
      {open && (
        <div
          className="absolute left-1/2 mt-2 z-20 rounded-2xl overflow-hidden glass-filter-body py-1"
          style={{ border: "1px solid rgba(255,255,255,0.14)", minWidth: 150, maxWidth: "min(220px, 78vw)", transform: "translateX(-50%)" }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <div className="relative">
            {/* 水滴レンズ：単一の永続要素がホバー位置へバネで吸着移動する */}
            <div
              className="absolute left-1 right-1 rounded-full pointer-events-none liquid-lens"
              style={{
                top: hoverIndex != null ? hoverIndex * GLASS_SELECT_ITEM_H + 2 : 0,
                height: GLASS_SELECT_ITEM_H - 4,
                opacity: hoverIndex != null ? 1 : 0,
                transition: "top 0.32s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.15s ease",
              }}
            />
            {options.map((opt, i) => (
              <button
                key={opt.value}
                onMouseEnter={() => setHoverIndex(i)}
                onClick={(e) => { spawnRipple(e); onChange(opt.value); setOpen(false); }}
                className="fluid-tap-wide relative w-full text-left px-3.5 text-xs font-body flex items-center"
                style={{ height: GLASS_SELECT_ITEM_H }}
              >
                <span
                  style={{
                    color: hoverIndex === i ? "#38bdf8" : opt.value === value ? "#7dd8ec" : "#c7d3ea",
                    transform: hoverIndex === i ? "scale(1.04)" : "scale(1)",
                    transformOrigin: "left center",
                    transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease",
                    display: "inline-block",
                  }}
                >
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const YEAR_SORT_OPTIONS = [
  { value: "asc", label: "年代：昇順 ↑" },
  { value: "desc", label: "年代：降順 ↓" },
];
const DIFF_SORT_OPTIONS = [
  { value: "asc", label: "難易度：昇順 ↑" },
  { value: "desc", label: "難易度：降順 ↓" },
];

function CardListView({ cards, onSelectItem, pulseId, listOpen, currentCardId }) {
  return (
    <>
      {cards.length === 0 ? (
        <p className="font-body text-sm" style={{ color: "#8A93A6" }}>該当するカードがありません。</p>
      ) : (
        <ul className="space-y-2">
          {cards.map((c, i) => {
            const isCurrent = c.id === currentCardId;
            return (
              <li key={c.id} className={`stagger-item${listOpen ? " stagger-in" : ""}`} style={{ animationDelay: `${Math.min(i, 10) * 16}ms` }}>
                <button
                  onClick={(e) => onSelectItem(e, i)}
                  className={`glass-row fluid-tap-wide w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left${pulseId === c.id ? " row-pulse" : ""}${isCurrent ? " current-row" : ""}`}
                >
                  <span
                    className="font-display shrink-0"
                    style={{
                      color: isCurrent ? "#5fd0e8" : "#EFE3C8",
                      fontSize: 11, fontWeight: 700, minWidth: 18,
                      opacity: isCurrent ? 1 : 0.75,
                      textShadow: isCurrent ? "0 0 8px rgba(56,189,248,0.7)" : "none",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <DiffTag difficulty={c.difficulty} />
                  <div className="flex-1 min-w-0">
                    <div className="font-body text-sm truncate" style={{ color: "#EFE3C8" }}>{c.front}</div>
                    <div className="font-body text-xs mt-0.5 truncate" style={{ color: "#8A93A6" }}>{c.year}年ごろ ／ {c.region} ／ {c.theme.join("・")}</div>
                  </div>
                  <ChevronRight size={16} style={{ color: "#6B7688" }} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function FavoritesView({ favorites, onJump, onToggleFavorite, onStartAll }) {
  const favCards = CARDS.filter((c) => favorites.includes(c.id));
  return (
    <div style={{ paddingBottom: favCards.length > 0 ? 96 : 0 }}>
      <h2 className="font-display text-lg mb-4 px-1" style={{ color: "#EFE3C8" }}>お気に入り一覧</h2>
      {favCards.length === 0 ? (
        <p className="font-body text-sm px-1" style={{ color: "#8A93A6" }}>まだお気に入り登録したカードはありません。学習画面のハートマークから登録できます。</p>
      ) : (
        <ul className="space-y-2">
          {favCards.map((c, i) => (
            <li key={c.id} className="relative">
              {/* カード全体がタップ対象（右端の›はナビゲーションのシグニファイア） */}
              <button
                onClick={() => onJump(c.id)}
                className="glass-row fluid-tap-wide w-full flex items-center gap-3 rounded-xl pl-3 pr-12 py-3 text-left"
              >
                <span className="font-display shrink-0" style={{ color: "#EFE3C8", fontSize: 11, fontWeight: 700, minWidth: 18, opacity: 0.75 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <DiffTag difficulty={c.difficulty} />
                <div className="flex-1 min-w-0">
                  <div className="font-body text-sm truncate" style={{ color: "#EFE3C8" }}>{c.front}</div>
                  <div className="font-body text-xs mt-0.5 truncate" style={{ color: "#8A93A6" }}>{c.region} ／ {c.theme.join("・")}</div>
                </div>
                <ChevronRight size={16} style={{ color: "#6B7688", flexShrink: 0 }} />
              </button>
              {/* お気に入りトグルは›から切り離し、カード右上に独立配置（44×44相当のタップ余白を確保） */}
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(c.id); }}
                aria-label="お気に入り解除"
                className="absolute flex items-center justify-center"
                style={{ top: 0, right: 0, width: 44, height: 44 }}
              >
                <Heart size={16} fill="#8C2F2F" stroke="#8C2F2F" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 最下部固定CTA：お気に入りだけを母集団に一括学習開始 */}
      {favCards.length > 0 && (
        <div className="fixed left-0 right-0 bottom-0 px-4 pb-5 pt-3 z-40" style={{ background: "linear-gradient(180deg, rgba(27,36,48,0) 0%, #1B2430 30%)" }}>
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => onStartAll(favCards.map((c) => c.id))}
              className="glass-action-btn fluid-tap w-full rounded-full py-3.5 font-body text-sm flex items-center justify-center gap-2"
            >
              お気に入り（{favCards.length}問）の学習を開始 <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase 2 プロトタイプ：時代別世界地図ビジュアライザー
// ※ 実際の史料に基づく正確な国境データではなく、操作コンセプト検証用の簡略化した模式図
// ---------------------------------------------------------------------------



// 勢力ラベルのタイポグラフィ最適化：ポリゴン/パスの座標文字列から実際のバウンディングボックス（幅・高さ）を
// 動的に計算し、その面積に応じてフォントサイズとLOD（ズーム連動の表示要否）を決定する
function getShapeBBox(shapeStr) {
  const nums = (shapeStr.match(/-?\d+\.?\d*/g) || []).map(Number);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = nums[i], y = nums[i + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { width: maxX - minX, height: maxY - minY };
}

// 面積の大きさ4段階（特大・中・小・極小）に応じたフォントサイズと、ラベルが出現し始めるズーム倍率（LOD）。
// 現状の5勢力は「主要な学習対象」であるため、極端に小さい勢力（オランダ）以外はデフォルト倍率(1.0x)から常時表示する。
// 将来、都市ラベルなどさらに小さな注記を追加した際に、このLODの仕組みがそのまま活きる設計にしている
// LOD（ズーム連動の表示要否）のみを面積から動的に判定する。フォントサイズは実際にレンダリング検証のうえ
// 各勢力に個別指定（r.labelSize）している。面積だけから自動算出すると、横幅の狭い領域（神聖ローマ帝国など）で
// 文字が領土の外へはみ出す計算ミスが生じたため
function getLabelStyle(area) {
  const tracking = area >= 5000 ? "0.02em" : area >= 2000 ? "0.01em" : "0";
  const minZoom = area < 500 ? 1.25 : 1.0; // 極端に小さい勢力（オランダ）だけ、わずかな拡大でフェードイン表示
  return { minZoom, tracking };
}

function regionStatus(id, year) {
  if (id === "オランダ") {
    return year >= 1648
      ? { label: "独立国家（国際承認済）", disputed: false }
      : { label: "スペイン領ネーデルラント（独立闘争中）", disputed: true };
  }
  if (id === "神聖ローマ帝国") {
    return year >= 1648
      ? { label: "領邦分立が確定的に（皇帝権は形骸化）", disputed: false }
      : { label: "皇帝のもとでの統合を模索中", disputed: false };
  }
  return { label: null, disputed: false };
}

const COVERED_ERA = [1550, 1700]; // 大航海時代・近世のうち実際にコンテンツが存在する範囲

// ============================================================
// 時代区分（ERA_PERIODS）
// 通史全体（紀元前3000年〜現代）を8つの時代区分に分割する。地図タブは`year`から
// アクティブな時代区分を判定し、そのperiodが持つデータ（regions/background/…）だけを描画する。
// 「大航海時代・近世」以外は年代範囲だけを定義したプレースホルダーで、コンテンツは未着手。
// 新しい時代のデータを作る際は、該当periodにregions/background/capitals/rivers/
// seaLabels/blurb/keyYearsを追加し、hasContent: true、contentRangeを設定する。
//   yearRange    … 教科書的な時代区分としての外枠の年代
//   hasContent   … 実際に勢力ポリゴン等のデータが存在するか
//   contentRange … hasContentがtrueの場合、実データが用意されている年代の内側の範囲
//                  （yearRangeより狭くてよい。範囲外は「準備中」表示にする）
// ============================================================
/* GEO_FRAMEWORK_DATA_START:revolutions */
// ============================================================
// AUTO-GENERATED by geo-framework/scripts/build-era.js — 手編集しないこと
// source: eras/revolutions/era.json + 1812.snapshot.json, 1815.snapshot.json, 1871.snapshot.json
// generated: 2026-09-26T07:57:40.538Z
// 再生成: node build-era.js revolutions
// ============================================================

const REVOLUTIONS_PATHS = {
  "fr_empire_1812": "M490.613,197.583C490.186,197.661,489.996,197.047,488.052,198.054C486.108,199.060,480.655,201.865,478.948,203.625C477.241,205.384,478.426,206.967,477.810,208.612C477.194,210.256,474.870,211.739,475.250,213.492C475.629,215.244,479.375,217.063,480.086,219.128C480.797,221.194,479.659,223.935,479.517,225.886C479.375,227.837,478.332,229.535,479.233,230.833C480.133,232.131,482.836,233.033,484.923,233.674C487.009,234.315,490.518,235.086,491.750,234.680C492.983,234.275,491.419,231.814,492.320,231.241C493.220,230.668,495.828,231.105,497.156,231.241C498.484,231.377,499.337,232.259,500.286,232.055C501.234,231.850,502.751,231.956,502.846,230.016C502.941,228.075,500.523,223.164,500.855,220.410C501.186,217.656,504.031,215.683,504.837,213.492C505.644,211.300,505.359,208.376,505.691,207.263C506.023,206.149,506.924,207.879,506.829,206.811C506.734,205.743,505.217,202.395,505.122,200.857C505.027,199.319,506.260,198.523,506.260,197.583C506.260,196.642,506.023,195.214,505.122,195.214C504.221,195.214,501.186,199.207,500.855,197.583C500.523,195.959,503.557,187.240,503.130,185.470C502.704,183.699,499.290,186.465,498.294,186.960C497.298,187.455,497.298,187.786,497.156,188.440C497.014,189.094,497.630,190.074,497.440,190.884C497.251,191.694,496.824,192.420,496.018,193.300C495.212,194.180,493.505,195.451,492.604,196.165C491.703,196.878,490.944,197.346,490.613,197.583C490.281,197.819,491.039,197.504,490.613,197.583Z",
  "rheinbund_1812": "M508.252,190.884C507.777,192.666,507.066,194.735,506.260,196.165C505.454,197.594,504.174,198.369,503.415,199.460C502.656,200.550,501.755,201.631,501.708,202.706C501.661,203.780,502.467,205.146,503.130,205.905C503.794,206.665,505.359,206.071,505.691,207.263C506.023,208.454,504.126,212.014,505.122,213.052C506.118,214.090,509.864,213.272,511.666,213.492C513.467,213.711,514.463,214.441,515.933,214.368C517.403,214.294,519.347,214.161,520.485,213.052C521.623,211.943,522.145,210.057,522.761,207.713C523.377,205.370,524.800,200.602,524.183,198.992C523.567,197.382,519.489,199.243,519.063,198.054C518.636,196.864,521.101,194.285,521.623,191.854C522.145,189.422,522.856,184.948,522.192,183.466C521.528,181.984,518.968,183.299,517.640,182.962C516.312,182.625,515.649,181.025,514.226,181.443C512.803,181.861,510.101,183.896,509.105,185.470C508.109,187.043,508.726,189.101,508.252,190.884Z",
  "prussia_1812": "M519.063,185.470C519.063,187.294,520.106,189.350,520.485,191.369C520.864,193.388,520.390,196.234,521.338,197.583C522.287,198.931,524.183,199.460,526.175,199.460C528.166,199.460,531.628,198.690,533.288,197.583C534.947,196.476,534.473,194.590,536.133,192.819C537.792,191.049,541.822,189.026,543.245,186.960C544.668,184.894,545.189,181.770,544.668,180.425C544.146,179.079,542.486,178.972,540.115,178.887C537.745,178.802,533.098,179.487,530.442,179.913C527.787,180.339,525.843,181.358,524.183,181.443C522.524,181.529,521.339,179.753,520.485,180.425C519.631,181.096,519.063,183.646,519.063,185.470Z",
  "austria_1812": "M518.209,213.492C518.683,215.041,519.631,215.385,521.054,216.110C522.476,216.835,524.705,217.123,526.744,217.840C528.783,218.556,531.012,220.053,533.288,220.410C535.563,220.768,538.266,221.357,540.400,219.984C542.534,218.611,544.905,214.821,546.090,212.171C547.275,209.521,549.646,206.514,547.513,204.083C545.379,201.651,537.176,198.431,533.288,197.583C529.399,196.734,526.697,197.454,524.183,198.992C521.670,200.530,519.205,204.394,518.209,206.811C517.213,209.228,517.735,211.942,518.209,213.492Z",
  "warsaw_1812": "M525.606,192.819C525.938,193.613,526.317,196.789,527.597,197.583C528.878,198.377,530.205,195.151,533.288,197.583C536.370,200.014,543.008,213.369,546.090,212.171C549.172,210.973,551.306,195.519,551.780,190.397C552.254,185.276,550.120,183.105,548.935,181.443C547.750,179.781,545.616,179.505,544.668,180.425C543.719,181.344,544.668,185.055,543.245,186.960C541.822,188.865,538.029,191.689,536.133,191.854C534.236,192.018,533.714,188.846,531.865,187.948C530.016,187.050,526.080,185.653,525.037,186.464C523.994,187.276,525.511,191.760,525.606,192.819C525.701,193.878,525.274,192.025,525.606,192.819Z",
  "fr_kingdom_1815": "M490.613,197.583C489.854,197.505,489.996,197.047,488.052,198.054C486.108,199.060,480.655,201.865,478.948,203.625C477.241,205.384,478.426,206.967,477.810,208.612C477.194,210.256,474.870,211.739,475.250,213.492C475.629,215.244,479.375,217.063,480.086,219.128C480.797,221.194,479.659,223.935,479.517,225.886C479.375,227.837,478.332,229.535,479.233,230.833C480.133,232.131,482.836,233.033,484.923,233.674C487.009,234.315,490.518,235.086,491.750,234.680C492.983,234.275,491.419,231.814,492.320,231.241C493.220,230.668,495.828,231.105,497.156,231.241C498.484,231.377,499.337,232.259,500.286,232.055C501.234,231.850,502.751,231.956,502.846,230.016C502.941,228.075,500.523,223.164,500.855,220.410C501.186,217.656,504.031,215.683,504.837,213.492C505.644,211.300,505.359,208.376,505.691,207.263C506.023,206.149,507.256,207.037,506.829,206.811C506.402,206.585,503.984,206.284,503.130,205.905C502.277,205.527,502.087,205.073,501.708,204.540C501.329,204.006,501.139,203.165,500.855,202.706C500.570,202.246,500.854,202.091,500.001,201.783C499.147,201.475,496.966,201.400,495.733,200.857C494.501,200.313,493.457,199.069,492.604,198.523C491.750,197.978,491.371,197.661,490.613,197.583Z",
  "netherlands_1815": "M498.294,186.960C497.298,187.455,497.298,187.786,497.156,188.440C497.014,189.094,497.630,190.074,497.440,190.884C497.251,191.694,496.824,192.420,496.018,193.300C495.212,194.180,493.505,195.451,492.604,196.165C491.703,196.878,490.613,197.190,490.613,197.583C490.613,197.976,491.893,197.669,492.604,198.523C493.315,199.377,494.074,201.703,494.880,202.706C495.686,203.709,496.540,204.234,497.440,204.540C498.341,204.845,499.669,204.999,500.286,204.540C500.902,204.080,501.044,202.943,501.139,201.783C501.234,200.624,500.997,198.997,500.855,197.583C500.712,196.169,499.764,195.153,500.286,193.300C500.807,191.447,503.510,187.770,503.984,186.464C504.458,185.159,504.079,185.387,503.130,185.470C502.182,185.552,499.290,186.465,498.294,186.960Z",
  "german_confed_1815": "M508.252,190.884C507.777,192.666,507.066,194.735,506.260,196.165C505.454,197.594,504.174,198.369,503.415,199.460C502.656,200.550,501.755,201.631,501.708,202.706C501.661,203.780,502.467,205.146,503.130,205.905C503.794,206.665,505.359,206.071,505.691,207.263C506.023,208.454,504.126,212.014,505.122,213.052C506.118,214.090,509.864,213.272,511.666,213.492C513.467,213.711,514.463,214.441,515.933,214.368C517.403,214.294,519.347,214.161,520.485,213.052C521.623,211.943,522.145,210.057,522.761,207.713C523.377,205.370,524.800,200.602,524.183,198.992C523.567,197.382,519.489,199.243,519.063,198.054C518.636,196.864,521.101,194.285,521.623,191.854C522.145,189.422,522.856,184.948,522.192,183.466C521.528,181.984,518.968,183.299,517.640,182.962C516.312,182.625,515.649,181.025,514.226,181.443C512.803,181.861,510.101,183.896,509.105,185.470C508.109,187.043,508.726,189.101,508.252,190.884Z",
  "prussia_1815": "M500.570,199.460C500.617,200.629,500.380,202.012,500.855,202.706C501.329,203.400,502.704,203.933,503.415,203.625C504.126,203.316,504.648,201.864,505.122,200.857C505.596,199.850,506.260,198.523,506.260,197.583C506.260,196.642,505.691,195.609,505.122,195.214C504.553,194.819,503.605,195.135,502.846,195.214C502.087,195.293,500.949,194.982,500.570,195.690C500.191,196.397,500.523,198.290,500.570,199.460Z M519.063,185.470C519.063,187.294,520.106,189.350,520.485,191.369C520.864,193.388,520.390,196.234,521.338,197.583C522.287,198.931,524.183,199.460,526.175,199.460C528.166,199.460,530.917,198.690,533.288,197.583C535.658,196.476,537.792,194.261,540.400,192.819C543.008,191.377,547.655,191.339,548.935,188.931C550.215,186.523,549.551,180.046,548.082,178.372C546.612,176.698,543.055,178.630,540.115,178.887C537.176,179.144,533.098,179.487,530.442,179.913C527.787,180.339,525.843,181.358,524.183,181.443C522.524,181.529,521.339,179.753,520.485,180.425C519.631,181.096,519.063,183.646,519.063,185.470Z",
  "austria_1815": "M520.485,213.052C520.201,215.304,515.743,213.570,515.933,214.368C516.123,215.166,520.532,216.620,521.623,217.840C522.714,219.059,521.007,220.693,522.476,221.685C523.946,222.678,527.929,223.513,530.442,223.795C532.956,224.076,534.710,223.235,537.555,223.374C540.400,223.514,544.193,224.845,547.513,224.634C550.832,224.423,555.526,224.481,557.470,222.109C559.414,219.736,560.600,213.555,559.177,210.398C557.755,207.241,553.250,205.302,548.935,203.166C544.620,201.030,537.413,198.278,533.288,197.583C529.162,196.887,526.791,198.446,524.183,198.992C521.576,199.537,518.256,198.513,517.640,200.857C517.024,203.200,520.769,210.800,520.485,213.052Z M508.536,219.984C508.536,220.551,508.726,221.687,509.105,222.531C509.484,223.376,509.816,224.562,510.812,225.052C511.808,225.542,513.799,225.609,515.080,225.469C516.360,225.330,517.830,224.704,518.494,224.215C519.157,223.725,518.494,223.308,519.063,222.531C519.631,221.755,522.145,220.338,521.908,219.557C521.670,218.775,519.063,217.983,517.640,217.840C516.217,217.697,514.795,218.485,513.372,218.700C511.950,218.914,509.911,218.914,509.105,219.128C508.299,219.343,508.536,219.417,508.536,219.984Z",
  "russia_poland_1815": "M527.597,197.583C529.826,199.000,535.184,200.697,538.977,201.320C542.771,201.943,548.224,202.737,550.357,201.320C552.491,199.903,552.017,196.132,551.780,192.819C551.543,189.506,550.832,183.509,548.935,181.443C547.038,179.378,543.245,180.425,540.400,180.425C537.555,180.425,534.426,180.437,531.865,181.443C529.304,182.450,526.080,184.568,525.037,186.464C523.994,188.360,525.179,190.966,525.606,192.819C526.033,194.672,525.369,196.166,527.597,197.583Z",
  "germany_1871": "M508.252,190.884C507.777,192.666,507.066,194.735,506.260,196.165C505.454,197.594,504.174,198.369,503.415,199.460C502.656,200.550,501.755,201.631,501.708,202.706C501.661,203.780,502.609,205.296,503.130,205.905C503.652,206.514,504.790,205.833,504.837,206.359C504.885,206.884,503.368,207.944,503.415,209.060C503.462,210.175,503.747,212.314,505.122,213.052C506.497,213.791,509.864,213.272,511.666,213.492C513.467,213.711,514.463,214.441,515.933,214.368C517.403,214.294,519.347,214.161,520.485,213.052C521.623,211.943,522.145,210.057,522.761,207.713C523.377,205.370,523.615,200.367,524.183,198.992C524.752,197.616,524.658,199.694,526.175,199.460C527.692,199.225,531.628,198.690,533.288,197.583C534.947,196.476,534.473,194.590,536.133,192.819C537.792,191.049,541.822,189.026,543.245,186.960C544.668,184.894,545.189,181.770,544.668,180.425C544.146,179.079,542.486,178.972,540.115,178.887C537.745,178.802,533.430,179.150,530.442,179.913C527.455,180.676,524.326,182.958,522.192,183.466C520.058,183.974,518.968,183.299,517.640,182.962C516.312,182.625,515.649,181.025,514.226,181.443C512.803,181.861,510.101,183.896,509.105,185.470C508.109,187.043,508.726,189.101,508.252,190.884Z",
  "austria_hungary_1871": "M520.485,213.052C520.201,215.304,515.743,213.570,515.933,214.368C516.123,215.166,520.532,216.620,521.623,217.840C522.714,219.059,521.007,220.693,522.476,221.685C523.946,222.678,527.929,223.513,530.442,223.795C532.956,224.076,534.710,223.235,537.555,223.374C540.400,223.514,544.193,224.845,547.513,224.634C550.832,224.423,555.526,224.481,557.470,222.109C559.414,219.736,560.600,213.555,559.177,210.398C557.755,207.241,553.250,205.302,548.935,203.166C544.620,201.030,537.413,198.278,533.288,197.583C529.162,196.887,526.791,198.446,524.183,198.992C521.576,199.537,518.256,198.513,517.640,200.857C517.024,203.200,520.769,210.800,520.485,213.052Z",
  "italy_1871": "M505.122,226.718C505.027,227.549,503.889,227.827,504.837,228.784C505.786,229.741,510.480,230.649,510.812,232.460C511.144,234.272,507.398,238.259,506.829,239.655C506.260,241.051,506.023,240.703,507.398,240.834C508.773,240.966,512.709,239.344,515.080,240.442C517.450,241.540,521.007,245.561,521.623,247.421C522.239,249.280,519.157,250.776,518.778,251.597C518.399,252.419,518.067,251.975,519.347,252.350C520.627,252.725,524.990,253.974,526.460,253.849C527.929,253.724,527.455,252.035,528.167,251.597C528.878,251.159,530.632,252.623,530.727,251.220C530.822,249.817,529.684,245.834,528.736,243.178C527.787,240.522,526.697,238.026,525.037,235.283C523.377,232.539,519.110,228.984,518.778,226.718C518.446,224.452,522.476,222.879,523.045,221.685C523.614,220.492,523.093,220.269,522.192,219.557C521.291,218.844,519.110,217.767,517.640,217.409C516.170,217.051,514.795,217.265,513.372,217.409C511.950,217.552,509.864,217.841,509.105,218.270C508.346,218.699,509.437,219.063,508.820,219.984C508.204,220.905,506.023,222.673,505.406,223.795C504.790,224.917,505.217,225.886,505.122,226.718Z",
  "france_1871": "M490.613,197.583C489.854,197.505,489.996,197.047,488.052,198.054C486.108,199.060,480.655,201.865,478.948,203.625C477.241,205.384,478.426,206.967,477.810,208.612C477.194,210.256,474.870,211.739,475.250,213.492C475.629,215.244,479.375,217.063,480.086,219.128C480.797,221.194,479.659,223.935,479.517,225.886C479.375,227.837,478.332,229.535,479.233,230.833C480.133,232.131,482.836,233.033,484.923,233.674C487.009,234.315,490.518,235.086,491.750,234.680C492.983,234.275,491.419,231.814,492.320,231.241C493.220,230.668,495.828,231.105,497.156,231.241C498.484,231.377,499.337,232.259,500.286,232.055C501.234,231.850,502.751,231.956,502.846,230.016C502.941,228.075,500.523,223.164,500.855,220.410C501.186,217.656,504.411,215.383,504.837,213.492C505.264,211.600,503.415,210.249,503.415,209.060C503.415,207.871,504.885,206.884,504.837,206.359C504.790,205.833,503.652,206.208,503.130,205.905C502.609,205.602,502.087,205.073,501.708,204.540C501.329,204.006,501.139,203.165,500.855,202.706C500.570,202.246,500.854,202.091,500.001,201.783C499.147,201.475,496.966,201.400,495.733,200.857C494.501,200.313,493.457,199.069,492.604,198.523C491.750,197.978,491.371,197.661,490.613,197.583Z",
};

const REVOLUTIONS_REGIONS_1812 = [
  { id: "フランス帝国", fill: "#9AA8D9", strokeColor: "#C7D0EC",
    labelX: 487, labelY: 223, labelLines: ["フランス","帝国"], labelSize: 9,
    shape: "path", dByYear: () => REVOLUTIONS_PATHS["fr_empire_1812"],
    /* bbox（ラベル初期配置の参考値。lint-eraで重なりチェック済みなら削除可）: {"minX":474.87,"minY":183.699,"maxX":506.924,"maxY":235.086,"cx":490.897,"cy":209.3925,"width":32.053999999999974,"height":51.387} */
  },
  { id: "ライン同盟", fill: "#D9A9D0", strokeColor: "#F0D2EA",
    labelX: 512, labelY: 206, labelLines: ["ライン","同盟"], labelSize: 7,
    shape: "path", dByYear: () => REVOLUTIONS_PATHS["rheinbund_1812"],
    /* bbox（ラベル初期配置の参考値。lint-eraで重なりチェック済みなら削除可）: {"minX":501.661,"minY":181.025,"maxX":524.8,"maxY":214.441,"cx":513.2305,"cy":197.733,"width":23.138999999999953,"height":33.416} */
  },
  { id: "プロイセン王国（1812）", fill: "#8FBCC9", strokeColor: "#C3E0E6",
    labelX: 538, labelY: 182, labelLines: ["プロイセン","王国"], labelSize: 6,
    shape: "path", dByYear: () => REVOLUTIONS_PATHS["prussia_1812"],
    /* bbox（ラベル初期配置の参考値。lint-eraで重なりチェック済みなら削除可）: {"minX":519.063,"minY":178.802,"maxX":545.189,"maxY":199.46,"cx":532.126,"cy":189.131,"width":26.125999999999976,"height":20.658000000000015} */
  },
  { id: "オーストリア帝国（1812）", fill: "#E0C56B", strokeColor: "#F0E2A8",
    labelX: 536, labelY: 217, labelLines: ["オーストリア","帝国"], labelSize: 6,
    shape: "path", dByYear: () => REVOLUTIONS_PATHS["austria_1812"],
    /* bbox（ラベル初期配置の参考値。lint-eraで重なりチェック済みなら削除可）: {"minX":517.213,"minY":196.734,"maxX":549.646,"maxY":221.357,"cx":533.4295,"cy":209.0455,"width":32.43299999999999,"height":24.62299999999999} */
  },
  { id: "ワルシャワ大公国", fill: "#C98E82", strokeColor: "#EAC0B9",
    labelX: 551, labelY: 198, labelLines: ["ワルシャワ","大公国"], labelSize: 5,
    shape: "path", dByYear: () => REVOLUTIONS_PATHS["warsaw_1812"],
    /* bbox（ラベル初期配置の参考値。lint-eraで重なりチェック済みなら削除可）: {"minX":523.994,"minY":179.505,"maxX":552.254,"maxY":213.369,"cx":538.124,"cy":196.437,"width":28.25999999999999,"height":33.864000000000004} */
  },
];

const REVOLUTIONS_REGIONS_1815 = [
  { id: "フランス王国", fill: "#9AA8D9", strokeColor: "#C7D0EC",
    labelX: 488, labelY: 226, labelLines: ["フランス","王国"], labelSize: 9,
    shape: "path", dByYear: () => REVOLUTIONS_PATHS["fr_kingdom_1815"],
    /* bbox（ラベル初期配置の参考値。lint-eraで重なりチェック済みなら削除可）: {"minX":474.87,"minY":197.047,"maxX":507.256,"maxY":235.086,"cx":491.063,"cy":216.06650000000002,"width":32.38599999999997,"height":38.039000000000016} */
  },
  { id: "ネーデルラント連合王国", fill: "#7ECBD6", strokeColor: "#B8E5EA",
    labelX: 490, labelY: 203, labelLines: ["ネーデルラント","連合王国"], labelSize: 4.4,
    shape: "path", dByYear: () => REVOLUTIONS_PATHS["netherlands_1815"],
    /* bbox（ラベル初期配置の参考値。lint-eraで重なりチェック済みなら削除可）: {"minX":490.613,"minY":185.159,"maxX":504.458,"maxY":204.999,"cx":497.5355,"cy":195.079,"width":13.845000000000027,"height":19.840000000000003} */
  },
  { id: "ドイツ連邦", fill: "#8FBC9C", strokeColor: "#C3E0CC",
    labelX: 513, labelY: 206, labelLines: ["ドイツ","連邦"], labelSize: 7,
    shape: "path", dByYear: () => REVOLUTIONS_PATHS["german_confed_1815"],
    /* bbox（ラベル初期配置の参考値。lint-eraで重なりチェック済みなら削除可）: {"minX":501.661,"minY":181.025,"maxX":524.8,"maxY":214.441,"cx":513.2305,"cy":197.733,"width":23.138999999999953,"height":33.416} */
  },
  { id: "プロイセン王国", fill: "#8FBCC9", strokeColor: "#C3E0E6",
    labelX: 537, labelY: 178, labelLines: ["プロイセン","王国"], labelSize: 6,
    subLabels: [{"text":"ラインラント","at":[506,201.5],"size":4}],
    shape: "path", dByYear: () => REVOLUTIONS_PATHS["prussia_1815"],
    /* bbox（ラベル初期配置の参考値。lint-eraで重なりチェック済みなら削除可）: {"minX":500.191,"minY":176.698,"maxX":550.215,"maxY":203.933,"cx":525.203,"cy":190.3155,"width":50.02400000000006,"height":27.234999999999985} */
  },
  { id: "オーストリア帝国", fill: "#E0C56B", strokeColor: "#F0E2A8",
    labelX: 552, labelY: 209, labelLines: ["オーストリア","帝国"], labelSize: 6,
    subLabels: [{"text":"ロンバルド＝ヴェネト","at":[515,222.5],"size":4}],
    shape: "path", dByYear: () => REVOLUTIONS_PATHS["austria_1815"],
    /* bbox（ラベル初期配置の参考値。lint-eraで重なりチェック済みなら削除可）: {"minX":508.299,"minY":196.887,"maxX":560.6,"maxY":225.609,"cx":534.4495,"cy":211.248,"width":52.301000000000045,"height":28.72200000000001} */
  },
  { id: "ロシア帝国", fill: "#B79FD1", strokeColor: "#DCCCEC",
    labelX: 529, labelY: 203, labelLines: ["ロシア帝国","（会議王国）"], labelSize: 4.4,
    shape: "path", dByYear: () => REVOLUTIONS_PATHS["russia_poland_1815"],
    /* bbox（ラベル初期配置の参考値。lint-eraで重なりチェック済みなら削除可）: {"minX":523.994,"minY":179.378,"maxX":552.491,"maxY":202.737,"cx":538.2425000000001,"cy":191.0575,"width":28.496999999999957,"height":23.35900000000001} */
  },
];

const REVOLUTIONS_REGIONS_1871 = [
  { id: "ドイツ帝国", fill: "#8FBC9C", strokeColor: "#C3E0CC",
    labelX: 517, labelY: 211, labelLines: ["ドイツ","帝国"], labelSize: 8,
    shape: "path", dByYear: () => REVOLUTIONS_PATHS["germany_1871"],
    /* bbox（ラベル初期配置の参考値。lint-eraで重なりチェック済みなら削除可）: {"minX":501.661,"minY":178.802,"maxX":545.189,"maxY":214.441,"cx":523.425,"cy":196.6215,"width":43.52799999999996,"height":35.63900000000001} */
  },
  { id: "オーストリア＝ハンガリー帝国", fill: "#E0C56B", strokeColor: "#F0E2A8",
    labelX: 550, labelY: 202, labelLines: ["オーストリア","＝ハンガリー"], labelSize: 6,
    shape: "path", dByYear: () => REVOLUTIONS_PATHS["austria_hungary_1871"],
    /* bbox（ラベル初期配置の参考値。lint-eraで重なりチェック済みなら削除可）: {"minX":515.743,"minY":196.887,"maxX":560.6,"maxY":224.845,"cx":538.1715,"cy":210.86599999999999,"width":44.85699999999997,"height":27.958} */
  },
  { id: "イタリア王国", fill: "#D9866B", strokeColor: "#F0B8A8",
    labelX: 512, labelY: 224, labelLines: ["イタリア","王国"], labelSize: 7,
    shape: "path", dByYear: () => REVOLUTIONS_PATHS["italy_1871"],
    /* bbox（ラベル初期配置の参考値。lint-eraで重なりチェック済みなら削除可）: {"minX":503.889,"minY":217.051,"maxX":530.822,"maxY":253.974,"cx":517.3555,"cy":235.5125,"width":26.932999999999993,"height":36.923} */
  },
  { id: "フランス", fill: "#9AA8D9", strokeColor: "#C7D0EC",
    labelX: 487, labelY: 224, labelLines: ["フランス"], labelSize: 9,
    shape: "path", dByYear: () => REVOLUTIONS_PATHS["france_1871"],
    /* bbox（ラベル初期配置の参考値。lint-eraで重なりチェック済みなら削除可）: {"minX":474.87,"minY":197.047,"maxX":505.264,"maxY":235.086,"cx":490.067,"cy":216.06650000000002,"width":30.394000000000005,"height":38.039000000000016} */
  },
];

// 年代からこの時代区分のスナップショットのうち最も近いものを選び、対応する勢力配列を返す
function revolutionsRegionsByYear(year) {
  const snap = [1812,1815,1871].reduce((best, y) => (Math.abs(y - year) < Math.abs(best - year) ? y : best), 1812);
  if (snap === 1812) return REVOLUTIONS_REGIONS_1812;
  if (snap === 1815) return REVOLUTIONS_REGIONS_1815;
  if (snap === 1871) return REVOLUTIONS_REGIONS_1871;
  return REVOLUTIONS_REGIONS_1812;
}

const REVOLUTIONS_CAPITALS = [
  {
    "name": "パリ",
    "x": 490.2,
    "y": 207.5
  },
  {
    "name": "アムステルダム",
    "x": 497.5,
    "y": 191,
    "dir": "tl"
  },
  {
    "name": "ベルリン",
    "x": 521.6,
    "y": 190.3
  },
  {
    "name": "ウィーン",
    "x": 530.1,
    "y": 210.4
  },
  {
    "name": "ワルシャワ",
    "x": 543.3,
    "y": 191.7
  },
  {
    "name": "ローマ",
    "x": 519.1,
    "y": 236.9
  }
];

const REVOLUTIONS_RIVERS = [...RIVERS, ...[
  {
    "name": "ヴィスワ川",
    "points": "536.6,181.2 540.1,188.4 543.3,191.7 540.1,202.0",
    "labelX": 555.3,
    "labelY": 188
  }
]];

const REVOLUTIONS_SEA_LABELS = SEA_LABELS;
const REVOLUTIONS_BACKGROUND = [];

const REVOLUTIONS_BLURB = {
  "フランス帝国": "革命戦争・ナポレオン戦争を通じて西欧の広範な地域を直接併合。1810年にはオランダ王国も帝国に編入された。",
  "ライン同盟": "神聖ローマ帝国解体（1806年）後、フランスの影響下でバイエルンなど西・南ドイツ諸邦が結成した同盟。",
  "プロイセン王国（1812）": "イエナ・アウエルシュタットの戦いでフランスに大敗し、エルベ川以西とポーランド領を喪失した。",
  "オーストリア帝国（1812）": "ナポレオンとの度重なる戦争に敗れ、アドリア海沿岸などを失った。皇女マリー・ルイーズがナポレオンに嫁ぐ。",
  "ワルシャワ大公国": "ティルジット条約でプロイセン領ポーランドから再建されたナポレオンの衛星国。1812年のロシア遠征の拠点となった。",
  "フランス王国": "ナポレオン退位後にルイ18世が即位。国境はおおむね1792年時点まで後退した。",
  "ネーデルラント連合王国": "フランスに対する北方の防波堤として、オランダと旧オーストリア領ネーデルラント（現ベルギー）を統合し王国に格上げ。",
  "ドイツ連邦": "神聖ローマ帝国に代わる緩やかな国家連合。オーストリアが議長国となるが統一国家ではない。",
  "プロイセン王国": "本国から離れたラインラント地方（西）と、ブランデンブルク〜ポーゼン〜東プロイセンの中核部（東）の2つの領域からなる。ウィーン議定書で獲得したラインラントはフランス牽制の防波堤、東部はドイツ統一運動の中心地となっていく。",
  "オーストリア帝国": "ウィーン周辺の中核部と、新たに獲得した北イタリア（ロンバルド＝ヴェネト王国）の2つの領域からなる。ウィーン会議を主催したメッテルニヒのもとで、正統主義・勢力均衡に基づく国際秩序を築いた。",
  "ロシア帝国": "ワルシャワ大公国の大部分がロシア皇帝を国王とする「会議王国ポーランド」としてロシア領に編入された。",
  "ドイツ帝国": "普仏戦争の勝利を経て、ヴェルサイユ宮殿でドイツ帝国の成立が宣言された（小ドイツ主義による統一）。",
  "オーストリア＝ハンガリー帝国": "普墺戦争敗北後、ハンガリーに大幅な自治を認める同君連合（二重帝国）へ移行。北イタリアは既に喪失。",
  "イタリア王国": "サルデーニャ王国を中心とする統一運動（リソルジメント）が、普仏戦争の隙にローマを占領し完成させた。",
  "フランス": "普仏戦争に敗れナポレオン3世が退位。第三共和政が成立し、アルザス・ロレーヌをドイツ帝国に割譲した。",
};

// --- ERA_PERIODS用エントリ（apply-era.jsが自動挿入する。手貼りする場合は下記を使う） ---

/* GEO_FRAMEWORK_DATA_END:revolutions */

const ERA_PERIODS = [
  { id: "ancient-civilizations", label: "古代文明の成立と地域世界", yearRange: [-3000, -500], hasContent: false },
  { id: "ancient-empires", label: "古代帝国の時代", yearRange: [-500, 500], hasContent: false },
  { id: "medieval-1", label: "中世①：イスラームの拡大と欧州再編", yearRange: [500, 1000], hasContent: false },
  { id: "medieval-2", label: "中世②：ユーラシアの再編とモンゴル", yearRange: [1000, 1500], hasContent: false },
  {
    id: "early-modern", label: "大航海時代・近世", yearRange: [1500, 1789],
    hasContent: true, contentRange: COVERED_ERA,
    keyYears: MAP_YEARS, regions: MAP_REGIONS, background: BACKGROUND_TERRITORIES,
    capitals: CAPITAL_CITIES, rivers: RIVERS, seaLabels: SEA_LABELS, blurb: REGION_BLURB,
  },
  {
    id: "revolutions", label: "市民革命と国民国家", yearRange: [1789,1871],
    hasContent: true, contentRange: [1812,1871],
    keyYears: [1812,1815,1871],
    regionsByYear: revolutionsRegionsByYear,
    background: REVOLUTIONS_BACKGROUND, capitals: REVOLUTIONS_CAPITALS, rivers: REVOLUTIONS_RIVERS, seaLabels: REVOLUTIONS_SEA_LABELS,
    blurb: REVOLUTIONS_BLURB,
  },
  { id: "imperialism-wars", label: "帝国主義と二つの大戦", yearRange: [1870, 1945], hasContent: false },
  { id: "cold-war-modern", label: "冷戦と現代世界", yearRange: [1945, 2025], hasContent: false },
];

// 現在の年代に対応する時代区分を返す（範囲外はnull）
function getActiveEraPeriod(year) {
  return ERA_PERIODS.find((p) => year >= p.yearRange[0] && year <= p.yearRange[1]) || null;
}

// 時代区分の境界年号（コンテンツの有無に関わらず、時代の切り替わりをスクラバー上で
// たどれるようにするためのフォールバック。まだデータのない時代でもナビゲーションはできる）
const ERA_BOUNDARY_YEARS = [...new Set(ERA_PERIODS.flatMap((p) => p.yearRange))];

const SCRUB_MIN = -3000; // 紀元前3000年
const SCRUB_MAX = 2025;

// 非線形スケール：情報密度に応じてバー上の割り当て幅を変える（近現代ほど広く取る）
const SCALE_SEGMENTS = [
  { vFrom: -3000, vTo: 1000, pFrom: 0, pTo: 25 },
  { vFrom: 1000, vTo: 1700, pFrom: 25, pTo: 60 },
  { vFrom: 1700, vTo: 2025, pFrom: 60, pTo: 100 },
];
function pctFromValue(v) {
  const clamped = Math.min(SCRUB_MAX, Math.max(SCRUB_MIN, v));
  const seg = SCALE_SEGMENTS.find((s) => clamped <= s.vTo) || SCALE_SEGMENTS[SCALE_SEGMENTS.length - 1];
  const ratio = (clamped - seg.vFrom) / (seg.vTo - seg.vFrom);
  return seg.pFrom + ratio * (seg.pTo - seg.pFrom);
}
function valueFromPct(p) {
  const clamped = Math.min(100, Math.max(0, p));
  const seg = SCALE_SEGMENTS.find((s) => clamped <= s.pTo) || SCALE_SEGMENTS[SCALE_SEGMENTS.length - 1];
  const ratio = (clamped - seg.pFrom) / (seg.pTo - seg.pFrom);
  return seg.vFrom + ratio * (seg.vTo - seg.vFrom);
}

const CHIP_WINDOW_YEARS = 150; // カーソル周辺±この範囲の主要年号だけをチップに動的抽出
const CHIP_MAX = 6;

function formatYear(y) {
  const r = Math.round(y);
  return r < 0 ? `紀元前${Math.abs(r)}年` : `${r}年`;
}

// macOS Dock風：カーソルからの距離に応じたガウス分布スケール
function dockScale(distancePct, sigma = 3.2, maxBoost = 0.75) {
  return 1 + maxBoost * Math.exp(-(distancePct * distancePct) / (2 * sigma * sigma));
}

function EraScrubber({ value, onChange, keyYears }) {
  const wrapRef = useRef(null);
  const [raw, setRaw] = useState(value);
  const [dragging, setDragging] = useState(false);
  const [stretch, setStretch] = useState(1);
  const [hoverPct, setHoverPct] = useState(null); // カーソル位置（%）。null=非ホバー
  const [flashYear, setFlashYear] = useState(null); // タップ直後に発光させる対象
  const [jumping, setJumping] = useState(false); // タップジャンプ時の跳ねるアニメーション
  const lastX = useRef(null);
  const flashTimer = useRef(null);
  const jumpTimer = useRef(null);

  useEffect(() => { if (!dragging) setRaw(value); }, [value]); // eslint-disable-line
  useEffect(() => () => { clearTimeout(flashTimer.current); clearTimeout(jumpTimer.current); }, []);

  const jumpTo = (y) => {
    onChange(y);
    setFlashYear(y);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashYear(null), 550);

    // 跳ねるアニメーションを再トリガーするため、一度クラスを外してから付け直す
    setJumping(false);
    clearTimeout(jumpTimer.current);
    requestAnimationFrame(() => {
      setJumping(true);
      jumpTimer.current = setTimeout(() => setJumping(false), 650);
    });
  };

  const pct = pctFromValue;
  const pctFromClientX = (clientX) => {
    const rect = wrapRef.current.getBoundingClientRect();
    return Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
  };
  const valueFromClientX = (clientX) => valueFromPct(pctFromClientX(clientX));

  const startDrag = (e) => {
    e.preventDefault();
    lastX.current = e.touches ? e.touches[0].clientX : e.clientX;
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const v = valueFromClientX(clientX);
      const dx = lastX.current == null ? 0 : clientX - lastX.current;
      lastX.current = clientX;
      setStretch(1 + Math.min(0.7, Math.abs(dx) * 0.06));
      setRaw(v);
      setHoverPct(pctFromClientX(clientX));
      onChange(Math.round(v));
    };
    const onUp = () => {
      setDragging(false);
      lastX.current = null;
      setStretch(1);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging]); // eslint-disable-line

  const handleHoverMove = (e) => {
    if (dragging) return;
    setHoverPct(pctFromClientX(e.clientX));
  };
  const handleHoverLeave = () => { if (!dragging) setHoverPct(null); };

  const squishY = Math.max(0.62, 2 - stretch);

  // 確定選択状態（ドラッグ確定 or チップタップでのみ更新される raw）だけを基準にする。
  // ホバーだけでは下部チップ・メイン年号は一切変化させない（US: チップへのマウス移動中に選択が動いてしまう問題への対応）
  const nearestKeyYear = keyYears.reduce((best, y) => (Math.abs(y - raw) < Math.abs(best - raw) ? y : best), keyYears[0]);
  const nearbyKeyYears = keyYears
    .filter((y) => Math.abs(y - raw) <= CHIP_WINDOW_YEARS)
    .sort((a, b) => Math.abs(a - raw) - Math.abs(b - raw))
    .slice(0, CHIP_MAX)
    .sort((a, b) => a - b);

  // 目盛りのポップアップも、下部チップと完全に同じ「重要年号データ」を参照する（機械的な固定刻みは廃止）
  const winnerTickY = hoverPct == null ? null : keyYears.reduce((best, y) => {
    const d = Math.abs(pctFromValue(y) - hoverPct);
    const bd = Math.abs(pctFromValue(best) - hoverPct);
    return d < bd ? y : best;
  }, keyYears[0]);

  return (
    <div>
      <div className="text-center leading-none mb-0.5">
        <span className="font-display text-lg" style={{ color: "#EFE3C8" }}>{formatYear(raw)}</span>
      </div>

      {/* ホバー検知はこのゾーン（目盛り＋つまみ）だけに限定する。下部チップは対象外にすることで、
          チップをタップしに行く際に無関係な年号を上部ポップアップが拾ってしまう問題を防ぐ */}
      <div ref={wrapRef} onMouseMove={handleHoverMove} onMouseLeave={handleHoverLeave} className="mb-2">
        {/* 年代目盛り：文字ラベルは持たない微小ドットのみ（複数年号テキストが同一座標で重なり合うのを防止）。
            クリック領域は20×20pxを確保しつつ、視覚的には点のみを表示する */}
        <div className="relative h-6" style={{ touchAction: "none" }}>
          {keyYears.map((y) => {
            const isFlashing = y === flashYear;
            return (
              <button
                key={y}
                onClick={(e) => { e.stopPropagation(); jumpTo(y); }}
                aria-label={`${formatYear(y)}へ移動`}
                className="absolute flex items-end justify-center"
                style={{
                  left: `${pct(y)}%`,
                  bottom: 0,
                  width: 20, height: 20,
                  zIndex: isFlashing ? 5 : 1,
                  transform: "translateX(-50%)",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: isFlashing ? 6 : 3,
                    height: isFlashing ? 6 : 3,
                    marginBottom: 2,
                    borderRadius: "50%",
                    background: isFlashing ? "#eafcff" : "#5c6579",
                    boxShadow: isFlashing ? "0 0 10px rgba(56,189,248,0.9), 0 0 14px rgba(201,162,39,0.75)" : "none",
                    transition: "width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.4s ease-out, box-shadow 0.4s ease-out",
                  }}
                />
              </button>
            );
          })}

          {/* 拡大ポップアップ：常に単一の要素のみを表示し、下部の主要年号チップと同じ「選択中の主要年号（nearestKeyYear）」
              またはホバー中の候補年に追従する。重なり合う複数ラベルは廃止し、この1つだけが常時表示される */}
          <div
            className="absolute font-display"
            style={{
              left: `${pct(hoverPct != null ? winnerTickY : nearestKeyYear)}%`,
              bottom: 3,
              transformOrigin: "bottom center",
              transform: "translateX(-50%) scale(1)",
              transition: "left 0.12s ease-out, transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s ease",
              pointerEvents: "none",
              fontSize: 13,
              fontWeight: 700,
              color: "#EFE3C8",
              whiteSpace: "nowrap",
              zIndex: 3,
            }}
          >
            <span
              key={hoverPct != null ? winnerTickY : nearestKeyYear}
              className="popup-text-anim"
              style={{ display: "inline-block" }}
            >
              {formatYear(hoverPct != null ? winnerTickY : nearestKeyYear)}
            </span>
          </div>
        </div>

        <div className="relative pt-2 pb-2" style={{ touchAction: "none" }}>
          <div className="h-1.5 w-full rounded-full relative overflow-hidden" style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {/* コンテンツが存在する時代区分のガイド表示。ERA_PERIODSの中でhasContent:trueのものを
                自動的にすべて表示するので、新しい時代のデータを追加すれば帯も自動的に増える */}
            {ERA_PERIODS.filter((p) => p.hasContent).map((p) => (
              <div
                key={p.id}
                className="absolute h-full"
                style={{
                  left: `${pct(p.contentRange[0])}%`, right: `${100 - pct(p.contentRange[1])}%`,
                  background: "rgba(201,162,39,0.45)",
                }}
              />
            ))}
          </div>
          <div
            className={`glass-thumb-gold${jumping ? " pill-jump" : ""}`}
            role="slider" tabIndex={0}
            onMouseDown={startDrag}
            onTouchStart={startDrag}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") onChange(Math.max(SCRUB_MIN, value - 10));
              if (e.key === "ArrowRight") onChange(Math.min(SCRUB_MAX, value + 10));
            }}
            style={{
              position: "absolute", top: 1, left: `${pct(raw)}%`,
              transform: jumping ? undefined : `translateX(-50%) scale(${stretch}, ${squishY})`,
              transition: dragging
                ? "box-shadow 0.15s ease"
                : "left 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)",
              cursor: dragging ? "grabbing" : "grab",
            }}
          />
        </div>
      </div>

      {/* 周辺主要年代（歴史的出来事）の連動チップ：カーソル/ドラッグ位置の±150年以内を動的抽出 */}
      <div className="flex gap-1.5 justify-center overflow-x-auto px-1" style={{ scrollbarWidth: "thin" }}>
        {nearbyKeyYears.length === 0 ? (
          <p className="font-body text-[11px]" style={{ color: "#6B7688" }}>この時代に近い主要年号はまだありません</p>
        ) : (
          nearbyKeyYears.map((y) => {
            const active = y === nearestKeyYear;
            return (
              <button
                key={y}
                onClick={(e) => { spawnRipple(e); jumpTo(y); }}
                className="fluid-tap font-display text-xs rounded-full px-3 py-0.5 shrink-0"
                style={active ? {
                  background: "linear-gradient(135deg, rgba(6,182,212,0.35) 0%, rgba(201,162,39,0.35) 100%)",
                  border: "1px solid rgba(201,162,39,0.6)",
                  boxShadow: "0 4px 14px rgba(56,189,248,0.25), 0 4px 14px rgba(201,162,39,0.25)",
                  color: "#F5EFDD",
                  backdropFilter: "blur(10px)",
                } : {
                  background: "transparent", border: "1px solid #3A4356", color: "#8A93A6",
                }}
              >
                {y}年
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// エリア詳細パネル：ハーフ（初期表示）↔ フル（スワイプアップ）↔ クローズ（スワイプダウン）の3状態ボトムシート
// ビューポート接地型：bottom:0に固定したまま「高さ」を可変させる方式（translateYでシート全体を沈めない）。
// これによりHalf展開時でも、フッター（主導線CTA）は常に画面最下部に接地したまま露出し続ける。
const MAP_SHEET_HEIGHT_VH = { half: 56, full: 92 };
const MAP_SHEET_UP_THRESHOLD = -60; // これ以上上にドラッグしたらフル展開
const MAP_SHEET_DOWN_THRESHOLD = 70; // これ以上下にドラッグしたら畳む/閉じる

function RegionDetailSheet({
  region, blurb, year, status, matchedCards, relatedThemes,
  sheetState, setSheetState, onJumpToCard, onStudyTheme, onStudyRegion,
}) {
  const [dragDelta, setDragDelta] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartY = useRef(0);

  const close = () => setSheetState("closed");

  const startDrag = (e) => {
    dragStartY.current = e.touches ? e.touches[0].clientY : e.clientY;
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      // 極端なオーバードラッグでシート高さが破綻しないよう、ドラッグ量をpx単位で軽くクランプする
      setDragDelta(Math.max(-260, Math.min(320, clientY - dragStartY.current)));
    };
    const onUp = () => {
      setDragging(false);
      setDragDelta((delta) => {
        if (delta <= MAP_SHEET_UP_THRESHOLD && sheetState === "half") {
          setSheetState("full"); // スワイプアップ：全画面近くまで展開
        } else if (delta >= MAP_SHEET_DOWN_THRESHOLD) {
          setSheetState(sheetState === "full" ? "half" : "closed"); // スワイプダウン：フル→ハーフ、ハーフ→クローズ
        }
        return 0;
      });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging]); // eslint-disable-line

  if (!region) return null;

  return (
    <>
      {/* ノンモーダル化：暗転・ブラーのバックドロップは撤廃。年代スクラバー・地図はシートを開いたままでも
          常に100%の明るさ・可読性を保ち、背面へのタップ／ドラッグもそのまま貫通する */}

      {/* ボトムシート本体：bottom:0接地のまま「高さ」を可変させる（Half/Fullどちらでもフッターは画面最下部に常駐） */}
      <div
        className="map-sheet"
        style={{
          height: `calc(${MAP_SHEET_HEIGHT_VH[sheetState] ?? MAP_SHEET_HEIGHT_VH.half}vh - ${dragDelta}px)`,
          transform: sheetState === "closed" ? "translateY(100%)" : "translateY(0)",
          transition: dragging ? "none" : "height 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: sheetState === "closed" ? "none" : "auto",
        }}
        role="dialog"
        aria-modal="false"
      >
        {/* ヘッダー（固定・ドラッグハンドル） */}
        <div className="shrink-0">
          <div onMouseDown={startDrag} onTouchStart={startDrag} style={{ touchAction: "none", cursor: "grab" }}>
            <div className="flex justify-center pt-2.5 pb-1">
              <div style={{ width: 40, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.25)" }} />
            </div>
            <div className="flex items-center justify-between px-5 pt-1 pb-3">
              <div className="min-w-0">
                <h3 className="font-display text-lg truncate" style={{ color: "#EFE3C8" }}>{region.id}</h3>
                {status?.label && (
                  <p className="font-body text-xs mt-0.5" style={{ color: "#C9A227" }}>{year}年時点：{status.label}</p>
                )}
              </div>
              <button onClick={close} aria-label="閉じる" className="fluid-tap rounded-full p-1.5 shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
                <X size={16} style={{ color: "#c7d3ea" }} />
              </button>
            </div>
          </div>
        </div>

        {/* ボディ（シート内だけ独立してスクロール）。フッターの主導線CTAに最後のカード/テーマが隠れないよう下部に余白を確保 */}
        <div className="flex-1 overflow-y-auto px-5 py-2 pb-20 space-y-4">
          <p className="font-body text-sm leading-relaxed" style={{ color: "#C7CDD9" }}>{blurb?.[region.id]}</p>

          {matchedCards.length === 0 ? (
            <p className="font-body text-xs rounded-lg px-3 py-2" style={{ background: "#232D3D", color: "#8A93A6" }}>
              このエリアの学習コンテンツは準備中です（今後のコンテンツ拡充フェーズで追加予定）
            </p>
          ) : (
            <>
              <div>
                <div className="font-body text-xs mb-2" style={{ color: "#8A93A6" }}>関連する通史（時系列順）</div>
                <ul className="space-y-1.5">
                  {matchedCards.map((c, i) => (
                    <li key={c.id}>
                      <button
                        onClick={(e) => { spawnRipple(e); onJumpToCard(c.id); }}
                        className="glass-row fluid-tap-wide w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left"
                      >
                        <span
                          className="font-display shrink-0"
                          style={{ color: "#EFE3C8", fontSize: 11, fontWeight: 700, minWidth: 18, opacity: 0.75 }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <DiffTag difficulty={c.difficulty} />
                        <span
                          className="font-body text-xs flex-1 leading-relaxed break-keep"
                          style={{ color: "#EFE3C8", wordBreak: "keep-all", overflowWrap: "anywhere" }}
                        >
                          {c.front}
                        </span>
                        <ChevronRight size={14} style={{ color: "#6B7688" }} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {relatedThemes.length > 0 && (
                <div>
                  <div className="font-body text-xs mb-2" style={{ color: "#8A93A6" }}>関連テーマ</div>
                  <div className="flex flex-wrap gap-2">
                    {relatedThemes.map((t) => (
                      <button
                        key={t}
                        onClick={() => onStudyTheme(t)}
                        className="font-body text-xs rounded-full px-3 py-1.5 flex items-center gap-1"
                        style={{ background: "transparent", border: "1px solid #3A4356", color: "#C7CDD9" }}
                      >
                        <Tag size={11} style={{ color: "#C9A227" }} /> {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* フッター（最下部常時固定・主導線CTA）：設問数に関わらず、シートを開いた瞬間から常に1タップで学習を開始できる */}
        {matchedCards.length > 0 && (
          <div className="shrink-0 px-5 pt-3 pb-5" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <button
              onClick={() => onStudyRegion(region.id)}
              className="glass-action-btn fluid-tap w-full rounded-full py-3.5 font-body text-sm flex items-center justify-center gap-2"
            >
              <BookOpen size={14} /> このエリアの通史をまとめて学習する（{matchedCards.length}問）
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ステップ②〜⑥：ピンチズーム（1.0x〜4.0x）＋ドラッグパン＋慣性スクロール＋水平ワールドラップ。
// 垂直方向はこれまで通りラッパーdivへのCSS transform（translateY + scale）。
// 水平方向は「viewBoxのmin-xを直接動かして0〜VIEWBOX_Wでラップする」方式に変更し、
// 横スワイプで地図をぐるっと一周できる無限ループを実現する（WORLD_LAND_PATHをx=+VIEWBOX_Wの位置にもう1枚重ねて描画することで、
// ラップの継ぎ目でも地図が途切れない）。
const MAP_ZOOM_MIN = 1;
const MAP_ZOOM_MAX = 4;
const VIEWBOX_W = 1024; // 世界地図1周分の幅（viewBox単位）。WORLD_LAND_PATHの投影スケールと一致させている
const VIEWBOX_H = 620;

function useMapPanZoom(containerRef) {
  const [zoom, setZoom] = useState(1);
  const [panY, setPanY] = useState(0); // 垂直方向：CSS transform（screen px）
  const [worldX, setWorldX] = useState(0); // 水平方向：viewBoxのmin-x（viewBox単位、0〜VIEWBOX_Wでラップ）
  const [interacting, setInteracting] = useState(false);
  const gestureRef = useRef({ mode: null, moved: false, startX: 0, startY: 0, startWorldX: 0, startPanY: 0, startDist: 0, startZoom: 1 });
  // 慣性スクロール（モーメンタム）用：直近の移動速度を追跡し、指を離した後も減速しながらパンを継続する
  const velocityRef = useRef({ vx: 0, vy: 0, lastX: 0, lastY: 0, lastT: 0 });
  const momentumIdRef = useRef(null);

  const wrapWorldX = (x) => ((x % VIEWBOX_W) + VIEWBOX_W) % VIEWBOX_W;

  // 画面px量をviewBox単位量に変換するための比率（水平方向）。ズーム倍率が上がるほど、同じpx移動でも
  // viewBox上の移動量は小さくなる（拡大して見ているぶん、指の動きに対する地図上の移動が細かくなるため）。
  // HORIZONTAL_PAN_DAMPINGは体感速度の調整用（1.0だと指の動きに対して速すぎたため、控えめな値に抑えている）
  const HORIZONTAL_PAN_DAMPING = 0.55;
  const pxToViewboxUnits = (z) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const containerW = rect?.width || 1;
    return (VIEWBOX_W / (containerW * z)) * HORIZONTAL_PAN_DAMPING;
  };

  const clampPanY = (nextY, z) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return nextY;
    // ズーム倍率に応じて、地図が画面外へ大きくはみ出しすぎないよう垂直パン可能範囲を制限する（簡易版）。
    // 水平方向は無限ループのためクランプしない
    const maxY = (rect.height * (z - 1)) / 2;
    return Math.min(maxY, Math.max(-maxY, nextY));
  };

  const cancelMomentum = () => {
    if (momentumIdRef.current != null) {
      cancelAnimationFrame(momentumIdRef.current);
      momentumIdRef.current = null;
    }
  };

  // 指を離した瞬間の速度(px/ms)を初速として、摩擦係数で毎フレーム減衰させながらpanを更新し続ける。
  // アニメーション中は interacting=true を維持し、CSSのtransform transitionと競合してカクつかないようにする
  const startMomentum = (vx0, vy0, z) => {
    cancelMomentum();
    setInteracting(true);
    let vx = vx0 * 16.67; // px/ms → 1フレーム(約16.67ms)あたりの移動量に変換（画面px単位）
    let vy = vy0 * 16.67;
    const unitsPerPx = pxToViewboxUnits(z);
    const FRICTION = 0.965;
    const STOP_THRESHOLD = 0.04;
    const step = () => {
      vx *= FRICTION;
      vy *= FRICTION;
      if (Math.abs(vx) < STOP_THRESHOLD && Math.abs(vy) < STOP_THRESHOLD) {
        momentumIdRef.current = null;
        setInteracting(false);
        return;
      }
      setWorldX((x) => wrapWorldX(x - vx * unitsPerPx));
      let hitBoundY = false;
      setPanY((y) => {
        const next = clampPanY(y + vy, z);
        if (next === y && vy !== 0) hitBoundY = true;
        return next;
      });
      if (hitBoundY) vy = 0; // 垂直方向が端に達したら縦成分だけ打ち切り、横方向の慣性は続行する
      momentumIdRef.current = requestAnimationFrame(step);
    };
    momentumIdRef.current = requestAnimationFrame(step);
  };

  const resetView = () => { cancelMomentum(); setZoom(1); setPanY(0); setWorldX(0); };

  const zoomBy = (factor) => {
    cancelMomentum();
    setZoom((z) => {
      const nz = Math.min(MAP_ZOOM_MAX, Math.max(MAP_ZOOM_MIN, +(z * factor).toFixed(3)));
      setPanY((y) => clampPanY(y, nz));
      return nz;
    });
  };

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    cancelMomentum();
    const g = gestureRef.current;
    g.mode = "pan"; g.moved = false;
    g.startX = e.clientX; g.startY = e.clientY;
    g.startWorldX = worldX; g.startPanY = panY;
    velocityRef.current = { vx: 0, vy: 0, lastX: e.clientX, lastY: e.clientY, lastT: performance.now() };
    setInteracting(true);
  };

  const onTouchStart = (e) => {
    cancelMomentum();
    const g = gestureRef.current;
    g.moved = false;
    if (e.touches.length === 2) {
      g.mode = "pinch";
      g.startDist = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
      g.startZoom = zoom;
      setInteracting(true);
    } else if (e.touches.length === 1) {
      g.mode = "pan";
      g.startX = e.touches[0].clientX;
      g.startY = e.touches[0].clientY;
      g.startWorldX = worldX; g.startPanY = panY;
      velocityRef.current = { vx: 0, vy: 0, lastX: e.touches[0].clientX, lastY: e.touches[0].clientY, lastT: performance.now() };
      setInteracting(true);
    }
  };

  useEffect(() => {
    if (!interacting) return;
    const g = gestureRef.current;

    // 直近の移動から瞬間速度(px/ms)を更新する。指数移動平均で軽くならし、最後の一振りだけに引っ張られないようにする
    const trackVelocity = (clientX, clientY) => {
      const v = velocityRef.current;
      const now = performance.now();
      const dt = now - v.lastT;
      if (dt > 0) {
        const instVx = (clientX - v.lastX) / dt;
        const instVy = (clientY - v.lastY) / dt;
        v.vx = v.vx * 0.7 + instVx * 0.3;
        v.vy = v.vy * 0.7 + instVy * 0.3;
      }
      v.lastX = clientX; v.lastY = clientY; v.lastT = now;
    };

    const applyPan = (dx, dy, z) => {
      const unitsPerPx = pxToViewboxUnits(z);
      setWorldX(wrapWorldX(g.startWorldX - dx * unitsPerPx));
      setPanY(clampPanY(g.startPanY + dy, z));
    };

    const onMouseMove = (e) => {
      if (g.mode !== "pan") return;
      const dx = e.clientX - g.startX;
      const dy = e.clientY - g.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) g.moved = true;
      trackVelocity(e.clientX, e.clientY);
      applyPan(dx, dy, zoom);
    };

    const onTouchMove = (e) => {
      if (g.mode === "pinch" && e.touches.length === 2) {
        e.preventDefault();
        const d = Math.hypot(e.touches[1].clientX - e.touches[0].clientX, e.touches[1].clientY - e.touches[0].clientY);
        const nz = Math.min(MAP_ZOOM_MAX, Math.max(MAP_ZOOM_MIN, g.startZoom * (d / g.startDist)));
        g.moved = true;
        setZoom(nz);
        setPanY((y) => clampPanY(y, nz));
      } else if (g.mode === "pan" && e.touches.length === 1) {
        const dx = e.touches[0].clientX - g.startX;
        const dy = e.touches[0].clientY - g.startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) g.moved = true;
        // 横方向は常にワールドラップとして消費（ズーム倍率に関係なく地図を一周探索できる）。
        // 縦方向はズーム時のみパンとして消費し、zoom=1のときはページの縦スクロールを奪わない
        if (Math.abs(dx) > Math.abs(dy) || zoom > 1) {
          e.preventDefault();
          trackVelocity(e.touches[0].clientX, e.touches[0].clientY);
          applyPan(dx, zoom > 1 ? dy : 0, zoom);
        }
      }
    };

    const onEnd = (e) => {
      if (e.touches && e.touches.length === 1) {
        // ピンチ→残り1本指はそのままパン操作へ引き継ぐ
        g.mode = "pan"; g.moved = true;
        g.startX = e.touches[0].clientX;
        g.startY = e.touches[0].clientY;
        g.startWorldX = worldX; g.startPanY = panY;
        velocityRef.current = { vx: 0, vy: 0, lastX: e.touches[0].clientX, lastY: e.touches[0].clientY, lastT: performance.now() };
        return;
      }
      // パン操作の指/マウスを離した瞬間：直近速度が一定以上あれば慣性スクロールを開始する
      let momentumStarted = false;
      if (g.mode === "pan") {
        const { vx, vy } = velocityRef.current;
        if (Math.hypot(vx, vy) > 0.012) { startMomentum(vx, vy, zoom); momentumStarted = true; }
      }
      g.mode = null;
      // 慣性スクロールを開始した場合、あるいは既に別の慣性が進行中の場合は、
      // そちらがinteracting状態の終了を管理するのでここでは触らない（重複したupイベント対策）
      if (!momentumStarted && momentumIdRef.current == null) setInteracting(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [interacting, zoom, worldX, panY]); // eslint-disable-line

  useEffect(() => () => cancelMomentum(), []);

  // デスクトップ：トラックパッドのピンチ操作はwheelイベント + ctrlKey/metaKeyとして発火する
  const onWheel = (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    zoomBy(Math.exp(-e.deltaY * 0.012));
  };

  const onDoubleClick = () => {
    if (zoom > 1.4) resetView(); else zoomBy(2.5 / zoom);
  };

  return { zoom, panY, worldX, interacting, gestureRef, onMouseDown, onTouchStart, onWheel, onDoubleClick, zoomBy, resetView };
}

function MapView({ onStudyRegion, onStudyTheme, onJumpToCard }) {
  const [year, setYear] = useState(1648);
  const [selectedId, setSelectedId] = useState(null);
  const [sheetState, setSheetState] = useState("closed"); // closed | half | full
  // 初回操作誘導ツールチップ：「地図」タブに来るたび（＝MapViewが再マウントされるたび）trueにリセットされる。
  // 文脈穴埋めカードのtooltipArmedと同じライフサイクル設計（初回のみ表示→操作で即破棄→手動で再表示可）
  const [mapTipArmed, setMapTipArmed] = useState(true);
  // アクティブな時代区分（ERA_PERIODS）を年代から判定し、そのperiodのデータだけを描画に使う。
  // periodがhasContent:falseの間はプレースホルダーのため「準備中」表示（inCoveredEra=false）になる
  const activePeriod = getActiveEraPeriod(year);
  const inCoveredEra = !!(
    activePeriod && activePeriod.hasContent &&
    year >= activePeriod.contentRange[0] && year <= activePeriod.contentRange[1]
  );
  // regionsByYear(year)を持つ時代区分（市民革命と国民国家など、スナップショットごとに
  // 勢力の顔ぶれ自体が変わる時代）はそちらを優先する。静的なregions配列（大航海時代・近世など、
  // 同じ勢力が形を変えるだけの時代）はそのまま使う
  const periodRegions = activePeriod?.regionsByYear
    ? activePeriod.regionsByYear(year)
    : activePeriod?.regions ?? [];
  const periodBackground = activePeriod?.background ?? [];
  const periodCapitals = activePeriod?.capitalsByYear ? activePeriod.capitalsByYear(year) : activePeriod?.capitals ?? [];
  const periodRivers = activePeriod?.riversByYear ? activePeriod.riversByYear(year) : activePeriod?.rivers ?? [];
  const periodSeaLabels = activePeriod?.seaLabelsByYear ? activePeriod.seaLabelsByYear(year) : activePeriod?.seaLabels ?? [];
  const periodBlurb = activePeriod?.blurb ?? {};
  const periodKeyYears = activePeriod?.hasContent && activePeriod.keyYears?.length ? activePeriod.keyYears : ERA_BOUNDARY_YEARS;

  const selectedRegion = periodRegions.find((r) => r.id === selectedId);
  const matchedCards = useMemo(
    () => CARDS.filter((c) => c.region === selectedId).sort((a, b) => a.difficulty - b.difficulty),
    [selectedId]
  );
  const relatedThemes = useMemo(
    () => [...new Set(matchedCards.flatMap((c) => c.theme))],
    [matchedCards]
  );
  const status = selectedId ? regionStatus(selectedId, year) : null;

  // 勢力エリアのタップ：常にハーフ表示から開く（フル展開中に別エリアをタップした場合も同様）。
  // いずれかの勢力をタップした瞬間、誘導ツールチップは即座にフェードアウトして破棄する
  const openRegion = (id) => {
    setSelectedId(id);
    setSheetState("half");
    setMapTipArmed(false);
  };

  const mapContainerRef = useRef(null);
  const panZoom = useMapPanZoom(mapContainerRef);

  // 地図描画領域の最大化：上部固定ヘッダーの実測高さを引いた「画面最下部までの残り全高」を
  // 地図キャンバスの高さとして与える。ヘッダー内容（EraScrubber）の実際のレンダリング高さに追従するため、
  // 固定px値の決め打ちではなく実測値を使う
  const mapHeaderRef = useRef(null);
  const [mapAreaHeight, setMapAreaHeight] = useState(null);
  useLayoutEffect(() => {
    if (!inCoveredEra) return;
    const updateHeight = () => {
      const headerH = mapHeaderRef.current?.getBoundingClientRect().height ?? 0;
      // ヘッダーは "top-2"（8px）のオフセットで浮くアイランド形状のため、その分も差し引く
      setMapAreaHeight(Math.max(320, window.innerHeight - headerH - 8));
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
    };
  }, [inCoveredEra]);

  return (
    <>
      {/* 情報階層の上下完全分離：上部は年代（時間軸）専用の、Apple風リキッドグラスの浮遊アイランドヘッダー、
          下部はコンテナ枠を持たないエッジ・トゥ・エッジの地図キャンバス（空間軸） */}
      <div className="-mx-4">
        <div
          ref={mapHeaderRef}
          className="sticky top-2 z-30 mx-3 rounded-2xl px-4 pt-2.5 pb-2"
          style={{
            background: "rgba(27,36,48,0.72)",
            backdropFilter: "blur(18px) saturate(180%)",
            WebkitBackdropFilter: "blur(18px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 10px 26px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          <EraScrubber value={year} onChange={setYear} keyYears={periodKeyYears} />
        </div>

        {!inCoveredEra ? (
          <div className="mx-4 mt-5 rounded-3xl px-6 py-14 text-center" style={{ border: "1px solid #2E3849", background: "#202A3A" }}>
            <MapIcon size={26} style={{ color: "#6B7688", margin: "0 auto" }} />
            <p className="font-display text-base mt-3" style={{ color: "#EFE3C8" }}>
              {formatYear(year)}{activePeriod ? `（${activePeriod.label}）` : ""}の勢力図データは準備中です
            </p>
            <p className="font-body text-xs mt-2" style={{ color: "#8A93A6" }}>現在は近世ヨーロッパ（1550〜1700年）のみ対応しています</p>
            <button
              onClick={() => setYear(1648)}
              className="mt-5 font-body text-sm rounded-full px-5 py-2"
              style={{ background: "#C9A227", color: "#1B2430" }}
            >
              近世ヨーロッパ（1648年）に移動
            </button>
          </div>
        ) : (
          <div className="grid-bg relative" style={{ height: mapAreaHeight ? `${mapAreaHeight}px` : undefined, minHeight: 320 }}>
            {/* 初回操作誘導ツールチップ＋手動再表示用ⓘ：エッジ・トゥ・エッジ化した地図の右上端に配置（パン/ズームの影響を受けない固定レイヤー） */}
            <div className="absolute top-2.5 right-3 z-10 flex items-center gap-1" style={{ pointerEvents: "none" }}>
              <span className={`map-tip-pill font-body${mapTipArmed ? " map-tip-visible" : ""}`} aria-hidden={!mapTipArmed}>
                💡 領域タップで詳細 / 該当問題チェック
              </span>
              <button
                onClick={() => setMapTipArmed((v) => !v)}
                aria-label={mapTipArmed ? "操作ヒントを閉じる" : "操作ヒントを再表示"}
                className="fluid-tap shrink-0"
                style={{
                  width: 18, height: 18,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "transparent",
                  border: "none",
                  pointerEvents: "auto",
                }}
              >
                <Info size={13} style={{ color: "#8A93A6" }} />
              </button>
            </div>

            {/* ピンチズーム（1.0x〜4.0x）＋ドラッグパン対応のキャンバス。ドラッグとみなされた操作では
                勢力タップ（openRegion）が誤発火しないよう、キャプチャ段階でclickを止める。
                地図描画領域の最大化：画面最下部まで（デッドスペースなく）フルに広げる */}
            <div
              ref={mapContainerRef}
              className="relative overflow-hidden"
              onMouseDown={panZoom.onMouseDown}
              onTouchStart={panZoom.onTouchStart}
              onWheel={panZoom.onWheel}
              onDoubleClick={panZoom.onDoubleClick}
              onClickCapture={(e) => { if (panZoom.gestureRef.current.moved) e.stopPropagation(); }}
              style={{
                touchAction: "pan-y",
                cursor: panZoom.interacting ? "grabbing" : "grab",
                height: "100%",
              }}
            >
              <div
                style={{
                  width: "100%", height: "100%",
                  transform: `translateY(${panZoom.panY}px) scale(${panZoom.zoom})`,
                  transformOrigin: "center center",
                  transition: panZoom.interacting ? "none" : "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <svg
                  viewBox={`${panZoom.worldX} 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
                  preserveAspectRatio="xMidYMid slice"
                  className="w-full h-full block"
                >
                  {/* ベースマップ（陸地シルエットとしての大陸形状）。ダークネイビー基調の配色仕様：
                      海洋 #131924〜#1B2430／陸地 #232E3F／海岸線・境界線 #334155。
                      world-atlas（land-50m、topojson-simplifyで最適化）の実地理データをd3-geoでMercator投影し、事前計算したSVGパスをそのまま使用。
                      横スワイプによるワールドラップ（無限ループ）のため、地図と勢力を x=0 と x=VIEWBOX_W の2枚重ねで描画し、
                      viewBoxのmin-x（worldX）を0〜VIEWBOX_Wでラップさせることで継ぎ目なく一周できるようにしている */}
                  <defs>
                    <linearGradient id="mapOceanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#131924" />
                      <stop offset="100%" stopColor="#1B2430" />
                    </linearGradient>
                    {/* 陸地アウトラインと完全に同一のパスをクリップマスクとして流用。
                        勢力ポリゴンをこれでクリップすることで、海洋への不自然なはみ出しを構造的に・100%防止する */}
                    <clipPath id="landClip">
                      <path d={WORLD_LAND_PATH} />
                    </clipPath>
                  </defs>
                  <rect x={panZoom.worldX} y="0" width={VIEWBOX_W} height={VIEWBOX_H} fill="url(#mapOceanGrad)" />

                  {[0, VIEWBOX_W].map((tileOffset) => (
                    <g key={tileOffset} transform={`translate(${tileOffset},0)`}>
                      <path
                        d={WORLD_LAND_PATH}
                        fill="#232E3F"
                        stroke="#334155"
                        strokeWidth="0.75"
                        vectorEffect="non-scaling-stroke"
                      />

                      {/* 背景装飾（非インタラクティブな周辺国）：黒い未着色の穴を作らず、実際に版図として視認できる濃さで塗る。
                          勢力タップの妨げにならないようpointerEvents:noneかつMAP_REGIONSより先に描画 */}
                      {periodBackground.map((t) => {
                        const bgLabelOpacity = Math.max(0, Math.min(1, (panZoom.zoom - 1.05) / 0.3));
                        return (
                          <g key={t.name} style={{ pointerEvents: "none" }}>
                            <path d={t.d} fill={t.fill} fillOpacity="0.5" stroke={t.fill} strokeOpacity="0.6" strokeWidth="0.5" vectorEffect="non-scaling-stroke" clipPath="url(#landClip)" />
                            <text
                              x={t.labelX} y={t.labelY}
                              textAnchor="middle"
                              className="font-body"
                              fontSize="6"
                              fill="#AEB8C4"
                              style={{ opacity: bgLabelOpacity * 0.8, transition: "opacity 0.3s ease" }}
                              transform={`translate(${t.labelX},${t.labelY}) scale(${1 / panZoom.zoom}) translate(${-t.labelX},${-t.labelY})`}
                            >
                              {t.name}
                            </text>
                          </g>
                        );
                      })}

                      {[...periodRegions]
                        .sort((a, b) => (a.id === selectedId ? 1 : 0) - (b.id === selectedId ? 1 : 0))
                        .map((r) => {
                        const st = regionStatus(r.id, year);
                        const isNetherlandsUnderSpain = r.id === "オランダ" && year < 1648;
                        const fillColor = isNetherlandsUnderSpain ? "#E0AD6B" : r.fill;
                        const isSelected = selectedId === r.id;
                        // 選択状態は .region-ellipse-selected / 未選択は .region-ellipse-unselected を必ず割り当てる
                        // （以前は選択時に undefined を渡していたため、選択の視覚的フィードバックが機能していなかった）
                        const shapeClassName = isSelected ? "region-ellipse-selected" : "region-ellipse-unselected";
                        const shapeData = r.shape === "path" ? r.dByYear(year) : r.pointsByYear(year);
                        const shapeProps = {
                          className: shapeClassName,
                          fill: fillColor,
                          // fill-opacity / stroke-opacity / stroke-width / drop-shadow は
                          // .region-ellipse-selected / .region-ellipse-unselected（CSS）側で一元管理する。
                          // ここでは勢力ごとに変わる色とステータス由来のダッシュ線のみをインラインで指定する。
                          stroke: isSelected ? undefined : r.strokeColor,
                          strokeDasharray: st.disputed ? "5 4" : undefined,
                          strokeLinejoin: "round",
                          vectorEffect: "non-scaling-stroke",
                          clipPath: "url(#landClip)",
                        };

                        // ラベルのタイポグラフィ最適化：バウンディングボックス面積からフォントサイズとLOD（表示に必要なズーム倍率）を動的に算出
                        const bbox = getShapeBBox(shapeData);
                        const { minZoom, tracking } = getLabelStyle(bbox.width * bbox.height);
                        const fontSize = r.labelSize;
                        // LODフェードイン：minZoomの0.3手前から徐々にフェードインさせ、パチッと出現しないようにする
                        const labelOpacity = isSelected
                          ? 1
                          : Math.max(0, Math.min(1, (panZoom.zoom - (minZoom - 0.3)) / 0.3));
                        const lineHeight = fontSize * 1.05;
                        const startDy = -((r.labelLines.length - 1) * lineHeight) / 2;

                        return (
                          <g
                            key={r.id}
                            className="region-hitbox"
                            onClick={() => openRegion(r.id)}
                            tabIndex={0}
                            role="button"
                            aria-label={`${r.id}の詳細を見る`}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openRegion(r.id); } }}
                            style={{ cursor: "pointer", outline: "none" }}
                          >
                            {r.shape === "path" ? (
                              <path d={shapeData} {...shapeProps} />
                            ) : (
                              <polygon points={shapeData} {...shapeProps} />
                            )}
                            {/* 神聖ローマ帝国の内部構造：オーストリア大公国・ベーメン王国を、独立した勢力IDではなく
                                同一勢力内の「自然な小区分」として、少し濃いトーンで重ね描きする（タップは親のHRE領域と同じ扱い） */}
                            {r.id === "神聖ローマ帝国" && (
                              <>
                                <path d={HRE_AUSTRIA_SUB} fill="#EFCB7A" fillOpacity={isSelected ? 0.42 : 0.3} stroke="none" clipPath="url(#landClip)" style={{ pointerEvents: "none" }} />
                                <path d={HRE_BOHEMIA_SUB} fill="#B8D9A8" fillOpacity={isSelected ? 0.42 : 0.3} stroke="none" clipPath="url(#landClip)" style={{ pointerEvents: "none" }} />
                                <text x="520" y="217" textAnchor="middle" className="font-body" fontSize="5.2" fontWeight={600} fill="#FFFFFF" style={{ pointerEvents: "none", opacity: Math.max(0, Math.min(1, (panZoom.zoom - 1.15) / 0.3)), filter: "drop-shadow(0 0.6px 1.5px rgba(10,14,20,0.85))" }} transform={`translate(520,217) scale(${1 / panZoom.zoom}) translate(-520,-217)`}>オーストリア</text>
                                <text x="524" y="205" textAnchor="middle" className="font-body" fontSize="5.2" fontWeight={600} fill="#FFFFFF" style={{ pointerEvents: "none", opacity: Math.max(0, Math.min(1, (panZoom.zoom - 1.15) / 0.3)), filter: "drop-shadow(0 0.6px 1.5px rgba(10,14,20,0.85))" }} transform={`translate(524,205) scale(${1 / panZoom.zoom}) translate(-524,-205)`}>ベーメン</text>
                              </>
                            )}
                            {/* 汎用subLabelsレンダラー：飛び地／二地域構成の勢力（旧プロイセン王国のラインラント、
                                旧オーストリア帝国のロンバルド＝ヴェネト等）が持つ小区分ラベルを、勢力IDのハードコードではなく
                                region定義側のr.subLabels配列から描画する（geo-framework/schema/snapshot.schema.json の
                                entity.subLabels、build-era.jsが生成）。新しい時代・新しい勢力を追加してもこのJSXは変更不要 */}
                            {(r.subLabels || []).map((sub, subIdx) => (
                              <text key={subIdx} x={sub.at[0]} y={sub.at[1]} textAnchor="middle" className="font-body" fontSize={sub.size ?? 4} fontWeight={600} fill="#FFFFFF" style={{ pointerEvents: "none", opacity: Math.max(0, Math.min(1, (panZoom.zoom - 1.15) / 0.3)), filter: "drop-shadow(0 0.6px 1.5px rgba(10,14,20,0.85))" }} transform={`translate(${sub.at[0]},${sub.at[1]}) scale(${1 / panZoom.zoom}) translate(${-sub.at[0]},${-sub.at[1]})`}>{sub.text}</text>
                            ))}
                            {/* タイポグラフィの脱・硬質化：黒縁取り(stroke)を撤廃し、柔らかいドロップシャドウ＋
                                オフホワイトの文字色で可読性を確保。フォントもモダンなサンセリフ（font-body）に統一。
                                LODに応じてフェードイン、面積に応じてフォントサイズ・字間（トラッキング）を調整。
                                【重要】文字サイズはズーム倍率と無関係に常に一定の見た目サイズを保つ（transformで
                                CSSのscale(zoom)を自身の座標を中心に打ち消す）。これを入れ忘れていたのが
                                「拡大するほど文字が画面を埋め尽くすほど巨大化する」不具合の直接の原因だった */}
                            <text
                              x={r.labelX} y={r.labelY}
                              textAnchor="middle"
                              className="font-body"
                              fontSize={fontSize}
                              fontWeight={700}
                              fill="#F1F5F9"
                              transform={`translate(${r.labelX},${r.labelY}) scale(${1 / panZoom.zoom}) translate(${-r.labelX},${-r.labelY})`}
                              style={{
                                pointerEvents: "none",
                                letterSpacing: tracking,
                                opacity: labelOpacity,
                                transition: "opacity 0.3s ease",
                                filter: "drop-shadow(0 1px 2.5px rgba(10,14,20,0.55))",
                              }}
                            >
                              {r.labelLines.map((line, i) => (
                                <tspan key={i} x={r.labelX} dy={i === 0 ? startDy : lineHeight}>
                                  {line}
                                </tspan>
                              ))}
                            </text>
                          </g>
                        );
                      })}

                      {/* 首都マーカー：歴史地図アトラス風の「○地名」注記。タップ不可の装飾レイヤーで、わずかな拡大でフェードイン。
                          文字・円のサイズも地図の勢力ラベルと同様にズーム倍率を打ち消して常に一定の見た目サイズを保つ */}
                      {periodCapitals.map((c) => {
                        const cityOpacity = Math.max(0, Math.min(1, (panZoom.zoom - 1.6) / 0.3));
                        if (cityOpacity <= 0) return null;
                        // ラベルの逃がし方向（国名・他の注記との衝突回避用）。未指定は右下がデフォルト
                        const dir = c.dir || "br";
                        const dx = dir === "l" || dir === "tl" || dir === "bl" ? -3 : dir === "t" || dir === "b" ? 0 : 3;
                        const dy = dir === "t" || dir === "tl" ? -2.5 : dir === "b" || dir === "bl" || dir === "br" ? 3 : 1;
                        const anchor = dx < 0 ? "end" : dx === 0 ? "middle" : "start";
                        return (
                          <g
                            key={c.name}
                            transform={`translate(${c.x},${c.y}) scale(${1 / panZoom.zoom}) translate(${-c.x},${-c.y})`}
                            style={{ opacity: cityOpacity, transition: "opacity 0.3s ease", pointerEvents: "none" }}
                          >
                            <circle cx={c.x} cy={c.y} r="1.6" fill="none" stroke="#F1F5F9" strokeOpacity="0.85" strokeWidth="0.6" />
                            <text
                              x={c.x + dx} y={c.y + dy}
                              textAnchor={anchor}
                              className="font-body"
                              fontSize="7"
                              fill="#F8FAFC"
                              fontWeight={600}
                              style={{ filter: "drop-shadow(0 1px 2px rgba(10,14,20,0.9))" }}
                            >
                              {c.name}
                            </text>
                          </g>
                        );
                      })}

                      {/* 主要河川：極細のブルーグレーのラインで流路を描き、名称を小さく添える（装飾・タップ不可）。
                          都市マーカーと同じLODでフェードインし、文字サイズはズーム非依存 */}
                      {periodRivers.map((r) => {
                        const riverOpacity = Math.max(0, Math.min(1, (panZoom.zoom - 1.4) / 0.3));
                        if (riverOpacity <= 0) return null;
                        return (
                          <g key={r.name} style={{ opacity: riverOpacity * 0.9, transition: "opacity 0.3s ease", pointerEvents: "none" }}>
                            <polyline
                              points={r.points}
                              fill="none"
                              stroke="#5B7A96"
                              strokeOpacity="0.55"
                              strokeWidth="0.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              vectorEffect="non-scaling-stroke"
                            />
                            <text
                              x={r.labelX} y={r.labelY}
                              className="font-body"
                              fontSize="5.5"
                              fill="#CBD5E1"
                              fontStyle="italic"
                              style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.9))" }}
                              transform={`translate(${r.labelX},${r.labelY}) scale(${1 / panZoom.zoom}) translate(${-r.labelX},${-r.labelY})`}
                            >
                              {r.name}
                            </text>
                          </g>
                        );
                      })}

                      {/* 海洋・海峡・主要島嶼：陸地/勢力と混同しないよう、控えめなスレートブルーの透過テキストのみ（装飾・タップ不可） */}
                      {periodSeaLabels.map((s) => {
                        const seaOpacity = Math.max(0, Math.min(1, (panZoom.zoom - 1.15) / 0.3));
                        if (seaOpacity <= 0) return null;
                        return (
                          <text
                            key={s.name}
                            x={s.x} y={s.y}
                            textAnchor="middle"
                            className="font-body"
                            fontSize={s.size}
                            fontStyle="italic"
                            fill="rgba(224,242,254,0.65)"
                            transform={`translate(${s.x},${s.y}) scale(${1 / panZoom.zoom}) translate(${-s.x},${-s.y})`}
                            style={{ opacity: seaOpacity * 0.9, transition: "opacity 0.3s ease", pointerEvents: "none", letterSpacing: "0.03em", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.7))" }}
                          >
                            {s.name}
                          </text>
                        );
                      })}
                    </g>
                  ))}
                </svg>
              </div>

              {/* ズームコントロール（デスクトップのマウスユーザー向けフォールバック。ピンチ/ダブルタップと併用可）。
                  地図の「外」に枠を設けず、フル化した地図の上に浮かせるオーバーレイ配置 */}
              <div className="absolute bottom-4 right-3 z-10 flex flex-col gap-1.5" style={{ pointerEvents: "auto" }}>
                <button
                  onClick={() => panZoom.zoomBy(1.4)}
                  aria-label="拡大"
                  className="fluid-tap flex items-center justify-center"
                  style={{ width: 30, height: 30, borderRadius: 999, background: "rgba(20,26,38,0.7)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", color: "#EFE3C8", fontSize: 16, lineHeight: 1 }}
                >＋</button>
                <button
                  onClick={() => panZoom.zoomBy(1 / 1.4)}
                  aria-label="縮小"
                  className="fluid-tap flex items-center justify-center"
                  style={{ width: 30, height: 30, borderRadius: 999, background: "rgba(20,26,38,0.7)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(6px)", color: "#EFE3C8", fontSize: 16, lineHeight: 1 }}
                >－</button>
                <button
                  onClick={panZoom.resetView}
                  aria-label="表示をリセット"
                  className="fluid-tap flex items-center justify-center"
                  style={{ width: 30, height: 30, borderRadius: 999, background: "rgba(20,26,38,0.7)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(6px)" }}
                >
                  <RotateCcw size={13} style={{ color: "#EFE3C8" }} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 選択エリアの詳細パネル：下部からせり上がるボトムシート（ハーフ↔フル）。ノンモーダルのため上部の地図・時間軸は常に露出 */}
      <RegionDetailSheet
        region={selectedRegion}
        blurb={periodBlurb}
        year={year}
        status={status}
        matchedCards={matchedCards}
        relatedThemes={relatedThemes}
        sheetState={sheetState}
        setSheetState={setSheetState}
        onJumpToCard={onJumpToCard}
        onStudyTheme={onStudyTheme}
        onStudyRegion={onStudyRegion}
      />
    </>
  );
}
