// 各時代・各年代の勢力の輪郭を、現代の国・州・県の組み合わせで定義する（キーは「時代略号+年/勢力ID」、背景は「…/bg:名前」）。
// 時代略号：anc（古代）、med（中世）、ren（大航海時代・ルネサンス）、abs（絶対王政）、rev（市民革命）、imp（帝国主義）。
// 国境が現代の州・県の途中を通る場所は、経緯度の多角形（下の M_…）で切り分け、両隣の勢力で同じ多角形を使う。
// 学習用の歴史地図としての精度（主要な国境・海岸線・半島・島の再現）を目標とし、細かな飛び地や係争地は省略している。

// ---------------------------------------------------------------------------
// 組み立て用の部品
// ---------------------------------------------------------------------------
const p = (poly, ...of) => ({ poly, of });
const FRA = "FRA[-6,41,10,52]";
const ESP = "ESP[-10,36.1,5,44]";
const ESP_CANARY = "ESP[-19,27,-13,30]";
const PRT = "PRT[-10,36,-6,43]";
const NLD = "NLD[3,50,8,54]";
const DNK = "DNK";
const EGY = "EGY";

const f = (...names) => names.map((n) => `FRA/${n}`);
const it = (...regions) => regions.map((r) => `ITA/region:${r}`);
const de = (...names) => names.map((n) => `DEU/${n}`);
const pl = (...names) => names.map((n) => `POL/${n}`);
const tr = (...names) => names.map((n) => `TUR/${n}`);
const gr = (...names) => names.map((n) => `GRC/${n}`);
const ua = (...names) => names.map((n) => `UKR/${n}`);
const ru = (...names) => names.map((n) => `RUS/${n}`);
const ro = (...names) => names.map((n) => `ROU/${n}`);
const hr = (...names) => names.map((n) => `HRV/${n}`);
const us = (...names) => names.map((n) => `USA/${n}`);
const ca = (...names) => names.map((n) => `CAN/${n}`);
const es = (...names) => names.map((n) => `ESP/${n}`);
const by = (...names) => names.map((n) => `BLR/${n}`);
const bel = (...names) => names.map((n) => `BEL/${n}`);
const itp = (...names) => names.map((n) => `ITA/${n}`);

