import * as THREE from "three";

// Direct pointer-driven orbit control, independent of browser-specific defaults.
export function setupInteractions({ camera, renderer, interactive, onSelect, onHover = () => {} }) {
  const el = renderer.domElement;
  const target = new THREE.Vector3(1.1, 1.45, -1.25);
  const initialTarget = target.clone();
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
  function resetView() { focus=null;highlight(null); target.copy(initialTarget); spherical.copy(initialSpherical); updateCamera(); }
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
  let focus = null;
  function highlight(object) {
    if (highlighted === object) return;
    highlighted = object;
    onHover(object);
  }
  function selectObject(object) {
    if (["bass", "chair", "lamp", "floorLamp", "guestbookMarker", "resume", "aiProjects"].includes(object.userData.id)) {
      focus = null;
      onSelect(object.userData.id);
      return;
    }
    const subject = object.userData.focusTarget || object;
    const bounds = new THREE.Box3().setFromObject(subject);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    // Approach the object's local front, with a level and centered final view.
    const front = new THREE.Vector3(0, 0, 1).applyQuaternion(subject.getWorldQuaternion(new THREE.Quaternion()));
    const endTheta = Math.atan2(front.x, front.z);
    const thetaDelta = Math.atan2(Math.sin(endTheta-spherical.theta), Math.cos(endTheta-spherical.theta));
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const isComputer=object.userData.id === "computer";
    const radius = Math.max(isComputer ? .65 : 1.15, Math.max(size.y, size.x / camera.aspect) / (2 * Math.tan(halfFov)) * (isComputer ? 1.48 : 1.35) + size.z / 2);
    focus={start:performance.now(),from:target.clone(),to:center,radius:spherical.radius,
      endRadius:radius,fromTheta:spherical.theta,endTheta:spherical.theta+thetaDelta,
      fromPhi:spherical.phi,endPhi:Math.acos(THREE.MathUtils.clamp(front.y,-1,1)),object};
  }
  el.addEventListener('pointerleave', () => {highlight(null);el.style.cursor='grab';});
  el.addEventListener('mouseleave', () => {highlight(null);el.style.cursor='grab';});
  window.addEventListener('blur', () => highlight(null));

  const pointers = new Map();
  const pointerHandlers = {};
  let lastPointerTime = -Infinity;
  function listenPointer(type, handler) {
    pointerHandlers[type] = handler;
    el.addEventListener(type, event => { lastPointerTime = performance.now(); handler(event); });
  }
  // Some embedded browsers dispatch mouse-only input; avoid double handling
  // compatibility mouse events that follow a real pointer event.
  for (const [mouse, pointerType] of [['mousedown','pointerdown'],['mousemove','pointermove'],['mouseup','pointerup']]) {
    el.addEventListener(mouse, event => {
      if (performance.now() - lastPointerTime < 100) return;
      pointerHandlers[pointerType]?.({type:pointerType,pointerId:-1,button:event.button,clientX:event.clientX,clientY:event.clientY,preventDefault:()=>event.preventDefault()});
    });
  }
  let multiTouch = false;
  function pan(dx, dy) {
    const scale = 2 * spherical.radius * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / el.clientHeight;
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
    const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
    target.addScaledVector(right, dx * scale).addScaledVector(up, -dy * scale);
  }
  function pair() {
    const [a,b] = [...pointers.values()];
    return { x:(a.x+b.x)/2, y:(a.y+b.y)/2, distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)) };
  }
  listenPointer("pointerdown", (event) => {
    if (event.button !== 0) return;
    focus=null;
    event.preventDefault(); if (event.pointerId !== -1) el.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if (pointers.size === 1) {
      dragging=false; multiTouch=false;
      down.x=event.clientX;down.y=event.clientY;down.t=performance.now();
    } else { multiTouch=true; dragging=true; }
    el.style.cursor="grabbing";
  });
  listenPointer("pointermove", (event) => {
    if (!pointers.has(event.pointerId)) {
      const object=pick(event);highlight(object);el.style.cursor=object?"pointer":"grab";return;
    }
    event.preventDefault();
    const old=pointers.get(event.pointerId);
    const previous=pointers.size>=2?pair():null;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if (previous) {
      const next=pair();pan(next.x-previous.x,next.y-previous.y);
      spherical.radius=THREE.MathUtils.clamp(spherical.radius*(previous.distance/next.distance)**8.5,1.15,22);
    } else {
      if(Math.hypot(event.clientX-down.x,event.clientY-down.y)>4) dragging=true;
      if(dragging) {
        spherical.theta-=(event.clientX-old.x)*.006;
        spherical.phi=THREE.MathUtils.clamp(spherical.phi-(event.clientY-old.y)*.006,Math.PI*.08,Math.PI*.49);
      }
    }
    highlight(null);updateCamera();
  });
  function release(event) {
    highlight(null);
    if(!pointers.has(event.pointerId)) return;
    if(event.type==='pointerup' && !dragging && !multiTouch && performance.now()-down.t<500) {
      const object=pick(event);if(object)selectObject(object);
    }
    pointers.delete(event.pointerId);
    if(!pointers.size) {down.t=0;el.style.cursor='grab';}
  }
  listenPointer('pointerup',release);
  el.addEventListener('pointercancel',release);
  el.addEventListener('lostpointercapture',release);
  el.addEventListener("wheel", (event) => {
    event.preventDefault();
    highlight(null);
    focus=null;
    const trackpadScroll = event.deltaMode === 0 && (Math.abs(event.deltaX) > .5 || Math.abs(event.deltaY) < 50 || !Number.isInteger(event.deltaY));
    if (!event.ctrlKey && (trackpadScroll || event.shiftKey)) pan(event.deltaX, event.deltaY);
    else spherical.radius = THREE.MathUtils.clamp(spherical.radius * Math.exp(event.deltaY * .009), 1.15, 22);
    updateCamera();
  }, { passive: false });

  updateCamera();
  return { controls: { update() {
    if(!focus)return;
    const t=Math.min(1,(performance.now()-focus.start)/700),ease=t*t*(3-2*t);
    target.lerpVectors(focus.from,focus.to,ease);
    spherical.radius=THREE.MathUtils.lerp(focus.radius,focus.endRadius,ease);
    spherical.theta=THREE.MathUtils.lerp(focus.fromTheta,focus.endTheta,ease);
    spherical.phi=THREE.MathUtils.lerp(focus.fromPhi,focus.endPhi,ease);
    updateCamera();
    if(t===1){const object=focus.object;focus=null;onSelect(object.userData.id);}
  } }, resetView };
}
