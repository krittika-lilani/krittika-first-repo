// 3D canvas 1: deconstructed çılbır
// This scene is a clean primitive study: plate, yogurt, eggs, yolks, chili
// butter, herbs, and bread are all built from simple beginner-friendly shapes.

const formsContainer = document.getElementById("three-canvas-forms");

if (formsContainer) {
  // The scene is the 3D world. All objects, lights, and the camera live here.
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#fffaf2");

  const breakfast = new THREE.Group();
  scene.add(breakfast);

  // Orthographic camera keeps the model diagram-like instead of realistic.
  // The 3/4 angle makes the ingredient layers easy to read right away.
  const camera = new THREE.OrthographicCamera(-5, 5, 3.6, -3.6, 0.1, 100);
  camera.position.set(4.6, 3.35, 6.2);
  camera.lookAt(0, 0.12, 0);

  // Renderer draws the Three.js scene into a canvas inside #three-canvas-forms.
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(formsContainer.clientWidth, formsContainer.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  formsContainer.appendChild(renderer.domElement);

  // OrbitControls lets the viewer rotate the primitive study.
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 0.14, 0);
  controls.minZoom = 0.82;
  controls.maxZoom = 1.75;

  // Soft, warm lighting keeps the model readable without dramatic realism.
  const fillLight = new THREE.HemisphereLight("#ffe8c7", "#a9845e", 0.78);
  scene.add(fillLight);

  const keyLight = new THREE.DirectionalLight("#ffd7a3", 0.95);
  keyLight.position.set(-4.2, 5.2, 4.6);
  keyLight.castShadow = true;
  keyLight.shadow.radius = 4;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 16;
  keyLight.shadow.camera.left = -5;
  keyLight.shadow.camera.right = 5;
  keyLight.shadow.camera.top = 5;
  keyLight.shadow.camera.bottom = -5;
  keyLight.shadow.camera.updateProjectionMatrix();
  scene.add(keyLight);

  // Shadow catcher: a transparent plane that makes the plate feel grounded on
  // the warm webpage background.
  const shadowMat = new THREE.ShadowMaterial({
    color: "#5d3c22",
    opacity: 0.12
  });
  const shadowCatcher = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), shadowMat);
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = -0.24;
  shadowCatcher.receiveShadow = true;
  scene.add(shadowCatcher);

  // Materials: simple matte colors for a graphic computational model.
  const plateBlue = new THREE.MeshStandardMaterial({ color: "#3c6688", roughness: 0.78, metalness: 0 });
  const plateDarkBlue = new THREE.MeshStandardMaterial({ color: "#294f70", roughness: 0.8, metalness: 0 });
  const plateCream = new THREE.MeshStandardMaterial({ color: "#ead8bd", roughness: 0.9, metalness: 0 });
  const rimLineMat = new THREE.MeshStandardMaterial({ color: "#f2dfc2", roughness: 0.82, metalness: 0 });
  const yogurtMat = new THREE.MeshStandardMaterial({ color: "#d7c5aa", roughness: 0.96, metalness: 0 });
  const eggWhiteMat = new THREE.MeshStandardMaterial({ color: "#f2ddbd", roughness: 0.92, metalness: 0 });
  const yolkMat = new THREE.MeshStandardMaterial({ color: "#d9820e", roughness: 0.58, metalness: 0 });
  const chiliMat = new THREE.MeshStandardMaterial({ color: "#d43f13", roughness: 0.4, metalness: 0 });
  const herbMat = new THREE.MeshStandardMaterial({ color: "#526a2a", roughness: 0.82, metalness: 0 });
  const breadMat = new THREE.MeshStandardMaterial({ color: "#c78e4d", roughness: 0.92, metalness: 0 });
  const breadSpotMat = new THREE.MeshStandardMaterial({ color: "#74451c", roughness: 0.94, metalness: 0 });

  function addMesh(mesh, parent = breakfast) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function ellipsoid(x, y, z, sx, sy, sz, material, parent = breakfast) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 14), material);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    return addMesh(mesh, parent);
  }

  function flatCylinder(x, y, z, radius, height, sx, sz, material, parent = breakfast, segments = 40) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, 1, sz);
    return addMesh(mesh, parent);
  }

  // Plate: shallow cream ceramic base with thin muted blue diagram-like rim.
  addMesh(new THREE.Mesh(new THREE.CylinderGeometry(3.45, 3.35, 0.18, 80), plateBlue)).position.y = -0.08;
  addMesh(new THREE.Mesh(new THREE.CylinderGeometry(3.18, 3.12, 0.08, 80), plateCream)).position.y = 0.05;

  const outerRim = addMesh(new THREE.Mesh(new THREE.TorusGeometry(3.27, 0.035, 8, 96), plateDarkBlue));
  outerRim.rotation.x = Math.PI / 2;
  outerRim.position.y = 0.14;

  const innerRim = addMesh(new THREE.Mesh(new THREE.TorusGeometry(2.86, 0.022, 8, 96), plateBlue));
  innerRim.rotation.x = Math.PI / 2;
  innerRim.position.y = 0.17;

  const rimHighlight = addMesh(new THREE.Mesh(new THREE.TorusGeometry(3.04, 0.014, 8, 96), rimLineMat));
  rimHighlight.rotation.x = Math.PI / 2;
  rimHighlight.position.y = 0.19;

  function rimDash(angle, length, width) {
    const radius = 2.97;
    const dash = new THREE.Mesh(new THREE.BoxGeometry(length, 0.018, width), plateBlue);
    dash.position.set(Math.cos(angle) * radius, 0.215, Math.sin(angle) * radius);
    dash.rotation.y = -angle;
    addMesh(dash);
  }

  [0.15, 0.82, 1.55, 2.3, 3.05, 3.9, 4.65, 5.45].forEach((angle, index) => {
    rimDash(angle, index % 2 === 0 ? 0.32 : 0.24, index % 2 === 0 ? 0.055 : 0.05);
  });

  // Layer heights make the object readable as a stacked ingredient system.
  const yogurtY = 0.14;
  const eggY = 0.24;
  const yolkY = 0.315;
  const sauceYogurt = 0.27;
  const sauceEgg = 0.35;
  const herbY = 0.43;
  const breadY = 0.16;

  // Yogurt: a broad low field made from 7 overlapping ellipsoids.
  [
    [-1.15, 0.0, 1.38, 0.11, 0.8, 0.12],
    [0.2, -0.12, 1.56, 0.11, 0.9, -0.12],
    [1.22, 0.28, 0.88, 0.095, 0.58, 0.2],
    [-0.4, 0.68, 1.5, 0.1, 0.55, 0.04],
    [0.1, -0.78, 1.38, 0.1, 0.52, -0.08],
    [-1.52, -0.46, 0.72, 0.08, 0.42, 0.35],
    [0.0, 0.0, 1.18, 0.11, 0.72, 0]
  ].forEach(([x, z, sx, sy, sz, rotation]) => {
    ellipsoid(x, yogurtY, z, sx, sy, sz, yogurtMat).rotation.y = rotation;
  });

  // Eggs: abstract poached mounds. Each group is made from a few overlapping
  // ellipsoids, so the shape reads as soft and primitive instead of realistic.
  function makeEgg(x, z, rotation, size = 1) {
    const egg = new THREE.Group();
    egg.position.set(x, 0, z);
    egg.rotation.y = rotation;
    egg.scale.set(size, 1, size);
    breakfast.add(egg);

    ellipsoid(0, eggY, 0, 0.62, 0.11, 0.46, eggWhiteMat, egg);
    ellipsoid(-0.22, eggY - 0.018, 0.08, 0.42, 0.08, 0.32, eggWhiteMat, egg);
    ellipsoid(0.24, eggY - 0.016, -0.08, 0.4, 0.078, 0.3, eggWhiteMat, egg);
    ellipsoid(0.04, eggY + 0.012, 0.08, 0.36, 0.09, 0.28, eggWhiteMat, egg);

    ellipsoid(0.03, yolkY, 0, 0.22, 0.06, 0.2, yolkMat, egg);
  }

  makeEgg(-0.82, 0.34, -0.25, 1.04);
  makeEgg(0.78, -0.48, 0.22, 1.0);

  // Chili butter: graphic pools and dots placed close to yogurt/egg surfaces.
  function sauceOval(x, y, z, sx, sz, rotation) {
    const sauce = ellipsoid(x, y, z, sx, 0.018, sz, chiliMat);
    sauce.rotation.y = rotation;
    return sauce;
  }

  function sauceDot(x, y, z, size) {
    return sauceOval(x, y, z, size, size * 0.72, 0);
  }

  [
    [-1.28, -0.5, 0.44, 0.16, 0.45],
    [-0.18, -0.82, 0.58, 0.12, -0.08],
    [1.12, 0.34, 0.4, 0.14, -0.5],
    [0.14, 0.56, 0.44, 0.13, 0.2],
    [-0.78, 0.3, 0.24, 0.09, -0.28],
    [0.76, -0.38, 0.24, 0.085, 0.24]
  ].forEach(([x, z, sx, sz, rotation], index) => {
    sauceOval(x, index > 3 ? sauceEgg : sauceYogurt, z, sx, sz, rotation);
  });

  [
    [-1.72, -0.08, 0.11],
    [-0.42, 0.18, 0.08],
    [0.34, -0.28, 0.09],
    [1.56, 0.08, 0.1],
    [-0.92, 0.12, 0.07],
    [0.9, -0.12, 0.07]
  ].forEach(([x, z, size], index) => {
    sauceDot(x, index > 3 ? sauceEgg + 0.004 : sauceYogurt + 0.012, z, size);
  });

  // Herbs: small flattened leaves clustered on the top layer.
  function herbLeaf(x, z, rotation, size = 1) {
    const leaf = ellipsoid(x, herbY, z, 0.065 * size, 0.024 * size, 0.17 * size, herbMat);
    leaf.rotation.y = rotation;
  }

  [
    [-1.14, 0.58, 0.6, 1],
    [-0.55, -0.48, -0.25, 0.85],
    [0.14, 0.88, -0.6, 0.9],
    [0.58, -0.58, 0.45, 0.8],
    [1.18, 0.12, -0.8, 1],
    [1.42, 0.62, 0.3, 0.75],
    [-0.86, 0.72, -0.35, 0.8],
    [0.82, 0.2, 0.7, 0.8]
  ].forEach(([x, z, rotation, size]) => herbLeaf(x, z, rotation, size));

  // Bread: two tan primitive wedges gathered near one rim, with simple spots.
  function breadPiece(x, z, rotation, scale = 1) {
    const breadShape = new THREE.Shape();
    breadShape.moveTo(-0.62, -0.42);
    breadShape.lineTo(0.64, -0.32);
    breadShape.lineTo(0.2, 0.5);
    breadShape.lineTo(-0.6, 0.34);
    breadShape.lineTo(-0.62, -0.42);

    const breadGeo = new THREE.ExtrudeGeometry(breadShape, {
      depth: 0.14,
      bevelEnabled: false
    });
    const bread = new THREE.Mesh(breadGeo, breadMat);
    bread.position.set(x, breadY, z);
    bread.rotation.x = -Math.PI / 2;
    bread.rotation.z = rotation;
    bread.scale.set(scale, scale, scale);
    addMesh(bread);

    flatCylinder(x + 0.16 * scale, breadY + 0.16, z + 0.01, 0.07, 0.02, 1, 0.7, breadSpotMat, breakfast, 16).rotation.y = rotation;
    flatCylinder(x - 0.2 * scale, breadY + 0.16, z - 0.1, 0.055, 0.02, 1, 0.6, breadSpotMat, breakfast, 16).rotation.y = rotation + 0.4;
  }

  breadPiece(2.1, 0.78, -0.65, 1.05);
  breadPiece(2.48, 1.2, -0.28, 0.88);

  function resizeRendererToContainer() {
    const width = formsContainer.clientWidth;
    const height = formsContainer.clientHeight;
    const aspect = width / height;
    const viewHeight = 6.7;

    camera.left = (-viewHeight * aspect) / 2;
    camera.right = (viewHeight * aspect) / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  resizeRendererToContainer();
  window.addEventListener("resize", resizeRendererToContainer);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}
