// 3D canvas 2: coffee and donut table study
// This scene uses simple standard Three.js primitives only: cylinders, torus,
// spheres, boxes, and a plane. No imported models, WebGPU, shaders, or loaders.

const lightContainer = document.getElementById("three-canvas-light");

if (lightContainer) {
  // Scene: the 3D world for the tabletop material / lighting / fog study.
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#fffaf2");

  // Fog: a subtle warm haze that softens distance without making the scene dark.
  scene.fog = new THREE.FogExp2("#fff0dc", 0.045);

  // Camera: a perspective camera gives the coffee and donut a familiar table view.
  const camera = new THREE.PerspectiveCamera(
    42,
    lightContainer.clientWidth / lightContainer.clientHeight,
    0.1,
    100
  );
  camera.position.set(0.3, 2.6, 6.4);

  // Renderer: draws this second scene into the #three-canvas-light container.
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(lightContainer.clientWidth, lightContainer.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  lightContainer.appendChild(renderer.domElement);

  // OrbitControls lets the viewer rotate around the tabletop setup.
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 0.45, 0);
  controls.minDistance = 4;
  controls.maxDistance = 9;

  // Lighting: warm and soft, like morning light on a breakfast table.
  const fillLight = new THREE.HemisphereLight("#ffe8c7", "#b8875d", 0.82);
  scene.add(fillLight);

  const keyLight = new THREE.DirectionalLight("#ffd39a", 0.95);
  keyLight.position.set(-3.8, 5.2, 4.2);
  keyLight.castShadow = true;
  keyLight.shadow.radius = 4;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  scene.add(keyLight);

  const warmPoint = new THREE.PointLight("#ffcf8a", 0.45, 7);
  warmPoint.position.set(1.5, 2.3, 1.8);
  scene.add(warmPoint);

  // Materials: each object has a different surface quality.
  const tableMat = new THREE.MeshStandardMaterial({
    color: "#ead8bd",
    roughness: 0.94,
    metalness: 0
  });
  const ceramicMat = new THREE.MeshStandardMaterial({
    color: "#f2dfc2",
    roughness: 0.72,
    metalness: 0
  });
  const ceramicBlueMat = new THREE.MeshStandardMaterial({
    color: "#3c6688",
    roughness: 0.76,
    metalness: 0
  });
  const coffeeMat = new THREE.MeshStandardMaterial({
    color: "#3a2014",
    roughness: 0.18,
    metalness: 0.08
  });
  const donutMat = new THREE.MeshStandardMaterial({
    color: "#c78e4d",
    roughness: 0.86,
    metalness: 0
  });
  const icingMat = new THREE.MeshStandardMaterial({
    color: "#d8898e",
    roughness: 0.22,
    metalness: 0.04
  });
  const sprinklePinkMat = new THREE.MeshStandardMaterial({
    color: "#e75f88",
    roughness: 0.55,
    metalness: 0
  });
  const sprinkleCreamMat = new THREE.MeshStandardMaterial({
    color: "#fff0c9",
    roughness: 0.55,
    metalness: 0
  });
  const sprinkleBlueMat = new THREE.MeshStandardMaterial({
    color: "#5c86a8",
    roughness: 0.55,
    metalness: 0
  });

  function addMesh(mesh, parent = scene) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  // Table: one broad, matte surface that both cup and donut rest on.
  const table = new THREE.Mesh(new THREE.BoxGeometry(7, 0.16, 4.4), tableMat);
  table.position.y = -0.12;
  addMesh(table);

  // Coffee cup group on the left side of the table.
  const cupGroup = new THREE.Group();
  cupGroup.position.set(-1.35, 0, 0.12);
  scene.add(cupGroup);

  // Saucer: flat ceramic cylinder.
  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1.0, 0.08, 64), ceramicMat);
  saucer.position.y = 0.02;
  addMesh(saucer, cupGroup);

  const saucerRing = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.025, 8, 64), ceramicBlueMat);
  saucerRing.rotation.x = Math.PI / 2;
  saucerRing.position.y = 0.08;
  addMesh(saucerRing, cupGroup);

  // Cup: a simple open-looking cylinder with a smaller dark coffee disk inside.
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.46, 0.82, 64, 1, true), ceramicMat);
  cup.position.y = 0.47;
  addMesh(cup, cupGroup);

  const cupRim = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.035, 10, 64), ceramicBlueMat);
  cupRim.rotation.x = Math.PI / 2;
  cupRim.position.y = 0.9;
  addMesh(cupRim, cupGroup);

  const coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.025, 64), coffeeMat);
  coffee.position.y = 0.88;
  addMesh(coffee, cupGroup);

  // Handle: a torus turned upright. It is simple but reads clearly as a handle.
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.045, 12, 48), ceramicMat);
  handle.position.set(0.54, 0.55, 0);
  handle.rotation.y = Math.PI / 2;
  addMesh(handle, cupGroup);

  // Donut group on the right side. The donut is the moving glossy object.
  const donutGroup = new THREE.Group();
  donutGroup.position.set(1.25, 0.35, 0);
  scene.add(donutGroup);

  const donutBody = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.23, 24, 80), donutMat);
  donutBody.rotation.x = Math.PI / 2;
  addMesh(donutBody, donutGroup);

  // Icing is a second slightly smaller torus sitting on top of the donut body.
  const icing = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.095, 18, 80), icingMat);
  icing.rotation.x = Math.PI / 2;
  icing.position.y = 0.13;
  icing.scale.set(1.02, 1, 1.02);
  addMesh(icing, donutGroup);

  // Sprinkles: tiny colorful boxes placed around the icing.
  const sprinkleMaterials = [sprinklePinkMat, sprinkleCreamMat, sprinkleBlueMat];
  const sprinkleAngles = [0.2, 0.85, 1.5, 2.15, 2.75, 3.35, 4.0, 4.65, 5.25, 5.75];

  sprinkleAngles.forEach((angle, index) => {
    const radius = 0.72;
    const sprinkle = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.025, 0.045),
      sprinkleMaterials[index % sprinkleMaterials.length]
    );
    sprinkle.position.set(Math.cos(angle) * radius, 0.26, Math.sin(angle) * radius);
    sprinkle.rotation.y = -angle + index * 0.25;
    addMesh(sprinkle, donutGroup);
  });

  // Optional beginner-friendly steam: translucent-looking matte ellipsoid puffs.
  const steamMat = new THREE.MeshStandardMaterial({
    color: "#f7e8d5",
    roughness: 0.9,
    metalness: 0,
    transparent: true,
    opacity: 0.45
  });
  const steamPuffs = [];

  [
    [-0.18, 1.16, 0.02, 0.08],
    [0.04, 1.36, -0.03, 0.06],
    [0.18, 1.56, 0.02, 0.05]
  ].forEach(([x, y, z, size], index) => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8), steamMat);
    puff.position.set(x, y, z);
    puff.scale.set(size, size * 1.5, size);
    addMesh(puff, cupGroup);
    steamPuffs.push({ mesh: puff, baseY: y, offset: index * 0.8 });
  });

  function resizeRendererToContainer() {
    const width = lightContainer.clientWidth;
    const height = lightContainer.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  resizeRendererToContainer();
  window.addEventListener("resize", resizeRendererToContainer);

  // Animation loop: donut rotates and gently bobs; coffee cup stays calm.
  function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    donutGroup.rotation.y += 0.008;
    donutGroup.position.y = 0.35 + Math.sin(time * 1.3) * 0.035;

    steamPuffs.forEach(({ mesh, baseY, offset }) => {
      mesh.position.y = baseY + Math.sin(time * 0.9 + offset) * 0.035;
      mesh.position.x += Math.sin(time * 0.7 + offset) * 0.0008;
    });

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}