// フランス
const ALSACE = f("Bas-Rhin", "Haute-Rhin");
const ALSACE_LORRAINE = [...ALSACE, "FRA/Moselle"];
const LORRAINE = f("Meurthe-et-Moselle", "Vosges", "Moselle");
const FRANCHE_COMTE = f("Doubs", "Jura", "Haute-Saône", "Territoire de Belfort");
const SAVOY = f("Savoie", "Haute-Savoie");
const NICE = f("Alpes-Maritimes");
const ROUSSILLON = f("Pyrénées-Orientales");
const SEPTIMANIA = f("Pyrénées-Orientales", "Aude", "Hérault", "Gard");
const BRITTANY_WEST = f("Finistère", "Morbihan", "Côtes-d'Armor");
const NORD_ARTOIS = f("Nord", "Pas-de-Calais");
const BURGUNDY_ARLES = [...f("Ain", "Isère", "Drôme", "Hautes-Alpes", "Alpes-de-Haute-Provence", "Vaucluse", "Bouches-du-Rhône", "Var", "Ardèche", "Rhône", "Loire"), ...SAVOY, ...NICE];
const DAUPHINE = f("Isère", "Drôme", "Hautes-Alpes");
const AQUITAINE_1204 = f("Gironde", "Landes", "Pyrénées-Atlantiques", "Lot-et-Garonne", "Dordogne", "Charente", "Charente-Maritime", "Deux-Sèvres", "Vienne", "Vendée");
const AQUITAINE_1360 = [...AQUITAINE_1204, ...f("Gers", "Hautes-Pyrénées", "Lot", "Aveyron", "Tarn-et-Garonne", "Haute-Vienne", "Corrèze", "Creuse")];
const FLANDERS = ["FRA/Nord", ...bel("West Flanders", "East Flanders")];
const ZEELAND_FLANDERS = p([[3.3, 51.42], [3.6, 51.45], [3.9, 51.4], [4.25, 51.38], [4.3, 51.2], [3.3, 51.2]], "NLD/Zeeland"); // スヘルデ川以南
// イギリス
const SCOTLAND = ["GBR/region:Eastern", "GBR/region:South Western", "GBR/region:Highlands and Islands", "GBR/region:North Eastern"];
const WALES = ["GBR/region:West Wales and the Valleys", "GBR/region:East Wales"];
const N_IRELAND = ["GBR/region:Northern Ireland"];
const ENGLAND = { add: ["GBR"], sub: [...SCOTLAND, ...WALES, ...N_IRELAND] };
// イタリア
const LOMBARDY = it("Lombardia");
const VENETO = it("Veneto");
const MILAN_CORE = [...itp("Milano", "Pavia", "Lodi", "Cremona", "Como", "Varese", "Lecco", "Monza e Brianza", "Novara", "Verbano-Cusio-Ossola", "Alessandria")];
const PARMA_PIACENZA = itp("Parma", "Piacenza");
const VENICE_TERRAFERMA = [...VENETO, ...itp("Udine", "Pordenone", "Bergamo", "Brescia")];
const VENICE_DALMATIA = hr("Istarska", "Zadarska", "Šibensko-Kninska", "Splitsko-Dalmatinska");
const FLORENCE = itp("Firenze", "Prato", "Pistoia", "Arezzo", "Pisa", "Livorno");
const PAPAL = [...it("Lazio", "Umbria", "Marche"), ...itp("Ravenna", "Forlì-Cesena", "Rimini", "Bologna", "Ferrara")];
const PAPAL_1492 = [...it("Lazio", "Umbria", "Marche"), ...itp("Ravenna", "Forlì-Cesena", "Rimini")];
const NAPLES = it("Campania", "Molise", "Abruzzo", "Apulia", "Basilicata", "Calabria");
const SICILY = it("Sicily");
const SARDINIA = it("Sardegna");
const CORSICA = f("Haute-Corse", "Corse-du-Sud");
const TRENTINO_TRIESTE = [...it("Trentino-Alto Adige"), ...itp("Trieste", "Gorizia")];
// ドイツ・中欧
const LEFT_RHINE_RLP = p([[6.0, 48.9], [8.2, 48.97], [8.4, 49.25], [8.45, 49.6], [8.3, 50.0], [7.9, 49.98], [7.75, 50.15], [7.6, 50.37], [7.4, 50.5], [7.2, 50.65], [6.0, 50.65]], "DEU/Rheinland-Pfalz");
const LEFT_RHINE_NRW = p([[5.8, 50.3], [7.25, 50.55], [7.1, 50.75], [6.97, 50.95], [6.77, 51.25], [6.75, 51.45], [6.6, 51.7], [6.15, 51.9], [5.8, 51.9]], "DEU/Nordrhein-Westfalen");
const LEFT_RHINE = [LEFT_RHINE_RLP, LEFT_RHINE_NRW, "DEU/Saarland"];
// 1815年以降のラインラント＝プファルツ：南東部（プファルツ・ラインヘッセン）はバイエルン・ヘッセン、北部はプロイセン
const NAHE_LINE = [[8.3, 50.05], [7.9, 49.97], [7.86, 49.84], [7.68, 49.8], [7.46, 49.79], [7.31, 49.71], [7.17, 49.6], [6.9, 49.5], [6.4, 49.47], [6.0, 49.45]];
const PFALZ_RHEINHESSEN = p([[6.0, 48.9], [8.3, 48.9], [8.5, 49.6], ...NAHE_LINE], "DEU/Rheinland-Pfalz");
const RLP_NORTH = p([[6.0, 50.95], [8.4, 50.95], ...NAHE_LINE], "DEU/Rheinland-Pfalz");
const RAETIA = p([[9.5, 48.95], [11.0, 49.05], [12.2, 48.95], [13.0, 48.7], [13.9, 48.5], [13.9, 47.2], [9.5, 47.2]], "DEU/Bayern", "DEU/Baden-Württemberg");
const DANUBE_SOUTH_BAVARIA = p([[9.5, 48.45], [10.9, 48.75], [12.1, 48.95], [13.0, 48.7], [13.9, 48.5], [13.9, 47.2], [9.5, 47.2]], "DEU/Bayern", "DEU/Baden-Württemberg");
const AUT_NORTH_OF_DANUBE = p([[13.7, 48.6], [13.8, 48.27], [14.5, 48.23], [15.0, 48.38], [15.6, 48.36], [16.2, 48.24], [16.95, 48.13], [17.1, 48.6], [16.9, 49.1], [13.7, 49.1]], "AUT");
// フォアポンメルン（メクレンブルクとの境はレックニッツ川〜トレーベル川付近）と、そのうちペーネ川以北
const VORPOMMERN_WEST_EDGE = [[12.4, 54.25], [12.6, 54.12], [12.75, 53.98], [12.95, 53.9], [13.15, 53.75], [13.3, 53.6], [13.4, 53.45], [13.55, 53.3]];
const VORPOMMERN = p([[12.4, 54.75], [14.6, 54.75], [14.6, 53.3], ...VORPOMMERN_WEST_EDGE.slice().reverse()], "DEU/Mecklenburg-Vorpommern");
const VORPOMMERN_N_PEENE = p([[12.4, 54.75], [14.6, 54.75], [14.2, 54.1], [14.0, 54.05], [13.85, 53.92], [13.7, 53.86], [13.45, 53.85], [13.2, 53.9], [12.95, 53.9], [12.75, 53.98], [12.6, 54.12], [12.4, 54.25]], "DEU/Mecklenburg-Vorpommern");
const STETTIN = p([[14.1, 54.1], [14.75, 54.05], [14.8, 53.85], [14.75, 53.6], [14.7, 53.4], [14.6, 53.2], [14.1, 53.2]], "POL/West Pomeranian"); // オーデル川河口の西岸
const UPPER_LUSATIA_PRUSSIAN = p([[13.8, 51.6], [14.3, 51.55], [14.75, 51.6], [15.05, 51.3], [15.0, 51.05], [14.8, 51.1], [14.5, 51.2], [14.2, 51.25], [13.95, 51.4]], "DEU/Sachsen");
const BREMEN_VERDEN = p([[8.5, 53.6], [8.55, 53.3], [8.75, 53.1], [9.05, 52.95], [9.4, 52.95], [9.75, 53.2], [10.0, 53.45], [9.8, 53.6], [9.3, 53.85], [8.7, 53.9]], "DEU/Niedersachsen"); // ヴェーザー川とエルベ川の河口の間
const EAST_FRISIA = p([[6.9, 53.75], [7.6, 53.8], [8.05, 53.7], [8.1, 53.45], [7.85, 53.25], [7.5, 53.15], [7.2, 53.2], [6.9, 53.3]], "DEU/Niedersachsen");
const CLEVES_MARK = p([[5.95, 51.85], [6.4, 51.9], [6.8, 51.75], [7.3, 51.65], [7.75, 51.6], [7.95, 51.4], [7.75, 51.2], [7.3, 51.25], [6.9, 51.35], [6.5, 51.45], [6.15, 51.55]], "DEU/Nordrhein-Westfalen");
const NW_GERMANY_1810 = p([[5.9, 54.3], [11.0, 54.3], [10.8, 53.9], [10.4, 53.4], [9.9, 53.1], [9.3, 52.8], [8.7, 52.6], [8.0, 52.45], [7.4, 52.1], [6.6, 51.7], [5.9, 51.7]], "DEU/Niedersachsen", "DEU/Schleswig-Holstein", "DEU/Nordrhein-Westfalen");
const JERICHOW_1812 = p([[11.65, 52.13], [11.97, 52.54], [12.07, 52.83], [12.3, 52.9], [12.6, 52.5], [12.4, 52.1], [12.25, 51.95], [11.9, 51.98]], "DEU/Sachsen-Anhalt"); // エルベ川以東（1807年以降もプロイセン）
const NETZE_DISTRICT = p([[17.2, 53.7], [19.8, 53.7], [19.8, 53.25], [19.4, 53.15], [18.8, 53.1], [18.4, 53.05], [18.0, 53.1], [17.6, 53.05], [17.2, 53.0]], "POL/Kuyavian-Pomeranian"); // ノテッチ川以北（1772年プロイセン領）
const NORTH_SCHLESWIG = p([[7.9, 54.8], [7.9, 55.47], [8.7, 55.5], [9.3, 55.52], [9.75, 55.42], [9.72, 55.15], [10.1, 55.08], [10.05, 54.82]], "DNK/Syddanmark");
// ポーランド
const WARMIA_ELBLAG = p([[19.0, 54.45], [19.6, 54.45], [20.0, 54.4], [20.4, 54.38], [20.8, 54.3], [21.0, 54.1], [20.9, 53.85], [20.6, 53.6], [20.2, 53.5], [19.8, 53.45], [19.5, 53.5], [19.2, 53.65], [19.05, 54.0]], "POL/Warmian-Masurian");
// 上シレジア（現シロンスク県）の三国国境（1815〜1914年）：プロイセン／ロシア／オーストリア
const PR_RU_LINE = [[18.6, 51.25], [18.7, 50.95], [18.85, 50.75], [19.0, 50.55], [19.1, 50.4], [19.15, 50.3]];
const SILESIA_PRUSSIAN = p([[17.9, 51.25], ...PR_RU_LINE, [19.1, 50.15], [19.0, 50.05], [18.8, 50.0], [18.6, 49.95], [17.9, 49.95]], "POL/Silesian");
const SILESIA_RUSSIAN = p([[19.7, 51.25], [19.7, 50.25], [19.45, 50.2], [19.25, 50.27], ...PR_RU_LINE.slice().reverse()], "POL/Silesian");
// マウォポルスカ県のうちヴィスワ川以北（ロシア領ポーランド）。南はガリツィア（オーストリア領）
const LESSER_POLAND_RUSSIAN = p([[19.2, 50.75], [21.1, 50.75], [20.9, 50.3], [20.72, 50.24], [20.45, 50.12], [20.2, 50.03], [19.94, 50.06], [19.7, 50.12], [19.45, 50.2], [19.25, 50.27]], "POL/Lesser Poland");
const GALICIA_WEST = [{ add: ["POL/Lesser Poland"], sub: [LESSER_POLAND_RUSSIAN] }];
const SILESIA_AUSTRIAN = { add: ["POL/Silesian"], sub: [SILESIA_PRUSSIAN, SILESIA_RUSSIAN] }; // チェシン（テッシェン）周辺
const CONGRESS_POLAND = [...pl("Masovian", "Łódź", "Lublin", "Świętokrzyskie", "Podlachian"), SILESIA_RUSSIAN, LESSER_POLAND_RUSSIAN];
const PRUSSIAN_POLAND_1815 = pl("West Pomeranian", "Pomeranian", "Lubusz", "Lower Silesian", "Opole", "Greater Poland", "Kuyavian-Pomeranian", "Warmian-Masurian");
const GALICIA_EAST = ua("L'viv", "Ivano-Frankivs'k", "Ternopil'");
const GALICIA_1772 = [...pl("Subcarpathian"), ...GALICIA_WEST, ...GALICIA_EAST];
// バルカン・ハンガリー
const TRANSDANUBIA = ["HUN/region:Western Transdanubia", "HUN/region:Central Transdanubia", "HUN/region:Southern Transdanubia", "HUN/Budapest", "HUN/Érd"];
const TRANSYLVANIA = ro("Cluj", "Alba", "Sibiu", "Brasov", "Mures", "Harghita", "Covasna", "Bistrita-Nasaud", "Salaj", "Hunedoara");
const PARTIUM = ro("Maramures", "Satu Mare", "Bihor", "Arad");
const BANAT_RO = ro("Timis", "Caras-Severin");
const VOJVODINA = ["SRB/Severno-Backi", "SRB/Zapadno-Backi", "SRB/Južno-Backi", "SRB/Severno-Banatski", "SRB/Srednje-Banatski", "SRB/Južno-Banatski", "SRB/Sremski"];
const BUKOVINA = ["UKR/Chernivtsi", "ROU/Suceava"];
const WALLACHIA = ro("Mehedinti", "Dolj", "Olt", "Gorj", "Vâlcea", "Arges", "Teleorman", "Giurgiu", "Dâmbovita", "Prahova", "Ilfov", "Bucharest", "Buzau", "Ialomita", "Calarasi", "Braila");
const MOLDAVIA = ro("Botosani", "Iasi", "Vaslui", "Galati", "Neamt", "Bacau", "Vrancea");
const DOBRUJA = ro("Tulcea", "Constanta");
const SLAVONIA = hr("Osjecko-Baranjska", "Vukovarsko-Srijemska", "Brodsko-Posavska", "Viroviticko-Podravska");
const SANDZAK = ["SRB/Raški", "MNE/Pljevlja", "MNE/Bijelo Polje", "MNE/Berane", "MNE/Rožaje", "MNE/Plav"];
const GREEK_MACEDONIA_THRACE = gr("Dytiki Makedonia", "Kentriki Makedonia", "Anatoliki Makedonia kai Thraki", "Ayion Oros");
const WESTERN_THRACE = p([[24.8, 40.6], [24.75, 40.88], [24.7, 41.05], [24.55, 41.2], [24.35, 41.35], [24.1, 41.55], [24.1, 41.8], [26.8, 42.0], [26.8, 40.6]], "GRC/Anatoliki Makedonia kai Thraki"); // ネストス川以東
const SOUTH_GREECE = gr("Peloponnisos", "Attiki", "Stereá Elláda", "Dytiki Ellada", "Notio Aigaio", "Kriti", "Ionioi Nisoi", "Voreio Aigaio");
const EURO_TURKEY = tr("Edirne", "Kirklareli", "Tekirdag");
// ロシア・東欧
const RUS_EUROPE = "RUS[19,40,61,82]";
const UKR_LEFT_BANK = ua("Chernihiv", "Sumy", "Poltava", "Kharkiv", "Kiev City");
const UKR_STEPPE = [...ua("Odessa", "Mykolayiv", "Kherson", "Zaporizhzhya", "Dnipropetrovs'k", "Kirovohrad", "Donets'k", "Luhans'k"), "RUS/Crimea"];
const RUS_STEPPE_SOUTH = ru("Krasnodar", "Adygey", "Karachay-Cherkess", "Kabardin-Balkar", "North Ossetia", "Ingush", "Chechnya", "Dagestan", "Stavropol'", "Kalmyk", "Rostov", "Sevastopol", "Crimea");
const SAKHALIN_ISLAND = p([[141.0, 54.5], [145.6, 54.5], [145.6, 45.8], [141.0, 45.8]], "RUS/Sakhalin");
const SOUTH_SAKHALIN = p([[141.0, 50.0], [145.6, 50.0], [145.6, 45.8], [141.0, 45.8]], "RUS/Sakhalin");
const KURILS = { poly: [[145.6, 51.5], [157.5, 51.5], [157.5, 43.3], [145.6, 43.3]], of: ["RUS/Sakhalin"] };
const KWANTUNG = p([[120.9, 39.45], [122.4, 39.45], [122.4, 38.6], [120.9, 38.6]], "CHN/Liaoning");
const JIAOZHOU = p([[119.9, 36.45], [120.65, 36.45], [120.65, 35.85], [119.9, 35.85]], "CHN/Shandong");
const WEIHAIWEI = p([[121.8, 37.6], [122.7, 37.6], [122.7, 37.0], [121.8, 37.0]], "CHN/Shandong");
const SIBERIA_1648 = { add: ["RUS[60,45,141,82]"], sub: ru("Buryat", "Chita", "Amur", "Yevrey", "Primor'ye", "Tuva", "Gorno-Altay", "Altay", "Kemerovo", "Khakass") };
// 中東・北アフリカ
const NILE_VALLEY = [[32.85, 23.9], [32.75, 24.5], [32.65, 25.3], [32.3, 25.75], [32.0, 26.0], [31.6, 26.4], [31.15, 27.0], [30.8, 27.5], [30.6, 28.0], [30.55, 28.6], [30.25, 29.0], [30.3, 29.55], [30.75, 29.8], [30.55, 30.2], [29.7, 30.75], [29.7, 31.3], [30.5, 31.8], [31.9, 31.8], [32.55, 31.4], [32.4, 30.6], [31.55, 30.1], [31.45, 29.6], [31.3, 29.2], [31.05, 28.5], [31.15, 27.9], [31.5, 27.2], [31.95, 26.6], [32.65, 26.2], [33.0, 25.7], [33.05, 25.0], [33.1, 24.4], [33.05, 23.9]];
const EGYPT_NILE = p(NILE_VALLEY, EGY);
// 帝国の属州としてのエジプト：ナイル川流域と、レヴァントへ通じるシナイ半島北岸
const EGYPT_PROVINCE = [EGYPT_NILE, p([[32.3, 31.4], [34.25, 31.35], [34.3, 30.6], [32.6, 30.5]], "EGY/Shamal Sina'", "EGY/Al Isma`iliyah", "EGY/Bur Sa`id", "EGY/As Suways")];
const SUMER = p([[44.0, 33.4], [44.8, 33.5], [45.5, 33.0], [46.6, 32.3], [47.6, 31.5], [48.6, 30.2], [47.8, 29.7], [47.0, 30.3], [46.2, 30.6], [45.2, 31.3], [44.4, 31.9], [43.9, 32.6]], "IRQ", "KWT");
const BABYLONIA_1750 = p([[40.4, 35.2], [41.5, 34.2], [42.5, 33.9], [43.5, 34.7], [43.1, 36.3], [43.8, 36.9], [44.6, 36.5], [45.4, 35.1], [46.2, 33.8], [47.4, 32.3], [48.6, 30.2], [47.8, 29.7], [46.4, 30.4], [44.8, 31.3], [43.6, 32.1], [42.3, 33.3], [41.0, 34.1], [40.2, 34.6]], "IRQ", "SYR", "KWT");
const FERTILE_CRESCENT = [[35.0, 29.4], [34.2, 31.3], [34.9, 33.1], [35.7, 35.2], [36.1, 36.7], [37.5, 37.1], [39.5, 37.0], [42.0, 37.3], [43.4, 37.3], [44.6, 36.6], [45.5, 35.2], [46.3, 33.7], [47.6, 32.1], [48.6, 30.2], [47.7, 29.5], [46.3, 30.3], [44.5, 31.1], [42.6, 32.2], [40.5, 33.5], [38.6, 33.8], [37.5, 32.9], [36.8, 31.4], [36.2, 30.0], [35.6, 29.3]];
const LEVANT_MESO_COUNTRIES = ["IRQ", "SYR", "LBN", "ISR", "PSX", "JOR", "KWT", "TUR/Sanliurfa", "TUR/Mardin", "TUR/Gaziantep", "TUR/Kilis", "TUR/Hatay"];
const NAFRICA_ROMAN = [[-7.5, 33.9], [-4.5, 33.9], [-2.0, 34.5], [0.0, 34.9], [2.0, 35.0], [4.0, 35.0], [5.5, 34.6], [6.5, 34.6], [7.5, 34.3], [8.5, 33.4], [9.3, 32.4], [10.2, 31.7], [11.5, 31.2], [13.0, 31.4], [15.0, 31.0], [16.5, 30.8], [18.5, 30.3], [20.0, 30.6], [21.0, 30.8], [23.0, 31.4], [25.2, 31.5], [25.2, 34.0], [-7.5, 37.5]];
const NAFRICA_COUNTRIES = ["MAR", "DZA", "TUN", "LBY"];
const ROMAN_AFRICA_117 = p(NAFRICA_ROMAN, ...NAFRICA_COUNTRIES);
// 中世イスラーム諸王朝の北アフリカ：地中海・大西洋岸からサハラ北縁まで（オアシス都市の連なり）と、ナイル川流域
const MAGHREB_BELT = [[-13.5, 27.6], [-11.0, 28.4], [-9.0, 29.2], [-6.5, 29.8], [-4.5, 30.6], [-2.5, 31.3], [0.0, 31.8], [2.5, 32.3], [4.5, 32.2], [6.5, 31.8], [8.5, 31.0], [10.0, 30.4], [12.0, 30.6], [14.0, 30.3], [16.0, 30.0], [18.0, 29.6], [20.0, 29.8], [22.0, 30.4], [24.5, 30.7], [27.0, 30.7], [29.6, 30.6], [29.6, 33.0], [-13.5, 37.5]];
const ISLAMIC_NAFRICA = [p(MAGHREB_BELT, ...NAFRICA_COUNTRIES, EGY), ...EGYPT_PROVINCE];
const OTTOMAN_EGYPT = [p(MAGHREB_BELT, EGY), ...EGYPT_PROVINCE]; // 地中海沿岸とナイル川流域
const MAURETANIA_TINGITANA_EDGE = [[-7.5, 34.6], [-5.6, 34.0], [-4.3, 34.6], [-3.0, 35.0], [-2.0, 35.3], [-2.0, 37.0], [-7.5, 37.0]];
const ROMAN_MOROCCO = p(MAURETANIA_TINGITANA_EDGE, "MAR");
const ROMAN_AFRICA_NO_MAR = p(NAFRICA_ROMAN, "DZA", "TUN", "LBY");
const AFRICA_44BC = p([[5.5, 37.5], [5.5, 35.4], [7.0, 35.2], [8.3, 34.6], [9.5, 34.6], [10.3, 34.9], [11.5, 34.9], [11.5, 37.5]], "DZA", "TUN");
const CYRENAICA = p([[19.0, 33.5], [19.0, 30.2], [21.0, 30.8], [23.0, 31.4], [25.2, 31.5], [25.2, 33.5]], "LBY");
const TRIPOLITANIA = p([[11.0, 34.0], [11.0, 31.5], [13.0, 31.4], [15.0, 31.0], [16.5, 30.8], [18.5, 30.3], [19.0, 30.2], [19.0, 34.0]], "LBY");
const CARTHAGE_COAST = p([[-2.0, 35.3], [2.0, 36.0], [5.0, 36.3], [8.0, 35.9], [8.6, 35.0], [9.6, 34.0], [10.2, 33.4], [11.5, 32.6], [13.5, 32.3], [15.5, 31.7], [15.5, 33.5], [11.6, 37.6], [-2.0, 37.6]], "DZA", "TUN", "LBY");
const DESERT_EDGE_LEVANT = p([[34.0, 29.0], [34.2, 31.4], [34.9, 33.2], [35.6, 35.3], [36.0, 36.8], [37.4, 37.2], [38.6, 36.9], [39.0, 36.2], [38.2, 35.3], [37.4, 33.8], [36.9, 32.4], [36.4, 31.0], [35.9, 29.8], [35.1, 28.9]], "SYR", "LBN", "ISR", "PSX", "JOR", "TUR/Hatay");
const CRUSADER_PALESTINE_INLAND = p([[34.8, 31.0], [35.15, 31.0], [35.4, 31.2], [35.55, 31.6], [35.55, 32.0], [35.6, 32.4], [34.95, 32.4]], "ISR", "PSX");
const CRUSADER_GALILEE = p([[34.9, 32.4], [35.6, 32.4], [35.65, 32.75], [35.62, 33.05], [35.5, 33.3], [35.1, 33.3]], "ISR");
const CRUSADER_SYRIA_COAST = p([[35.6, 34.6], [36.1, 34.65], [36.3, 35.0], [36.4, 35.4], [36.6, 35.8], [36.2, 36.0], [35.8, 35.95], [35.6, 35.3]], "SYR");
const HEJAZ = ["SAU/Makkah", "SAU/Al Madinah", "SAU/Tabuk", "SAU/Al Bahah"];
const ARABIA = ["SAU", "YEM", "OMN", "ARE", "QAT", "BHR", "KWT"];
const ALGERIA_NORTH = p([[-2.2, 32.0], [3.0, 32.0], [9.0, 32.0], [9.0, 37.6], [-2.2, 37.6]], "DZA");
const ALGERIA_COAST = p([[-2.2, 34.6], [1.0, 35.2], [4.0, 35.6], [8.6, 35.6], [8.6, 37.6], [-2.2, 37.6]], "DZA");
const SPANISH_MOROCCO = ["MAR/Tanger - Tétouan", p([[-5.0, 35.4], [-2.9, 35.4], [-2.95, 35.05], [-3.3, 34.95], [-3.8, 35.0], [-4.3, 34.9], [-4.7, 35.0], [-5.0, 35.1]], "MAR/Taza - Al Hoceima - Taounate", "MAR/Oriental")]; // リーフ地方
// 東アジア・太平洋
const KOREA = ["KOR", "PRK"];
// ニューギニア島東部（パプアニューギニア）の北東半分と南東半分を分ける線
const GERMAN_NEW_GUINEA = [[140.9, -1.0], [157.0, -1.0], [157.0, -8.0], [146.8, -8.0], [141.0, -6.0]];
const PAPUA = [[141.0, -6.0], [146.8, -8.0], [157.0, -8.0], [157.0, -12.0], [141.0, -12.0]];
// アメリカ大陸
const MEXICO_CORE = "MEX[-118,14,-86,33]";
const SPANISH_SOUTH_AMERICA = ["COL", "VEN", "ECU", "PER", "BOL", "PRY", "CHL[-76,-38,-66,-17]", "ARG[-70,-38,-53,-21]"];
const CENTRAL_AMERICA = ["GTM", "HND", "SLV", "NIC", "CRI", "PAN"];
const THIRTEEN_COLONIES_1715 = us("Massachusetts", "Maine", "New Hampshire", "Rhode Island", "Connecticut", "New York", "New Jersey", "Pennsylvania", "Delaware", "Maryland", "Virginia", "North Carolina", "South Carolina");
const THIRTEEN_COLONIES_1772 = [...THIRTEEN_COLONIES_1715, ...us("Georgia", "Vermont")];
const NEW_FRANCE = p([[-80.0, 45.0], [-64.0, 45.0], [-64.0, 49.5], [-80.0, 49.5]], "CAN/Québec");
const QUEBEC_1763 = p([[-80.0, 45.0], [-60.0, 45.0], [-60.0, 52.0], [-80.0, 52.0]], "CAN/Québec");
const NEWFOUNDLAND = p([[-60.0, 46.5], [-52.0, 46.5], [-52.0, 51.7], [-55.4, 51.65], [-56.6, 51.4], [-57.4, 51.0], [-60.0, 50.0]], "CAN/Newfoundland and Labrador"); // ニューファンドランド島（ラブラドルを除く）
const LOUISIANA_WEST = us("Louisiana", "Arkansas", "Missouri", "Iowa", "Kansas", "Nebraska", "Oklahoma", "South Dakota", "North Dakota");

