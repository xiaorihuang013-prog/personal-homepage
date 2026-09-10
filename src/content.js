// ============================================================
//  内容数据 —— 以后更新作品集，只需要改这个文件即可
//  把所有占位文字 / 链接换成你自己的真实内容
// ============================================================

// 顶部：名字 + 一句简介 + 角落的链接入口
export const profile = {
  name: "你的名字 · DEV ROOM",
  tagline: "AIGC / CREATIVE CODE / DIGITAL EXPERIMENTS",
  links: [
    { label: "关于我", url: "#about" },
    { label: "联系我", url: "mailto:you@example.com" },
  ],
};

// 每个可点击物件对应的 2D 卡片内容
// type 可选：
//   "list"     -> 列表（项目 / 文章）
//   "gallery"  -> 照片墙（先用色块占位，可换成真实图片 src）
//   "text"     -> 一段文字（关于我）
export const cards = {
  photography: {title:"八日的摄影集", titleEn:"8suns’ Photography", subtitle:"", type:"text", text:"摄影作品正在整理中，敬请期待。", textEn:"My photo collection is coming soon."},
  aiProjects: { title: "AI 项目（学习中...）", titleEn: "AI projects (learning...)", textEn: "My AI experiments will appear here. Photos and notes are coming soon.", subtitle: "八日的实验", subtitleEn: "8suns’ experiments", type: "text", text: "这里将放置我的 AI 学习项目，照片和文字正在整理中。" },
  computer: {
    title: "PROJECTS.EXE",
    subtitle: "从屏幕进入我的数字作品集",
    type: "list",
    items: [
      { name: "作品 01 · 3D 个人空间", desc: "用沉浸式网页呈现个人表达与项目内容", url: "https://example.com" },
      { name: "作品 02 · AI 视觉实验", desc: "在此替换你的作品链接、封面和一句项目说明", url: "https://example.com" },
      { name: "作品 03 · 交互网页", desc: "把最希望被看到的项目放在这里", url: "https://example.com" },
    ],
  },
  bookshelf: {
    title: "八日的书架", titleEn: "8suns' Bookshelf",
    subtitle: "", subtitleEn: "",
    type: "gallery",
    items: [
      { caption: "一个悲观主义者的积极思考", captionEn: "一个悲观主义者的积极思考 (Chinese edition)", src: `${import.meta.env.BASE_URL}books/book-1.png` },
      { caption: "明亮的夜晚", captionEn: "Bright Night", src: `${import.meta.env.BASE_URL}books/book-2.png` },
      { caption: "世上最美的溺水者", captionEn: "The Handsomest Drowned Man in the World", src: `${import.meta.env.BASE_URL}books/book-3.png` },
      { caption: "雌犬", captionEn: "The Bitch", src: `${import.meta.env.BASE_URL}books/book-4.png` },
      { caption: "罪与罚", captionEn: "Crime and Punishment", src: `${import.meta.env.BASE_URL}books/book-5.png` },
      { caption: "一间自己的房间", captionEn: "A Room of One’s Own", src: `${import.meta.env.BASE_URL}books/book-6.png` },
      { caption: "十八岁出门远行", captionEn: "On the Road at Eighteen", src: `${import.meta.env.BASE_URL}books/book-7.png` },
    ],
  },
};

const films = [
  ['能召回前世的布米叔叔（2010）','Uncle Boonmee Who Can Recall His Past Lives (2010)','阿彼察邦·韦拉斯哈古','Apichatpong Weerasethakul','身患重病的布米回到乡间，与逝去的亲人再次相遇。在丛林与记忆之间，他回望生命与前世。','A dying man spends his last days in the countryside, visited by lost family members. The jungle draws him into memories and traces of past lives.','4280102','tt1588895'],
  ['蓦然回首（2024）','Look Back (2024)','押山清高','Kiyotaka Oshiyama','两个性格迥异的女孩因绘画结缘，一起追逐漫画梦想。成长与失去，让她们重新理解创作的意义。','Two very different girls bond over drawing and pursue their manga dreams. Growing up and experiencing loss reshape the meaning of their art.','36765646','tt31711040'],
  ['宝宝刺客（2023）','Baby Assassins: Nice Days (2024)','阪元裕吾','Yugo Sakamoto','千里和真寻来到宫崎执行任务，却与一名危险的独行杀手狭路相逢。平凡日常被打破，两人的默契面临考验。','Chisato and Mahiro travel to Miyazaki for an assignment and cross paths with a dangerous lone assassin. Their everyday rhythm gives way to a test of their partnership.','36613599','tt32382919'],
  ['记忆（2021）','Memoria (2021)','阿彼察邦·韦拉斯哈古','Apichatpong Weerasethakul','在哥伦比亚，一名女子被神秘的巨响困扰，开始追寻声音的来源。旅途中，个人记忆与土地的往事逐渐交叠。','A woman in Colombia is troubled by a mysterious bang and searches for its source. Her journey brings personal memory into contact with the history of the land.','30137576','tt8399288'],
  ['生吃（2016）','Raw (2016)','朱利亚·迪库诺','Julia Ducournau','坚持素食的少女进入兽医学校，在迎新仪式后发现陌生的欲望。她与姐姐的关系也随着身体和身份的变化变得复杂。','A vegetarian begins veterinary school and discovers an unfamiliar appetite after a hazing ritual. Her changing body and identity complicate her relationship with her sister.','26653833','tt4954522'],
  ['完美的日子（2023）','Perfect Days (2023)','维姆·文德斯','Wim Wenders','东京的清洁工平山，在音乐、书籍和树影中享受规律的生活。几次意外相遇，悄悄打开了他的内心世界。','Hirayama, a cleaner in Tokyo, finds pleasure in music, books and light through the trees. Unexpected encounters gradually reveal more of his inner life.','35902857','tt27503384'],
];
films.forEach(([title,titleEn,director,directorEn,text,textEn,douban,imdb],i)=>{
  cards[`film-${i}`]={type:'film',title,titleEn,subtitle:'',src:`${import.meta.env.BASE_URL}posters/poster-${i+2}.png`,director,directorEn,text,textEn,douban:`https://movie.douban.com/subject/${douban}/`,imdb:`https://www.imdb.com/title/${imdb}/`};
});
