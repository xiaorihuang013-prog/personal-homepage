import * as THREE from "three";

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

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xd9dbdf);
  scene.fog = new THREE.Fog(0xd9dbdf, 13, 31);
  const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, .1, 100);
  camera.position.set(4.6, 3.65, 6.25);
  camera.lookAt(0, 1.35, -2.05);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  document.getElementById("app").appendChild(renderer.domElement);

  const floor = new THREE.Mesh(new THREE.CircleGeometry(22, 80), new THREE.MeshStandardMaterial({ color: 0xd9dbdf, roughness: .96, map: groundTexture() }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  scene.add(new THREE.HemisphereLight(0xf7f9ff, 0x747986, 1.45));
  const key = new THREE.DirectionalLight(0xf8fbff, 2.45);
  key.position.set(-5, 9, 6); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -9; key.shadow.camera.right = 9; key.shadow.camera.top = 8; key.shadow.camera.bottom = -8;
  scene.add(key);
  return { scene, camera, renderer };
}