// 古代ローマの版図（117年）からの組み立て
const ROME_117_EUROPE = [
  "ITA", FRA, ESP, PRT, "BEL", "LUX", "CHE", "NLD/Zeeland", "NLD/Noord-Brabant", "NLD/Limburg", "NLD/Zuid-Holland", "NLD/Utrecht", "NLD/Gelderland",
  ...LEFT_RHINE, "DEU/Baden-Württemberg", RAETIA, "AUT", "SVN", "HRV", "BIH", "SRB", "KOS", "MNE", "MKD", "ALB", "GRC", "BGR", "MLT",
  ...TRANSDANUBIA, ...TRANSYLVANIA, ...BANAT_RO, ...ro("Mehedinti", "Dolj", "Olt", "Gorj", "Vâlcea"), ...DOBRUJA,
];

// ---------------------------------------------------------------------------
// 東アジア・南アジアの部品（フェーズ2）
// ---------------------------------------------------------------------------
const cn = (...names) => names.map((n) => `CHN/${n}`);
const ind = (...names) => names.map((n) => `IND/${n}`);
const jp = (...names) => names.map((n) => `JPN/${n}`);
const prk = (...names) => names.map((n) => `PRK/${n}`);
const af = (...names) => names.map((n) => `AFG/${n}`);
// 中国本土（華北・華中・華南）
const NORTH_CHINA = cn("Henan", "Hebei", "Beijing", "Tianjin", "Shandong", "Shanxi", "Shaanxi");
const CENTRAL_SOUTH_CHINA = cn("Hubei", "Hunan", "Jiangxi", "Anhui", "Jiangsu", "Shanghai", "Zhejiang", "Fujian", "Guangdong", "Guangxi", "Sichuan", "Chongqing");
const CHINA_PROPER = [...NORTH_CHINA, ...CENTRAL_SOUTH_CHINA, "CHN/Ningxia", "CHN/Guizhou", "CHN/Hainan"];
// ベトナム北部（紅河デルタ〜ゲアン付近。漢・唐の交州／安南）：省の境界をそのまま使う
const VIETNAM_NORTH = "VNM[102,18.3,109,24]";
// 淮河〜秦嶺の線：これより南が南宋、北が金（1142年の紹興の和議）
const HUAI_SOUTH = [[104.0, 33.0], [106.5, 33.2], [108.5, 33.0], [110.5, 33.3], [112.0, 32.7], [113.5, 32.4], [114.8, 32.2], [116.0, 32.5], [117.5, 33.0], [118.6, 33.3], [119.5, 33.7], [121.5, 33.7], [123.0, 25.0], [104.0, 25.0]];
const SOUTHERN_SONG = [p(HUAI_SOUTH, "CHN/Henan", "CHN/Anhui", "CHN/Jiangsu", "CHN/Shaanxi", "CHN/Gansu"), ...cn("Hubei", "Hunan", "Jiangxi", "Shanghai", "Zhejiang", "Fujian", "Guangdong", "Guangxi", "Sichuan", "Chongqing", "Hainan")];
// 燕雲十六州（現在の北京・天津・河北北部・山西北部）は遼の領土
const YANYUN_LINE = [[110.5, 39.4], [111.8, 39.2], [113.0, 39.0], [114.3, 38.9], [115.5, 38.85], [116.6, 38.7], [117.8, 38.9], [119.5, 39.4], [120.0, 42.5], [110.5, 42.5]];
const SONG_NORTH = { add: [...cn("Henan", "Hebei", "Shandong", "Shanxi", "Shaanxi")], sub: [p(YANYUN_LINE, "CHN/Hebei", "CHN/Shanxi")] };
const NORTHERN_SONG = [SONG_NORTH, ...cn("Hubei", "Hunan", "Jiangxi", "Anhui", "Jiangsu", "Shanghai", "Zhejiang", "Fujian", "Guangdong", "Guangxi", "Sichuan", "Chongqing", "Hainan")];
// 朝鮮半島：北朝鮮の道の境界で国境を表す（統一新羅は大同江以南＝黄海道・江原道まで、高麗は清川江以南＝平安南道まで、
// 14世紀には鴨緑江中流・咸鏡南道まで）
const KOREA_SOUTH_PRK = prk("Hwanghae-namdo", "Hwanghae-bukto", "Kangwŏn-do");
const UNIFIED_SILLA = ["KOR", ...KOREA_SOUTH_PRK];
const GORYEO = ["KOR", ...KOREA_SOUTH_PRK, ...prk("P'yŏngyang", "P'yŏngan-namdo")];
const GORYEO_1360 = [...GORYEO, ...prk("P'yŏngan-bukto", "Hamgyŏng-namdo")];
const KOREA_ALL = ["KOR", "PRK"];
// 日本列島：蝦夷地（北海道）と琉球（沖縄）を除く本州・四国・九州。東北北部の扱いで時代を分ける
const JAPAN_HONSHU_SOUTH = { add: ["JPN"], sub: jp("Hokkaidō", "Okinawa", "Aomori", "Iwate", "Akita") };
const JAPAN_MAIN = { add: ["JPN"], sub: jp("Hokkaidō", "Okinawa") };
const JAPAN_EDO = JAPAN_MAIN; // 蝦夷地（松前藩は渡島半島南端のみ）と琉球王国は含めない
const JAPAN_MODERN = { add: ["JPN"], sub: jp("Okinawa") };
// インダス文明の遺跡が分布する範囲を、州の境界で表す（シンド・パンジャーブ、インドのグジャラート・ハリヤーナーなど）
const INDUS = ["PAK/Sind", "PAK/Punjab", "PAK/F.C.T.", ...ind("Punjab", "Haryana", "Chandigarh", "Delhi", "Gujarat")];
// 殷の勢力範囲：黄河中・下流域（河南・河北・山東）
const SHANG = cn("Henan", "Hebei", "Shandong");
// 春秋時代の周王朝と諸侯の国々（黄河・長江下流域）
const ZHOU_STATES = [...NORTH_CHINA, ...cn("Hubei", "Anhui", "Jiangsu")];
// 秦の統一領域（前221年、南越の征服を含む）と漢（河西回廊・遼東・朝鮮北部・ベトナム北部を加える）
const QIN = [...NORTH_CHINA, ...CENTRAL_SOUTH_CHINA, "CHN/Ningxia", "CHN/Liaoning"];
const HAN = [...CHINA_PROPER, "CHN/Gansu", "CHN/Liaoning", "CHN/Yunnan", ...prk("P'yŏngan-namdo", "P'yŏngyang", "Hwanghae-namdo", "Hwanghae-bukto"), VIETNAM_NORTH];
// 唐（8世紀末）：安史の乱後、河西回廊は吐蕃に、雲南は南詔に、遼東は渤海などに失っている
const TANG_800 = [...CHINA_PROPER, VIETNAM_NORTH];
// 南アジア
const NORTHEAST_INDIA = ind("Assam", "Arunachal Pradesh", "Nagaland", "Manipur", "Mizoram", "Tripura", "Meghalaya", "Sikkim");
const SOUTH_INDIA_TIP = ind("Kerala", "Tamil Nadu", "Puducherry", "Lakshadweep");
const AFG_EAST = af("Kabul", "Kandahar", "Nangarhar", "Laghman", "Kunar", "Logar", "Ghazni", "Zabul", "Paktya", "Paktika", "Khost", "Kapisa", "Parwan", "Wardak", "Uruzgan", "Hilmand");
const MAURYA = [{ add: ["IND"], sub: [...SOUTH_INDIA_TIP, ...NORTHEAST_INDIA, "IND/Ladakh", "IND/Andaman and Nicobar"] }, { add: ["PAK"], sub: ["PAK/Northern Areas"] }, "BGD", ...AFG_EAST];
const KUSHAN = ["PAK", "AFG", "TJK", "KAS", ...ind("Punjab", "Haryana", "Delhi", "Chandigarh", "Himachal Pradesh", "Jammu and Kashmir", "Ladakh", "Uttarakhand", "Uttar Pradesh"), "UZB/Surkhandarya"];
const GUPTA = [...ind("Uttar Pradesh", "Bihar", "Jharkhand", "West Bengal", "Madhya Pradesh", "Delhi", "Haryana", "Chandigarh", "Punjab", "Uttarakhand", "Himachal Pradesh", "Rajasthan", "Gujarat", "Chhattisgarh", "Odisha"), "BGD/Rajshahi", "BGD/Rangpur", "BGD/Khulna", "BGD/Dhaka"];
const GOGURYEO_395 = [...prk("P'yŏngan-bukto", "P'yŏngan-namdo", "P'yŏngyang", "Chagang-do", "Ryanggang", "Hamgyŏng-namdo", "Hamgyŏng-bukto", "Rasŏn", "Hwanghae-bukto", "Kangwŏn-do"), "CHN/Jilin"]; // 4世紀末：朝鮮半島北部と中国東北部の南部
const DELHI_1204 = ["PAK/Punjab", "PAK/Sind", "PAK/F.C.T.", ...ind("Punjab", "Haryana", "Delhi", "Chandigarh", "Uttar Pradesh", "Bihar", "West Bengal"), "BGD/Rajshahi", "BGD/Rangpur"];
const DELHI_1360 = ["PAK/Punjab", "PAK/Sind", "PAK/F.C.T.", ...ind("Punjab", "Haryana", "Delhi", "Chandigarh", "Uttar Pradesh", "Bihar", "Rajasthan", "Gujarat", "Madhya Pradesh", "Uttarakhand")];
const MUGHAL_1555 = [...AFG_EAST.filter((s) => !s.includes("Kandahar") && !s.includes("Hilmand") && !s.includes("Zabul") && !s.includes("Uruzgan")), "PAK/Punjab", "PAK/K.P.", "PAK/F.C.T.", "PAK/F.A.T.A.", ...ind("Punjab", "Haryana", "Delhi", "Chandigarh", "Uttar Pradesh")];
const MUGHAL_1648 = [...AFG_EAST, { add: ["PAK"], sub: ["PAK/Northern Areas"] }, "KAS", "BGD", { add: ["IND"], sub: [...SOUTH_INDIA_TIP, ...NORTHEAST_INDIA, ...ind("Karnataka", "Andhra Pradesh", "Telangana", "Goa", "Andaman and Nicobar", "Ladakh")] }];
const MUGHAL_1715 = [...AFG_EAST, { add: ["PAK"], sub: ["PAK/Northern Areas"] }, "KAS", "BGD", { add: ["IND"], sub: [...ind("Kerala", "Lakshadweep", "Goa", "Andaman and Nicobar", "Ladakh"), ...NORTHEAST_INDIA] }];
const MUGHAL_1772 = ind("Delhi", "Haryana"); // 衰退してデリー周辺のみ
// 清：中国本土＋満州＋モンゴル。1648年は南部・西部の平定前、18世紀に新疆・チベット・台湾を加える。アムール川以北・沿海州は1858・60年にロシアへ
const QING_1648 = [...CHINA_PROPER.filter((s) => !s.includes("Guizhou") && !s.includes("Guangxi")), ...cn("Liaoning", "Jilin", "Heilongjiang", "Inner Mongol", "Gansu")];
const QING_AMUR = ru("Amur", "Yevrey", "Primor'ye");
const QING_1715 = ["CHN", "MNG", "TWN", ...QING_AMUR];
const QING_1715_SUB = cn("Xinjiang", "Xizang");
const QING_1772 = ["CHN", "MNG", "TWN", ...QING_AMUR, "RUS/Tuva"];
const QING_1871 = ["CHN", "MNG", "TWN", "RUS/Tuva"];
// 元（14世紀半ば）：中国・モンゴル高原・チベット・南シベリア。新疆はチャガタイ＝ハン国
const YUAN = [{ add: ["CHN"], sub: ["CHN/Xinjiang"] }, "MNG", ...ru("Tuva", "Buryat", "Chita")];
const MONGOL_1206 = ["MNG"];
// 明（15〜16世紀）：長城以南の中国本土に遼東・雲南・河西回廊東部を加える
const MING = [...CHINA_PROPER, "CHN/Liaoning", "CHN/Yunnan", "CHN/Gansu"];
// イギリス東インド会社が支配したインド（1812・1815年はマラーター・シク王国などを除く、1871年はパキスタン・ビルマ南部を含む）
const BRITISH_INDIA_1815 = [{ add: ["IND"], sub: [...ind("Punjab", "Himachal Pradesh", "Jammu and Kashmir", "Ladakh", "Rajasthan", "Madhya Pradesh", "Gujarat", "Maharashtra", "Chhattisgarh", "Andaman and Nicobar", "Dadra and Nagar Haveli and Daman and Diu", "Goa", "Chandigarh"), ...NORTHEAST_INDIA] }, "BGD"];
const BRITISH_INDIA_1871 = [{ add: ["IND"], sub: ["IND/Goa", "IND/Puducherry", "IND/Dadra and Nagar Haveli and Daman and Diu"] }, "PAK", "KAS", "BGD", "MMR/Rakhine", "MMR/Tanintharyi", "MMR/Yangon", "MMR/Ayeyarwady", "MMR/Bago", "MMR/Mon", "MMR/Kayin"];

