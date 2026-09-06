import { createScene } from "./scene.js";
import { createFurniture } from "./furniture.js";
import { setupInteractions } from "./interactions.js";
import { profile, cards } from "./content.js";

// ---------- 1. 填充页面文字（名字 / 简介 / 链接入口） ----------
document.getElementById("profile-name").textContent = profile.name;
document.getElementById("profile-tagline").textContent = profile.tagline;

const linksEl = document.getElementById("links");
profile.links.forEach((l) => {
  const a = document.createElement("a");
  a.href = l.url;
  a.textContent = l.label;
  a.target = "_blank";
  a.rel = "noopener";
  linksEl.appendChild(a);
});

// ---------- 2. 创建 3D 场景与家具 ----------
const { scene, camera, renderer } = createScene();
const { interactive, lampLight, recordDisc } = createFurniture(scene);

// ---------- 3. 2D 卡片（弹层） ----------
const overlay = document.getElementById("overlay");

function buildCard(id) {
  const data = cards[id];
  const section = document.createElement("section");
  section.className = "card";

  // 头部：标题 + 关闭按钮
  const header = document.createElement("div");
  header.className = "card-header";
  const titleWrap = document.createElement("div");
  const h2 = document.createElement("h2");
  h2.textContent = data.title;
  const sub = document.createElement("p");
  sub.className = "subtitle";
  sub.textContent = data.subtitle;
  titleWrap.append(h2, sub);

  const close = document.createElement("button");
  close.className = "close-btn";
  close.textContent = "✕";
  close.setAttribute("aria-label", "关闭");
  close.addEventListener("click", closeCard);
  header.append(titleWrap, close);
  section.appendChild(header);

  // 内容区，按类型渲染
  if (data.type === "list") {
    const list = document.createElement("div");
    list.className = "card-list";
    data.items.forEach((item) => {
      const a = document.createElement("a");
      a.href = item.url;
      a.target = "_blank";
      a.rel = "noopener";
      const name = document.createElement("div");
      name.className = "item-name";
      name.textContent = item.name;
      const desc = document.createElement("div");
      desc.className = "item-desc";
      desc.textContent = item.desc;
      a.append(name, desc);
      list.appendChild(a);
    });
    section.appendChild(list);
  } else if (data.type === "gallery") {
    const gal = document.createElement("div");
    gal.className = "gallery";
    data.items.forEach((item) => {
      const fig = document.createElement("figure");
      if (item.src) {
        const img = document.createElement("img");
        img.className = "thumb";
        img.src = item.src;
        img.alt = item.caption;
        fig.appendChild(img);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "thumb";
        placeholder.style.background = item.color || "#d8ccc4";
        fig.appendChild(placeholder);
      }
      const cap = document.createElement("figcaption");
      cap.textContent = item.caption;
      fig.appendChild(cap);
      gal.appendChild(fig);
    });
    section.appendChild(gal);
  } else if (data.type === "text") {
    const p = document.createElement("p");
    p.className = "card-text";
    p.textContent = data.text;
    section.appendChild(p);
  }

  return section;
}

function openCard(id) {
  overlay.innerHTML = "";
  overlay.appendChild(buildCard(id));
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add("open"));
}

function closeCard() {
  overlay.classList.remove("open");
  overlay.hidden = true;
  overlay.innerHTML = "";
}

// 点击遮罩空白处关闭
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeCard();
});

// ---------- 4. 交互：点击物件 -> 打开卡片 / 切换台灯 ----------
function toggleLamp() {
  lampLight.intensity = lampLight.intensity > 0 ? 0 : 2.6;
}

let recordPlaying = false;

const { controls, resetView } = setupInteractions({
  camera,
  renderer,
  interactive,
  onSelect(id) {
    if (id === "lamp") toggleLamp();
    else if (id === "record") {
      recordPlaying = !recordPlaying;
      openCard(id);
    } else if (cards[id]) openCard(id);
  },
});

document.getElementById("reset-view").addEventListener("click", resetView);

// ---------- 5. 渲染循环 ----------
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  if (recordPlaying) recordDisc.rotation.y += 0.045;
  renderer.render(scene, camera);
}
animate();

// 窗口尺寸变化自适应
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
