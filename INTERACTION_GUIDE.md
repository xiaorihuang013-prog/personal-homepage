# 房间交互指南 · 设计规范

> 这是一份**设计规范文档**：定义「房间里的物件」如何映射到「作品集内容」。
> 房间 = 一个可漫游的作品集，每个物件都是一扇进入某类内容的门。
> 状态标记：★ 已实现　✦ 待实现（设计稿）

---

## 1. 定位

把「个人作品集」藏进一间 3D 房间：访客像走进你的工作室一样自由环视，点击感兴趣的东西，
就能看到对应的人生切片。**空间即导航，物件即入口。**

- 想让访客先看到的内容，放在一眼可见、容易点到的地方（电脑、海报墙）。
- 彩蛋型内容（椅子、灯具、植物）留给愿意探索的人，作为惊喜。

---

## 2. 全局导航手势（已实现）

以下手势来自 `src/interactions.js`，与页面底部提示（`index.html` 的 `.hint`）一致：

| 操作 | 效果 |
|---|---|
| 单指 / 鼠标左键拖动 | 环绕旋转视角 |
| 双指拖动 | 平移视角 |
| 捏合 / 滚轮 | 缩放（远近） |
| 单击可交互物件 | 选中该物件，触发对应行为 |
| 悬停可交互物件 | 高亮 + 光标变 `pointer` |
| 点击「重置视角」按钮 | 回到初始机位（右下角） |

---

## 3. 物件 → 内容映射总表（核心）

| 物件 | 交互 | 卡片 type | 标题建议 | 内容方向 |
|---|---|---|---|---|
| ★ 🖥️ 电脑屏幕 | 打开卡片 | `list` | `CAREER / 工作经历` | 每段工作经历（公司 / 角色 / 时间），列表首项放「查看完整作品集 →」入口，链接第一份 portfolio 网站 |
| ✦ 📷 相机 | 打开卡片 | `gallery` | `PHOTOGRAPHY / 摄影集` | 摄影作品，`src` 换真实图 + `caption` 注明地点/主题 |
| ★ 📚 书架的书 | 打开卡片 | `list` | `BOOKSHELF / 读过的书` | 读过的 / 喜欢的书：书名 + 一句话书评，可链豆瓣或读书笔记 |
| ✦ 🎬 海报 ×6 | 每张打开独立卡片 | `text` | 电影名 | 每张海报对应一部电影：`title`=片名，`subtitle`=导演 · 年份，`text`=一段简介 |
| ✦ 🎸 音乐角 | 打开卡片 | `list` | `MUSIC / 正在听` | 喜欢的专辑 / 歌单 / 乐队（建议挂在贝斯或音箱上） |
| ✦ 🌿 植物 | 打开卡片 | `text` | `ABOUT / 关于我` | 关于我 / 近况，可与右上角「关于我」入口联动 |
| ★ 💡 台灯 / 落地灯 | 开关（非卡片） | — | — | 切换灯 + 昼夜模式（`setNightMode`） |
| ★ 🪑 椅子 | 开关（非卡片） | — | — | 拉出 / 旋转动画 |
| ★ 🏷️ 右上角链接 | 外链 | — | — | 关于我 / 联系我（`profile.links`） |

### 海报 ↔ 电影的对应关系

墙上共 6 张海报，文件为 `public/posters/poster-2.png` ~ `poster-7.png`（`music-corner.js` 中 `posterId = i + 2`）。
建议每张的 `userData.id` 直接用文件名编号，方便对照替换：

| 海报 | 建议 id | 对应内容 |
|---|---|---|
| poster-2 | `poster-2` | 电影 ① |
| poster-3 | `poster-3` | 电影 ② |
| poster-4 | `poster-4` | 电影 ③ |
| poster-5 | `poster-5` | 电影 ④ |
| poster-6 | `poster-6` | 电影 ⑤ |
| poster-7 | `poster-7` | 电影 ⑥ |

> 注：`poster-1.png` 存在于目录但未上墙，可作为替换/新增的备选。

---

## 4. 卡片内容类型规范

卡片由 `src/main.js` 的 `buildCard(id)` 按 `type` 渲染，字段定义在 `src/content.js`。目前支持 3 种：

### `list` — 列表
适用于：工作经历、读过的书、音乐、项目归档。
```js
{
  title: "标题",
  subtitle: "副标题 / 一句话说明",
  type: "list",
  items: [
    { name: "条目名", desc: "一句话描述", url: "https://..." }, // 整条可点击跳转
  ],
}
```

### `gallery` — 照片墙
适用于：摄影集、视觉作品。
```js
{
  title: "标题",
  subtitle: "副标题",
  type: "gallery",
  items: [
    { src: "/photos/01.jpg", caption: "地点 · 一句话" },   // 真实图片
    { color: "#d8ccc4",       caption: "占位色块" },        // 还没图时的色块占位
  ],
}
```

### `text` — 一段文字
适用于：电影简介、关于我。
```js
{
  title: "片名 / 标题",
  subtitle: "导演 · 年份",
  type: "text",
  text: "一段完整的简介文字……",
}
```

---

## 5. 交互反馈规范（统一标准）

新物件接入时，遵循以下已实现的行为，保持体感一致：

