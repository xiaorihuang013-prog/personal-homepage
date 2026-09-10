import { t, onLanguage } from "./language.js";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { track } from "./loading.js";


function box(w, h, d, material, position = [0, 0, 0], radius = .025) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, radius), material);
  mesh.position.set(...position);
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

function desktopTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2560; canvas.height = 1440;
  const ctx = canvas.getContext("2d");
  let map;
  let avatar;
  function drawDesktop(){
  ctx.fillStyle='#050505';ctx.fillRect(0,0,2560,1440);
  const textCanvas=document.createElement('canvas');
  textCanvas.width=300;textCanvas.height=150;
  const textCtx=textCanvas.getContext('2d');
  textCtx.font='bold 12px monospace, "PingFang SC"';
  const lines=t(['嘿，很高兴遇见你！','我叫八日。','点击文件夹查看我的履历'],['Hey, nice to e-meet you!','My name’s 8suns.','Click a folder to explore my work.']);
  const textWidth=Math.ceil(Math.max(...lines.map(line=>textCtx.measureText(line).width)));
  const bubbleWidth=textWidth*3+64,bubbleHeight=lines.length*66+50;
  ctx.fillStyle='#ffffff';ctx.beginPath();ctx.roundRect(980,150,bubbleWidth,bubbleHeight,20);ctx.fill();
  ctx.beginPath();ctx.moveTo(1030,150+bubbleHeight-2);ctx.lineTo(980,220+bubbleHeight);ctx.lineTo(1130,150+bubbleHeight-2);ctx.fill();
  textCtx.fillStyle='#111';lines.forEach((line,i)=>textCtx.fillText(line,0,17+i*22));
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(textCanvas,0,0,textWidth,lines.length*22,1012,175,textWidth*3,lines.length*66);
  function folder(y,label) {
    ctx.fillStyle='#329cc5';ctx.beginPath();ctx.moveTo(2130,y+30);ctx.lineTo(2130,y);ctx.quadraticCurveTo(2130,y-15,2150,y-15);ctx.lineTo(2220,y-15);ctx.lineTo(2250,y+12);ctx.lineTo(2385,y+12);ctx.lineTo(2385,y+165);ctx.lineTo(2130,y+165);ctx.fill();
    ctx.fillStyle='#e6f7ff';ctx.fillRect(2138,y+30,240,140);
    const gradient=ctx.createLinearGradient(0,y+40,0,y+190);gradient.addColorStop(0,'#73d7f6');gradient.addColorStop(1,'#34a6d0');ctx.fillStyle=gradient;
    ctx.beginPath();ctx.roundRect(2120,y+45,275,155,16);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='42px Arial, "PingFang SC"';ctx.textAlign='center';ctx.fillText(label,2255,y+260);ctx.textAlign='left';
  }
  ctx.save();ctx.translate(620,40);ctx.scale(.75,.75);
  folder(140,t('电子简历','Résumé'));folder(530,t('ai项目（学习中...）','AI (learning...)'));
  ctx.restore();
  if(avatar?.complete && avatar.naturalWidth){ctx.imageSmoothingEnabled=false;const h=1170,w=h*avatar.naturalWidth/avatar.naturalHeight;ctx.drawImage(avatar,120,160,w,h);}
  if(map)map.needsUpdate=true;
  }
  drawDesktop();
  map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  avatar=new Image();
  const avatarDone=track();
  avatar.onload=()=>{ drawDesktop(); avatarDone(); };
  avatar.onerror=()=>avatarDone();
  onLanguage(drawDesktop);
  avatar.src=`${import.meta.env.BASE_URL}images/8suns-avatar.png`;
  return map;
}

