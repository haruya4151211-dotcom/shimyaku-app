import { lonLatToXY } from "./mapProjection.js";
import { GEO_LAND_PATH, GEO_PATHS, GEO_BBOX } from "./generated/geoPaths.js";
import {
  ASIA_ANCIENT_CARDS, ASIA_MEDIEVAL_CARDS, ASIA_RENAISSANCE_CARDS, ASIA_ABSOLUTISM_CARDS, ASIA_REVOLUTION_CARDS, ASIA_IMPERIALISM_CARDS,
  ASIA_MAP_LAYERS, ASIA_BLURB,
} from "./asiaCards.js";

// ---------------------------------------------------------------------------
// カード画像（image）の選定方針
// - 学校の世界史資料集に載っているような、ひと目で場面や人物が分かる「象徴的資料」を優先する
//   （有名な絵画・肖像画・風刺画・版画、または日本語表記／要素を絞ったシンプルな地図）。
// - 文字で埋め尽くされた細かい地図、外国語（ペルシャ語・アラビア語など）表記の地図、
//   スマホ幅で縮小すると判読できない高密度の図版は採用しない。
// - 画像は著作権の切れたもの（Public domain／CC0）または CC BY-SA 等の再利用可能なライセンスに限り、
//   credit に「作品名／作者（制作年）, 出典・ライセンス」を必ず記載する。
// - データ構造は images: [{ url, caption, alt, credit }] の配列。caption はカード上で画像直下に表示する
//   「何の資料・絵画か」の短い説明（例：「テル・ボルフ『ミュンスター講和条約の批准』（1648年）」）、
//   alt は画面読み上げ用の情景説明。2枚以上あるとドットインジケーターで切り替えられる。
// - Wikimedia Commons の画像は原寸ではなく幅960pxのサムネイルURL（.../thumb/.../960px-ファイル名）を使う。
//   原寸は数千px・数MBに及ぶことがあり、また960px以外の任意幅のサムネイルはエラーになる場合がある。
// ---------------------------------------------------------------------------
// データ生成ガイドライン（問題カードにする内容と、豆知識・解説に回す内容の切り分け）
// - 【問題カード化】試験・教科書で直接問われる超重要用語、条約名、定番の風刺・名言は、独立した問題カードにする
//   （例：「人権宣言」「ウェストファリア条約」、風刺「会議は踊る、されど進まず」）。
//   穴埋め形式（cloze）では、問われる語句そのものを空欄（slots）にし、裏面の points で原因・経過・意義を解説する。
// - 【豆知識・解説】理解を深める背景や因果関係、記憶のフックになるエピソードは、anecdote（豆知識）や
//   points（解説）に書き、問題カードにはしない
//   （例：ヴァルミーの戦いでのゲーテの言葉、ナポレオンの身長にまつわる俗説や遺言）。
// - ある問題カードの答えになっている語句を、別のカードの豆知識・解説にそのまま書かない（答えが先に見えてしまうため）。
// - 画像の caption・alt は作品名・人物名を正確に書いてよい。表面では穴埋めの答え（slots の answer）と完全一致する部分が
//   自動で〔？〕に伏せられる。ただし部分一致は伏せられないので、答えはキャプション中の表記と揃える
//   （例：キャプション「バスティーユ襲撃」に対し、答えは「バスティーユ牢獄」ではなく「バスティーユ」＋本文側に「牢獄」）。
// ---------------------------------------------------------------------------

// 近世（絶対王政・主権国家体制）のカード。
// 三十年戦争とウェストファリア条約による主権国家体制の成立から、各国の絶対王政・啓蒙専制、英国の市民革命、
// オランダの独立と繁栄、スペインの盛衰までを扱う（c1・c6・c8 は旧「三十年戦争」の試作カードを改訂したもの）。
// region は Step 2 で作成予定のこの時代の地図（大航海時代・近世区分の1600年以降）の勢力IDとして使う名前で統一し、
// 各勢力に2問ずつ割り当てている：神聖ローマ帝国、オーストリア、プロイセン王国、ロシア帝国、フランス王国、イギリス、
// スペイン王国、オランダ。地図データを作るときは、この region と同じIDを勢力に付けること。
// レパントの海戦（1571年）とオランダ独立戦争（1568年〜）は、時代の担当年代（1600年〜）より前に始まるが、
// スペインの最盛期とオランダ独立の前提として、この時代のカードに含めている。
export const ABSOLUTISM_CARDS = [
  {
    id: "c76", year: 1571, difficulty: 1, era: "近世（絶対王政・主権国家体制）", region: "スペイン王国", theme: ["通史", "絶対王政"],
    front: "「太陽の沈まぬ国」の最盛期を築いたスペイン国王と、1571年にオスマン帝国の艦隊を破った海戦は？",
    back: "",
    cloze: {
      template: "スペイン国王{{1}}は、ポルトガルの王位も兼ねて「太陽の沈まぬ国」の最盛期を築き、1571年の{{2}}の海戦でオスマン帝国の艦隊を破った。しかし1588年、イギリス遠征に送った無敵艦隊（アルマダ）は大敗した。",
      slots: [
        { id: 1, answer: "フェリペ2世", category: "人物" },
        { id: 2, answer: "レパント", category: "海戦" },
      ],
      points: [
        { label: "原因", text: "父カール5世からスペイン本国・ネーデルラント・南イタリア・新大陸を受け継ぎ、新大陸の銀で莫大な富を得た" },
        { label: "経過", text: "熱心なカトリックとして新教徒を弾圧したためネーデルラントの反乱を招き、反乱を支援したイギリスとも対立した" },
        { label: "意義", text: "無敵艦隊の敗北後、相次ぐ戦争と銀の流入による物価高騰で国力は衰え、覇権はイギリス・オランダ・フランスへ移っていった" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Battle_of_Lepanto_1571.jpg/960px-Battle_of_Lepanto_1571.jpg", caption: "『レパントの海戦』（16世紀後半、作者不詳）",
        alt: "海面を埋め尽くすガレー船の大艦隊が、砲煙のなかで入り乱れて戦う場面",
        credit: "Battle of Lepanto 1571／作者不詳（16世紀後半）, National Maritime Museum, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Felipe_II_por_Sofonisba_Anguissola%2C_1573.jpg/960px-Felipe_II_por_Sofonisba_Anguissola%2C_1573.jpg", caption: "ソフォニスバ・アングイッソラ「フェリペ2世の肖像」（1573年、プラド美術館）",
        alt: "黒い服に白い襟を着け、帽子をかぶって立つ王の肖像",
        credit: "Felipe II／Sofonisba Anguissola（1573年）, Museo del Prado, Wikimedia Commons・Public domain" },
    ],
    anecdote: "豆知識：この海戦には、のちに『ドン・キホーテ』を書くセルバンテスも兵士として参加し、左腕の自由を失った。彼はこれを「レパントの片腕」と誇りにしたという。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/レパントの海戦",
  },
  {
    id: "c8", year: 1581, difficulty: 1, era: "近世（絶対王政・主権国家体制）", region: "オランダ", theme: ["通史", "絶対王政"],
    front: "スペインに反乱を起こしたネーデルラント北部の指導者と、1581年に独立を宣言して建てた国家は？",
    back: "",
    cloze: {
      template: "スペイン国王のカトリック強制と重税に対し、ネーデルラントの新教徒は1568年に反乱を起こした。北部7州は指導者{{1}}のもとで抵抗を続け、1581年に独立を宣言して{{2}}を建てた。",
      slots: [
        { id: 1, answer: "オラニエ公ウィレム", category: "人物" },
        { id: 2, answer: "ネーデルラント連邦共和国", category: "国家" },
      ],
      points: [
        { label: "原因", text: "毛織物業や商業で栄えたネーデルラントにはカルヴァン派（ゴイセン）が広まり、スペインの宗教弾圧と自治の否定に強く反発した" },
        { label: "経過", text: "カトリックの多い南部10州（現在のベルギー）はスペインに屈したが、北部は1609年の休戦で事実上の独立を得て、1648年の講和条約で国際的に承認された" },
        { label: "意義", text: "王を持たない共和国として独立した北部は、宗教的に寛容な商業国家となり、17世紀に経済・文化の黄金時代を迎えた" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Portrait_of_William_I%2C_Prince_of_Orange%2C_by_Adriaen_Thomasz_Key.jpg/960px-Portrait_of_William_I%2C_Prince_of_Orange%2C_by_Adriaen_Thomasz_Key.jpg", caption: "キー「オラニエ公ウィレムの肖像」（1579年頃）",
        alt: "白いひだ襟と黒い服を身に着け、厳しい表情でこちらを見る男性の肖像",
        credit: "William I, Prince of Orange／Adriaen Thomasz. Key（1579年頃）, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Veen%2C_Otto_van-The_Famished_People_after_the_Relief_of_the_Siege_of_Leiden-Rijksmuseum_SK-A-3911.jpg/960px-Veen%2C_Otto_van-The_Famished_People_after_the_Relief_of_the_Siege_of_Leiden-Rijksmuseum_SK-A-3911.jpg", caption: "オットー・ファン・フェーン『ライデン包囲の解放後、パンとニシンを配る人々』（1574年）",
        alt: "包囲から解放された町の広場で、飢えた市民たちにパンと魚が配られる場面",
        credit: "De uitdeling van haring en wittebrood na de opheffing van het beleg van Leiden／Otto van Veen（1574年）, Rijksmuseum, Wikimedia Commons・CC0" },
    ],
    anecdote: "豆知識：1574年、スペイン軍に包囲されたライデンでは、堤防を切って周囲を水没させ、救援の船を町に届けた。解放を記念して大学が創設され、今も10月3日にはパンとニシンを食べて祝う。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/八十年戦争",
  },
  {
    id: "c78", year: 1602, difficulty: 2, era: "近世（絶対王政・主権国家体制）", region: "オランダ", theme: ["通史", "絶対王政"],
    front: "1602年にオランダが設立し、アジア貿易を握った会社と、そのアジアの本拠地は？",
    back: "",
    cloze: {
      template: "17世紀のオランダは、1602年に設立した{{1}}を通じてアジアの香辛料貿易を握り、ジャワ島の{{2}}（現在のジャカルタ）を本拠地とした。",
      slots: [
        { id: 1, answer: "東インド会社", category: "会社" },
        { id: 2, answer: "バタヴィア", category: "都市" },
      ],
      points: [
        { label: "原因", text: "スペインから事実上独立したオランダは、造船業と海運業を背景に、ポルトガルに代わってアジアへ直接進出した" },
        { label: "経過", text: "会社は条約の締結や軍隊の保有も認められ、1623年のアンボイナ事件でイギリス勢力を香辛料諸島から締め出した" },
        { label: "意義", text: "アムステルダムは国際金融と中継貿易の中心となり、レンブラントらの絵画に代表される市民文化が花開いた" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Andries_Beeckman_-_The_Castle_of_Batavia.jpg/960px-Andries_Beeckman_-_The_Castle_of_Batavia.jpg", caption: "ベークマン『バタヴィア城』（1662年、アムステルダム国立美術館）",
        alt: "ヤシの木が立ち並ぶ水辺の向こうに、城壁と建物が広がるアジアの交易拠点",
        credit: "Het kasteel van Batavia／Andries Beeckman（1662年）, Rijksmuseum, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/The_Nightwatch_by_Rembrandt_-_Rijksmuseum.jpg/960px-The_Nightwatch_by_Rembrandt_-_Rijksmuseum.jpg", caption: "レンブラント『夜警』（1642年、アムステルダム国立美術館）",
        alt: "旗や槍を手にした市民の自警団が、隊長を中心に出動しようとする場面",
        credit: "De Nachtwacht／Rembrandt van Rijn（1642年）, Rijksmuseum, Wikimedia Commons・Public domain" },
    ],
    anecdote: "豆知識：江戸幕府の鎖国のもとで、オランダは長崎の出島での交易を許された唯一のヨーロッパの国だった。オランダ語の書物を通じた「蘭学」は、日本の近代化を準備した。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/オランダ東インド会社",
  },
  {
    id: "c6", year: 1618, difficulty: 1, era: "近世（絶対王政・主権国家体制）", region: "神聖ローマ帝国", theme: ["通史", "主権国家体制"],
    front: "1618年にベーメンの新教徒の反乱から始まった戦争と、新教側で参戦して活躍したスウェーデン王は？",
    back: "",
    cloze: {
      template: "1618年、ベーメン（ボヘミア）の新教徒が神聖ローマ皇帝のカトリック強制に反発して反乱を起こし、{{1}}が始まった。戦争は諸外国の介入で国際戦争となり、新教側で参戦したスウェーデン王{{2}}は各地で皇帝軍を破ったが、リュッツェンの戦いで戦死した。",
      slots: [
        { id: 1, answer: "三十年戦争", category: "戦争" },
        { id: 2, answer: "グスタフ・アドルフ", category: "人物" },
      ],
      points: [
        { label: "原因", text: "アウクスブルクの和議で認められなかったカルヴァン派の広がりと、皇帝によるカトリック化政策が対立を深めた" },
        { label: "経過", text: "デンマーク・スウェーデンに続き、カトリック国のフランスがハプスブルク家に対抗して新教側で参戦し、宗教戦争から国家間の勢力争いへと性格を変えた" },
        { label: "意義", text: "主な戦場となったドイツは荒廃して人口が激減し、その近代化が遅れる一因となった" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Prager.Fenstersturz.1618.jpg/960px-Prager.Fenstersturz.1618.jpg", caption: "プラハ窓外放出事件（1618年）を描いた銅版画",
        alt: "城の一室で、男たちが役人を窓の外へ投げ落とそうとする場面",
        credit: "Prager Fenstersturz 1618／Johann Philipp Abelinus『Theatrum Europaeum』所収, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Les_mis%C3%A8res_et_les_malheurs_de_la_guerre_-_11_-_La_pendaison.png/960px-Les_mis%C3%A8res_et_les_malheurs_de_la_guerre_-_11_-_La_pendaison.png", caption: "カロ『戦争の惨禍』より「絞首刑」（1633年）",
        alt: "大木の枝に多くの人々が吊るされ、その周りを兵士たちが取り囲む銅版画",
        credit: "Les Grandes Misères de la guerre「絞首刑」／Jacques Callot（1633年）, Wikimedia Commons・Public domain" },
    ],
    anecdote: "逸話：皇帝軍を率いた傭兵隊長ヴァレンシュタインは、占領地から税を取り立てて大軍を養った。その強大さを恐れた皇帝により、のちに暗殺された。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/三十年戦争",
  },
  {
    id: "c1", year: 1648, difficulty: 0, era: "近世（絶対王政・主権国家体制）", region: "神聖ローマ帝国", theme: ["通史", "主権国家体制"],
    front: "1648年に結ばれ、主権国家体制の出発点とされる講和条約と、このときオランダとともに独立が承認された国は？",
    back: "",
    cloze: {
      template: "1648年、ヨーロッパの大半を巻き込んだ宗教戦争の講和として{{1}}条約が結ばれた。神聖ローマ帝国内の諸侯（領邦）にはほぼ完全な主権が認められ、オランダと{{2}}の独立が国際的に承認された。",
      slots: [
        { id: 1, answer: "ウェストファリア", category: "条約" },
        { id: 2, answer: "スイス", category: "国名" },
      ],
      points: [
        { label: "原因", text: "長期化した戦争を終わらせるため、ミュンスターとオスナブリュックで、各国の代表が数年にわたる講和会議を開いた" },
        { label: "経過", text: "フランスはアルザスの一部を、スウェーデンは北ドイツの沿岸部を獲得した。カルヴァン派も公認され、帝国は事実上、多数の主権的な領邦の連合体となった" },
        { label: "意義", text: "教皇や皇帝の権威ではなく、主権を持つ国家どうしが対等な立場で外交を行う「主権国家体制」の出発点とされる" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Der_Friedensreiter_von_M%C3%BCnster.JPG/960px-Der_Friedensreiter_von_M%C3%BCnster.JPG", caption: "「ミュンスターの平和の使者」（1648年頃の木版画）",
        alt: "講和成立の報せを告げて駆ける「平和の使者」を描いた1648年の木版画",
        credit: "Der Friedensreiter von Münster／作者不詳（1648年頃）, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Westfaelischer_Friede_in_Muenster_%28Gerard_Terborch_1648%29.jpg/960px-Westfaelischer_Friede_in_Muenster_%28Gerard_Terborch_1648%29.jpg", caption: "テル・ボルフ「ミュンスター講和条約の批准」（1648年）",
        alt: "大広間で、各国の使節が手を挙げて条約の批准を誓う場面",
        credit: "The Ratification of the Treaty of Münster／Gerard ter Borch（1648年）, Wikimedia Commons・Public domain" },
    ],
    anecdote: "豆知識：交渉は戦時下での移動を伴い、約5年もの歳月を要した。当時としては異例の長期にわたる多国間の講和会議で、現代の国際会議の先駆けともいわれる。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ヴェストファーレン条約",
  },
  {
    id: "c74", year: 1649, difficulty: 1, era: "近世（絶対王政・主権国家体制）", region: "イギリス", theme: ["通史", "市民革命"],
    front: "ピューリタン革命で議会派を率いて国王軍を破った人物と、国王処刑後に成立した政体は？",
    back: "",
    cloze: {
      template: "議会を無視して専制を行ったチャールズ1世に対し、1642年に内戦が起こった。議会派の{{1}}が率いる鉄騎隊が王党派を破り、1649年に国王は処刑されて{{2}}が成立した。",
      slots: [
        { id: 1, answer: "クロムウェル", category: "人物" },
        { id: 2, answer: "共和政", category: "政体" },
      ],
      points: [
        { label: "原因", text: "1628年に議会が国王に認めさせた「権利の請願」を国王が無視し、議会を開かずに課税を続けた" },
        { label: "経過", text: "議会派の中心はピューリタン（イギリスのカルヴァン派）の地主や商工業者だった。彼はのちに護国卿となって独裁を行い、アイルランドを征服した" },
        { label: "意義", text: "国王を裁判にかけて処刑した、ヨーロッパ史上前例のない革命となった。厳格な独裁は反発を招き、彼の死後の1660年に王政が復活した" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Robert_Walker_-_Portrait_of_Oliver_Cromwell_%28c._1649%29.jpg/960px-Robert_Walker_-_Portrait_of_Oliver_Cromwell_%28c._1649%29.jpg", caption: "ウォーカー「オリヴァー・クロムウェルの肖像」（1649年頃）",
        alt: "甲冑を身に着けた軍人が、小姓に腰帯を結ばせている肖像",
        credit: "Portrait of Oliver Cromwell／Robert Walker（1649年頃）, National Portrait Gallery, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/The_Execution_of_Charles_I.jpg/960px-The_Execution_of_Charles_I.jpg", caption: "チャールズ1世の処刑（1649年、同時代の版画）",
        alt: "宮殿前の処刑台を、広場を埋めた群衆が取り囲む様子を描いた版画",
        credit: "The Execution of Charles I／作者不詳（1649年頃）, Wikimedia Commons・Public domain" },
    ],
    anecdote: "逸話：処刑の日は寒かったため、国王は「震えて民衆に恐れていると思われないように」と、シャツを2枚重ねて着たと伝えられる。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/清教徒革命",
  },
  {
    id: "c72", year: 1661, difficulty: 0, era: "近世（絶対王政・主権国家体制）", region: "フランス王国", theme: ["通史", "絶対王政"],
    front: "「朕は国家なり」と言ったとされるフランス王と、王の権力は神から授かったとする思想は？",
    back: "",
    cloze: {
      template: "「朕は国家なり」と言ったとされるフランス王{{1}}は、王の権力は神から授かったとする{{2}}を背景に絶対王政の最盛期を築き、パリ郊外に壮麗なヴェルサイユ宮殿を建てた。",
      slots: [
        { id: 1, answer: "ルイ14世", category: "人物" },
        { id: 2, answer: "王権神授説", category: "思想" },
      ],
      points: [
        { label: "原因", text: "幼くして即位した王は、貴族の反乱（フロンドの乱）を経験し、宰相の死後の1661年から自ら政治を行う親政を始めた" },
        { label: "経過", text: "財務総監コルベールが国内産業を保護・育成する重商主義政策で財政を支え、王は常備軍を率いてたびたび対外戦争を行った" },
        { label: "意義", text: "宮廷に貴族を集めて王に仕えさせる体制は各国の君主の手本となったが、度重なる戦争と宮廷の浪費が、のちの財政危機の原因となった" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Portrait_of_Louis_XIV_of_France_in_Coronation_Robes_%28by_Hyacinthe_Rigaud%29_-_Louvre_Museum.jpg/960px-Portrait_of_Louis_XIV_of_France_in_Coronation_Robes_%28by_Hyacinthe_Rigaud%29_-_Louvre_Museum.jpg", caption: "リゴー「ルイ14世の肖像」（1701年、ルーヴル美術館）",
        alt: "白貂の毛皮の付いた青い戴冠衣装をまとい、王笏を手に立つ王の全身像",
        credit: "Portrait de Louis XIV en costume de sacre／Hyacinthe Rigaud（1701年）, Musée du Louvre, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Vue_a%C3%A9rienne_du_domaine_de_Versailles_par_ToucanWings_-_Creative_Commons_By_Sa_3.0_-_113.jpg/960px-Vue_a%C3%A9rienne_du_domaine_de_Versailles_par_ToucanWings_-_Creative_Commons_By_Sa_3.0_-_113.jpg", caption: "ヴェルサイユ宮殿と庭園の空撮（パリ郊外）",
        alt: "左右対称に広がる広大な庭園と、その奥に一直線に延びる大運河を空から見た写真",
        credit: "Domaine de Versailles, vue aérienne／写真: ToucanWings（2013年）, Wikimedia Commons・CC BY-SA 3.0" },
    ],
    anecdote: "豆知識：王はバレエの名手で、若いころ太陽神アポロンの役を踊ったことなどから「太陽王」と呼ばれた。在位72年は、ヨーロッパの君主として最長記録の一つである。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ルイ14世_(フランス王)",
  },
  {
    id: "c66", year: 1683, difficulty: 2, era: "近世（絶対王政・主権国家体制）", region: "オーストリア", theme: ["通史", "絶対王政"],
    front: "第2次ウィーン包囲の撃退後、1699年にオーストリアがオスマン帝国と結んだ条約と、その条約で獲得した地域は？",
    back: "",
    cloze: {
      template: "1683年、オスマン帝国の大軍がハプスブルク家の都ウィーンを包囲したが（第2次ウィーン包囲）、ポーランド王らの援軍に撃退された。反攻に転じたオーストリアは、1699年の{{1}}条約で{{2}}を獲得し、東ヨーロッパの大国となった。",
      slots: [
        { id: 1, answer: "カルロヴィッツ", category: "条約" },
        { id: 2, answer: "ハンガリー", category: "地域" },
      ],
      points: [
        { label: "原因", text: "16世紀以来ハンガリーの大半を支配していたオスマン帝国が、ハプスブルク家の中心ウィーンの攻略をめざした" },
        { label: "経過", text: "ポーランド王ヤン3世ソビエスキの率いる援軍がオスマン軍を打ち破り、その後の反攻でオーストリア軍は失地を回復していった" },
        { label: "意義", text: "オスマン帝国が初めて大規模な領土を失った条約で、ヨーロッパとオスマン帝国の力関係が逆転する転機となった" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Vienna_Battle_1683.jpg/960px-Vienna_Battle_1683.jpg", caption: "ゲッフェルス「第2次ウィーン包囲（1683年）」（17世紀後半）",
        alt: "丘の上から見下ろした平原で、城壁都市を囲む大軍と援軍が激しく戦う場面",
        credit: "Battle of Vienna 1683／Frans Geffels（1683〜1694年頃）, Wien Museum, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/King_John_III_Sobieski_sending_Message_of_Victory_to_the_Pope%2C_after_the_Battle_of_Vienna_111.png/960px-King_John_III_Sobieski_sending_Message_of_Victory_to_the_Pope%2C_after_the_Battle_of_Vienna_111.png", caption: "マテイコ『ウィーンの勝利を教皇に伝えるソビエスキ』（1883年、ヴァチカン美術館）",
        alt: "戦場で馬上の王が、捕獲した軍旗とともに勝利の書状を使者に託す場面",
        credit: "Sobieski sending Message of Victory to the Pope／Jan Matejko（1883年）, Musei Vaticani, Wikimedia Commons・Public domain" },
    ],
    anecdote: "豆知識：包囲したオスマン軍が残していったコーヒー豆をきっかけに、ウィーンでカフェ文化が広まったという伝承がある。三日月形のパン（クロワッサン）も、このときの勝利にちなむという俗説がある。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/第二次ウィーン包囲",
  },
  {
    id: "c73", year: 1685, difficulty: 2, era: "近世（絶対王政・主権国家体制）", region: "フランス王国", theme: ["通史", "絶対王政"],
    front: "1598年にアンリ4世が新教徒に信仰の自由を認めた法令と、1685年のその廃止で国外へ亡命した新教徒の呼び名は？",
    back: "",
    cloze: {
      template: "1598年、アンリ4世は{{1}}を出して新教徒に信仰の自由を認め、宗教戦争を終わらせた。しかし1685年に国王がこれを廃止すると、商工業者の多い{{2}}が大量に国外へ亡命し、フランスの産業は大きな打撃を受けた。",
      slots: [
        { id: 1, answer: "ナントの勅令", category: "法令" },
        { id: 2, answer: "ユグノー", category: "新教徒" },
      ],
      points: [
        { label: "原因", text: "16世紀後半のフランスでは、カトリックとカルヴァン派新教徒の内戦が約30年続き、1572年にはサン・バルテルミの虐殺が起こった" },
        { label: "経過", text: "新教徒から改宗したアンリ4世はブルボン朝を開いて国内を安定させたが、のちの国王は「一つの王、一つの法、一つの信仰」を掲げて廃止に踏み切った" },
        { label: "意義", text: "亡命した新教徒はオランダ・イギリス・プロイセンなどに移り住み、その技術と資本が亡命先の産業発展に貢献した" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Fran%C3%A7ois_Dubois_-_Le_massacre_de_la_Saint-Barth%C3%A9lemy_-_729_-DUBOIS_num4000_nr.jpg/960px-Fran%C3%A7ois_Dubois_-_Le_massacre_de_la_Saint-Barth%C3%A9lemy_-_729_-DUBOIS_num4000_nr.jpg", caption: "デュボワ『サン・バルテルミの虐殺』（16世紀後半）",
        alt: "パリの街路や川岸のあちこちで、市民が武器を持った人々に襲われている場面",
        credit: "Le massacre de la Saint-Barthélemy／François Dubois（1572〜1584年頃）, Musée cantonal des Beaux-Arts de Lausanne, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Pourbus%2C_Frans_-_Official_portrait_of_Henry_IV_as_King_of_France.jpg/960px-Pourbus%2C_Frans_-_Official_portrait_of_Henry_IV_as_King_of_France.jpg", caption: "プルビュス「アンリ4世の肖像」（1610年頃）",
        alt: "百合の紋章が描かれた青いマントをまとい、王笏を手に立つ王の肖像",
        credit: "Henri IV, roi de France／Frans Pourbus le Jeune（1610年頃）, Wikimedia Commons・Public domain" },
    ],
    anecdote: "名言：新教徒だったアンリ4世はパリに入るためカトリックに改宗し、「パリはミサに値する」と言ったと伝えられる。また「日曜日にはどの農民の鍋にも鶏を」と国民の生活向上を願ったことでも知られる。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ナントの勅令",
  },
  {
    id: "c75", year: 1689, difficulty: 1, era: "近世（絶対王政・主権国家体制）", region: "イギリス", theme: ["通史", "市民革命"],
    front: "1688年に議会がカトリックの国王を追放して新国王を迎えた無血の政変と、翌年に制定された法は？",
    back: "",
    cloze: {
      template: "1688年、カトリックの復活をめざすジェームズ2世を議会が追放し、オランダ総督ウィレム3世とその妻メアリ2世を共同の王に迎えた（{{1}}）。翌年、議会の承認なしの課税や法律の停止を禁じる{{2}}が制定され、立憲王政の基礎が築かれた。",
      slots: [
        { id: 1, answer: "名誉革命", category: "政変" },
        { id: 2, answer: "権利の章典", category: "法" },
      ],
      points: [
        { label: "原因", text: "王政復古後の国王たちがカトリックの復活と専制を図り、議会の中の二つの党派（トーリ党・ホイッグ党）がともに反発した" },
        { label: "経過", text: "ほとんど血を流すことなく王が交代し、新国王は議会が示した「権利の宣言」を認めて即位した" },
        { label: "意義", text: "「王は君臨すれども統治せず」とされる議会主権の原則が確立し、18世紀には内閣が議会に責任を負う責任内閣制が生まれた" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/William_III_Landing_at_Brixham%2C_Torbay%2C_5_November_1688.jpg/960px-William_III_Landing_at_Brixham%2C_Torbay%2C_5_November_1688.jpg", caption: "ヤン・ウィック『ブリクサムに上陸するウィレム3世』（1688年）",
        alt: "海岸に上陸した白馬の騎士が、帽子を掲げて人々の歓迎に応える場面",
        credit: "William III Landing at Brixham, Torbay, 5 November 1688／Jan Wyck（1688年）, National Maritime Museum, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Charger_with_double_portrait_of_William_III_and_Mary_II_MET_DP-1687-007.jpg/960px-Charger_with_double_portrait_of_William_III_and_Mary_II_MET_DP-1687-007.jpg", caption: "ウィレム3世とメアリ2世の肖像を描いたデルフト焼の大皿（1690年頃、メトロポリタン美術館）",
        alt: "王冠の下に並ぶ国王夫妻の横顔を、青い絵付けで描いた陶器の大皿",
        credit: "Charger with double portrait of William III and Mary II／作者不詳（1690年頃）, The Metropolitan Museum of Art, Wikimedia Commons・CC0" },
    ],
    anecdote: "豆知識：新国王はオランダ総督を兼ねたため、イギリスとオランダは同じ君主を戴くことになった。英語の「ジン」は、このころオランダから伝わった蒸留酒「ジェネヴァ」が由来とされる。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/名誉革命",
  },
  {
    id: "c70", year: 1703, difficulty: 0, era: "近世（絶対王政・主権国家体制）", region: "ロシア帝国", theme: ["通史", "絶対王政"],
    front: "西欧化改革を進めたロシアの皇帝と、彼がスウェーデンを破ってバルト海に進出した戦争は？",
    back: "",
    cloze: {
      template: "ロシアの{{1}}は、自ら使節団に加わって西欧を視察し、技術や制度を取り入れる近代化を進めた。{{2}}でスウェーデンを破ってバルト海に進出し、その沿岸に新首都サンクトペテルブルクを建設した。",
      slots: [
        { id: 1, answer: "ピョートル1世", category: "人物" },
        { id: 2, answer: "北方戦争", category: "戦争" },
      ],
      points: [
        { label: "原因", text: "西欧に比べて技術や軍事で大きく遅れていたロシアには、凍らない海への出口と近代的な軍隊が必要だった" },
        { label: "経過", text: "オランダの造船所で自ら職人として働いたとも伝えられる。帰国後は軍隊・行政・教育を改革し、貴族に西欧風の服装を強制した" },
        { label: "意義", text: "ロシアはヨーロッパの大国の一員となり、新首都は「西欧への窓」として以後200年余りロシアの都であり続けた" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Hamburg%2C_Kunsthalle%2C_Paul_Delaroche%2C_Bildnis_Peter_der_Gro%C3%9Fe.jpg/960px-Hamburg%2C_Kunsthalle%2C_Paul_Delaroche%2C_Bildnis_Peter_der_Gro%C3%9Fe.jpg", caption: "ドラローシュ「ピョートル1世の肖像」（1838年、ハンブルク美術館）",
        alt: "勲章の青い綬を掛けた軍服姿で、大砲に手をかけて立つ皇帝の肖像",
        credit: "Bildnis Peter der Große／Paul Delaroche（1838年）, Hamburger Kunsthalle, 写真: Dguendel, Wikimedia Commons・CC BY 4.0" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Peter_%26_Paul_fortress_in_SPB_03.jpg/960px-Peter_%26_Paul_fortress_in_SPB_03.jpg", caption: "サンクトペテルブルクのペトロパヴロフスク要塞（1703年着工）",
        alt: "川の対岸に、金色の尖塔をもつ大聖堂と城壁が横に長く延びる景色",
        credit: "Peter and Paul Fortress／写真: Florstein（2019年）, Wikimedia Commons・CC BY-SA 4.0" },
    ],
    anecdote: "豆知識：皇帝は貴族に西欧風の身なりを求め、伝統的なあごひげを切らせた。ひげを残したい者には「ひげ税」を課し、納めた証明のメダルを持ち歩かせたという。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ピョートル1世",
  },
  {
    id: "c77", year: 1713, difficulty: 3, era: "近世（絶対王政・主権国家体制）", region: "スペイン王国", theme: ["通史", "絶対王政"],
    front: "スペイン＝ハプスブルク家の断絶後、フランス王の孫の即位をめぐって起こった戦争と、それを終わらせた条約は？",
    back: "",
    cloze: {
      template: "スペイン＝ハプスブルク家が断絶し、フランス王の孫がフェリペ5世として即位すると、フランスの強大化を恐れたイギリス・オランダ・オーストリアとの間で{{1}}が起こった。1713年の{{2}}条約で、フランスと合同しないことを条件に即位が認められた。",
      slots: [
        { id: 1, answer: "スペイン継承戦争", category: "戦争" },
        { id: 2, answer: "ユトレヒト", category: "条約" },
      ],
      points: [
        { label: "原因", text: "子のいないスペイン王カルロス2世が、遺言でフランスのブルボン家の王子を後継者に指名した" },
        { label: "経過", text: "ヨーロッパの勢力均衡が崩れることを恐れた諸国が同盟し、戦いは北アメリカの植民地にも広がった" },
        { label: "意義", text: "スペインにブルボン朝が成立した一方、イギリスはジブラルタルや北アメリカの領土を獲得し、海上と植民地での覇権を強めた" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Hyacinthe_Rigaud_-_Philippe_V%2C_roi_d%27Espagne_%281683-1746%29_-_Google_Art_Project.jpg/960px-Hyacinthe_Rigaud_-_Philippe_V%2C_roi_d%27Espagne_%281683-1746%29_-_Google_Art_Project.jpg", caption: "リゴー「フェリペ5世の肖像」（1701年頃）",
        alt: "黒い衣装に勲章を下げ、マントを掛けた椅子の傍らに立つ若い王の全身像",
        credit: "Philippe V, roi d'Espagne／Hyacinthe Rigaud（1701年頃）, Château de Versailles, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Rock-of-Gibraltar-2011.jpg/960px-Rock-of-Gibraltar-2011.jpg", caption: "ジブラルタルの岩山（ユトレヒト条約でイギリス領となった）",
        alt: "青い海に面して切り立つ、白っぽい石灰岩の巨大な岩山",
        credit: "Rock of Gibraltar／写真: Acediscovery（2011年）, Wikimedia Commons・CC BY 4.0" },
    ],
    anecdote: "豆知識：地中海の入口を押さえるジブラルタルは、この条約以来、現在までイギリス領であり続けている。スペインは今も返還を求めている。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/スペイン継承戦争",
  },
  {
    id: "c67", year: 1740, difficulty: 1, era: "近世（絶対王政・主権国家体制）", region: "オーストリア", theme: ["通史", "絶対王政"],
    front: "1740年にハプスブルク家の家督を継いだ女性の君主と、彼女が宿敵フランスと結んだ同盟の転換の呼び名は？",
    back: "",
    cloze: {
      template: "1740年、ハプスブルク家の家督を継いだ{{1}}に対し、プロイセンなどが女性の相続に異議を唱えてオーストリア継承戦争が起こった。彼女は失地を取り戻すため、長年の宿敵フランスと同盟を結ぶ{{2}}を行い、七年戦争に臨んだ。",
      slots: [
        { id: 1, answer: "マリア・テレジア", category: "人物" },
        { id: 2, answer: "外交革命", category: "外交" },
      ],
      points: [
        { label: "原因", text: "父である皇帝カール6世は、娘に全領土を相続させる取り決めを各国に認めさせていたが、皇帝の死後に周辺諸国がこれを無視した" },
        { label: "経過", text: "戦争で豊かな領土を奪われた彼女は、それまで敵対してきたフランス、さらにロシアと結んで包囲網を築いた" },
        { label: "意義", text: "国内では行政・財政・教育の改革を進めて国家を立て直し、「国母」として慕われた。息子のヨーゼフ2世は啓蒙思想にもとづく改革をさらに推し進めた" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Portrait_of_Maria_Theresia_by_workshop_of_Martin_Mytens_%28II%29_780.jpg/960px-Portrait_of_Maria_Theresia_by_workshop_of_Martin_Mytens_%28II%29_780.jpg", caption: "マイテンス工房「マリア・テレジアの肖像」（18世紀半ば）",
        alt: "宝石の冠や王笏が置かれた卓の傍らで、レースの豪華なドレスをまとって座る女性君主の肖像",
        credit: "Portrait of Maria Theresia／workshop of Martin van Meytens（1745〜1770年頃）, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Schoenbrunn_Palace_as_seen_from_Neptune_Fountain%2C_September_2016.jpg/960px-Schoenbrunn_Palace_as_seen_from_Neptune_Fountain%2C_September_2016.jpg", caption: "シェーンブルン宮殿（ウィーン、18世紀半ばに改築）",
        alt: "噴水の向こうの広大な庭園と、その奥に横長に延びる黄色い宮殿",
        credit: "Schönbrunn Palace／写真: Martin Falbisoner（2016年）, Wikimedia Commons・CC BY-SA 4.0" },
    ],
    anecdote: "豆知識：16人の子をもうけ、末娘のマリー・アントワネットはフランス王ルイ16世に嫁いだ。この結婚も、フランスとの同盟を固めるための政略結婚だった。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/マリア・テレジア",
  },
  {
    id: "c68", year: 1745, difficulty: 1, era: "近世（絶対王政・主権国家体制）", region: "プロイセン王国", theme: ["通史", "絶対王政"],
    front: "オーストリア継承戦争に乗じて資源豊かな地方を奪ったプロイセン王と、その地方は？",
    back: "",
    cloze: {
      template: "プロイセン王{{1}}（大王）は、オーストリア継承戦争に乗じて、鉱産資源や毛織物業で豊かな{{2}}を奪った。続く七年戦争では周囲の大国を相手に苦戦しながらも、この地を守り抜いた。",
      slots: [
        { id: 1, answer: "フリードリヒ2世", category: "人物" },
        { id: 2, answer: "シュレジエン", category: "地方" },
      ],
      points: [
        { label: "原因", text: "父の「兵隊王」が育てた強力な常備軍と、蓄えられた豊かな財政を受け継いで即位した" },
        { label: "経過", text: "七年戦争ではフランス・ロシアを含む包囲網に苦しみ、首都ベルリンを一時占領されたが、ロシアの皇帝が交代して戦線を離脱したことで救われた" },
        { label: "意義", text: "プロイセンはオーストリアと並ぶドイツの大国に成長し、のちのドイツ統一の中心となる基盤を築いた" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Friedrich_der_Gro%C3%9Fe_%281781_or_1786%29_-_Google_Art_Project.jpg/960px-Friedrich_der_Gro%C3%9Fe_%281781_or_1786%29_-_Google_Art_Project.jpg", caption: "アントン・グラフ「フリードリヒ2世の肖像」（1781年頃）",
        alt: "勲章の星を胸に着けた青い軍服姿の、年老いた王の肖像",
        credit: "Friedrich der Große／Anton Graff（1781〜1786年頃）, Schloss Sanssouci, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/1860_Menzel_Ansprache_Friedrich_des_Gro%C3%9Fen_vor_der_Schlacht_bei_Leuthen_anagoria.JPG/960px-1860_Menzel_Ansprache_Friedrich_des_Gro%C3%9Fen_vor_der_Schlacht_bei_Leuthen_anagoria.JPG", caption: "メンツェル『ロイテンの戦いを前にした国王の訓示』（1860年、ベルリン旧国立美術館）",
        alt: "雪の中、三角帽をかぶった将軍たちに囲まれて、国王が語りかける場面",
        credit: "Ansprache Friedrichs des Großen an seine Generale vor der Schlacht bei Leuthen／Adolph Menzel（1860年）, Alte Nationalgalerie, Wikimedia Commons・Public domain" },
    ],
    anecdote: "豆知識：王はジャガイモの栽培を広めようと、王領の畑を兵士にわざと厳重に見張らせ、「価値のある作物だ」と思わせて農民に広めたという逸話がある。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/フリードリヒ2世_(プロイセン王)",
  },
  {
    id: "c69", year: 1750, difficulty: 3, era: "近世（絶対王政・主権国家体制）", region: "プロイセン王国", theme: ["通史", "絶対王政"],
    front: "プロイセンで将校として軍を支えた地主貴族と、啓蒙思想を取り入れて上からの近代化を進めた君主の呼び名は？",
    back: "",
    cloze: {
      template: "プロイセンでは、東部の農場を経営する地主貴族である{{1}}が、将校として軍を支え、農民を支配した。18世紀後半の国王は「君主は国家第一の僕」と称し、啓蒙思想を取り入れて上からの近代化を進める{{2}}の典型とされた。",
      slots: [
        { id: 1, answer: "ユンカー", category: "身分" },
        { id: 2, answer: "啓蒙専制君主", category: "君主の型" },
      ],
      points: [
        { label: "原因", text: "市民層が未成熟だった東ヨーロッパでは、君主が自ら主導して産業の育成や制度の改革を進める必要があった" },
        { label: "経過", text: "国王はフランスの思想家ヴォルテールを宮廷に招いて交流し、宗教的寛容や拷問の廃止、産業の振興を進めた" },
        { label: "意義", text: "改革は君主の権力を強めるためのもので、地主貴族の特権や農民の隷属はそのまま残され、近代化には限界があった" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Adolph_Menzel_-_Fl%C3%B6tenkonzert_Friedrichs_des_Gro%C3%9Fen_in_Sanssouci_-_Google_Art_Project.jpg/960px-Adolph_Menzel_-_Fl%C3%B6tenkonzert_Friedrichs_des_Gro%C3%9Fen_in_Sanssouci_-_Google_Art_Project.jpg", caption: "メンツェル『サンスーシ宮殿のフルート演奏会』（1852年、ベルリン旧国立美術館）",
        alt: "シャンデリアの灯る広間で、国王がフルートを吹き、宮廷の人々が耳を傾ける場面",
        credit: "Flötenkonzert in Sanssouci／Adolph Menzel（1850〜1852年）, Alte Nationalgalerie, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Aerial_image_of_Sanssouci_%28view_from_the_south%29.jpg/960px-Aerial_image_of_Sanssouci_%28view_from_the_south%29.jpg", caption: "サンスーシ宮殿とぶどう畑の段丘（ポツダム、1747年完成）",
        alt: "階段状に連なるぶどう畑の段丘の上に、平屋の宮殿が建つ様子を空から見た写真",
        credit: "Aerial image of Sanssouci／写真: Carsten Steger, Wikimedia Commons・CC BY-SA 4.0" },
    ],
    anecdote: "豆知識：「サンスーシ」はフランス語で「憂いのない」という意味。国王はこの宮殿でフランス語を話し、フルートを演奏して作曲もする教養人だった。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/啓蒙専制君主",
  },
  {
    id: "c71", year: 1772, difficulty: 1, era: "近世（絶対王政・主権国家体制）", region: "ロシア帝国", theme: ["通史", "絶対王政"],
    front: "18世紀後半に農奴制を強化しつつ領土を広げたロシアの女帝と、彼女がプロイセン・オーストリアとともに行った領土分割は？",
    back: "",
    cloze: {
      template: "18世紀後半、ロシアの女帝{{1}}は啓蒙思想に関心を示しつつ農奴制を強化し、プガチョフの農民反乱を鎮圧した。対外的には黒海北岸に進出し、プロイセン・オーストリアとともに3回にわたる{{2}}を行った。",
      slots: [
        { id: 1, answer: "エカチェリーナ2世", category: "人物" },
        { id: 2, answer: "ポーランド分割", category: "領土分割" },
      ],
      points: [
        { label: "原因", text: "ドイツ出身の皇后だった彼女は、夫の皇帝をクーデタで退位させて即位し、貴族の支持を固める必要があった" },
        { label: "経過", text: "オスマン帝国との戦争でクリミア半島を獲得して黒海への出口を得た。1772・93・95年の分割で隣国は地図から消えた" },
        { label: "意義", text: "ロシアは東ヨーロッパ最大の強国となった一方、農奴制の強化は国内の矛盾を深めた" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Catherine_II_walking_by_V.Borovikovskiy_%281794%2C_Tretyakov_gallery%29.jpg/960px-Catherine_II_walking_by_V.Borovikovskiy_%281794%2C_Tretyakov_gallery%29.jpg", caption: "ボロヴィコフスキー「ツァールスコエ・セローの公園を散歩するエカチェリーナ2世」（1794年）",
        alt: "青いコートを着て犬を連れ、公園の木立の中を散歩する年配の女性",
        credit: "Catherine II walking in Tsarskoye Selo park／Vladimir Borovikovsky（1794年）, Tretyakov Gallery, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Winter_Palace_Panorama_4.jpg/960px-Winter_Palace_Panorama_4.jpg", caption: "冬宮（現在のエルミタージュ美術館、18世紀半ば完成）",
        alt: "川岸に横長に延びる、白い柱と緑の壁をもつバロック様式の宮殿",
        credit: "Winter Palace／写真: Florstein（2016年）, Wikimedia Commons・CC BY-SA 4.0" },
    ],
    anecdote: "豆知識：1791年、漂流してロシアに渡った日本の船頭・大黒屋光太夫はこの女帝に謁見して帰国を願い出た。翌年、彼を送り届けるためにロシア使節ラクスマンが根室に来航した。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/エカチェリーナ2世",
  },
];

// 市民革命と国民国家（1789〜1871年頃）のカード。
// フランス革命（1789〜1799年）とナポレオン時代（1799〜1815年）を中心に、ウィーン体制・国民国家の形成までを扱う。
// region は地図の時代区分 "revolutions" の勢力ID（1812／1815／1871年のスナップショット）に合わせ、
// 勢力タップで該当カードが引けるようにしている。厳密な当時の国号ではなく「地図上でどの勢力に紐づけるか」を表す
// （例：1789〜1795年のフランス国内の出来事は1815年の「フランス王国」、ナポレオン期は1812年の「フランス帝国」）。
export const FRENCH_REVOLUTION_CARDS = [
  {
    id: "c17", year: 1789, difficulty: 0, era: "近代（市民革命と国民国家）", region: "フランス王国", theme: ["通史", "フランス革命"],
    front: "1789年7月14日、パリの民衆が襲撃し、フランス革命の発端となった施設は？",
    back: "",
    cloze: {
      template: "1789年7月14日、パリの民衆は国王の軍隊集結と、改革派の財務総監{{1}}の罷免に反発して武器を求め、圧政の象徴とされた{{2}}牢獄を襲撃した。",
      slots: [
        { id: 1, answer: "ネッケル", category: "人物" },
        { id: 2, answer: "バスティーユ", category: "施設" },
      ],
      points: [
        { label: "原因", text: "財政危機打開のため招集された三部会で第三身分が国民議会を結成し、国王がこれを武力で抑え込もうとした" },
        { label: "経過", text: "襲撃の報が地方に伝わると農民蜂起（大恐怖）が広がり、8月4日に国民議会は封建的特権の廃止を決議した" },
        { label: "意義", text: "民衆が直接行動で王権に対抗した最初の事件となり、革命が議会の外へ広がる転機となった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Prise_de_la_Bastille_clean.jpg/960px-Prise_de_la_Bastille_clean.jpg",
        caption: "ウエル「バスティーユ襲撃」（1789年）",
        alt: "煙に包まれたバスティーユ牢獄の城塞に、民衆が押し寄せる様子を描いた水彩画",
        credit: "Prise de la Bastille／Jean-Pierre Houël（1789年）, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Charles_Th%C3%A9venin_-_Prise_de_la_Bastille%2C_le_14_juillet_1789_-_P572_-_Mus%C3%A9e_Carnavalet.jpg/960px-Charles_Th%C3%A9venin_-_Prise_de_la_Bastille%2C_le_14_juillet_1789_-_P572_-_Mus%C3%A9e_Carnavalet.jpg",
        caption: "テヴナン「バスティーユ襲撃、1789年7月14日」（1793年）",
        alt: "バスティーユの城門前で、武器を手にした民衆と守備兵が入り乱れて戦う場面を描いた油彩画",
        credit: "Prise de la Bastille, le 14 juillet 1789／Charles Thévenin（1793年）, Musée Carnavalet, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：襲撃の時点でバスティーユに収監されていたのはわずか7人だった。7月14日は現在もフランスの国民祭典（革命記念日）として祝われている。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/バスティーユ襲撃",
  },
  {
    id: "c18", year: 1789, difficulty: 1, era: "近代（市民革命と国民国家）", region: "フランス王国", theme: ["通史", "フランス革命"],
    front: "1789年8月に国民議会が採択した人権宣言は、誰が起草し、どのような原理を掲げたか？",
    back: "",
    cloze: {
      template: "1789年8月、国民議会は{{1}}らが起草した人権宣言（人間および市民の権利の宣言）を採択し、人間の自由と権利における平等、{{2}}、所有権の不可侵などを掲げた。",
      slots: [
        { id: 1, answer: "ラファイエット", category: "人物" },
        { id: 2, answer: "国民主権", category: "原理" },
      ],
      points: [
        { label: "原因", text: "テニスコートの誓いで憲法制定まで解散しないと誓った国民議会が、新しい国家の基本原理を示す必要があった" },
        { label: "経過", text: "アメリカ独立宣言や啓蒙思想（ロック、ルソーら）の影響を受けて起草され、のちの1791年憲法の前文となった" },
        { label: "意義", text: "身分制社会を否定し、近代市民社会の基本原理を示した文書として、各国の憲法や人権思想に大きな影響を与えた" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Gilbert_du_Motier_Marquis_de_Lafayette.jpg/960px-Gilbert_du_Motier_Marquis_de_Lafayette.jpg",
        caption: "コート「ラファイエット侯爵の肖像」（1834年）",
        alt: "軍服姿で書類を手に立つラファイエット侯爵の全身像",
        credit: "Gilbert du Motier, Marquis de Lafayette／Joseph-Désiré Court（1834年）, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Le_Serment_du_Jeu_de_paume.jpg/960px-Le_Serment_du_Jeu_de_paume.jpg",
        caption: "ダヴィッド「テニスコートの誓い」（1791年、素描）",
        alt: "球戯場に集まった第三身分の議員たちが、一斉に手を挙げて誓いを立てる場面の素描",
        credit: "Le Serment du Jeu de paume／Jacques-Louis David（1791年）, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "逸話：ラファイエットはアメリカ独立戦争に義勇兵として参加し、ワシントンと親交を結んだ「両世界の英雄」。宣言の草案作成では駐仏アメリカ公使ジェファソンの助言も受けた。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/人間と市民の権利の宣言",
  },
  {
    id: "c20", year: 1792, difficulty: 3, era: "近代（市民革命と国民国家）", region: "フランス王国", theme: ["通史", "フランス革命"],
    front: "ヴァルミーの戦い（1792年）の勝利は、フランスの政体にどのような変化をもたらしたか？",
    back: "",
    cloze: {
      template: "1792年4月、フランスは{{1}}に宣戦して革命戦争が始まった。9月のヴァルミーの戦いで義勇兵を含むフランス軍がプロイセン軍を退けると、同じ日に開会した国民公会は翌日に王政の廃止を宣言し、{{2}}が成立した。",
      slots: [
        { id: 1, answer: "オーストリア", category: "国名" },
        { id: 2, answer: "第一共和政", category: "政体" },
      ],
      points: [
        { label: "原因", text: "ルイ16世一家の国外逃亡未遂（ヴァレンヌ逃亡事件）で王への信頼が失墜し、周辺諸国も革命への干渉を強めた" },
        { label: "経過", text: "8月10日事件で王権が停止され、男子普通選挙で選ばれた国民公会が成立。翌1793年1月にルイ16世は処刑された" },
        { label: "意義", text: "市民からなる軍隊が君主国の正規軍を退けたことで、「国民が国を守る」という国民国家の意識が芽生えた" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Valmy_Battle_painting.jpg/960px-Valmy_Battle_painting.jpg",
        caption: "オラース・ヴェルネ「ヴァルミーの戦い」（1826年）",
        alt: "風車の立つ丘の上で、砲煙のなかフランス軍が隊列を組んでプロイセン軍と対峙する場面",
        credit: "La Bataille de Valmy／Horace Vernet（1826年）, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "名言：プロイセン軍に従軍していた文豪ゲーテは、この戦いを目にして「ここから、そしてこの日から、世界史の新しい時代が始まる」と記した。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ヴァルミーの戦い",
  },
  {
    id: "c21", year: 1795, difficulty: 4, era: "近代（市民革命と国民国家）", region: "フランス王国", theme: ["通史", "フランス革命"],
    front: "恐怖政治の終わりから総裁政府の成立までの流れと、総裁政府が不安定だった理由は？",
    back: "",
    cloze: {
      template: "1794年の{{1}}のクーデタでロベスピエールらジャコバン派が打倒されて恐怖政治は終わり、翌1795年に制定された新憲法のもとで、5人の総裁からなる{{2}}が成立した。",
      slots: [
        { id: 1, answer: "テルミドール", category: "事件" },
        { id: 2, answer: "総裁政府", category: "政府" },
      ],
      points: [
        { label: "原因", text: "公安委員会を中心とするジャコバン派の独裁と、反対派を次々に処刑した恐怖政治に、議会内外で反発が強まった" },
        { label: "経過", text: "財産資格による制限選挙が復活し、王党派の反乱や私有財産廃止を唱えるバブーフの陰謀など、左右両派の揺さぶりが続いた" },
        { label: "意義", text: "政府が反乱の鎮圧を軍に頼るようになり、軍人ナポレオンが台頭する土台がつくられた" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Jean-Joseph-Fran%C3%A7ois_Tassaert_-_La_Nuit_du_9_au_10_thermidor_an_II%2C_Arrestation_de_Robespierre.jpg/960px-Jean-Joseph-Fran%C3%A7ois_Tassaert_-_La_Nuit_du_9_au_10_thermidor_an_II%2C_Arrestation_de_Robespierre.jpg",
        caption: "タサール（アリエ原画）「テルミドール9日から10日の夜、ロベスピエールの逮捕」（1796年頃）",
        alt: "松明に照らされた議場で、負傷したロベスピエールらが兵士に取り押さえられる場面",
        credit: "La Nuit du 9 au 10 thermidor an II, Arrestation de Robespierre／Jean-Joseph-François Tassaert（Fulchran-Jean Harriet原画、1796年頃）, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Robespierre.jpg/960px-Robespierre.jpg",
        caption: "「ロベスピエールの肖像」（1790年頃、作者不詳）",
        alt: "髪粉をつけたかつらに縞柄の上着姿で正面を向くロベスピエールの肖像",
        credit: "Portrait of Maximilien Robespierre／作者不詳（1790年頃）, Musée Carnavalet, Wikimedia Commons・CC0",
      },
    ],
    anecdote: "逸話：1795年10月、パリで起きた王党派の反乱（ヴァンデミエール13日事件）を大砲で鎮圧したのが、当時26歳のナポレオンだった。これを機に彼は国内軍司令官に抜擢される。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/総裁政府",
  },
  {
    id: "c22", year: 1799, difficulty: 2, era: "近代（市民革命と国民国家）", region: "フランス帝国", theme: ["通史", "ナポレオン"],
    front: "1799年、ナポレオンが総裁政府を倒して権力を握ったクーデタと、その後に就いた地位は？",
    back: "",
    cloze: {
      template: "1799年、エジプト遠征から帰国したナポレオンは{{1}}で政権を倒して統領政府を樹立し、自ら{{2}}に就任して実権を握った。",
      slots: [
        { id: 1, answer: "ブリュメール18日のクーデタ", category: "事件" },
        { id: 2, answer: "第一統領", category: "官職" },
      ],
      points: [
        { label: "原因", text: "第2回対仏大同盟による対外危機と、革命政府の政情不安を前に、有産市民層が強力な指導者による安定を望んだ" },
        { label: "経過", text: "1802年にイギリスとアミアンの和約を結んで一時的な平和を実現し、国民投票で終身統領となった" },
        { label: "意義", text: "ナポレオンは「革命は終わった」と宣言。革命の成果を守りつつ、軍事的英雄に権力が集中する体制へ移行した" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Bouchot_-_Le_general_Bonaparte_au_Conseil_des_Cinq-Cents.jpg/960px-Bouchot_-_Le_general_Bonaparte_au_Conseil_des_Cinq-Cents.jpg",
        caption: "ブーショ「サン＝クルーの五百人会に臨むボナパルト将軍」（1840年）",
        alt: "赤い法服の議員たちが詰め寄るなか、擲弾兵に守られて議場を去るボナパルト将軍",
        credit: "Le général Bonaparte au Conseil des Cinq-Cents, à Saint-Cloud／François Bouchot（1840年）, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/David_-_Napoleon_crossing_the_Alps_-_Malmaison2.jpg/960px-David_-_Napoleon_crossing_the_Alps_-_Malmaison2.jpg",
        caption: "ダヴィッド「サン＝ベルナール峠を越えるボナパルト」（1801年）",
        alt: "後ろ足で立ち上がる白馬にまたがり、アルプスの峠で前方を指さす第一統領ボナパルト",
        credit: "Bonaparte franchissant le Grand-Saint-Bernard／Jacques-Louis David（1801年）, Château de Malmaison, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "逸話：クーデタ2日目、五百人会の議場に乗り込んだナポレオンは議員たちに詰め寄られて窮地に陥ったが、議長を務めていた弟リュシアンの機転で軍が突入し、議会は解散させられた。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ブリュメール18日のクーデター",
  },
  {
    id: "c19", year: 1804, difficulty: 1, era: "近代（市民革命と国民国家）", region: "フランス帝国", theme: ["通史", "ナポレオン"],
    front: "1804年、ナポレオンが公布した法典と、同年に開いた新しい体制は？",
    back: "",
    cloze: {
      template: "1804年、ナポレオンは法の前の平等や私有財産の不可侵を定めた{{1}}を公布し、同年、国民投票を経て皇帝に即位して{{2}}を開いた。",
      slots: [
        { id: 1, answer: "ナポレオン法典", category: "法典" },
        { id: 2, answer: "第一帝政", category: "政体" },
      ],
      points: [
        { label: "原因", text: "対外戦争の勝利と国内の安定で圧倒的な人気を得たナポレオンが、権力の世襲化と体制の永続化を図った" },
        { label: "経過", text: "12月、パリのノートルダム大聖堂で、教皇ピウス7世の臨席のもと戴冠式が行われた" },
        { label: "意義", text: "法典（フランス民法典）は革命の成果である市民社会の原理を法として定着させ、征服地を通じてヨーロッパ各国の民法に影響を与えた" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Jacques-Louis_David_-_The_Coronation_of_Napoleon_%281805-1807%29.jpg/960px-Jacques-Louis_David_-_The_Coronation_of_Napoleon_%281805-1807%29.jpg",
        caption: "ダヴィッド「ナポレオン1世の戴冠式と皇妃ジョゼフィーヌの戴冠」（1805〜1807年）",
        alt: "ノートルダム大聖堂で、教皇や廷臣が見守るなか、ナポレオンが皇妃ジョゼフィーヌに冠を授ける場面",
        credit: "Le Sacre de Napoléon／Jacques-Louis David（1805〜1807年）, Musée du Louvre, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Ingres%2C_Napoleon_on_his_Imperial_throne.jpg/960px-Ingres%2C_Napoleon_on_his_Imperial_throne.jpg",
        caption: "アングル「玉座のナポレオン1世」（1806年）",
        alt: "月桂冠をかぶり、白貂の毛皮の付いた戴冠衣装をまとって玉座に座るナポレオン",
        credit: "Napoléon Ier sur le trône impérial／Jean-Auguste-Dominique Ingres（1806年）, Musée de l'Armée, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "逸話：戴冠式でナポレオンは教皇から冠を受けず、自らの手で頭上に載せた。ダヴィッドの絵は、その直後にナポレオンが皇妃ジョゼフィーヌに冠を授ける場面を描いている。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ナポレオン一世の戴冠式と皇妃ジョゼフィーヌの戴冠",
  },
  {
    id: "c23", year: 1805, difficulty: 4, era: "近代（市民革命と国民国家）", region: "ライン同盟", theme: ["通史", "ナポレオン"],
    front: "アウステルリッツの戦い（1805年）の勝利は、神聖ローマ帝国にどのような結果をもたらしたか？",
    back: "",
    cloze: {
      template: "1805年、ナポレオンは{{1}}の海戦でイギリスに敗れたが、陸ではアウステルリッツの戦い（三帝会戦）でオーストリア・ロシア連合軍を破った。翌1806年には西南ドイツ諸邦を{{2}}に組織し、神聖ローマ帝国は名実ともに消滅した。",
      slots: [
        { id: 1, answer: "トラファルガー", category: "海戦" },
        { id: 2, answer: "ライン同盟", category: "同盟" },
      ],
      points: [
        { label: "原因", text: "イギリス・オーストリア・ロシアなどが第3回対仏大同盟を結成し、皇帝となったナポレオンに対抗した" },
        { label: "経過", text: "ネルソン率いるイギリス艦隊にトラファルガーで敗れてイギリス本土上陸を断念し、陸上で大陸の制圧を進めた" },
        { label: "意義", text: "ナポレオンはライン同盟の保護者となり、1806年には大陸封鎖令を出してイギリスを経済的に孤立させようとした" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/La_bataille_d%27Austerlitz._2_decembre_1805_%28Fran%C3%A7ois_G%C3%A9rard%29.jpg/960px-La_bataille_d%27Austerlitz._2_decembre_1805_%28Fran%C3%A7ois_G%C3%A9rard%29.jpg",
        caption: "ジェラール「アウステルリッツの戦い、1805年12月2日」（1810年）",
        alt: "戦場の丘の上で、騎乗のナポレオンが幕僚とともに敵軍の軍旗を差し出す騎兵を迎える場面",
        credit: "La bataille d'Austerlitz. 2 décembre 1805／François Gérard（1810年）, Château de Versailles, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：「三帝会戦」の三帝とは、フランス皇帝ナポレオン、ロシア皇帝アレクサンドル1世、神聖ローマ皇帝フランツ2世のこと。戦いは奇しくもナポレオンの戴冠一周年の12月2日だった。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/アウステルリッツの戦い",
  },
  {
    id: "c11", year: 1807, difficulty: 3, era: "近代（市民革命と国民国家）", region: "ワルシャワ大公国", theme: ["通史", "ナポレオン"],
    front: "ワルシャワ大公国はどの条約によって、どの国の領土から再建されたか？",
    back: "ティルジット条約（1807年）により、プロイセンが獲得していたポーランド分割地から再建された。",
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Tilsitz_1807.JPG/960px-Tilsitz_1807.JPG",
        caption: "ロエン「ティルジットでのナポレオンとアレクサンドル1世の会見」（1808年）",
        alt: "ネマン川の中央に浮かべた筏の上の天幕で、両皇帝が会見する様子を岸から描いた油彩画",
        credit: "Entrevue de Napoléon Ier et d'Alexandre Ier sur le Niémen／Adolphe Roehn（1808年）, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Bacciarelli_Granting_of_the_Constitution.jpg/960px-Bacciarelli_Granting_of_the_Constitution.jpg",
        caption: "バッチャレッリ「ワルシャワ大公国憲法を授けるナポレオン」（1811年）",
        alt: "玉座のナポレオンが、ポーランドの貴族たちに憲法を授ける場面",
        credit: "Nadanie konstytucji Księstwu Warszawskiemu przez Napoleona／Marcello Bacciarelli（1811年）, Wikimedia Commons・Public domain",
      },
    ],
  },
  {
    id: "c10", year: 1812, difficulty: 2, era: "近代（市民革命と国民国家）", region: "フランス帝国", theme: ["通史", "ナポレオン"],
    front: "ナポレオンのロシア遠征（1812年）の失敗後、ナポレオンの没落を決定づけた戦争と戦いは？",
    back: "",
    cloze: {
      template: "大陸封鎖令に背いてイギリスとの貿易を再開したロシアに対し、ナポレオンは1812年に遠征したが、モスクワの大火と冬の寒さに阻まれて大敗した。これを機に各国で{{1}}が起こり、1813年の{{2}}（諸国民戦争）に敗れたナポレオンは、翌1814年に退位した。",
      slots: [
        { id: 1, answer: "解放戦争", category: "戦争" },
        { id: 2, answer: "ライプツィヒの戦い", category: "戦い" },
      ],
      points: [
        { label: "原因", text: "大陸封鎖令はイギリスへ穀物を輸出していたロシアなど大陸諸国の経済を圧迫し、各地で反発を招いた" },
        { label: "経過", text: "約60万の大陸軍がモスクワを占領したが、ロシア側の焦土戦術で補給を断たれ、撤退中に大半の兵を失った" },
        { label: "意義", text: "ナポレオン支配への抵抗を通じて、プロイセンなど各地で国民意識（ナショナリズム）が高まった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Napoleons_retreat_from_Moscow_by_Adolph_Northen.jpg/960px-Napoleons_retreat_from_Moscow_by_Adolph_Northen.jpg",
        caption: "ノルテン「モスクワからのナポレオンの退却」（1851年）",
        alt: "雪原を白馬で進むナポレオンと、凍えながら歩く兵士たち。足元には倒れた兵士が横たわる",
        credit: "Napoleons Rückzug aus Moskau／Adolph Northen（1851年）, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：約60万の大陸軍のうち、ロシアから生きて帰還できたのは数万人ともいわれる。退位したナポレオンは地中海のエルバ島の領主として送られた。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ロシア戦役",
  },
  {
    id: "c12", year: 1815, difficulty: 3, era: "近代（市民革命と国民国家）", region: "ドイツ連邦", theme: ["通史", "ナポレオン"],
    front: "ウィーン会議を主導した人物と、会議の基本原則は？",
    back: "",
    cloze: {
      template: "ナポレオン没落後のヨーロッパ秩序を話し合うウィーン会議は、オーストリア外相{{1}}が主導し、フランス代表タレーランが唱えた{{2}}（革命前の王朝と領土を正統とする原則）と勢力均衡を基本とした。",
      slots: [
        { id: 1, answer: "メッテルニヒ", category: "人物" },
        { id: 2, answer: "正統主義", category: "原則" },
      ],
      points: [
        { label: "原因", text: "革命とナポレオン戦争で大きく塗り替えられた国境と王朝を、どのように戻すかを決める必要があった" },
        { label: "経過", text: "各国の利害が対立して交渉は難航したが、ナポレオンのエルバ島脱出を受けて1815年6月に議定書が調印された" },
        { label: "意義", text: "ドイツ連邦やネーデルラント連合王国が成立し、正統主義と勢力均衡にもとづく保守的な国際秩序が築かれた" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Afgevaardigden_op_het_Congres_van_Wenen%2C_1814-1815_Der_Wiener_Congress_1815._Sitzung_der_Bevollm%C3%A4chtigten_der_acht_an_dem_Tractate_von_Paris_betheiligten_M%C3%A4chte_%28titel_op_object%29%2C_RP-P-OB-87.274_%28cropped%29.jpg/960px-thumbnail.jpg",
        caption: "イザベイ原画「ウィーン会議」（銅版画）",
        alt: "大きなテーブルを囲み、各国の全権代表たちが立ったり座ったりして話し合う会議の様子",
        credit: "Der Wiener Congress 1815／Jean-Baptiste Isabey原画の銅版画, Rijksmuseum, Wikimedia Commons・CC0",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Prince_Metternich_by_Lawrence.jpeg/960px-Prince_Metternich_by_Lawrence.jpeg",
        caption: "ローレンス「メッテルニヒの肖像」（1815年）",
        alt: "勲章を付けた礼装で赤い椅子に腰掛けるメッテルニヒの肖像",
        credit: "Klemens von Metternich／Thomas Lawrence（1815年）, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "逸話：敗戦国フランスの代表タレーランは、「革命前の王朝こそ正統」という正統主義を掲げて列強の対立につけ込み、フランスを戦勝国と対等な立場で交渉に加わらせることに成功した。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ウィーン会議",
  },
  {
    id: "c26", year: 1815, difficulty: 2, era: "近代（市民革命と国民国家）", region: "オーストリア帝国", theme: ["通史", "ナポレオン"],
    front: "ウィーン会議の交渉が長引いた様子を皮肉った言葉と、会議の結果成立した国際体制は？",
    back: "",
    cloze: {
      template: "ウィーン会議では各国の領土要求が対立して交渉が長引き、連日の舞踏会ばかりが目立ったことから「会議は{{1}}、されど進まず」と皮肉られた。それでも1815年6月に議定書が調印され、大国間の勢力均衡を重んじる{{2}}が成立した。",
      slots: [
        { id: 1, answer: "踊る", category: "語句" },
        { id: 2, answer: "ウィーン体制", category: "国際体制" },
      ],
      points: [
        { label: "原因", text: "ロシアのポーランド領有やプロイセンのザクセン併合の要求をめぐって列強が対立し、議論がまとまらなかった" },
        { label: "経過", text: "ナポレオンのエルバ島脱出の報を受けて各国が妥協を急ぎ、ワーテルローの戦いの直前に議定書が調印された" },
        { label: "意義", text: "ウィーン体制は神聖同盟・四国同盟に支えられ、自由主義・ナショナリズムの運動を抑え込む保守的な国際秩序となった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/7/73/Der_Kongress-1814.jpg",
        caption: "風刺画「会議」（1814〜1815年、作者不詳）",
        alt: "地図を広げた卓を囲んでヨーロッパの分け前を話し合うロシア・オーストリア・プロイセンの君主と、窓の外の島から望遠鏡でのぞくナポレオン",
        credit: "Der Congress／作者不詳（1814〜1815年）, Deutsches Historisches Museum, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Afgevaardigden_op_het_Congres_van_Wenen%2C_1814-1815_Der_Wiener_Congress_1815._Sitzung_der_Bevollm%C3%A4chtigten_der_acht_an_dem_Tractate_von_Paris_betheiligten_M%C3%A4chte_%28titel_op_object%29%2C_RP-P-OB-87.274_%28cropped%29.jpg/960px-thumbnail.jpg",
        caption: "イザベイ原画「ウィーン会議」（銅版画）",
        alt: "大きなテーブルを囲み、各国の全権代表たちが立ったり座ったりして話し合う会議の様子",
        credit: "Der Wiener Congress 1815／Jean-Baptiste Isabey原画の銅版画, Rijksmuseum, Wikimedia Commons・CC0",
      },
    ],
    anecdote: "豆知識：この言葉はオーストリアの老将軍リーニュ侯の皮肉とされる。1931年にはこの言葉を題名にしたドイツ映画『会議は踊る』が作られ、日本でもヒットした。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ウィーン会議",
  },
  {
    id: "c13", year: 1815, difficulty: 3, era: "近代（市民革命と国民国家）", region: "ネーデルラント連合王国", theme: ["通史"],
    front: "ウィーン会議で、オランダと旧オーストリア領ネーデルラント（現ベルギー）が統合されて成立した国家は？",
    back: "ネーデルラント連合王国（1830年にベルギーが分離独立するまで存続）",
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/William_I_of_the_Netherlands.jpg/960px-William_I_of_the_Netherlands.jpg",
        caption: "パーリンク「ネーデルラント国王ウィレム1世の肖像」（1819年）",
        alt: "白貂の毛皮の付いた赤い王衣をまとい、王冠を置いた卓の横に立つウィレム1世の全身像",
        credit: "Portret van Willem I, koning der Nederlanden／Joseph Paelinck（1819年）, Rijksmuseum, Wikimedia Commons・Public domain",
      },
    ],
  },
  {
    id: "c25", year: 1815, difficulty: 2, era: "近代（市民革命と国民国家）", region: "ネーデルラント連合王国", theme: ["通史", "ナポレオン"],
    front: "エルバ島を脱出して復位したナポレオンの短い支配と、彼を最終的に破った人物は？",
    back: "",
    cloze: {
      template: "1815年、エルバ島を脱出したナポレオンはパリに戻って皇帝に復位した（{{1}}）が、ワーテルローの戦いでイギリスの{{2}}とプロイセンのブリュッヘルが率いる連合軍に敗れ、南大西洋のセントヘレナ島へ流された。",
      slots: [
        { id: 1, answer: "百日天下", category: "出来事" },
        { id: 2, answer: "ウェリントン", category: "人物" },
      ],
      points: [
        { label: "原因", text: "ウィーン会議で列強の対立が続き、復古したブルボン朝への不満もフランス国内で高まっていた" },
        { label: "経過", text: "ナポレオンは各国軍の合流前に各個撃破を狙ったが、プロイセン軍の来援でイギリス軍を中心とする連合軍に敗れた" },
        { label: "意義", text: "ナポレオン時代が完全に終わり、列強の協調のもとで約40年にわたる大国間の平和が続くことになった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Battle_of_Waterloo_1815.PNG/960px-Battle_of_Waterloo_1815.PNG",
        caption: "サドラー「ワーテルローの戦い」（1815年）",
        alt: "砲煙が立ちこめる平原で、騎兵と歩兵の大軍が入り乱れて戦う様子を俯瞰した油彩画",
        credit: "The Battle of Waterloo／William Sadler（1815年）, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Sir_Thomas_Lawrence_-_Arthur_Wellesley%2C_1st_Duke_of_Wellington_-_WM.1567-1948_-_Apsley_House.jpg/960px-Sir_Thomas_Lawrence_-_Arthur_Wellesley%2C_1st_Duke_of_Wellington_-_WM.1567-1948_-_Apsley_House.jpg",
        caption: "ローレンス「ウェリントン公爵の肖像」（1815年頃）",
        alt: "赤い軍服に勲章を付け、腕を組んで正面を見据えるウェリントン公爵の肖像",
        credit: "Arthur Wellesley, 1st Duke of Wellington／Thomas Lawrence（1815年頃）, Apsley House, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：ワーテルローは当時ネーデルラント連合王国の領内（現在のベルギー）にあった。ナポレオンはセントヘレナ島で1821年に51歳で没した。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ワーテルローの戦い",
  },
  {
    id: "c14", year: 1871, difficulty: 2, era: "近代（市民革命と国民国家）", region: "ドイツ帝国", theme: ["通史"],
    front: "1871年、普仏戦争の勝利を経てドイツ帝国の成立が宣言された場所は？",
    back: "ヴェルサイユ宮殿の鏡の間",
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/A_v_Werner_-_Kaiserproklamation_am_18_Januar_1871_%283._Fassung_1885%29.jpg/960px-A_v_Werner_-_Kaiserproklamation_am_18_Januar_1871_%283._Fassung_1885%29.jpg",
        caption: "アントン・フォン・ヴェルナー「ドイツ皇帝即位宣言」（1885年、第3版）",
        alt: "ヴェルサイユ宮殿鏡の間の壇上に立つヴィルヘルム1世に、軍服姿の諸侯や将校が歓呼を送る場面",
        credit: "Die Proklamierung des Deutschen Kaiserreiches／Anton von Werner（1885年）, Wikimedia Commons・Public domain",
      },
    ],
  },
  {
    id: "c15", year: 1871, difficulty: 3, era: "近代（市民革命と国民国家）", region: "フランス", theme: ["通史"],
    front: "普仏戦争の敗北により、フランスがドイツ帝国に割譲した地域は？",
    back: "アルザス・ロレーヌ",
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/1887_Bettannier_Der_Schwarze_Fleck_anagoria.jpg/960px-1887_Bettannier_Der_Schwarze_Fleck_anagoria.jpg",
        caption: "ベタニエ「黒い染み」（1887年）",
        alt: "教室で教師が、フランス地図の上で黒く塗られたアルザス・ロレーヌを生徒に指し示す場面",
        credit: "La Tache noire／Albert Bettannier（1887年）, Deutsches Historisches Museum, Wikimedia Commons・Public domain",
      },
    ],
  },
  {
    id: "c16", year: 1871, difficulty: 2, era: "近代（市民革命と国民国家）", region: "イタリア王国", theme: ["通史"],
    front: "1871年、イタリア王国による統一の最終段階として編入された都市は？",
    back: "ローマ（教皇領を占領し、新首都とした）",
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Breccia_di_Porta_Pia_Ademollo.jpg/960px-Breccia_di_Porta_Pia_Ademollo.jpg",
        caption: "アデモッロ「ポルタ・ピアの突破」（1880年）",
        alt: "砲撃で崩れたローマの城壁の突破口へ、イタリア軍の兵士たちが突撃していく場面",
        credit: "La breccia di Porta Pia／Carlo Ademollo（1880年）, Wikimedia Commons・Public domain",
      },
    ],
  },
];

// 近代（帝国主義と世界大戦）のカード。
// 1870年代からの列強による世界分割（アフリカ分割・中国分割）、帝国主義列強の対立と同盟・協商、
// 日清・日露戦争、バルカン問題とサラエボ事件、第一次世界大戦とロシア革命までを扱う（〜1918年）。
// region は Step 2 で作成予定のこの時代の地図（帝国主義と二つの大戦の区分）の勢力IDとして使う名前で統一し、
// 各勢力に2問ずつ割り当てている：イギリス、フランス、ドイツ帝国、ロシア帝国、アメリカ合衆国、
// オーストリア＝ハンガリー帝国、オスマン帝国、日本、清。地図データを作るときは、この region と同じIDを勢力に付けること。
// カードの答えになる地名（ファショダ、モロッコ、キール、ポーツマス、ブレスト＝リトフスク、フィリピン、ボスニア・ヘルツェゴヴィナ、
// 下関、膠州）は、地図上で答えが見えないよう都市や地域名として置かないこと。
export const IMPERIALISM_CARDS = [
  {
    id: "c79", year: 1875, difficulty: 1, era: "近代（帝国主義と世界大戦）", region: "イギリス", theme: ["通史", "帝国主義"],
    front: "1875年にスエズ運河会社の株を買収したイギリス首相と、1877年に成立させたインドの国家は？",
    back: "",
    cloze: {
      template: "1875年、イギリス首相{{1}}はエジプトの財政難につけこんでスエズ運河会社の株を買収し、インドへの最短航路を確保した。1877年にはヴィクトリア女王を皇帝とする{{2}}を成立させた。",
      slots: [
        { id: 1, answer: "ディズレーリ", category: "人物" },
        { id: 2, answer: "インド帝国", category: "国家" },
      ],
      points: [
        { label: "原因", text: "1869年に開通した運河は、ヨーロッパとアジアを結ぶ航路を大幅に短縮し、インドを「王冠の宝石」とするイギリスにとって生命線となった" },
        { label: "経過", text: "首相は議会の承認を待たずにロスチャイルド家から資金を借りて買収を決めた。1882年にはエジプトを事実上の保護国とした" },
        { label: "意義", text: "自由貿易を重んじた時代から、領土と勢力圏の拡大をめざす帝国主義の時代へとイギリスが転換する象徴的な出来事となった" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Benjamin_Disraeli%2C_1st_Earl_of_Beaconsfield_%28by_Sir_John_Everett_Millais%2C_1881%29_-_National_Portrait_Gallery_%28NPG_3241%29.jpg/960px-Benjamin_Disraeli%2C_1st_Earl_of_Beaconsfield_%28by_Sir_John_Everett_Millais%2C_1881%29_-_National_Portrait_Gallery_%28NPG_3241%29.jpg", caption: "ミレー「ディズレーリの肖像」（1881年、ナショナル・ポートレート・ギャラリー）",
        alt: "黒い服を着て腕を組み、正面を見つめる年配の政治家の肖像",
        credit: "Benjamin Disraeli, 1st Earl of Beaconsfield／John Everett Millais（1881年）, National Portrait Gallery, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/L%27inauguration_du_canal_de_Suez%2C_17_November_1869_Gal18_riou_001f.jpg/960px-L%27inauguration_du_canal_de_Suez%2C_17_November_1869_Gal18_riou_001f.jpg", caption: "リウ「スエズ運河の開通式」（1869年）",
        alt: "旗を掲げた船の列が、砂漠の間を通る運河を進んでいく様子を描いた絵",
        credit: "L'inauguration du canal de Suez／Édouard Riou（1869年）, Wikimedia Commons・Public domain" },
    ],
    anecdote: "逸話：小説家でもあった首相は、株の買収の成功を女王に「マダム、運河はあなたのものです」と報告したと伝えられる。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/スエズ運河",
  },
  {
    id: "c93", year: 1895, difficulty: 0, era: "近代（帝国主義と世界大戦）", region: "日本", theme: ["通史", "帝国主義"],
    front: "日清戦争の講和条約と、日本が遼東半島を返還させられたロシア・フランス・ドイツの干渉は？",
    back: "",
    cloze: {
      template: "朝鮮をめぐる日清戦争に勝利した日本は、1895年の{{1}}条約で台湾・澎湖諸島・遼東半島と賠償金を獲得したが、ロシア・フランス・ドイツによる{{2}}を受けて遼東半島を清に返還した。",
      slots: [
        { id: 1, answer: "下関", category: "条約" },
        { id: 2, answer: "三国干渉", category: "干渉" },
      ],
      points: [
        { label: "原因", text: "1894年、朝鮮で起こった甲午農民戦争（東学党の乱）をきっかけに、朝鮮への影響力をめぐって日本と清が出兵し衝突した" },
        { label: "経過", text: "近代化を進めた日本軍が陸海で勝利し、清は朝鮮の独立を認めた。日本は台湾を最初の植民地として統治した" },
        { label: "意義", text: "「眠れる獅子」と呼ばれた清の弱体が明らかになり、列強による中国分割が本格化した。日本国内では「臥薪嘗胆」を合言葉にロシアへの対抗心が高まった" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Mizuno_Toshikata_-_The_Fall_of_Fenghuangcheng-_Putting_the_Enemy_to_Rout_-_Google_Art_Project.jpg/960px-Mizuno_Toshikata_-_The_Fall_of_Fenghuangcheng-_Putting_the_Enemy_to_Rout_-_Google_Art_Project.jpg", caption: "水野年方「鳳凰城の陥落」（日清戦争の錦絵、1894年）",
        alt: "雪の中、銃を構えて突撃する兵士たちと、逃げる敵兵を描いた色鮮やかな錦絵",
        credit: "The Fall of Fenghuangcheng／水野年方（1894年）, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Peace_Conference_at_Shimonoseki_by_Nagatochi_Hideta_%28Meiji_Memorial_Picture_Gallery%29_%28cropped%29.jpg/960px-Peace_Conference_at_Shimonoseki_by_Nagatochi_Hideta_%28Meiji_Memorial_Picture_Gallery%29_%28cropped%29.jpg", caption: "永地秀太『下関講和談判』（1929年、聖徳記念絵画館）",
        alt: "洋風の部屋のテーブルを囲み、日本と清の全権たちが向かい合って交渉する場面",
        credit: "下関講和談判／永地秀太（1929年）, 明治神宮聖徳記念絵画館, Wikimedia Commons・Public domain" },
    ],
    anecdote: "豆知識：清の全権・李鴻章は交渉中に日本人の青年に狙撃されて負傷した。国際的な非難を恐れた日本は、これを機に休戦に応じた。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/日清戦争",
  },
  {
    id: "c81", year: 1898, difficulty: 2, era: "近代（帝国主義と世界大戦）", region: "フランス", theme: ["通史", "帝国主義"],
    front: "サハラ砂漠を東へ進むフランスのアフリカ政策と、1898年にイギリス軍と衝突したスーダンの地は？",
    back: "",
    cloze: {
      template: "アルジェリア・チュニジアを拠点にサハラ砂漠を東へ進み、ジブチ・マダガスカルと結ぼうとする{{1}}政策をとったフランスは、1898年、スーダンの{{2}}でイギリスの縦断政策と衝突したが、譲歩して撤退した。",
      slots: [
        { id: 1, answer: "アフリカ横断", category: "政策" },
        { id: 2, answer: "ファショダ", category: "地名" },
      ],
      points: [
        { label: "原因", text: "1884〜85年のベルリン会議で「先に実効支配した国が領有できる」という原則が定まり、列強はアフリカ内陸の分割を急いだ" },
        { label: "経過", text: "マルシャン大佐の部隊がナイル川上流の砦に旗を立てたが、スーダンを制圧したキッチナー将軍のイギリス軍と対峙し、戦争の一歩手前に至った" },
        { label: "意義", text: "フランスの譲歩で危機は回避され、ドイツの台頭を前に英仏が歩み寄るきっかけとなった" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Groupe_de_la_mission_Marchand_au_Caire_1898.jpg/960px-Groupe_de_la_mission_Marchand_au_Caire_1898.jpg", caption: "カイロに到着したマルシャン大佐の遠征隊（1898年の写真）",
        alt: "軍服や白い服を着た隊員と現地の兵士たちが並ぶ集合写真",
        credit: "Groupe de la mission Marchand au Caire／E. Lauro（1898年）, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Kitchener_in_the_robes_of_an_LL.D._of_Cambridge_University%2C_November_24%2C_1898.png/960px-Kitchener_in_the_robes_of_an_LL.D._of_Cambridge_University%2C_November_24%2C_1898.png", caption: "イギリス軍を率いたキッチナー将軍（1898年）",
        alt: "大学の名誉学位のガウンをまとい、口ひげをたくわえて立つ軍人の写真",
        credit: "Kitchener in the robes of an LL.D. of Cambridge University／作者不詳（1898年）, Wikimedia Commons・Public domain" },
    ],
    anecdote: "豆知識：19世紀末までに、エチオピアとリベリアを除くアフリカのほぼ全域がヨーロッパ列強の植民地や保護国となった。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ファショダ事件",
  },
  {
    id: "c95", year: 1898, difficulty: 2, era: "近代（帝国主義と世界大戦）", region: "清", theme: ["通史", "帝国主義"],
    front: "1898年にドイツが租借した中国の湾と、1900年に「扶清滅洋」を掲げて蜂起した宗教結社は？",
    back: "",
    cloze: {
      template: "日清戦争の敗北で清の弱体が明らかになると、列強は租借地や鉄道敷設権を獲得して勢力範囲を広げた。ドイツは{{1}}湾、ロシアは旅順・大連、イギリスは威海衛と九竜半島を租借した。これに反発した宗教結社の{{2}}は、1900年に「扶清滅洋」を掲げて蜂起した。",
      slots: [
        { id: 1, answer: "膠州", category: "湾" },
        { id: 2, answer: "義和団", category: "結社" },
      ],
      points: [
        { label: "原因", text: "多額の賠償金を支払うため、清は列強から借款を受け、その見返りに鉄道や鉱山の利権を次々と認めた" },
        { label: "経過", text: "蜂起した集団が北京の外国公使館を包囲すると、日本とロシアを主力とする8か国の連合軍が出兵して鎮圧した" },
        { label: "意義", text: "1901年の北京議定書で清は巨額の賠償金と外国軍の北京駐留を認め、半植民地化が一段と進んだ" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/China_imperialism_cartoon.jpg/960px-China_imperialism_cartoon.jpg", caption: "アンリ・メイエ「中国というケーキを切り分ける列強」（1898年、『プティ・ジュルナル』）",
        alt: "中国と書かれたケーキを、各国の君主たちが囲んで切り分けようとし、後ろで清の役人が嘆く風刺画",
        credit: "En Chine – Le gâteau des Rois et… des Empereurs／Henri Meyer（1898年）, Le Petit Journal, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/6/64/Indian_troops_at_Temple_of_Heaven_Peking_1900.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original", caption: "北京の天壇に駐屯した連合軍のインド兵（1900年）",
        alt: "円錐形の屋根が三層に重なる祭殿の前に、兵士たちが整列している写真",
        credit: "Indian troops at Temple of Heaven, Peking／作者不詳（1900年）, Wikimedia Commons・Public domain" },
    ],
    anecdote: "豆知識：太平天国の乱や義和団の鎮圧に功績のあった李鴻章ら漢人官僚の力が強まり、地方の軍事勢力が台頭した。これがのちの清朝崩壊の一因にもなった。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/義和団の乱",
  },
  {
    id: "c83", year: 1899, difficulty: 1, era: "近代（帝国主義と世界大戦）", region: "ドイツ帝国", theme: ["通史", "帝国主義"],
    front: "「世界政策」を掲げたドイツ皇帝と、ベルリン・ビザンティウム・バグダードを結ぼうとした政策は？",
    back: "",
    cloze: {
      template: "宰相ビスマルクを辞任させたドイツ皇帝{{1}}は「世界政策」を掲げ、ベルリン・ビザンティウム（イスタンブル）・バグダードを鉄道で結ぶ{{2}}政策を進めて、イギリスのアジア進出と対立した。",
      slots: [
        { id: 1, answer: "ヴィルヘルム2世", category: "人物" },
        { id: 2, answer: "3B", category: "政策" },
      ],
      points: [
        { label: "原因", text: "急速な工業化で世界有数の工業国となったドイツは、原料と市場を求めて植民地の獲得をめざした" },
        { label: "経過", text: "オスマン帝国からバグダード鉄道の敷設権を得て中東へ進出し、イギリスに対抗する大艦隊の建設も始めた" },
        { label: "意義", text: "ビスマルクが築いたフランス孤立化の同盟網はくずれ、イギリス・フランス・ロシアが接近してドイツを包囲する形勢となった" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Kaiser_Wilhelm_II_of_Germany_-_1902.jpg/960px-Kaiser_Wilhelm_II_of_Germany_-_1902.jpg", caption: "ヴィルヘルム2世の肖像写真（1902年）",
        alt: "勲章を着け、先の跳ね上がった口ひげをたくわえた軍服姿の皇帝の写真",
        credit: "Kaiser Wilhelm II of Germany／Thomas Heinrich Voigt工房（1902年）, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/German_Baghdad_Railway%2C_190_._Railroad_construction_camp_LOC_matpc.04666.jpg/960px-German_Baghdad_Railway%2C_190_._Railroad_construction_camp_LOC_matpc.04666.jpg", caption: "建設中のバグダード鉄道の工事現場（1900年代、中東）",
        alt: "荒れ地の中にまっすぐ延びる線路と、その脇に並ぶ工事用の小屋",
        credit: "German Baghdad Railway, railroad construction camp／Matson Collection（1900〜1910年代）, Library of Congress, Wikimedia Commons・Public domain" },
    ],
    anecdote: "逸話：皇帝は「ドイツの未来は海上にある」と述べて大艦隊の建設を進めた。これがイギリスとの激しい建艦競争を招いた。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/3B政策",
  },
  {
    id: "c80", year: 1899, difficulty: 1, era: "近代（帝国主義と世界大戦）", region: "イギリス", theme: ["通史", "帝国主義"],
    front: "カイロ・ケープタウン・カルカッタを結んだイギリスの政策と、南アフリカの征服を進めたケープ植民地首相は？",
    back: "",
    cloze: {
      template: "イギリスは、エジプトのカイロ、南アフリカのケープタウン、インドのカルカッタを結ぶ{{1}}政策を進めた。ケープ植民地首相{{2}}らは南アフリカの金やダイヤモンドを狙い、1899年からの南アフリカ戦争でブール人の国々を併合した。",
      slots: [
        { id: 1, answer: "3C", category: "政策" },
        { id: 2, answer: "セシル・ローズ", category: "人物" },
      ],
      points: [
        { label: "原因", text: "アフリカを北のエジプトから南のケープまで縦断して支配し、インドと結ぶ大帝国の形成をめざした" },
        { label: "経過", text: "オランダ系移民の子孫であるブール人のトランスヴァール共和国・オレンジ自由国との戦争は予想外に長期化し、多くの犠牲を出した" },
        { label: "意義", text: "苦戦と国際的な批判を受けたイギリスは「光栄ある孤立」を見直し、他国との同盟・協商へと外交方針を転換した" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Punch_Rhodes_Colossus.png/960px-Punch_Rhodes_Colossus.png", caption: "『パンチ』誌の風刺画：アフリカの南北をまたぐ巨人（1892年）",
        alt: "アフリカ大陸の上に両足を広げて立ち、両手で電信線を張る巨人を描いた白黒の風刺画",
        credit: "The Rhodes Colossus／Edward Linley Sambourne（1892年）, Punch, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Cecil_Rhodes_last_portrait.jpg/960px-Cecil_Rhodes_last_portrait.jpg", caption: "セシル・ローズの肖像写真（1902年）",
        alt: "机に向かって座り、書類を前にした恰幅のよい男性の写真",
        credit: "Cecil Rhodes／William Thomas Stead（1902年）, Wikimedia Commons・Public domain" },
    ],
    anecdote: "豆知識：彼の名にちなんで、現在のジンバブエとザンビアにあたる地域は「ローデシア」と名付けられた。遺産はオックスフォード大学の「ローズ奨学金」として今も続いている。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/3C政策",
  },
  {
    id: "c87", year: 1899, difficulty: 1, era: "近代（帝国主義と世界大戦）", region: "アメリカ合衆国", theme: ["通史", "帝国主義"],
    front: "1898年の米西戦争でアメリカが獲得したアジアの島々と、1899年にアメリカが中国について列強に求めた宣言は？",
    back: "",
    cloze: {
      template: "1898年の米西戦争に勝利したアメリカは、{{1}}・グアム・プエルトリコを獲得し、ハワイも併合した。中国分割に出遅れたアメリカは、1899年に国務長官ジョン・ヘイが{{2}}宣言を発し、中国市場の開放・機会均等・領土保全を列強に求めた。",
      slots: [
        { id: 1, answer: "フィリピン", category: "島々" },
        { id: 2, answer: "門戸開放", category: "宣言" },
      ],
      points: [
        { label: "原因", text: "19世紀末に西部開拓（フロンティア）が終わったアメリカは、海外市場と太平洋の拠点を求めるようになった" },
        { label: "経過", text: "キューバ独立運動への介入から始まった戦争に短期間で勝利し、カリブ海と太平洋に植民地を持つ国となった" },
        { label: "意義", text: "孤立主義を保ってきたアメリカが帝国主義列強の一員として国際政治に本格的に登場し、のちに太平洋で日本と対立する遠因ともなった" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/C.M._Gilbert._-_John_Hay%2C_c._1904.jpg/960px-C.M._Gilbert._-_John_Hay%2C_c._1904.jpg", caption: "国務長官ジョン・ヘイ（1904年頃）",
        alt: "椅子に腰かけ、白いひげをたくわえた初老の男性の写真",
        credit: "John Hay／C. M. Gilbert（1904年頃）, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Battle_of_Manila_Bay_by_James_Gale_Tyler_%281898%29.jpg/960px-Battle_of_Manila_Bay_by_James_Gale_Tyler_%281898%29.jpg", caption: "タイラー「マニラ湾の海戦」（1898年）",
        alt: "炎と煙を上げる艦船の間を、軍艦が砲撃しながら進む海戦の場面",
        credit: "Battle of Manila Bay／James Gale Tyler（1898年）, Wikimedia Commons・Public domain" },
    ],
    anecdote: "豆知識：この戦争は、新聞が戦意をあおる過激な報道（イエロー・ジャーナリズム）を繰り広げたことでも知られる。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/門戸開放政策",
  },
  {
    id: "c82", year: 1904, difficulty: 2, era: "近代（帝国主義と世界大戦）", region: "フランス", theme: ["通史", "帝国主義"],
    front: "1904年にイギリスとフランスが結んだ協定と、そこでフランスの優越が認められた北アフリカの地域は？",
    back: "",
    cloze: {
      template: "スーダンでの衝突ののち英仏は歩み寄り、1904年の{{1}}で、イギリスのエジプト、フランスの{{2}}における優越をたがいに認めた。ドイツ皇帝はこれに反発し、1905年と1911年にこの地をめぐって危機を起こした。",
      slots: [
        { id: 1, answer: "英仏協商", category: "協定" },
        { id: 2, answer: "モロッコ", category: "地域" },
      ],
      points: [
        { label: "原因", text: "ドイツの海軍拡張と世界政策に脅威を感じたイギリスが、長年の植民地争いの相手だったフランスとの和解を選んだ" },
        { label: "経過", text: "ドイツの揺さぶりはかえって英仏の結束を強め、1907年にはイギリスとロシアも中央アジアでの勢力範囲を定めて協商を結んだ" },
        { label: "意義", text: "ドイツ・オーストリア・イタリアの三国同盟と、英仏露の陣営がヨーロッパで対立する構図が固まった" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Wilhelm_II_in_Tangier.jpg/960px-Wilhelm_II_in_Tangier.jpg", caption: "モロッコのタンジールを訪問したドイツ皇帝（1905年）",
        alt: "軍服に白いマントをまとい、黒い馬に乗って港町を進む皇帝の写真",
        credit: "Wilhelm II in Tangier／作者不詳（1905年）, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/The_Entente_Cordiale_%28France%29._Photographer-_H._D._Girdwood._%2813875903084%29.jpg/960px-The_Entente_Cordiale_%28France%29._Photographer-_H._D._Girdwood._%2813875903084%29.jpg", caption: "第一次世界大戦中、ともに戦う英仏両軍の兵士たち（1916年頃）",
        alt: "庭に並んで立つイギリス兵とフランス兵の写真",
        credit: "The Entente Cordiale (France)／写真: H. D. Girdwood（1916年頃）, The British Library, Wikimedia Commons・No known copyright restrictions" },
    ],
    anecdote: "豆知識：協商を記念して、英仏両国の国旗を並べた絵はがきが大量に作られた。100年後の2004年には、英仏で「英仏協商100周年」の記念行事が開かれた。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/英仏協商",
  },
  {
    id: "c85", year: 1905, difficulty: 1, era: "近代（帝国主義と世界大戦）", region: "ロシア帝国", theme: ["通史", "帝国主義"],
    front: "日露戦争中にロシアで革命のきっかけとなった事件と、1905年にアメリカの仲介で結ばれた講和条約は？",
    back: "",
    cloze: {
      template: "満州・朝鮮をめぐって1904年に始まった日露戦争で、日本は旅順の攻略や日本海海戦で勝利した。国内では首都の請願デモへの発砲事件（{{1}}事件）をきっかけに革命が起こり、ロシアは1905年、アメリカの仲介で{{2}}条約を結んだ。",
      slots: [
        { id: 1, answer: "血の日曜日", category: "事件" },
        { id: 2, answer: "ポーツマス", category: "条約" },
      ],
      points: [
        { label: "原因", text: "シベリア鉄道を建設して東アジアに進出したロシアが満州を事実上占領し、朝鮮の支配をめざす日本と対立した" },
        { label: "経過", text: "日本は韓国の指導権、南満州の鉄道、樺太の南半分などを獲得したが、賠償金は得られず、国内では日比谷焼打ち事件が起こった" },
        { label: "意義", text: "アジアの国がヨーロッパの大国に勝利したことはアジア各地の民族運動を刺激した。敗れたロシアは南下の方向をバルカン半島へ向けた" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Mikasa-Bridge-Painting-by-Tojo-Shotaro.png/960px-Mikasa-Bridge-Painting-by-Tojo-Shotaro.png", caption: "東城鉦太郎『三笠艦橋之図』（日本海海戦、1906年）",
        alt: "軍艦の艦橋に立ち、双眼鏡を手に海を見すえる司令官と将校たち",
        credit: "三笠艦橋之図／東城鉦太郎（1906年）, 記念艦三笠, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/The_Russian_Revolution%2C_1905_Q81561.jpg/960px-The_Russian_Revolution%2C_1905_Q81561.jpg", caption: "ウラジーミロフ「血の日曜日」（1905年1月の事件を描いた絵）",
        alt: "雪の積もった宮殿前の広場で、騎兵や兵士が群衆に襲いかかる場面",
        credit: "Bloody Sunday／Ivan Vladimirov（1905年頃）, Imperial War Museum, Wikimedia Commons・Public domain" },
    ],
    anecdote: "豆知識：日本海海戦で東郷平八郎の艦隊が掲げた「Z旗」の信号は「皇国の興廃この一戦にあり、各員一層奮励努力せよ」という意味だった。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/日露戦争",
  },
  {
    id: "c89", year: 1908, difficulty: 2, era: "近代（帝国主義と世界大戦）", region: "オーストリア＝ハンガリー帝国", theme: ["通史", "帝国主義"],
    front: "1908年にオーストリアが併合した地域と、民族対立と列強の思惑が絡み合ったバルカン半島の呼び名は？",
    back: "",
    cloze: {
      template: "1908年、オスマン帝国の政変の混乱に乗じて、オーストリアは{{1}}を併合した。同地のスラヴ系住民と結びつくセルビアは強く反発し、民族対立と列強の思惑が絡み合うバルカン半島は「{{2}}」と呼ばれた。",
      slots: [
        { id: 1, answer: "ボスニア・ヘルツェゴヴィナ", category: "地域" },
        { id: 2, answer: "ヨーロッパの火薬庫", category: "呼び名" },
      ],
      points: [
        { label: "原因", text: "スラヴ民族の連帯を掲げるロシア（パン＝スラヴ主義）と、ドイツ系の勢力拡大をめざすドイツ・オーストリア（パン＝ゲルマン主義）がバルカンで対立した" },
        { label: "経過", text: "1912〜13年の2度のバルカン戦争で、オスマン帝国はヨーロッパ側の領土の大半を失い、バルカン諸国どうしも領土をめぐって争った" },
        { label: "意義", text: "セルビアとオーストリアの対立は一触即発となり、わずかな事件が列強を巻き込む大戦争に発展しかねない状況が生まれた" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Franz_Joseph_I._in_Jagdkleidung_1910_%C2%A9_Hans_Makart_jun._%281870%E2%80%931946%29.jpg/960px-Franz_Joseph_I._in_Jagdkleidung_1910_%C2%A9_Hans_Makart_jun._%281870%E2%80%931946%29.jpg", caption: "オーストリア皇帝フランツ・ヨーゼフ1世（1910年）",
        alt: "狩猟服を着て帽子をかぶり、白いひげをたくわえた老いた皇帝の写真",
        credit: "Franz Joseph I. in Jagdkleidung／Hans Makart jun.（1910年）, Wikimedia Commons・Public domain" },
    ],
    anecdote: "豆知識：フランツ・ヨーゼフ1世は68年間も帝位にあり、弟・妻・息子・甥を次々に悲劇的な形で失った。甥の暗殺は世界大戦の引き金となった。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ボスニア危機",
  },
  {
    id: "c91", year: 1908, difficulty: 3, era: "近代（帝国主義と世界大戦）", region: "オスマン帝国", theme: ["通史", "帝国主義"],
    front: "1908年にオスマン帝国で復活した憲法の名と、専制に反対する将校らが起こしたこの革命の名は？",
    back: "",
    cloze: {
      template: "1908年、スルタンの専制に反対する将校や知識人の組織「統一と進歩委員会」が蜂起し、30年あまり停止されていた{{1}}憲法を復活させた。この政変を{{2}}革命という。",
      slots: [
        { id: 1, answer: "ミドハト", category: "憲法" },
        { id: 2, answer: "青年トルコ", category: "革命" },
      ],
      points: [
        { label: "原因", text: "1876年に制定されたアジア初の憲法は、ロシアとの戦争を口実にスルタンのアブデュルハミト2世によって停止され、専制政治が続いた" },
        { label: "経過", text: "革命後の政府は近代化を進めたが、混乱に乗じてオーストリアやブルガリアが領土を奪い、のちにはトルコ民族主義の色彩を強めていった" },
        { label: "意義", text: "アジアの立憲革命の一つとして注目され、ロシアの革命やイランの立憲革命などとともに、アジアの変革の波を示す出来事となった" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Greek_lithograph_celebrating_the_Ottoman_Constitution.png/960px-Greek_lithograph_celebrating_the_Ottoman_Constitution.png", caption: "憲法の復活を祝うリトグラフ（1908年）",
        alt: "空に天使が舞い、旗を掲げたさまざまな民族の人々が港町で祝う様子を描いた色刷りの絵",
        credit: "Greek lithograph celebrating the Ottoman Constitution／Sotiris Christidis（1908年）, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/General_Enver_Pascha_1917_C._Pietzner.png/960px-General_Enver_Pascha_1917_C._Pietzner.png", caption: "青年トルコの指導者エンヴェル・パシャ（1917年）",
        alt: "軍服を着て口ひげをたくわえた将校の肖像写真",
        credit: "General Enver Pascha／Carl Pietzner（1917年）, Wikimedia Commons・Public domain" },
    ],
    anecdote: "豆知識：「青年トルコ」はヨーロッパの新聞が付けた呼び名で、イタリア統一運動の「青年イタリア」などにならったものとされる。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/青年トルコ人革命",
  },
  {
    id: "c94", year: 1910, difficulty: 1, era: "近代（帝国主義と世界大戦）", region: "日本", theme: ["通史", "帝国主義"],
    front: "ロシアの南下に対抗して日本が1902年に結んだ同盟と、1910年に日本が朝鮮を植民地とした出来事は？",
    back: "",
    cloze: {
      template: "ロシアの南下に対抗するため、日本は1902年にイギリスと{{1}}を結んだ。日露戦争後は韓国を保護国として外交権を奪い、1910年には{{2}}を行って朝鮮を植民地とした。",
      slots: [
        { id: 1, answer: "日英同盟", category: "同盟" },
        { id: 2, answer: "韓国併合", category: "出来事" },
      ],
      points: [
        { label: "原因", text: "1900年の清での排外運動の鎮圧後もロシアは満州に大軍を駐留させ、イギリスと日本はともにその南下を警戒した" },
        { label: "経過", text: "日本は韓国統監府を置いて内政も支配し、これに抵抗する義兵闘争を武力で鎮圧した。1909年には初代統監がハルビンで暗殺された" },
        { label: "意義", text: "日本は朝鮮総督府を通じて1945年まで朝鮮を統治し、日本の植民地支配は現在まで続く歴史問題の背景となっている" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/IT%C5%8C_Hirobumi.jpg/960px-IT%C5%8C_Hirobumi.jpg", caption: "初代韓国統監・伊藤博文（1900年頃）",
        alt: "白いひげをたくわえ、正装して正面を見つめる年配の政治家の写真",
        credit: "伊藤博文／作者不詳（1900年頃）, Wikimedia Commons・Public domain" },
    ],
    anecdote: "豆知識：イギリスが「光栄ある孤立」を捨てて結んだ初めての同盟で、日本にとっては大国と対等な同盟を結んだことが国際的な地位の向上を意味した。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/韓国併合",
  },
  {
    id: "c96", year: 1911, difficulty: 0, era: "近代（帝国主義と世界大戦）", region: "清", theme: ["通史", "帝国主義"],
    front: "1911年に武昌の蜂起から始まり清を滅ぼした革命と、中華民国の臨時大総統となった革命家は？",
    back: "",
    cloze: {
      template: "1911年、鉄道国有化に反対する運動を背景に武昌で軍隊が蜂起して{{1}}が始まり、各省が次々に独立を宣言した。翌1912年、{{2}}を臨時大総統とする中華民国が南京で成立し、宣統帝の退位で清は滅亡した。",
      slots: [
        { id: 1, answer: "辛亥革命", category: "革命" },
        { id: 2, answer: "孫文", category: "人物" },
      ],
      points: [
        { label: "原因", text: "列強の侵略と清朝の無力に失望した人々の間で、清を倒して共和国を建てようとする革命運動が広まった" },
        { label: "経過", text: "清朝は北洋軍の実力者・袁世凱を起用したが、袁世凱は革命派と取引して皇帝を退位させ、自ら臨時大総統の地位についた" },
        { label: "意義", text: "2000年以上続いた皇帝政治が終わり、アジアで最初の共和国が成立した。しかし袁世凱の独裁と軍閥の割拠で、政治の混乱は続いた" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Sun_Yat-sen_2.jpg/960px-Sun_Yat-sen_2.jpg", caption: "孫文の肖像写真",
        alt: "口ひげをたくわえ、立ち襟の服を着た男性の肖像写真",
        credit: "Sun Yat-sen／作者不詳, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Hubei_Military_Government.jpg/960px-Hubei_Military_Government.jpg", caption: "武昌蜂起の後に成立した湖北軍政府（1911年）",
        alt: "洋風の建物の前に、旗を掲げた兵士たちが整列している写真",
        credit: "Hubei Military Government／作者不詳（1911年）, Wikimedia Commons・Public domain" },
    ],
    anecdote: "豆知識：革命家は、民族の独立・民権の伸長・民生の安定を説く「三民主義」を掲げた。日本に亡命していた時期も長く、多くの日本人の支援者がいた。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/辛亥革命",
  },
  {
    id: "c90", year: 1914, difficulty: 0, era: "近代（帝国主義と世界大戦）", region: "オーストリア＝ハンガリー帝国", theme: ["通史", "世界大戦"],
    front: "サラエボ事件で暗殺されたオーストリアの帝位継承者と、イギリス・フランス・ロシアの陣営の呼び名は？",
    back: "",
    cloze: {
      template: "1914年6月、オーストリアの帝位継承者{{1}}夫妻が、ボスニアの州都サラエボでセルビア人の民族主義者に暗殺された。オーストリアがセルビアに宣戦すると、ロシアはセルビアを、ドイツはオーストリアを支持し、戦争は{{2}}の諸国を巻き込む大戦へと拡大した。",
      slots: [
        { id: 1, answer: "フランツ・フェルディナント", category: "人物" },
        { id: 2, answer: "三国協商", category: "陣営" },
      ],
      points: [
        { label: "原因", text: "ボスニアの併合以来、オーストリアとセルビアの対立は激しく、各国は同盟関係によって自動的に参戦する仕組みに組み込まれていた" },
        { label: "経過", text: "わずか1か月あまりで主要な列強が次々に宣戦し、多くの人々は戦争がクリスマスまでに終わると考えていた" },
        { label: "意義", text: "戦車・毒ガス・飛行機などの新兵器が使われ、国民全体を動員する総力戦となり、約1000万人の戦死者を出した" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/DC-1914-27-d-Sarajevo.jpg/960px-DC-1914-27-d-Sarajevo.jpg", caption: "ベルトラーメ『ドメニカ・デル・コリエーレ』の表紙：サラエボ事件（1914年）",
        alt: "群衆の中、オープンカーに乗った夫妻に向かって男が拳銃を撃つ場面を描いた雑誌の表紙",
        credit: "La Domenica del Corriere, 12 luglio 1914／Achille Beltrame（1914年）, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Sarajevo_1914-2014_-_Gradska_Vije%C4%87nica%2C_Sarajevo_%2849127780441%29.jpg/960px-Sarajevo_1914-2014_-_Gradska_Vije%C4%87nica%2C_Sarajevo_%2849127780441%29.jpg", caption: "サラエボ市庁舎の展示：暗殺された帝位継承者夫妻の衣装と写真（2019年）",
        alt: "展示室に並べられた、白いドレスと軍服を着たマネキンと、夫妻の大きな写真",
        credit: "Sarajevo 1914-2014, Gradska Vijećnica／写真: Fred Romero（2019年）, Wikimedia Commons・CC BY 2.0" },
    ],
    anecdote: "豆知識：暗殺はいったん失敗したが、予定を変えて病院へ向かう途中で車が道を間違えて停止し、偶然その場に居合わせた犯人に撃たれた。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/サラエボ事件",
  },
  {
    id: "c92", year: 1915, difficulty: 3, era: "近代（帝国主義と世界大戦）", region: "オスマン帝国", theme: ["通史", "世界大戦"],
    front: "第一次世界大戦でオスマン帝国が加わった陣営と、イギリスがアラブ人に独立を約束した協定は？",
    back: "",
    cloze: {
      template: "オスマン帝国は1914年、ドイツ・オーストリアの側（{{1}}）で参戦し、1915年にはガリポリの戦いでイギリス軍などの上陸を退けた。一方イギリスは、アラブ人に戦後の独立を約束する{{2}}協定を結んでアラブの反乱を促した。",
      slots: [
        { id: 1, answer: "同盟国", category: "陣営" },
        { id: 2, answer: "フサイン・マクマホン", category: "協定" },
      ],
      points: [
        { label: "原因", text: "ロシアに領土を奪われ続けてきたオスマン帝国は、軍の近代化を支援したドイツに接近していた" },
        { label: "経過", text: "イギリスはアラブ人への約束と同時に、フランスとは中東を分割するサイクス・ピコ協定を、ユダヤ人にはパレスチナでの民族的郷土建設を支持するバルフォア宣言を出した" },
        { label: "意義", text: "矛盾する約束（イギリスの「三枚舌外交」）は、戦後の中東の国境線とパレスチナ問題の原因となった" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Landing_of_Australian_troops_at_ANZAC_Cove%2C_25_April_1915_slnsw.jpg/960px-Landing_of_Australian_troops_at_ANZAC_Cove%2C_25_April_1915_slnsw.jpg", caption: "ガリポリ半島に上陸するオーストラリア軍（1915年4月25日）",
        alt: "海岸に小舟で次々と兵士が上陸していく様子を写した写真",
        credit: "Landing of Australian troops at ANZAC Cove／Brookes（1915年）, State Library of New South Wales, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/FeisalPartyAtVersaillesCopy.jpg/960px-FeisalPartyAtVersaillesCopy.jpg", caption: "パリ講和会議に臨むアラブの指導者ファイサル（中央）と一行（1919年）",
        alt: "建物の階段の前で、アラブの民族衣装の男性を中心に軍服の人々が並ぶ集合写真",
        credit: "Feisal party at Versailles／Lowell Thomas（1919年）, Wikimedia Commons・Public domain" },
    ],
    anecdote: "豆知識：アラブの反乱に加わったイギリスの考古学者T・E・ロレンスは「アラビアのロレンス」と呼ばれ、のちに映画の題材にもなった。写真の一行の中にも彼の姿がある。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/フサイン＝マクマホン協定",
  },
  {
    id: "c88", year: 1917, difficulty: 1, era: "近代（帝国主義と世界大戦）", region: "アメリカ合衆国", theme: ["通史", "世界大戦"],
    front: "1917年にアメリカが参戦する理由となったドイツの作戦と、「十四か条」の平和原則を発表した大統領は？",
    back: "",
    cloze: {
      template: "1917年、ドイツが中立国の船も攻撃する{{1}}作戦を始めたことなどを理由に、アメリカは連合国側で参戦した。翌1918年、大統領{{2}}は秘密外交の廃止や民族自決、国際平和機構の設立などを含む「十四か条」の平和原則を発表した。",
      slots: [
        { id: 1, answer: "無制限潜水艦", category: "作戦" },
        { id: 2, answer: "ウィルソン", category: "人物" },
      ],
      points: [
        { label: "原因", text: "1915年に客船ルシタニア号が撃沈されてアメリカ人の犠牲者が出るなど、ドイツへの反感が高まっていた" },
        { label: "経過", text: "アメリカの大量の兵力と物資が投入されたことで、行き詰まっていた西部戦線の均衡が崩れ、1918年11月にドイツは休戦に応じた" },
        { label: "意義", text: "大統領の提案は国際連盟の設立につながったが、アメリカ自身は議会の反対で連盟に加盟しなかった。戦後のアメリカは世界最大の債権国となった" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Woodrow_Wilson_in_1919.jpg/960px-Woodrow_Wilson_in_1919.jpg", caption: "ウィルソン大統領（1919年）",
        alt: "眼鏡をかけ、背広を着た細面の男性の肖像写真",
        credit: "Woodrow Wilson／Harris & Ewing（1919年）, Library of Congress, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/J._M._Flagg%2C_I_Want_You_for_U.S._Army_poster_%281917%29.jpg/960px-J._M._Flagg%2C_I_Want_You_for_U.S._Army_poster_%281917%29.jpg", caption: "フラッグ「アメリカ陸軍はきみを求めている」の募兵ポスター（1917年）",
        alt: "星条旗柄の帽子をかぶった白いひげの男性が、こちらを指さしている有名なポスター",
        credit: "I Want You for U.S. Army／James Montgomery Flagg（1917年）, Wikimedia Commons・Public domain" },
    ],
    anecdote: "豆知識：ポスターの人物「アンクル・サム」はアメリカ合衆国（United States）の頭文字USにちなむ擬人化で、作者フラッグは自分の顔をもとに描いたといわれる。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/十四か条の平和原則",
  },
  {
    id: "c86", year: 1917, difficulty: 0, era: "近代（帝国主義と世界大戦）", region: "ロシア帝国", theme: ["通史", "世界大戦"],
    front: "1917年の十月革命でソヴィエト政権を樹立した指導者と、新政権がドイツと結んで大戦から離脱した条約は？",
    back: "",
    cloze: {
      template: "1917年3月の二月革命で帝政が倒れ、11月の十月革命では{{1}}の率いるボリシェヴィキが臨時政府を倒してソヴィエト政権を樹立した。新政権は1918年、ドイツと{{2}}条約を結んで大戦から離脱した。",
      slots: [
        { id: 1, answer: "レーニン", category: "人物" },
        { id: 2, answer: "ブレスト＝リトフスク", category: "条約" },
      ],
      points: [
        { label: "原因", text: "大戦の長期化で前線では敗北が続き、首都では食料不足と物価高騰に苦しむ労働者や兵士の不満が爆発した" },
        { label: "経過", text: "新政権は「平和に関する布告」で即時講和を、「土地に関する布告」で地主の土地の没収を宣言した。広大な領土を失う講和にも応じた" },
        { label: "意義", text: "世界初の社会主義政権が誕生し、1922年にはソヴィエト社会主義共和国連邦（ソ連）が成立した。資本主義国は干渉戦争を起こしてこれを封じ込めようとした" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/After_Lenin_Speech_1920.jpg/960px-After_Lenin_Speech_1920.jpg", caption: "モスクワで兵士たちに演説した直後のレーニン（1920年）",
        alt: "広場に設けられた演壇の周りを、兵士や群衆が取り囲む写真",
        credit: "After Lenin's speech／Grigory Goldstein（1920年）, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/First_Red_Guards_in_Petrograd%2C_fall_1917_cropped.jpg/960px-First_Red_Guards_in_Petrograd%2C_fall_1917_cropped.jpg", caption: "ペトログラードの赤衛軍（1917年秋）",
        alt: "銃を肩にかけ、赤旗を掲げて並ぶ労働者の武装部隊の写真",
        credit: "First Red Guards in Petrograd／作者不詳（1917年）, Wikimedia Commons・Public domain" },
    ],
    anecdote: "豆知識：ロシアは当時ユリウス暦を使っていたため、西暦（グレゴリオ暦）では3月と11月の革命が、ロシアではそれぞれ「二月革命」「十月革命」と呼ばれる。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ロシア革命",
  },
  {
    id: "c84", year: 1918, difficulty: 2, era: "近代（帝国主義と世界大戦）", region: "ドイツ帝国", theme: ["通史", "世界大戦"],
    front: "1914年にドイツ軍のフランス侵攻を食い止めた戦いと、1918年にドイツ革命のきっかけとなった水兵反乱の起きた軍港は？",
    back: "",
    cloze: {
      template: "ドイツは中立国ベルギーを通ってフランスを短期間で破ろうとしたが、1914年の{{1}}の戦いで阻まれ、西部戦線は長い塹壕戦となった。1918年11月、{{2}}軍港の水兵反乱をきっかけにドイツ革命が起こり、皇帝は退位して休戦協定が結ばれた。",
      slots: [
        { id: 1, answer: "マルヌ", category: "戦い" },
        { id: 2, answer: "キール", category: "軍港" },
      ],
      points: [
        { label: "原因", text: "東西の二正面作戦を避けるため、ドイツはまずフランスを速攻で倒し、その後ロシアと戦う計画を立てていた" },
        { label: "経過", text: "西部戦線では機関銃と鉄条網に守られた塹壕を挟んで膠着が続き、ヴェルダンやソンムの戦いでは数十万人の死傷者が出た" },
        { label: "意義", text: "帝政が倒れてドイツ共和国（ヴァイマル共和国）が成立した。敗戦国ドイツは1919年のヴェルサイユ条約で、巨額の賠償金と領土の割譲を課された" },
      ],
    },
    images: [
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Breastwork_trench_at_Armentieres_1916.jpg/960px-Breastwork_trench_at_Armentieres_1916.jpg", caption: "西部戦線の塹壕（1916年、フランス北部アルマンティエール）",
        alt: "土嚢を積み上げた塹壕の中で、兵士たちが休んでいる白黒写真",
        credit: "Breastwork trench at Armentières／イギリス軍公式写真（1916年）, Imperial War Museum, Wikimedia Commons・Public domain" },
      { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Kieler_Matrosenaufstand_%28Kiel_68.288%29.jpg/960px-Kieler_Matrosenaufstand_%28Kiel_68.288%29.jpg", caption: "キール軍港の水兵反乱（1918年11月）",
        alt: "広場を埋めつくす水兵や市民の群衆を写した白黒写真",
        credit: "Kieler Matrosenaufstand／写真: Ernst Meyer（1918年）, Stadtarchiv Kiel, Wikimedia Commons・CC BY-SA 3.0 de" },
    ],
    anecdote: "豆知識：開戦直後、フランス軍はパリのタクシーを大量に動員して兵士を前線へ運んだ。この「マルヌのタクシー」は、総力戦の象徴として語り継がれている。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ドイツ革命",
  },
];

// 古代（オリエント・ギリシャ・ローマ）のカード。
// 古代オリエント（前3000年〜）から、ギリシアのポリス世界とヘレニズム、ローマの共和政・帝政とパクス・ロマーナまでを扱う。
// 地図の古代の時代区分（ancient-civilizations／ancient-empires）にはまだ勢力ポリゴンがないため、region は
// 将来その地図データを作成する際の勢力IDとして使う名前で統一している（メソポタミア／エジプト／ギリシア／
// アケメネス朝ペルシア／マケドニア／ローマ／カルタゴ）。地図データを作るときは、この region と同じIDを勢力に付けること。
export const ANCIENT_CARDS = [
  {
    id: "c27", year: -1750, difficulty: 0, era: "古代（オリエント・地中海・アジア）", region: "メソポタミア", theme: ["通史", "古代オリエント"],
    front: "前18世紀にハンムラビ王が定めた法典と、その刑罰の原則は？",
    back: "",
    cloze: {
      template: "前18世紀ごろ、バビロン第1王朝のハンムラビ王はメソポタミアを統一し、「目には目を、歯には歯を」で知られる{{1}}を定めた。この法典は{{2}}の原則に立つ一方、刑罰は被害者と加害者の身分によって異なった。",
      slots: [
        { id: 1, answer: "ハンムラビ法典", category: "法典" },
        { id: 2, answer: "同害復讐", category: "原則" },
      ],
      points: [
        { label: "原因", text: "多くの民族・都市を統合した広大な国家を治めるため、王が統一的な法と裁判の基準を示す必要があった" },
        { label: "経過", text: "法典は楔形文字で石碑に刻まれ、商業・家族・農業など生活全般にわたる282条の規定を定めた" },
        { label: "意義", text: "王が神から授かった法で正義を実現するという考え方を示し、現存する古代の法典として最も体系的なものの一つとなった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/P1050763_Louvre_code_Hammurabi_face_rwk.JPG/960px-P1050763_Louvre_code_Hammurabi_face_rwk.JPG",
        caption: "ハンムラビ法典碑（前18世紀、バビロン第1王朝。ルーヴル美術館）",
        alt: "楔形文字がびっしりと刻まれた、高さ2メートルを超える黒い玄武岩の石碑",
        credit: "Code of Hammurabi, Musée du Louvre／写真: Mbzt（2011年）, Wikimedia Commons・CC BY 3.0",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/5/55/Milkau_Oberer_Teil_der_Stele_mit_dem_Text_von_Hammurapis_Gesetzescode_369-2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
        caption: "ハンムラビ法典碑の上部浮き彫り：玉座の太陽神シャマシュ（右）と向き合うハンムラビ王",
        alt: "石碑の上部に浮き彫りされた、玉座に座る神と、その前に立って手を挙げる王の姿",
        credit: "Oberer Teil der Stele mit dem Text von Hammurapis Gesetzescode／Milkau『Geschichte der Bibliotheken im alten Orient』（1929年）, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：法典碑は前12世紀にエラム人が戦利品として持ち去ったため、メソポタミアではなくイランのスサで1901年に発見された。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ハンムラビ法典",
  },
  {
    id: "c28", year: -2550, difficulty: 0, era: "古代（オリエント・地中海・アジア）", region: "エジプト", theme: ["通史", "古代オリエント"],
    front: "ヘロドトスが「エジプトは〇〇のたまもの」と記した川と、古代エジプトの王の称号は？",
    back: "",
    cloze: {
      template: "ギリシアの歴史家ヘロドトスが「エジプトは{{1}}のたまもの」と記したように、エジプトでは毎年の川の氾濫がもたらす肥沃な土のもとで農耕文明が栄えた。王は{{2}}と呼ばれ、太陽神ラーの子として神権政治を行い、古王国時代にはギザに巨大なピラミッドが築かれた。",
      slots: [
        { id: 1, answer: "ナイル", category: "川" },
        { id: 2, answer: "ファラオ", category: "称号" },
      ],
      points: [
        { label: "原因", text: "定期的な氾濫を利用した農業には、治水や暦の作成、土地の測量を一元的に管理する強力な王権が必要だった" },
        { label: "経過", text: "前3000年ごろに上下エジプトが統一され、古王国・中王国・新王国の時代を通じて約30の王朝が続いた" },
        { label: "意義", text: "太陽暦や測地術、神聖文字（ヒエログリフ）など、のちの地中海世界に受け継がれる知識と技術が生まれた" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/All_Gizah_Pyramids.jpg/960px-All_Gizah_Pyramids.jpg",
        caption: "ギザの三大ピラミッド（古王国時代・第4王朝、前26世紀ごろ）",
        alt: "砂漠に並ぶ大小のピラミッド群。手前に小さな王妃のピラミッドが3基並ぶ",
        credit: "All Gizah Pyramids／写真: Ricardo Liberato（2006年）, Wikimedia Commons・CC BY-SA 2.0",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Great_Sphinx_of_Giza_%28%D8%A3%D8%A8%D9%88_%D8%A7%D9%84%D9%87%D9%88%D9%84%29.jpg/960px-Great_Sphinx_of_Giza_%28%D8%A3%D8%A8%D9%88_%D8%A7%D9%84%D9%87%D9%88%D9%84%29.jpg",
        caption: "ギザの大スフィンクス（古王国時代・第4王朝、前26世紀ごろ）",
        alt: "人の頭とライオンの体をもつ巨大な石像。背後にピラミッドがそびえる",
        credit: "Great Sphinx of Giza／写真: Petar Milošević（2023年）, Wikimedia Commons・CC BY-SA 4.0",
      },
    ],
    anecdote: "豆知識：ヒエログリフは長く読めない文字だったが、ナポレオンのエジプト遠征で見つかったロゼッタ・ストーンをもとに、1822年にフランスのシャンポリオンが解読した。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/古代エジプト",
  },
  {
    id: "c29", year: -443, difficulty: 1, era: "古代（オリエント・地中海・アジア）", region: "ギリシア", theme: ["通史", "古代ギリシア"],
    front: "アテネ民主政を最盛期に導いた指導者と、国家の最高議決機関は？",
    back: "",
    cloze: {
      template: "前5世紀半ば、将軍{{1}}の指導のもとでアテネ民主政は最盛期を迎え、成年男性市民全員が参加する{{2}}が国家の最高議決機関となった。",
      slots: [
        { id: 1, answer: "ペリクレス", category: "人物" },
        { id: 2, answer: "民会", category: "機関" },
      ],
      points: [
        { label: "原因", text: "ペルシア戦争で、武具を自弁できない無産市民も軍船の漕ぎ手として活躍し、政治的な発言力を高めた" },
        { label: "経過", text: "将軍職などを除く役職の多くは市民の中から抽選で選ばれ、陶片追放で独裁者の出現を防いだ" },
        { label: "意義", text: "市民が直接政治に参加する直接民主政が実現したが、女性・奴隷・在留外人には参政権がなかった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Attica_06-13_Athens_50_View_from_Philopappos_-_Acropolis_Hill.jpg/960px-Attica_06-13_Athens_50_View_from_Philopappos_-_Acropolis_Hill.jpg",
        caption: "アテネのアクロポリスとパルテノン神殿（前5世紀、ペリクレス時代に再建）",
        alt: "丘の上に建つパルテノン神殿などの遺跡群を、緑の木々越しに遠望した写真",
        credit: "Athens, Acropolis Hill／写真: A.Savin（2013年）, Wikimedia Commons・CC BY-SA 3.0",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Pericles_Pio-Clementino_Inv269.jpg/960px-Pericles_Pio-Clementino_Inv269.jpg",
        caption: "ペリクレスの胸像（クレシラス作の原像をローマ時代に模刻。ヴァチカン美術館）",
        alt: "兜を額の上に押し上げてかぶった、あごひげの男性の大理石の胸像",
        credit: "Pericles, Museo Pio-Clementino／クレシラス作の模刻, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：陶片追放（オストラキスモス）では、独裁者になるおそれのある人物の名を陶器のかけらに書いて投票した。名前の刻まれた陶片は、現在もアテネのアゴラから数多く出土している。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/陶片追放",
  },
  {
    id: "c30", year: -480, difficulty: 2, era: "古代（オリエント・地中海・アジア）", region: "アケメネス朝ペルシア", theme: ["通史", "古代ギリシア"],
    front: "ペルシア戦争でギリシア側が勝利した、前490年の戦いと前480年の海戦は？",
    back: "",
    cloze: {
      template: "前5世紀前半、アケメネス朝ペルシアの侵攻に対し、アテネを中心とするギリシア諸ポリスは、前490年の{{1}}の戦い、前480年の{{2}}の海戦で勝利した。",
      slots: [
        { id: 1, answer: "マラトン", category: "戦い" },
        { id: 2, answer: "サラミス", category: "海戦" },
      ],
      points: [
        { label: "原因", text: "ペルシア支配下のイオニア地方のギリシア人植民市が反乱を起こし、アテネがこれを支援した" },
        { label: "経過", text: "テミストクレスの指導で三段櫂船の艦隊を整えたアテネが、狭い海峡にペルシア艦隊を誘い込んで撃破した" },
        { label: "意義", text: "勝利後、アテネはデロス同盟の盟主として繁栄し、漕ぎ手を務めた無産市民の地位向上が民主政の完成につながった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Kaulbach%2C_Wilhelm_von_-_Die_Seeschlacht_bei_Salamis_-_1868.JPG/960px-Kaulbach%2C_Wilhelm_von_-_Die_Seeschlacht_bei_Salamis_-_1868.JPG",
        caption: "カウルバッハ「サラミスの海戦」（1868年）",
        alt: "荒れる海上で、ギリシア軍がペルシア軍の船に襲いかかる様子を劇的に描いた油彩画",
        credit: "Die Seeschlacht bei Salamis／Wilhelm von Kaulbach（1868年）, Maximilianeum, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Triere_Olympias_at_Paleon_Faliron_Museum.JPG/960px-Triere_Olympias_at_Paleon_Faliron_Museum.JPG",
        caption: "復元された三段櫂船「オリンピアス」（古代ギリシアの軍船、アテネ近郊パレオ・ファリロ）",
        alt: "屋根付きの展示場に置かれた、細長い木造の古代軍船の復元船",
        credit: "Trireme Olympias／写真: Filos96（2008年）, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：勝利の知らせを伝えるため、兵士が戦場からアテネまで約40kmを走り抜き、到着と同時に息絶えたという伝説が、陸上競技「マラソン」の由来とされる。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ペルシア戦争",
  },
  {
    id: "c31", year: -330, difficulty: 2, era: "古代（オリエント・地中海・アジア）", region: "マケドニア", theme: ["通史", "古代ギリシア"],
    front: "東方遠征でアケメネス朝を滅ぼしたマケドニアの王と、その結果生まれた文化は？",
    back: "",
    cloze: {
      template: "マケドニアの{{1}}大王は前334年に東方遠征を開始し、アケメネス朝ペルシアを滅ぼしてインダス川流域に至る大帝国を築いた。この結果、ギリシア文化とオリエント文化が融合した{{2}}文化が生まれた。",
      slots: [
        { id: 1, answer: "アレクサンドロス", category: "人物" },
        { id: 2, answer: "ヘレニズム", category: "文化" },
      ],
      points: [
        { label: "原因", text: "前338年のカイロネイアの戦いで、父フィリッポス2世がアテネ・テーベ連合軍を破り、ギリシアを支配下に置いていた" },
        { label: "経過", text: "イッソスの戦いでペルシア王ダレイオス3世を破り、征服地の各地にアレクサンドリアと名付けた都市を建設した" },
        { label: "意義", text: "大王の死後、帝国は分裂したが、ギリシア語が共通語となり、ポリスの枠を超えた世界市民主義（コスモポリタニズム）が広まった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Alexander_and_Bucephalus_-_Battle_of_Issus_mosaic_-_Museo_Archeologico_Nazionale_-_Naples_BW.jpg/960px-Alexander_and_Bucephalus_-_Battle_of_Issus_mosaic_-_Museo_Archeologico_Nazionale_-_Naples_BW.jpg",
        caption: "「アレクサンドロス・モザイク」（部分、ポンペイ出土・前100年ごろ）：イッソスの戦いで愛馬にまたがる大王",
        alt: "色とりどりの石片で描かれた、馬上で槍を構えて前方をにらむ若い王",
        credit: "Alexander Mosaic（detail）, Museo Archeologico Nazionale di Napoli／作者不詳（前100年ごろ）, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Venus_de_Milo_Louvre_Ma399_n4.jpg/960px-Venus_de_Milo_Louvre_Ma399_n4.jpg",
        caption: "「ミロのヴィーナス」（ヘレニズム時代、前2世紀後半。ルーヴル美術館）",
        alt: "両腕を失った、腰に布をまとう女神の大理石像",
        credit: "Vénus de Milo, Musée du Louvre／作者不詳（前2世紀後半）, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "逸話：少年時代の家庭教師は哲学者アリストテレスだった。大王は東方遠征の途上、わずか32歳でバビロンで病没した。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ヘレニズム",
  },
  {
    id: "c32", year: -287, difficulty: 3, era: "古代（オリエント・地中海・アジア）", region: "ローマ", theme: ["通史", "古代ローマ"],
    front: "共和政ローマで貴族が政治の拠点とした機関と、身分闘争を決着させた前287年の法は？",
    back: "",
    cloze: {
      template: "前509年に王を追放したローマは共和政となり、貴族（パトリキ）が{{1}}を拠点に政治を主導した。平民（プレブス）との身分闘争の末、前287年の{{2}}法で平民会の決議が国法と認められ、法の上で平民と貴族は対等になった。",
      slots: [
        { id: 1, answer: "元老院", category: "機関" },
        { id: 2, answer: "ホルテンシウス", category: "法" },
      ],
      points: [
        { label: "原因", text: "重装歩兵として国防を担うようになった平民が、その負担に見合う政治参加を求めた" },
        { label: "経過", text: "護民官と平民会の設置、成文法である十二表法、執政官（コンスル）の1人を平民から選ぶリキニウス・セクスティウス法と、段階的に権利を獲得した" },
        { label: "意義", text: "ただし実際には、貴族と富裕な平民からなる新貴族（ノビレス）が元老院を通じて政治を握り続けた" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Cicero_Denounces_Catiline_in_the_Roman_Senate_by_Cesare_Maccari.png/960px-Cicero_Denounces_Catiline_in_the_Roman_Senate_by_Cesare_Maccari.png",
        caption: "マッカリ「元老院でカティリナを弾劾するキケロ」（1880年代、ローマのマダマ宮殿）",
        alt: "半円形に並ぶ議席に白いトーガ姿の議員たちが座り、中央で演説者が一人の男を指さして糾弾する場面",
        credit: "Cicerone denuncia Catilina／Cesare Maccari（1880年代）, Palazzo Madama, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Forum_romanum_6k_%285760x2097%29.jpg/960px-Forum_romanum_6k_%285760x2097%29.jpg",
        caption: "フォロ・ロマーノ（古代ローマの政治・宗教・商業の中心となった広場の遺跡）",
        alt: "凱旋門や神殿の柱が立ち並ぶ、古代ローマの広場の遺跡のパノラマ写真",
        credit: "Forum Romanum／写真: BeBo86（2012年）, Wikimedia Commons・CC BY-SA 3.0",
      },
    ],
    anecdote: "豆知識：ローマの軍旗や公共建築に刻まれた「SPQR」は、ラテン語で「元老院とローマの人民」を意味する。現在もローマ市の紋章やマンホールのふたに使われている。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/共和政ローマ",
  },
  {
    id: "c33", year: -218, difficulty: 2, era: "古代（オリエント・地中海・アジア）", region: "カルタゴ", theme: ["通史", "古代ローマ"],
    front: "ポエニ戦争でローマと戦った北アフリカの国家と、アルプスを越えてイタリアに侵入した名将は？",
    back: "",
    cloze: {
      template: "西地中海の覇権をめぐり、ローマはフェニキア人の植民市{{1}}と3回にわたるポエニ戦争を戦った。第2回では名将{{2}}がアルプスを越えてイタリアに侵入し、カンネーの戦いでローマ軍に大勝したが、最終的にローマが勝利した。",
      slots: [
        { id: 1, answer: "カルタゴ", category: "国家" },
        { id: 2, answer: "ハンニバル", category: "人物" },
      ],
      points: [
        { label: "原因", text: "イタリア半島を統一したローマが、地中海交易で栄えるカルタゴとシチリア島の支配をめぐって衝突した" },
        { label: "経過", text: "前202年のザマの戦いでスキピオがハンニバルを破り、前146年の第3回でカルタゴは完全に滅ぼされた" },
        { label: "意義", text: "海外の属州から富と奴隷が流れ込んで大土地所有（ラティフンディア）が広がり、中小農民の没落が共和政の動揺を招いた" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Hannibal_traverse_le_Rh%C3%B4ne_Henri_Motte_1878.jpg/960px-Hannibal_traverse_le_Rh%C3%B4ne_Henri_Motte_1878.jpg",
        caption: "アンリ＝ポール・モット「ローヌ川を渡るハンニバルの軍勢」（1878年）",
        alt: "筏に乗せられた戦象の群れと兵士たちが、大河を渡っていく様子を描いた白黒の絵",
        credit: "Hannibal traverse le Rhône／Henri-Paul Motte（1878年）, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：ハンニバルは37頭の戦象を率いてイベリア半島を出発し、雪のアルプスを越えたと伝えられる。しかし寒さと険しい道で、象のほとんどは越冬中に死んでしまった。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ポエニ戦争",
  },
  {
    id: "c34", year: -44, difficulty: 1, era: "古代（オリエント・地中海・アジア）", region: "ローマ", theme: ["通史", "古代ローマ"],
    front: "カエサルがルビコン川を渡るときに言ったとされる名言と、彼を暗殺した共和派の中心人物は？",
    back: "",
    cloze: {
      template: "前49年、カエサルは「{{1}}」と言って軍を率いてルビコン川を渡り、ポンペイウスとの内戦に勝利して独裁官となった。しかし前44年、共和政の擁護を掲げる{{2}}らによって、ポンペイウス劇場に付属する議場で暗殺された。",
      slots: [
        { id: 1, answer: "賽は投げられた", category: "名言" },
        { id: 2, answer: "ブルートゥス", category: "人物" },
      ],
      points: [
        { label: "原因", text: "ポンペイウス・クラッススと結んだ第1回三頭政治で権力を握り、ガリア遠征の成功で名声と強大な軍事力を得た" },
        { label: "経過", text: "独裁官として、エジプトの太陽暦をもとにしたユリウス暦の採用など、多くの改革を進めた" },
        { label: "意義", text: "王政の復活を恐れた共和派に暗殺されたが、その後の内乱を経て、ローマは共和政から帝政へと移行していく" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Jean-L%C3%A9on_G%C3%A9r%C3%B4me_-_The_Death_of_Caesar_-_Walters_37884.jpg/960px-Jean-L%C3%A9on_G%C3%A9r%C3%B4me_-_The_Death_of_Caesar_-_Walters_37884.jpg",
        caption: "ジェローム「カエサルの死」（1859〜1867年）",
        alt: "暗殺直後の議場。床に横たわる遺体を残し、短剣を掲げた男たちが歓声を上げて立ち去っていく",
        credit: "La Mort de César／Jean-Léon Gérôme（1859〜1867年）, Walters Art Museum, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Head_of_Julius_Caesar_from_Tusculum_MAntTorino_2089_n01.jpg/960px-Head_of_Julius_Caesar_from_Tusculum_MAntTorino_2089_n01.jpg",
        caption: "カエサルの肖像（トゥスクルム出土、前1世紀半ば。トリノ古代博物館）",
        alt: "やせた頬と深いしわが刻まれた、年配の男性の大理石の頭部像",
        credit: "Head of Julius Caesar from Tusculum, Museo di Antichità di Torino／写真: Marie-Lan Taÿ Pamart, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "名言：暗殺の場面の「ブルートゥス、お前もか」は、シェイクスピアの戯曲『ジュリアス・シーザー』の台詞として有名。ほかにも戦勝報告の「来た、見た、勝った」が知られ、英語の「July（7月）」は彼の名に由来する。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ガイウス・ユリウス・カエサル",
  },
  {
    id: "c35", year: -27, difficulty: 3, era: "古代（オリエント・地中海・アジア）", region: "ローマ", theme: ["通史", "古代ローマ"],
    front: "オクタウィアヌスが元老院から受けた称号と、彼が始めた政治体制は？",
    back: "",
    cloze: {
      template: "カエサルの養子オクタウィアヌスは、前31年のアクティウムの海戦でアントニウスとクレオパトラを破り、前27年に{{1}}（尊厳者）の称号を受けた。彼は共和政の形式を尊重しつつ、「市民の中の第一人者」として実権を握る{{2}}（元首政）を始めた。",
      slots: [
        { id: 1, answer: "アウグストゥス", category: "称号" },
        { id: 2, answer: "プリンキパトゥス", category: "政治体制" },
      ],
      points: [
        { label: "原因", text: "グラックス兄弟の改革の失敗以来、約100年にわたる「内乱の一世紀」が続き、社会は安定を強く求めていた" },
        { label: "経過", text: "前30年にプトレマイオス朝エジプトを滅ぼして地中海世界を統一し、全軍の指揮権と多くの官職を一身に集めた" },
        { label: "意義", text: "実質的な帝政（ローマ帝国）が始まり、以後約200年にわたる安定と繁栄の時代の出発点となった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Statue-Augustus.jpg/960px-Statue-Augustus.jpg",
        caption: "「プリマポルタのアウグストゥス」（1世紀初め。ヴァチカン美術館）",
        alt: "胸当てを着けた鎧姿で右手を高く挙げ、兵士に語りかけるように立つ皇帝の大理石像",
        credit: "Augustus of Prima Porta, Musei Vaticani／写真: Till Niermann（2007年）, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Ara_Pacis_Rom.jpg/960px-Ara_Pacis_Rom.jpg",
        caption: "アラ・パキス（平和の祭壇、前9年奉献。ローマ）",
        alt: "行列や草花の浮き彫りで飾られた、白い大理石の箱形の祭壇",
        credit: "Ara Pacis Augustae／写真: Manfred Heyde（2009年）, Wikimedia Commons・CC BY-SA 3.0",
      },
    ],
    anecdote: "豆知識：英語の「August（8月）」は、彼の称号アウグストゥスに由来する。本人は「皇帝」を名乗らず、あくまで「プリンケプス（第一人者）」と称した。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/アウグストゥス",
  },
  {
    id: "c36", year: 117, difficulty: 2, era: "古代（オリエント・地中海・アジア）", region: "ローマ", theme: ["通史", "古代ローマ"],
    front: "帝政開始から約200年間続いたローマの平和を何と呼ぶか？また、帝国の領土が最大となった皇帝は？",
    back: "",
    cloze: {
      template: "前1世紀末の帝政の開始から約200年間、ローマ帝国は「{{1}}（ローマの平和）」と呼ばれる平和と繁栄を享受した。五賢帝の一人である{{2}}帝の時代に、帝国の領土は最大となった。",
      slots: [
        { id: 1, answer: "パクス・ロマーナ", category: "時代" },
        { id: 2, answer: "トラヤヌス", category: "人物" },
      ],
      points: [
        { label: "原因", text: "皇帝のもとで内乱が収まり、国境の防衛と属州の統治が安定した" },
        { label: "経過", text: "帝国各地を結ぶ道路網や水道が整備され、212年にはカラカラ帝が帝国内の全自由民にローマ市民権を与えた" },
        { label: "意義", text: "ローマ法・ラテン語・建築技術が帝国全域に広まり、のちのヨーロッパ文明の基盤となった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Colosseum_of_Rome_and_Roman_forum.jpg/960px-Colosseum_of_Rome_and_Roman_forum.jpg",
        caption: "コロッセウム（円形闘技場、80年完成。ローマ）",
        alt: "アーチが幾層にも連なる巨大な楕円形の闘技場の遺跡を、木々の向こうに望む写真",
        credit: "Colosseum of Rome and Roman Forum／写真: Wilfredor（2024年）, Wikimedia Commons・CC0",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Pont_du_Gard_BLS.jpg/960px-Pont_du_Gard_BLS.jpg",
        caption: "ポン・デュ・ガール（1世紀、南フランスに残るローマの水道橋）",
        alt: "川をまたいで3層のアーチが連なる、石造りの巨大な水道橋",
        credit: "Pont du Gard／写真: Benh LIEU SONG（2014年）, Wikimedia Commons・CC BY-SA 3.0",
      },
    ],
    anecdote: "豆知識：「すべての道はローマに通ず」ということわざは、帝国中に張り巡らされた道路網に由来する。五賢帝最後のマルクス・アウレリウス・アントニヌスは、ストア派の哲学者として『自省録』を残した。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/パクス・ロマーナ",
  },
];

// 近世（大航海時代・ルネサンス・宗教改革）のカード。
// 14〜16世紀のイタリア・ルネサンス、ルター・カルヴァンの宗教改革、ポルトガル・スペインの大航海時代と新大陸の征服を扱う。
// region は、Step 2 で作成予定のこの時代の地図（中世②／大航海時代・近世の時代区分）の勢力IDとして使う名前で統一している：
//   フィレンツェ／ミラノ公国／ローマ教皇領（イタリア諸国家）、神聖ローマ帝国、ジュネーヴ、ポルトガル王国、スペイン王国、アステカ帝国。
// 地図データを作るときは、この region と同じIDを勢力に付けること。c46 はアステカとインカの両方を扱うが、
// region は先に征服されたアステカ帝国とした（インカ帝国は地図上の勢力として定義し、カードは今後追加する）。
export const RENAISSANCE_CARDS = [
  {
    id: "c37", year: 1485, difficulty: 1, era: "近世（大航海時代・ルネサンス・宗教改革）", region: "フィレンツェ", theme: ["通史", "ルネサンス"],
    front: "ルネサンスの中心地フィレンツェで学芸を保護した一族と、『ヴィーナスの誕生』を描いた画家は？",
    back: "",
    cloze: {
      template: "14世紀のイタリアに始まったルネサンスの中心地フィレンツェでは、銀行業で富を築いた{{1}}家が芸術家や学者を保護した。その庇護のもとで{{2}}は、ギリシア神話を題材とした『ヴィーナスの誕生』や『春（プリマヴェーラ）』を描いた。",
      slots: [
        { id: 1, answer: "メディチ", category: "一族" },
        { id: 2, answer: "ボッティチェリ", category: "画家" },
      ],
      points: [
        { label: "原因", text: "東方貿易や毛織物業・金融業で栄えたイタリア諸都市では、富裕な市民が新しい文化の担い手となった" },
        { label: "経過", text: "衰退するビザンツ帝国から移り住んだギリシア人学者がもたらした古典研究が、人間性を重んじる人文主義を刺激した" },
        { label: "意義", text: "神を中心とする中世的な世界観から、人間の個性や現世の生を肯定する近代的な価値観への転換点となった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/960px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg",
        caption: "ボッティチェリ『ヴィーナスの誕生』（1485年頃、ウフィツィ美術館）",
        alt: "貝殻の上に立つ裸身の女神が、風の神に吹かれて岸辺へ運ばれてくる場面",
        credit: "La nascita di Venere／Sandro Botticelli（1485年頃）, Galleria degli Uffizi, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Portrait_of_Lorenzo_de%27_Medici%2C_the_Magnificent_%281449%E2%80%931492%29%2C_by_Giorgio_Vasari_-_Uffizi_Gallery.jpg/960px-Portrait_of_Lorenzo_de%27_Medici%2C_the_Magnificent_%281449%E2%80%931492%29%2C_by_Giorgio_Vasari_-_Uffizi_Gallery.jpg",
        caption: "ヴァザーリ「ロレンツォ・デ・メディチの肖像」（16世紀、ウフィツィ美術館）",
        alt: "黒い服をまとい、物思いにふけるように椅子に座る男性の肖像",
        credit: "Ritratto di Lorenzo il Magnifico／Giorgio Vasari（1533〜1534年頃）, Galleria degli Uffizi, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "逸話：最盛期の当主ロレンツォは「豪華王（イル・マニフィコ）」と呼ばれ、自ら詩も作る教養人だった。一族からは、のちにレオ10世ら複数のローマ教皇も出ている。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/メディチ家",
  },
  {
    id: "c38", year: 1503, difficulty: 0, era: "近世（大航海時代・ルネサンス・宗教改革）", region: "ミラノ公国", theme: ["通史", "ルネサンス"],
    front: "『最後の晩餐』『モナ・リザ』を描いた芸術家と、ルネサンスが理想とした人間像は？",
    back: "",
    cloze: {
      template: "{{1}}は『最後の晩餐』『モナ・リザ』などの名画を残しただけでなく、解剖学・工学・天文学など幅広い分野に通じ、ルネサンスが理想とした「{{2}}（普遍人）」の典型とされる。",
      slots: [
        { id: 1, answer: "レオナルド・ダ・ヴィンチ", category: "人物" },
        { id: 2, answer: "万能人", category: "人間像" },
      ],
      points: [
        { label: "原因", text: "ルネサンスの人文主義は、人間がもつ多様な能力を最大限に伸ばすことを理想とした" },
        { label: "経過", text: "フィレンツェで修業したのちミラノ公に仕え、晩年はフランス王フランソワ1世に招かれてフランスで没した" },
        { label: "意義", text: "遠近法や解剖学にもとづく写実的な表現を確立し、観察と実験を重んじる近代科学の精神の先駆けともなった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/960px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
        caption: "レオナルド・ダ・ヴィンチ『モナ・リザ』（1503〜1519年頃、ルーヴル美術館）",
        alt: "風景を背に、胸の前で手を重ねてほほえむ女性の半身像",
        credit: "La Joconde／Leonardo da Vinci（1503〜1519年頃）, Musée du Louvre, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Leonardo_da_Vinci_%281452-1519%29_-_The_Last_Supper_%281495-1498%29.jpg/960px-Leonardo_da_Vinci_%281452-1519%29_-_The_Last_Supper_%281495-1498%29.jpg",
        caption: "レオナルド・ダ・ヴィンチ『最後の晩餐』（1495〜1498年、ミラノのサンタ・マリア・デッレ・グラツィエ修道院）",
        alt: "長い食卓の中央に座るキリストと、その左右で驚き動揺する12人の弟子たちを描いた壁画",
        credit: "L'Ultima Cena／Leonardo da Vinci（1495〜1498年）, Santa Maria delle Grazie, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：手稿（ノート）は、鏡に映さないと読めない左右反転の「鏡文字」で書かれ、ヘリコプターや戦車の構想まで描き残されている。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/レオナルド・ダ・ヴィンチ",
  },
  {
    id: "c39", year: 1512, difficulty: 2, era: "近世（大航海時代・ルネサンス・宗教改革）", region: "ローマ教皇領", theme: ["通史", "ルネサンス"],
    front: "『ダヴィデ像』を制作し、ローマで巨大な天井画を描いた芸術家と、その礼拝堂は？",
    back: "",
    cloze: {
      template: "フィレンツェ出身の{{1}}は、大理石の『ダヴィデ像』を制作したのち、ローマ教皇ユリウス2世の依頼で{{2}}の天井画を描き、のちに祭壇画『最後の審判』も完成させた。",
      slots: [
        { id: 1, answer: "ミケランジェロ", category: "人物" },
        { id: 2, answer: "システィーナ礼拝堂", category: "建造物" },
      ],
      points: [
        { label: "原因", text: "ルネサンスの中心はしだいにローマへ移り、教皇たちは権威を示すために芸術家を招いて大事業を進めた" },
        { label: "経過", text: "約4年をかけ、足場の上でほぼ一人で旧約聖書の天地創造などの場面を描き上げた" },
        { label: "意義", text: "力強い人体表現は盛期ルネサンスの頂点とされ、彫刻・絵画・建築（サン・ピエトロ大聖堂のドーム設計）のすべてで後世に影響を与えた" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Michelangelo%27s_David_2015.jpg/960px-Michelangelo%27s_David_2015.jpg",
        caption: "ミケランジェロ『ダヴィデ像』（1504年、フィレンツェのアカデミア美術館）",
        alt: "投石器を肩に掛け、遠くを見すえて立つ若者の大理石像",
        credit: "David, Galleria dell'Accademia／写真: Livioandronico2013（2015年）, Wikimedia Commons・CC BY-SA 4.0",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
        caption: "ミケランジェロ『アダムの創造』（1511年頃、システィーナ礼拝堂天井画）",
        alt: "横たわるアダムと、天使たちに囲まれた神が、互いに指先を伸ばし合う場面",
        credit: "La Creazione di Adamo／Michelangelo Buonarroti（1511年頃）, Cappella Sistina, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：『ダヴィデ像』は高さ5メートルを超え、都市の自由と独立の象徴としてフィレンツェの政庁前広場に置かれた。現在、広場に立っているのは複製である。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ミケランジェロ・ブオナローティ",
  },
  {
    id: "c40", year: 1517, difficulty: 0, era: "近世（大航海時代・ルネサンス・宗教改革）", region: "神聖ローマ帝国", theme: ["通史", "宗教改革"],
    front: "1517年にルターが批判したローマ教会の販売物と、彼が発表した文書は？",
    back: "",
    cloze: {
      template: "1517年、ローマ教皇レオ10世がサン・ピエトロ大聖堂の改築資金を集めるため{{1}}（免罪符）を販売すると、ヴィッテンベルク大学の神学教授ルターは「{{2}}の論題」を発表してこれを批判した。",
      slots: [
        { id: 1, answer: "贖宥状", category: "販売物" },
        { id: 2, answer: "九十五箇条", category: "文書" },
      ],
      points: [
        { label: "原因", text: "教皇の権威が強く及んだドイツは「ローマの牝牛」と呼ばれ、教会への献金などで富が吸い上げられていた" },
        { label: "経過", text: "1521年のヴォルムス帝国議会で皇帝カール5世に自説の撤回を拒み、ザクセン選帝侯にかくまわれたヴァルトブルク城で新約聖書をドイツ語に訳した" },
        { label: "意義", text: "人は信仰によってのみ救われる（信仰義認説）、聖書だけが信仰のよりどころ（聖書主義）と説き、プロテスタントの出発点となった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Lucas_Cranach_d.%C3%84._-_Martin_Luther%2C_1528_%28Veste_Coburg%29.jpg/960px-Lucas_Cranach_d.%C3%84._-_Martin_Luther%2C_1528_%28Veste_Coburg%29.jpg",
        caption: "クラナッハ「マルティン・ルターの肖像」（1528年）",
        alt: "黒い帽子と黒い服を身に着け、まっすぐ前を見つめる男性の肖像",
        credit: "Martin Luther／Lucas Cranach der Ältere（1528年）, Veste Coburg, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Ferdinand_Pauwels_-_Luther_hammers_his_95_theses_to_the_door.jpg",
        caption: "パウエルス『九十五箇条の論題を掲げるルター』（1872年）",
        alt: "教会の扉に槌で文書を打ち付ける黒い修道服の男性と、その傍らで見守る人々。足元には木の台が置かれている",
        credit: "Luther schlägt die 95 Thesen an／Ferdinand Pauwels（1872年）, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：ルターの主張は、約70年前にグーテンベルクが実用化した活版印刷によってパンフレットとして大量に刷られ、わずか数週間でドイツ中に広まった。なお、論題を教会の扉に打ち付けたという有名な場面が史実かどうかには議論がある。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/95か条の論題",
  },
  {
    id: "c41", year: 1555, difficulty: 3, era: "近世（大航海時代・ルネサンス・宗教改革）", region: "神聖ローマ帝国", theme: ["通史", "宗教改革"],
    front: "1555年、神聖ローマ帝国の諸侯に宗派の選択権を認めた和議と、そこで認められた新教の宗派は？",
    back: "",
    cloze: {
      template: "1555年の{{1}}の和議で、神聖ローマ帝国の諸侯はカトリックと{{2}}のどちらかを選ぶ権利を認められ、領民は諸侯の選んだ宗派に従うことになった。ただし個人の信仰の自由は認められず、ほかの新教の宗派も対象外とされた。",
      slots: [
        { id: 1, answer: "アウクスブルク", category: "都市" },
        { id: 2, answer: "ルター派", category: "宗派" },
      ],
      points: [
        { label: "原因", text: "皇帝カール5世はカトリックによる帝国の統一を目指したが、新教を支持する諸侯はシュマルカルデン同盟を結んで対抗した" },
        { label: "経過", text: "シュマルカルデン戦争で皇帝は一時勝利したものの新教諸侯を屈服させられず、妥協として和議が結ばれた" },
        { label: "意義", text: "「支配者の宗教がその地の宗教」とする原則が確立して領邦ごとの宗派の分裂が固定化し、のちの三十年戦争の火種となった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Titian_-_Emperor_Charles_V_at_M%C3%BChlberg_-_WGA22965.jpg/960px-Titian_-_Emperor_Charles_V_at_M%C3%BChlberg_-_WGA22965.jpg",
        caption: "ティツィアーノ『ミュールベルクのカール5世』（1548年、プラド美術館）",
        alt: "甲冑に身を包み、槍を手に黒馬にまたがって進む皇帝の騎馬像",
        credit: "Carlos V en Mühlberg／Tiziano Vecellio（1548年）, Museo del Prado, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：和議の翌年、疲れ果てたカール5世は退位し、帝位を弟フェルディナント1世に、スペイン王位を息子フェリペ2世に譲った。ハプスブルク家はここでオーストリア系とスペイン系に分かれた。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/アウクスブルクの和議",
  },
  {
    id: "c42", year: 1541, difficulty: 2, era: "近世（大航海時代・ルネサンス・宗教改革）", region: "ジュネーヴ", theme: ["通史", "宗教改革"],
    front: "スイスのジュネーヴで宗教改革を指導した人物と、その中心となる教えは？",
    back: "",
    cloze: {
      template: "フランス出身の{{1}}はスイスのジュネーヴで宗教改革を指導し、魂が救われるかどうかはあらかじめ神によって定められているとする{{2}}を説いた。",
      slots: [
        { id: 1, answer: "カルヴァン", category: "人物" },
        { id: 2, answer: "予定説", category: "教え" },
      ],
      points: [
        { label: "原因", text: "ドイツで始まった改革に刺激され、ヨーロッパ各地で教会の刷新を求める動きが広がった" },
        { label: "経過", text: "ジュネーヴでは牧師と信徒の代表（長老）が教会を運営する長老制を取り入れ、厳格な神権政治を行った" },
        { label: "意義", text: "職業に励み富を得ることを救いの証として肯定したため、フランスのユグノー、オランダのゴイセン、イギリスのピューリタンなど西ヨーロッパの商工業者に広まった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/1/19/John_Calvin_-_Young.jpg",
        caption: "若き日のカルヴァンの肖像（16世紀、フランドル派）",
        alt: "黒い帽子をかぶり、横を向いた細面であごひげの男性の肖像",
        credit: "John Calvin（young）／Flemish school（16世紀）, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Figures-ReformationWall-Geneva.jpg/960px-Figures-ReformationWall-Geneva.jpg",
        caption: "ジュネーヴの宗教改革記念碑（1917年完成。左からファレル、カルヴァン、ベーズ、ノックス）",
        alt: "石壁の前に並んで立つ、長い法衣をまとった4人の巨大な石像",
        credit: "Reformation Wall, Geneva／写真: Acediscovery（2010年）, Wikimedia Commons・CC BY 4.0",
      },
    ],
    anecdote: "豆知識：社会学者マックス・ヴェーバーは『プロテスタンティズムの倫理と資本主義の精神』で、こうした勤勉と禁欲の教えが近代資本主義を生む土壌になったと論じた。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ジャン・カルヴァン",
  },
  {
    id: "c43", year: 1498, difficulty: 1, era: "近世（大航海時代・ルネサンス・宗教改革）", region: "ポルトガル王国", theme: ["通史", "大航海時代"],
    front: "1488年にディアスが到達したアフリカ南端の岬と、1498年にインド航路を開いた航海者は？",
    back: "",
    cloze: {
      template: "ポルトガルは香辛料を求めてアフリカ西岸の探検を進め、1488年にバルトロメウ・ディアスがアフリカ南端の{{1}}に到達した。1498年には{{2}}がインド西岸のカリカットに到達し、インド航路が開かれた。",
      slots: [
        { id: 1, answer: "喜望峰", category: "岬" },
        { id: 2, answer: "ヴァスコ・ダ・ガマ", category: "人物" },
      ],
      points: [
        { label: "原因", text: "オスマン帝国が東地中海を押さえるなか、イタリア商人を介さずに香辛料を手に入れる新しい交易路が求められた" },
        { label: "経過", text: "「航海王子」エンリケが航海者を支援し、羅針盤の改良や快速帆船の開発によって外洋航海が可能になった" },
        { label: "意義", text: "ポルトガルはゴアやマラッカを拠点にアジア交易を握り、首都リスボンはヨーロッパ有数の商業都市として栄えた" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Greg%C3%B3rio_Lopes_-_Vasco_da_Gama_%28ca_1524%29.jpg/960px-Greg%C3%B3rio_Lopes_-_Vasco_da_Gama_%28ca_1524%29.jpg",
        caption: "グレゴリオ・ロペス「ヴァスコ・ダ・ガマの肖像」（1524年頃）",
        alt: "黒い帽子をかぶり、豊かな白いあごひげをたくわえた初老の男性の肖像",
        credit: "Vasco da Gama／Gregório Lopes（1524年頃）, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Cape_Point_cliffs_%2840425061753%29.jpg/960px-Cape_Point_cliffs_%2840425061753%29.jpg",
        caption: "喜望峰の東に連なるケープ半島南端の断崖（南アフリカ）",
        alt: "青い海に突き出した岩がちの岬と、打ち寄せる白い波",
        credit: "Cape Point cliffs／写真: Raita Futo（2017年）, Wikimedia Commons・CC BY 2.0",
      },
    ],
    anecdote: "豆知識：嵐に苦しんだディアスはこの岬を「嵐の岬」と名付けたが、インド航路への希望を込めて、ポルトガル王ジョアン2世が現在の名に改めたと伝えられる。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ヴァスコ・ダ・ガマ",
  },
  {
    id: "c44", year: 1492, difficulty: 1, era: "近世（大航海時代・ルネサンス・宗教改革）", region: "スペイン王国", theme: ["通史", "大航海時代"],
    front: "1492年にカリブ海の島へ到達した航海者と、1494年にスペインとポルトガルが結んだ条約は？",
    back: "",
    cloze: {
      template: "1492年、スペイン女王イサベルの支援を受けた{{1}}は大西洋を西へ進み、カリブ海の島に到達した。これを受けて1494年、スペインとポルトガルは{{2}}条約を結び、海外領土の分界線を定めた。",
      slots: [
        { id: 1, answer: "コロンブス", category: "人物" },
        { id: 2, answer: "トルデシリャス", category: "条約" },
      ],
      points: [
        { label: "原因", text: "地球球体説を信じたコロンブスは、大西洋を西回りに進めばアジアに着けると考えた" },
        { label: "経過", text: "彼は到達地をアジアの一部と信じ続けたが、のちにアメリゴ・ヴェスプッチの探検で新大陸と確認され「アメリカ」と呼ばれるようになった" },
        { label: "意義", text: "分界線の西をスペイン、東をポルトガルの勢力範囲とし、南アメリカでブラジルだけがポルトガル領となる根拠にもなった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Portrait_of_a_Man%2C_Said_to_be_Christopher_Columbus.jpg/960px-Portrait_of_a_Man%2C_Said_to_be_Christopher_Columbus.jpg",
        caption: "セバスティアーノ・デル・ピオンボ「コロンブスとされる男性の肖像」（1519年、メトロポリタン美術館）",
        alt: "黒い帽子と黒い服を身に着け、胸に手を当てて立つ男性の肖像",
        credit: "Portrait of a Man, Said to be Christopher Columbus／Sebastiano del Piombo（1519年）, The Metropolitan Museum of Art, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Desembarco_de_Col%C3%B3n_de_Di%C3%B3scoro_Puebla.jpg/960px-Desembarco_de_Col%C3%B3n_de_Di%C3%B3scoro_Puebla.jpg",
        caption: "ディオスコロ・プエブラ『コロンブスの新大陸上陸』（1862年）",
        alt: "旗を掲げて浜辺に上陸した航海者と、ひざまずいて祈る乗組員たち、それを木陰から見る先住民",
        credit: "Primer desembarco de Cristóbal Colón en América／Dióscoro Puebla（1862年）, Museo del Prado, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：1492年はスペインがイベリア半島最後のイスラーム王朝ナスル朝の都グラナダを陥落させ、レコンキスタ（国土回復運動）を完了した年でもある。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/トルデシリャス条約",
  },
  {
    id: "c45", year: 1522, difficulty: 2, era: "近世（大航海時代・ルネサンス・宗教改革）", region: "スペイン王国", theme: ["通史", "大航海時代"],
    front: "スペイン王の支援で世界周航に出発した航海者と、彼が戦死した地は？",
    back: "",
    cloze: {
      template: "スペイン王カルロス1世の支援を受けたポルトガル人{{1}}の船隊は、1519年に出航して南アメリカ南端の海峡を抜け、太平洋を横断した。隊長は{{2}}で先住民との戦いに倒れたが、生き残った部下が1522年にスペインへ帰り着き、史上初の世界周航を達成した。",
      slots: [
        { id: 1, answer: "マゼラン", category: "人物" },
        { id: 2, answer: "フィリピン", category: "地名" },
      ],
      points: [
        { label: "原因", text: "香辛料の産地モルッカ諸島に、ポルトガルとは逆の西回りで到達しようとした" },
        { label: "経過", text: "出航した5隻・約270人のうち、帰国できたのはビクトリア号1隻とわずか18人だった" },
        { label: "意義", text: "地球が球体であることが実証され、太平洋の広さが明らかになった。のちにフィリピンはスペインの植民地となり、マニラがアジア交易の拠点となった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Retrato_de_Hernando_de_Magallanes.jpg/960px-Retrato_de_Hernando_de_Magallanes.jpg",
        caption: "マゼランの肖像（作者不詳、19世紀の模写）",
        alt: "黒い帽子をかぶり、地図を手にした髭の男性の肖像",
        credit: "Retrato de Hernando de Magallanes／作者不詳（1848年の模写）, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Nao_Victoria_%28ship%2C_1992%29%2C_S%C3%A8te_cf04.jpg/960px-Nao_Victoria_%28ship%2C_1992%29%2C_S%C3%A8te_cf04.jpg",
        caption: "船隊で唯一帰還したビクトリア号の復元船（フランス・セート港）",
        alt: "港に停泊する、帆柱が3本立った木造の帆船の復元船",
        credit: "Nao Victoria（replica, 1992）／写真: Christian Ferrer, Wikimedia Commons・CC BY 4.0",
      },
    ],
    anecdote: "豆知識：「太平洋（Pacific Ocean）」の名は、荒れた海峡を抜けたあとの穏やかな海を、彼が「平和な海」と呼んだことに由来する。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/フェルディナンド・マゼラン",
  },
  {
    id: "c46", year: 1521, difficulty: 2, era: "近世（大航海時代・ルネサンス・宗教改革）", region: "アステカ帝国", theme: ["通史", "大航海時代"],
    front: "メキシコのアステカ王国と、ペルーのインカ帝国をそれぞれ滅ぼしたスペインの征服者は？",
    back: "",
    cloze: {
      template: "スペインの征服者（コンキスタドール）{{1}}は1521年にメキシコのアステカ王国を、{{2}}は1533年にペルーのインカ帝国を滅ぼした。",
      slots: [
        { id: 1, answer: "コルテス", category: "人物" },
        { id: 2, answer: "ピサロ", category: "人物" },
      ],
      points: [
        { label: "原因", text: "金銀と布教を求めるスペイン人が、新大陸の豊かな先住民文明に目を付けた" },
        { label: "経過", text: "少数の兵力ながら鉄砲や馬を用い、さらにヨーロッパから持ち込まれた天然痘などの疫病で先住民の人口が激減した" },
        { label: "意義", text: "先住民はエンコミエンダ制のもとで鉱山や農園で酷使され、ポトシ銀山などから流入した大量の銀がヨーロッパの物価を高騰させた（価格革命）" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Conquista-de-M%C3%A9xico-por-Cort%C3%A9s-Tenochtitlan-Painting.png/960px-Conquista-de-M%C3%A9xico-por-Cort%C3%A9s-Tenochtitlan-Painting.png",
        caption: "「テノチティトラン征服」（17世紀後半、作者不詳）",
        alt: "湖上の都市の神殿をめぐって、甲冑の兵士と先住民の戦士が入り乱れて戦う場面",
        credit: "Conquista de México por Cortés／作者不詳（17世紀後半）, Library of Congress, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/80_-_Machu_Picchu_-_Juin_2009_-_edit.jpg/960px-80_-_Machu_Picchu_-_Juin_2009_-_edit.jpg",
        caption: "インカ帝国の都市遺跡マチュ・ピチュ（15世紀、ペルー）",
        alt: "険しい山の尾根に段々畑と石造りの建物群が広がる遺跡",
        credit: "Machu Picchu／写真: Martin St-Amant（2009年）, Wikimedia Commons・CC BY-SA 3.0",
      },
    ],
    anecdote: "豆知識：アステカの都テノチティトランは湖上に築かれた人口20万人以上の大都市で、その跡地に現在のメキシコシティが広がる。文字を持たなかったインカ帝国では、縄の結び目で数を記録するキープ（結縄）が使われた。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/コンキスタドール",
  },
];

// 中世ヨーロッパ（封建社会・十字軍・ビザンツ）のカード。
// フランク王国とイスラーム勢力の接触、カール大帝、神聖ローマ帝国の成立、ビザンツ帝国と東西教会の分裂、
// 封建社会と荘園制、英仏の王権（ノルマン・コンクエスト、マグナ・カルタ）、叙任権闘争と教皇権の盛衰
// （カノッサの屈辱、アヴィニョン捕囚、教会大分裂）、十字軍、中世都市と商業（ハンザ同盟、ギルド）、黒死病、百年戦争までを扱う。
// region は、Step 2 で作成予定のこの時代の地図（中世①／中世②の時代区分）の勢力IDとして使う名前で統一している：
//   フランク王国、神聖ローマ帝国、ビザンツ帝国、フランス王国、イングランド王国、イスラーム世界、セルジューク朝、
//   ヴェネツィア共和国、ジェノヴァ共和国、フランドル（フランス王国北部の毛織物業地帯。地図ではフランス王国の内側の小区分として描く想定）。
// 神聖ローマ帝国・フランス王国・ヴェネツィア共和国は、大航海時代・ルネサンス期の地図と同じIDにそろえている。
// 地図データを作るときは、この region と同じIDを勢力に付けること。
export const MEDIEVAL_CARDS = [
  {
    id: "c49", year: 537, difficulty: 1, era: "中世（ヨーロッパ・イスラーム・アジア）", region: "ビザンツ帝国", theme: ["通史", "ビザンツ帝国"],
    front: "6世紀にビザンツ帝国の最盛期を築いた皇帝と、彼が編纂させた法典は？",
    back: "",
    cloze: {
      template: "6世紀、ビザンツ帝国の{{1}}帝は、旧西ローマ帝国領の北アフリカやイタリアを一時的に回復した。法学者トリボニアヌスらに『{{2}}』を編纂させ、首都にはハギア・ソフィア聖堂を再建した。",
      slots: [
        { id: 1, answer: "ユスティニアヌス", category: "人物" },
        { id: 2, answer: "ローマ法大全", category: "法典" },
      ],
      points: [
        { label: "原因", text: "西ローマ帝国の滅亡後も、東のビザンツ帝国はローマ帝国の正統な後継者として地中海世界の再統一をめざした" },
        { label: "経過", text: "相次ぐ遠征と大規模な建設事業で財政は悪化し、皇帝の死後まもなくイタリアの大部分はランゴバルド人に奪われた" },
        { label: "意義", text: "法典はローマ法を集大成したもので、のちに西ヨーロッパで再発見され、近代ヨーロッパ諸国の法の基礎となった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Mosaic_of_Justinian_I_-_San_Vitale_-_Ravenna_2016.jpg/960px-Mosaic_of_Justinian_I_-_San_Vitale_-_Ravenna_2016.jpg",
        caption: "サン・ヴィターレ聖堂のモザイク「ユスティニアヌス帝と廷臣たち」（547年頃、ラヴェンナ）",
        alt: "金色の背景の前に、光輪をつけた皇帝と聖職者・兵士たちが並ぶモザイク画",
        credit: "Mosaic of Justinian I, Basilica di San Vitale／写真: José Luiz（2016年）, Wikimedia Commons・CC BY-SA 4.0",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Hagia_Sophia_Mars_2013.jpg/960px-Hagia_Sophia_Mars_2013.jpg",
        caption: "ハギア・ソフィア聖堂（537年再建、現在のイスタンブル）",
        alt: "巨大なドームを中心に、四隅に細い尖塔（ミナレット）が立つ建物",
        credit: "Hagia Sophia／写真: Arild Vågen（2013年）, Wikimedia Commons・CC BY-SA 3.0",
      },
    ],
    anecdote: "豆知識：中国から伝わる絹の製法は秘密とされていたが、皇帝は修道士に蚕の卵を杖の中に隠して持ち帰らせ、帝国内で絹織物の生産を始めたと伝えられる。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ユスティニアヌス1世",
  },
  {
    id: "c57", year: 732, difficulty: 1, era: "中世（ヨーロッパ・イスラーム・アジア）", region: "イスラーム世界", theme: ["通史", "中世ヨーロッパ"],
    front: "732年、イスラーム勢力の侵入をトゥール・ポワティエ間の戦いで撃退したフランク王国の宮宰と、侵入した王朝は？",
    back: "",
    cloze: {
      template: "732年、フランク王国の宮宰{{1}}は、イベリア半島からピレネー山脈を越えて侵入した{{2}}の軍を、トゥール・ポワティエ間の戦いで撃退した。",
      slots: [
        { id: 1, answer: "カール・マルテル", category: "人物" },
        { id: 2, answer: "ウマイヤ朝", category: "王朝" },
      ],
      points: [
        { label: "原因", text: "7世紀に成立したイスラーム勢力は急速に拡大し、711年には西ゴート王国を滅ぼしてイベリア半島をほぼ支配した" },
        { label: "経過", text: "勝利によって宮宰の家系（カロリング家）の権威が高まり、その子ピピンは751年に王位についてカロリング朝を開いた" },
        { label: "意義", text: "イスラーム勢力の西ヨーロッパへの進出は止まり、キリスト教世界の守り手となったフランク王国とローマ教皇が結びつくきっかけとなった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Steuben_-_Bataille_de_Poitiers.png/960px-Steuben_-_Bataille_de_Poitiers.png",
        caption: "シュトイベン『ポワティエの戦い』（1837年、ヴェルサイユ宮殿）",
        alt: "馬上で斧を振りかざす武将と、入り乱れて戦う騎兵たちを描いた油彩画",
        credit: "Bataille de Poitiers en octobre 732／Charles de Steuben（1837年）, Château de Versailles, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Mezquita_cordoba_arcos_flotantes.jpg/960px-Mezquita_cordoba_arcos_flotantes.jpg",
        caption: "コルドバの大モスク（メスキータ）の内部（8世紀以降、後ウマイヤ朝）",
        alt: "赤と白の縞模様のアーチが、林のように並ぶ円柱の上に幾重にも連なる礼拝堂",
        credit: "Mezquita de Córdoba／写真: Alvaro.vinuela.carnicero（2011年）, Wikimedia Commons・CC BY-SA 4.0",
      },
    ],
    anecdote: "豆知識：宮宰の異名「マルテル」は「鉄槌」を意味し、この戦いでの活躍にちなむとされる。敗れた王朝の一族はのちにイベリア半島で後ウマイヤ朝を開き、都コルドバは西ヨーロッパ最大の都市として栄えた。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/トゥール・ポワティエ間の戦い",
  },
  {
    id: "c47", year: 800, difficulty: 0, era: "中世（ヨーロッパ・イスラーム・アジア）", region: "フランク王国", theme: ["通史", "中世ヨーロッパ"],
    front: "800年にローマ皇帝の冠を受けたフランク王国の王と、冠を授けたローマ教皇は？",
    back: "",
    cloze: {
      template: "800年のクリスマス、フランク王国の{{1}}はローマのサン・ピエトロ大聖堂で教皇{{2}}からローマ皇帝の冠を受けた。これにより、ローマ文化・ゲルマン人・キリスト教が融合した西ヨーロッパ世界が成立した。",
      slots: [
        { id: 1, answer: "カール大帝", category: "人物" },
        { id: 2, answer: "レオ3世", category: "人物" },
      ],
      points: [
        { label: "原因", text: "西ローマ帝国の滅亡後、ビザンツ皇帝と対立していたローマ教皇は、西ヨーロッパで自らを守る強力な保護者を求めた" },
        { label: "経過", text: "王は西ヨーロッパの大半を征服し、各地に伯を置いて巡察使に監督させた。宮廷には学者を招き、古典文化の復興（カロリング・ルネサンス）が進んだ" },
        { label: "意義", text: "西ヨーロッパがビザンツ帝国から自立した独自の世界となり、教皇と皇帝が並び立つ中世ヨーロッパの枠組みが生まれた" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/1512_D%C3%BCrer_Kaiser_Karl_der_Gro%C3%9Fe_anagoria.JPG/960px-1512_D%C3%BCrer_Kaiser_Karl_der_Gro%C3%9Fe_anagoria.JPG",
        caption: "デューラー『カール大帝』（1512年、ニュルンベルクのゲルマン国立博物館）",
        alt: "王冠をかぶり、剣と宝珠を手にした白い髭の皇帝の肖像",
        credit: "Kaiser Karl der Große／Albrecht Dürer（1512年）, Germanisches Nationalmuseum, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Raphael_-_Coronation_of_Charlemagne.jpg/960px-Raphael_-_Coronation_of_Charlemagne.jpg",
        caption: "ラファエロ工房『カール大帝の戴冠』（16世紀初め、ヴァチカン宮殿）",
        alt: "大聖堂の祭壇の前でひざまずく王に、教皇が冠を授けようとする場面の壁画",
        credit: "Incoronazione di Carlo Magno／Raffaello Sanzio e bottega（16世紀初め）, Stanze di Raffaello, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "逸話：伝記作者アインハルトによれば、王は読むことはできたが字を書くのが苦手で、寝床の枕の下に書板を置いて晩年まで練習を続けたという。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/カール大帝",
  },
  {
    id: "c48", year: 962, difficulty: 2, era: "中世（ヨーロッパ・イスラーム・アジア）", region: "神聖ローマ帝国", theme: ["通史", "中世ヨーロッパ"],
    front: "962年にローマ皇帝の冠を受け、神聖ローマ帝国の始まりとされる東フランク王と、彼が撃退した民族は？",
    back: "",
    cloze: {
      template: "東フランク王国の{{1}}は、955年のレヒフェルトの戦いで侵入してきた{{2}}人を撃退し、962年にローマ教皇からローマ皇帝の冠を受けた。これが、のちに神聖ローマ帝国と呼ばれる国家の始まりとされる。",
      slots: [
        { id: 1, answer: "オットー1世", category: "人物" },
        { id: 2, answer: "マジャール", category: "民族" },
      ],
      points: [
        { label: "原因", text: "843年のヴェルダン条約などでフランク王国は3つに分かれ、東フランクではカロリング家の血統が途絶えて諸侯が王を選ぶようになった" },
        { label: "経過", text: "王は有力な聖職者を官職に任じて諸侯をおさえる帝国教会政策をとり、イタリアにも遠征して教皇を保護した" },
        { label: "意義", text: "以後の歴代皇帝はイタリアの支配に力を注いだため（イタリア政策）、ドイツ本国の統一が遅れ、諸侯の分立が進む一因となった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/2/29/Alter_Markt_%28Magdeburg-Altstadt%29.Magdeburger_Reiter_edit.jpg",
        caption: "マクデブルクの騎士像（オットー1世の姿とされる13世紀の像の複製、マクデブルク旧市場）",
        alt: "王冠をかぶった金色の騎馬像の上半身",
        credit: "Magdeburger Reiter／写真: Ajepbah, 編集: Crisco 1492, Wikimedia Commons・CC BY-SA 3.0 de",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Weltliche_Schatzkammer_Wien_white_background.jpg/960px-Weltliche_Schatzkammer_Wien_white_background.jpg",
        caption: "神聖ローマ帝国の帝冠（10世紀後半、ウィーン王宮宝物館）",
        alt: "色とりどりの宝石と真珠で飾られ、正面に十字架が立つ八角形の金の冠",
        credit: "Reichskrone, Kaiserliche Schatzkammer Wien／写真: Gryffindor, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：撃退された人々はその後パンノニア平原に定住してキリスト教を受け入れ、1000年ごろハンガリー王国を建てた。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/オットー1世_(神聖ローマ皇帝)",
  },
  {
    id: "c50", year: 1054, difficulty: 2, era: "中世（ヨーロッパ・イスラーム・アジア）", region: "ビザンツ帝国", theme: ["通史", "ビザンツ帝国"],
    front: "726年にビザンツ皇帝が発布し、ローマ教会との対立のきっかけとなった法令と、1054年の分裂で成立した東方の教会は？",
    back: "",
    cloze: {
      template: "726年、ビザンツ皇帝レオン3世が{{1}}を発布すると、ゲルマン人への布教に聖像を用いていたローマ教会は強く反発した。対立は深まり、1054年にキリスト教会はローマ＝カトリック教会と{{2}}会に分裂した。",
      slots: [
        { id: 1, answer: "聖像禁止令", category: "法令" },
        { id: 2, answer: "ギリシア正教", category: "教会" },
      ],
      points: [
        { label: "原因", text: "偶像崇拝を厳しく否定するイスラーム勢力と向き合うなかで、ビザンツ帝国内でも聖像の崇拝を批判する動きが強まった" },
        { label: "経過", text: "ビザンツ皇帝の保護を頼れなくなったローマ教会はフランク王国に接近し、やがて教皇がフランク王に皇帝の冠を授けるに至った" },
        { label: "意義", text: "東の教会は皇帝が教会を支配する体制のもとで東ヨーロッパやロシアに広まり、ヨーロッパは宗教・文化の面でも東西に分かれた" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Deesis_mosaic_Hagia_Sophia.jpg/960px-Deesis_mosaic_Hagia_Sophia.jpg",
        caption: "ハギア・ソフィアのモザイク「デイシス（嘆願）」（13世紀）",
        alt: "金色の背景の中央に描かれたキリストと、その左右で祈る聖母マリアと洗礼者ヨハネ",
        credit: "Deesis mosaic, Hagia Sophia／写真: Myrabella（2012年）, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Crucifixion_with_iconoclasts%2C_Chludov_Psalter%2C_folio_67r.jpg/960px-Crucifixion_with_iconoclasts%2C_Chludov_Psalter%2C_folio_67r.jpg",
        caption: "『フルードフ詩篇』の挿絵：キリストの絵を塗りつぶす聖像破壊派（9世紀）",
        alt: "十字架にかけられたキリストの絵の横で、長い棒の先の道具で絵を塗りつぶそうとする人物",
        credit: "Chludov Psalter, fol. 67r／作者不詳（9世紀）, 国立歴史博物館（モスクワ）, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：1054年、ローマ教皇の使節と東方の総主教は互いに相手を破門し合った。この相互破門が解かれたのは、900年以上たった1965年のことだった。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/聖像破壊運動",
  },
  {
    id: "c58", year: 1066, difficulty: 2, era: "中世（ヨーロッパ・イスラーム・アジア）", region: "イングランド王国", theme: ["通史", "中世ヨーロッパ"],
    front: "1066年にイングランドを征服してノルマン朝を開いたフランス北部の領主の称号と、決戦の地は？",
    back: "",
    cloze: {
      template: "1066年、フランス北部の{{1}}ウィリアムはイングランドに侵攻し、{{2}}の戦いでアングロ・サクソン人の王ハロルドを破って王位につき、ノルマン朝を開いた。",
      slots: [
        { id: 1, answer: "ノルマンディー公", category: "称号" },
        { id: 2, answer: "ヘースティングズ", category: "戦い" },
      ],
      points: [
        { label: "原因", text: "王位継承をめぐる争いのなか、イングランド王と血縁があったウィリアムが、先王から王位を約束されていたと主張した" },
        { label: "経過", text: "征服王は全国の土地を調査させて「ドゥームズデー・ブック」を作成し、大陸の封建制度を持ち込んで強力な王権を打ち立てた" },
        { label: "意義", text: "イングランド王がフランス国内にも領地を持つことになり、のちの英仏間の長い対立の原因となった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Bayeux_Tapestry_scene57_Harold_death_%28cropped%29.jpg/960px-Bayeux_Tapestry_scene57_Harold_death_%28cropped%29.jpg",
        caption: "『バイユーのタペストリー』より、ヘースティングズの戦い（11世紀後半）",
        alt: "刺繍で描かれた、鎖かたびらの兵士と騎兵が剣や槍で戦う場面",
        credit: "Bayeux Tapestry, scene 57／作者不詳（1070年代）, Musée de la Tapisserie de Bayeux, 写真: Myrabella, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/France-000687_-_Tapestry_-_38-39_%2814994772181%29_%28cropped%29.jpg/960px-France-000687_-_Tapestry_-_38-39_%2814994772181%29_%28cropped%29.jpg",
        caption: "『バイユーのタペストリー』より、英仏海峡を渡る艦隊（11世紀後半）",
        alt: "帆を張った細長い船に、兵士と馬が乗り込んで海を渡る場面の刺繍",
        credit: "Bayeux Tapestry, scenes 38-39／写真: Dennis G. Jarvis（2014年）, Wikimedia Commons・CC BY-SA 2.0",
      },
    ],
    anecdote: "豆知識：この征服以後、イングランドの宮廷ではフランス語が使われたため、英語には多くのフランス語由来の単語が入った（家畜の「cow」と料理の「beef」の使い分けなど）。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ノルマン・コンクエスト",
  },
  {
    id: "c52", year: 1077, difficulty: 0, era: "中世（ヨーロッパ・イスラーム・アジア）", region: "神聖ローマ帝国", theme: ["通史", "中世ヨーロッパ"],
    front: "叙任権をめぐって神聖ローマ皇帝ハインリヒ4世を破門した教皇と、皇帝が許しを請うた城は？",
    back: "",
    cloze: {
      template: "聖職者を任命する権利（叙任権）をめぐり、教皇{{1}}が神聖ローマ皇帝ハインリヒ4世を破門すると、皇帝は1077年、北イタリアの{{2}}城の門前で、雪の中3日間はだしで立ち尽くして許しを請うた。",
      slots: [
        { id: 1, answer: "グレゴリウス7世", category: "人物" },
        { id: 2, answer: "カノッサ", category: "城" },
      ],
      points: [
        { label: "原因", text: "聖職売買や聖職者の妻帯が広がるなか、クリュニー修道院を中心とする改革運動が教会の刷新を求め、世俗の君主による聖職者の任命を問題視した" },
        { label: "経過", text: "破門されたままでは国内の諸侯に王位を奪われかねなかった皇帝は屈服した。争いは1122年のヴォルムス協約で、叙任権は教皇にあると決着した" },
        { label: "意義", text: "教皇権は伸長を続け、13世紀初めの教皇インノケンティウス3世のときに絶頂を迎えた" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Schwoiser_Heinrich_vor_Canossa.jpg/960px-Schwoiser_Heinrich_vor_Canossa.jpg",
        caption: "シュヴォイザー『カノッサのハインリヒ4世』（1862年）",
        alt: "城門の前で、粗末な衣をまとい、うつむいて立つ男性",
        credit: "Heinrich vor Canossa／Eduard Schwoiser（1862年）, Maximilianeum, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Mathilde_und_Hugo_von_Cluny_als_F%C3%BCrsprecher_Heinrichs_IV..jpg/960px-Mathilde_und_Hugo_von_Cluny_als_F%C3%BCrsprecher_Heinrichs_IV..jpg",
        caption: "『マティルデ伝』の挿絵：トスカーナ女伯マティルデとクリュニー修道院長に仲介を請うハインリヒ4世（12世紀初め）",
        alt: "玉座に座る女性と修道院長の前に、ひざまずいて嘆願する王",
        credit: "Mathilde und Hugo von Cluny als Fürsprecher Heinrichs IV.／Donizo『Vita Mathildis』（1115年頃）, Biblioteca Apostolica Vaticana, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "名言：教皇権の絶頂期を築いたインノケンティウス3世は、「教皇は太陽、皇帝は月」と述べたとされる。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/カノッサの屈辱",
  },
  {
    id: "c53", year: 1095, difficulty: 1, era: "中世（ヨーロッパ・イスラーム・アジア）", region: "セルジューク朝", theme: ["通史", "十字軍"],
    front: "1095年に十字軍の派遣を呼びかけた教皇と、その舞台となった宗教会議は？",
    back: "",
    cloze: {
      template: "セルジューク朝の圧迫に苦しむビザンツ皇帝から救援を求められると、教皇{{1}}は1095年の{{2}}宗教会議で聖地イェルサレムの奪回を呼びかけ、翌年、第1回十字軍が出発した。",
      slots: [
        { id: 1, answer: "ウルバヌス2世", category: "人物" },
        { id: 2, answer: "クレルモン", category: "地名" },
      ],
      points: [
        { label: "原因", text: "11世紀にトルコ系のセルジューク朝が小アジアに進出し、聖地イェルサレムも支配下に置いて、ビザンツ帝国を脅かした" },
        { label: "経過", text: "第1回十字軍は1099年にイェルサレムを占領してイェルサレム王国を建てたが、のちにアイユーブ朝のサラディンに奪回された。遠征は約200年間で計7回に及んだ" },
        { label: "意義", text: "遠征の失敗で教皇の権威は揺らいだ一方、遠征を支えたイタリア諸都市が地中海の交易で繁栄し、商業と都市の発達をうながした" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/CouncilofClermont.jpg/960px-CouncilofClermont.jpg",
        caption: "ジャン・コロンブ『海外遠征記』の挿絵：クレルモン宗教会議で十字軍を呼びかけるウルバヌス2世（15世紀）",
        alt: "大聖堂の中に集まった聖職者や騎士たちに、高座から教皇が語りかける写本の挿絵",
        credit: "Concile de Clermont, Passages d'outremer／Jean Colombe（1474年頃）, Bibliothèque nationale de France, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Taking_of_Jerusalem_by_the_Crusaders%2C_15th_July_1099.jpg/960px-Taking_of_Jerusalem_by_the_Crusaders%2C_15th_July_1099.jpg",
        caption: "シニョル『十字軍のイェルサレム占領（1099年7月15日）』（1847年、ヴェルサイユ宮殿）",
        alt: "城壁に囲まれた都市を背に、十字の旗を掲げた騎士たちがひざまずいて祈る場面",
        credit: "Prise de Jérusalem par les croisés, le 15 juillet 1099／Émile Signol（1847年）, Château de Versailles, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：「神がそれを望みたもう（Deus vult）」という群衆の叫びが、十字軍の合言葉になったと伝えられる。参加者は衣服に布の十字をつけたことから「十字軍」と呼ばれた。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/十字軍",
  },
  {
    id: "c51", year: 1100, difficulty: 1, era: "中世（ヨーロッパ・イスラーム・アジア）", region: "フランス王国", theme: ["通史", "中世ヨーロッパ"],
    front: "主君と家臣が封土と軍役で結ばれた関係と、荘園で領主に従属した農民の身分は？",
    back: "",
    cloze: {
      template: "中世西ヨーロッパでは、主君が家臣に封土を与えて保護し、家臣が軍役などで忠誠を誓う{{1}}が結ばれた。領主の所領である荘園では、移動や職業選択の自由を持たない{{2}}が、領主直営地での賦役や生産物の貢納を課された。",
      slots: [
        { id: 1, answer: "封建的主従関係", category: "関係" },
        { id: 2, answer: "農奴", category: "身分" },
      ],
      points: [
        { label: "原因", text: "ノルマン人やイスラーム勢力、東方の騎馬民族の侵入が相次ぐなか、王権は弱く、人々は身近な有力者に保護を求めた" },
        { label: "経過", text: "領主は国王の役人の立ち入りや課税を拒む不輸不入権を持ち、荘園の農民に対して裁判権も行使した" },
        { label: "意義", text: "政治的には分権的な封建社会、経済的には自給自足的な荘園制が、中世西ヨーロッパ社会の土台となった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Les_Tr%C3%A8s_Riches_Heures_du_duc_de_Berry_mars.jpg/960px-Les_Tr%C3%A8s_Riches_Heures_du_duc_de_Berry_mars.jpg",
        caption: "ランブール兄弟『ベリー公のいとも豪華なる時祷書』より「3月」（15世紀初め）",
        alt: "城を背に、畑を耕す農民や羊を連れた牧人が描かれた写本の月暦画",
        credit: "Les Très Riches Heures du duc de Berry, Mars／Frères de Limbourg（1412〜1416年頃）, Musée Condé, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Hommage_d_%C3%89douard_Ier_%C3%A0_Philippe_le_Bel.jpg/960px-Hommage_d_%C3%89douard_Ier_%C3%A0_Philippe_le_Bel.jpg",
        caption: "フーケ「フランス王フィリップ4世に臣従の礼をとるイングランド王エドワード1世」（15世紀）",
        alt: "玉座のフランス王の前に、赤い衣のイングランド王がひざまずいて手を差し出す場面",
        credit: "Hommage d'Édouard Ier à Philippe le Bel／Jean Fouquet（1455年頃）, Grandes Chroniques de France, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：中世の社会は「祈る人（聖職者）・戦う人（騎士）・働く人（農民）」の3つの身分から成り立つと考えられていた。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/荘園",
  },
  {
    id: "c54", year: 1204, difficulty: 2, era: "中世（ヨーロッパ・イスラーム・アジア）", region: "ヴェネツィア共和国", theme: ["通史", "十字軍"],
    front: "1204年にビザンツ帝国の首都を占領した十字軍は第何回の遠征か？また、そこに建てた国家は？",
    back: "",
    cloze: {
      template: "1204年、{{1}}十字軍は輸送を請け負ったヴェネツィアの意向で進路を変え、聖地ではなくビザンツ帝国の首都コンスタンティノープルを占領して、{{2}}帝国を建てた。",
      slots: [
        { id: 1, answer: "第4回", category: "回次" },
        { id: 2, answer: "ラテン", category: "国家" },
      ],
      points: [
        { label: "原因", text: "十字軍は輸送費をヴェネツィアに払えず、その肩代わりとして、ヴェネツィアの商業上のライバルである都市の攻撃に加わった" },
        { label: "経過", text: "十字軍は都を略奪し、聖遺物や美術品を持ち去った。ビザンツ帝国は1261年に都を奪回して復活したが、往時の力は戻らなかった" },
        { label: "意義", text: "十字軍が宗教的な理想よりも経済的な利益に動かされていたことを示し、東西キリスト教世界の溝を決定的なものにした" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Eug%C3%A8ne_Delacroix_-_Prise_de_Constantinople_par_les_crois%C3%A9s_%2812_avril_1204%29.jpg/960px-Eug%C3%A8ne_Delacroix_-_Prise_de_Constantinople_par_les_crois%C3%A9s_%2812_avril_1204%29.jpg",
        caption: "ドラクロワ『十字軍のコンスタンティノープル入城』（1840年、ルーヴル美術館）",
        alt: "海を見下ろす都市に騎馬の十字軍が入り、足元で住民たちが許しを請う場面",
        credit: "Prise de Constantinople par les croisés／Eugène Delacroix（1840年）, Musée du Louvre, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Horses_of_Basilica_San_Marco_bright.jpg/960px-Horses_of_Basilica_San_Marco_bright.jpg",
        caption: "サン・マルコ大聖堂の4頭の馬の像（1204年に第4回十字軍が持ち帰った戦利品、ヴェネツィア）",
        alt: "前脚を上げて並ぶ、金色に輝く4頭の青銅の馬の像",
        credit: "Horses of Basilica San Marco／写真: Tteske, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Venezia-Chiesa_di_S._Marco-Facciata_principale%2C_RP-F-F02116.jpg/960px-Venezia-Chiesa_di_S._Marco-Facciata_principale%2C_RP-F-F02116.jpg",
        caption: "サン・マルコ大聖堂の正面（19世紀の写真、ヴェネツィア）",
        alt: "5つのアーチ形の入口と、その上に並ぶドームや尖塔をもつ大聖堂の正面",
        credit: "Venezia, Chiesa di S. Marco, facciata principale／作者不詳（19世紀）, Rijksmuseum, Wikimedia Commons・CC0",
      },
    ],
    anecdote: "豆知識：サン・マルコ大聖堂の正面を飾る4頭の馬の像は、ナポレオンも1797年にパリへ持ち去ったが、1815年にヴェネツィアに返還された。現在、正面にあるのは複製で、本物は聖堂内の博物館にある。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/第4回十字軍",
  },
  {
    id: "c59", year: 1215, difficulty: 0, era: "中世（ヨーロッパ・イスラーム・アジア）", region: "イングランド王国", theme: ["通史", "中世ヨーロッパ"],
    front: "1215年、貴族たちに国王の権限を制限する文書を認めさせられたイングランド王と、その文書は？",
    back: "",
    cloze: {
      template: "1215年、フランス国内の領地の大半を失い、重い税を課したイングランド王{{1}}に対し、貴族たちは国王が勝手に課税することを禁じるなどの{{2}}（大憲章）を認めさせた。",
      slots: [
        { id: 1, answer: "ジョン", category: "人物" },
        { id: 2, answer: "マグナ・カルタ", category: "文書" },
      ],
      points: [
        { label: "原因", text: "王はフランス王フィリップ2世との戦いに敗れて大陸の領地を失い、教皇とも争って破門されるなど失政が続いた" },
        { label: "経過", text: "その後も王と貴族の対立は続き、1265年には貴族シモン・ド・モンフォールが、貴族・聖職者に加えて都市の代表も招いた議会を開いた" },
        { label: "意義", text: "王も法に従うという「法の支配」の原則の出発点とされ、イギリス立憲政治の基礎となった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Charles-sims-painting_King_John.jpg/960px-Charles-sims-painting_King_John.jpg",
        caption: "チャールズ・シムズ「マグナ・カルタを承認するジョン王」（1925年、ロンドン王立取引所の壁画）",
        alt: "天幕の下の王を、甲冑姿の貴族たちが取り囲んで文書への承認を迫る場面",
        credit: "King John assents to Magna Carta／Charles Sims（1925年）, Royal Exchange, London, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Normand_-_King_John_Signing_Magna_Charta.jpg/960px-Normand_-_King_John_Signing_Magna_Charta.jpg",
        caption: "アーネスト・ノルマン「マグナ・カルタに署名するジョン王」（1900年頃）",
        alt: "大勢の貴族や聖職者が見守るなか、机に向かって文書に向き合う王を描いた白黒の挿絵",
        credit: "King John Signing Magna Charta／Ernest Normand（1900年頃）, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：大陸の領地を失ったことから、この王は「欠地王（ジョン・ラックランド）」と呼ばれる。王は文書に署名したのではなく、王の印章を押して承認したとされる。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/マグナ・カルタ",
  },
  {
    id: "c64", year: 1250, difficulty: 1, era: "中世（ヨーロッパ・イスラーム・アジア）", region: "ヴェネツィア共和国", theme: ["通史", "中世ヨーロッパ"],
    front: "ヴェネツィアやジェノヴァの商人が地中海東岸の港で買い付けたアジアの主な産物と、その交易の呼び名は？",
    back: "",
    cloze: {
      template: "十字軍の時代以降、ヴェネツィアやジェノヴァの商人は、地中海東岸のアレクサンドリアやベイルートなどの港でアジア産の{{1}}や絹織物を買い付け、ヨーロッパへ運ぶ{{2}}で莫大な富を築いた。",
      slots: [
        { id: 1, answer: "香辛料", category: "商品" },
        { id: 2, answer: "東方貿易", category: "交易" },
      ],
      points: [
        { label: "原因", text: "十字軍の兵士や物資の輸送を担ったイタリア諸都市が、東地中海の各地に商業拠点と特権を獲得した" },
        { label: "経過", text: "イスラーム商人がインド洋経由で運んだコショウなどを、エジプトやシリアの港で銀や毛織物と引き換えに買い付けた。地中海東岸（レヴァント）を舞台としたことから、レヴァント貿易とも呼ばれる" },
        { label: "意義", text: "北イタリア諸都市に富が集まり、ルネサンスを生む経済的な土台となった。のちにオスマン帝国の進出と新航路の開拓によって衰えた" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/D%C3%A9l%C3%A9gation_v%C3%A9nitienne_%C3%A0_Damas.jpg/960px-D%C3%A9l%C3%A9gation_v%C3%A9nitienne_%C3%A0_Damas.jpg",
        caption: "「ダマスクスでのヴェネツィア使節の歓迎」（1511年頃、ベッリーニ工房。ルーヴル美術館）",
        alt: "モスクの塔が見える町の広場で、ターバン姿の役人たちが赤い衣のヨーロッパ人の一行を迎える場面",
        credit: "Réception d'une ambassade vénitienne à Damas／ベッリーニ工房（1511年頃）, Musée du Louvre, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Accademia_-_Miracle_of_the_Holy_Cross_at_Rialto_by_Vittore_Carpaccio.jpg/960px-Accademia_-_Miracle_of_the_Holy_Cross_at_Rialto_by_Vittore_Carpaccio.jpg",
        caption: "カルパッチョ『リアルト橋の聖十字架の奇跡』（1496年頃）：交易で栄えたヴェネツィアの大運河",
        alt: "木造の跳ね橋がかかる運河に小舟が行き交い、両岸の建物に大勢の人々が集まるヴェネツィアの街並み",
        credit: "Miracolo della reliquia della Croce al ponte di Rialto／Vittore Carpaccio（1496年頃）, Gallerie dell'Accademia, 写真: Didier Descouens, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：ヴェネツィア商人の家に生まれたマルコ・ポーロは、元の皇帝フビライに仕えた。帰国後に口述した『世界の記述（東方見聞録）』は、アジアの豊かさをヨーロッパに伝えた。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/香辛料貿易",
  },
  {
    id: "c63", year: 1300, difficulty: 3, era: "中世（ヨーロッパ・イスラーム・アジア）", region: "フランドル", theme: ["通史", "中世ヨーロッパ"],
    front: "中世都市で市政を握った商人の組合と、それに対抗して手工業者が結成した同職ギルドの呼び名は？",
    back: "",
    cloze: {
      template: "中世の自治都市では、有力な商人が{{1}}をつくって市政を独占した。これに対し手工業者は職種ごとの同職ギルド（{{2}}）を結成し、市政への参加を求めて商人と争った。",
      slots: [
        { id: 1, answer: "商人ギルド", category: "組合" },
        { id: 2, answer: "ツンフト", category: "組合" },
      ],
      points: [
        { label: "原因", text: "毛織物業が栄えたフランドル地方や北イタリアでは、商工業の発達とともに都市の人口と富が増えた" },
        { label: "経過", text: "同職ギルドは親方・職人・徒弟の厳しい身分制度をもち、製品の品質・価格や生産量を細かく定めて自由な競争を制限した" },
        { label: "意義", text: "市民の自治は近代市民社会の源流の一つとなった一方、ギルドの統制は近世以降、産業の自由な発展の妨げともなった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/20141110_Cloth_Hall%2C_Ypres_01.jpg/960px-20141110_Cloth_Hall%2C_Ypres_01.jpg",
        caption: "イーペルの織物会館（13〜14世紀に建設、20世紀に再建。ベルギー・フランドル地方）",
        alt: "長く連なる石造りの建物の中央に、高い鐘楼がそびえる広場の景色",
        credit: "Cloth Hall, Ypres／写真: Mark Ahsmann（2014年）, Wikimedia Commons・CC BY-SA 4.0",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Brussels_guildhalls_grand_place.png/960px-Brussels_guildhalls_grand_place.png",
        caption: "ブリュッセルのグラン・プラスに並ぶギルドハウス（17世紀末に再建）",
        alt: "夜の広場に、装飾豊かな切妻屋根の建物が照明に照らされて並ぶ景色",
        credit: "Guildhalls on the Grand-Place, Brussels／写真: Awjrichards（2011年）, Wikimedia Commons・CC BY-SA 3.0",
      },
    ],
    anecdote: "豆知識：職人は修業の仕上げとして各地の親方のもとを渡り歩いて腕を磨き（遍歴職人）、審査に合格した作品「マスターピース（親方作品）」を作って、ようやく親方になれた。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ギルド",
  },
  {
    id: "c60", year: 1309, difficulty: 2, era: "中世（ヨーロッパ・イスラーム・アジア）", region: "フランス王国", theme: ["通史", "中世ヨーロッパ"],
    front: "1303年にフランス王フィリップ4世に捕らえられた教皇と、1309年に教皇庁が移された南フランスの都市は？",
    back: "",
    cloze: {
      template: "フランス王フィリップ4世は、聖職者への課税をめぐって対立した教皇{{1}}を1303年にアナーニで捕らえた。1309年には教皇庁が南フランスの{{2}}に移され、約70年間にわたってフランス王の強い影響下に置かれた。",
      slots: [
        { id: 1, answer: "ボニファティウス8世", category: "人物" },
        { id: 2, answer: "アヴィニョン", category: "都市" },
      ],
      points: [
        { label: "原因", text: "十字軍の失敗で教皇の権威が揺らぐ一方、国王は官僚制を整えて力を強め、国内の聖職者への課税を進めた" },
        { label: "経過", text: "王は1302年に聖職者・貴族・平民の代表からなる三部会を開いて国内の支持を固め、教皇に対抗した" },
        { label: "意義", text: "教皇がフランス王の言いなりになったこの時期は、古代のユダヤ人の故事になぞらえて「教皇のバビロン捕囚」と呼ばれ、教皇権の衰退を象徴した" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Palais-des-Papes-Avignon-June-2012.jpg/960px-Palais-des-Papes-Avignon-June-2012.jpg",
        caption: "アヴィニョンの教皇庁宮殿（14世紀、南フランス）",
        alt: "青空を背に、尖塔と高い石の城壁がそびえるゴシック様式の巨大な宮殿",
        credit: "Palais des Papes, Avignon／写真: Acediscovery（2012年）, Wikimedia Commons・CC BY 4.0",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Bonifacius_VIII_-_Fresco_in_Lateran.jpg/960px-Bonifacius_VIII_-_Fresco_in_Lateran.jpg",
        caption: "ジョット（派）「聖年を宣言するボニファティウス8世」（1300年頃、ローマのラテラノ大聖堂）",
        alt: "高い冠をかぶった教皇が、聖職者を従えて立つ姿を描いたフレスコ画の断片",
        credit: "Bonifacio VIII proclama il Giubileo／Giotto（1300年頃）, San Giovanni in Laterano, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "逸話：教皇は捕らえられた屈辱から間もなく亡くなり、「狐のように即位し、獅子のように君臨し、犬のように死んだ」と評されたという。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/アヴィニョン捕囚",
  },
  {
    id: "c65", year: 1346, difficulty: 3, era: "中世（ヨーロッパ・イスラーム・アジア）", region: "ジェノヴァ共和国", theme: ["通史", "中世ヨーロッパ"],
    front: "ジェノヴァが黒海交易の拠点としたクリミア半島の植民市と、そこから逃れた船がペストを運んだ地中海の島は？",
    back: "",
    cloze: {
      template: "ジェノヴァは黒海北岸のクリミア半島にある植民市{{1}}を拠点に、黒海交易で栄えた。1346年、キプチャク・ハン国の軍がこの町を包囲した際に疫病が広がり、逃れたジェノヴァ船によってペストは{{2}}島のメッシーナなど地中海の港へ運ばれたといわれる。",
      slots: [
        { id: 1, answer: "カッファ", category: "都市" },
        { id: 2, answer: "シチリア", category: "島" },
      ],
      points: [
        { label: "原因", text: "モンゴル帝国のもとでユーラシアを結ぶ交易路が整い、人や物とともに疫病も遠くまで運ばれるようになった" },
        { label: "経過", text: "包囲軍が疫病で死んだ兵士の遺体を城内に投げ込んだという伝承もある。商船とともにネズミやノミが港から港へ移り、数年でヨーロッパ全域に広がった" },
        { label: "意義", text: "交易の発達が疫病の拡散を早めたことを示す例であり、ヴェネツィアなどの港では入港した船を一定期間隔離する検疫の制度が生まれた" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/THE_GENOESE_FORTRESS_IN_CAFFA.jpg/960px-THE_GENOESE_FORTRESS_IN_CAFFA.jpg",
        caption: "カッファ（現在のフェオドシヤ）に残るジェノヴァの城塞（14世紀、クリミア半島）",
        alt: "丘の上に立つ石造りの塔と城壁、手前に丸屋根の小さな教会が見える",
        credit: "The Genoese fortress in Caffa／写真: Qypchak（2009年）, Wikimedia Commons・CC BY-SA 3.0",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Cristofaro_Grasso%2C_Vista_di_Genova%2C_1597.png/960px-Cristofaro_Grasso%2C_Vista_di_Genova%2C_1597.png",
        caption: "クリストフォロ・デ・グラッシ『ジェノヴァの眺望』（1597年、1481年の景観の写し）",
        alt: "山を背にした港町と、湾内に浮かぶ多数の帆船を描いた俯瞰図",
        credit: "Veduta di Genova／Cristoforo De Grassi（1597年）, Museo navale di Pegli, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：検疫を意味する英語「quarantine」は、ヴェネツィア方言で「40日間」を意味する「クアランタ・ジョルニ」に由来する。疫病を防ぐため、入港する船を40日間沖に留め置いたことにちなむ。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/カッファ",
  },
  {
    id: "c55", year: 1348, difficulty: 1, era: "中世（ヨーロッパ・イスラーム・アジア）", region: "ジェノヴァ共和国", theme: ["通史", "中世ヨーロッパ"],
    front: "14世紀半ばにヨーロッパの人口の約3分の1を奪った疫病と、その結果として進んだ農民の地位の変化は？",
    back: "",
    cloze: {
      template: "14世紀半ば、{{1}}（ペスト）がヨーロッパ全域で大流行し、人口の約3分の1が失われた。働き手が不足して農民の地位が向上し、{{2}}が進んで荘園制の崩壊が早まった。",
      slots: [
        { id: 1, answer: "黒死病", category: "疫病" },
        { id: 2, answer: "農奴解放", category: "社会の変化" },
      ],
      points: [
        { label: "原因", text: "黒海沿岸の交易拠点から、ジェノヴァなどイタリアの商船を通じて地中海各地の港へ広がった" },
        { label: "経過", text: "領主が農民への締め付けを強めようとすると、フランスのジャックリーの乱（1358年）やイギリスのワット・タイラーの乱（1381年）などの農民反乱が起こった" },
        { label: "意義", text: "封建領主の力が衰える一方、王権が伸長して中央集権化が進み、中世社会の解体が加速した" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/The_Triumph_of_Death_by_Pieter_Bruegel_the_Elder.jpg/960px-The_Triumph_of_Death_by_Pieter_Bruegel_the_Elder.jpg",
        caption: "ブリューゲル『死の勝利』（1562年頃、プラド美術館）",
        alt: "荒れ果てた大地で、骸骨の軍勢が人々を次々に襲う光景",
        credit: "De triomf van de dood／Pieter Bruegel de Oude（1562年頃）, Museo del Prado, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Doutielt1.jpg/960px-Doutielt1.jpg",
        caption: "ピエラール・ドゥ・ティエルトの写本挿絵：黒死病の犠牲者を埋葬するトゥルネーの人々（1350年代）",
        alt: "次々に運び込まれる棺を、人々が墓穴に埋めていく写本の挿絵",
        credit: "Burying plague victims of Tournai／Pierart dou Tielt（1352年頃）, Bibliothèque royale de Belgique, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：死を身近に感じた人々の間では、骸骨と人々が踊る「死の舞踏」が絵画や詩の題材として広まった。また、疫病の原因を誤って押しつけられたユダヤ人が各地で迫害された。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/黒死病",
  },
  {
    id: "c62", year: 1370, difficulty: 1, era: "中世（ヨーロッパ・イスラーム・アジア）", region: "神聖ローマ帝国", theme: ["通史", "中世ヨーロッパ"],
    front: "北ドイツの諸都市が北海・バルト海の交易のために結んだ都市同盟と、その盟主となった都市は？",
    back: "",
    cloze: {
      template: "北ドイツの諸都市は、北海・バルト海の交易を守るために{{1}}同盟を結んだ。同盟は{{2}}を盟主とし、14世紀にはデンマーク王との戦争に勝利して北ヨーロッパの商業を支配した。",
      slots: [
        { id: 1, answer: "ハンザ", category: "同盟" },
        { id: 2, answer: "リューベック", category: "都市" },
      ],
      points: [
        { label: "原因", text: "11世紀以降、農業生産の拡大とともに商業が復活し、都市は国王や諸侯から特許状を得て自治権を獲得していった" },
        { label: "経過", text: "ロンドンやブリュージュ、ノヴゴロドなどに商館を置き、海産物・木材・毛皮・穀物などを取引した。同盟は独自の軍隊も持った" },
        { label: "意義", text: "地中海の交易を担うイタリア諸都市と並ぶ、もう一つの中世商業圏（北ヨーロッパ商業圏）を形づくった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Holstentor_in_L%C3%BCbeck_2015.jpg/960px-Holstentor_in_L%C3%BCbeck_2015.jpg",
        caption: "リューベックのホルステン門（1478年完成、ドイツ北部）",
        alt: "円錐形の屋根をもつ2つの塔にはさまれた、赤れんが造りの城門",
        credit: "Holstentor in Lübeck／写真: Christian Wolf（2015年）, Wikimedia Commons・CC BY-SA 3.0 de",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Bremer_Kogge_%28Schiff_1380%29%2C_Bremerhaven.jpg/960px-Bremer_Kogge_%28Schiff_1380%29%2C_Bremerhaven.jpg",
        caption: "ハンザ商人が使った帆船コッグの実物（1380年頃の沈没船、ブレーマーハーフェンのドイツ海事博物館）",
        alt: "博物館の展示室に置かれた、木造船の船体の骨組み",
        credit: "Bremer Kogge（1380）, Deutsches Schifffahrtsmuseum／写真: Olga Ernst（2021年）, Wikimedia Commons・CC BY-SA 4.0",
      },
    ],
    anecdote: "豆知識：「都市の空気は（人を）自由にする」ということわざがあり、荘園から逃れて都市に1年と1日住み続けた農民は、領主の支配から自由の身になれたといわれる。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/ハンザ同盟",
  },
  {
    id: "c61", year: 1414, difficulty: 3, era: "中世（ヨーロッパ・イスラーム・アジア）", region: "神聖ローマ帝国", theme: ["通史", "中世ヨーロッパ"],
    front: "1378年から教皇が並び立った教会の混乱と、それを収拾した1414年からの公会議は？",
    back: "",
    cloze: {
      template: "教皇庁がローマに戻ったのち、1378年からローマと南フランスに教皇が並び立つ{{1}}（大シスマ）が起こった。混乱は1414年からの{{2}}公会議で収拾され、教会を批判していたベーメンのフスは異端として火刑に処された。",
      slots: [
        { id: 1, answer: "教会大分裂", category: "出来事" },
        { id: 2, answer: "コンスタンツ", category: "地名" },
      ],
      points: [
        { label: "原因", text: "フランス出身の枢機卿たちがローマの教皇に反発して別の教皇を立て、各国の王もそれぞれの利害から一方を支持した" },
        { label: "経過", text: "一時は3人の教皇が並び立つ事態となったが、公会議で3人とも退位・廃位させ、新たな教皇を選んで統一を回復した" },
        { label: "意義", text: "教皇の権威は大きく傷つき、聖書を重んじて教会を批判したイギリスのウィクリフやベーメンのフスの主張は、のちの宗教改革の先駆けとなった" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Konstanzer_Richental_Chronik_Sitzung_des_Konzils_im_M%C3%BCnster_16r.jpg/960px-Konstanzer_Richental_Chronik_Sitzung_des_Konzils_im_M%C3%BCnster_16r.jpg",
        caption: "『リヒェンタール年代記』の挿絵：コンスタンツ公会議の会議の様子（15世紀）",
        alt: "大聖堂の中に段状に並んだ席に、高い冠や帽子をかぶった聖職者たちが座る写本の挿絵",
        credit: "Sitzung des Konzils im Münster, Konstanzer Richental-Chronik／Ulrich Richental（1464年頃）, Rosgartenmuseum Konstanz, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Spiezer_Chronik_Jan_Hus_1485.jpg/960px-Spiezer_Chronik_Jan_Hus_1485.jpg",
        caption: "『シュピーツ年代記』の挿絵：火刑に処されるフス（15世紀）",
        alt: "炎に包まれる柱に縛りつけられた人物と、薪をくべる人々を描いた写本の挿絵",
        credit: "Jan Hus auf dem Scheiterhaufen, Spiezer Chronik／Diebold Schilling（1485年頃）, Burgerbibliothek Bern, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：フスの処刑に怒ったベーメン（現在のチェコ）の人々はフス戦争を起こし、十数年にわたって皇帝の軍を退けた。フスは今もチェコの民族的英雄とされている。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/教会大分裂",
  },
  {
    id: "c56", year: 1429, difficulty: 0, era: "中世（ヨーロッパ・イスラーム・アジア）", region: "フランス王国", theme: ["通史", "中世ヨーロッパ"],
    front: "1339年に始まったイギリスとフランスの戦争と、オルレアンの包囲を破ってフランスを救った少女は？",
    back: "",
    cloze: {
      template: "フランスの王位継承とフランドル地方の支配をめぐって、1339年にイギリスとフランスの間で{{1}}が始まった。劣勢のフランスは、神のお告げを受けたと信じる農民の少女{{2}}がオルレアンの包囲を破ったことで形勢を逆転した。",
      slots: [
        { id: 1, answer: "百年戦争", category: "戦争" },
        { id: 2, answer: "ジャンヌ・ダルク", category: "人物" },
      ],
      points: [
        { label: "原因", text: "フランスのカペー朝が断絶すると、母方がカペー家出身のイギリス王エドワード3世がフランス王位を要求した" },
        { label: "経過", text: "前半はクレシーの戦いなどで長弓兵を活用したイギリス軍が優勢だったが、少女の活躍でシャルル7世がランスで戴冠し、1453年にフランスの勝利で終わった" },
        { label: "意義", text: "長い戦争で諸侯・騎士は没落し、英仏ともに王権が強まって中央集権的な国家づくりが進んだ" },
      ],
    },
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Ingres_coronation_charles_vii.jpg/960px-Ingres_coronation_charles_vii.jpg",
        caption: "アングル『シャルル7世の戴冠式のジャンヌ・ダルク』（1854年、ルーヴル美術館）",
        alt: "甲冑をまとい、旗を手にして祭壇の前に立つ少女",
        credit: "Jeanne d'Arc au sacre du roi Charles VII／Jean-Auguste-Dominique Ingres（1854年）, Musée du Louvre, Wikimedia Commons・Public domain",
      },
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Battle_of_crecy_froissart.jpg/960px-Battle_of_crecy_froissart.jpg",
        caption: "『フロワサール年代記』の挿絵：クレシーの戦い（1346年の戦いを描いた15世紀の写本）",
        alt: "旗を掲げた騎士と、長弓や弩を構えた兵士たちが入り乱れて戦う写本の挿絵",
        credit: "Bataille de Crécy, Chroniques de Froissart／Loyset Liédet（15世紀）, Bibliothèque nationale de France, Wikimedia Commons・Public domain",
      },
    ],
    anecdote: "豆知識：少女はのちにイギリス側に捕らえられ、異端として1431年にルーアンで火刑に処された。死後に名誉回復の裁判が行われ、20世紀にはカトリック教会の聖人となった。",
    anecdoteLink: "https://ja.wikipedia.org/wiki/百年戦争",
  },
];

export const MAP_YEARS = [1600, 1618, 1648, 1660];

// 陸地の下地。勢力の輪郭と同じ Natural Earth の州・県データから geo/build.mjs で生成しており、
// 勢力の海岸線は陸地の海岸線と完全に一致する（座標系は mapProjection.js）
export const WORLD_LAND_PATH = GEO_LAND_PATH;

// cx/cyは実際の経緯度をd3-geo（geoMercator、WORLD_LAND_PATHと同一の投影パラメータ）で投影した座標。
// 例：神聖ローマ帝国 [10.5, 50.5]（ドイツ中部）、オランダ [5.3, 52.3]、スペイン・オーストリア [-3.7, 40.4]、
//     フランス王国 [2.3, 47.0]、オスマン帝国 [32.0, 39.0]
//
// 史実国境データ（精緻化版）：d3-geo（WORLD_LAND_PATHと同一の投影パラメータ）で経緯度から投影した、
// 各勢力のおおよその実効支配領域ポリゴン。三十年戦争の中心的な論点である「アルザス地方の帰属」だけを
// 年代別に変化させている（1618年＝神聖ローマ帝国領、1648年のウェストファリア条約以降＝フランス領）。
// それ以外の勢力（オランダ・スペイン/オーストリア・オスマン帝国）は史実上この期間で大きな境界変化がないため、
// 単一パターンを使い回している。手作業による近似ポリゴンであり、史料に基づく厳密な国境線ではない。
export const HRE_POINTS_1618 = "M508.122,175.809C510.335,175.372,512.311,178.193,514.835,178.717C517.797,179.33,521.58,178.252,524.904,178.717C528.294,179.191,532.484,179.439,534.974,181.589C537.665,183.914,540.458,189.453,540.008,192.746C539.592,195.792,535.299,198.068,533.296,200.791C531.41,203.352,530.253,207.081,528.261,208.583C526.761,209.715,523.298,209.31,523.226,210.114C523.112,211.387,534.397,213.876,534.974,216.145C535.361,217.669,533.298,220.051,531.617,221.067C529.616,222.277,526.023,222.04,523.226,222.04C520.429,222.04,517.259,220.865,514.835,221.067C512.926,221.226,511.481,222.935,509.8,222.526C507.567,221.981,504.067,217.918,503.088,216.145C502.574,215.216,502.752,214.483,502.584,213.649C502.416,212.811,502.275,211.968,502.081,211.129C501.884,210.279,501.633,209.434,501.409,208.583C501.185,207.729,501.038,206.859,500.738,206.012C500.428,205.136,499.954,204.284,499.563,203.415C499.171,202.543,498.655,201.906,498.389,200.791C497.974,199.055,497.893,196.318,498.053,193.834C498.24,190.925,498.261,187.292,499.731,184.427C501.381,181.213,505.285,176.369,508.122,175.809Z";
export const HRE_POINTS_1648 = "M507.84,175.7C510.053,175.263,512.029,178.084,514.553,178.608C517.515,179.221,521.298,178.143,524.622,178.608C528.012,179.082,532.202,179.33,534.692,181.48C537.383,183.805,540.176,189.344,539.726,192.637C539.31,195.683,535.017,197.959,533.014,200.681C531.128,203.243,529.971,206.972,527.979,208.474C526.479,209.606,523.016,209.201,522.944,210.005C522.83,211.278,534.115,213.767,534.692,216.036C535.079,217.56,533.016,219.942,531.335,220.958C529.334,222.168,525.741,221.931,522.944,221.931C520.147,221.931,516.977,220.755,514.553,220.958C512.644,221.117,511.037,222.934,509.518,222.417C507.581,221.756,504.88,217.209,504.484,215.539C504.291,214.725,504.713,214.246,504.819,213.54C504.938,212.75,505.208,211.857,505.155,211.02C505.102,210.168,504.739,209.208,504.484,208.474C504.28,207.888,504.061,207.444,503.812,206.935C503.558,206.414,503.253,205.903,502.973,205.386C502.693,204.868,502.411,204.677,502.134,203.828C501.21,200.995,497.833,189.234,499.449,184.318C500.712,180.476,505.003,176.26,507.84,175.7Z";
export const FR_POINTS_1618 = "M490.493,195.402C493.098,195.75,494.402,199.873,496.535,201.201C498.35,202.331,501.035,203.713,502.241,203.276C503.089,202.969,503.346,200.583,503.751,200.679C504.772,200.921,504.585,214.372,504.926,219.79C505.177,223.799,505.531,228.183,505.597,230.253C505.625,231.124,506,231.622,505.597,232.113C504.805,233.076,500.774,232.667,498.548,233.5C496.296,234.342,494.244,236.612,492.171,237.165C490.457,237.623,489.068,237.506,487.137,237.165C484.319,236.668,479.036,236.038,477.067,233.5C474.835,230.622,477.389,223.88,475.725,219.79C474.049,215.673,466.511,211.736,466.998,208.899C467.424,206.419,472.659,205.258,476.06,203.276C480.284,200.817,486.843,194.915,490.493,195.402Z";
export const FR_POINTS_1648 = "M489.687,195.891C492.293,196.238,493.596,200.362,495.729,201.689C497.545,202.82,499.677,203.849,501.435,203.765C503.004,203.69,504.962,201.415,505.798,201.689C506.305,201.855,506.357,202.729,506.638,203.248C506.917,203.765,507.222,204.276,507.477,204.797C507.725,205.305,507.944,205.75,508.148,206.336C508.403,207.07,508.766,208.03,508.819,208.881C508.872,209.718,508.603,210.611,508.484,211.402C508.377,212.108,508.449,212.57,508.148,213.4C507.55,215.047,504.747,217.637,504.12,220.278C503.402,223.307,504.725,228.672,504.791,230.741C504.819,231.613,505.195,232.111,504.791,232.601C503.999,233.565,499.969,233.156,497.743,233.988C495.491,234.831,493.438,237.101,491.366,237.654C489.651,238.112,488.262,237.995,486.331,237.654C483.513,237.157,478.23,236.527,476.262,233.988C474.03,231.111,476.584,224.368,474.919,220.278C473.243,216.162,465.705,212.225,466.192,209.387C466.618,206.907,471.853,205.746,475.255,203.765C479.478,201.305,486.037,195.403,489.687,195.891Z";
export const NL_POINTS = "M495.449,196.116C495.536,195.907,494.792,195.578,494.784,195.2C494.771,194.608,495.962,193.692,496.31,192.887C496.634,192.137,496.444,191.164,496.863,190.547C497.278,189.936,498.39,189.632,498.798,189.195C499.057,188.917,499.031,188.606,499.289,188.379C499.628,188.081,500.235,187.858,500.795,187.718C501.436,187.558,502.524,187.368,502.945,187.552C503.184,187.657,503.218,188.112,503.375,188.098C503.636,188.075,503.798,186.699,504.276,186.405C504.771,186.101,505.874,186.103,506.335,186.363C506.708,186.574,506.738,187.449,507.011,187.535C507.219,187.6,507.552,187.412,507.717,187.203C507.938,186.923,507.93,185.825,508,185.832C508.197,185.852,509.96,195.04,508,197C505.821,199.179,495.968,197.554,494.191,197C493.714,196.851,493.371,196.434,493.371,196.434C493.371,196.434,493.371,196.434,493.371,196.434C493.371,196.434,495.33,196.401,495.449,196.116Z";
// スペイン・オーストリアはハプスブルク家の2つの領域（イベリア半島＋オーストリア世襲領）を1つの<path>で表現
export const SPAIN_AUSTRIA_PATH = "M456.885,246.19C457.039,245.842,457.323,245.772,457.53,245.436C457.845,244.925,458.448,243.663,458.421,243.314C458.412,243.194,458.301,243.21,458.278,243.081C458.2,242.635,458.935,240.944,458.933,239.894C458.931,238.868,458.383,237.606,458.298,236.852C458.249,236.414,458.173,236.094,458.278,235.802C458.372,235.539,458.774,235.444,458.831,235.156C458.914,234.736,457.927,233.869,458.264,233.432C459.733,231.528,490.734,233.888,492.626,235.546C492.93,235.813,492.877,236.165,492.797,236.42C492.714,236.686,492.411,236.862,492.101,237.097C491.626,237.457,490.587,237.875,490.125,238.239C489.829,238.472,489.812,238.716,489.479,238.917C488.873,239.284,487.164,239.373,486.489,239.77C486.057,240.024,485.572,240.443,485.588,240.672C485.599,240.833,486.102,240.931,486.09,241.05C486.076,241.195,485.549,241.199,485.25,241.454C484.684,241.938,483.814,243.442,483.346,244.203C483.032,244.713,482.7,245.044,482.629,245.525C482.553,246.038,482.718,246.733,482.977,247.203C483.227,247.657,484.151,247.954,484.124,248.314C484.093,248.719,482.895,249.075,482.475,249.489C482.141,249.819,481.916,250.094,481.717,250.521C481.461,251.07,481.61,252.254,481.216,252.579C480.892,252.846,480.224,252.469,479.782,252.647C479.29,252.846,478.733,253.406,478.441,253.822C478.212,254.148,478.232,254.55,478.041,254.844C477.858,255.125,477.629,255.466,477.335,255.559C477.015,255.66,476.475,255.289,476.167,255.344C475.943,255.384,475.856,255.614,475.625,255.664C475.286,255.738,474.825,255.539,474.283,255.522C473.454,255.495,471.824,255.377,471.129,255.652C470.709,255.818,470.61,256.229,470.259,256.402C469.865,256.596,469.175,256.45,468.846,256.697C468.552,256.917,468.544,257.477,468.303,257.714C468.097,257.917,467.833,258.096,467.555,258.099C467.208,258.103,466.727,257.882,466.378,257.53C465.849,256.997,465.586,255.428,465.088,254.813C464.747,254.392,464.413,254.096,463.971,253.959C463.48,253.807,462.721,253.906,462.241,254.052C461.853,254.17,461.673,254.561,461.268,254.633C460.702,254.733,459.702,254.194,459.097,254.219C458.655,254.237,458.089,254.675,457.96,254.535C457.814,254.376,458.392,253.709,458.483,253.114C458.624,252.188,458.731,249.866,458.298,249.451C458.077,249.24,457.477,249.607,457.346,249.445C457.206,249.271,457.711,248.536,457.571,248.371C457.439,248.216,456.609,248.415,456.609,248.415C456.609,248.415,456.609,248.415,456.609,248.415C456.609,248.415,456.654,246.713,456.885,246.19ZM493.158,196.985C494.557,196.496,496.665,196.496,498.064,196.985C499.356,197.436,500.876,198.433,501.335,199.587C501.821,200.805,501.494,203.095,500.681,204.201C499.864,205.312,497.919,206.116,496.429,206.224C494.872,206.336,492.613,205.788,491.522,204.708C490.406,203.603,489.485,200.909,489.886,199.587C490.241,198.421,491.866,197.436,493.158,196.985Z M501.909,214.313C502.626,214.718,503.442,215.496,503.545,216.239C503.66,217.067,502.926,218.812,502.236,219.101C501.588,219.372,500.286,218.667,499.62,218.15C499.012,217.679,498.43,216.943,498.311,216.239C498.187,215.508,498.423,214.178,498.965,213.829C499.559,213.448,501.131,213.872,501.909,214.313Z";
// 神聖ローマ帝国内部の視覚的サブシェーディング（オーストリア大公国／ベーメン王国）。
// 独立した勢力IDではなく、あくまで神聖ローマ帝国という1つの勢力の内部区分を示す装飾レイヤー（タップ不可・別色調で重ね描き）
export const HRE_AUSTRIA_SUB = "M520.533,214.994C523.299,214.585,526.276,212.148,528.276,212.287C529.602,212.378,531.03,213.492,531.487,213.936C531.663,214.106,531.754,214.174,531.743,214.399C531.712,215.074,530.425,217.502,529.067,218.324C527.399,219.332,524.097,219.149,521.956,219.149C520.192,219.149,518.795,218.904,517.131,218.589C515.298,218.242,512.36,218.043,511.431,217.081C510.818,216.446,510.422,215.101,510.862,214.574C511.716,213.551,517.528,215.437,520.533,214.994Z";
export const HRE_BOHEMIA_SUB = "M523.378,198.893C524.702,198.434,526.572,198.303,527.644,198.893C528.68,199.462,529.779,200.994,529.774,202.248C529.767,203.857,527.624,206.688,526.222,207.745C525.171,208.538,523.708,209.059,522.7,208.815C521.729,208.581,520.801,207.46,520.249,206.44C519.616,205.271,518.937,203.268,519.396,202.033C519.883,200.721,521.934,199.394,523.378,198.893Z";

// 背景装飾レイヤー：ポーランド・リトアニア共和国／教皇領／ヴェネツィア共和国／イングランド・スコットランド。
// タップ不可・非インタラクティブな「文脈としての周辺国」。5勢力のような学習コンテンツ（設問・解説）は持たない、
// 地図が黒い未着色の穴だらけにならないようにするための淡いトーンの背景埋めのみ
export const BACKGROUND_TERRITORIES = [
  { name: "ポーランド・リトアニア", fill: "#E3DDA8", labelX: 545, labelY: 194,
    d: "M536.728,181.048C541.778,177.859,547.603,172.837,552.657,172.663C557.102,172.51,562.26,175.025,565.4,178.288C568.899,181.923,572.599,189.327,571.771,194.364C570.887,199.741,564.149,207.024,559.028,209.396C554.424,211.529,548.092,209.87,543.099,209.396C538.593,208.968,533.996,208.38,530.356,206.956C527.262,205.745,523.748,204.441,522.392,201.999C520.975,199.449,520.835,194.868,522.392,191.762C524.45,187.655,531.692,184.227,536.728,181.048Z" },
  { name: "教皇領", fill: "#D9D2C6", labelX: 519, labelY: 234,
    d: "M520.825,230.726C521.949,231.795,522.885,234.98,522.46,236.508C522.094,237.827,520.28,239.572,519.189,239.572C518.099,239.572,516.408,237.761,515.918,236.508C515.431,235.259,516.025,233.291,516.245,232.071C516.405,231.186,516.345,230.151,516.9,229.825C517.628,229.398,519.905,229.85,520.825,230.726Z" },
  { name: "ヴェネツィア共和国", fill: "#C9A7C4", labelX: 519, labelY: 223,
    d: "M518.521,217.621C520.266,217.698,522.986,220.251,523.755,221.863C524.36,223.132,524.481,225.172,523.755,226.038C522.935,227.014,520.169,227.199,518.521,226.957C516.902,226.718,514.713,225.791,513.941,224.654C513.282,223.681,513.099,222.007,513.614,220.926C514.262,219.568,516.886,217.549,518.521,217.621Z" },
  { name: "イングランド・スコットランド", fill: "#C7D3A8", labelX: 474, labelY: 186,
    d: "M474.416,162.765C474.036,163.371,472.307,164.187,472.204,164.72C472.149,165.005,472.595,165.192,472.583,165.472C472.567,165.847,471.678,166.611,471.795,166.757C471.936,166.934,473.318,166.091,473.874,166.056C474.236,166.033,474.394,166.211,474.785,166.24C475.472,166.291,477.02,165.802,477.652,166.093C478.092,166.296,478.474,166.81,478.502,167.198C478.53,167.59,478.016,167.958,477.806,168.435C477.546,169.026,477.418,169.878,477.13,170.505C476.866,171.08,476.616,171.662,476.178,172.071C475.722,172.497,474.388,172.773,474.416,172.983C474.442,173.173,475.962,173.081,476.014,173.322C476.078,173.62,473.961,174.486,473.996,174.803C474.018,175.001,474.56,175.171,474.887,175.191C475.269,175.214,475.739,174.778,476.157,174.812C476.592,174.847,477.04,175.12,477.447,175.438C477.95,175.832,478.473,176.389,478.85,177.122C479.365,178.124,479.276,180.184,479.884,181.091C480.33,181.755,481.091,181.902,481.646,182.413C482.239,182.959,483.296,183.87,483.315,184.293C483.324,184.497,482.989,184.544,482.967,184.764C482.924,185.19,484.053,186.571,483.888,186.754C483.764,186.891,482.765,186.28,482.721,186.355C482.671,186.441,483.612,187.004,483.919,187.427C484.225,187.849,484.613,188.439,484.564,188.89C484.517,189.326,483.634,189.808,483.684,190.098C483.72,190.311,484.124,190.572,484.349,190.555C484.611,190.536,484.813,189.938,485.148,189.811C485.53,189.666,486.084,189.713,486.561,189.844C487.123,189.999,487.956,190.371,488.271,190.809C488.533,191.173,488.551,191.669,488.527,192.142C488.499,192.695,488.245,193.411,487.995,193.918C487.779,194.356,487.55,194.767,487.186,195.04C486.796,195.332,485.793,195.299,485.691,195.567C485.617,195.76,486.157,196.131,486.09,196.291C486.02,196.457,485.317,196.367,485.24,196.529C485.173,196.67,485.308,197.002,485.506,197.139C485.856,197.381,487.333,196.961,487.585,197.242C487.744,197.42,487.711,197.79,487.534,198.071C487.151,198.679,484.988,199.829,484.134,199.961C483.664,200.034,483.399,199.741,482.977,199.727C482.475,199.711,481.876,200.005,481.318,199.953C480.726,199.898,479.85,199.213,479.526,199.359C479.324,199.45,479.438,199.89,479.239,200.031C478.958,200.231,477.963,199.935,477.775,200.133C477.66,200.254,477.88,200.57,477.765,200.678C477.578,200.855,476.775,200.711,476.311,200.623C475.861,200.538,475.438,200.176,475.02,200.172C474.627,200.168,474.148,200.282,473.874,200.546C473.571,200.838,473.599,201.628,473.362,201.935C473.196,202.15,472.997,202.349,472.768,202.352C472.461,202.355,472.095,201.69,471.682,201.625C471.22,201.552,470.591,201.815,470.105,202.074C469.589,202.349,469.123,203.261,468.692,203.268C468.337,203.274,467.68,202.657,467.709,202.491C467.731,202.368,468.109,202.441,468.364,202.275C468.913,201.918,470.195,200.54,470.515,199.898C470.686,199.555,470.539,199.281,470.689,198.998C470.871,198.654,471.182,198.237,471.641,198.039C472.324,197.744,473.805,198.365,474.631,197.961C475.48,197.546,476.742,195.635,476.638,195.519C476.538,195.408,474.796,196.99,474.191,197.124C473.879,197.193,473.705,197.13,473.423,197.013C472.984,196.831,472.441,196.131,471.918,195.885C471.453,195.666,470.883,195.474,470.474,195.535C470.139,195.585,469.895,196.09,469.614,196.045C469.264,195.99,468.587,195.193,468.59,194.88C468.592,194.666,468.837,194.522,469.081,194.343C469.506,194.031,470.555,193.854,471.088,193.411C471.592,192.993,472.111,192.378,472.235,191.802C472.353,191.254,472.226,190.25,471.887,190.048C471.553,189.85,470.337,190.712,470.238,190.564C470.118,190.384,471.173,189.073,471.866,188.61C472.594,188.124,473.993,188.28,474.549,187.776C474.989,187.377,475.22,186.607,475.235,186.154C475.246,185.834,474.95,185.634,474.949,185.326C474.948,184.937,475.531,184.144,475.399,184.006C475.294,183.896,474.82,184.347,474.549,184.25C474.139,184.104,473.547,183.231,473.402,182.592C473.241,181.883,474.055,180.323,473.792,180.147C473.571,179.999,472.824,180.889,472.297,181.057C471.794,181.217,471.148,181.257,470.709,181.168C470.367,181.099,470.037,180.655,469.849,180.731C469.677,180.801,469.718,181.479,469.583,181.501C469.43,181.526,469,181.058,468.948,180.671C468.854,179.968,470.309,178.224,470.249,177.471C470.214,177.033,469.74,176.873,469.644,176.475C469.525,175.981,469.978,174.797,469.777,174.688C469.601,174.593,468.829,175.611,468.682,175.526C468.546,175.447,468.946,174.409,468.835,174.352C468.738,174.302,468.262,174.721,468.17,174.971C468.081,175.214,468.292,175.476,468.272,175.825C468.24,176.391,468.066,177.789,467.75,178.028C467.587,178.152,467.268,178.148,467.146,178.002C466.857,177.657,467.337,175.791,467.596,174.67C467.872,173.477,469.017,171.204,468.794,171.056C468.642,170.956,467.927,172.198,467.473,172.223C467.032,172.247,466.208,171.723,466.112,171.263C465.98,170.631,467.792,169.184,467.74,168.572C467.71,168.224,467.09,168.076,467.074,167.804C467.057,167.524,467.681,167.185,467.678,166.913C467.675,166.68,467.254,166.524,467.217,166.268C467.171,165.953,467.338,165.33,467.607,165.138C467.885,164.94,468.807,165.301,468.887,165.138C468.961,164.987,468.294,164.587,468.211,164.263C468.129,163.945,468.179,163.409,468.375,163.216C468.56,163.034,469.155,163.279,469.306,163.084C469.49,162.845,468.954,161.891,469.143,161.69C469.303,161.52,469.69,161.767,470.146,161.747C471.14,161.704,474.54,160.707,474.867,161.065C474.989,161.198,474.776,161.469,474.713,161.709C474.633,162.018,474.648,162.396,474.416,162.765Z" },
];
// オスマン帝国はバルカン半島〜アナトリア〜レヴァント本体＋北アフリカ沿岸（マグリブ〜エジプト）を1つの<path>で表現
export const OTTOMAN_PATH = "M560,195C575.783,193.528,601.175,197.718,612,205C619.265,209.888,623.092,215.703,625,225C628.408,241.607,621.771,291.777,612,300C607.211,304.031,594.405,300.422,593.712,300C593.653,299.964,593.687,299.945,593.652,299.884C593.508,299.633,592.889,298.484,592.464,298.004C592.133,297.63,591.791,297.348,591.42,297.149C591.081,296.967,590.661,297.062,590.344,296.819C589.927,296.498,589.319,295.541,589.31,295.163C589.305,294.971,589.537,294.905,589.556,294.722C589.583,294.454,589.428,294.09,589.228,293.686C588.889,292.999,587.877,291.882,587.426,291.116C587.091,290.548,587.008,290.134,586.668,289.562C586.199,288.773,585.302,287.716,584.764,286.885C584.319,286.198,584.139,285.323,583.627,284.949C583.188,284.628,582.174,284.879,582.019,284.585C581.884,284.329,582.339,283.915,582.48,283.424C582.707,282.634,583.268,280.353,583.064,280.245C582.951,280.185,582.566,280.569,582.357,280.942C581.928,281.707,581.749,284.19,581.405,285.01C581.24,285.403,581.137,285.77,580.893,285.82C580.578,285.884,580.007,285.292,579.582,284.91C579.08,284.459,578.454,283.821,578.128,283.227C577.842,282.706,577.882,282.1,577.636,281.587C577.386,281.065,576.878,280.635,576.633,280.126C576.404,279.65,576.366,278.659,576.182,278.642C576.015,278.627,575.573,279.432,575.599,279.768C575.622,280.065,576.052,280.251,576.182,280.568C576.331,280.931,576.234,281.428,576.377,281.852C576.535,282.319,576.794,282.745,577.135,283.238C577.591,283.899,578.75,284.783,578.978,285.39C579.109,285.739,578.897,285.978,578.988,286.328C579.122,286.843,579.774,287.551,579.961,288.112C580.11,288.56,579.974,288.893,580.145,289.391C580.426,290.209,581.315,291.341,581.876,292.422C582.493,293.611,582.987,295.272,583.668,296.244C584.178,296.971,585.417,297.7,585.337,297.917C585.294,298.034,584.792,297.824,584.651,297.971C584.444,298.187,584.549,299.089,584.6,299.459C584.632,299.687,584.893,299.835,584.773,300C583.509,301.731,530.633,308.633,522,300C515.936,293.936,519.939,270.574,522,269.029C522.541,268.623,523.542,269.379,524.05,269.628C524.393,269.797,524.5,270.05,524.839,270.202C525.316,270.415,526.318,270.332,526.723,270.606C527.005,270.797,527.104,271.059,527.245,271.383C527.436,271.824,527.427,272.633,527.634,273.07C527.789,273.397,527.963,273.631,528.228,273.84C528.535,274.083,528.964,274.259,529.416,274.378C529.959,274.521,530.693,274.439,531.29,274.546C531.854,274.647,532.324,274.782,532.908,274.984C533.634,275.235,534.546,275.565,535.294,275.997C536.053,276.435,536.816,277.397,537.424,277.602C537.797,277.728,538.089,277.694,538.427,277.608C538.821,277.508,539.281,277.234,539.625,276.95C539.966,276.669,540.271,276.268,540.485,275.917C540.669,275.615,540.846,275.383,540.875,274.996C540.921,274.378,540.192,273.222,540.24,272.53C540.276,272.007,540.554,271.544,540.793,271.184C540.991,270.885,541.185,270.717,541.499,270.472C541.974,270.101,542.895,269.484,543.465,269.305C543.849,269.184,544.216,269.34,544.5,269.229C544.742,269.134,544.827,268.845,545.093,268.758C545.477,268.633,546.092,268.7,546.67,268.823C547.433,268.985,548.894,269.372,549.23,269.839C549.429,270.116,549.16,270.571,549.282,270.805C549.382,270.996,549.563,271.106,549.794,271.202C550.142,271.346,550.826,271.255,551.248,271.389C551.608,271.504,551.823,271.801,552.19,271.89C552.637,271.998,553.314,271.772,553.767,271.867C554.14,271.945,554.488,272.064,554.74,272.309C555.019,272.58,554.973,273.303,555.313,273.481C555.725,273.697,556.467,273.171,557.207,273.192C558.268,273.222,559.991,273.652,561.058,274.002C561.865,274.266,562.456,274.757,563.106,274.932C563.648,275.078,564.178,274.949,564.662,275.088C565.128,275.222,565.519,275.67,565.963,275.733C566.387,275.793,566.839,275.674,567.263,275.497C567.75,275.294,568.256,274.665,568.687,274.499C568.988,274.383,569.303,274.524,569.526,274.395C569.746,274.267,569.759,273.867,570.018,273.736C570.393,273.546,571.481,273.906,571.738,273.719C571.87,273.622,571.759,273.346,571.882,273.284C572.098,273.176,572.803,273.718,573.223,273.73C573.588,273.741,574.155,273.338,574.257,273.452C574.351,273.557,573.858,274.047,573.93,274.286C574.011,274.557,574.595,274.963,574.872,274.949C575.107,274.937,575.273,274.413,575.496,274.407C575.743,274.4,575.966,274.956,576.295,275.03C576.699,275.121,577.542,274.595,577.79,274.696C577.906,274.743,577.852,274.924,577.974,274.978C578.276,275.112,579.487,274.823,579.992,274.655C580.323,274.544,580.501,274.479,580.77,274.245C581.218,273.856,581.841,272.993,582.193,272.268C582.551,271.531,582.627,270.67,582.89,269.851C583.167,268.987,583.48,268.043,583.822,267.213C584.14,266.442,584.693,265.575,584.856,265.028C584.947,264.723,584.842,264.533,584.958,264.283C585.116,263.943,585.79,263.626,585.89,263.253C585.979,262.924,585.685,262.568,585.665,262.196C585.643,261.789,585.86,261.321,585.798,260.905C585.735,260.487,585.297,260.121,585.286,259.694C585.274,259.223,585.831,258.656,585.829,258.196C585.827,257.802,585.355,257.459,585.419,257.102C585.495,256.678,586.436,256.258,586.494,255.861C586.539,255.555,586.339,255.046,586.095,254.973C585.727,254.863,584.844,256.126,584.231,256.163C583.671,256.197,582.994,255.445,582.572,255.368C582.332,255.324,582.204,255.316,581.978,255.418C581.536,255.617,580.821,256.617,580.33,256.991C579.991,257.249,579.803,257.393,579.398,257.549C578.771,257.791,577.52,258.135,576.838,258.062C576.357,258.01,576.002,257.81,575.65,257.543C575.258,257.246,575.073,256.652,574.636,256.304C574.132,255.903,573.392,255.558,572.731,255.362C572.087,255.171,571.181,254.838,570.724,255.128C570.234,255.44,570.282,257.215,569.987,257.335C569.851,257.39,569.742,257.122,569.547,257.108C569.192,257.082,568.507,257.684,568.001,257.641C567.475,257.596,566.751,257.163,566.454,256.789C566.221,256.496,566.422,255.989,566.157,255.744C565.786,255.4,564.74,255.3,564.068,255.319C563.432,255.337,562.28,255.919,562.225,255.806C562.168,255.688,563.968,254.762,563.894,254.547C563.813,254.31,561.427,254.786,561.344,254.584C561.299,254.475,561.88,254.259,561.877,254.07C561.873,253.829,561.194,253.582,560.976,253.263C560.764,252.953,560.569,252.546,560.576,252.192C560.583,251.839,561.123,251.431,561.017,251.142C560.885,250.784,559.937,250.535,559.45,250.351C559.055,250.202,558.44,250.294,558.334,250.062C558.216,249.804,558.819,248.77,558.969,248.782C559.082,248.791,559.006,249.404,559.204,249.552C559.469,249.75,560.558,249.742,560.638,249.565C560.719,249.388,559.67,248.797,559.686,248.491C559.699,248.241,560.355,248.124,560.392,247.845C560.442,247.467,559.49,246.818,559.45,246.363C559.418,246.006,559.986,245.522,559.86,245.365C559.686,245.148,558.131,245.996,557.832,245.717C557.541,245.446,557.753,244.349,558.027,243.785C558.319,243.184,559.039,242.531,559.614,242.253C560.097,242.019,560.792,241.929,561.16,242.045C561.416,242.126,561.479,242.494,561.713,242.557C561.993,242.633,562.312,242.384,562.768,242.324C563.58,242.217,566.151,242.369,566.198,242.168C566.221,242.067,565.451,241.894,565.441,241.753C565.433,241.636,565.681,241.497,565.922,241.395C566.42,241.185,568.449,241.119,568.451,240.992C568.453,240.898,567.469,240.909,567.079,240.724C566.722,240.555,566.195,240.244,566.178,239.979C566.161,239.718,566.606,239.265,566.956,239.147C567.386,239.002,568.136,239.43,568.656,239.436C569.095,239.441,569.464,239.225,569.874,239.259C570.31,239.296,570.755,239.631,571.195,239.685C571.615,239.737,572.141,239.773,572.455,239.6C572.733,239.447,572.742,239.08,573.039,238.799C573.544,238.321,574.568,237.676,575.445,237.242C576.38,236.779,577.408,236.299,578.507,236.141C579.71,235.968,581.63,236.552,582.398,236.374C582.754,236.292,582.899,235.907,583.125,235.962C583.431,236.037,583.643,236.966,583.955,237.242C584.185,237.446,584.406,237.558,584.702,237.606C585.089,237.669,585.814,237.245,586.105,237.421C586.354,237.571,586.255,238.128,586.463,238.391C586.68,238.666,587.104,238.998,587.406,239.016C587.668,239.031,587.914,238.607,588.163,238.634C588.443,238.665,588.63,239.14,588.993,239.311C589.492,239.546,590.343,239.536,590.979,239.704C591.586,239.865,592.065,240.255,592.73,240.287C593.585,240.328,594.962,239.54,595.7,239.606C596.159,239.647,596.398,239.98,596.785,240.071C597.191,240.167,597.573,240.261,598.086,240.149C598.95,239.96,600.661,238.991,601.353,238.404C601.77,238.05,602.009,237.708,602.172,237.335C602.314,237.009,602.37,236.735,602.346,236.321C602.307,235.642,602.034,234.386,601.568,233.67C601.131,232.999,600.248,232.374,599.714,232.1C599.385,231.931,599.156,232.035,598.823,231.877C598.295,231.627,597.538,231.01,596.97,230.5C596.406,229.994,595.968,229.366,595.424,228.833C594.873,228.294,594.28,227.635,593.683,227.286C593.186,226.996,592.573,227.048,592.157,226.762C591.762,226.49,591.607,225.853,591.225,225.646C590.868,225.453,590.276,225.697,589.966,225.5C589.675,225.315,589.68,224.803,589.382,224.553C589.014,224.245,587.842,224.177,587.805,223.93C587.776,223.735,588.272,223.436,588.634,223.272C589.137,223.045,590.34,223.253,590.641,222.913C590.864,222.661,590.597,222.176,590.703,221.793C590.83,221.335,591.063,220.673,591.45,220.376C591.841,220.076,592.954,220.315,593.048,220.013C593.177,219.6,590.83,218.124,590.979,217.759C591.102,217.457,592.887,217.897,593.068,217.644C593.169,217.503,592.804,217.228,592.894,217.024C593.079,216.606,595.16,216.235,595.321,215.809C595.405,215.587,595.206,215.186,595.045,215.126C594.872,215.061,594.614,215.4,594.287,215.511C593.764,215.689,592.833,215.841,592.147,215.91C591.523,215.973,590.752,215.749,590.344,215.939C590.06,216.071,590.077,216.39,589.771,216.598C589.185,216.996,587.554,217.481,586.75,217.665C586.238,217.782,585.88,217.618,585.46,217.809C584.925,218.052,584.141,219.313,583.903,219.235C583.768,219.191,583.895,218.61,583.77,218.57C583.585,218.511,582.816,219.152,582.685,219.599C582.531,220.124,582.909,221.015,583.176,221.602C583.421,222.139,583.851,222.776,584.17,223.012C584.351,223.146,584.465,223.182,584.702,223.187C585.167,223.197,586.249,222.59,586.781,222.597C587.114,222.601,587.495,222.654,587.59,222.85C587.713,223.104,587.402,223.912,587.078,224.175C586.743,224.447,586.001,224.491,585.583,224.42C585.249,224.363,585.035,223.92,584.733,223.958C584.313,224.011,583.825,225.051,583.361,225.229C583.013,225.363,582.701,225.089,582.306,225.215C581.658,225.422,580.685,226.838,580.012,226.893C579.528,226.932,578.844,226.574,578.701,226.229C578.557,225.882,579.141,225.213,579.162,224.811C579.177,224.52,579.172,224.285,578.998,224.049C578.713,223.663,577.739,223.235,577.186,223.033C576.768,222.88,576.063,222.993,576.019,222.808C575.958,222.552,577.242,221.789,577.831,221.404C578.337,221.073,579.298,220.891,579.316,220.596C579.333,220.307,578.512,219.771,577.995,219.657C577.408,219.528,576.602,220.134,575.937,220.041C575.252,219.945,573.967,219.327,573.95,219.05C573.94,218.885,574.619,218.752,574.605,218.613C574.586,218.429,573.299,218.157,573.315,218.097C573.336,218.02,575.11,218.586,575.609,218.427C575.911,218.331,576.265,217.942,576.223,217.845C576.171,217.725,575.398,217.947,574.943,217.924C574.415,217.897,573.837,217.627,573.243,217.644C572.581,217.663,571.639,217.713,571.155,218.111C570.686,218.496,570.659,219.451,570.346,219.949C570.097,220.346,569.884,220.651,569.516,220.922C569.066,221.254,567.952,221.277,567.755,221.68C567.585,222.027,568.108,222.552,568.113,223.054C568.119,223.661,568.014,224.687,567.632,225.068C567.307,225.391,566.436,225.576,566.178,225.409C565.971,225.276,566.099,224.476,565.993,224.469C565.808,224.456,565.144,226.501,565.031,227.252C564.957,227.739,565.119,228.016,565.072,228.49C565.006,229.151,564.899,230.541,564.519,230.833C564.281,231.016,563.829,230.681,563.577,230.806C563.316,230.936,563.115,231.282,562.993,231.626C562.834,232.072,563.101,232.852,562.881,233.32C562.669,233.772,561.753,233.998,561.734,234.407C561.711,234.884,562.966,235.565,563.147,236.028C563.252,236.298,563.079,236.488,563.167,236.759C563.305,237.184,563.715,237.851,564.181,238.239C564.699,238.67,566.12,238.766,566.209,239.14C566.276,239.42,565.783,239.981,565.42,240.104C564.986,240.251,564.281,239.704,563.689,239.698C563.068,239.691,562.217,239.798,561.775,240.104C561.418,240.351,561.407,240.891,561.088,241.181C560.737,241.501,560.16,241.562,559.706,241.889C559.158,242.283,558.25,243.553,558.088,243.469C557.985,243.416,558.061,242.862,558.232,242.577C558.482,242.161,559.834,241.594,559.768,241.408C559.702,241.221,558.27,241.677,557.812,241.467C557.465,241.308,557.454,240.82,557.105,240.594C556.615,240.276,555.513,239.952,554.965,240.025C554.591,240.075,554.377,240.518,554.074,240.542C553.783,240.566,553.485,240.16,553.183,240.202C552.816,240.253,552.433,240.939,552.057,241.044C551.753,241.128,551.271,240.809,551.145,240.953C550.997,241.123,551.515,241.882,551.442,242.188C551.39,242.406,551.011,242.511,551.022,242.68C551.035,242.886,551.642,243.091,551.729,243.32C551.796,243.496,551.751,243.85,551.668,243.875C551.543,243.913,551.192,243.059,550.869,242.913C550.58,242.782,550.201,243.024,549.865,242.939C549.474,242.84,548.834,242.544,548.688,242.259C548.582,242.052,548.863,241.622,548.759,241.545C548.642,241.458,548.092,241.653,547.92,241.896C547.683,242.23,547.642,243.005,547.817,243.611C548.063,244.464,549.972,245.988,549.794,246.375C549.685,246.612,548.641,246.289,548.524,246.484C548.425,246.649,548.963,247.1,548.882,247.318C548.79,247.566,547.825,247.644,547.828,247.832C547.832,248.081,549.167,248.317,549.701,248.668C550.181,248.984,550.532,249.559,550.92,249.792C551.199,249.96,551.544,249.845,551.729,250.075C552.015,250.43,552.115,251.85,551.975,252.111C551.925,252.205,551.838,252.248,551.739,252.23C551.494,252.185,551.077,251.149,550.633,251.029C550.19,250.909,549.2,251.219,549.077,251.505C548.978,251.734,549.324,252.174,549.538,252.436C549.753,252.699,550.39,252.905,550.367,253.077C550.344,253.246,549.761,253.487,549.435,253.462C549.044,253.433,548.321,252.609,548.196,252.716C548.048,252.843,548.847,253.97,548.964,254.596C549.072,255.174,549.074,256.289,548.933,256.329C548.821,256.36,548.572,255.526,548.35,255.411C548.202,255.335,548.023,255.351,547.869,255.436C547.631,255.567,547.299,256.408,547.203,256.378C547.13,256.355,547.28,255.952,547.203,255.713C547.09,255.362,546.599,254.529,546.363,254.547C546.15,254.563,546.046,255.568,545.831,255.584C545.586,255.602,545,254.74,544.95,254.361C544.912,254.074,545.262,253.82,545.257,253.549C545.252,253.272,545.104,252.993,544.909,252.716C544.645,252.34,543.738,252.002,543.68,251.593C543.626,251.211,544.134,250.508,544.438,250.358C544.654,250.251,544.965,250.513,545.165,250.433C545.364,250.353,545.377,249.941,545.636,249.88C546.196,249.749,548.124,251.366,548.749,251.217C549.092,251.135,549.459,250.675,549.405,250.433C549.324,250.071,548.089,249.581,547.336,249.477C546.511,249.363,545.318,249.928,544.633,249.905C544.209,249.891,543.901,249.904,543.609,249.672C543.188,249.337,542.502,247.902,542.656,247.699C542.752,247.572,543.341,247.951,543.496,247.851C543.62,247.771,543.707,247.416,543.629,247.324C543.525,247.201,542.993,247.507,542.667,247.401C542.223,247.257,541.68,246.676,541.305,246.235C540.945,245.811,540.662,245.288,540.444,244.82C540.25,244.405,540.277,243.896,540.025,243.585C539.782,243.285,539.223,243.292,538.98,242.965C538.689,242.573,538.539,241.762,538.56,241.272C538.577,240.887,538.848,240.65,538.908,240.254C538.987,239.733,538.786,238.965,538.857,238.397C538.919,237.898,539.386,237.352,539.246,237.017C539.114,236.701,538.448,236.683,538.13,236.4C537.794,236.102,537.718,235.66,537.301,235.249C536.595,234.554,534.962,233.717,533.973,232.93C533.102,232.237,532.362,231.274,531.638,230.819C531.126,230.498,530.649,230.3,530.184,230.227C529.784,230.165,529.219,230.457,529.027,230.316C528.895,230.219,529.02,229.967,528.904,229.784C528.705,229.469,528.027,229.17,527.644,228.785C527.245,228.384,526.473,227.624,526.569,227.411C526.641,227.25,527.499,227.507,527.562,227.348C527.659,227.102,526.192,226.225,525.924,225.618C525.71,225.135,526.051,224.524,525.811,224.112C525.545,223.655,524.677,222.964,524.265,223.075C523.812,223.197,523.649,225.047,523.282,225.096C522.986,225.136,522.532,224.426,522.319,224C522.1,223.562,521.87,222.853,522.002,222.491C522.106,222.205,522.733,222.11,522.76,221.899C522.784,221.716,522.474,221.397,522.319,221.319C522.216,221.268,522.091,221.409,522,221.317C521.458,220.771,522,210,522,210C522,210,522,210,522,210C522,210,546.137,196.293,560,195ZM582.884,275.503C582.875,276.027,567.222,276.483,559.388,276.679C551.559,276.875,544.106,277.993,535.893,276.679C526.339,275.15,515.521,269.481,505.685,266.756C496.532,264.221,479.81,263.898,478.834,260.665C478.254,258.743,482.127,255.185,485.547,253.625C491.231,251.032,504.173,249.791,512.398,252.366C521.028,255.067,527.577,266.904,535.893,270.36C543.336,273.454,559.388,273.533,559.388,273.533C559.388,273.533,559.388,273.533,559.388,273.533C559.388,273.533,582.893,274.979,582.884,275.503Z";

export const MAP_REGIONS = [
  {
    id: "神聖ローマ帝国", fill: "#8FBC9C", strokeColor: "#C3E0CC", labelX: 522, labelY: 196, labelLines: ["神聖", "ローマ", "帝国"], labelSize: 11,
    shape: "path", dByYear: (year) => (year < 1648 ? HRE_POINTS_1618 : HRE_POINTS_1648),
  },
  {
    id: "オランダ", fill: "#7ECBD6", strokeColor: "#B8E5EA", labelX: 498, labelY: 187, labelLines: ["オランダ"], labelSize: 9,
    shape: "path", dByYear: () => NL_POINTS,
  },
  {
    id: "スペイン・オーストリア", fill: "#E0AD6B", strokeColor: "#F0D2A8", labelX: 469, labelY: 232, labelLines: ["スペイン", "王国"], labelSize: 11,
    shape: "path", dByYear: () => SPAIN_AUSTRIA_PATH,
  },
  {
    id: "フランス王国", fill: "#9AA8D9", strokeColor: "#C7D0EC", labelX: 490, labelY: 220, labelLines: ["フランス", "王国"], labelSize: 10,
    shape: "path", dByYear: (year) => (year < 1648 ? FR_POINTS_1618 : FR_POINTS_1648),
  },
  {
    id: "オスマン帝国", fill: "#D98E82", strokeColor: "#EDC0B9", labelX: 576, labelY: 254, labelLines: ["オスマン", "帝国"], labelSize: 17,
    shape: "path", dByYear: () => OTTOMAN_PATH,
  },
];

// 首都マーカー：参考にした歴史地図アトラス風の「○地名」表記。タップ不可の装飾的な注記レイヤーで、
// 新規の勢力データではない。わずかな拡大でフェードイン表示させ、引きの視点では地図をうるさくしない
export const CAPITAL_CITIES = [
  { name: "アムステルダム", x: 499, y: 198 },
  { name: "パリ", x: 490.2, y: 208.4 },
  { name: "マドリード", x: 473, y: 242.3 },
  { name: "ウィーン", x: 530.1, y: 211.1 },
  { name: "イスタンブール", x: 566, y: 240 },
  { name: "フランクフルト", x: 508.2, y: 202.9 },
  { name: "プラハ", x: 524.6, y: 203 },
  { name: "ロンドン", x: 483.2, y: 192, dir: "tl" },
];

// 主要河川：水運・自然国境ラインとしての注記レイヤー（装飾。タップ不可）。都市マーカーと同じLODでフェードイン
export const RIVERS = [
  { name: "ライン川", points: "507.7,213.7 505.7,207.7 505.2,203.4 502.9,198.9 500.9,195.2 496.4,194.3", labelX: 505, labelY: 205 },
  { name: "ドナウ川", points: "506.9,212 516.3,210.3 524.8,210.8 530.2,211.2 537.6,214.2 543.3,226.4 551.8,224.4 563.8,223.6", labelX: 532, labelY: 208 },
  { name: "セーヌ川", points: "497.2,212 493.5,210.3 490.2,208.4 486.4,206 483.8,205.6", labelX: 492, labelY: 214 },
  { name: "エルベ川", points: "525.1,200.7 518.8,197.5 514,192.5 509.4,187.3", labelX: 520, labelY: 197 },
  { name: "テムズ川", points: "478.4,195.7 481.8,196.6 485.5,196.6", labelX: 473, labelY: 200 },
  { name: "ナイル川", points: "577.1,292.4 572.3,278.6 572.6,274.6", labelX: 575, labelY: 285 },
];

// 海洋・海峡・主要島嶼：陸地/勢力と混同しないよう、控えめなスレートブルーの透過テキストのみで配置（装飾。タップ不可）
export const SEA_LABELS = [
  { name: "地中海", x: 534.8, y: 261.7, size: 9 },
  { name: "大西洋", x: 440.9, y: 243.7, size: 9 },
  { name: "北海", x: 494.9, y: 174.9, size: 7 },
  { name: "バルト海", x: 534.8, y: 164.5, size: 7 },
  { name: "黒海", x: 580.3, y: 230.4, size: 8 },
  { name: "ドーバー海峡", x: 493, y: 207, size: 5.5 },
  { name: "ボスポラス海峡", x: 566, y: 238.9, size: 5.5 },
  { name: "コルシカ島", x: 509.4, y: 235.4, size: 5.5 },
  { name: "サルデーニャ島", x: 509.2, y: 243.4, size: 5.5 },
  { name: "シチリア島", x: 523.4, y: 252.5, size: 5.5 },
  { name: "クレタ島", x: 554.1, y: 260.6, size: 5.5 },
  { name: "エルバ島", x: 512.9, y: 232.7, size: 5 },
];

export const REGION_BLURB = {
  "神聖ローマ帝国": "多数の領邦（諸侯国・自由都市）からなる複合国家。皇帝の実権は時代とともに低下していく。",
  "オランダ": "スペインからの独立を目指し反乱を続けた北部ネーデルラント。1648年に国際的に独立が承認される。",
  "スペイン・オーストリア": "ハプスブルク家の二大系統（スペイン系・オーストリア系）が広大な領土を治める。",
  "フランス王国": "ブルボン朝のもとで中央集権化を進め、ドイツの宗教戦争への介入を通じて大陸の主導権を握っていく。",
  "オスマン帝国": "東地中海から中東・北アフリカに及ぶ広大な版図を持つイスラム王朝。",
};

// =====================================================================
// 時代ごとの地図データ（古代〜帝国主義）
// 勢力・背景の輪郭は geo/regions.mjs の定義（現代の国・州・県の組み合わせ）から geo/build.mjs が生成した
// generated/geoPaths.js を、snapshotMapPeriod が「時代略号+年/勢力ID」のキーで割り当てる。
// このファイルでは勢力の色・ラベル位置、都市、河川、海の名前、解説文を定義する。座標は mapProjection.js の
// lonLatToXY で経度・緯度から変換する。region の id は各時代のカードの region と一致させ、勢力・都市のタップで
// 該当カードが引けるようにしている。
// =====================================================================
const lineToPoints = (pts) => pts.map(([lon, lat]) => lonLatToXY(lon, lat).join(",")).join(" ");

const ANCIENT_COLORS = {
  "メソポタミア": ["#8FBC9C", "#C3E0CC"],
  "エジプト": ["#E0AD6B", "#F0D2A8"],
  "ギリシア": ["#7ECBD6", "#B8E5EA"],
  "アケメネス朝ペルシア": ["#E0C56B", "#F0E2A8"],
  "マケドニア": ["#9AA8D9", "#C7D0EC"],
  "ローマ": ["#D9866B", "#F0B8A8"],
  "カルタゴ": ["#B79FD1", "#DCCCEC"],
  "西ローマ帝国": ["#D9866B", "#F0B8A8"],
  "東ローマ帝国": ["#C98E82", "#EAC0B9"],
};

// label: { at: [経度, 緯度], lines: 表示する行, size: 文字サイズ }。表示名は時代ごとに変えてよい（id は固定）。
// colors は勢力ID → [塗り色, 輪郭色] の対応表（時代ごとに用意する）
// 輪郭（dByYear・bbox）は snapshotMapPeriod が geo/regions.mjs から生成したデータ（GEO_PATHS）を割り当てる
function mapRegion(colors, id, label) {
  const [fill, strokeColor] = colors[id];
  const [labelX, labelY] = lonLatToXY(...label.at);
  return { id, fill, strokeColor, labelX, labelY, labelLines: label.lines, labelSize: label.size, shape: "path" };
}
const ancientRegion = (id, label) => mapRegion(ANCIENT_COLORS, id, label);
// region を持つ都市はタップでその勢力の詳細（該当カード）を開く。dir はラベルの逃がし方向
function mapCity(name, lon, lat, region, dir) {
  const [x, y] = lonLatToXY(lon, lat);
  return { name, x, y, region, ...(dir ? { dir } : {}) };
}
function mapBackground(name, labelAt, fill) {
  const [labelX, labelY] = lonLatToXY(...labelAt);
  return { name, fill, labelX, labelY };
}


// --- 前3000〜前500年：古代文明の成立と地域世界 ---
const ANCIENT_CIVILIZATIONS_SNAPSHOTS = {
  [-2500]: {
    regions: [
      ancientRegion("エジプト", { at: [30.0, 27.0], lines: ["エジプト", "（古王国）"], size: 6 }),
      ancientRegion("メソポタミア", { at: [45.4, 32.3], lines: ["シュメール"], size: 5.5 }),
    ],
    cities: [
      mapCity("メンフィス", 31.25, 29.85, "エジプト", "l"),
      mapCity("ウル", 46.10, 30.96, "メソポタミア"),
    ],
  },
  [-1750]: {
    regions: [
      ancientRegion("エジプト", { at: [30.0, 26.5], lines: ["エジプト", "（中王国）"], size: 6 }),
      ancientRegion("メソポタミア", { at: [43.6, 34.0], lines: ["バビロン", "第1王朝"], size: 6 }),
    ],
    cities: [
      mapCity("バビロン", 44.42, 32.54, "メソポタミア", "l"),
      mapCity("テーベ", 32.65, 25.70, "エジプト", "r"),
    ],
  },
  [-600]: {
    regions: [
      ancientRegion("エジプト", { at: [30.0, 27.0], lines: ["エジプト"], size: 6 }),
      ancientRegion("メソポタミア", { at: [41.0, 33.4], lines: ["新バビロニア"], size: 7 }),
    ],
    background: [
      mapBackground("メディア", [48.0, 36.0], "#7A8CA8"),
      mapBackground("リディア", [30.5, 39.0], "#8C9A7A"),
    ],
    cities: [
      mapCity("バビロン", 44.42, 32.54, "メソポタミア", "l"),
      mapCity("サイス", 30.77, 30.96, "エジプト", "l"),
    ],
  },
};

// --- 前500〜500年：古代帝国の時代 ---
const ANCIENT_EMPIRES_SNAPSHOTS = {
  // ペルシア戦争（サラミスの海戦）のころ
  [-480]: {
    regions: [
      ancientRegion("アケメネス朝ペルシア", { at: [55.0, 33.0], lines: ["アケメネス朝", "ペルシア"], size: 10 }),
      ancientRegion("ギリシア", { at: [21.7, 39.1], lines: ["ギリシア", "諸ポリス"], size: 5 }),
      ancientRegion("カルタゴ", { at: [9.6, 34.2], lines: ["カルタゴ"], size: 6 }),
      ancientRegion("ローマ",
        { at: [12.7, 42.0], lines: ["ローマ"], size: 4 }),
    ],
    cities: [
      mapCity("ペルセポリス", 52.89, 29.93, "アケメネス朝ペルシア"),
      mapCity("スサ", 48.25, 32.19, "アケメネス朝ペルシア", "r"),
      mapCity("バビロン", 44.42, 32.54, "アケメネス朝ペルシア", "l"),
      mapCity("サルデス", 28.04, 38.48, "アケメネス朝ペルシア", "r"),
      mapCity("メンフィス", 31.25, 29.85, "アケメネス朝ペルシア", "l"),
      mapCity("アテネ", 23.73, 37.98, "ギリシア", "r"),
      mapCity("スパルタ", 22.43, 37.07, "ギリシア", "bl"),
      mapCity("ローマ", 12.48, 41.89, "ローマ"),
      mapCity("カルタゴ", 10.32, 36.85, "カルタゴ"),
    ],
  },
  // アレクサンドロス大王の死（前323年）の時点
  [-323]: {
    regions: [
      ancientRegion("マケドニア", { at: [55.0, 33.0], lines: ["マケドニア", "（大王の帝国）"], size: 10 }),
      ancientRegion("ギリシア", { at: [22.3, 37.6], lines: ["ギリシア"], size: 4.5 }),
      ancientRegion("カルタゴ", { at: [9.6, 34.2], lines: ["カルタゴ"], size: 6 }),
      ancientRegion("ローマ", { at: [13.3, 41.9], lines: ["ローマ"], size: 4.5 }),
    ],
    cities: [
      mapCity("ペラ", 22.52, 40.76, "マケドニア", "tl"),
      mapCity("バビロン", 44.42, 32.54, "マケドニア", "l"),
      mapCity("アレクサンドリア", 29.92, 31.20, "マケドニア", "tl"),
      mapCity("ペルセポリス", 52.89, 29.93, "マケドニア"),
      mapCity("アテネ", 23.73, 37.98, "ギリシア", "r"),
      mapCity("スパルタ", 22.43, 37.07, "ギリシア", "bl"),
      mapCity("ローマ", 12.48, 41.89, "ローマ"),
      mapCity("カルタゴ", 10.32, 36.85, "カルタゴ"),
    ],
  },
  // 第2回ポエニ戦争の開始（前218年）
  [-218]: {
    regions: [
      ancientRegion("ローマ", { at: [14.2, 41.9], lines: ["ローマ", "（共和政）"], size: 6.5 }),
      ancientRegion("カルタゴ", { at: [9.6, 34.2], lines: ["カルタゴ"], size: 6.5 }),
    ],
    cities: [
      mapCity("ローマ", 12.48, 41.89, "ローマ"),
      mapCity("カルタゴ", 10.32, 36.85, "カルタゴ"),
      mapCity("カルタゴ・ノウァ", -0.98, 37.60, "カルタゴ", "l"),
    ],
  },
  // カエサル暗殺（前44年）のころ。エジプトはプトレマイオス朝（キプロス島を含む）
  [-44]: {
    regions: [
      ancientRegion("ローマ", { at: [2.5, 46.5], lines: ["ローマ", "（共和政末期）"], size: 9 }),
      ancientRegion("エジプト",
        { at: [30.0, 27.0], lines: ["プトレマイオス朝", "エジプト"], size: 5.5 }),
    ],
    cities: [
      mapCity("ローマ", 12.48, 41.89, "ローマ"),
      mapCity("アテネ", 23.73, 37.98, "ローマ", "r"),
      mapCity("アンティオキア", 36.16, 36.20, "ローマ", "r"),
      mapCity("アレクサンドリア", 29.92, 31.20, "エジプト", "tl"),
    ],
  },
  // トラヤヌス帝のもとで最大版図（117年）
  [117]: {
    regions: [
      ancientRegion("ローマ", { at: [2.5, 46.5], lines: ["ローマ帝国"], size: 11 }),
    ],
    cities: [
      mapCity("ローマ", 12.48, 41.89, "ローマ"),
      mapCity("ロンディニウム", -0.12, 51.51, "ローマ", "r"),
      mapCity("カルタゴ", 10.32, 36.85, "ローマ"),
      mapCity("アテネ", 23.73, 37.98, "ローマ", "r"),
      mapCity("アンティオキア", 36.16, 36.20, "ローマ", "r"),
      mapCity("アレクサンドリア", 29.92, 31.20, "ローマ", "tl"),
    ],
  },
  // テオドシウス帝の死による東西分割（395年）
  [395]: {
    regions: [
      ancientRegion("西ローマ帝国", { at: [2.5, 46.5], lines: ["西ローマ帝国"], size: 9 }),
      ancientRegion("東ローマ帝国", { at: [33.0, 39.0], lines: ["東ローマ帝国"], size: 9 }),
    ],
    cities: [
      mapCity("ローマ", 12.48, 41.89, "西ローマ帝国"),
      mapCity("ミラノ", 9.19, 45.46, "西ローマ帝国", "t"),
      mapCity("カルタゴ", 10.32, 36.85, "西ローマ帝国"),
      mapCity("コンスタンティノープル", 28.98, 41.01, "東ローマ帝国", "t"),
      mapCity("アンティオキア", 36.16, 36.20, "東ローマ帝国", "r"),
      mapCity("アレクサンドリア", 29.92, 31.20, "東ローマ帝国", "tl"),
    ],
  },
};

const NILE_RIVER = { name: "ナイル川", points: lineToPoints([
  [31.3, 21.8], [32.3, 22.6], [32.9, 24.1], [32.87, 24.98], [32.64, 25.69], [32.72, 26.16], [31.7, 26.55], [31.18, 27.18],
  [30.75, 28.1], [31.1, 29.07], [31.23, 30.04], [31.0, 30.8], [30.6, 31.45],
]), labelX: lonLatToXY(31.9, 27.6)[0], labelY: lonLatToXY(31.9, 27.6)[1] };
const TIGRIS_RIVER = { name: "ティグリス川", points: lineToPoints([
  [40.2, 37.9], [42.2, 37.3], [43.1, 36.35], [43.88, 34.2], [44.4, 33.3], [45.8, 32.5], [47.43, 31.0], [48.5, 29.95],
]), labelX: lonLatToXY(45.0, 34.6)[0], labelY: lonLatToXY(45.0, 34.6)[1] };
const EUPHRATES_RIVER = { name: "ユーフラテス川", points: lineToPoints([
  [38.5, 38.7], [37.95, 37.03], [39.0, 35.95], [40.14, 35.33], [40.92, 34.45], [42.37, 34.14], [43.3, 33.4], [44.42, 32.48],
  [46.26, 31.04], [47.43, 31.0],
]), labelX: lonLatToXY(39.0, 35.2)[0], labelY: lonLatToXY(39.0, 35.2)[1] };
const INDUS_RIVER = { name: "インダス川", points: lineToPoints([
  [72.24, 33.9], [71.5, 32.0], [70.9, 30.0], [68.86, 27.7], [68.37, 25.4], [67.6, 24.2],
]), labelX: lonLatToXY(70.4, 28.6)[0], labelY: lonLatToXY(70.4, 28.6)[1] };

const ANCIENT_SEA_LABELS = [
  ["地中海", 18.5, 34.3, 9], ["エーゲ海", 25.2, 38.6, 5], ["黒海", 34.5, 43.3, 8], ["紅海", 37.5, 21.0, 6],
  ["ペルシア湾", 51.3, 27.2, 5.5], ["カスピ海", 51.0, 41.8, 6.5], ["アラビア海", 62.0, 20.0, 7], ["大西洋", -15.0, 40.0, 9],
].map(([name, lon, lat, size]) => {
  const [x, y] = lonLatToXY(lon, lat);
  return { name, x, y, size };
});

export const ANCIENT_BLURB = {
  "メソポタミア": "ティグリス川・ユーフラテス川の流域。前3000年ごろからシュメール人の都市国家が栄え、楔形文字や60進法が生まれた。のちにバビロンを都とする王国がこの地を統一した。",
  "エジプト": "大河の定期的な氾濫がもたらす肥沃な土地に栄えた王国。王を神の化身とする神権政治のもと、約3000年にわたって30余りの王朝が続いた。",
  "ギリシア": "山がちな地形に、アテネやスパルタなど数百の都市国家（ポリス）が分立した。オリンピアの祭典やデルフォイの神託を通じて、同じギリシア人としての意識を共有した。",
  "アケメネス朝ペルシア": "前550年ごろに成立し、ダレイオス1世のもとでエジプトからインダス川に至る大帝国となった。各州に知事（サトラップ）を置き、「王の道」と駅伝制で広大な領土を結んだ。",
  "マケドニア": "ギリシア北方の王国。フィリッポス2世がギリシアを制圧し、その子の大王の東方遠征によって、エジプトからインダス川流域に至る大帝国が築かれた。",
  "ローマ": "イタリア半島中部の都市国家から出発し、半島の統一と地中海の制覇を経て、ブリテン島から西アジアに及ぶ大帝国へと成長した。",
  "カルタゴ": "フェニキア人が北アフリカ（現在のチュニジア）に建てた植民市。地中海交易で繁栄し、シチリア島西部やイベリア半島南部に勢力を広げた。",
  "西ローマ帝国": "395年、テオドシウス帝の死後に帝国が東西に分割されて成立した。ゲルマン人の大移動のなかで弱体化し、476年に滅亡した。",
  "東ローマ帝国": "395年の分割で成立し、コンスタンティノープルを都とした。ビザンツ帝国とも呼ばれ、1453年まで約1000年にわたって続いた。",
};

// 年代に最も近いスナップショットを選ぶ（市民革命期の revolutionsRegionsByYear と同じ考え方）
function nearestSnapshot(snapshots, year) {
  const keys = Object.keys(snapshots).map(Number);
  const best = keys.reduce((b, k) => (Math.abs(k - year) < Math.abs(b - year) ? k : b), keys[0]);
  return snapshots[best];
}
// 生成済みの輪郭（geo/regions.mjs → node geo/build.mjs → generated/geoPaths.js）を取り出す。
// キーは「時代略号+年/勢力ID」（背景は「…/bg:名前」）。定義漏れは地図の表示前にエラーにする
function geoPath(key) {
  const d = GEO_PATHS[key];
  if (!d) throw new Error(`地図の輪郭データがありません: ${key}（geo/regions.mjs に定義して node geo/build.mjs を実行）`);
  return d;
}
// 東アジア・南アジアの勢力・都市（asiaCards.js の ASIA_MAP_LAYERS）を、同じ「時代略号+年」のスナップショットに合流させる。
// 都市には asiaLayer を付け、初期表示の範囲（App.jsx の computeMapFocusBounds）の計算からは外す
function asiaLayer(key) {
  const layer = ASIA_MAP_LAYERS[key];
  if (!layer) return { regions: [], cities: [] };
  return {
    regions: layer.regions.map((r) => {
      const [labelX, labelY] = lonLatToXY(...r.label.at);
      return { id: r.id, fill: r.colors[0], strokeColor: r.colors[1], labelX, labelY, labelLines: r.label.lines, labelSize: r.label.size, shape: "path" };
    }),
    cities: layer.cities.map((c) => ({ ...mapCity(c.name, c.lon, c.lat, c.region, c.dir), asiaLayer: true })),
  };
}
const ASIA_SEA_LABELS = [["日本海", 134.0, 40.0, 5], ["黄海", 123.5, 36.0, 4.5], ["東シナ海", 125.0, 29.0, 5], ["南シナ海", 114.0, 14.0, 6], ["ベンガル湾", 88.0, 15.0, 6], ["アラビア海", 64.0, 17.0, 6]]
  .map(([name, lon, lat, size]) => { const [x, y] = lonLatToXY(lon, lat); return { name, x, y, size }; });
const withAsiaSeas = (labels) => labels.concat(ASIA_SEA_LABELS.filter((a) => !labels.some((l) => l.name === a.name)));
// 地図をタップしたときの解説文：その時代のスナップショットに現れる東アジア・南アジアの勢力の分だけ加える
const asiaBlurbFor = (keys) => Object.fromEntries([...new Set(keys.flatMap((k) => (ASIA_MAP_LAYERS[k]?.regions ?? []).map((r) => r.id)))].map((id) => [id, ASIA_BLURB[id]]));
// 市民革命と国民国家（App.jsx の自動生成ブロック）向け：1812・1815・1871年のうち最も近い年の東アジア・南アジアの勢力と都市
export function asiaRevolutionLayer(year) {
  const snap = [1812, 1815, 1871].reduce((best, y) => (Math.abs(y - year) < Math.abs(best - year) ? y : best), 1812);
  const key = `rev${snap}`, layer = asiaLayer(key);
  return { regions: layer.regions.map((r) => { const d = geoPath(`${key}/${r.id}`); return { ...r, dByYear: () => d, bbox: GEO_BBOX[`${key}/${r.id}`] }; }), cities: layer.cities };
}
export const ASIA_REVOLUTION_BLURB = asiaBlurbFor(["rev1812", "rev1815", "rev1871"]);
export { withAsiaSeas };
function attachGeometry(snapshots, geoPrefix) {
  return Object.fromEntries(Object.entries(snapshots).map(([year, rawSnap]) => {
    const layer = asiaLayer(`${geoPrefix}${year}`);
    return [year, { ...rawSnap, regions: [...rawSnap.regions, ...layer.regions], cities: [...rawSnap.cities, ...layer.cities] }];
  }).map(([year, snap]) => [year, {
    ...snap,
    regions: snap.regions.map((r) => {
      const key = `${geoPrefix}${year}/${r.id}`;
      const d = geoPath(key);
      return { ...r, dByYear: () => d, bbox: GEO_BBOX[key] };
    }),
    background: (snap.background ?? []).map((b) => ({ ...b, d: geoPath(`${geoPrefix}${year}/bg:${b.name}`) })),
  }]));
}
// ERA_PERIODS の各時代区分にそのまま展開して使う（keyYears／regionsByYear／capitalsByYear など）
function snapshotMapPeriod(rawSnapshots, { geoPrefix, rivers, seaLabels: rawSeaLabels, blurb: rawBlurb }) {
  const snapshots = attachGeometry(rawSnapshots, geoPrefix);
  const blurb = { ...rawBlurb, ...asiaBlurbFor(Object.keys(rawSnapshots).map((y) => `${geoPrefix}${y}`)) };
  const seaLabels = withAsiaSeas(rawSeaLabels);
  return {
    keyYears: Object.keys(snapshots).map(Number).sort((a, b) => a - b),
    regionsByYear: (year) => nearestSnapshot(snapshots, year).regions,
    capitalsByYear: (year) => nearestSnapshot(snapshots, year).cities,
    backgroundByYear: (year) => nearestSnapshot(snapshots, year).background ?? [],
    rivers,
    seaLabels,
    blurb,
  };
}
export const ANCIENT_CIVILIZATIONS_MAP = snapshotMapPeriod(ANCIENT_CIVILIZATIONS_SNAPSHOTS, { geoPrefix: "anc",
  rivers: [NILE_RIVER, TIGRIS_RIVER, EUPHRATES_RIVER], seaLabels: ANCIENT_SEA_LABELS, blurb: ANCIENT_BLURB,
});
export const ANCIENT_EMPIRES_MAP = snapshotMapPeriod(ANCIENT_EMPIRES_SNAPSHOTS, { geoPrefix: "anc",
  rivers: [NILE_RIVER, TIGRIS_RIVER, EUPHRATES_RIVER, INDUS_RIVER, ...RIVERS.filter((r) => r.name === "ライン川" || r.name === "ドナウ川")],
  seaLabels: ANCIENT_SEA_LABELS, blurb: ANCIENT_BLURB,
});

// =====================================================================
// 近世（大航海時代・ルネサンス・宗教改革）の地図データ
// 古代と同じく経度・緯度で定義し、lonLatToXY で投影する（輪郭は陸地で切り抜かれるので、海岸線は海上に大きめに取る）。
// 1492年は地図の時代区分「中世②」、1517年・1555年は「大航海時代・近世」に属する。後者は1600年以降を
// 三十年戦争期の勢力図（MAP_REGIONS など）が受け持つため、App.jsx の ERA_PERIODS で年ごとに切り替えている。
// region の id は RENAISSANCE_CARDS の region と一致させている。輪郭は学習用の模式図。
// =====================================================================
const RENAISSANCE_COLORS = {
  "フィレンツェ": ["#E07A8B", "#F2B8C2"],
  "ミラノ公国": ["#8FBCC9", "#C3E0E6"],
  "ローマ教皇領": ["#E8D27A", "#F5E9B8"],
  "ヴェネツィア共和国": ["#7ECBA8", "#B8E5D2"],
  "ナポリ王国": ["#C9A0DC", "#E4CFEE"],
  "神聖ローマ帝国": ["#A8C686", "#D2E3BF"],
  "ジュネーヴ": ["#F2A65A", "#F8D3AA"],
  "フランス王国": ["#9AA8D9", "#C7D0EC"],
  "ポルトガル王国": ["#5FB3A1", "#A9DBD0"],
  "スペイン王国": ["#D9866B", "#F0B8A8"],
  "アステカ帝国": ["#C9B458", "#E6DBA6"],
  "インカ帝国": ["#B98E6E", "#DCC4B2"],
};
const renRegion = (id, label) => mapRegion(RENAISSANCE_COLORS, id, label);



const OTTOMAN_FILL = "#7A8CA8";

const LABELS = {
  florence: { at: [11.2, 43.65], lines: ["フィレンツェ"], size: 3.2 },
  milan: { at: [9.0, 45.75], lines: ["ミラノ公国"], size: 3.2 },
  papal: { at: [12.8, 42.9], lines: ["教皇領"], size: 3.4 },
  venice: { at: [11.6, 45.65], lines: ["ヴェネツィア"], size: 3.2 },
  naples: { at: [15.9, 40.6], lines: ["ナポリ王国"], size: 3.6 },
  hre: { at: [10.5, 50.6], lines: ["神聖ローマ帝国"], size: 7 },
  geneva: { at: [6.15, 45.95], lines: ["ジュネーヴ"], size: 2.6 },
  france: { at: [2.3, 46.8], lines: ["フランス王国"], size: 7 },
  portugal: { at: [-8.2, 39.8], lines: ["ポルトガル", "王国"], size: 3.6 },
  spain: { at: [-3.0, 40.3], lines: ["スペイン王国"], size: 5 },
  aztec: { at: [-97.6, 17.6], lines: ["アステカ帝国"], size: 5 },
  inca: { at: [-73.0, -12.0], lines: ["インカ帝国"], size: 7 },
};

const RENAISSANCE_SNAPSHOTS_MEDIEVAL = {
  // コロンブスの航海とグラナダ陥落（1492年）
  [1492]: {
    regions: [
      renRegion("ポルトガル王国", LABELS.portugal),
      renRegion("スペイン王国", LABELS.spain),
      renRegion("フランス王国", LABELS.france),
      renRegion("神聖ローマ帝国", LABELS.hre),
      renRegion("ミラノ公国", LABELS.milan),
      renRegion("ヴェネツィア共和国", LABELS.venice),
      renRegion("フィレンツェ", LABELS.florence),
      renRegion("ローマ教皇領", LABELS.papal),
      renRegion("ナポリ王国", LABELS.naples),
      renRegion("アステカ帝国", LABELS.aztec),
      renRegion("インカ帝国", LABELS.inca),
    ],
    background: [
      mapBackground("オスマン帝国", [31.0, 39.5], OTTOMAN_FILL),
      mapBackground("ハンガリー王国", [20.0, 47.2], "#8C9A7A"),
      mapBackground("スイス", [8.2, 46.85], "#A89A8C"),
      mapBackground("ナバラ王国", [-1.65, 42.7], "#A89A8C"),
    ],
    cities: [
      mapCity("リスボン", -9.14, 38.72, "ポルトガル王国", "l"),
      mapCity("グラナダ", -3.60, 37.18, "スペイン王国", "b"),
      mapCity("セビリャ", -5.98, 37.39, "スペイン王国", "l"),
      mapCity("パリ", 2.35, 48.86, "フランス王国"),
      mapCity("ウィーン", 16.37, 48.21, "神聖ローマ帝国", "r"),
      mapCity("ミラノ", 9.19, 45.46, "ミラノ公国", "l"),
      mapCity("ヴェネツィア", 12.34, 45.44, "ヴェネツィア共和国", "r"),
      mapCity("フィレンツェ", 11.25, 43.77, "フィレンツェ", "l"),
      mapCity("ローマ", 12.48, 41.89, "ローマ教皇領"),
      mapCity("ナポリ", 14.25, 40.85, "ナポリ王国", "r"),
      mapCity("テノチティトラン", -99.13, 19.43, "アステカ帝国"),
      mapCity("クスコ", -71.97, -13.53, "インカ帝国"),
      mapCity("イスタンブル", 28.98, 41.01, null, "t"),
    ],
  },
};

const RENAISSANCE_SNAPSHOTS_EARLY_MODERN = {
  // ルターの「九十五箇条の論題」（1517年）。アステカ・インカはまだ健在、ナポリはスペイン王の支配下
  [1517]: {
    regions: [
      renRegion("ポルトガル王国", LABELS.portugal),
      renRegion("スペイン王国", LABELS.spain),
      renRegion("フランス王国", LABELS.france),
      renRegion("神聖ローマ帝国", LABELS.hre),
      renRegion("ジュネーヴ", LABELS.geneva),
      renRegion("ミラノ公国", LABELS.milan),
      renRegion("ヴェネツィア共和国", LABELS.venice),
      renRegion("フィレンツェ", LABELS.florence),
      renRegion("ローマ教皇領", LABELS.papal),
      renRegion("アステカ帝国", LABELS.aztec),
      renRegion("インカ帝国", LABELS.inca),
    ],
    background: [
      mapBackground("オスマン帝国", [31.0, 39.5], OTTOMAN_FILL),
      mapBackground("ハンガリー王国", [20.0, 47.2], "#8C9A7A"),
      mapBackground("スイス", [8.2, 46.85], "#A89A8C"),
    ],
    cities: [
      mapCity("リスボン", -9.14, 38.72, "ポルトガル王国", "l"),
      mapCity("マドリード", -3.70, 40.42, "スペイン王国"),
      mapCity("セビリャ", -5.98, 37.39, "スペイン王国", "l"),
      mapCity("パリ", 2.35, 48.86, "フランス王国"),
      mapCity("ヴィッテンベルク", 12.65, 51.87, "神聖ローマ帝国", "r"),
      mapCity("ウィーン", 16.37, 48.21, "神聖ローマ帝国", "r"),
      mapCity("ジュネーヴ", 6.14, 46.20, "ジュネーヴ", "l"),
      mapCity("ミラノ", 9.19, 45.46, "ミラノ公国", "l"),
      mapCity("ヴェネツィア", 12.34, 45.44, "ヴェネツィア共和国", "r"),
      mapCity("フィレンツェ", 11.25, 43.77, "フィレンツェ", "l"),
      mapCity("ローマ", 12.48, 41.89, "ローマ教皇領"),
      mapCity("ナポリ", 14.25, 40.85, "スペイン王国", "r"),
      mapCity("サント・ドミンゴ", -69.90, 18.47, "スペイン王国"),
      mapCity("テノチティトラン", -99.13, 19.43, "アステカ帝国"),
      mapCity("クスコ", -71.97, -13.53, "インカ帝国"),
      mapCity("ゴア", 73.83, 15.49, "ポルトガル王国", "l"),
      mapCity("イスタンブル", 28.98, 41.01, null, "t"),
    ],
  },
  // アウクスブルクの和議（1555年）。アステカ・インカは滅亡し、ヌエバ・エスパーニャとペルーがスペイン領に
  [1555]: {
    regions: [
      renRegion("ポルトガル王国", LABELS.portugal),
      renRegion("スペイン王国", LABELS.spain),
      renRegion("フランス王国", LABELS.france),
      renRegion("神聖ローマ帝国", LABELS.hre),
      renRegion("ジュネーヴ", LABELS.geneva),
      renRegion("ミラノ公国", { ...LABELS.milan, lines: ["ミラノ公国", "（スペイン領）"] }),
      renRegion("ヴェネツィア共和国", LABELS.venice),
      renRegion("フィレンツェ", { ...LABELS.florence, lines: ["フィレンツェ公国"] }),
      renRegion("ローマ教皇領", LABELS.papal),
    ],
    background: [
      mapBackground("オスマン帝国", [31.0, 39.5], OTTOMAN_FILL),
      mapBackground("スイス", [8.2, 46.85], "#A89A8C"),
    ],
    cities: [
      mapCity("リスボン", -9.14, 38.72, "ポルトガル王国", "l"),
      mapCity("マドリード", -3.70, 40.42, "スペイン王国"),
      mapCity("セビリャ", -5.98, 37.39, "スペイン王国", "l"),
      mapCity("パリ", 2.35, 48.86, "フランス王国"),
      mapCity("ヴィッテンベルク", 12.65, 51.87, "神聖ローマ帝国", "r"),
      mapCity("ウィーン", 16.37, 48.21, "神聖ローマ帝国", "r"),
      mapCity("ジュネーヴ", 6.14, 46.20, "ジュネーヴ", "l"),
      mapCity("ミラノ", 9.19, 45.46, "ミラノ公国", "l"),
      mapCity("ヴェネツィア", 12.34, 45.44, "ヴェネツィア共和国", "r"),
      mapCity("フィレンツェ", 11.25, 43.77, "フィレンツェ", "l"),
      mapCity("ローマ", 12.48, 41.89, "ローマ教皇領"),
      mapCity("ナポリ", 14.25, 40.85, "スペイン王国", "r"),
      mapCity("メキシコシティ", -99.13, 19.43, "スペイン王国"),
      mapCity("リマ", -77.03, -12.05, "スペイン王国", "l"),
      mapCity("ポトシ", -65.75, -19.58, "スペイン王国"),
      mapCity("ゴア", 73.83, 15.49, "ポルトガル王国", "l"),
      mapCity("イスタンブル", 28.98, 41.01, null, "t"),
    ],
  },
};

const RENAISSANCE_SEA_LABELS = [
  ...SEA_LABELS,
  ...[["カリブ海", -75.0, 15.0, 6], ["メキシコ湾", -90.0, 25.0, 6], ["太平洋", -95.0, 5.0, 9], ["インド洋", 70.0, 0.0, 9]].map(([name, lon, lat, size]) => {
    const [x, y] = lonLatToXY(lon, lat);
    return { name, x, y, size };
  }),
];

export const RENAISSANCE_BLURB = {
  "フィレンツェ": "毛織物業と金融業で栄えたトスカーナ地方の共和国。富裕な市民が芸術家や学者を支え、ルネサンス文化の中心となった。1530年代に君主国（のちのトスカーナ大公国）へ移行した。",
  "ミラノ公国": "北イタリアのロンバルディア地方を治めた公国。豊かな経済力から、イタリア戦争ではフランスとハプスブルク家の争奪の的となり、1535年以降はスペインの支配下に入った。",
  "ローマ教皇領": "ローマ教皇が君主として治めたイタリア中部の国家。教皇たちは芸術家を招いてローマで大事業を進める一方、その財政負担が教会への批判を強めることにもなった。",
  "ヴェネツィア共和国": "「アドリア海の女王」と呼ばれた海洋国家。東地中海の島々を拠点に香辛料などの東方貿易で栄えたが、新航路の開拓とオスマン帝国の進出で次第に地位を低下させた。",
  "ナポリ王国": "イタリア半島南部を治めた王国。1504年以降はスペイン王の支配下に置かれ、副王が統治した。",
  "神聖ローマ帝国": "ドイツを中心に多数の領邦（諸侯国・自由都市）からなる国家。皇帝の権力は弱く、16世紀には宗教改革をめぐって皇帝と新教派の諸侯が激しく対立した。",
  "ジュネーヴ": "レマン湖畔の都市。司教の支配から独立したのち宗教改革を受け入れ、「プロテスタントのローマ」と呼ばれる新教の一大拠点となった。",
  "フランス王国": "ヴァロワ朝のもとで中央集権化を進めた王国。イタリアの支配をめぐって、ハプスブルク家とイタリア戦争を戦った。",
  "ポルトガル王国": "イベリア半島西端の王国。15世紀からアフリカ西岸の探検を進め、インド洋の交易拠点とブラジルを持つ海洋帝国となった。首都リスボンは香辛料貿易で繁栄した。",
  "スペイン王国": "1479年にカスティリャとアラゴンが統合して成立した。1492年にグラナダを陥落させてレコンキスタを完了し、新大陸の征服によって「太陽の沈まぬ国」と呼ばれる大帝国を築いた。",
  "アステカ帝国": "メキシコ高原に栄えた先住民の国家。湖上の都テノチティトランを中心に周辺の諸民族を支配し、太陽神をまつる壮大な神殿を築いた。",
  "インカ帝国": "アンデス山脈に沿って南北4000kmに及んだ先住民の帝国。都クスコを中心に、「インカ道」と呼ばれる道路網を整備した。",
};

// 1492年（中世②区分）と、1517年・1555年（大航海時代・近世区分。1600年以降は三十年戦争期の地図に切り替え）
export const RENAISSANCE_MEDIEVAL_MAP = snapshotMapPeriod(RENAISSANCE_SNAPSHOTS_MEDIEVAL, { geoPrefix: "ren",
  rivers: RIVERS, seaLabels: RENAISSANCE_SEA_LABELS, blurb: RENAISSANCE_BLURB,
});
export const RENAISSANCE_EARLY_MODERN_MAP = snapshotMapPeriod(RENAISSANCE_SNAPSHOTS_EARLY_MODERN, { geoPrefix: "ren",
  rivers: RIVERS, seaLabels: RENAISSANCE_SEA_LABELS, blurb: RENAISSANCE_BLURB,
});

// =====================================================================
// 中世ヨーロッパ（封建社会・十字軍・ビザンツ）の地図データ
// 550・800・962年は地図の時代区分「中世①」、1095・1204・1360年は「中世②」に属する。中世②の1450年以降は
// ルネサンス期の勢力図（1492年）が受け持つため、App.jsx の ERA_PERIODS で年ごとに切り替えている。
// フランス王国・神聖ローマ帝国などの輪郭はルネサンス期のものを流用し、フランドルはフランス王国の上に重ねる小区分として描く。
// region の id は MEDIEVAL_CARDS の region と一致させている。カードの答えになる地名（クレルモン、カノッサ、アヴィニョン、
// コンスタンツ、リューベック、カッファ）は、地図上で答えが見えないよう都市として置かない。輪郭は学習用の模式図。
// =====================================================================
const MEDIEVAL_COLORS = {
  "フランク王国": ["#9AA8D9", "#C7D0EC"],
  "神聖ローマ帝国": ["#A8C686", "#D2E3BF"],
  "ビザンツ帝国": ["#C98E82", "#EAC0B9"],
  "フランス王国": ["#8FA3E0", "#C3CFF0"],
  "イングランド王国": ["#D9866B", "#F0B8A8"],
  "イスラーム世界": ["#7ECBA8", "#B8E5D2"],
  "セルジューク朝": ["#E0C56B", "#F0E2A8"],
  "ヴェネツィア共和国": ["#E07A8B", "#F2B8C2"],
  "ジェノヴァ共和国": ["#C9A0DC", "#E4CFEE"],
  "フランドル": ["#F2A65A", "#F8D3AA"],
};
const medRegion = (id, label) => mapRegion(MEDIEVAL_COLORS, id, label);






const MEDIEVAL_LABELS = {
  franks: { at: [4.0, 48.0], lines: ["フランク王国"], size: 7 },
  hre: { at: [10.5, 50.6], lines: ["神聖ローマ帝国"], size: 7 },
  westFrancia: { at: [2.3, 46.8], lines: ["西フランク王国"], size: 6.5 },
  france: { at: [2.3, 46.8], lines: ["フランス王国"], size: 6.5 },
  england: { at: [-1.6, 52.6], lines: ["イングランド", "王国"], size: 4.5 },
  flanders: { at: [3.1, 51.0], lines: ["フランドル"], size: 2.8 },
  byz: { at: [32.0, 39.0], lines: ["ビザンツ帝国"], size: 7 },
  islam: { at: [40.0, 30.0], lines: ["イスラーム世界"], size: 9 },
  seljuk: { at: [50.0, 34.0], lines: ["セルジューク朝"], size: 8 },
  venice: { at: [12.3, 45.9], lines: ["ヴェネツィア"], size: 3 },
  genoa: { at: [8.8, 44.75], lines: ["ジェノヴァ"], size: 3 },
};

const MEDIEVAL_SNAPSHOTS_1 = {
  // ユスティニアヌス帝の時代（6世紀半ば）
  [550]: {
    regions: [
      medRegion("フランク王国", { ...MEDIEVAL_LABELS.franks, lines: ["フランク王国", "（メロヴィング朝）"] }),
      medRegion("ビザンツ帝国", MEDIEVAL_LABELS.byz),
    ],
    cities: [
      mapCity("パリ", 2.35, 48.86, "フランク王国"),
      mapCity("コンスタンティノープル", 28.98, 41.01, "ビザンツ帝国", "t"),
      mapCity("ラヴェンナ", 12.20, 44.42, "ビザンツ帝国", "r"),
      mapCity("ローマ", 12.48, 41.89, "ビザンツ帝国"),
      mapCity("カルタゴ", 10.32, 36.85, "ビザンツ帝国"),
      mapCity("アレクサンドリア", 29.92, 31.20, "ビザンツ帝国", "tl"),
      mapCity("アンティオキア", 36.16, 36.20, "ビザンツ帝国", "r"),
    ],
  },
  // カール大帝の戴冠（800年）
  [800]: {
    regions: [
      medRegion("フランク王国", MEDIEVAL_LABELS.franks),
      medRegion("ビザンツ帝国", MEDIEVAL_LABELS.byz),
      medRegion("イスラーム世界", MEDIEVAL_LABELS.islam),
    ],
    cities: [
      mapCity("アーヘン", 6.08, 50.78, "フランク王国", "r"),
      mapCity("パリ", 2.35, 48.86, "フランク王国"),
      mapCity("ポワティエ", 0.34, 46.58, "フランク王国", "l"),
      mapCity("ローマ", 12.48, 41.89, "フランク王国"),
      mapCity("コンスタンティノープル", 28.98, 41.01, "ビザンツ帝国", "t"),
      mapCity("コルドバ", -4.78, 37.88, "イスラーム世界", "l"),
      mapCity("バグダード", 44.36, 33.31, "イスラーム世界"),
    ],
  },
  // オットー1世の戴冠（962年）
  [962]: {
    regions: [
      medRegion("フランス王国", MEDIEVAL_LABELS.westFrancia),
      medRegion("神聖ローマ帝国", MEDIEVAL_LABELS.hre),
      medRegion("イングランド王国", MEDIEVAL_LABELS.england),
      medRegion("ビザンツ帝国", MEDIEVAL_LABELS.byz),
      medRegion("イスラーム世界", MEDIEVAL_LABELS.islam),
    ],
    cities: [
      mapCity("パリ", 2.35, 48.86, "フランス王国"),
      mapCity("アーヘン", 6.08, 50.78, "神聖ローマ帝国", "r"),
      mapCity("マクデブルク", 11.63, 52.13, "神聖ローマ帝国", "r"),
      mapCity("ローマ", 12.48, 41.89, "神聖ローマ帝国"),
      mapCity("ロンドン", -0.12, 51.51, "イングランド王国", "tl"),
      mapCity("コンスタンティノープル", 28.98, 41.01, "ビザンツ帝国", "t"),
      mapCity("コルドバ", -4.78, 37.88, "イスラーム世界", "l"),
      mapCity("バグダード", 44.36, 33.31, "イスラーム世界"),
    ],
  },
};

const MEDIEVAL_SNAPSHOTS_2 = {
  // 第1回十字軍の前夜（1095年）。フランドルはフランス王国の上に重ねて描く（配列の後ろほど上に描画される）
  [1095]: {
    regions: [
      medRegion("神聖ローマ帝国", MEDIEVAL_LABELS.hre),
      medRegion("フランス王国", MEDIEVAL_LABELS.france),
      medRegion("イングランド王国", MEDIEVAL_LABELS.england),
      medRegion("ビザンツ帝国", MEDIEVAL_LABELS.byz),
      medRegion("セルジューク朝", MEDIEVAL_LABELS.seljuk),
      medRegion("イスラーム世界", { ...MEDIEVAL_LABELS.islam, at: [10.0, 31.0] }),
      medRegion("ヴェネツィア共和国", MEDIEVAL_LABELS.venice),
      medRegion("ジェノヴァ共和国", MEDIEVAL_LABELS.genoa),
      medRegion("フランドル", MEDIEVAL_LABELS.flanders),
    ],
    cities: [
      mapCity("パリ", 2.35, 48.86, "フランス王国"),
      mapCity("ロンドン", -0.12, 51.51, "イングランド王国", "tl"),
      mapCity("ブルージュ", 3.22, 51.21, "フランドル", "tl"),
      mapCity("ガン", 3.72, 51.05, "フランドル", "r"),
      mapCity("アーヘン", 6.08, 50.78, "神聖ローマ帝国", "r"),
      mapCity("ヴェネツィア", 12.34, 45.44, "ヴェネツィア共和国", "r"),
      mapCity("ジェノヴァ", 8.93, 44.41, "ジェノヴァ共和国", "l"),
      mapCity("ローマ", 12.48, 41.89, null),
      mapCity("コンスタンティノープル", 28.98, 41.01, "ビザンツ帝国", "t"),
      mapCity("イェルサレム", 35.23, 31.78, "セルジューク朝", "r"),
      mapCity("バグダード", 44.36, 33.31, "セルジューク朝"),
      mapCity("カイロ", 31.24, 30.04, "イスラーム世界", "l"),
      mapCity("コルドバ", -4.78, 37.88, "イスラーム世界", "l"),
    ],
  },
  // 第4回十字軍のコンスタンティノープル占領（1204年）。ヴェネツィアはクレタ島・エウボイア島など東地中海の拠点を得る
  [1204]: {
    regions: [
      medRegion("神聖ローマ帝国", MEDIEVAL_LABELS.hre),
      medRegion("フランス王国", MEDIEVAL_LABELS.france),
      medRegion("イングランド王国", MEDIEVAL_LABELS.england),
      medRegion("ビザンツ帝国", { ...MEDIEVAL_LABELS.byz, at: [29.5, 40.0], lines: ["ニケーア帝国", "（ビザンツ亡命政権）"], size: 4 }),
      medRegion("セルジューク朝", { ...MEDIEVAL_LABELS.seljuk, at: [34.0, 38.7], lines: ["ルーム・", "セルジューク朝"], size: 4.5 }),
      medRegion("イスラーム世界", MEDIEVAL_LABELS.islam),
      medRegion("ヴェネツィア共和国", MEDIEVAL_LABELS.venice),
      medRegion("ジェノヴァ共和国", MEDIEVAL_LABELS.genoa),
      medRegion("フランドル", MEDIEVAL_LABELS.flanders),
    ],
    background: [
      mapBackground("十字軍の諸国家", [25.5, 41.3], "#8C9A7A"),
    ],
    cities: [
      mapCity("パリ", 2.35, 48.86, "フランス王国"),
      mapCity("ロンドン", -0.12, 51.51, "イングランド王国", "tl"),
      mapCity("ブルージュ", 3.22, 51.21, "フランドル", "tl"),
      mapCity("ガン", 3.72, 51.05, "フランドル", "r"),
      mapCity("ヴェネツィア", 12.34, 45.44, "ヴェネツィア共和国", "r"),
      mapCity("ジェノヴァ", 8.93, 44.41, "ジェノヴァ共和国", "l"),
      mapCity("ローマ", 12.48, 41.89, null),
      mapCity("コンスタンティノープル", 28.98, 41.01, null, "t"),
      mapCity("ニケーア", 29.72, 40.43, "ビザンツ帝国", "r"),
      mapCity("コンヤ", 32.49, 37.87, "セルジューク朝"),
      mapCity("カイロ", 31.24, 30.04, "イスラーム世界", "l"),
      mapCity("ダマスクス", 36.29, 33.51, "イスラーム世界", "r"),
    ],
  },
  // 百年戦争中のブレティニー条約と黒死病の大流行後（1360年）。イングランドはアキテーヌとカレーを保持
  [1360]: {
    regions: [
      medRegion("神聖ローマ帝国", MEDIEVAL_LABELS.hre),
      medRegion("フランス王国", MEDIEVAL_LABELS.france),
      medRegion("イングランド王国", MEDIEVAL_LABELS.england),
      medRegion("ビザンツ帝国", { ...MEDIEVAL_LABELS.byz, at: [28.4, 41.9], size: 3.5 }),
      medRegion("イスラーム世界", { ...MEDIEVAL_LABELS.islam, at: [20.0, 28.5] }),
      medRegion("ヴェネツィア共和国", MEDIEVAL_LABELS.venice),
      medRegion("ジェノヴァ共和国", MEDIEVAL_LABELS.genoa),
      medRegion("フランドル", MEDIEVAL_LABELS.flanders),
    ],
    background: [
      mapBackground("オスマン朝", [29.0, 40.2], "#7A8CA8"),
    ],
    cities: [
      mapCity("パリ", 2.35, 48.86, "フランス王国"),
      mapCity("オルレアン", 1.91, 47.90, "フランス王国", "l"),
      mapCity("ロンドン", -0.12, 51.51, "イングランド王国", "tl"),
      mapCity("ボルドー", -0.58, 44.84, "イングランド王国", "l"),
      mapCity("ブルージュ", 3.22, 51.21, "フランドル", "tl"),
      mapCity("ガン", 3.72, 51.05, "フランドル", "r"),
      mapCity("プラハ", 14.42, 50.09, "神聖ローマ帝国", "r"),
      mapCity("ヴェネツィア", 12.34, 45.44, "ヴェネツィア共和国", "r"),
      mapCity("ジェノヴァ", 8.93, 44.41, "ジェノヴァ共和国", "l"),
      mapCity("ローマ", 12.48, 41.89, null),
      mapCity("コンスタンティノープル", 28.98, 41.01, "ビザンツ帝国", "t"),
      mapCity("カイロ", 31.24, 30.04, "イスラーム世界", "l"),
      mapCity("グラナダ", -3.60, 37.18, "イスラーム世界", "b"),
    ],
  },
};

// 「シチリア島」は c65 の答えなので、中世の地図では出さない
const MEDIEVAL_SEA_LABELS = SEA_LABELS.filter((s) => s.name !== "ドーバー海峡" && s.name !== "シチリア島").concat(
  [["カスピ海", 51.0, 41.8, 6.5], ["紅海", 37.5, 21.0, 6], ["ペルシア湾", 51.3, 27.2, 5.5]].map(([name, lon, lat, size]) => {
    const [x, y] = lonLatToXY(lon, lat);
    return { name, x, y, size };
  }),
);

export const MEDIEVAL_BLURB = {
  "フランク王国": "ゲルマン人の一派フランク人が建てた王国。5世紀末にカトリックに改宗してローマ教会と結び、8世紀には西ヨーロッパの大半を支配した。",
  "神聖ローマ帝国": "ドイツとイタリア北部を中心とする国家。皇帝は諸侯の選挙で選ばれ、ローマ教皇から帝冠を受けることでローマ帝国の後継者を名乗った。",
  "ビザンツ帝国": "東ローマ帝国とも呼ばれ、東方のキリスト教会とギリシア語文化を軸に1000年以上続いた。首都は地中海と黒海を結ぶ交易の要衝として栄えた。",
  "フランス王国": "西フランク王国から発展した王国。10世紀末にカペー朝が始まり、はじめは王権が弱かったが、しだいに王領を広げて中央集権化を進めた。",
  "イングランド王国": "ブリテン島南部の王国。11世紀以降に大陸の封建制度が持ち込まれ、王と貴族・議会の関係をめぐって独自の政治制度が形づくられた。",
  "イスラーム世界": "7世紀にアラビア半島で成立したイスラーム教のもとで広がった地域。アッバース朝などの王朝のもとで西アジアから北アフリカ・イベリア半島に及ぶ広大な世界が形成され、学問と商業が栄えた。",
  "セルジューク朝": "11世紀に中央アジアから進出したトルコ系の王朝。バグダードに入ってスルタンの称号を得、小アジアにも進出してビザンツ帝国を圧迫した。",
  "ヴェネツィア共和国": "アドリア海の干潟に築かれた都市国家。ビザンツ帝国との結びつきを足がかりに東地中海の交易を握り、各地に商業拠点を持つ海洋国家となった。",
  "ジェノヴァ共和国": "イタリア北西部の港町を中心とする海洋都市国家。ヴェネツィアと地中海の覇権を争い、黒海沿岸やエーゲ海にも植民市を築いた。",
  "フランドル": "現在のベルギー西部を中心とする伯領。イギリスから羊毛を輸入して毛織物業が栄え、ブルージュやガンなどの都市が自治を獲得した。英仏の対立の焦点にもなった。",
};

// 550・800・962年（中世①区分）と、1095・1204・1360年（中世②区分。1450年以降はルネサンス期の地図に切り替え）
export const MEDIEVAL_1_MAP = snapshotMapPeriod(MEDIEVAL_SNAPSHOTS_1, { geoPrefix: "med", rivers: RIVERS, seaLabels: MEDIEVAL_SEA_LABELS, blurb: MEDIEVAL_BLURB });
export const MEDIEVAL_2_MAP = snapshotMapPeriod(MEDIEVAL_SNAPSHOTS_2, { geoPrefix: "med", rivers: RIVERS, seaLabels: MEDIEVAL_SEA_LABELS, blurb: MEDIEVAL_BLURB });

// =====================================================================
// 近世（絶対王政・主権国家体制）の地図データ
// 1648・1715・1772年の3時点。地図の時代区分「大航海時代・近世」の1600年以降を受け持つ（1600年より前はルネサンス期の地図）。
// フランス・神聖ローマ帝国・スペインなどの輪郭はルネサンス期のものを流用し、オーストリア・プロイセン・オランダなどは
// 神聖ローマ帝国の上に重ねて描く（配列の後ろほど上に描画される）。
// region の id は ABSOLUTISM_CARDS の region と一致させている。カードの答えになる地名（ユトレヒト、カルロヴィッツ、
// バタヴィア、ナント）は都市として置かず、勢力ラベルにも「ハンガリー」「スイス」は出さない。輪郭は学習用の模式図。
// =====================================================================
const ABSOLUTISM_COLORS = {
  "スペイン王国": ["#D9866B", "#F0B8A8"],
  "オランダ": ["#F2A65A", "#F8D3AA"],
  "神聖ローマ帝国": ["#A8C686", "#D2E3BF"],
  "イギリス": ["#E07A8B", "#F2B8C2"],
  "フランス王国": ["#8FA3E0", "#C3CFF0"],
  "オーストリア": ["#E8D27A", "#F5E9B8"],
  "プロイセン王国": ["#8FBCC9", "#C3E0E6"],
  "ロシア帝国": ["#B79FD1", "#DCCCEC"],
};
const absRegion = (id, label) => mapRegion(ABSOLUTISM_COLORS, id, label);



const BG = { ottoman: "#7A8CA8", sweden: "#8C9A7A", poland: "#A89A8C", portugal: "#7FA6A0" };

const ABSOLUTISM_LABELS = {
  spain: { at: [-3.0, 40.3], lines: ["スペイン王国"], size: 5 },
  netherlands: { at: [5.4, 52.4], lines: ["オランダ"], size: 3 },
  hre: { at: [9.6, 50.2], lines: ["神聖ローマ帝国"], size: 4.5 },
  britain: { at: [-1.8, 52.9], lines: ["イギリス"], size: 4.5 },
  france: { at: [2.3, 46.8], lines: ["フランス王国"], size: 6 },
  austria: { at: [15.2, 47.4], lines: ["オーストリア"], size: 4 },
  brandenburg: { at: [13.3, 52.6], lines: ["ブランデンブルク", "＝プロイセン"], size: 3 },
  prussia: { at: [13.3, 52.6], lines: ["プロイセン王国"], size: 3.6 },
  russia: { at: [42.0, 57.0], lines: ["ロシア帝国"], size: 8 },
};

const ABSOLUTISM_SNAPSHOTS = {
  // ウェストファリア条約（1648年）。ブランデンブルク選帝侯はプロイセン公国を兼ね、オーストリアはベーメン・シュレジエンを保持
  [1648]: {
    regions: [
      absRegion("神聖ローマ帝国", ABSOLUTISM_LABELS.hre),
      absRegion("フランス王国", ABSOLUTISM_LABELS.france),
      absRegion("スペイン王国", ABSOLUTISM_LABELS.spain),
      absRegion("オーストリア", ABSOLUTISM_LABELS.austria),
      absRegion("プロイセン王国", ABSOLUTISM_LABELS.brandenburg),
      absRegion("オランダ", ABSOLUTISM_LABELS.netherlands),
      absRegion("イギリス", ABSOLUTISM_LABELS.britain),
      absRegion("ロシア帝国", { ...ABSOLUTISM_LABELS.russia, lines: ["ロシア"] }),
    ],
    background: [
      mapBackground("スウェーデン", [16.0, 62.0], BG.sweden),
      mapBackground("ポーランド＝リトアニア", [26.5, 53.0], BG.poland),
      mapBackground("オスマン帝国", [31.0, 39.5], BG.ottoman),
      mapBackground("ポルトガル王国", [-8.2, 39.8], BG.portugal),
    ],
    cities: [
      mapCity("マドリード", -3.70, 40.42, "スペイン王国"),
      mapCity("ブリュッセル", 4.35, 50.85, "スペイン王国", "l"),
      mapCity("ミラノ", 9.19, 45.46, "スペイン王国", "l"),
      mapCity("アムステルダム", 4.90, 52.37, "オランダ", "tl"),
      mapCity("ロンドン", -0.12, 51.51, "イギリス", "tl"),
      mapCity("パリ", 2.35, 48.86, "フランス王国"),
      mapCity("ミュンスター", 7.63, 51.96, "神聖ローマ帝国", "r"),
      mapCity("ウィーン", 16.37, 48.21, "オーストリア", "r"),
      mapCity("プラハ", 14.42, 50.09, "オーストリア", "r"),
      mapCity("ベルリン", 13.40, 52.52, "プロイセン王国", "r"),
      mapCity("モスクワ", 37.62, 55.76, "ロシア帝国", "r"),
    ],
  },
  // ユトレヒト条約（1713年）の直後。スペインはブルボン朝に、南ネーデルラント・ミラノ・ナポリはオーストリア領に。ロシアはバルト海に進出
  [1715]: {
    regions: [
      absRegion("神聖ローマ帝国", ABSOLUTISM_LABELS.hre),
      absRegion("フランス王国", ABSOLUTISM_LABELS.france),
      absRegion("スペイン王国", ABSOLUTISM_LABELS.spain),
      absRegion("オーストリア", ABSOLUTISM_LABELS.austria),
      absRegion("プロイセン王国", ABSOLUTISM_LABELS.prussia),
      absRegion("オランダ", ABSOLUTISM_LABELS.netherlands),
      absRegion("イギリス", ABSOLUTISM_LABELS.britain),
      absRegion("ロシア帝国", { ...ABSOLUTISM_LABELS.russia, lines: ["ロシア"] }),
    ],
    background: [
      mapBackground("スウェーデン", [16.0, 62.0], BG.sweden),
      mapBackground("ポーランド＝リトアニア", [26.5, 53.0], BG.poland),
      mapBackground("オスマン帝国", [31.0, 39.5], BG.ottoman),
      mapBackground("ポルトガル王国", [-8.2, 39.8], BG.portugal),
    ],
    cities: [
      mapCity("マドリード", -3.70, 40.42, "スペイン王国"),
      mapCity("アムステルダム", 4.90, 52.37, "オランダ", "tl"),
      mapCity("ロンドン", -0.12, 51.51, "イギリス", "tl"),
      mapCity("パリ", 2.35, 48.86, "フランス王国", "tl"),
      mapCity("ヴェルサイユ", 2.12, 48.80, "フランス王国", "bl"),
      mapCity("フランクフルト", 8.68, 50.11, "神聖ローマ帝国", "r"),
      mapCity("ウィーン", 16.37, 48.21, "オーストリア", "r"),
      mapCity("プラハ", 14.42, 50.09, "オーストリア", "r"),
      mapCity("ブリュッセル", 4.35, 50.85, "オーストリア", "l"),
      mapCity("ベルリン", 13.40, 52.52, "プロイセン王国", "r"),
      mapCity("ケーニヒスベルク", 20.51, 54.71, "プロイセン王国", "r"),
      mapCity("サンクトペテルブルク", 30.32, 59.94, "ロシア帝国", "r"),
      mapCity("モスクワ", 37.62, 55.76, "ロシア帝国", "r"),
    ],
  },
  // 第1回ポーランド分割（1772年）。プロイセンはシュレジエンと西プロイセンを、オーストリアはガリツィアを領有
  [1772]: {
    regions: [
      absRegion("神聖ローマ帝国", ABSOLUTISM_LABELS.hre),
      absRegion("フランス王国", ABSOLUTISM_LABELS.france),
      absRegion("スペイン王国", ABSOLUTISM_LABELS.spain),
      absRegion("オーストリア", ABSOLUTISM_LABELS.austria),
      absRegion("プロイセン王国", ABSOLUTISM_LABELS.prussia),
      absRegion("オランダ", ABSOLUTISM_LABELS.netherlands),
      absRegion("イギリス", ABSOLUTISM_LABELS.britain),
      absRegion("ロシア帝国", ABSOLUTISM_LABELS.russia),
    ],
    background: [
      mapBackground("スウェーデン", [16.0, 62.0], BG.sweden),
      mapBackground("ポーランド＝リトアニア", [26.0, 53.0], BG.poland),
      mapBackground("オスマン帝国", [31.0, 39.5], BG.ottoman),
      mapBackground("ポルトガル王国", [-8.2, 39.8], BG.portugal),
    ],
    cities: [
      mapCity("マドリード", -3.70, 40.42, "スペイン王国"),
      mapCity("アムステルダム", 4.90, 52.37, "オランダ", "tl"),
      mapCity("ロンドン", -0.12, 51.51, "イギリス", "tl"),
      mapCity("ボストン", -71.06, 42.36, "イギリス", "r"),
      mapCity("パリ", 2.35, 48.86, "フランス王国", "tl"),
      mapCity("ヴェルサイユ", 2.12, 48.80, "フランス王国", "bl"),
      mapCity("フランクフルト", 8.68, 50.11, "神聖ローマ帝国", "r"),
      mapCity("ウィーン", 16.37, 48.21, "オーストリア", "r"),
      mapCity("プラハ", 14.42, 50.09, "オーストリア", "r"),
      mapCity("ベルリン", 13.40, 52.52, "プロイセン王国", "r"),
      mapCity("ポツダム", 13.06, 52.39, "プロイセン王国", "bl"),
      mapCity("ブレスラウ", 17.04, 51.11, "プロイセン王国", "r"),
      mapCity("サンクトペテルブルク", 30.32, 59.94, "ロシア帝国", "r"),
      mapCity("モスクワ", 37.62, 55.76, "ロシア帝国", "r"),
      mapCity("ワルシャワ", 21.01, 52.23, null, "r"),
    ],
  },
};

export const ABSOLUTISM_BLURB = {
  "スペイン王国": "16世紀には新大陸の銀で栄えた大帝国。17世紀以降は相次ぐ戦争と財政難で衰え、18世紀初めにはフランス系のブルボン家が王位を継いだ。",
  "オランダ": "スペインから独立した新教徒の共和国。造船・海運・金融を武器に17世紀には世界の商業の中心となり、宗教的に寛容な社会のもとで市民文化が栄えた。",
  "神聖ローマ帝国": "ドイツを中心とする多数の領邦の連合体。17世紀半ばの講和で諸侯がほぼ完全な主権を認められ、皇帝の権威は名目的なものとなった。",
  "イギリス": "イングランドとスコットランドを中心とする王国（1707年に合同して大ブリテン王国）。17世紀の二つの革命を経て議会が国王の権力を制限する立憲王政を確立し、18世紀には海外植民地を広げた。",
  "フランス王国": "ブルボン朝のもとで中央集権化を進めた絶対王政の典型。豪華な宮廷文化はヨーロッパ各国の手本となったが、度重なる戦争で財政は悪化した。",
  "オーストリア": "ハプスブルク家が治めた多民族の君主国。ウィーンを都にベーメンや東方の諸地域を支配し、神聖ローマ皇帝の位をほぼ独占した。",
  "プロイセン王国": "ブランデンブルク選帝侯国とプロイセン公国が合同して成立し、1701年に王国となった。強力な常備軍と官僚制によって急速に台頭し、ドイツの新たな強国となった。",
  "ロシア帝国": "モスクワを中心に成長し、17世紀にはシベリアを経て太平洋岸に達した。18世紀に西欧化を進めてヨーロッパの大国となり、バルト海・黒海方面へ領土を広げた。",
};

// 1648・1715・1772年（大航海時代・近世区分の1600年以降）
export const ABSOLUTISM_MAP = snapshotMapPeriod(ABSOLUTISM_SNAPSHOTS, { geoPrefix: "abs",
  rivers: RIVERS, seaLabels: RENAISSANCE_SEA_LABELS, blurb: ABSOLUTISM_BLURB,
});

// =====================================================================
// 近代（帝国主義と世界大戦）の地図データ
// 1885・1900・1914年の3時点。地図の時代区分「帝国主義と二つの大戦」のうち1918年までを受け持つ。
// 列強の植民地は本国と同じ勢力として描く（英領インド・カナダ・アフリカ、仏領アフリカ・インドシナ、独領アフリカ、米領太平洋など）。
// region の id は IMPERIALISM_CARDS の region と一致させている。カードの答えになる地名（ファショダ、モロッコ、キール、
// ポーツマス、下関、膠州、フィリピン、ボスニア・ヘルツェゴヴィナなど）は、ラベル・都市名として出さない。輪郭は学習用の模式図。
// =====================================================================
const IMPERIALISM_COLORS = {
  "イギリス": ["#E07A8B", "#F2B8C2"],
  "フランス": ["#8FA3E0", "#C3CFF0"],
  "ドイツ帝国": ["#A8A8A8", "#D8D8D8"],
  "ロシア帝国": ["#B79FD1", "#DCCCEC"],
  "アメリカ合衆国": ["#7ECBA8", "#B8E5D2"],
  "オーストリア＝ハンガリー帝国": ["#E8D27A", "#F5E9B8"],
  "オスマン帝国": ["#7FB8C9", "#BFDCE6"],
  "日本": ["#F2A65A", "#F8D3AA"],
  "清": ["#D9866B", "#F0B8A8"],
};
const impRegion = (id, label) => mapRegion(IMPERIALISM_COLORS, id, label);









const IMP_BG = { neutral: "#8C9A7A", iberia: "#A89A8C", balkan: "#9A8CA8", persia: "#7A8CA8", korea: "#A8A07A" };

const IMPERIALISM_LABELS = {
  britain: { at: [-2.0, 53.0], lines: ["イギリス"], size: 4.5 },
  france: { at: [2.3, 46.8], lines: ["フランス"], size: 5.5 },
  germany: { at: [10.3, 51.3], lines: ["ドイツ帝国"], size: 5 },
  russia: { at: [50.0, 58.0], lines: ["ロシア帝国"], size: 9 },
  usa: { at: [-99.0, 39.0], lines: ["アメリカ合衆国"], size: 7 },
  austria: { at: [16.8, 47.8], lines: ["オーストリア＝", "ハンガリー帝国"], size: 3.6 },
  ottoman: { at: [35.0, 38.8], lines: ["オスマン帝国"], size: 5.5 },
  japan: { at: [137.5, 37.0], lines: ["日本"], size: 5 },
  qing: { at: [104.0, 34.0], lines: ["清"], size: 9 },
};

// 3時点で共通の背景（バルカン諸国・朝鮮は時点ごとに追加）
const impCommonBackground = () => [
  mapBackground("イタリア", [12.5, 42.8], IMP_BG.neutral),
  mapBackground("スペイン", [-3.8, 40.0], IMP_BG.iberia),
  mapBackground("ポルトガル", [-8.2, 39.8], IMP_BG.iberia),
  mapBackground("オランダ領東インド", [113.0, -2.0], IMP_BG.neutral),
  mapBackground("ペルシア", [53.0, 32.5], IMP_BG.persia),
  mapBackground("スイス", [8.2, 46.85], IMP_BG.neutral),
  mapBackground("アフガニスタン", [66.0, 33.8], IMP_BG.persia),
  mapBackground("エチオピア", [39.5, 8.8], IMP_BG.neutral),
];
const IMP_COMMON_CITIES = [
  mapCity("ロンドン", -0.12, 51.51, "イギリス", "tl"),
  mapCity("パリ", 2.35, 48.86, "フランス"),
  mapCity("ベルリン", 13.40, 52.52, "ドイツ帝国", "r"),
  mapCity("サンクトペテルブルク", 30.32, 59.94, "ロシア帝国", "r"),
  mapCity("モスクワ", 37.62, 55.76, "ロシア帝国", "r"),
  mapCity("ウラジオストク", 131.89, 43.12, "ロシア帝国", "r"),
  mapCity("ワシントンD.C.", -77.04, 38.90, "アメリカ合衆国", "r"),
  mapCity("ウィーン", 16.37, 48.21, "オーストリア＝ハンガリー帝国", "r"),
  mapCity("サラエボ", 18.41, 43.86, "オーストリア＝ハンガリー帝国", "bl"),
  mapCity("イスタンブール", 28.98, 41.01, "オスマン帝国", "r"),
  mapCity("バグダード", 44.36, 33.31, "オスマン帝国"),
  mapCity("東京", 139.69, 35.69, "日本", "r"),
  mapCity("北京", 116.40, 39.90, "清", "l"),
  mapCity("カイロ", 31.24, 30.04, "イギリス", "l"),
  mapCity("カルカッタ", 88.36, 22.57, "イギリス", "r"),
  mapCity("ケープタウン", 18.42, -33.92, "イギリス", "l"),
  mapCity("アルジェ", 3.06, 36.75, "フランス", "r"),
  mapCity("ハノイ", 105.85, 21.03, "フランス", "l"),
];

const IMPERIALISM_SNAPSHOTS = {
  // ベルリン会議（1884〜85年）でアフリカ分割の原則が定まったころ。朝鮮は独立国
  [1885]: {
    regions: [
      impRegion("清", IMPERIALISM_LABELS.qing),
      impRegion("ロシア帝国", IMPERIALISM_LABELS.russia),
      impRegion("オスマン帝国", IMPERIALISM_LABELS.ottoman),
      impRegion("オーストリア＝ハンガリー帝国", IMPERIALISM_LABELS.austria),
      impRegion("ドイツ帝国", IMPERIALISM_LABELS.germany),
      impRegion("フランス", IMPERIALISM_LABELS.france),
      impRegion("イギリス", IMPERIALISM_LABELS.britain),
      impRegion("アメリカ合衆国", IMPERIALISM_LABELS.usa),
      impRegion("日本", IMPERIALISM_LABELS.japan),
    ],
    background: [
      ...impCommonBackground(),
      mapBackground("コンゴ自由国", [23.5, -3.0], IMP_BG.neutral),
      mapBackground("セルビア", [21.0, 43.9], IMP_BG.balkan),
      mapBackground("ブルガリア", [25.0, 42.9], IMP_BG.balkan),
      mapBackground("ルーマニア", [25.5, 44.9], IMP_BG.balkan),
      mapBackground("ギリシア", [22.0, 38.9], IMP_BG.balkan),
      mapBackground("モンテネグロ", [19.25, 42.75], IMP_BG.balkan),
      mapBackground("朝鮮", [127.5, 38.5], IMP_BG.korea),
    ],
    cities: [...IMP_COMMON_CITIES],
  },
  // 中国分割と義和団の乱（1900年）。ロシアは旅順・大連を租借、アメリカは太平洋の島々とハワイを獲得
  [1900]: {
    regions: [
      impRegion("清", IMPERIALISM_LABELS.qing),
      impRegion("ロシア帝国", IMPERIALISM_LABELS.russia),
      impRegion("オスマン帝国", IMPERIALISM_LABELS.ottoman),
      impRegion("オーストリア＝ハンガリー帝国", IMPERIALISM_LABELS.austria),
      impRegion("ドイツ帝国", IMPERIALISM_LABELS.germany),
      impRegion("フランス", IMPERIALISM_LABELS.france),
      impRegion("イギリス", IMPERIALISM_LABELS.britain),
      impRegion("アメリカ合衆国", IMPERIALISM_LABELS.usa),
      impRegion("日本", IMPERIALISM_LABELS.japan),
    ],
    background: [
      ...impCommonBackground(),
      mapBackground("コンゴ自由国", [23.5, -3.0], IMP_BG.neutral),
      mapBackground("セルビア", [21.0, 43.9], IMP_BG.balkan),
      mapBackground("ブルガリア", [25.0, 42.9], IMP_BG.balkan),
      mapBackground("ルーマニア", [25.5, 44.9], IMP_BG.balkan),
      mapBackground("ギリシア", [22.0, 38.9], IMP_BG.balkan),
      mapBackground("モンテネグロ", [19.25, 42.75], IMP_BG.balkan),
      mapBackground("大韓帝国", [127.5, 38.5], IMP_BG.korea),
    ],
    cities: [
      ...IMP_COMMON_CITIES,
      mapCity("旅順", 121.25, 38.80, "ロシア帝国", "l"),
      mapCity("青島", 120.38, 36.07, "ドイツ帝国", "r"),
      mapCity("マニラ", 120.98, 14.60, "アメリカ合衆国", "l"),
      mapCity("ホノルル", -157.86, 21.31, "アメリカ合衆国", "r"),
      mapCity("台北", 121.56, 25.04, "日本", "r"),
    ],
  },
  // 第一次世界大戦の開戦（1914年）。日本は朝鮮・南樺太・関東州を領有、オスマン帝国はバルカン戦争でヨーロッパ側の大半を失った
  [1914]: {
    regions: [
      impRegion("清", { ...IMPERIALISM_LABELS.qing, lines: ["中華民国"], size: 8 }),
      impRegion("ロシア帝国", IMPERIALISM_LABELS.russia),
      impRegion("オスマン帝国", IMPERIALISM_LABELS.ottoman),
      impRegion("オーストリア＝ハンガリー帝国", IMPERIALISM_LABELS.austria),
      impRegion("ドイツ帝国", IMPERIALISM_LABELS.germany),
      impRegion("フランス", IMPERIALISM_LABELS.france),
      impRegion("イギリス", IMPERIALISM_LABELS.britain),
      impRegion("アメリカ合衆国", IMPERIALISM_LABELS.usa),
      impRegion("日本", IMPERIALISM_LABELS.japan),
    ],
    background: [
      ...impCommonBackground(),
      mapBackground("ベルギー領コンゴ", [23.5, -3.0], IMP_BG.neutral),
      mapBackground("セルビア", [21.2, 43.4], IMP_BG.balkan),
      mapBackground("ブルガリア", [25.3, 42.7], IMP_BG.balkan),
      mapBackground("ルーマニア", [25.5, 44.9], IMP_BG.balkan),
      mapBackground("ギリシア", [22.0, 39.3], IMP_BG.balkan),
      mapBackground("モンテネグロ", [19.25, 42.75], IMP_BG.balkan),
      mapBackground("アルバニア", [20.05, 41.0], IMP_BG.balkan),
    ],
    cities: [
      ...IMP_COMMON_CITIES,
      mapCity("旅順", 121.25, 38.80, "日本", "l"),
      mapCity("京城（ソウル）", 126.98, 37.57, "日本", "l"),
      mapCity("台北", 121.56, 25.04, "日本", "r"),
      mapCity("青島", 120.38, 36.07, "ドイツ帝国", "r"),
      mapCity("マニラ", 120.98, 14.60, "アメリカ合衆国", "l"),
      mapCity("ホノルル", -157.86, 21.31, "アメリカ合衆国", "r"),
      mapCity("ベオグラード", 20.46, 44.79, null, "r"),
    ],
  },
};

export const IMPERIALISM_BLURB = {
  "イギリス": "「世界の工場」として繁栄し、インド・カナダ・オーストラリア・アフリカ各地に植民地を持つ世界最大の帝国となった。「日の沈まぬ帝国」と呼ばれ、海軍力で世界の海を支配した。",
  "フランス": "1870年の普仏戦争に敗れて第三共和政となった。アフリカ北西部からサハラ以南、インドシナ、マダガスカルに及ぶ、イギリスに次ぐ植民地帝国を築いた。",
  "ドイツ帝国": "1871年にプロイセン王を皇帝として成立した。急速な工業化で世界有数の工業国となり、遅れてアフリカや太平洋に植民地を獲得したが、第一次世界大戦に敗れて帝政は崩壊した。",
  "ロシア帝国": "ヨーロッパからシベリア・中央アジアにまたがる世界最大の領土を持つ国。南下政策を進めてバルカン半島や東アジアで他国と衝突し、第一次世界大戦中の革命で帝政が倒れた。",
  "アメリカ合衆国": "南北戦争後に急速に工業化し、19世紀末には世界最大の工業国となった。カリブ海と太平洋に進出し、第一次世界大戦を経て世界最大の債権国となった。",
  "オーストリア＝ハンガリー帝国": "1867年にハンガリーに大幅な自治を認めて成立した二重帝国。多くの民族をかかえ、バルカン半島への進出をめぐってセルビアやロシアと対立した。",
  "オスマン帝国": "「瀕死の病人」と呼ばれ、列強の圧力とバルカン諸民族の独立で領土を失い続けた。近代化と立憲政治を求める改革が繰り返された。",
  "日本": "明治維新で近代国家の建設を進め、日清・日露の二つの戦争に勝利して台湾や朝鮮を植民地とし、アジアで唯一の帝国主義国となった。",
  "清": "満州人が建てた中国最後の王朝。アヘン戦争以来、列強の侵略で半植民地化が進み、1912年に滅亡して中華民国が成立した。",
};

const IMPERIALISM_SEA_LABELS = RENAISSANCE_SEA_LABELS.filter((s) => s.name !== "シチリア島").concat(
  [["日本海", 134.0, 40.0, 5], ["黄海", 123.5, 36.0, 4.5], ["南シナ海", 114.0, 14.0, 6], ["北極海", 60.0, 78.0, 8]].map(([name, lon, lat, size]) => {
    const [x, y] = lonLatToXY(lon, lat);
    return { name, x, y, size };
  }),
);

// 1885・1900・1914年（帝国主義と二つの大戦の区分のうち1918年まで）
export const IMPERIALISM_MAP = snapshotMapPeriod(IMPERIALISM_SNAPSHOTS, { geoPrefix: "imp",
  rivers: RIVERS, seaLabels: IMPERIALISM_SEA_LABELS, blurb: IMPERIALISM_BLURB,
});

// 各時代のカード：ヨーロッパ・中東などのカードと、東アジア・南アジアのカード（asiaCards.js）を年代順に並べる
const byYear = (...lists) => lists.flat().map((c, i) => [c, i]).sort((a, b) => a[0].year - b[0].year || a[1] - b[1]).map(([c]) => c);

export const ERAS_DATA = {
  "ancient-mediterranean": {
    id: "ancient-mediterranean",
    title: "古代の諸文明と帝国",
    period: "古代（オリエント・地中海・アジア）",
    // 地図では「古代文明の成立と地域世界」（前3000〜前500年）と「古代帝国の時代」（前500〜500年）の
    // 2つの時代区分にまたがるため、配列で両方に紐づける
    mapPeriodId: ["ancient-civilizations", "ancient-empires"],
    defaultMapYear: -490,
    cards: byYear(ANCIENT_CARDS, ASIA_ANCIENT_CARDS),
    // 古代の時代区分の勢力ポリゴン・都市データは未作成（地図タブでは「準備中」表示）。
    // 作成する際は ANCIENT_CARDS の region と同じ勢力IDを付けること
    mapData: {
      years: [-1750, -490, -27, 117],
      landPath: WORLD_LAND_PATH,
    }
  },
  "medieval-europe": {
    id: "medieval-europe",
    title: "中世の世界",
    period: "中世（ヨーロッパ・イスラーム・アジア）",
    // 地図では「中世①」（500〜1000年）と「中世②」（1000〜1500年）の2区分にまたがる。
    // 中世②の1450年以降は大航海時代・ルネサンス期が受け持つため、yearRange で500〜1449年を担当する
    mapPeriodId: ["medieval-1", "medieval-2"],
    yearRange: [500, 1449],
    defaultMapYear: 1095,
    cards: byYear(MEDIEVAL_CARDS, ASIA_MEDIEVAL_CARDS),
    // 勢力図・都市データは IMPERIALISM_MAP（地図タブの「帝国主義と二つの大戦」区分のうち1918年まで）。
    // 作成する際は MEDIEVAL_CARDS の region と同じ勢力IDを付けること
    mapData: {
      years: [800, 1095, 1348],
      landPath: WORLD_LAND_PATH,
    }
  },
  "renaissance-discovery": {
    id: "renaissance-discovery",
    title: "大航海時代・ルネサンス・宗教改革",
    period: "近世（大航海時代・ルネサンス・宗教改革）",
    // 地図では「中世②」（1000〜1500年）と「大航海時代・近世」（1500〜1789年）の2区分にまたがる。
    // 前者は中世ヨーロッパ（〜1449年）、後者は三十年戦争（1600年〜）と共有するため、yearRange で1450〜1599年だけを受け持つ
    // （1450年は中世②区分でルネサンス期の勢力図が始まる年）
    mapPeriodId: ["medieval-2", "early-modern"],
    yearRange: [1450, 1599],
    defaultMapYear: 1517,
    cards: byYear(RENAISSANCE_CARDS, ASIA_RENAISSANCE_CARDS),
    // 勢力図・都市データは IMPERIALISM_MAP（地図タブの「帝国主義と二つの大戦」区分のうち1918年まで）。
    // 作成する際は RENAISSANCE_CARDS の region と同じ勢力IDを付けること
    mapData: {
      years: [1492, 1517, 1555],
      landPath: WORLD_LAND_PATH,
    }
  },
  "absolutism": {
    id: "absolutism",
    title: "絶対王政と主権国家体制",
    period: "近世（絶対王政・主権国家体制）",
    mapPeriodId: "early-modern", // 地図タブの時代区分（ERA_PERIODS）との対応キー
    yearRange: [1600, 1789], // 同じ時代区分を「大航海時代・ルネサンス・宗教改革」と分け合うため、受け持つ年の範囲
    defaultMapYear: 1648, // 地図タブを開いたときの初期年代
    cards: byYear(ABSOLUTISM_CARDS, ASIA_ABSOLUTISM_CARDS),
    // 勢力図は ABSOLUTISM_MAP（1648・1715・1772年）。App.jsx の ERA_PERIODS で大航海時代・近世区分の1600年以降に割り当てている
    mapData: {
      years: [1648, 1715, 1772],
      landPath: WORLD_LAND_PATH,
    }
  },
  "french-revolution": {
    id: "french-revolution",
    title: "市民革命と国民国家",
    period: "近代（市民革命と国民国家）",
    mapPeriodId: "revolutions",
    defaultMapYear: 1815,
    cards: byYear(FRENCH_REVOLUTION_CARDS, ASIA_REVOLUTION_CARDS),
    // 勢力ポリゴン・首都・河川・解説は、geo-frameworkが App.jsx の GEO_FRAMEWORK_DATA:revolutions ブロックへ
    // 自動生成し、地図の時代区分 "revolutions"（mapPeriodId）として保持している。ここには年代とベースマップのみ持つ
    mapData: {
      years: [1812, 1815, 1871],
      landPath: WORLD_LAND_PATH,
    }
  },
  "imperialism": {
    id: "imperialism",
    title: "帝国主義と世界大戦",
    period: "近代（帝国主義と世界大戦）",
    // 地図の時代区分「帝国主義と二つの大戦」（1870〜1945年）のうち1918年までを受け持つ。
    // 1870・1871年は直前の区分「市民革命と国民国家」（〜1871年）が先に一致するため、シークバー上では実質1872年から
    mapPeriodId: "imperialism-wars",
    yearRange: [1870, 1918],
    defaultMapYear: 1914,
    cards: byYear(IMPERIALISM_CARDS, ASIA_IMPERIALISM_CARDS),
    // 勢力図・都市データは IMPERIALISM_MAP（地図タブの「帝国主義と二つの大戦」区分のうち1918年まで）。
    // 作成する際は IMPERIALISM_CARDS の region と同じ勢力IDを付けること
    mapData: {
      years: [1885, 1900, 1914],
      landPath: WORLD_LAND_PATH,
    }
  },

};