import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function createCat(scene) {
  const cat = new THREE.Group();
  cat.position.set(3.65, .065, -.28);
  cat.rotation.y = -.25;
  cat.userData.id = 'cat';
  scene.add(cat);
  let model = null;
  let awake = false;
  let progress = 0;
  let neck = null;
  let restNeck = null;
  new GLTFLoader().load(`${import.meta.env.BASE_URL}models/cat/fripouille.glb`, gltf => {
    model = gltf.scene;
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    const scale = .64 / Math.max(size.x, size.y, size.z);
    model.scale.multiplyScalar(scale);
    model.updateMatrixWorld(true);
    bounds.setFromObject(model);
    const center = bounds.getCenter(new THREE.Vector3());
    model.position.add(new THREE.Vector3(-center.x, -bounds.min.y, -center.z));
    model.traverse(object => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
      // The supplied rig includes a neck chain, but no authored animation clips.
      if (object.isBone && object.name === 'Bone003_04') neck = object;
    });
    if (neck) restNeck = neck.quaternion.clone();
    cat.add(model);
  }, undefined, error => {
    console.error('Unable to load cat model', error);
    const notice = document.createElement('p');
    notice.textContent = '小猫模型加载失败，请刷新页面重试。';
    notice.setAttribute('role', 'status');
    notice.style.cssText = 'position:fixed;bottom:20px;left:20px;color:#733;background:#fff;padding:12px;z-index:20';
    document.body.append(notice);
  });
  return {
    cat,
    toggle() { awake = !awake; },
    update(delta, time) {
      if (!model) return;
      progress = THREE.MathUtils.damp(progress, awake ? 1 : 0, 1.2, Math.min(delta, .05));
      if (neck && restNeck) {
        neck.quaternion.copy(restNeck).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1), -.12 * progress));
      }
      // Subtle breathing; a full lying-to-sitting animation still needs authoring.
      cat.scale.y = 1 + Math.sin(time * 1.6) * .003;
    },
  };
}
