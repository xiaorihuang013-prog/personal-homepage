import * as THREE from 'three';

// A small pothos, in shelf-local coordinates; the longest tip meets shelf three.
export function createShelfPlant() {
  const plant = new THREE.Group();
  plant.name = 'Trailing pothos — top shelf right';
  const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x486332, roughness: .78 });
  const veinMaterial = new THREE.MeshStandardMaterial({ color: 0x91a653, roughness: .65 });
  const leafMaterials = [0x315d26, 0x456f2c, 0x537d32, 0x294f24, 0x638239].map(color =>
    new THREE.MeshPhysicalMaterial({ color, roughness: .48, clearcoat: .18, side: THREE.DoubleSide }));
  function mesh(geometry, material, parent = plant) {
    const object = new THREE.Mesh(geometry, material);
    object.castShadow = object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  function stem(points, radius = .0025, material = stemMaterial, parent = plant) {
    return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 20, radius, 5, false), material, parent);
  }
  const v = (x, y, z) => new THREE.Vector3(x, y, z);
  const profile = [[0,0],[.084,0],[.104,.018],[.124,.09],[.13,.205],[.125,.223],[.113,.223],[.112,.195],[.10,.035],[0,.035]];
  mesh(new THREE.LatheGeometry(profile.map(p => new THREE.Vector2(...p)), 48),
    new THREE.MeshStandardMaterial({ color: 0xd7cfb9, roughness: .83 }));
  const soil = mesh(new THREE.CircleGeometry(.112, 32), new THREE.MeshStandardMaterial({ color: 0x30251b, roughness: 1 }));
  soil.rotation.x = -Math.PI / 2;
  soil.position.y = .204;

  // Heart-shaped shoulders, pointed tips and a gently folded blade.
  const outline = new THREE.Shape();
  outline.moveTo(0, 0);
  outline.bezierCurveTo(-.28,.28,-.64,.10,-.49,-.30);
  outline.bezierCurveTo(-.40,-.62,-.13,-.80,0,-1);
  outline.bezierCurveTo(.13,-.80,.40,-.62,.49,-.30);
  outline.bezierCurveTo(.64,.10,.28,.28,0,0);
  const leafGeometry = new THREE.ShapeGeometry(outline, 12);
  const positions = leafGeometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i);
    positions.setZ(i, .16 * Math.sin(-y * Math.PI) - .20 * x * x);
  }
  leafGeometry.computeVertexNormals();
  function leaf(position, size, rotation, index) {
    const group = new THREE.Group();
    group.position.copy(position);
    group.rotation.set(...rotation);
    group.scale.setScalar(size);
    plant.add(group);
    mesh(leafGeometry, leafMaterials[index % leafMaterials.length], group);
    stem([v(0,0,.008),v(0,-.35,.15),v(0,-.7,.13),v(0,-.96,.025)], .008, veinMaterial, group);
    for (const side of [-1,1]) for (let j = 0; j < 3; j++) {
      const y = -.18 - j * .18;
      stem([v(0,y,.16*Math.sin(-y*Math.PI)+.012),v(side*.19,y-.04,.14),v(side*(.39-j*.07),y-.10,.11)], .003, veinMaterial, group);
    }
  }
  for (let i = 0; i < 19; i++) {
    const angle = i * 2.39996;
    const radius = .07 + (i % 4) * .029;
    const end = v(Math.cos(angle)*radius, .24 + (i % 5)*.023, Math.sin(angle)*radius*.7);
    stem([v(0,.205,0),v(end.x*.45,.30,end.z*.45),end]);
    leaf(end, .125 + (i % 4)*.014, [.20 + Math.sin(angle)*.5, Math.cos(angle)*.7, angle], i);
  }
  // Cross the front lip before descending so the vines clear all shelf boards.
  const lengths = [1.14,.86,.58];
  lengths.forEach((length, index) => {
    const side = [-.065,.085,-.15][index];
    const points = [v(side*.3,.215,.02),v(side,.255,.15),v(side,.10,.285)];
    for (let j = 0; j <= 7; j++) {
      const t = j/7;
      points.push(v(side + Math.sin(t*7+index)*.038, -.015-length*t, .30 + Math.sin(t*5+index)*.022));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    mesh(new THREE.TubeGeometry(curve, 64, .003, 6, false), stemMaterial);
    for (let j = 0; j < 9; j++) {
      const t = .24 + j*.083;
      const node = curve.getPoint(t);
      const sign = j%2 ? 1 : -1;
      const attachment = node.clone().add(v(sign*.033,.008,.014));
      stem([node,node.clone().lerp(attachment,.5).add(v(0,.009,0)),attachment], .0017);
      leaf(attachment, (.14-j*.005) * (index===2 ? .88 : 1), [-.12,sign*.30,sign*(.48+(j%3)*.18)], j+index);
    }
  });
  plant.position.set(.56, .42 + 4*.58 + .0425, .015);
  return plant;
}
