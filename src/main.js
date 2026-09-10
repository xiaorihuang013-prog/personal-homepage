import { t, isEnglish, toggleLanguage, onLanguage } from "./language.js";
import * as THREE from "three";
import { createGuestbook } from "./guestbook.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { createPlant } from "./plant.js";
import { createPosters, createMusicCorner } from "./music-corner.js";
import { createScene, resizeRenderer } from "./scene.js";
import { createFurniture } from "./furniture.js";
import { setupInteractions } from "./interactions.js";
import { profile, cards } from "./content.js";
import { whenReady } from "./loading.js";

const languageButton=document.getElementById('language-toggle');
languageButton.addEventListener('click',toggleLanguage);
onLanguage(()=>{
  document.documentElement.lang=isEnglish()?'en':'zh-CN';
  document.title=t('8suns 的房间',"8suns’ room");
  languageButton.textContent='中｜EN';
  languageButton.setAttribute('aria-label',isEnglish()?'Switch to Chinese':'切换到英文');
  document.querySelector('.hint').textContent=t('单指 / 鼠标拖动环绕 · 双指平移 · 捏合 / 滚轮缩放 · 点击灯具开关','Drag to orbit · Two fingers to pan · Pinch / scroll to zoom · Click lamps to toggle');
  document.getElementById('reset-view').textContent=t('重置视角','Reset view');
});

// ---------- 2. 创建 3D 场景与家具 ----------
const { scene, camera, renderer, setNightMode, updateLighting } = createScene();
const { interactive, toggleLamp, toggleChair, update } = createFurniture(scene, renderer);

interactive.push(...createPosters(scene, renderer));
const guestbook = createGuestbook(scene, camera, renderer);
interactive.push(guestbook.board);
createPlant(scene);
const { lamp: floorLamp, toggleFloorLamp } = createMusicCorner(scene, renderer);
interactive.push(floorLamp);

// ---------- 2.5 加载封面：素材全部就绪后淡出 ----------
function hideLoading() {
  const el = document.getElementById("loading");
  if (!el) return;
  el.classList.add("done");
  el.addEventListener("transitionend", () => el.remove(), { once: true });
  setTimeout(() => el.remove(), 700); // 过渡未触发时兜底移除
}
whenReady(hideLoading);
// 兜底：极端网络卡死时也保证 15s 后进入房间
setTimeout(hideLoading, 15000);

// ---------- 3. 2D 卡片（弹层） ----------
const overlay = document.getElementById("overlay");

function buildCard(id) {
  const data = cards[id];
  const section = document.createElement("section");
  section.className = id === "bookshelf" ? "card books-card" : "card";

  // 头部：标题 + 关闭按钮
  const header = document.createElement("div");
  header.className = "card-header";
  const titleWrap = document.createElement("div");
  const h2 = document.createElement("h2");
  h2.textContent = t(data.title, data.titleEn || data.title);
  const sub = document.createElement("p");
  sub.className = "subtitle";
  sub.textContent = t(data.subtitle, data.subtitleEn || data.subtitle);
  titleWrap.append(h2, sub);

  const close = document.createElement("button");
  close.className = "close-btn";
  close.textContent = "✕";
  close.setAttribute("aria-label", t("关闭", "Close"));
  close.addEventListener("click", closeCard);
  header.append(titleWrap, close);
  section.appendChild(header);

  if(data.type === 'film') {
    section.classList.add('film-card');
    const layout=document.createElement('div');layout.className='film-layout';
    const img=document.createElement('img');img.src=data.src;img.alt=t(data.title,data.titleEn);
    const detail=document.createElement('div');
    const director=document.createElement('p');director.className='film-director';director.textContent=t('导演：'+data.director,'Director: '+data.directorEn);
    const synopsis=document.createElement('p');synopsis.className='film-synopsis';synopsis.textContent=t(data.text,data.textEn);
    const link=document.createElement('a');link.href=t(data.douban,data.imdb);link.textContent=t('跳转豆瓣','IMDb');link.target='_blank';link.rel='noopener noreferrer';
    detail.append(director,synopsis,link);layout.append(img,detail);section.append(layout);
  }
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
        img.decoding = "async";
        fig.appendChild(img);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "thumb";
        placeholder.style.background = item.color || "#d8ccc4";
        fig.appendChild(placeholder);
      }
      const cap = document.createElement("figcaption");
      cap.textContent = t(item.caption, item.captionEn || item.caption);
      fig.appendChild(cap);
      gal.appendChild(fig);
    });
    section.appendChild(gal);
  } else if (data.type === "text") {
    const p = document.createElement("p");
    p.className = "card-text";
    p.textContent = t(data.text, data.textEn || data.text);
    section.appendChild(p);
  }

  return section;
}

let activeCard=null;
window.addEventListener("languagechange",()=>{if(activeCard)openCard(activeCard);});
function openCard(id) {
  activeCard=id;
  overlay.innerHTML = "";
  overlay.appendChild(buildCard(id));
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add("open"));
}

function closeCard() {
  activeCard=null;
  overlay.classList.remove("open");
  overlay.hidden = true;
  overlay.innerHTML = "";
}

// 点击遮罩空白处关闭
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeCard();
});

// ---------- 4. 交互：点击物件 -> 打开卡片 / 切换台灯 ----------
const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const outline=new OutlinePass(new THREE.Vector2(innerWidth,innerHeight),scene,camera);
outline.visibleEdgeColor.set(0xffffff);outline.hiddenEdgeColor.set(0x000000);
outline.edgeStrength=3;outline.edgeThickness=1;outline.edgeGlow=0;
composer.addPass(outline);composer.addPass(new OutputPass());
let deskLampOn=false, floorLampOn=false;
const { controls, resetView } = setupInteractions({
  camera,
  renderer,
  interactive,
  onHover(object) { outline.selectedObjects=object?[object]:[]; },
  onSelect(id) {
    if (id === "lamp") {deskLampOn=toggleLamp();setNightMode(deskLampOn||floorLampOn);}
    else if (id === "floorLamp") {floorLampOn=toggleFloorLamp();setNightMode(deskLampOn||floorLampOn);}
    else if (id === "chair") toggleChair();
    else if (id === "computer") return;
    else if (id === "resume") window.open("https://xiaorihuang013-prog.github.io/xiaoyuehuang_portfolio/", "_blank", "noopener,noreferrer");
    else if (id === "guestbookMarker") guestbook.start();
    else if (cards[id]) openCard(id);
  },
});

document.getElementById("reset-view").addEventListener("click", resetView);

// ---------- 5. 渲染循环 ----------
let previousFrame = performance.now();
function animate(now = performance.now()) {
  requestAnimationFrame(animate);
  update((now - previousFrame) / 1000);
  updateLighting((now - previousFrame) / 1000);
  previousFrame = now;
  controls.update();
  guestbook.update(now);
  composer.render();
}
animate();

// 窗口尺寸变化自适应
window.addEventListener("resize", () => {
  resizeRenderer(renderer, camera);
  composer.setPixelRatio(renderer.getPixelRatio());
  composer.setSize(innerWidth,innerHeight);
});
