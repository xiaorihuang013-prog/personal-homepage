import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { track } from './loading.js';

const material = (color, roughness = .6, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
function mesh(geometry, mat, position = [0,0,0]) {
  const item = new THREE.Mesh(geometry, mat);
  item.position.set(...position); item.castShadow = item.receiveShadow = true;
  return item;
}
const box = (w,h,d,mat,p) => mesh(new RoundedBoxGeometry(w,h,d,4,Math.min(.025,h/4,d/4)),mat,p);
function tube(points, radius, mat) {
  return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),64,radius,12,false),mat);
}
function weave(renderer, color) {
  const c=document.createElement('canvas'); c.width=c.height=1024;
  const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,1024,1024);
  for(let i=0;i<1024;i+=4) {
    ctx.fillStyle='rgba(255,255,255,.09)';ctx.fillRect(i,0,1,1024);
    ctx.fillStyle='rgba(0,0,0,.09)';ctx.fillRect(0,i,1024,1);
  }
  const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;
  map.anisotropy=renderer.capabilities.getMaxAnisotropy();
  return new THREE.MeshStandardMaterial({map,roughness:.95,bumpMap:map,bumpScale:.008});
}
export function createPosters(scene, renderer) {
  const group=new THREE.Group();group.name='Photo poster wall';
  const paper=material(0xf5f1e8,.92), tape=material(0xd9cdb0,.95);
  const ratios=[0.8, 0.7049608355091384, 0.8, 0.6915629322268326, 0.6748046875, 0.675219446320054, 0.7];
  // Compact asymmetric collage; keep every original image uncropped.
  const layouts=[[-.53,3.65,.64,-.025],[-.025,3.82,.69,.015],[.43,3.65,.48,-.025],[-.48,3.04,.43,.02],[-.075,3.17,.52,-.02],[.46,3.06,.62,.018]];
  const loader=new THREE.TextureLoader();
  layouts.forEach(([x,y,h,angle],i)=>{
    const posterId=i+2;
    const w=h*ratios[posterId-1];
    const poster=new THREE.Group();poster.name=`poster-${posterId}`;poster.userData.id=`film-${i}`;
    poster.add(box(w+.022,h+.022,.009,paper,[0,0,0]));
    const posterDone=track();
    const map=loader.load(`${import.meta.env.BASE_URL}posters/poster-${posterId}.png`,posterDone,undefined,posterDone);
    map.colorSpace=THREE.SRGBColorSpace;
    map.anisotropy=renderer.capabilities.getMaxAnisotropy();
    const image=mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map,roughness:.95}),[0,0,.006]);
    image.name=`poster-image-${posterId}`;image.castShadow=false;image.receiveShadow=false;
    poster.add(image);
    const strip=box(.105,.034,.004,tape,[0,h/2+.016,.011]);strip.rotation.z=.3;
    poster.add(strip);poster.position.set(x,y,-2.94);poster.rotation.z=angle;
    group.add(poster);
  });scene.add(group);return group.children;
}
export function createMusicCorner(scene,renderer) {
  const group=new THREE.Group();group.name='Music corner';
  const black=material(0x101113,.3,.45);
  const rug=mesh(new THREE.CylinderGeometry(1.85,1.85,.035,96),weave(renderer,'#cfc0a5'),[3.6,.025,-.9]);
  rug.scale.z=.83;group.add(rug);
  const fabric=weave(renderer,'#bb790d');
  fabric.bumpScale=.004;
  const seat=new THREE.Group();seat.name='Sculpted mustard beanbag';
  seat.position.set(3.95,.055,-1.8);seat.rotation.y=-.15;
  // One closed surface: rounded bottom, full outer panels, low front lip,
  // and a deeply relaxed seat. The back is taller than the entry edge.
  const profile=new THREE.CatmullRomCurve3([
    [0,.018],[.55,.025],[.89,.12],[1,.36],[.95,.57],
    [.78,.65],[.61,.48],[.4,.27],[.19,.22],[0,.22]
  ].map(([r,h])=>new THREE.Vector3(r,h,0)),false,'centripetal');
  function surface(t,a) {
    const p=profile.getPoint(t),r=p.x;
    const upper=THREE.MathUtils.smoothstep(t,.32,.53);
    const front=Math.sin(a),back=Math.max(0,-front);
    const rim=Math.exp(-(((r-.78)/.33)**2));
    let y=p.y+upper*rim*(.36*back-.19*Math.max(0,front));
    // Unequal fabric folds run down the inner bowl, tapering out at the seat.
    const inner=THREE.MathUtils.smoothstep(t,.48,.64)*(1-THREE.MathUtils.smoothstep(t,.86,1));
    let folds=0;
    for(const [angle,depth,width] of [[-2.8,.072,.065],[-2.2,.095,.09],[-1.65,.09,.065],[-1.12,.085,.07],[-.55,.08,.08],[.15,.065,.07],[2.85,.07,.09]]) {
      const delta=Math.atan2(Math.sin(a-angle-.15*r),Math.cos(a-angle-.15*r));
      folds-=depth*Math.exp(-((delta/width)**2));
      folds+=depth*.35*Math.exp(-(((delta-width*1.6)/(width*1.2))**2));
    }
    y+=folds*inner;
    const fullness=1+.018*Math.sin(a*5+.7)*Math.sin(Math.PI*t);
    return new THREE.Vector3(Math.cos(a)*r*.9*fullness,y,Math.sin(a)*r*.82*fullness);
  }
  const vertices=[],uvs=[],indices=[],rings=144,segments=192;
  for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++) {
    const t=j/rings,a=i/segments*Math.PI*2;
    const p=surface(t,a);vertices.push(p.x,p.y,p.z);uvs.push(i/segments*3,t*2);
  }
  for(let j=0;j<rings;j++)for(let i=0;i<segments;i++) {
    const a=j*(segments+1)+i,b=a+segments+1;
    indices.push(a,b,a+1,b,b+1,a+1);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();
  fabric.map.wrapS=fabric.map.wrapT=THREE.RepeatWrapping;
  seat.add(mesh(geo,fabric));
  const seam=material(0xa97013,.94);
  // Quiet panel stitching follows the fabric, rather than straight spokes.
  for(const angle of [-2.65,-.5,1.9]) {
    const points=[];
    for(let i=0;i<=64;i++) {
      const t=.12+i/64*.73,p=surface(t,angle);
      p.x*=1.002;p.z*=1.002;p.y+=.002;
      points.push(p.toArray());
    }
    seat.add(tube(points,.0018,seam));
  }
  group.add(seat);
  // Grille-front amplifier with silver piping and separate speaker drivers.
  const amp=new THREE.Group();amp.position.set(2.13,.045,-2.03);amp.rotation.y=.08;
  amp.add(box(.7,.84,.42,black,[0,.42,0]));
  const grille=weave(renderer,'#66645f');
  amp.add(box(.62,.66,.025,grille,[0,.39,.221]));
  for(const y of [.24,.54]) {
    const driver=mesh(new THREE.TorusGeometry(.135,.008,12,48),material(0x3c3c39),[0,y,.24]);amp.add(driver);
  }
  const silver=material(0xb8b9b5,.25,.8);
  for(let i=0;i<5;i++)amp.add(mesh(new THREE.SphereGeometry(.017,16,12),silver,[-.22+i*.1,.77,.22]));
  amp.add(box(.27,.04,.08,black,[0,.875,0]));group.add(amp);
  amp.scale.set(.72,.65,.72);
  const bassRig=new THREE.Group();bassRig.name='Black four-string bass and tripod stand';
  bassRig.position.set(2.75,.05,-2.5);bassRig.rotation.y=.08;
  const rubber=material(0x080909,.8),chrome=material(0xc7c9c9,.17,.92);
  const bass=new THREE.Group();bass.position.set(0,.18,0);bass.rotation.x=-.075;bass.rotation.z=.04;
  const body=new THREE.Shape();body.moveTo(0,0);
  body.bezierCurveTo(-.22,-.015,-.32,.075,-.305,.25);
  body.bezierCurveTo(-.3,.36,-.19,.43,-.215,.57);
  body.bezierCurveTo(-.23,.69,-.315,.83,-.245,.92);
  body.bezierCurveTo(-.205,.98,-.2,.74,-.09,.66);
  body.bezierCurveTo(-.045,.63,.045,.62,.105,.68);
  body.bezierCurveTo(.17,.73,.195,.83,.226,.8);
  body.bezierCurveTo(.285,.76,.18,.61,.19,.52);
  body.bezierCurveTo(.2,.42,.315,.32,.31,.2);
  body.bezierCurveTo(.31,.05,.17,-.015,0,0);
  const lacquer=new THREE.MeshPhysicalMaterial({color:0x151718,metalness:.38,roughness:.26,clearcoat:.85,clearcoatRoughness:.18});
  bass.add(mesh(new THREE.ExtrudeGeometry(body,{depth:.082,bevelEnabled:true,bevelSegments:8,steps:1,bevelSize:.035,bevelThickness:.035,curveSegments:48}),lacquer));
  // Tapered rosewood fingerboard over a maple neck, with correctly spaced frets.
  function tapered(w0,w1,y0,y1,depth,mat,z) {
    const shape=new THREE.Shape();shape.moveTo(-w0/2,y0);shape.lineTo(w0/2,y0);shape.lineTo(w1/2,y1);shape.lineTo(-w1/2,y1);shape.closePath();
    return mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false}),mat,[0,0,z]);
  }
  bass.add(tapered(.135,.084,.56,1.77,.055,material(0x997651,.5),.032));
  bass.add(tapered(.124,.078,.56,1.77,.015,material(0x38261f,.48),.09));
  const head=new THREE.Shape();head.moveTo(-.042,1.76);
  head.bezierCurveTo(-.05,1.82,-.12,1.83,-.102,1.94);
  head.lineTo(-.077,2.12);head.bezierCurveTo(-.08,2.17,.05,2.12,.087,2.09);
  head.lineTo(.075,1.9);head.bezierCurveTo(.1,1.84,.042,1.82,.042,1.76);head.closePath();
  bass.add(mesh(new THREE.ExtrudeGeometry(head,{depth:.046,bevelEnabled:true,bevelSize:.006,bevelThickness:.004,bevelSegments:3,curveSegments:24}),material(0xa48359,.4),[0,0,.04]));
  bass.add(mesh(new THREE.ShapeGeometry(head,32),lacquer,[0,0,.093]));
  const nutY=1.77,scaleLength=1.59;
  for(let fret=1;fret<=24;fret++) {
    const y=nutY-scaleLength*(1-2**(-fret/12));
    const width=THREE.MathUtils.lerp(.124,.078,(y-.56)/1.21);
    bass.add(box(width,.003,.004,chrome,[0,y,.109]));
    if([3,5,7,9,12,15,17,19,21,24].includes(fret)) {
      const prev=nutY-scaleLength*(1-2**(-(fret-1)/12));
      for(const x of fret%12===0?[-.025,.025]:[0]) bass.add(mesh(new THREE.CircleGeometry(.004,16),material(0xe2d8c6),[x,(y+prev)/2,.111]));
    }
  }
  bass.add(box(.086,.009,.019,material(0xd9d1be),[0,1.772,.109]));
  for(const y of [.31,.48]) {
    bass.add(box(.186,.066,.025,rubber,[0,y,.133]));
    for(let row=0;row<2;row++)for(let string=0;string<4;string++) {
      bass.add(mesh(new THREE.SphereGeometry(.004,12,8),chrome,[-.053+string*.035,y-.016+row*.032,.148]));
    }
  }
  bass.add(box(.18,.105,.02,chrome,[0,.147,.137]));
  for(let i=0;i<4;i++) {
    const x=-.0525+i*.035;
    bass.add(box(.025,.052,.015,chrome,[x,.15,.155]));
    bass.add(tube([[x,.126,.17],[x,.55,.156],[x*.65,1.775,.124]],.0016+i*.00025,chrome));
    const side=i<2?-1:1,y=1.9+(i%2)*.145+(side===1?-.026:0);
    const postX=side*.052;
    bass.add(tube([[x*.65,1.775,.124],[postX,y,.118]],.0016+i*.00025,chrome));
    const post=mesh(new THREE.CylinderGeometry(.015,.015,.024,24),chrome,[postX,y,.109]);post.rotation.x=Math.PI/2;bass.add(post);
    bass.add(tube([[postX,y,.068],[side*.125,y,.068]],.008,chrome));
    const key=mesh(new THREE.SphereGeometry(1,24,16),chrome,[side*.145,y,.068]);key.scale.set(.027,.017,.008);bass.add(key);
  }
  for(const [x,y] of [[.17,.39],[.23,.35],[.17,.29],[.24,.245],[.23,.16]]) {
    const knob=mesh(new THREE.CylinderGeometry(.015,.019,.019,24),chrome,[x,y,.139]);knob.rotation.x=Math.PI/2;bass.add(knob);
  }
  // Stand is independent of the leaning instrument: tripod, telescopic post,
  // padded lower cradle and neck yoke with a retaining strap.
  for(const [x,z] of [[-.34,.23],[.34,.23],[0,-.35]]) {
    bassRig.add(tube([[0,.14,-.11],[x*.65,.065,z*.7],[x,.025,z]],.019,black));
    const foot=mesh(new THREE.SphereGeometry(1,20,12),rubber,[x,.025,z]);foot.scale.set(.037,.025,.055);bassRig.add(foot);
  }
  bassRig.add(tube([[0,.12,-.12],[0,.8,-.16],[0,1.35,-.2]],.018,black));
  bassRig.add(box(.057,.09,.052,rubber,[0,.79,-.16]));
  for(const x of [-.21,.21]) bassRig.add(tube([[0,.16,-.12],[x,.14,.015],[x,.17,.16],[x,.22,.19]],.02,rubber));
  bassRig.add(tube([[0,1.35,-.2],[-.085,1.35,-.1],[-.1,1.35,.12]],.018,rubber));
  bassRig.add(tube([[0,1.35,-.2],[.085,1.35,-.1],[.1,1.35,.12]],.018,rubber));
  bassRig.add(tube([[-.1,1.35,.12],[0,1.335,.15],[.1,1.35,.12]],.006,rubber));
  // Extend only the neck region by 22%; preserve body and headstock shape.
  // Bake each detail into instrument space so frets, strings and tuners agree.
  const neckBase=.56,oldNut=1.77,neckStretch=1.22;
  for (const part of bass.children.slice(1)) {
    part.updateMatrix();part.geometry.applyMatrix4(part.matrix);
    part.position.set(0,0,0);part.rotation.set(0,0,0);part.scale.set(1,1,1);
    const positions=part.geometry.attributes.position;
    for(let i=0;i<positions.count;i++) {
      const y=positions.getY(i);
      if(y>neckBase) positions.setY(i,y+(Math.min(y,oldNut)-neckBase)*(neckStretch-1));
    }
    positions.needsUpdate=true;part.geometry.computeVertexNormals();
    part.geometry.computeBoundingBox();part.geometry.computeBoundingSphere();
  }
  bassRig.add(bass);group.add(bassRig);
  const lamp=new THREE.Group();lamp.userData.id='floorLamp';lamp.userData.noHighlight=true;
  lamp.position.set(4.98,0,-1.75);
  lamp.add(mesh(new THREE.CylinderGeometry(.22,.25,.035,64),black,[0,.03,0]));
  lamp.add(tube([[0,.04,0],[0,1.85,0],[-.03,2.18,0],[-.25,2.4,0],[-.6,2.26,0]],.018,black));
  const shadeMat=new THREE.MeshStandardMaterial({color:0xeee0c6,roughness:.85,side:THREE.DoubleSide,emissive:0xffb75c,emissiveIntensity:0});
  lamp.add(mesh(new THREE.CylinderGeometry(.19,.28,.35,64,1,true),shadeMat,[-.6,2.08,0]));
  const light=new THREE.PointLight(0xffbb74,0,4,1.5);light.position.set(-.6,1.96,0);lamp.add(light);
  group.add(lamp);scene.add(group);
  let on=false;
  return {lamp,toggleFloorLamp(){on=!on;light.intensity=on?4.5:0;shadeMat.emissiveIntensity=on?1.2:0;return on;}};
}
