// 3D canvas 1: çılbır as primitive geometry
// Three.js is linked in index.html before this file, so the global THREE object
// is ready to use here. OrbitControls is linked there too.

const formsContainer = document.getElementById("three-canvas-forms");

if (formsContainer) {
  // The scene is the 3D world that holds the plate, food, lights, and camera.
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#fffaf2");

  // A group keeps the whole breakfast centered and easy to move as one object.
  const breakfast = new THREE.Group();
  scene.add(breakfast);

  // An orthographic camera keeps the view clean and illustrated instead of
  // dramatic. This starting position is a slightly elevated 3/4 view: low enough
  // to show the food layers, but high enough to keep the whole plate visible.
  const camera = new THREE.OrthographicCamera(-5, 5, 3.6, -3.6, 0.1, 100);
  camera.position.set(4.35, 3.05, 6.35);
  camera.lookAt(0, 0.12, 0);

  // The renderer creates the actual <canvas> element and draws the scene into it.
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(formsContainer.clientWidth, formsContainer.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 0.88;
  // shadowMap turns on real Three.js shadows. Objects with castShadow can drop
  // shadows, and objects with receiveShadow can catch them.
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  formsContainer.appendChild(renderer.domElement);

  // OrbitControls connects mouse dragging to the camera, so viewers can rotate
  // around the dish while still starting from the designed 3/4 angle.
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 0.12, 0);
  controls.minZoom = 0.82;
  controls.maxZoom = 1.75;

  // Warm fill light keeps the scene cozy. These intensities are intentionally
  // moderate so the cream/yellow food colors do not get washed out.
  const ambientLight = new THREE.HemisphereLight("#ffe8c7", "#a9845e", 0.72);
  scene.add(ambientLight);

  // One soft directional light from the upper front-left gives gentle shadows
  // without creating an overexposed spotlight effect.
  const keyLight = new THREE.DirectionalLight("#ffd7a3", 0.9);
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

  // This subtle plane sits just under the plate and only catches shadows. Its
  // transparent material lets the website's warm background show through, so the
  // plate feels grounded on the page without adding a visible floor.
  const shadowMat = new THREE.ShadowMaterial({
    color: "#5d3c22",
    opacity: 0.12
  });
  const shadowCatcher = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), shadowMat);
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = -0.24;
  shadowCatcher.castShadow = false;
  shadowCatcher.receiveShadow = true;
  scene.add(shadowCatcher);

  // Geometry is the shape, material is the color/surface, and mesh is both
  // combined into something visible.
  const plateBlue = new THREE.MeshStandardMaterial({
    color: "#3c6688",
    roughness: 0.76,
    metalness: 0
  });
  const plateDarkBlue = new THREE.MeshStandardMaterial({
    color: "#294f70",
    roughness: 0.78,
    metalness: 0
  });
  const plateCream = new THREE.MeshStandardMaterial({
    color: "#ead8bd",
    roughness: 0.9,
    metalness: 0
  });
  const rimLineMat = new THREE.MeshStandardMaterial({
    color: "#f2dfc2",
    roughness: 0.82,
    metalness: 0
  });
  const yogurtMat = new THREE.MeshStandardMaterial({
    color: "#dfcfb5",
    roughness: 0.95,
    metalness: 0
  });
  const eggWhiteMat = new THREE.MeshStandardMaterial({
    color: "#f4dfbf",
    roughness: 0.92,
    metalness: 0
  });
  const yolkMat = new THREE.MeshStandardMaterial({
    color: "#dc8710",
    roughness: 0.62,
    metalness: 0
  });
  const chiliMat = new THREE.MeshStandardMaterial({
    color: "#c83a14",
    roughness: 0.45,
    metalness: 0
  });
  const herbMat = new THREE.MeshStandardMaterial({
    color: "#526a2a",
    roughness: 0.82,
    metalness: 0
  });
  const breadMat = new THREE.MeshStandardMaterial({
    color: "#c78e4d",
    roughness: 0.92,
    metalness: 0
  });
  const breadSpotMat = new THREE.MeshStandardMaterial({
    color: "#74451c",
    roughness: 0.94,
    metalness: 0
  });

  function addMesh(mesh, parent = breakfast) {
    // Most visible pieces cast and receive subtle shadows. This makes the plate,
    // yogurt, eggs, sauce, herbs, and bread read as separate stacked layers.
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function flatSphere(x, y, z, sx, sy, sz, material) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 18), material);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, sy, sz);
    return addMesh(mesh);
  }

  function flatCylinder(x, y, z, radius, height, sx, sz, material, segments = 48) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material);
    mesh.position.set(x, y, z);
    mesh.scale.set(sx, 1, sz);
    return addMesh(mesh);
  }

  // Plate build:
  // The plate is made from shallow cylinders so it feels flat and ceramic, not
  // like a deep bowl. A cream disk is the eating surface, a thin muted-blue
  // cylinder peeks out as the side, and very slim torus rings draw the blue rim.
  const plateSide = new THREE.Mesh(new THREE.CylinderGeometry(3.45, 3.35, 0.18, 80), plateBlue);
  plateSide.position.y = -0.08;
  addMesh(plateSide);

  const plateInterior = new THREE.Mesh(new THREE.CylinderGeometry(3.18, 3.12, 0.08, 80), plateCream);
  plateInterior.position.y = 0.05;
  addMesh(plateInterior);

  const outerBlueRim = new THREE.Mesh(new THREE.TorusGeometry(3.27, 0.035, 8, 96), plateDarkBlue);
  outerBlueRim.rotation.x = Math.PI / 2;
  outerBlueRim.position.y = 0.14;
  addMesh(outerBlueRim);

  const innerBlueRim = new THREE.Mesh(new THREE.TorusGeometry(2.86, 0.022, 8, 96), plateBlue);
  innerBlueRim.rotation.x = Math.PI / 2;
  innerBlueRim.position.y = 0.17;
  addMesh(innerBlueRim);

  const softCreamHighlight = new THREE.Mesh(new THREE.TorusGeometry(3.04, 0.014, 8, 96), rimLineMat);
  softCreamHighlight.rotation.x = Math.PI / 2;
  softCreamHighlight.position.y = 0.19;
  addMesh(softCreamHighlight);

  // Small blue dashes around the rim nod to the floral/decorative edge in the
  // 2D p5 plate while staying beginner-friendly and primitive.
  function rimDash(angle, length, width) {
    const radius = 2.97;
    const dash = new THREE.Mesh(new THREE.BoxGeometry(length, 0.018, width), plateBlue);
    dash.position.set(Math.cos(angle) * radius, 0.215, Math.sin(angle) * radius);
    dash.rotation.y = -angle;
    addMesh(dash);
  }

  rimDash(0.15, 0.32, 0.055);
  rimDash(0.82, 0.24, 0.05);
  rimDash(1.55, 0.3, 0.055);
  rimDash(2.3, 0.22, 0.05);
  rimDash(3.05, 0.34, 0.055);
  rimDash(3.9, 0.24, 0.05);
  rimDash(4.65, 0.32, 0.055);
  rimDash(5.45, 0.22, 0.05);

  // Food layer heights:
  // The plate interior is around y = 0.05. Each food layer is only a small step
  // above that, so the dish reads as stacked food instead of floating objects.
  // yogurtY: rests directly on the plate
  // eggY: sits just on top of the yogurt
  // yolkY: partly embedded in each egg white
  // sauceY: a thin layer on top of yogurt and eggs
  // herbY: tiny leaves/stems on the very top
  const yogurtY = 0.125;
  const eggY = 0.255;
  const yolkY = 0.345;
  const sauceY = 0.395;
  const herbY = 0.455;
  const breadY = 0.14;

  // Creamy yogurt base: several overlapping flattened spheres make a soft bed.
  flatSphere(-0.72, yogurtY, 0.02, 1.34, 0.1, 0.78, yogurtMat).rotation.y = 0.18;
  flatSphere(0.72, yogurtY, -0.1, 1.32, 0.1, 0.78, yogurtMat).rotation.y = -0.16;
  flatSphere(0.02, yogurtY - 0.01, 0.62, 1.14, 0.085, 0.55, yogurtMat);
  flatSphere(0.02, yogurtY - 0.01, -0.68, 1.12, 0.085, 0.5, yogurtMat);

  // Two poached eggs sit slightly above the yogurt. They are warmer and lighter
  // than the yogurt so the egg shapes separate clearly.
  flatSphere(-0.9, eggY, 0.08, 0.76, 0.13, 0.58, eggWhiteMat).rotation.y = -0.2;
  flatSphere(-0.92, yolkY, 0.04, 0.24, 0.075, 0.22, yolkMat);

  flatSphere(0.88, eggY, -0.06, 0.76, 0.13, 0.58, eggWhiteMat).rotation.y = 0.18;
  flatSphere(0.88, yolkY, -0.08, 0.24, 0.075, 0.22, yolkMat);

  // Chili butter sits on top as bright orange-red pools and ribbons.
  function saucePool(x, z, sx, sz, rotation) {
    const sauce = flatCylinder(x, sauceY, z, 0.31, 0.035, sx, sz, chiliMat, 40);
    sauce.rotation.y = rotation;
    return sauce;
  }

  function sauceRibbon(x, z, length, width, rotation) {
    const ribbon = new THREE.Mesh(new THREE.BoxGeometry(length, 0.026, width), chiliMat);
    ribbon.position.set(x, sauceY + 0.016, z);
    ribbon.rotation.y = rotation;
    return addMesh(ribbon);
  }

  saucePool(-1.42, -0.45, 1.15, 0.35, 0.45);
  saucePool(0.04, -0.78, 1.45, 0.24, -0.04);
  saucePool(1.38, 0.38, 1.05, 0.32, -0.5);
  saucePool(0.05, 0.5, 0.9, 0.28, 0.2);
  sauceRibbon(-0.58, 0.76, 0.9, 0.1, -0.5);
  sauceRibbon(0.64, 0.7, 0.98, 0.1, 0.35);
  sauceRibbon(1.34, -0.32, 0.72, 0.1, -0.85);
  sauceRibbon(-1.12, 0.22, 0.78, 0.1, 0.8);

  // Herbs are the top layer: small green ellipses and thin stems.
  function herbLeaf(x, z, rotation, size = 1) {
    const leaf = flatSphere(x, herbY, z, 0.06 * size, 0.025 * size, 0.17 * size, herbMat);
    leaf.rotation.y = rotation;
    return leaf;
  }

  function herbStem(x, z, rotation, length = 0.28) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, length, 8), herbMat);
    stem.position.set(x, herbY, z);
    stem.rotation.z = Math.PI / 2;
    stem.rotation.y = rotation;
    return addMesh(stem);
  }

  herbLeaf(-1.14, 0.6, 0.6);
  herbLeaf(-0.55, -0.48, -0.25, 0.85);
  herbLeaf(0.14, 0.9, -0.6, 0.9);
  herbLeaf(0.58, -0.58, 0.45, 0.8);
  herbLeaf(1.18, 0.12, -0.8);
  herbLeaf(1.42, 0.62, 0.3, 0.75);
  herbStem(-0.86, 0.72, -0.35);
  herbStem(0.82, 0.2, 0.7);
  herbStem(0.08, -0.16, -0.1, 0.24);

  // Flatbread rests near the rim. Small cylinders become browned spots.
  function breadPiece(x, z, rotation) {
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
    addMesh(bread);

    const spotOne = flatCylinder(x + 0.16, breadY + 0.16, z + 0.01, 0.07, 0.02, 1, 0.7, breadSpotMat, 16);
    spotOne.rotation.y = rotation;
    const spotTwo = flatCylinder(x - 0.2, breadY + 0.16, z - 0.1, 0.055, 0.02, 1, 0.6, breadSpotMat, 16);
    spotTwo.rotation.y = rotation + 0.4;
  }

  breadPiece(2.24, 0.9, -0.5);
  breadPiece(-2.2, -0.96, 2.55);

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

  // The animation loop redraws the scene and lets OrbitControls keep updating.
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}
