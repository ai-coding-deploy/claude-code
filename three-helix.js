/* =============================================================
   three-helix.js
   CortexLens School — Hero background
   Slowly rotating 3D wireframe DNA-like double helix made of
   glowing nodes, with subtle mouse parallax.
   ============================================================= */

(function () {
  'use strict';

  // ---------- Bail-out conditions ------------------------------
  if (typeof window.THREE === 'undefined') {
    // Three.js failed to load — leave the placeholder background.
    return;
  }

  var mount = document.getElementById('hero-helix');
  if (!mount) return;

  var prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // ---------- Scene, camera, renderer --------------------------
  var THREE = window.THREE;

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(
    35,
    mount.clientWidth / mount.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 14);

  var renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(mount.clientWidth, mount.clientHeight, false);
  mount.appendChild(renderer.domElement);

  // ---------- Helix geometry -----------------------------------
  // Two intertwined sinusoidal strands of glowing node spheres,
  // joined by faint "rung" lines like base pairs.

  var helixGroup = new THREE.Group();
  scene.add(helixGroup);

  var COBALT = 0x1e40af;
  var MINT = 0x10b981;
  var CHARCOAL = 0x111827;

  var NODES_PER_STRAND = 56;
  var TURNS = 3.2;
  var RADIUS = 1.55;
  var HEIGHT = 9.2;
  var ANGULAR_OFFSET = Math.PI; // 180° between the two strands

  var strandAGeoPositions = [];
  var strandBGeoPositions = [];

  // Node materials — emissive-like (basic materials, but bright)
  var nodeMatA = new THREE.MeshBasicMaterial({
    color: COBALT,
    transparent: true,
    opacity: 0.95
  });
  var nodeMatB = new THREE.MeshBasicMaterial({
    color: MINT,
    transparent: true,
    opacity: 0.9
  });

  var glowMatA = new THREE.MeshBasicMaterial({
    color: COBALT,
    transparent: true,
    opacity: 0.18
  });
  var glowMatB = new THREE.MeshBasicMaterial({
    color: MINT,
    transparent: true,
    opacity: 0.16
  });

  var nodeGeo = new THREE.SphereGeometry(0.085, 16, 16);
  var glowGeo = new THREE.SphereGeometry(0.22, 16, 16);

  for (var i = 0; i < NODES_PER_STRAND; i += 1) {
    var t = i / (NODES_PER_STRAND - 1); // 0..1
    var y = (t - 0.5) * HEIGHT;
    var theta = t * TURNS * Math.PI * 2;

    // Strand A
    var ax = Math.cos(theta) * RADIUS;
    var az = Math.sin(theta) * RADIUS;
    strandAGeoPositions.push(new THREE.Vector3(ax, y, az));

    var nodeA = new THREE.Mesh(nodeGeo, nodeMatA);
    nodeA.position.set(ax, y, az);
    helixGroup.add(nodeA);

    var glowA = new THREE.Mesh(glowGeo, glowMatA);
    glowA.position.set(ax, y, az);
    helixGroup.add(glowA);

    // Strand B
    var bx = Math.cos(theta + ANGULAR_OFFSET) * RADIUS;
    var bz = Math.sin(theta + ANGULAR_OFFSET) * RADIUS;
    strandBGeoPositions.push(new THREE.Vector3(bx, y, bz));

    var nodeB = new THREE.Mesh(nodeGeo, nodeMatB);
    nodeB.position.set(bx, y, bz);
    helixGroup.add(nodeB);

    var glowB = new THREE.Mesh(glowGeo, glowMatB);
    glowB.position.set(bx, y, bz);
    helixGroup.add(glowB);
  }

  // ---------- Strand backbones (lines connecting nodes) --------
  function buildStrandLine(points, color) {
    var geom = new THREE.BufferGeometry().setFromPoints(points);
    var mat = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.55
    });
    return new THREE.Line(geom, mat);
  }

  helixGroup.add(buildStrandLine(strandAGeoPositions, COBALT));
  helixGroup.add(buildStrandLine(strandBGeoPositions, MINT));

  // ---------- Rungs (base pairs) -------------------------------
  // Only draw every Nth rung so it stays delicate.
  var RUNG_STEP = 2;
  var rungMat = new THREE.LineBasicMaterial({
    color: CHARCOAL,
    transparent: true,
    opacity: 0.22
  });

  for (var r = 0; r < NODES_PER_STRAND; r += RUNG_STEP) {
    var rungGeo = new THREE.BufferGeometry().setFromPoints([
      strandAGeoPositions[r],
      strandBGeoPositions[r]
    ]);
    var rung = new THREE.Line(rungGeo, rungMat);
    helixGroup.add(rung);
  }

  // Light tilt so the helix reads as 3D from the start.
  helixGroup.rotation.x = 0.18;
  helixGroup.rotation.z = -0.08;

  // ---------- Mouse parallax -----------------------------------
  var targetTiltX = 0;
  var targetTiltY = 0;
  var currentTiltX = 0;
  var currentTiltY = 0;

  function onPointerMove(event) {
    var rect = mount.getBoundingClientRect();
    var nx = (event.clientX - rect.left) / rect.width;
    var ny = (event.clientY - rect.top) / rect.height;
    // Map 0..1 to -1..1
    targetTiltY = (nx - 0.5) * 0.6;
    targetTiltX = (ny - 0.5) * 0.4;
  }

  if (!prefersReducedMotion) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  // ---------- Resize handling ----------------------------------
  function handleResize() {
    var w = mount.clientWidth;
    var h = mount.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  window.addEventListener('resize', handleResize);

  // ---------- Visibility throttle ------------------------------
  var isVisible = true;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        isVisible = entry.isIntersecting;
      });
    });
    io.observe(mount);
  }

  // ---------- Animation loop -----------------------------------
  var clock = new THREE.Clock();
  var baseRotationSpeed = prefersReducedMotion ? 0 : 0.085;

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    var dt = clock.getDelta();

    helixGroup.rotation.y += baseRotationSpeed * dt;

    // Smoothly approach mouse parallax targets.
    currentTiltX += (targetTiltX - currentTiltX) * 0.045;
    currentTiltY += (targetTiltY - currentTiltY) * 0.045;

    helixGroup.rotation.x = 0.18 + currentTiltX;
    // Add parallax to z-tilt as well for depth feel.
    helixGroup.rotation.z = -0.08 + currentTiltY * 0.4;

    renderer.render(scene, camera);
  }

  animate();
})();
