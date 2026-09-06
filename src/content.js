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
    title: "NOTES & ARCHIVE",
    subtitle: "项目归档、技术笔记与灵感收藏",
    type: "list",
    items: [
      { name: "创作手记", desc: "记录灵感、工具和制作过程", url: "https://example.com" },
      { name: "实验项目", desc: "尚在生长的交互与视觉试验", url: "https://example.com" },
      { name: "收藏夹", desc: "影响我创作的作品与阅读", url: "https://example.com" },
    ],
  },
  record: {
    title: "NOW PLAYING",
    subtitle: "工作时循环的声音与创作状态",
    type: "text",
    text:
      "这是一段可替换的文字入口。以后你可以把它变成播放列表、创作宣言、最新动态，或链接到任何一个想让访客停留的页面。",
  },
};
