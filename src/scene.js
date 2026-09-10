import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

function groundTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#d9dbdf"; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i += 1) {
    const v = Math.random() > .5 ? 0 : 255;
    ctx.fillStyle = `rgba(${v},${v},${v},${Math.random() * .035})`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Keep at least a 2560-pixel long edge, also after resizing or changing displays.
export function resizeRenderer(renderer, camera) {
  const width = Math.max(1, window.innerWidth);
  const height = Math.max(1, window.innerHeight);
  const gl = renderer.getContext();
  const maxSize = Math.min(renderer.capabilities.maxTextureSize, gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
  const ratio = Math.min(Math.max(window.devicePixelRatio || 1, 2560 / Math.max(width, height)), 2 * Math.max(1, 2560 / Math.max(width, height)), maxSize / Math.max(width, height));
  renderer.setPixelRatio(ratio);
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(23)) * Math.max(1, .85 / camera.aspect)));
  camera.updateProjectionMatrix();
}

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc9ccd1);
  scene.fog = new THREE.Fog(0xc9ccd1, 13, 31);
  const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, .1, 100);
  camera.position.set(7.8, 5.4, 10.8);
  camera.lookAt(0, 1.35, -2.05);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
    precision: "highp",
  });
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(environment, .04).texture;
  scene.environmentIntensity = .35;
  environment.dispose();
  pmrem.dispose();
  resizeRenderer(renderer, camera);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  document.getElementById("app").appendChild(renderer.domElement);

  const floor = new THREE.Mesh(new THREE.CircleGeometry(22, 80), new THREE.MeshStandardMaterial({ color: 0xd9dbdf, roughness: .96, map: groundTexture() }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  const ambient = new THREE.HemisphereLight(0xf7f9ff, 0x747986, 1.45);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xf8fbff, 2.45);
  key.position.set(-5, 9, 6); key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096); key.shadow.camera.left = -9; key.shadow.camera.right = 9; key.shadow.camera.top = 8; key.shadow.camera.bottom = -8;
  scene.add(key);
  const screenGlow = new THREE.PointLight(0xd6e4ff,0,2.6,2);
  screenGlow.position.set(-.04,2.08,-2.25);scene.add(screenGlow);
  const dayColor=new THREE.Color(0xc9ccd1),nightColor=new THREE.Color(0x202735);
  let night=false,blend=0;
  function setNightMode(value) { night=value;document.body.classList.toggle('night-mode',value); }
  function updateLighting(delta) {
    blend=THREE.MathUtils.damp(blend,night?1:0,5,Math.min(delta,.1));
    ambient.intensity=THREE.MathUtils.lerp(1.45,.22,blend);
    key.intensity=THREE.MathUtils.lerp(2.45,.12,blend);
    scene.environmentIntensity=THREE.MathUtils.lerp(.35,.065,blend);
    scene.background.copy(dayColor).lerp(nightColor,blend);
    scene.fog.color.copy(scene.background);
    screenGlow.intensity=.85*blend;
  }
  return { scene, camera, renderer, setNightMode, updateLighting };
}
