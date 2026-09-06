import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const C = {
  white: { color: 0xf1f3f4, roughness: .52 }, gray: { color: 0xadb1b8, roughness: .6 },
  black: { color: 0x202226, roughness: .34, metalness: .18 }, metal: { color: 0x555b64, roughness: .26, metalness: .72 },
  screen: { color: 0x1e2731, roughness: .2, metalness: .3 }, wood: { color: 0xa08b72, roughness: .66 }, rug: { color: 0x9a8a87, roughness: .94 },
};
const mat = (c, other = {}) => new THREE.MeshStandardMaterial({ ...c, ...other });
function box(w, h, d, c, p = [0, 0, 0], radius = .02) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, radius), mat(c)); m.position.set(...p); m.castShadow = m.receiveShadow = true; return m; }
function cylinder(a, b, h, c, p = [0, 0, 0]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(a, b, h, 28), mat(c)); m.position.set(...p); m.castShadow = m.receiveShadow = true; return m; }
function target(id) { const g = new THREE.Group(); g.userData.id = id; return g; }

function desk() {
  const g = new THREE.Group();
  g.add(box(3.3, .1, 1.15, C.white, [0, 1.35, 0], .035));
  [[-1.47, -.45], [1.47, -.45], [-1.47, .45], [1.47, .45]].forEach(([x, z]) => g.add(box(.09, 1.35, .09, C.wood, [x, .68, z], .012)));
  return g;
}
function monitor() {
  const g = target("computer");
  g.add(box(1.02, .7, .07, C.black, [0, .76, 0], .025));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(.9, .58), new THREE.MeshBasicMaterial({ color: 0x384b5a })); face.position.set(0, .76, .042); g.add(face);
  const code = new THREE.Mesh(new THREE.PlaneGeometry(.68, .025), new THREE.MeshBasicMaterial({ color: 0x9bb6c5 })); code.position.set(-.04, .87, .046); g.add(code);
  g.add(box(.07, .34, .07, C.metal, [0, .3, 0]), box(.52, .05, .28, C.metal, [0, .04, .04], .02));
  return g;
}
function lamp() {
  const g = target("lamp");
  g.add(cylinder(.18, .2, .05, C.black, [0, .025, 0]), box(.045, .64, .045, C.black, [.14, .33, 0], .01));
  const arm = box(.05, .53, .05, C.black, [-.07, .62, 0], .01); arm.rotation.z = .72; g.add(arm);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(.19, .1, 4), mat(C.black)); shade.position.set(-.26, .82, 0); shade.rotation.z = -Math.PI / 2; shade.castShadow = true; g.add(shade);
  const light = new THREE.PointLight(0xdcecff, 1.45, 4, 2); light.position.set(-.38, .79, .03); g.add(light); return { group: g, light };
}
function slr() {
  const g = new THREE.Group(); g.add(box(.6, .32, .34, C.black, [0, .17, 0], .06), box(.24, .13, .2, C.black, [-.13, .4, 0], .025));
  const lens = cylinder(.15, .15, .2, C.metal, [0, .17, .27]); lens.rotation.x = Math.PI / 2; g.add(lens);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(.115, 22), new THREE.MeshBasicMaterial({ color: 0x708fa0 })); glass.position.set(0, .17, .38); g.add(glass); return g;
}
function recordConsole() {
  const g = target("record"); g.add(box(1.42, .2, .7, C.black, [0, 1.05, 0], .035), box(1.36, .85, .66, C.black, [0, .48, 0], .025));
  const vinyl = cylinder(.25, .25, .025, { color: 0x101114, roughness: .18, metalness: .3 }, [-.22, 1.17, 0]); g.add(vinyl, cylinder(.055, .055, .03, { color: 0xc86450, roughness: .4 }, [-.22, 1.195, 0]));
  const arm = box(.035, .035, .43, C.metal, [.33, 1.22, .06], .01); arm.rotation.y = -.48; g.add(arm); return { group: g, vinyl };
}
function chair() {
  const g = new THREE.Group(); g.add(box(.68, .16, .65, C.black, [0, .74, 0], .08), box(.68, .9, .15, C.black, [0, 1.25, -.27], .08));
  g.add(cylinder(.06, .06, .65, C.metal, [0, .36, 0]), cylinder(.36, .36, .07, C.black, [0, .04, 0]));
  for (let i = 0; i < 5; i += 1) { const a = i / 5 * Math.PI * 2; const leg = box(.06, .05, .62, C.metal, [0, .09, 0], .01); leg.rotation.y = a; g.add(leg); } return g;
}
function shelf() {
  const g = target("bookshelf"); g.add(box(1.5, .1, .3, C.wood, [0, 0, 0], .015));
  g.add(box(.07, 1.1, .22, C.metal, [-.62, -.5, 0], .01), box(.07, 1.1, .22, C.metal, [.62, -.5, 0], .01));
  for (let i = 0; i < 6; i += 1) { const w = .1 + (i % 2) * .04; g.add(box(w, .38 + (i % 3) * .05, .18, [C.gray, C.white, C.black][i % 3], [-.58 + i * .18, .22, 0], .006)); }
  g.add(cylinder(.1, .08, .2, C.gray, [.57, .1, 0])); return g;
}
function whiteboard() {
  const g = new THREE.Group(); g.add(box(1.85, 1.16, .04, C.white, [0, 0, 0], .025));
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x637493 });
  [-.32, -.08, .15].forEach((y, i) => { const l = new THREE.Mesh(new THREE.PlaneGeometry(1.25 - i * .18, .02), lineMat); l.position.set(-.12, y, .025); g.add(l); });
  return g;
}
function rug() { const m = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 3.25), mat(C.rug)); m.rotation.x = -Math.PI / 2; m.position.set(.1, .012, -1.75); m.receiveShadow = true; return m; }
function frame() { const g = new THREE.Group(); g.add(box(.75, 1.0, .06, C.black, [0, 0, 0], .015)); const art = new THREE.Mesh(new THREE.PlaneGeometry(.62, .87), new THREE.MeshBasicMaterial({ color: 0x475d70 })); art.position.z = .035; g.add(art); return g; }
function equipmentRack() {
  const g = new THREE.Group();
  g.add(box(.78, 1.76, .52, C.black, [0, .88, 0], .035));
  for (let i = 0; i < 3; i += 1) {
    const panel = box(.62, .28, .022, C.metal, [0, .55 + i * .42, .272], .008);
    g.add(panel);
    for (let x = -.2; x <= .2; x += .2) g.add(cylinder(.018, .018, .024, { color: 0x7ea1b9, emissive: 0x416174, emissiveIntensity: .7 }, [x, .55 + i * .42, .29]));
  }
  return g;
}