| 反馈 | 规范 | 出处 |
|---|---|---|
| 悬停高亮 | `emissive` 置为 `0x6f8da4`，`emissiveIntensity` 0.25 | `interactions.js` highlight |
| 光标态 | 默认 `grab` → 悬停可点 `pointer` → 拖动中 `grabbing` | `interactions.js` |
| 点击判定 | 位移 < 4px 且时长 < 500ms 才算「点击」，否则视为「拖动」 | `interactions.js`（move / release） |
| 卡片打开 | 遮罩淡入 + 卡片上浮（`.overlay.open`） | `style.css` |
| 卡片关闭 | 点击 ✕ / 点击遮罩空白处 | `main.js` closeCard |
| 不参与高亮 | `userData.noHighlight = true`（台灯、落地灯、椅子） | `furniture.js` |

**待补充（建议）**：ESC 键关闭卡片；卡片打开时锁定视角旋转，避免误拖。

---

## 6. 内容维护指南

**所有文案 / 链接都集中在 `src/content.js`**，改内容只动这一个文件：

- `profile`：顶部名字、一句话简介、右上角链接（关于我 / 联系我）。
- `cards`：每个可点击物件对应的卡片内容，key 必须与物件的 `userData.id` 一致。

改完 `content.js` 即可生效，无需触碰 3D 场景代码。

---

## 7. 待实现清单（gap）

本次仅交付文档，以下是「已设计、未接线」的物件与实现要点：

| 物件 | 文件 | 待做 |
|---|---|---|
| 📷 相机 | `furniture.js` `cameraModel` | 给 group 设 `userData.id = "camera"`，加入 `interactive` |
| 🎬 海报 ×6 | `music-corner.js` `createPosters` | 每个 poster group 设 `userData.id = "poster-N"`，加入 `interactive` |
| 🎸 音乐角 | `music-corner.js` `createMusicCorner` | 贝斯/音箱设 `userData.id = "music"`，加入 `interactive` |
| 🌿 植物 | `plant.js` `createPlant` | 设 `userData.id = "plant"`，加入 `interactive` |

**通用接线流程**（4 步，改完即可点）：
1. 给目标 `Group`/`Mesh` 设 `userData.id`（如 `"camera"`）。
2. 把该对象 push 进 `createFurniture` 返回的 `interactive` 数组（或在 `main.js` 里 push）。
3. 在 `src/content.js` 的 `cards` 里加同 key 的卡片内容。
4. `main.js` 的 `onSelect` 已用 `cards[id]` 自动匹配，无需再改点击逻辑。

---

## 8. 附：内容占位模板

复制到 `src/content.js` 后替换为真实内容即可：

```js
export const cards = {
  // ★ 已接线，替换内容即可
  computer: {
    title: "CAREER / 工作经历",
    subtitle: "每一段经历，都是一次积累",
    type: "list",
    items: [
      { name: "查看完整作品集 →", desc: "第一份 portfolio 网站", url: "https://your-portfolio.example.com" },
      { name: "公司 / 职位", desc: "时间 · 一句话概括", url: "https://..." },
      { name: "公司 / 职位", desc: "时间 · 一句话概括", url: "https://..." },
    ],
  },
  bookshelf: {
    title: "BOOKSHELF / 读过的书",
    subtitle: "那些影响过我的书",
    type: "list",
    items: [
      { name: "书名", desc: "作者 · 一句话书评", url: "https://book.douban.com/..." },
      { name: "书名", desc: "作者 · 一句话书评", url: "https://book.douban.com/..." },
    ],
  },

  // ✦ 待接线，先把内容备好
  camera: {
    title: "PHOTOGRAPHY / 摄影集",
    subtitle: "用镜头记下的瞬间",
    type: "gallery",
    items: [
      { src: "/photos/01.jpg", caption: "地点 · 一句话" },
      { color: "#d8ccc4", caption: "还没放图时的占位色块" },
    ],
  },
  "poster-2": { title: "电影名 ①", subtitle: "导演 · 年份", type: "text", text: "一段电影简介……" },
  "poster-3": { title: "电影名 ②", subtitle: "导演 · 年份", type: "text", text: "一段电影简介……" },
  "poster-4": { title: "电影名 ③", subtitle: "导演 · 年份", type: "text", text: "一段电影简介……" },
  "poster-5": { title: "电影名 ④", subtitle: "导演 · 年份", type: "text", text: "一段电影简介……" },
  "poster-6": { title: "电影名 ⑤", subtitle: "导演 · 年份", type: "text", text: "一段电影简介……" },
  "poster-7": { title: "电影名 ⑥", subtitle: "导演 · 年份", type: "text", text: "一段电影简介……" },
  music: {
    title: "MUSIC / 正在听",
    subtitle: "最近循环的歌与专辑",
    type: "list",
    items: [
      { name: "专辑 / 歌单", desc: "艺人 · 一句话", url: "https://..." },
    ],
  },
  plant: {
    title: "ABOUT / 关于我",
    subtitle: "关于这个房间和它的主人",
    type: "text",
    text: "一段自我介绍……",
  },
};
```

---

### 文件索引

| 文件 | 作用 |
|---|---|
| `src/content.js` | **内容唯一入口**（名字 / 简介 / 链接 / 卡片） |
| `src/main.js` | 组装场景、渲染卡片、分发点击（`onSelect`） |
| `src/interactions.js` | 手势 / 高亮 / 点击判定 |
| `src/furniture.js` | 电脑、书、台灯、椅子、相机、笔记本、咖啡 |
| `src/music-corner.js` | 海报墙、音乐角（贝斯 / 音箱 / 豆袋）、落地灯 |
| `src/plant.js` | 植物 |
| `src/scene.js` | 场景、光照、昼夜模式 |