function screenStation(renderer) {
  const group = new THREE.Group();
  group.userData.id = "computer";
  const white = new THREE.MeshPhysicalMaterial({ color: 0xf5f5f2, roughness: .25, metalness: .18, clearcoat: .4 });
  const rim = new THREE.MeshStandardMaterial({ color: 0xfafaf8, roughness: .32, metalness: .25 });
  group.add(box(1.28, .83, .034, white, [0, .64, 0], .015));
  group.add(box(1.258, .701, .008, rim, [0, .692, .020], .012));
  const map = desktopTexture();
  map.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const image = new THREE.Mesh(new THREE.PlaneGeometry(1.206, .654), new THREE.MeshBasicMaterial({ map }));
  image.position.set(0, .688, .025);
  group.userData.focusTarget=image;

  // Match the two drawn folder regions, including their text labels.
  for (const [id, y] of [['resume',140],['aiProjects',530]]) {
    const hit=new THREE.Mesh(new THREE.PlaneGeometry(440*.75/2560*1.206,320*.75/1440*.654),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
    hit.position.set(((620+2255*.75)/2560-.5)*1.206,.688+(.5-(40+(y+125)*.75)/1440)*.654,.027);
    hit.userData.id=id;group.add(hit);
  }

  const camera = new THREE.Mesh(new THREE.CircleGeometry(.004, 20), new THREE.MeshBasicMaterial({color: 0x253c34}));
  camera.position.set(0, 1.033, .025);
  const stand = box(.23, .29, .026, white, [0, .17, -.035], .009);
  stand.rotation.x = -.16;
  group.add(image, camera, stand, box(.4, .018, .29, white, [0, .009, .015], .008));
  return group;
}

function woodMaterial(renderer) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 2048;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#b78a60";
  ctx.fillRect(0, 0, 2048, 2048);
  let seed = 17;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 4200; i++) {
    const y = random() * 2048;
    ctx.strokeStyle = `rgba(65,36,19,${.025 + random() * .09})`;
    ctx.lineWidth = .5 + random() * 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 2048; x += 32) ctx.lineTo(x, y + Math.sin(x / 240 + y) * 3);
    ctx.stroke();
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return new THREE.MeshStandardMaterial({ map, roughness: .48 });
}

function rod(from, to, radius, material) {
  const start = new THREE.Vector3(...from), end = new THREE.Vector3(...to);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, start.distanceTo(end), 24), material);
  mesh.position.copy(start).add(end).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize());
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

function desk(wood, metal) {
  const group = new THREE.Group();
  group.add(box(3.25, .12, 1.3, wood, [0, 1.36, 0], .009));
  for (const x of [-1.42, 1.42]) {
    for (const z of [-.48, .48]) group.add(box(.065, 1.28, .065, metal, [x, .66, z], .012));
    group.add(box(.08, .065, 1.08, metal, [x, .08, 0], .012));
  }
  group.add(box(2.85, .09, .065, metal, [0, 1.23, -.48]));
  for (let i = 0; i < 2; i++) {
    group.add(box(.7, .22, .94, wood, [1.02, 1.14 - i * .24, .04]));
    group.add(box(.28, .022, .035, metal, [1.02, 1.14 - i * .24, .525], .009));
  }
  const peripheralsStart = group.children.length;
  const keys = new THREE.MeshPhysicalMaterial({ color: 0xf0f3ed, roughness: .3, clearcoat: .25 });
  const alloy = new THREE.MeshStandardMaterial({ color: 0xdfe2e3, roughness: .3, metalness: .48 });
  group.add(box(.79, .016, .285, alloy, [0, 1.428, .37], .007));
  for (let row = 0; row < 4; row++) for (let col = 0; col < 13; col++) {
    group.add(box(.05, .007, .043, keys, [-.351 + col * .0585, 1.439, .26 + row * .05], .004));
  }
  for (const [x, w] of [[-.335,.077],[-.245,.077],[0,.38],[.245,.077],[.335,.077]]) {
    group.add(box(w, .007, .041, keys, [x, 1.439, .46], .004));
  }
  group.add(box(.14, .009, .23, alloy, [.58, 1.427, .37], .004));
  const mouse = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), keys);
  mouse.scale.set(.072, .031, .119);
  mouse.position.set(.58, 1.431, .37);
  mouse.castShadow = mouse.receiveShadow = true;
  group.add(mouse);
  group.children.slice(peripheralsStart).forEach(part => { part.position.z -= .14; });
  return group;
}

