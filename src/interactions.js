import * as THREE from "three";

// Direct pointer-driven orbit control, independent of browser-specific defaults.
export function setupInteractions({ camera, renderer, interactive, onSelect }) {
  const el = renderer.domElement;
  const target = new THREE.Vector3(0, 1.15, -1.05);
  const initialSpherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(target));
  const spherical = initialSpherical.clone();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const down = { x: 0, y: 0, t: 0 };
  let dragging = false;
  let highlighted = null;

  el.style.touchAction = "none";
  el.style.cursor = "grab";
  el.tabIndex = 0;

  function startsOnCanvas(event) {
    const rect = el.getBoundingClientRect();
    return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
  }

  function updateCamera() {
    camera.position.copy(target).add(new THREE.Vector3().setFromSpherical(spherical));
    camera.lookAt(target);
  }
  function resetView() { spherical.copy(initialSpherical); updateCamera(); }
  function findInteractive(object) {
    let current = object;
    while (current) { if (current.userData?.id) return current; current = current.parent; }
    return null;
  }
  function pick(event) {
    pointer.x = event.clientX / window.innerWidth * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(interactive, true)[0];
    return hit ? findInteractive(hit.object) : null;
  }
  function highlight(object) {
    if (highlighted === object) return;
    if (highlighted) highlighted.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      child.material.emissive?.setHex(child.userData.originalEmissive ?? 0x000000);
      child.material.emissiveIntensity = child.userData.originalIntensity ?? 1;
    });
    highlighted = object;
    if (highlighted) highlighted.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      if (child.userData.originalEmissive === undefined) {
        child.userData.originalEmissive = child.material.emissive?.getHex() ?? 0x000000;
        child.userData.originalIntensity = child.material.emissiveIntensity ?? 1;
      }
      child.material.emissive?.setHex(0x6f8da4);
      child.material.emissiveIntensity = .45;
    });
  }

  window.addEventListener("mousedown", (event) => {
    if (event.button !== 0 || !startsOnCanvas(event)) return;
    event.preventDefault();
    dragging = false;
    down.x = event.clientX; down.y = event.clientY; down.t = performance.now();
    el.style.cursor = "grabbing";
  }, true);
  window.addEventListener("mousemove", (event) => {
    if (down.t) {
      event.preventDefault();
      const dx = event.clientX - down.x;
      const dy = event.clientY - down.y;
      if (Math.hypot(dx, dy) > 2) dragging = true;
      if (dragging) {
        spherical.theta -= dx * .008;
        spherical.phi = THREE.MathUtils.clamp(spherical.phi - dy * .008, Math.PI * .08, Math.PI * .49);
        down.x = event.clientX; down.y = event.clientY;
        updateCamera();
        return;
      }
    }
    const object = pick(event);
    highlight(object);
    el.style.cursor = object ? "pointer" : "grab";
  }, true);
  window.addEventListener("mouseup", (event) => {
    if (!down.t) return;
    event.preventDefault();
    el.style.cursor = "grab";
    if (!dragging && performance.now() - down.t < 500) {
      const object = pick(event);
      if (object) onSelect(object.userData.id);
    }
    down.t = 0;
  }, true);
  el.addEventListener("wheel", (event) => {
    event.preventDefault();
    spherical.radius = THREE.MathUtils.clamp(spherical.radius * Math.exp(event.deltaY * .001), 4.2, 14);
    updateCamera();
  }, { passive: false });

  updateCamera();
  return { controls: { update() {} }, resetView };
}
