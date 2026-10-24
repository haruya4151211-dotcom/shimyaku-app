export const CARDS = [
  {
    id: "c1", year: 1648, difficulty: 0, era: "近世（15〜18世紀）", region: "神聖ローマ帝国", theme: ["通史"],
    front: "1648年に三十年戦争を終結させた条約は？",
    back: "ウェストファリア条約",
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Holy_Roman_Empire_1648.png",
      alt: "1648年時点の神聖ローマ帝国の領邦分立を示す地図",
      credit: "Holy Roman Empire, 1648／Astrokey44, Wikimedia Commons・CC BY-SA 3.0",
    },
    anecdote: "豆知識：交渉は戦時下での移動を伴い、約5年もの歳月を要した。当時としては異例の長期和平交渉だった。",
    anecdoteLink: "https://en.wikipedia.org/wiki/Peace_of_Westphalia",
  },
  {
    id: "c2", year: 1644, difficulty: 1, era: "近世（15〜18世紀）", region: "神聖ローマ帝国", theme: ["通史"],
    front: "三十年戦争の講和交渉が行われた2都市は？",
    back: "オスナブリュックとミュンスター（プロテスタント側とカトリック側で交渉地を分けて同時進行した）",
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Holy_Roman_Empire_1648.png",
      alt: "1648年時点の神聖ローマ帝国の領邦分立を示す地図",
      credit: "Holy Roman Empire, 1648／Astrokey44, Wikimedia Commons・CC BY-SA 3.0",
    },
  },
  {
    id: "c3", year: 1648, difficulty: 2, era: "近世（15〜18世紀）", region: "神聖ローマ帝国", theme: ["通史"],
    front: "ウェストファリア条約が神聖ローマ帝国に与えた政治的影響は？",
    back: "",
    cloze: {
      template: "帝国内の各領邦に{{1}}を含む高い自治権（領邦主権）が認められ、{{2}}は大きく低下した。帝国は事実上、多数の主権的領邦からなる緩やかな連合体へと近づいた。",
      slots: [
        { id: 1, answer: "外交権", category: "権限" },
        { id: 2, answer: "皇帝の求心力", category: "名詞句" },
      ],
      points: [
        { label: "原因", text: "ウェストファリア条約が各領邦に外交権を含む高い自治権を認めた" },
        { label: "経過", text: "領邦ごとの主権（領邦主権）が確立し、皇帝への求心力が失われていった" },
        { label: "意義", text: "神聖ローマ帝国は事実上、多数の主権的領邦からなる緩やかな連合体へ近づいた" },
      ],
    },
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Holy_Roman_Empire_1648.png",
      alt: "1648年時点の神聖ローマ帝国の領邦分立を示す地図",
      credit: "Holy Roman Empire, 1648／Astrokey44, Wikimedia Commons・CC BY-SA 3.0",
    },
  },
  {
    id: "c4", year: 1648, difficulty: 3, era: "近世（15〜18世紀）", region: "ヨーロッパ全域", theme: ["通史"],
    front: "ウェストファリア条約が主権国家体制の成立に果たした役割は？",
    back: "",
    cloze: {
      template: "教皇・皇帝という超国家的権威ではなく、各国家の{{1}}と対等な国家間関係を国際秩序の原則とした。これが後に「{{2}}」と呼ばれる近代国際関係の出発点とされる。",
      slots: [
        { id: 1, answer: "主権", category: "概念" },
        { id: 2, answer: "ウェストファリア体制", category: "歴史的意義" },
      ],
      points: [
        { label: "原因", text: "三十年戦争を終結させる中で、宗教的権威に代わる新しい国際秩序の原則が必要とされた" },
        { label: "経過", text: "教皇・皇帝ではなく、各国家の主権と対等な国家間関係を秩序の基盤とした" },
        { label: "意義", text: "「ウェストファリア体制」と呼ばれる近代国際関係の出発点となった" },
      ],
    },
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Map_of_Europe_1648_FA.png",
      alt: "1648年時点のヨーロッパの勢力図",
      credit: "Map of Europe 1648／Wikimedia Commons",
    },
  },
  {
    id: "c5", year: 1650, difficulty: 4, era: "近世（15〜18世紀）", region: "神聖ローマ帝国", theme: ["通史"],
    front: "三十年戦争は神聖ローマ帝国の統治構造にどのような影響を与えたか？",
    back: "",
    cloze: {
      template: "戦争による荒廃と諸侯の自立化が進み、{{1}}は形骸化して帝国は名目的な存在に近づいた。一方で個々の領邦は{{2}}の整備を進め、後の絶対主義国家の基盤を築いた。",
      slots: [
        { id: 1, answer: "皇帝権力", category: "名詞句" },
        { id: 2, answer: "常備軍・官僚制", category: "制度" },
      ],
      points: [
        { label: "原因", text: "長期にわたる戦争による荒廃と、諸侯の自立化が並行して進んだ" },
        { label: "経過", text: "皇帝権力が形骸化する一方、個々の領邦は常備軍・官僚制の整備を進めた" },
        { label: "意義", text: "領邦ごとの統治強化は、後の絶対主義国家の基盤となった" },
      ],
    },
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Holy_Roman_Empire_1648.png",
      alt: "1648年時点の神聖ローマ帝国の領邦分立を示す地図",
      credit: "Holy Roman Empire, 1648／Astrokey44, Wikimedia Commons・CC BY-SA 3.0",
    },
  },
  {
    id: "c6", year: 1660, difficulty: 5, era: "近世（15〜18世紀）", region: "ヨーロッパ全域", theme: ["通史"],
    front: "16〜17世紀の宗教対立は、近代主権国家体制の成立にどう影響したか？",
    back: "",
    cloze: {
      template: "宗教改革以降のカトリックとプロテスタントの対立は諸侯・諸国間の争いと結びつき、{{1}}へと拡大した。これを終結させた{{2}}は、宗教的統一に代わり主権国家同士の勢力均衡を秩序原理とし、近代的な主権国家体制の起点となった。",
      slots: [
        { id: 1, answer: "三十年戦争", category: "固有名詞" },
        { id: 2, answer: "ウェストファリア条約", category: "固有名詞" },
      ],
      points: [
        { label: "原因", text: "宗教改革以降の宗派対立が、神聖ローマ帝国内の諸侯・諸国間の政治的争いと結びついた" },
        { label: "経過", text: "対立は三十年戦争として全ヨーロッパ規模に拡大し、多数の国が介入した" },
        { label: "意義", text: "宗教的統一ではなく主権国家間の勢力均衡を秩序原理とする、近代国際関係の起点となった" },
      ],
    },
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Map_of_Europe_1648_FA.png",
      alt: "1648年時点のヨーロッパの勢力図",
      credit: "Map of Europe 1648／Wikimedia Commons",
    },
    anecdote: "現代との繋がり：内政不干渉・主権平等の原則は、現在の国連憲章にも通じる国際関係の基本原則として残っている。",
    anecdoteLink: "https://en.wikipedia.org/wiki/Westphalian_sovereignty",
  },
  {
    id: "c7", year: 1648, difficulty: 2, era: "近世（15〜18世紀）", region: "スペイン・オーストリア", theme: ["ハプスブルク家の歴史"],
    front: "三十年戦争を経て衰退が決定的になったハプスブルク家の系統は？",
    back: "スペイン・ハプスブルク家。オランダの事実上の独立を認めるなど、ヨーロッパにおける覇権的地位を大きく後退させた。",
    anecdote: "逸話：ハプスブルク家は「戦は他家に、汝は結婚せよ」という言葉で知られるほど、婚姻政策による領土拡大を重視した家系だった。",
    anecdoteLink: "https://en.wikipedia.org/wiki/House_of_Habsburg",
  },
  {
    id: "c8", year: 1648, difficulty: 1, era: "近世（15〜18世紀）", region: "オランダ", theme: ["通史", "ハプスブルク家の歴史"],
    front: "ウェストファリア条約で国際的に独立が承認された国は？",
    back: "オランダ（ネーデルラント連邦共和国）とスイス",
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Map_of_Europe_1648_FA.png",
      alt: "1648年時点のヨーロッパの勢力図（オランダの独立を含む）",
      credit: "Map of Europe 1648／Wikimedia Commons",
    },
  },
  {
    id: "c9", year: 1648, difficulty: 4, era: "近世（15〜18世紀）", region: "ヨーロッパ全域", theme: ["通史"],
    front: "【文脈穴埋め】三十年戦争の講和と主権国家体制",
    back: "",
    cloze: {
      template: "三十年戦争は神聖ローマ帝国内の宗教対立から始まり、諸外国の介入によって全ヨーロッパ規模の戦争へと拡大した。1648年、{{1}}が結ばれて講和が成立し、{{2}}が国際的に承認されたことで、近代的な主権国家体制の基礎が築かれた。",
      slots: [
        { id: 1, answer: "ウェストファリア条約", category: "固有名詞" },
        { id: 2, answer: "オランダの独立", category: "事象" },
      ],
      points: [
        { label: "原因", text: "宗教改革以降のカトリックとプロテスタントの対立が諸侯間の争いに発展した" },
        { label: "経過", text: "フランス・スウェーデンなど諸外国の介入によって戦争がヨーロッパ規模に拡大した" },
        { label: "意義", text: "主権国家同士の対等な関係を原則とする近代国際秩序（ウェストファリア体制）の起点となった" },
      ],
    },
  },
  // ---- 市民革命と国民国家（1789〜1871年頃）：地図タブとの連携検証用サンプル ----
  {
    id: "c10", year: 1812, difficulty: 2, era: "近代（市民革命と国民国家）", region: "フランス帝国", theme: ["通史"],
    front: "1812年、ナポレオンが大陸封鎖令違反を理由に大軍を送った国は？",
    back: "ロシア帝国（ロシア遠征）。厳冬とモスクワからの撤退により大敗し、帝国衰退の転機となった。",
  },
  {
    id: "c11", year: 1812, difficulty: 3, era: "近代（市民革命と国民国家）", region: "ワルシャワ大公国", theme: ["通史"],
    front: "ワルシャワ大公国はどの条約によって、どの国の領土から再建されたか？",
    back: "ティルジット条約（1807年）により、プロイセンが獲得していたポーランド分割地から再建された。",
  },
  {
    id: "c12", year: 1815, difficulty: 2, era: "近代（市民革命と国民国家）", region: "ドイツ連邦", theme: ["通史"],
    front: "ウィーン会議を主導し、正統主義・勢力均衡の原則を掲げたオーストリアの外相は？",
    back: "メッテルニヒ",
  },
  {
    id: "c13", year: 1815, difficulty: 3, era: "近代（市民革命と国民国家）", region: "ネーデルラント連合王国", theme: ["通史"],
    front: "ウィーン会議で、オランダと旧オーストリア領ネーデルラント（現ベルギー）が統合されて成立した国家は？",
    back: "ネーデルラント連合王国（1830年にベルギーが分離独立するまで存続）",
  },
  {
    id: "c14", year: 1871, difficulty: 2, era: "近代（市民革命と国民国家）", region: "ドイツ帝国", theme: ["通史"],
    front: "1871年、普仏戦争の勝利を経てドイツ帝国の成立が宣言された場所は？",
    back: "ヴェルサイユ宮殿の鏡の間",
  },
  {
    id: "c15", year: 1871, difficulty: 3, era: "近代（市民革命と国民国家）", region: "フランス", theme: ["通史"],
    front: "普仏戦争の敗北により、フランスがドイツ帝国に割譲した地域は？",
    back: "アルザス・ロレーヌ",
  },
  {
    id: "c16", year: 1871, difficulty: 2, era: "近代（市民革命と国民国家）", region: "イタリア王国", theme: ["通史"],
    front: "1871年、イタリア王国による統一の最終段階として編入された都市は？",
    back: "ローマ（教皇領を占領し、新首都とした）",
  },
];