function chair(metal) {
  const group = new THREE.Group();
  const fabric = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: .96, metalness: 0 });
  function curvedTube(points, radius, mat) {
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),48,radius,12,false),mat);
    tube.castShadow = tube.receiveShadow = true;return tube;
  }
  group.add(box(.82,.18,.77,fabric,[0,.77,0],.085));
  const back = new THREE.Group();back.position.set(0,1.31,.33);back.rotation.x=.1;
  back.add(box(.79,.58,.15,fabric,[0,0,0],.072));
  for(const x of [-.15,.15]) {
    const button=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),fabric);
    button.scale.set(.023,.023,.011);button.position.set(x,.025,-.078);back.add(button);
  }
  group.add(back,rod([0,.16,0],[0,.66,0],.04,metal));
  for(const x of [-.43,.43]) {
    group.add(curvedTube([[x,.72,-.22],[x,1.01,-.22],[x,1.07,-.13],[x,1.07,.2],[x,.76,.26]],.016,metal));
    group.add(box(.10,.045,.47,fabric,[x,1.095,-.015],.02));
  }
  for(const x of [-.27,.27]) group.add(curvedTube([[x,.70,.1],[x,.75,.33],[x,1.17,.37]],.019,metal));
  group.add(rod([.12,.66,0],[.3,.62,-.15],.009,metal),box(.1,.026,.045,fabric,[.3,.62,-.15],.01));
  for(let i=0;i<5;i++) {
    const angle=i*Math.PI*2/5,x=Math.sin(angle)*.48,z=Math.cos(angle)*.48;
    group.add(curvedTube([[0,.23,0],[x*.65,.18,z*.65],[x,.12,z]],.023,metal));
    for(const side of [-1,1]) {
      const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.064,.064,.026,32),fabric);
      wheel.rotation.z=Math.PI/2;wheel.position.set(x+side*.019,.064,z);wheel.castShadow=true;group.add(wheel);
    }
  }
  return group;
}

function notebookAndCoffee() {
  const group=new THREE.Group();
  const leather=new THREE.MeshStandardMaterial({color:0x48352a,roughness:.85});
  const paper=new THREE.MeshStandardMaterial({color:0xdcd3bb,roughness:1});
  const dark=new THREE.MeshStandardMaterial({color:0x101214,roughness:.45});
  const journal=new THREE.Group();journal.position.set(-.75,1.42,-2.02);journal.rotation.y=Math.PI-.12;
  journal.add(box(.34,.026,.46,paper,[0,.019,0],.007));
  for(const y of [.004,.036])journal.add(box(.36,.009,.48,leather,[0,y,0],.004));
  journal.add(box(.011,.004,.485,dark,[.09,.043,0],.002));
  journal.add(rod([.145,.05,-.19],[.145,.05,.22],.008,dark));
  group.add(journal);
  const ceramic=new THREE.MeshPhysicalMaterial({color:0x151719,roughness:.28,clearcoat:.25});
  const profile=[[.0,0],[.067,0],[.078,.018],[.082,.15],[.073,.153],[.067,.03],[0,.026]].map(p=>new THREE.Vector2(...p));
  const cup=new THREE.Group();cup.position.set(1.03,1.421,-1.85);
  const vessel=new THREE.Mesh(new THREE.LatheGeometry(profile,64),ceramic);vessel.castShadow=true;cup.add(vessel);
  const handle=new THREE.Mesh(new THREE.TorusGeometry(.044,.012,12,40),ceramic);handle.position.set(.09,.087,0);cup.add(handle);
  const coffee=new THREE.Mesh(new THREE.CircleGeometry(.071,64),new THREE.MeshPhysicalMaterial({color:0x6e4225,roughness:.2,clearcoat:.45}));coffee.rotation.x=-Math.PI/2;coffee.position.y=.135;cup.add(coffee);
  group.add(cup);return group;
}