export function createFurniture(scene) {
  const interactive = []; scene.add(rug());
  // Each zone faces a different direction so an orbit around the scene stays interesting.
  const table = desk(); table.position.set(.15, 0, -2.0); scene.add(table);
  const pc = monitor(); pc.position.set(.05, 1.43, -2.2); scene.add(pc); interactive.push(pc);
  const { group: deskLamp, light: lampLight } = lamp(); deskLamp.position.set(-.98, 1.43, -2.1); scene.add(deskLamp); interactive.push(deskLamp);
  const camera = slr(); camera.position.set(1.14, 1.43, -1.8); camera.rotation.y = -.45; scene.add(camera);
  const records = recordConsole(); records.group.position.set(-2.8, 0, -1.45); records.group.rotation.y = .32; scene.add(records.group); interactive.push(records.group);
  const officeChair = chair(); officeChair.position.set(.15, 0, -.38); officeChair.rotation.y = Math.PI; scene.add(officeChair);
  const bookShelf = shelf(); bookShelf.position.set(2.9, 1.05, -1.2); bookShelf.rotation.y = -Math.PI / 2; scene.add(bookShelf); interactive.push(bookShelf);
  const board = whiteboard(); board.position.set(-1.5, 2.6, -3.15); scene.add(board);
  const poster = frame(); poster.position.set(.9, 2.65, -3.15); scene.add(poster);
  const rack = equipmentRack(); rack.position.set(2.7, 0, 1.15); rack.rotation.y = -2.2; scene.add(rack);
  return { interactive, lampLight, recordDisc: records.vinyl };
}