// ---------------------------------------------------------------------------
// 定義本体
// ---------------------------------------------------------------------------
export const REGIONS = {
  // ===== 古代オリエント =====
  "anc-2500/エジプト": { add: [EGYPT_NILE] },
  "anc-2500/メソポタミア": { add: [SUMER] },
  "anc-1750/エジプト": { add: [EGYPT_NILE] },
  "anc-1750/メソポタミア": { add: [BABYLONIA_1750] },
  "anc-600/エジプト": { add: [EGYPT_NILE] },
  "anc-600/メソポタミア": { add: [p(FERTILE_CRESCENT, ...LEVANT_MESO_COUNTRIES)], sub: ["IRQ/Dihok", "IRQ/Arbil", "IRQ/As-Sulaymaniyah"] },
  "anc-600/bg:メディア": { add: ["IRN[44,24,62,40]", "IRQ/Dihok", "IRQ/Arbil", "IRQ/As-Sulaymaniyah", "ARM", "AZE", "TUR[35,36,45,42]"], sub: ["TUR/Sanliurfa", "TUR/Mardin", "TUR/Gaziantep", "TUR/Kilis", "TUR/Hatay", "TUR/Adana", "TUR/Mersin", "TUR/Osmaniye", "IRN/Sistan and Baluchestan", "IRN/Hormozgan", "IRN/Kerman", "IRN/Fars", "IRN/Bushehr", "IRN/Khuzestan", "IRN/South Khorasan", "IRN/Razavi Khorasan", "IRN/North Khorasan", "IRN/Kohgiluyeh and Buyer Ahmad"] },
  "anc-600/bg:リディア": { add: ["TUR[25,35.5,35,42.5]"], sub: [...EURO_TURKEY, "TUR/Adana", "TUR/Mersin", "TUR/Osmaniye", "TUR/Hatay"] },

  // ===== 古代の帝国 =====
  "anc-480/アケメネス朝ペルシア": { add: ["IRN", "IRQ", "SYR", "LBN", "ISR", "PSX", "JOR", "KWT", "TUR", "CYP", "AFG", "TKM", "TJK", "UZB[55,37,72,42]", "PAK", "ARM", "AZE", ...EGYPT_PROVINCE, CYRENAICA], sub: EURO_TURKEY },
  "anc-480/ギリシア": { add: SOUTH_GREECE.concat(gr("Thessalia", "Ipeiros")) },
  "anc-480/カルタゴ": { add: [CARTHAGE_COAST, ...SARDINIA, ...itp("Trapani", "Palermo", "Agrigento"), "ESP/Baleares", "MLT"] },
  "anc-480/ローマ": { add: ["ITA/Roma"] },
  "anc-323/マケドニア": { add: ["IRN", "IRQ", "SYR", "LBN", "ISR", "PSX", "JOR", "KWT", "TUR", "CYP", "AFG", "TKM", "TJK", "UZB[55,37,72,42]", "PAK", "ARM", "AZE", ...EGYPT_PROVINCE, CYRENAICA, "GRC", "MKD", "ALB[19,39,21.5,41]", "BGR"], sub: gr("Peloponnisos", "Attiki", "Stereá Elláda", "Dytiki Ellada", "Notio Aigaio", "Ionioi Nisoi", "Kriti") },
  "anc-323/ギリシア": { add: gr("Peloponnisos", "Attiki", "Stereá Elláda", "Dytiki Ellada", "Notio Aigaio", "Ionioi Nisoi", "Kriti") },
  "anc-323/カルタゴ": { add: [CARTHAGE_COAST, ...SARDINIA, ...itp("Trapani", "Palermo", "Agrigento", "Caltanissetta"), "ESP/Baleares", "MLT", p([[-7.0, 36.0], [-7.0, 37.3], [-4.0, 37.0], [-1.5, 37.7], [-0.5, 38.3], [-0.5, 36.0]], "ESP")] },
  "anc-323/ローマ": { add: itp("Roma", "Latina", "Frosinone", "Caserta", "Napoli") },
  "anc-218/ローマ": { add: [...it("Toscana", "Umbria", "Marche", "Lazio", "Abruzzo", "Molise", "Campania", "Apulia", "Basilicata", "Calabria", "Sicily", "Sardegna"), ...CORSICA, "ITA/Rimini"] },
  "anc-218/カルタゴ": { add: [CARTHAGE_COAST, "ESP/region:Andalucía", "ESP/region:Murcia", ...es("Alicante", "Valencia", "Castellón", "Albacete", "Ciudad Real", "Badajoz"), "PRT/Faro", "PRT/Beja", "ESP/Baleares"] },
  "anc-44/ローマ": { add: ["ITA", FRA, "BEL", "LUX", "CHE", "NLD/Zeeland", "NLD/Noord-Brabant", "NLD/Limburg", ...LEFT_RHINE, ESP, PRT, ...hr("Istarska", "Primorsko-Goranska", "Licko-Senjska", "Zadarska", "Šibensko-Kninska", "Splitsko-Dalmatinska", "Dubrovacko-Neretvanska"), "MNE/Kotor", "MNE/Budva", "MNE/Bar", "MNE/Ulcinj", "MNE/Herceg Novi", "MNE/Tivat", "GRC", "MKD", "ALB", ...tr("Çanakkale", "Balikesir", "Izmir", "Manisa", "Aydin", "Mugla", "Denizli", "Usak", "Kütahya", "Afyonkarahisar", "Bursa", "Bilecik", "Sakarya", "Kocaeli", "Yalova", "Düzce", "Bolu", "Zinguldak", "Bartın", "Kastamonu", "Sinop", "Samsun", "Mersin", "Adana", "Osmaniye", "Hatay"), p([[35.6, 37.3], [38.3, 36.9], [38.6, 35.3], [37.6, 33.0], [36.9, 32.6], [35.6, 33.0]], "SYR", "LBN"), "LBN", AFRICA_44BC, CYRENAICA], sub: es("La Coruña", "Lugo", "Orense", "Pontevedra", "Asturias", "Cantabria", "León", "Bizkaia", "Gipuzkoa", "Álava") },
  "anc-44/エジプト": { add: [EGYPT_NILE, "CYP"] },
  "anc117/ローマ": { add: [...ROME_117_EUROPE, ENGLAND, ...WALES, "TUR", "CYP", "SYR", "LBN", "ISR", "PSX", "JOR", "IRQ", "ARM", "SAU/Tabuk", ...EGYPT_PROVINCE, ROMAN_AFRICA_NO_MAR, ROMAN_MOROCCO], sub: [AUT_NORTH_OF_DANUBE] },
  "anc395/西ローマ帝国": { add: ["ITA", FRA, ESP, PRT, "BEL", "LUX", "CHE", "NLD/Zeeland", "NLD/Noord-Brabant", "NLD/Limburg", ...LEFT_RHINE, DANUBE_SOUTH_BAVARIA, "AUT", "SVN", "HRV", "BIH", ...TRANSDANUBIA, "SRB/Sremski", "MLT", ENGLAND, ...WALES, p(NAFRICA_ROMAN, "DZA", "TUN"), ROMAN_MOROCCO, TRIPOLITANIA], sub: [AUT_NORTH_OF_DANUBE] },
  "anc395/東ローマ帝国": { add: ["GRC", "MKD", "ALB", "MNE", "SRB", "KOS", "BGR", ...DOBRUJA, "TUR[25,35,42,43]", "CYP", DESERT_EDGE_LEVANT, "LBN", "ISR", "PSX", ...EGYPT_PROVINCE, CYRENAICA], sub: ["SRB/Sremski", ...VOJVODINA.filter((s) => s !== "SRB/Sremski")] },

  // ===== 中世① =====
  "med550/フランク王国": { add: [FRA, "BEL", "LUX", "CHE", "NLD/Zeeland", "NLD/Noord-Brabant", "NLD/Limburg", ...de("Rheinland-Pfalz", "Saarland", "Nordrhein-Westfalen", "Hessen", "Baden-Württemberg", "Bayern", "Thüringen"), "AUT/Vorarlberg", "AUT/Tirol"], sub: [...SEPTIMANIA, ...BRITTANY_WEST, ...CORSICA] },
  "med550/ビザンツ帝国": { add: ["GRC", "BGR", "MKD", "ALB", "SRB", "KOS", "MNE", "BIH", ...VENICE_DALMATIA, "HRV/Dubrovacko-Neretvanska", "ITA", ...CORSICA, "MLT", "TUR[25,35,42,43]", "CYP", DESERT_EDGE_LEVANT, "LBN", "ISR", "PSX", ...EGYPT_PROVINCE, CYRENAICA, TRIPOLITANIA, p(NAFRICA_ROMAN, "TUN"), p([[5.0, 37.5], [5.0, 35.4], [8.6, 35.0], [8.6, 37.5]], "DZA")], sub: VOJVODINA },
  "med800/フランク王国": { add: [FRA, "BEL", "LUX", "NLD", "CHE", "DEU", "AUT", "SVN", ...it("Lombardia", "Piemonte", "Liguria", "Veneto", "Friuli-Venezia Giulia", "Trentino-Alto Adige", "Valle d'Aosta", "Emilia-Romagna", "Toscana", "Umbria", "Lazio", "Marche", "Abruzzo"), "ESP/Gerona", "ESP/Barcelona", "HRV/Istarska"], sub: ["DEU/Mecklenburg-Vorpommern", "DEU/Brandenburg", "DEU/Berlin", "DEU/Sachsen", "ITA/Venezia"] },
  "med800/ビザンツ帝国": { add: ["GRC", "TUR[25,35,40,43]", ...it("Sicily", "Calabria"), ...itp("Lecce", "Brindisi", "Taranto"), "ITA/Venezia", "RUS/Crimea", "RUS/Sevastopol"], sub: ["TUR/Hatay", "TUR/Adana", "TUR/Osmaniye", "TUR/Gaziantep", "TUR/Kilis", "TUR/Sanliurfa", "TUR/K. Maras", "TUR/Adiyaman", "TUR/Malatya"] },
  "med800/イスラーム世界": { add: [ESP, "PRT", ...ISLAMIC_NAFRICA, "SYR", "LBN", "ISR", "PSX", "JOR", "IRQ", "IRN", ...ARABIA, "AFG", "TKM", "UZB", "TJK", "PAK[60,23,72,30]", "ARM", "AZE", "GEO/Tbilisi", ...tr("Hatay", "Adana", "Osmaniye", "Gaziantep", "Kilis", "Sanliurfa", "Mardin", "Diyarbakir", "Batman", "Siirt", "Sirnak", "Hakkari", "Van", "Bitlis", "Mus", "Agri", "Iğdir", "K. Maras", "Adiyaman", "Malatya")], sub: [...es("La Coruña", "Lugo", "Orense", "Pontevedra", "Asturias", "Cantabria", "León", "Palencia", "Burgos", "Bizkaia", "Gipuzkoa", "Álava", "Navarra", "Gerona", "Barcelona"), "PRT/Viana do Castelo", "PRT/Braga", "PRT/Madeira", "PRT/Azores", "ESP[-19,27,-13,30]"] },
  "med962/フランス王国": { add: [FRA, ...es("Gerona", "Barcelona")], sub: [...ALSACE, ...LORRAINE, "FRA/Meuse", ...FRANCHE_COMTE, ...BURGUNDY_ARLES, ...CORSICA] },
  "med962/神聖ローマ帝国": { add: ["DEU", "NLD", "LUX", "AUT", "SVN", "CZE", "CHE", ...ALSACE, ...LORRAINE, "FRA/Meuse", ...bel("Antwerp", "Limburg", "Flemish Brabant", "Walloon Brabant", "Brussels", "Liege", "Namur", "Luxembourg", "Hainaut"), ...it("Lombardia", "Piemonte", "Liguria", "Veneto", "Friuli-Venezia Giulia", "Trentino-Alto Adige", "Valle d'Aosta", "Emilia-Romagna", "Toscana", "Umbria", "Lazio", "Marche")], sub: ["DEU/Mecklenburg-Vorpommern", "DEU/Brandenburg", "DEU/Berlin", "CHE/Genève", "CHE/Vaud", "CHE/Valais", "CHE/Neuchâtel"] },
  "med962/イングランド王国": ENGLAND,
  "med962/ビザンツ帝国": { add: ["TUR[25,35,40,43]", ...gr("Peloponnisos", "Attiki", "Stereá Elláda", "Dytiki Ellada", "Thessalia", "Ipeiros", "Kentriki Makedonia", "Anatoliki Makedonia kai Thraki", "Ayion Oros", "Notio Aigaio", "Voreio Aigaio", "Ionioi Nisoi", "Kriti"), ...it("Calabria", "Apulia", "Basilicata"), "RUS/Crimea", "RUS/Sevastopol"], sub: ["TUR/Hatay", "TUR/Adana", "TUR/Osmaniye", "TUR/Gaziantep", "TUR/Kilis", "TUR/Sanliurfa", "TUR/K. Maras", "TUR/Adiyaman", "TUR/Malatya"] },
  "med962/イスラーム世界": { add: [ESP, "PRT", ...it("Sicily"), ...ISLAMIC_NAFRICA, "SYR", "LBN", "ISR", "PSX", "JOR", "IRQ", "IRN", ...ARABIA, "AFG", "TKM", "UZB", "TJK", "PAK[60,23,72,30]", "ARM", "AZE", ...tr("Hatay", "Adana", "Osmaniye", "Gaziantep", "Kilis", "Sanliurfa", "Mardin", "Diyarbakir", "Batman", "Siirt", "Sirnak", "Hakkari", "Van", "Bitlis", "Mus", "Agri", "Iğdir", "K. Maras", "Adiyaman", "Malatya")], sub: [...es("La Coruña", "Lugo", "Orense", "Pontevedra", "Asturias", "Cantabria", "León", "Palencia", "Burgos", "Zamora", "Valladolid", "Bizkaia", "Gipuzkoa", "Álava", "Navarra", "Huesca", "Gerona", "Barcelona", "Lérida", "La Rioja"), "PRT/Viana do Castelo", "PRT/Braga", "PRT/Vila Real", "PRT/Bragança", "PRT/Porto", "PRT/Aveiro", "PRT/Viseu", "PRT/Guarda", "PRT/Madeira", "PRT/Azores", ESP_CANARY] },

  // ===== 中世② =====
  ...(() => {
    const hre1095 = { add: ["DEU", "NLD", "LUX", "AUT", "SVN", "CZE", "CHE", ...ALSACE, ...LORRAINE, "FRA/Meuse", ...FRANCHE_COMTE, ...BURGUNDY_ARLES, ...bel("Antwerp", "Limburg", "Flemish Brabant", "Walloon Brabant", "Brussels", "Liege", "Namur", "Luxembourg", "Hainaut"), ...it("Lombardia", "Piemonte", "Veneto", "Friuli-Venezia Giulia", "Trentino-Alto Adige", "Valle d'Aosta", "Emilia-Romagna", "Toscana")], sub: ["ITA/Venezia", "DEU/Mecklenburg-Vorpommern", VORPOMMERN] };
    const flanders1095 = { add: [...FLANDERS, "FRA/Pas-de-Calais"] };
    const flanders = { add: [...FLANDERS, ZEELAND_FLANDERS] };
    const hre1204 = { add: hre1095.add, sub: [...hre1095.sub, ZEELAND_FLANDERS] };
    const venice1095 = { add: ["ITA/Venezia"] };
    const genoa1095 = { add: it("Liguria") };
    const islam1095 = { add: [...es("Cádiz", "Málaga", "Granada", "Almería", "Sevilla", "Córdoba", "Jaén", "Huelva", "Murcia", "Alicante", "Valencia", "Castellón", "Badajoz", "Baleares", "Zaragoza", "Lérida", "Huesca", "Teruel", "Albacete", "Cuenca"), "PRT/Faro", "PRT/Beja", "PRT/Évora", "PRT/Setúbal", "PRT/Lisboa", "PRT/Santarém", "PRT/Portalegre", ...ISLAMIC_NAFRICA, ...ARABIA, "ISR", "PSX"] };
    return {
      "med1095/神聖ローマ帝国": hre1095,
      "med1095/フランス王国": { add: [FRA, ...es("Gerona", "Barcelona")], sub: [...ALSACE, ...LORRAINE, "FRA/Meuse", ...FRANCHE_COMTE, ...BURGUNDY_ARLES, ...FLANDERS, "FRA/Pas-de-Calais", ...CORSICA] },
      "med1095/イングランド王国": ENGLAND,
      "med1095/ビザンツ帝国": { add: ["GRC", "BGR", "MKD", "ALB", "KOS", ...EURO_TURKEY, "TUR/Istanbul", "TUR/Kocaeli", "TUR/Yalova", "TUR/Trabzon", "TUR/Rize", "CYP"] },
      "med1095/セルジューク朝": { add: ["TUR", "SYR", "LBN", "JOR", "IRQ", "IRN", "TKM", "ARM", "AZE"], sub: [...EURO_TURKEY, "TUR/Istanbul", "TUR/Kocaeli", "TUR/Yalova", "TUR/Trabzon", "TUR/Rize"] },
      "med1095/イスラーム世界": islam1095,
      "med1095/ヴェネツィア共和国": venice1095,
      "med1095/ジェノヴァ共和国": genoa1095,
      "med1095/フランドル": flanders1095,
      "med1204/神聖ローマ帝国": hre1204,
      "med1204/フランス王国": { add: [FRA, ...es("Gerona", "Barcelona")], sub: [...ALSACE, ...LORRAINE, "FRA/Meuse", ...FRANCHE_COMTE, ...BURGUNDY_ARLES, ...FLANDERS, ...AQUITAINE_1204, ...CORSICA] },
      "med1204/イングランド王国": { add: [ENGLAND, ...AQUITAINE_1204] },
      "med1204/ビザンツ帝国": { add: [...tr("Bursa", "Balikesir", "Izmir", "Manisa", "Aydin", "Sakarya", "Kocaeli", "Yalova", "Bilecik", "Kütahya", "Usak", "Denizli", "Trabzon", "Rize", "Giresun", "Artvin"), p([[26.1, 40.6], [27.6, 40.6], [27.6, 39.4], [26.1, 39.4]], "TUR/Çanakkale"), "GRC/Ipeiros", "ALB/Vlorë", "ALB/Gjirokastër"] },
      "med1204/セルジューク朝": { add: ["TUR"], sub: [...EURO_TURKEY, "TUR/Istanbul", ...tr("Bursa", "Balikesir", "Izmir", "Manisa", "Aydin", "Sakarya", "Kocaeli", "Yalova", "Bilecik", "Kütahya", "Usak", "Denizli", "Trabzon", "Rize", "Giresun", "Artvin", "Çanakkale", "Adana", "Mersin", "Osmaniye", "Hatay", "Mardin", "Sanliurfa", "Diyarbakir", "Batman", "Siirt", "Sirnak", "Hakkari", "Van", "Bitlis", "Mus", "Agri", "Iğdir", "Kars", "Ardahan", "Erzurum", "Bingöl", "Tunceli", "Elazig")] },
      "med1204/イスラーム世界": { add: [...es("Cádiz", "Málaga", "Granada", "Almería", "Sevilla", "Córdoba", "Jaén", "Huelva", "Murcia", "Alicante", "Valencia", "Castellón", "Badajoz", "Cáceres", "Baleares"), "PRT/Faro", "PRT/Beja", "PRT/Évora", ...ISLAMIC_NAFRICA, "SYR", "JOR", "IRQ", "IRN", ...ARABIA, CRUSADER_PALESTINE_INLAND, ...tr("Mardin", "Sanliurfa", "Diyarbakir", "Batman", "Siirt", "Sirnak", "Hakkari", "Van", "Bitlis", "Mus", "Agri", "Iğdir", "Erzurum", "Bingöl", "Tunceli", "Elazig")], sub: [CRUSADER_SYRIA_COAST] },
      "med1204/ヴェネツィア共和国": { add: ["ITA/Venezia", "GRC/Kriti", "HRV/Zadarska"] },
      "med1204/ジェノヴァ共和国": genoa1095,
      "med1204/フランドル": flanders,
      "med1204/bg:十字軍の諸国家": { add: [...EURO_TURKEY, "TUR/Istanbul", ...gr("Kentriki Makedonia", "Anatoliki Makedonia kai Thraki", "Ayion Oros", "Thessalia", "Stereá Elláda", "Attiki", "Peloponnisos", "Dytiki Ellada"), "LBN", CRUSADER_GALILEE, CRUSADER_SYRIA_COAST, "CYP"] },
      "med1360/神聖ローマ帝国": { add: ["DEU", "NLD", "LUX", "AUT", "SVN", "CZE", "CHE", ...ALSACE, ...LORRAINE, "FRA/Meuse", ...FRANCHE_COMTE, ...SAVOY, ...NICE, ...f("Ain", "Alpes-de-Haute-Provence", "Bouches-du-Rhône", "Var", "Vaucluse"), ...bel("Antwerp", "Limburg", "Flemish Brabant", "Walloon Brabant", "Brussels", "Liege", "Namur", "Luxembourg", "Hainaut"), ...it("Lombardia", "Piemonte", "Friuli-Venezia Giulia", "Trentino-Alto Adige", "Valle d'Aosta", "Emilia-Romagna", "Toscana"), ...itp("Verona", "Vicenza", "Padova", "Rovigo", "Belluno"), ...pl("Lower Silesian", "Opole", "West Pomeranian")], sub: [ZEELAND_FLANDERS] },
      "med1360/フランス王国": { add: [FRA], sub: [...ALSACE, ...LORRAINE, "FRA/Meuse", ...FRANCHE_COMTE, ...SAVOY, ...NICE, ...f("Ain", "Alpes-de-Haute-Provence", "Bouches-du-Rhône", "Var", "Vaucluse"), ...FLANDERS, ...AQUITAINE_1360, ...CORSICA, p([[1.55, 50.75], [2.2, 50.75], [2.2, 51.1], [1.55, 51.1]], "FRA/Pas-de-Calais")] },
      "med1360/イングランド王国": { add: [ENGLAND, ...WALES, ...AQUITAINE_1360, p([[1.55, 50.75], [2.2, 50.75], [2.2, 51.1], [1.55, 51.1]], "FRA/Pas-de-Calais")] },
      "med1360/ビザンツ帝国": { add: ["TUR/Istanbul", "TUR/Tekirdag", "GRC/Kentriki Makedonia", "GRC/Peloponnisos"] },
      "med1360/イスラーム世界": { add: [...es("Granada", "Málaga", "Almería"), ...ISLAMIC_NAFRICA, "SYR", "LBN", "ISR", "PSX", "JOR", "IRQ", "IRN", ...ARABIA, "TUR"], sub: ["TUR/Istanbul", "TUR/Tekirdag", ...EURO_TURKEY, ...tr("Bursa", "Bilecik", "Kocaeli", "Sakarya", "Yalova", "Balikesir", "Çanakkale", "Eskisehir", "Düzce", "Bolu", "Ankara", "Trabzon", "Rize", "Giresun")] },
      "med1360/ヴェネツィア共和国": { add: ["ITA/Venezia", "ITA/Treviso", "GRC/Kriti"] },
      "med1360/ジェノヴァ共和国": { add: [...it("Liguria"), ...CORSICA] },
      "med1360/フランドル": flanders,
      "med1360/bg:オスマン朝": { add: tr("Bursa", "Bilecik", "Kocaeli", "Sakarya", "Yalova", "Balikesir", "Çanakkale", "Eskisehir", "Düzce", "Bolu", "Ankara") },
    };
  })(),

  // ===== 大航海時代・ルネサンス・宗教改革 =====
  ...(() => {
    const switzerland1492 = { add: ["CHE"], sub: ["CHE/Genève", "CHE/Vaud", "CHE/Ticino"] }; // 盟約者団と同盟地域（ヴァレー、グラウビュンデンなど）
    const hreSub = ["CHE", "ITA/region:Lombardia", ...MILAN_CORE, ...VENICE_TERRAFERMA, ...FLORENCE, ...PAPAL, ...NAPLES];
    const hre = (extraSub = [], post = []) => ({ add: ["DEU", "AUT", "CZE", "SVN", "NLD", "BEL", "LUX", ...ALSACE, ...LORRAINE, ...FRANCHE_COMTE, ...SAVOY, ...NICE, ...NORD_ARTOIS, ...pl("Lower Silesian", "Opole", "West Pomeranian", "Lubusz"), SILESIA_PRUSSIAN, ...it("Piemonte", "Liguria", "Emilia-Romagna", "Trentino-Alto Adige", "Valle d'Aosta", "Toscana"), "ITA/Trieste", "ITA/Gorizia", "LIE"], sub: [...hreSub, ...extraSub], post: [...post, "ITA/Mantova"] });
    const milan = (sub = []) => ({ add: [...MILAN_CORE, ...PARMA_PIACENZA, "CHE/Ticino", "ITA/Sondrio"], sub });
    const venice = { add: [...VENICE_TERRAFERMA, ...itp("Rovigo"), ...VENICE_DALMATIA, "GRC/Kriti", "GRC/Ionioi Nisoi", "CYP"] };
    const ottomanBalkans = ["GRC", "BGR", "MKD", "ALB", "SRB", "KOS", "MNE", "BIH", ...DOBRUJA, ...EURO_TURKEY, "TUR/Istanbul"];
    const hungary1492 = { add: ["HUN", "SVK", ...TRANSYLVANIA, ...PARTIUM, ...BANAT_RO, "HRV", ...VOJVODINA], sub: VENICE_DALMATIA };
    const aztec = { add: ["MEX/México", "MEX/Distrito Federal", "MEX/Puebla", "MEX/Tlaxcala", "MEX/Hidalgo", "MEX/Morelos", "MEX/Guerrero", p([[-98.6, 22.2], [-97.6, 21.6], [-96.9, 20.4], [-96.2, 19.5], [-95.6, 18.9], [-95.0, 18.4], [-94.6, 17.9], [-95.8, 17.6], [-97.4, 18.2], [-98.6, 18.6]], "MEX/Veracruz"), p([[-98.6, 18.6], [-97.4, 18.2], [-96.3, 17.4], [-95.6, 16.6], [-95.9, 15.7], [-97.2, 15.9], [-98.6, 16.3]], "MEX/Oaxaca")] };
    const inca = { add: ["PER", p([[-81.5, 0.9], [-78.6, 0.9], [-78.0, 0.3], [-77.8, -1.0], [-78.1, -2.4], [-78.4, -3.6], [-78.6, -5.0], [-81.5, -5.0]], "ECU"), p([[-69.6, -14.0], [-68.4, -15.0], [-67.6, -16.2], [-66.6, -17.0], [-65.6, -18.2], [-65.0, -19.6], [-64.9, -21.2], [-65.2, -22.9], [-70.0, -22.9]], "BOL"), "CHL[-76,-35.5,-66,-17]", p([[-68.6, -21.8], [-64.8, -21.8], [-65.0, -23.8], [-65.4, -25.6], [-65.6, -27.2], [-66.6, -29.0], [-67.6, -30.6], [-68.4, -31.6], [-69.8, -31.6]], "ARG")] };
    const spain1492 = { add: [ESP, ...SICILY, ...SARDINIA, ESP_CANARY], sub: ["ESP/Navarra"] };
    const spain1517 = { add: [ESP, ...SICILY, ...SARDINIA, ...NAPLES, ESP_CANARY, "CUB", "DOM", "HTI", "PRI", "JAM", "PAN"] };
    const spain1555 = { add: [ESP, ...SICILY, ...SARDINIA, ...NAPLES, ESP_CANARY, "CUB", "DOM", "HTI", "PRI", "JAM", MEXICO_CORE, ...CENTRAL_AMERICA, "PER", "ECU", "COL", "VEN", p([[-69.6, -10.9], [-67.0, -11.8], [-65.6, -14.0], [-64.0, -16.6], [-63.2, -18.6], [-63.0, -21.0], [-63.6, -22.9], [-70.0, -22.9]], "BOL"), "CHL[-76,-38,-66,-17]"] };
    const france = (sub = []) => ({ add: [FRA], sub: [...ALSACE, ...LORRAINE, ...FRANCHE_COMTE, ...SAVOY, ...NICE, ...NORD_ARTOIS, "FRA/Vaucluse", ...sub] });
    const ottoman1517 = { add: [...ottomanBalkans, ...WALLACHIA, ...MOLDAVIA, "MDA", "TUR", "SYR", "LBN", "ISR", "PSX", "JOR", ...OTTOMAN_EGYPT, ...HEJAZ, "RUS/Crimea", "RUS/Sevastopol"], sub: ["GRC/Kriti", "GRC/Ionioi Nisoi", ...VOJVODINA] };
    return {
      "ren1492/ポルトガル王国": { add: [PRT] },
      "ren1492/スペイン王国": spain1492,
      "ren1492/フランス王国": france(),
      "ren1492/神聖ローマ帝国": hre(PARMA_PIACENZA, ["CHE/Vaud"]),
      "ren1492/ミラノ公国": milan(),
      "ren1492/ヴェネツィア共和国": venice,
      "ren1492/フィレンツェ": { add: FLORENCE },
      "ren1492/ローマ教皇領": { add: [...PAPAL_1492, "FRA/Vaucluse"] },
      "ren1492/ナポリ王国": { add: NAPLES },
      "ren1492/アステカ帝国": aztec,
      "ren1492/インカ帝国": inca,
      "ren1492/bg:オスマン帝国": { add: [...ottomanBalkans, ...WALLACHIA, "TUR[25,35,38.5,43]"], sub: ["GRC/Kriti", "GRC/Ionioi Nisoi", "TUR/Hatay", "TUR/Adana", "TUR/Osmaniye", ...VOJVODINA] },
      "ren1492/bg:ハンガリー王国": hungary1492,
      "ren1492/bg:スイス": switzerland1492,
      "ren1492/bg:ナバラ王国": { add: ["ESP/Navarra"] },
      "ren1517/ポルトガル王国": { add: [PRT] },
      "ren1517/スペイン王国": spain1517,
      "ren1517/フランス王国": france(),
      "ren1517/神聖ローマ帝国": hre(["CHE/Genève", ...PARMA_PIACENZA], ["CHE/Vaud"]),
      "ren1517/ジュネーヴ": { add: ["CHE/Genève"] },
      "ren1517/ミラノ公国": milan([...PARMA_PIACENZA, "CHE/Ticino", "ITA/Sondrio"]),
      "ren1517/ヴェネツィア共和国": venice,
      "ren1517/フィレンツェ": { add: FLORENCE },
      "ren1517/ローマ教皇領": { add: [...PAPAL, ...PARMA_PIACENZA, "FRA/Vaucluse"] },
      "ren1517/アステカ帝国": aztec,
      "ren1517/インカ帝国": inca,
      "ren1517/bg:オスマン帝国": ottoman1517,
      "ren1517/bg:ハンガリー王国": hungary1492,
      "ren1517/bg:スイス": { add: ["CHE", "ITA/Sondrio"], sub: ["CHE/Genève", "CHE/Vaud"] },
      "ren1555/ポルトガル王国": { add: [PRT] },
      "ren1555/スペイン王国": spain1555,
      "ren1555/フランス王国": france(),
      "ren1555/神聖ローマ帝国": hre(["CHE/Genève", "ITA/Siena", "ITA/Grosseto"]),
      "ren1555/ジュネーヴ": { add: ["CHE/Genève"] },
      "ren1555/ミラノ公国": milan([...PARMA_PIACENZA, "CHE/Ticino", "ITA/Sondrio"]),
      "ren1555/ヴェネツィア共和国": venice,
      "ren1555/フィレンツェ": { add: [...FLORENCE, "ITA/Siena", "ITA/Grosseto"] },
      "ren1555/ローマ教皇領": { add: [...PAPAL, "FRA/Vaucluse"] },
      "ren1555/bg:オスマン帝国": { add: [...ottoman1517.add, ...TRANSYLVANIA, ...PARTIUM, ...BANAT_RO, ...VOJVODINA, ...SLAVONIA, "IRQ", ALGERIA_COAST, TRIPOLITANIA, ...["HUN/region:Great Southern Plain", "HUN/region:Northern Great Plain", "HUN/region:Central Hungary", "HUN/region:Southern Transdanubia"], "HUN/Fejér", "HUN/Tolna", "HUN/Székesfehérvár", "HUN/Dunaújváros"], sub: ["GRC/Kriti", "GRC/Ionioi Nisoi"] },
      "ren1555/bg:スイス": { add: ["CHE", "ITA/Sondrio"], sub: ["CHE/Genève"] },
    };
  })(),

  // ===== 絶対王政・主権国家体制 =====
  ...(() => {
    const SPAIN_NL = ["BEL", "LUX", ...NORD_ARTOIS];
    const swedenGerman1648 = [VORPOMMERN, STETTIN, BREMEN_VERDEN];
    const ducalPrussia = [{ poly: [[19.0, 55.0], [23.0, 55.0], [23.0, 53.0], [19.0, 53.0]], of: ["POL/Warmian-Masurian"] }, "RUS/Kaliningrad", "LTU/Klaipedos"];
    const austria1648 = ["UKR/Transcarpathia", "AUT", "CZE", "SVN", ...pl("Lower Silesian", "Opole"), SILESIA_PRUSSIAN, "SVK", "HUN/region:Western Transdanubia", "HUN/Komárom-Esztergom", "HUN/Tatabánya", "HUN/Nógrád", "HUN/Salgótarján", "HUN/Borsod-Abaúj-Zemplén", "HUN/Miskolc", ...hr("Grad Zagreb", "Zagrebacka", "Karlovacka", "Varaždinska", "Krapinsko-Zagorska", "Medimurska", "Koprivničko-Križevačka", "Bjelovarsko-bilogorska", "Sisacko-Moslavacka", "Licko-Senjska", "Primorsko-Goranska")];
    const ottoman1648 = ["GRC", "BGR", "MKD", "ALB", "SRB", "KOS", "MNE", "BIH", ...EURO_TURKEY, "TUR", "ROU", "MDA", ...SLAVONIA, "HUN", ...UKR_STEPPE.filter((s) => !s.includes("Kirovohrad") && !s.includes("Dnipro") && !s.includes("Luhans") && !s.includes("Donets")), "UKR/Chernivtsi", "RUS/Sevastopol", "CYP", "SYR", "LBN", "ISR", "PSX", "JOR", "IRQ", ...OTTOMAN_EGYPT, ...HEJAZ, TRIPOLITANIA, CYRENAICA, "TUN", ALGERIA_COAST];
    const ottomanSub1648 = ["HUN/region:Western Transdanubia", "HUN/Komárom-Esztergom", "HUN/Tatabánya", "HUN/Nógrád", "HUN/Salgótarján", "HUN/Borsod-Abaúj-Zemplén", "HUN/Miskolc", "GRC/Ionioi Nisoi"];
    const spainAmericas1648 = [MEXICO_CORE, ...CENTRAL_AMERICA, "CUB", "DOM", "HTI", "PRI", "JAM", ...SPANISH_SOUTH_AMERICA, "USA/New Mexico", "USA/Florida"];
    const spainAmericas1715 = [MEXICO_CORE, ...CENTRAL_AMERICA, "CUB", "DOM", "PRI", ...SPANISH_SOUTH_AMERICA, ...us("New Mexico", "Florida", "Texas", "Arizona")];
    const spainAmericas1772 = [MEXICO_CORE, ...CENTRAL_AMERICA, "CUB", "DOM", "PRI", ...SPANISH_SOUTH_AMERICA, "URY", ...us("New Mexico", "Texas", "Arizona", "California"), ...LOUISIANA_WEST];
    return {
      "abs1648/フランス王国": { add: [FRA, ...ALSACE, "FRA/Meuse", NEW_FRANCE, "FRA/Martinique", "FRA/Guadeloupe"], sub: [...LORRAINE, ...FRANCHE_COMTE, ...SAVOY, ...NICE, ...NORD_ARTOIS, ...ROUSSILLON, "FRA/Vaucluse"] },
      "abs1648/スペイン王国": { add: [ESP, ...ROUSSILLON, ...SPAIN_NL, ...FRANCHE_COMTE, ...MILAN_CORE, ...NAPLES, ...SICILY, ...SARDINIA, ESP_CANARY, ...spainAmericas1648], sub: ["BEL/Liege"] },
      "abs1648/オランダ": { add: [NLD] },
      "abs1648/イギリス": { add: ["GBR", "IRL", ...us("Massachusetts", "Connecticut", "Rhode Island", "New Hampshire", "Virginia", "Maryland")] },
      "abs1648/オーストリア": { add: austria1648 },
      "abs1648/プロイセン王国": { add: ["DEU/Brandenburg", "DEU/Berlin", { add: ["POL/West Pomeranian"], sub: [STETTIN] }, "POL/Lubusz", ...ducalPrussia, CLEVES_MARK], sub: [WARMIA_ELBLAG] },
      "abs1648/神聖ローマ帝国": { add: ["DEU", ...LORRAINE, "BEL/Liege"], sub: ["DEU/Brandenburg", "DEU/Berlin", CLEVES_MARK, ...swedenGerman1648] },
      "abs1648/ロシア帝国": { add: [RUS_EUROPE, SIBERIA_1648, "RUS/Khabarovsk"], sub: [...ru("Kaliningrad", "Leningrad", "City of St. Petersburg", "Smolensk", "Bryansk"), ...RUS_STEPPE_SOUTH] },
      "abs1648/bg:スウェーデン": { add: ["SWE", "FIN", "EST", "LVA/region:Vidzeme", "LVA/region:Riga", "RUS/Leningrad", "RUS/City of St. Petersburg", ...swedenGerman1648], sub: ["SWE/Skåne", "SWE/Blekinge"] },
      "abs1648/bg:ポーランド＝リトアニア": { add: ["POL", "LTU", "BLR", "UKR", "LVA", "RUS/Smolensk", "RUS/Bryansk"], post: [WARMIA_ELBLAG], sub: [...pl("Lower Silesian", "Opole", "West Pomeranian", "Lubusz"), SILESIA_PRUSSIAN, "POL/Warmian-Masurian", "LTU/Klaipedos", "LVA/region:Vidzeme", "LVA/region:Riga", ...UKR_STEPPE, "UKR/Transcarpathia", "UKR/Chernivtsi", "UKR/Kharkiv"] },
      "abs1648/bg:オスマン帝国": { add: ottoman1648, sub: ottomanSub1648 },
      "abs1648/bg:ポルトガル王国": { add: [PRT, p([[-42.0, -2.0], [-34.0, -2.0], [-34.0, -25.0], [-48.0, -25.0], [-44.0, -12.0]], "BRA")] },
      "abs1715/フランス王国": { add: [FRA, ...ALSACE, ...ROUSSILLON, ...FRANCHE_COMTE, "FRA/Nord", "FRA/Pas-de-Calais", "FRA/Meuse", "HTI", ...us("Louisiana", "Mississippi"), NEW_FRANCE, "FRA/Martinique", "FRA/Guadeloupe"], sub: [...LORRAINE, ...SAVOY, ...NICE, "FRA/Vaucluse"] },
      "abs1715/スペイン王国": { add: [ESP, ESP_CANARY, ...spainAmericas1715] },
      "abs1715/オランダ": { add: [NLD] },
      "abs1715/イギリス": { add: ["GBR", "IRL", ...THIRTEEN_COLONIES_1715, "USA/Vermont", "CAN/Nova Scotia", NEWFOUNDLAND, "JAM", "BHS"] },
      "abs1715/オーストリア": { add: [...austria1648, "HUN", ...TRANSYLVANIA, ...PARTIUM, ...SLAVONIA, ...VOJVODINA.filter((s) => !s.includes("Banat")), "BEL", "LUX", ...MILAN_CORE, ...NAPLES, ...SARDINIA, "ITA/Mantova"], sub: ["BEL/Liege"] },
      "abs1715/プロイセン王国": { add: ["DEU/Brandenburg", "DEU/Berlin", "DEU/Sachsen-Anhalt", { add: ["POL/West Pomeranian"], sub: [STETTIN] }, "POL/Lubusz", ...ducalPrussia, CLEVES_MARK], sub: [WARMIA_ELBLAG] },
      "abs1715/神聖ローマ帝国": { add: ["DEU", ...LORRAINE, "BEL/Liege"], sub: ["DEU/Brandenburg", "DEU/Berlin", "DEU/Sachsen-Anhalt", CLEVES_MARK, ...swedenGerman1648] },
      "abs1715/ロシア帝国": { add: [RUS_EUROPE, "RUS[60,40,180,82]", "EST", "LVA/region:Vidzeme", "LVA/region:Riga", ...UKR_LEFT_BANK, "UKR/Luhans'k"], sub: [...ru("Kaliningrad", "Amur", "Yevrey", "Primor'ye", "Tuva", "Gorno-Altay", "Altay", "Chukchi Autonomous Okrug", "Sakhalin"), ...RUS_STEPPE_SOUTH] },
      "abs1715/bg:スウェーデン": { add: ["SWE", "FIN", ...swedenGerman1648] },
      "abs1715/bg:ポーランド＝リトアニア": { add: ["POL", "LTU", "BLR", "UKR", "LVA"], post: [WARMIA_ELBLAG], sub: [...pl("Lower Silesian", "Opole", "West Pomeranian", "Lubusz"), SILESIA_PRUSSIAN, "POL/Warmian-Masurian", "LTU/Klaipedos", "LVA/region:Vidzeme", "LVA/region:Riga", ...UKR_STEPPE, ...UKR_LEFT_BANK, "UKR/Transcarpathia", "UKR/Chernivtsi"] },
      "abs1715/bg:オスマン帝国": { add: ["GRC", "BGR", "MKD", "ALB", "SRB", "KOS", "MNE", "BIH", ...EURO_TURKEY, "TUR", ...WALLACHIA, ...MOLDAVIA, ...DOBRUJA, "MDA", ...BANAT_RO, "SRB/Severno-Banatski", "SRB/Srednje-Banatski", "SRB/Južno-Banatski", ...UKR_STEPPE.filter((s) => !s.includes("Luhans")), "RUS/Sevastopol", "RUS/Rostov", "CYP", "SYR", "LBN", "ISR", "PSX", "JOR", "IRQ", ...OTTOMAN_EGYPT, ...HEJAZ, TRIPOLITANIA, CYRENAICA, "TUN", ALGERIA_COAST, "UKR/Chernivtsi", "ROU/Suceava"], sub: ["GRC/Ionioi Nisoi", ...VOJVODINA.filter((s) => !s.includes("Banat"))] },
      "abs1715/bg:ポルトガル王国": { add: [PRT, "BRA[-60,-34,-34,5]"] },
      "abs1772/フランス王国": { add: [FRA, ...ALSACE, ...LORRAINE, ...ROUSSILLON, ...FRANCHE_COMTE, ...NORD_ARTOIS, "FRA/Meuse", ...CORSICA, "HTI", "FRA/Guyane française", "FRA/Martinique", "FRA/Guadeloupe"], sub: [...SAVOY, ...NICE, "FRA/Vaucluse"] },
      "abs1772/スペイン王国": { add: [ESP, ESP_CANARY, ...spainAmericas1772] },
      "abs1772/オランダ": { add: [NLD] },
      "abs1772/イギリス": { add: ["GBR", "IRL", ...THIRTEEN_COLONIES_1772, "USA/Florida", QUEBEC_1763, ...ca("New Brunswick", "Nova Scotia", "Prince Edward Island"), NEWFOUNDLAND, "JAM", "BHS", "IND/West Bengal", "IND/Bihar", "BGD"] },
      "abs1772/オーストリア": { add: ["UKR/Transcarpathia", "AUT", "CZE", "SVN", "SVK", "HUN", "HRV", ...TRANSYLVANIA, ...PARTIUM, ...BANAT_RO, ...VOJVODINA, ...GALICIA_1772, "BEL", "LUX", ...MILAN_CORE, "ITA/Mantova"], sub: [...VENICE_DALMATIA, "BEL/Liege"] },
      "abs1772/プロイセン王国": { add: ["DEU/Brandenburg", "DEU/Berlin", "DEU/Sachsen-Anhalt", VORPOMMERN, "POL/West Pomeranian", "POL/Lubusz", "POL/Lower Silesian", "POL/Opole", SILESIA_PRUSSIAN, "POL/Pomeranian", "POL/Warmian-Masurian", NETZE_DISTRICT, "RUS/Kaliningrad", "LTU/Klaipedos", CLEVES_MARK, EAST_FRISIA], sub: [VORPOMMERN_N_PEENE, p([[18.45, 54.45], [18.8, 54.45], [18.8, 54.25], [18.45, 54.25]], "POL/Pomeranian")] },
      "abs1772/神聖ローマ帝国": { add: ["DEU", "BEL/Liege"], sub: ["DEU/Brandenburg", "DEU/Berlin", "DEU/Sachsen-Anhalt", VORPOMMERN, CLEVES_MARK, EAST_FRISIA] },
      "abs1772/ロシア帝国": { add: [RUS_EUROPE, "RUS[60,40,180,82]", "EST", "LVA/region:Vidzeme", "LVA/region:Riga", "LVA/region:Latgale", ...by("Vitebsk", "Mogilev", "Gomel"), ...UKR_LEFT_BANK, ...ua("Luhans'k", "Donets'k", "Dnipropetrovs'k", "Zaporizhzhya", "Kirovohrad"), "RUS/Rostov", "FIN/South Karelia", "FIN/Kymenlaakso"], sub: [...ru("Kaliningrad", "Amur", "Yevrey", "Primor'ye", "Tuva", "Chukchi Autonomous Okrug", "Sakhalin"), ...RUS_STEPPE_SOUTH.filter((s) => !s.includes("Rostov"))] },
      "abs1772/bg:スウェーデン": { add: ["SWE", "FIN", VORPOMMERN_N_PEENE], sub: ["FIN/South Karelia", "FIN/Kymenlaakso"] },
      "abs1772/bg:ポーランド＝リトアニア": { add: ["POL", "LTU", "BLR", "UKR", "LVA/region:Kurzeme", "LVA/region:Zemgale"], sub: [...pl("Lower Silesian", "Opole", "West Pomeranian", "Lubusz", "Pomeranian", "Warmian-Masurian", "Subcarpathian"), SILESIA_PRUSSIAN, NETZE_DISTRICT, ...GALICIA_WEST, "LTU/Klaipedos", ...by("Vitebsk", "Mogilev", "Gomel"), ...UKR_STEPPE, ...UKR_LEFT_BANK, ...GALICIA_EAST, "UKR/Transcarpathia", "UKR/Chernivtsi"] },
      "abs1772/bg:オスマン帝国": { add: ["GRC", "BGR", "MKD", "ALB", "SRB", "KOS", "MNE", "BIH", ...EURO_TURKEY, "TUR", ...WALLACHIA, ...MOLDAVIA, ...DOBRUJA, "MDA", "UKR/Odessa", "UKR/Mykolayiv", "UKR/Kherson", "RUS/Crimea", "RUS/Sevastopol", "UKR/Chernivtsi", "ROU/Suceava", "CYP", "SYR", "LBN", "ISR", "PSX", "JOR", "IRQ", ...OTTOMAN_EGYPT, ...HEJAZ, TRIPOLITANIA, CYRENAICA, "TUN", ALGERIA_COAST], sub: ["GRC/Ionioi Nisoi", ...VOJVODINA] },
      "abs1772/bg:ポルトガル王国": { add: [PRT, "BRA"] },
    };
  })(),

  // ===== 市民革命と国民国家 =====
  ...(() => {
    const prussia1815 = ["DEU/Brandenburg", "DEU/Berlin", VORPOMMERN, "DEU/Sachsen-Anhalt", "DEU/Nordrhein-Westfalen", "DEU/Saarland", RLP_NORTH, UPPER_LUSATIA_PRUSSIAN, ...PRUSSIAN_POLAND_1815, SILESIA_PRUSSIAN, "RUS/Kaliningrad", "LTU/Klaipedos"];
    const austria1815 = ["AUT", "CZE", "SVN", "HRV", "HUN", "SVK", ...TRANSYLVANIA, ...PARTIUM, ...BANAT_RO, ...BUKOVINA, ...VOJVODINA, ...GALICIA_EAST, "UKR/Transcarpathia", "POL/Subcarpathian", ...GALICIA_WEST, ...LOMBARDY, ...VENETO, "ITA/region:Friuli-Venezia Giulia", "ITA/region:Trentino-Alto Adige"];
    return {
      "rev1812/フランス帝国": { add: [FRA, ...CORSICA, "BEL", "NLD", "LUX", ...LEFT_RHINE, "DEU/Hamburg", "DEU/Bremen", NW_GERMANY_1810, ...it("Piemonte", "Liguria", "Valle d'Aosta", "Toscana", "Lazio", "Umbria"), ...PARMA_PIACENZA, "CHE/Valais", "CHE/Genève", "SVN", ...hr("Istarska", "Primorsko-Goranska", "Licko-Senjska", "Karlovacka", "Zadarska", "Šibensko-Kninska", "Splitsko-Dalmatinska", "Dubrovacko-Neretvanska", "Sisacko-Moslavacka"), "ITA/Trieste", "ITA/Gorizia", "AUT/Kärnten", ...es("Gerona", "Barcelona", "Lérida", "Tarragona")] },
      "rev1812/ライン同盟": { add: ["DEU", "AUT/Salzburg", "AUT/Tirol", "ITA/Bozen", "ITA/Trento"], sub: ["DEU/Brandenburg", "DEU/Berlin", "DEU/Hamburg", "DEU/Bremen", ...LEFT_RHINE, NW_GERMANY_1810, VORPOMMERN, JERICHOW_1812, "DEU/Schleswig-Holstein"] },
      "rev1812/プロイセン王国（1812）": { add: ["DEU/Brandenburg", "DEU/Berlin", JERICHOW_1812, { add: [VORPOMMERN], sub: [VORPOMMERN_N_PEENE] }, ...pl("West Pomeranian", "Pomeranian", "Lubusz", "Lower Silesian", "Opole", "Warmian-Masurian"), SILESIA_PRUSSIAN, "RUS/Kaliningrad", "LTU/Klaipedos"], sub: [p([[18.45, 54.45], [18.8, 54.45], [18.8, 54.25], [18.45, 54.25]], "POL/Pomeranian")] },
      "rev1812/オーストリア帝国（1812）": { add: ["AUT", "CZE", "HUN", "SVK", ...TRANSYLVANIA, ...PARTIUM, ...BANAT_RO, ...BUKOVINA, ...VOJVODINA, ...SLAVONIA, ...hr("Grad Zagreb", "Zagrebacka", "Varaždinska", "Krapinsko-Zagorska", "Medimurska", "Koprivničko-Križevačka", "Bjelovarsko-bilogorska"), "UKR/L'viv", "UKR/Ivano-Frankivs'k", "UKR/Transcarpathia", "POL/Subcarpathian"], sub: ["AUT/Salzburg", "AUT/Tirol", "AUT/Kärnten"] },
      "rev1812/ワルシャワ大公国": { add: [...pl("Masovian", "Łódź", "Greater Poland", "Kuyavian-Pomeranian", "Lublin", "Świętokrzyskie", "Lesser Poland"), SILESIA_RUSSIAN, p([[22.0, 53.3], [22.5, 53.2], [22.9, 52.9], [23.2, 52.6], [23.0, 52.25], [22.0, 52.3]], "POL/Podlachian")] },
      "rev1815/フランス王国": { add: [FRA, ...CORSICA], sub: [...SAVOY, ...NICE] },
      "rev1815/ネーデルラント連合王国": { add: [NLD, "BEL", "LUX"] },
      // プロイセン・オーストリア以外の加盟国（バイエルン、ザクセン、ハノーファーなど）
      "rev1815/ドイツ連邦": { add: ["DEU"], sub: ["DEU/Brandenburg", "DEU/Berlin", VORPOMMERN, "DEU/Sachsen-Anhalt", "DEU/Nordrhein-Westfalen", "DEU/Saarland", RLP_NORTH, UPPER_LUSATIA_PRUSSIAN] },
      "rev1815/プロイセン王国": { add: prussia1815 },
      "rev1815/オーストリア帝国": { add: austria1815 },
      "rev1815/ロシア帝国": { add: [RUS_EUROPE, "RUS[60,40,180,82]", "FIN", "EST", "LVA", "LTU", "BLR", "UKR", "MDA", "GEO", "AZE", ...CONGRESS_POLAND], sub: ["RUS/Kaliningrad", "LTU/Klaipedos", ...GALICIA_EAST, "UKR/Transcarpathia", "UKR/Chernivtsi", ...ru("Amur", "Yevrey", "Primor'ye", "Tuva", "Sakhalin")] },
      "rev1871/ドイツ帝国": { add: ["DEU", ...ALSACE_LORRAINE, ...PRUSSIAN_POLAND_1815, SILESIA_PRUSSIAN, "RUS/Kaliningrad", "LTU/Klaipedos", NORTH_SCHLESWIG] },
      "rev1871/オーストリア＝ハンガリー帝国": { add: ["AUT", "CZE", "SVN", "HRV", "HUN", "SVK", ...TRANSYLVANIA, ...PARTIUM, ...BANAT_RO, ...BUKOVINA, ...VOJVODINA, ...GALICIA_EAST, "UKR/Transcarpathia", "POL/Subcarpathian", ...GALICIA_WEST, ...TRENTINO_TRIESTE] },
      "rev1871/イタリア王国": { add: ["ITA"], sub: TRENTINO_TRIESTE },
      "rev1871/フランス": { add: [FRA, ...CORSICA], sub: ALSACE_LORRAINE },
    };
  })(),

  // ===== 帝国主義と世界大戦 =====
  ...(() => {
    const germanyEurope = ["DEU", ...ALSACE_LORRAINE, ...PRUSSIAN_POLAND_1815, SILESIA_PRUSSIAN, "RUS/Kaliningrad", "LTU/Klaipedos", NORTH_SCHLESWIG];
    // ドイツ領ニューギニア（北東部と島々）。南東部は英領パプア（PAPUA）と同じ境界線で分ける
    const germanColonies1885 = ["TGO", "CMR", "NAM", "TZA", "RWA", "BDI", { poly: GERMAN_NEW_GUINEA, of: ["PNG"] }];
    const germanColonies1900 = [...germanColonies1885, JIAOZHOU, "WSM", "FSM", "MHL", "PLW", "MNP"];
    const austriaHungary = ["AUT", "CZE", "SVN", "HRV", "BIH", "HUN", "SVK", ...TRANSYLVANIA, ...PARTIUM, ...BANAT_RO, ...BUKOVINA, ...VOJVODINA, ...GALICIA_EAST, "UKR/Transcarpathia", "POL/Subcarpathian", ...GALICIA_WEST, ...TRENTINO_TRIESTE, SILESIA_AUSTRIAN];
    const russiaCore = [RUS_EUROPE, "RUS[60,40,180,82]", "FIN", "EST", "LVA", "LTU", "BLR", "UKR", "MDA", ...CONGRESS_POLAND, "GEO", "ARM", "AZE", "KAZ", "KAB", "UZB", "TKM", "KGZ", "TJK", ...tr("Kars", "Ardahan", "Artvin")];
    const russiaSub = ["RUS/Kaliningrad", "LTU/Klaipedos", ...GALICIA_EAST, "UKR/Transcarpathia", "UKR/Chernivtsi", KURILS];
    const ottomanAsia1885 = ["TUR", "SYR", "LBN", "ISR", "PSX", "JOR", "IRQ", ...HEJAZ, "SAU/Ash Sharqiyah", "YEM"];
    const ottomanEurope1885 = [...EURO_TURKEY, "TUR/Istanbul", ...GREEK_MACEDONIA_THRACE, "GRC/Ipeiros", "GRC/Kriti", "GRC/Voreio Aigaio", "MKD", "ALB", "KOS", ...SANDZAK, ...["BGR/Kardzhali", "BGR/Smolyan", "BGR/Blagoevgrad"]];
    const britain1885 = ["GBR", "IRL", "CAN", "AUS", "NZL", "IND", "KAS", "PAK", "BGD", "MMR", "LKA", EGY, "CYP", ...["ZAF/Western Cape", "ZAF/Eastern Cape", "ZAF/Northern Cape", "ZAF/KwaZulu-Natal"], "BWA", "SLE", "GMB", p([[-3.3, 4.5], [1.2, 4.5], [1.2, 7.0], [-3.3, 7.0]], "GHA"), p([[2.6, 4.0], [9.0, 4.0], [9.0, 7.0], [2.6, 7.0]], "NGA"), "HKG", "JAM", "BHS", "GUY", "BLZ", "FJI", "SOL", "SGP", p([[100.0, 6.5], [104.5, 6.5], [104.5, 1.2], [100.0, 1.2]], "MYS")];
    const britain1900 = [...britain1885.filter((s) => !String(s).startsWith("ZAF/")), "ZAF", "LSO", "SDN", "SDS", "KEN", "UGA", "NGA", "GHA", "ZWE", "ZMB", "MWI", "MYS", "BRN", { poly: PAPUA, of: ["PNG"] }];
    const britain1914 = [...britain1900, "SWZ", "KWT", "QAT", "BHR", "ARE"];
    const france1885 = [FRA, ...CORSICA, ALGERIA_NORTH, "TUN", "SEN", "GAB", "COG", "VNM", "KHM", "NCL", "DJI", "FRA/Guyane française", "FRA/Martinique", "FRA/Guadeloupe", "FRA/La Réunion"];
    const france1900 = [...france1885.filter((s) => s !== ALGERIA_NORTH), "DZA", "MLI", "GIN", "CIV", "BFA", "BEN", "NER", "MRT", "TCD", "CAF", "MDG", "LAO", "COM", "FRA/Mayotte"];
    const usa1885 = { add: ["USA"], sub: ["USA/Hawaii"] };
    const italy1885 = ["ITA", p([[38.6, 18.1], [39.3, 16.3], [40.2, 15.4], [41.6, 13.8], [43.2, 12.7], [43.3, 13.6], [39.6, 16.6], [38.6, 18.6]], "ERI")]; // マッサワ周辺の沿岸
    const spain1885 = [ESP, ESP_CANARY, "ESP/Ceuta", "ESP/Melilla", "CUB", "PRI", "PHL", "SAH", "GNQ"];
    const portugal = [PRT, "PRT/Madeira", "PRT/Azores", "AGO", "MOZ", "GNB", "CPV", "STP", "TLS", "MAC"];
    const greece1885 = { add: ["GRC"], sub: [...GREEK_MACEDONIA_THRACE, "GRC/Ipeiros", "GRC/Kriti", "GRC/Voreio Aigaio"] };
    const serbia1885 = { add: ["SRB"], sub: [...VOJVODINA, "SRB/Raški"] };
    const bulgaria1885 = { add: ["BGR"], sub: ["BGR/Kardzhali", "BGR/Smolyan", "BGR/Blagoevgrad"] };
    const romania1885 = { add: [...WALLACHIA, ...MOLDAVIA, ...DOBRUJA] };
    const montenegro1885 = { add: ["MNE"], sub: SANDZAK };
    return {
      "imp1885/清": { add: ["CHN", "MNG", "TWN"], sub: [] },
      "imp1885/ロシア帝国": { add: russiaCore, sub: russiaSub },
      "imp1885/オスマン帝国": { add: [...ottomanAsia1885, ...ottomanEurope1885, "LBY"], sub: tr("Kars", "Ardahan", "Artvin") },
      "imp1885/オーストリア＝ハンガリー帝国": { add: austriaHungary },
      "imp1885/ドイツ帝国": { add: [...germanyEurope, ...germanColonies1885] },
      "imp1885/フランス": { add: france1885, sub: ALSACE_LORRAINE },
      "imp1885/イギリス": { add: britain1885 },
      "imp1885/アメリカ合衆国": usa1885,
      "imp1885/日本": { add: ["JPN", KURILS] },
      "imp1885/bg:イタリア": { add: italy1885, sub: TRENTINO_TRIESTE },
      "imp1885/bg:スペイン": { add: spain1885 },
      "imp1885/bg:ポルトガル": { add: portugal },
      "imp1885/bg:オランダ領東インド": { add: ["IDN"] },
      "imp1885/bg:ペルシア": { add: ["IRN"] },
      "imp1885/bg:スイス": { add: ["CHE"] },
      "imp1885/bg:アフガニスタン": { add: ["AFG"] },
      "imp1885/bg:エチオピア": { add: ["ETH"] },
      "imp1885/bg:コンゴ自由国": { add: ["COD"] },
      "imp1885/bg:セルビア": serbia1885,
      "imp1885/bg:ブルガリア": bulgaria1885,
      "imp1885/bg:ルーマニア": romania1885,
      "imp1885/bg:ギリシア": greece1885,
      "imp1885/bg:朝鮮": { add: KOREA },
      "imp1885/bg:モンテネグロ": montenegro1885,
      "imp1900/清": { add: ["CHN", "MNG"], sub: [KWANTUNG, JIAOZHOU, WEIHAIWEI] },
      "imp1900/ロシア帝国": { add: [...russiaCore, KWANTUNG], sub: russiaSub },
      "imp1900/オスマン帝国": { add: [...ottomanAsia1885, ...ottomanEurope1885, "LBY"], sub: tr("Kars", "Ardahan", "Artvin") },
      "imp1900/オーストリア＝ハンガリー帝国": { add: austriaHungary },
      "imp1900/ドイツ帝国": { add: [...germanyEurope, ...germanColonies1900] },
      "imp1900/フランス": { add: france1900, sub: ALSACE_LORRAINE },
      "imp1900/イギリス": { add: [...britain1900, WEIHAIWEI] },
      "imp1900/アメリカ合衆国": { add: ["USA", "PRI", "PHL", "GUM", "ASM"] },
      "imp1900/日本": { add: ["JPN", KURILS, "TWN"] },
      "imp1900/bg:イタリア": { add: [...italy1885, "ERI", "SOM"], sub: TRENTINO_TRIESTE },
      "imp1900/bg:スペイン": { add: [ESP, ESP_CANARY, "ESP/Ceuta", "ESP/Melilla", "SAH", "GNQ"] },
      "imp1900/bg:ポルトガル": { add: portugal },
      "imp1900/bg:オランダ領東インド": { add: ["IDN"] },
      "imp1900/bg:ペルシア": { add: ["IRN"] },
      "imp1900/bg:スイス": { add: ["CHE"] },
      "imp1900/bg:アフガニスタン": { add: ["AFG"] },
      "imp1900/bg:エチオピア": { add: ["ETH"] },
      "imp1900/bg:コンゴ自由国": { add: ["COD"] },
      "imp1900/bg:セルビア": serbia1885,
      "imp1900/bg:ブルガリア": bulgaria1885,
      "imp1900/bg:ルーマニア": romania1885,
      "imp1900/bg:ギリシア": greece1885,
      "imp1900/bg:大韓帝国": { add: KOREA },
      "imp1900/bg:モンテネグロ": montenegro1885,
      "imp1914/清": { add: ["CHN", "MNG"], sub: [KWANTUNG, JIAOZHOU, WEIHAIWEI] },
      "imp1914/ロシア帝国": { add: russiaCore, sub: [...russiaSub, SOUTH_SAKHALIN] },
      "imp1914/オスマン帝国": { add: ["TUR", "SYR", "LBN", "ISR", "PSX", "JOR", "IRQ", ...HEJAZ, "YEM"], sub: tr("Kars", "Ardahan", "Artvin") },
      "imp1914/オーストリア＝ハンガリー帝国": { add: austriaHungary },
      "imp1914/ドイツ帝国": { add: [...germanyEurope, ...germanColonies1900] },
      "imp1914/フランス": { add: [...france1900, "MAR"], sub: [...ALSACE_LORRAINE, ...SPANISH_MOROCCO] },
      "imp1914/イギリス": { add: [...britain1914, WEIHAIWEI] },
      "imp1914/アメリカ合衆国": { add: ["USA", "PRI", "PHL", "GUM", "ASM"] },
      "imp1914/日本": { add: ["JPN", KURILS, "TWN", ...KOREA, SOUTH_SAKHALIN, KWANTUNG] },
      "imp1914/bg:イタリア": { add: [...italy1885, "ERI", "SOM", "LBY"], sub: TRENTINO_TRIESTE },
      "imp1914/bg:スペイン": { add: [ESP, ESP_CANARY, "ESP/Ceuta", "ESP/Melilla", "SAH", "GNQ", ...SPANISH_MOROCCO] },
      "imp1914/bg:ポルトガル": { add: portugal },
      "imp1914/bg:オランダ領東インド": { add: ["IDN"] },
      "imp1914/bg:ペルシア": { add: ["IRN"] },
      "imp1914/bg:スイス": { add: ["CHE"] },
      "imp1914/bg:アフガニスタン": { add: ["AFG"] },
      "imp1914/bg:エチオピア": { add: ["ETH"] },
      "imp1914/bg:ベルギー領コンゴ": { add: ["COD"] },
      "imp1914/bg:セルビア": { add: ["SRB", "KOS", "MKD"], sub: VOJVODINA },
      "imp1914/bg:ブルガリア": { add: ["BGR", WESTERN_THRACE], sub: ["BGR/Dobrich", "BGR/Silistra"] },
      "imp1914/bg:ルーマニア": { add: [...WALLACHIA, ...MOLDAVIA, ...DOBRUJA, "BGR/Dobrich", "BGR/Silistra"] },
      "imp1914/bg:ギリシア": { add: ["GRC"], sub: [WESTERN_THRACE] },
      "imp1914/bg:モンテネグロ": { add: ["MNE"] },
      "imp1914/bg:アルバニア": { add: ["ALB"] },
    };
  })(),
  // ===== 東アジア・南アジア（フェーズ2） =====
  "anc-2500/インダス文明": { add: INDUS },
  "anc-1750/インダス文明": { add: INDUS },
  "anc-1750/殷": { add: SHANG },
  "anc-600/周": { add: ZHOU_STATES },
  "anc-218/秦": { add: QIN },
  "anc-218/マウリヤ朝": { add: MAURYA },
  "anc-44/漢": { add: HAN },
  "anc117/漢": { add: HAN },
  "anc117/クシャーナ朝": { add: KUSHAN },
  "anc117/倭国": JAPAN_HONSHU_SOUTH,
  "anc395/グプタ朝": { add: GUPTA },
  "anc395/高句麗": { add: GOGURYEO_395 },
  "med800/唐": { add: TANG_800 },
  "med800/日本": JAPAN_HONSHU_SOUTH,
  "med800/新羅": { add: UNIFIED_SILLA },
  "med962/宋": { add: NORTHERN_SONG },
  "med962/高麗": { add: GORYEO },
  "med962/日本": JAPAN_MAIN,
  "med1095/宋": { add: NORTHERN_SONG },
  "med1095/高麗": { add: GORYEO },
  "med1095/日本": JAPAN_MAIN,
  "med1204/宋": { add: SOUTHERN_SONG },
  "med1204/高麗": { add: GORYEO },
  "med1204/日本": JAPAN_MAIN,
  "med1204/モンゴル帝国": { add: MONGOL_1206 },
  "med1204/デリー＝スルタン朝": { add: DELHI_1204 },
  "med1360/元": { add: YUAN },
  "med1360/高麗": { add: GORYEO_1360 },
  "med1360/日本": JAPAN_MAIN,
  "med1360/デリー＝スルタン朝": { add: DELHI_1360 },
  "ren1492/明": { add: MING },
  "ren1492/朝鮮": { add: KOREA_ALL },
  "ren1492/日本": JAPAN_MAIN,
  "ren1517/明": { add: MING },
  "ren1517/朝鮮": { add: KOREA_ALL },
  "ren1517/日本": JAPAN_MAIN,
  "ren1555/明": { add: MING },
  "ren1555/朝鮮": { add: KOREA_ALL },
  "ren1555/日本": JAPAN_MAIN,
  "ren1555/ムガル帝国": { add: MUGHAL_1555 },
  "abs1648/清": { add: QING_1648 },
  "abs1648/日本": JAPAN_EDO,
  "abs1648/ムガル帝国": { add: MUGHAL_1648 },
  "abs1715/清": { add: QING_1715, sub: QING_1715_SUB },
  "abs1715/日本": JAPAN_EDO,
  "abs1715/ムガル帝国": { add: MUGHAL_1715 },
  "abs1772/清": { add: QING_1772 },
  "abs1772/日本": JAPAN_EDO,
  "abs1772/ムガル帝国": { add: MUGHAL_1772 },
  "rev1812/清": { add: QING_1772 },
  "rev1812/日本": JAPAN_MODERN,
  "rev1812/インド": { add: BRITISH_INDIA_1815 },
  "rev1815/清": { add: QING_1772 },
  "rev1815/日本": JAPAN_MODERN,
  "rev1815/インド": { add: BRITISH_INDIA_1815 },
  "rev1871/清": { add: QING_1871 },
  "rev1871/日本": JAPAN_MODERN,
  "rev1871/インド": { add: BRITISH_INDIA_1871 },

};