function bookshelf(wood) {
  const group = new THREE.Group();
  group.name = "Wall-mounted floating shelves";
  const walnut = wood.clone();
  walnut.color.setHex(0x98765c);
  walnut.roughness = .38;
  const colors = [0x344c5c, 0xc2a47c, 0x8a5047, 0xddd8c9, 0x566459, 0xa3b6bb, 0xd7af73, 0x34353e, 0x9b8396];
  const pages = new THREE.MeshStandardMaterial({ color: 0xe6dfce, roughness: .95 });
  function book(w, h, d, color, index) {
    const item = new THREE.Group();
    item.userData.id = "bookshelf";
    item.name = "Interactive book";
    const bookPages = pages.clone();
    const cover = new THREE.MeshStandardMaterial({ color, roughness: .72 });
    item.add(box(w - .012, h - .014, d - .012, bookPages, [0, h / 2, 0], .002));
    for (const x of [-w / 2, w / 2]) item.add(box(.006, h, d, cover, [x, h / 2, 0], .002));
    item.add(box(w + .006, h, .012, cover, [0, h / 2, d / 2], .003));
    for (const y of [.045, h - .045]) item.add(box(w * .75, .006, .002, bookPages, [0, y, d / 2 + .007], .001));
    if (index % 2 === 0) item.add(box(w * .65, h * .22, .002, bookPages, [0, h * .65, d / 2 + .007], .001));
    return item;
  }
  for (let shelf = 0; shelf < 5; shelf++) {
    const y = .42 + shelf * .58;
    const board = box(1.62, .085, .46, walnut, [0, y, 0], .008);
    board.name = shelf === 4 ? "Reserved toy display — top shelf" : `Floating shelf ${5 - shelf}`;
    group.add(board);
    // Rear edges share the invisible wall plane; concealed mounts need no legs.
    if (shelf >= 3) continue;
    let cursor = -.56;
    const count = shelf % 2 ? 5 : 8;
    for (let i = 0; i < count; i++) {
      const w = [.055, .12, .075, .16, .09, .045, .13, .08][(i + shelf * 3) % 8];
      const h = .27 + ((i * 7 + shelf * 3) % 7) * .031;
      const d = .26 + ((i + shelf) % 4) * .035;
      const item = book(w, h, d, colors[(i + shelf * 2) % colors.length], i);
      item.position.set(cursor + w / 2, y + .044, .18 - d / 2);
      group.add(item);
      cursor += w + .016;
    }
    if (shelf % 2) {
      let stackY = y + .045;
      for (let i = 0; i < 3; i++) {
        const w = .045 + i * .018, h = .32 + i * .025;
        const item = book(w, h, .33, colors[(shelf + i + 3) % colors.length], i);
        item.rotation.z = -Math.PI / 2;
        item.position.set(.22, stackY + w / 2 + .003, .01);
        group.add(item);
        stackY += w + .009;
      }
    }
  }
  return group;
}

function cylinder(radius, length, material, position, axis = "y") {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 64), material);
  mesh.position.set(...position);
  if (axis === "z") mesh.rotation.x = Math.PI / 2;
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

function cameraModel() {
  const group = new THREE.Group();
  const shell = new THREE.MeshPhysicalMaterial({color: 0x111111, roughness: .3, metalness: .35, clearcoat: .4});
  const rubber = new THREE.MeshStandardMaterial({color: 0x080808, roughness: .72});
  const metal = new THREE.MeshPhysicalMaterial({color: 0x202225, roughness: .22, metalness: .8, clearcoat: .4});
  const glass = new THREE.MeshPhysicalMaterial({color: 0x063b32, roughness: .06, metalness: .45, clearcoat: 1});
  group.add(box(.48, .3, .17, shell, [0,.15,0], .035));
  group.add(box(.125, .3, .235, rubber, [-.185,.15,.025], .035));
  group.add(box(.43, .09, .17, shell, [0,.283,0], .02));
  group.add(box(.19, .22, .025, rubber, [.135,.125,.093], .012));
  group.add(box(.27, .18, .012, metal, [.025,.15,-.091], .01));
  group.add(box(.075, .015, .09, metal, [.015,.337,-.012], .004));
  for (const [x,r] of [[-.135,.048],[.145,.037]]) group.add(cylinder(r,.024,metal,[x,.341,0]));
  group.add(cylinder(.023,.013,shell,[-.193,.345,.062]));
  const lensX = .015, lensY = .145;
  for (const [r,len,z,mat] of [[.137,.04,.104,metal],[.128,.075,.15,rubber],[.118,.065,.21,metal],[.103,.038,.258,shell]]) {
    group.add(cylinder(r,len,mat,[lensX,lensY,z],"z"));
  }
  for (let i=0;i<80;i++) {
    const angle=i*Math.PI*2/80;
    const rib=box(.004,.008,.058,metal,[lensX+Math.sin(angle)*.129,lensY+Math.cos(angle)*.129,.15],.001);
    rib.rotation.z=-angle; group.add(rib);
  }
  for (const r of [.1,.084]) {
    const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.004,12,80),metal);
    ring.position.set(lensX,lensY,.279); group.add(ring);
  }
  group.add(cylinder(.079,.005,glass,[lensX,lensY,.278],"z"));
  group.add(cylinder(.038,.003,new THREE.MeshPhysicalMaterial({color:0x010907,roughness:.04,clearcoat:1}),[lensX,lensY,.282],"z"));
  const label=document.createElement("canvas"); label.width=512; label.height=128;
  const ctx=label.getContext("2d"); ctx.fillStyle="#eeeeee"; ctx.font="italic bold 85px Arial"; ctx.fillText("Nikon",12,95);
  const map=new THREE.CanvasTexture(label); map.colorSpace=THREE.SRGBColorSpace;
  const logo=new THREE.Mesh(new THREE.PlaneGeometry(.11,.028),new THREE.MeshBasicMaterial({map,transparent:true}));
  logo.position.set(.143,.282,.09); group.add(logo);
  return group;
}

