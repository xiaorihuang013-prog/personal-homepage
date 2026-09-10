import * as THREE from 'three';

export function createPlant(scene) {
  const plant=new THREE.Group();plant.name='Layered foliage in dark wood planter';
  function tube(points,radius,mat) {
    const item=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),32,radius,8,false),mat);
    item.castShadow=item.receiveShadow=true;return item;
  }
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#785034';ctx.fillRect(0,0,1024,1024);
  let seed=42;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  for(let i=0;i<3000;i++) {
    const x=random()*1024;
    ctx.strokeStyle=i%3===0?'rgba(223,168,95,.25)':'rgba(32,17,9,.2)';ctx.lineWidth=.5+random()*2;
    ctx.beginPath();ctx.moveTo(x,0);
    for(let y=0;y<=1024;y+=16)ctx.lineTo(x+Math.sin(y/130+x)*3+Math.sin(y/43+x)*1.5,y);
    ctx.stroke();
  }
  const wood=new THREE.CanvasTexture(canvas);wood.colorSpace=THREE.SRGBColorSpace;
  const potMat=new THREE.MeshStandardMaterial({map:wood,roughness:.72,bumpMap:wood,bumpScale:.007});
  const profile=[[0,.015],[.19,.015],[.25,.055],[.28,.15],[.29,.39],[.285,.56],[.265,.56],[.265,.13],[0,.08]].map(p=>new THREE.Vector2(...p));
  const pot=new THREE.Mesh(new THREE.LatheGeometry(profile,96),potMat);pot.castShadow=pot.receiveShadow=true;plant.add(pot);
  const soil=new THREE.Mesh(new THREE.CircleGeometry(.261,64),new THREE.MeshStandardMaterial({color:0x231e15,roughness:1}));soil.rotation.x=-Math.PI/2;soil.position.y=.526;plant.add(soil);
  const stemMat=new THREE.MeshStandardMaterial({color:0x37442a,roughness:.7});
  const veinMat=new THREE.MeshStandardMaterial({color:0x93a781,roughness:.8});
  const colors=[0x536c44,0x748761,0x344d31,0x859574,0x425c39];
  // Fully tessellated curved blades, arranged around the stems in depth.
  for(let index=0;index<28;index++) {
    const tier=Math.floor(index/7),a=index*2.39996;
    const length=.36+random()*.21;
    const spread=.18+(3-tier)*.075+random()*.07;
    const leaf=new THREE.Group();
    leaf.position.set(Math.cos(a)*spread,.70+tier*.31+random()*.16,.13+Math.sin(a)*spread*.62);
    leaf.rotation.set(-.42+random()*.66,Math.sin(a)*1.0, -Math.cos(a)*(.3+random()*.45));
    const width=length*(.29+random()*.08), phase=random()*6;
    function surface(u,v) {
      const contour=Math.pow(Math.sin(Math.PI*v),.75)*(1-.17*v);
      return new THREE.Vector3(u*width*contour,length*v,
        length*(.20*Math.sin(Math.PI*v)-.15*v*v+.09*u*u*Math.sin(Math.PI*v)+.018*Math.sin(v*29+phase)*u*u*Math.sin(Math.PI*v)));
    }
    const positions=[],uvs=[],indices=[],rows=40,cols=14;
    for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++) {
      const u=i/cols*2-1,v=j/rows,p=surface(u,v);positions.push(p.x,p.y,p.z);uvs.push(i/cols,v);
    }
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++) {
      const n=j*(cols+1)+i;indices.push(n,n+1,n+cols+1,n+1,n+cols+2,n+cols+1);
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();
    const mat=new THREE.MeshPhysicalMaterial({color:colors[index%colors.length],roughness:.57,clearcoat:.15,side:THREE.DoubleSide});
    const blade=new THREE.Mesh(geo,mat);blade.castShadow=blade.receiveShadow=true;leaf.add(blade);
    const mid=[];for(let i=0;i<=16;i++){const p=surface(0,i/16);p.z+=.002;mid.push(p);}leaf.add(tube(mid,.0017,veinMat));
    for(const sign of [-1,1])for(let j=1;j<=9;j++) {
      const points=[];
      for(let k=0;k<=8;k++) {const t=k/8,p=surface(sign*t*.92,j*.084+t*.11);p.z+=.002;points.push(p);}
      leaf.add(tube(points,.00065,veinMat));
    }
    plant.add(leaf);
    plant.add(tube([new THREE.Vector3((random()-.5)*.12,.53,(random()-.5)*.09),new THREE.Vector3(leaf.position.x*.35,leaf.position.y*.72,.04),leaf.position.clone()],.0035+random()*.002,stemMat));
  }
  plant.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(plant);
  const heightScale=2.65/bounds.max.y;
  plant.scale.set(heightScale*.72,heightScale,heightScale*.8);
  // Keep the rearmost leaf in front of the same invisible wall as the shelves.
  plant.updateMatrixWorld(true);const scaled=new THREE.Box3().setFromObject(plant);
  plant.position.set(-4.03,0,-2.94-scaled.min.z);
  scene.add(plant);
}