function deskLamp() {
  const group=new THREE.Group(); group.userData.id="lamp"; group.userData.noHighlight=true;
  const black=new THREE.MeshPhysicalMaterial({color:0x080808,metalness:.65,roughness:.25,clearcoat:.4});
  group.add(cylinder(.17,.025,black,[0,.0125,0]));
  const curve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.07,.025,0),new THREE.Vector3(-.07,.72,0),
    new THREE.Vector3(-.06,.85,0),new THREE.Vector3(0,.9,0),new THREE.Vector3(.13,.9,0)
  ]);
  const stem=new THREE.Mesh(new THREE.TubeGeometry(curve,64,.012,16,false),black);
  stem.castShadow=true; group.add(stem);
  const head=new THREE.Group(); head.position.set(.19,.91,0); head.rotation.z=.58;
  head.add(cylinder(.058,.3,black,[0,0,0]));
  const glow=new THREE.MeshStandardMaterial({color:0xffe5b8,emissive:0xffb65c,emissiveIntensity:0,roughness:.3});
  const bulb=cylinder(.049,.006,glow,[0,-.153,0]); bulb.castShadow=false;
  head.add(bulb); group.add(head);
  const light=new THREE.SpotLight(0xffbb70,0,3,Math.PI/3.2,.65,1.5);
  light.position.set(0,-.17,0); light.target.position.set(0,-1,0);
  light.castShadow=true; light.shadow.mapSize.set(1024,1024); light.shadow.bias=-.0005;
  head.add(light,light.target);
  let on=false;
  return {group, toggle() {on=!on; light.intensity=on?5:0; glow.emissiveIntensity=on?3:0; return on;}};
}

export function createFurniture(scene, renderer) {
  const interactive = [];

  const wood = woodMaterial(renderer);
  const metal = new THREE.MeshStandardMaterial({ color: 0x343b42, metalness: .65, roughness: .32 });
  const deskSet = desk(wood, metal);
  deskSet.position.set(-.05, 0, -2.3);
  scene.add(deskSet);
  const seat = chair(new THREE.MeshStandardMaterial({color:0x050505,metalness:.1,roughness:.8}));
  seat.userData.id = "chair";
  seat.userData.noHighlight = true;
  seat.position.set(-.15, 0, -1.78);
  seat.rotation.y = 0;
  interactive.push(seat);
  scene.add(seat);
  const bookcase = bookshelf(wood);
  bookcase.position.set(-2.6, 0, -2.72);
  bookcase.rotation.y = 0;
  scene.add(bookcase);
  interactive.push(...bookcase.children.filter(item => item.userData.id === "bookshelf"));

  const lamp = deskLamp();
  lamp.group.position.set(-1.17, 1.42, -2.35);
  scene.add(lamp.group);
  interactive.push(lamp.group);
  const photoCamera = cameraModel();
  photoCamera.userData.id="photography";interactive.push(photoCamera);
  photoCamera.position.set(1.02, 1.42, -2.18);
  photoCamera.rotation.y = -.72;
  photoCamera.scale.setScalar(.82);
  scene.add(photoCamera, notebookAndCoffee());

  const monitor = screenStation(renderer);
  monitor.position.set(-.04, 1.42, -2.39);
  scene.add(monitor);
  interactive.push(monitor);

  let pulledOut = false, progress = 0, velocity = 0;
  function toggleChair() { pulledOut = !pulledOut; }
  function update(delta) {
    // Substeps keep the damped spring stable on slow frames and rapid reversals.
    let remaining = Math.min(delta, .1);
    while (remaining > 0) {
      const dt = Math.min(remaining, 1 / 120);
      velocity += ((Number(pulledOut) - progress) * 110 - velocity * 16) * dt;
      progress += velocity * dt;
      remaining -= dt;
    }
    seat.position.z = -1.78 + .93 * progress;
    seat.rotation.y = -.2 * progress;
  }
  return { interactive, toggleLamp: lamp.toggle, toggleChair, update };
}
