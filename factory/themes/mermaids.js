/* Theme: mermaids in two pools. Tap one and she dives below the surface; Splash! sends water across to the other pool. */
var THEME = {
  id: 'mermaids',
  folder: 'maths/04-mermaid-maths-game',
  title: 'Mermaid Maths',
  one: 'mermaid',
  many: 'mermaids',
  buttons: {addLeft: '+ Mermaid left', addRight: '+ Mermaid right', act: 'Splash!'},
  help: 'Tap a mermaid and she dives. Drag a mermaid to the other pool. The + buttons call one more.',
  stageLabel: 'Two pools of mermaids. Call, dive or drag mermaids to change the numbers.',
  fonts: 'family=Fredoka:wght@500;600&family=Nunito:wght@600;800',
  colors: {
    bg: '#060b1f', field: '#0b1636', fieldGlow: '#17306b', ink: '#f0f7ff', dim: '#9db4e0',
    accent: '#f472b6', accent2: '#67e8f9', hi: '#fdf2f8', warn: '#fde047', sky: '#bae6fd',
    display: '"Fredoka", "Arial Rounded MT Bold", "Trebuchet MS", sans-serif', body: '"Nunito", "Segoe UI", system-ui, sans-serif'
  },
  chime: 'triangle',
  lines: {
    taskBuild: 'Bring {n} {things} to the left.',
    taskKeep: 'Make {many} dive until the right side has {n}.',
    empty: 'Call some {many} first!',
    clear: 'All clear. Call some {many}!',
    act: '{Many}, splash!'
  },

  build: function (THREE, kit) {
    var C = kit.C;
    var SKIN = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac];
    var HAIR = [0xf472b6, 0xa78bfa, 0xfbbf24, 0xb45309, 0x312e81, 0xfde68a];
    var TAIL = [0x2dd4bf, 0xa855f7, 0xec4899, 0x38bdf8, 0x34d399, 0xf97316];
    var mats = {};
    function mat(color, glow) {
      var k = color + ':' + (glow || 0);
      if (!mats[k]) {
        mats[k] = new THREE.MeshStandardMaterial({color: color, roughness: 0.45, metalness: 0.1,
          emissive: color, emissiveIntensity: glow || 0.08});
      }
      return mats[k];
    }
    var aquaMat = new THREE.MeshBasicMaterial({color: C.accent2});
    var eyeMat = new THREE.MeshBasicMaterial({color: 0x1e1b4b});
    var dropGeo = new THREE.SphereGeometry(0.06, 8, 6);
    var dropMat = new THREE.MeshBasicMaterial({color: 0xbff4ff});
    var sparkGeo = new THREE.PlaneGeometry(0.08, 0.08);
    // the tail fin: two rounded lobes, flat
    var finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.quadraticCurveTo(-0.08, 0.1, -0.27, 0.3);
    finShape.quadraticCurveTo(-0.12, 0.28, 0, 0.17);
    finShape.quadraticCurveTo(0.12, 0.28, 0.27, 0.3);
    finShape.quadraticCurveTo(0.08, 0.1, 0, 0);
    var finGeo = new THREE.ExtrudeGeometry(finShape, {depth: 0.03, bevelEnabled: false});
    finGeo.translate(0, 0, -0.015);

    // A pool: a dark basin, a lit rim, and see-through water at height 0.
    function ground() {
      var g = new THREE.Group();
      var basin = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.6, 5.9), new THREE.MeshStandardMaterial({color: 0x0a1f4d, roughness: 0.9}));
      basin.position.y = -0.36;
      basin.receiveShadow = true;
      g.add(basin);
      var rimMat = new THREE.MeshStandardMaterial({color: 0x1d3a7a, roughness: 0.6});
      var rimLine = new THREE.LineBasicMaterial({color: C.accent2, transparent: true, opacity: 0.85});
      // the rim: two long sides and two short ends
      [[0.12, 6.02, 1.85, 0], [0.12, 6.02, -1.85, 0], [3.82, 0.12, 0, 2.95], [3.82, 0.12, 0, -2.95]].forEach(function (r) {
        var m = kit.withEdges(new THREE.Mesh(new THREE.BoxGeometry(r[0], 0.12, r[1]), rimMat), rimLine);
        m.position.set(r[2], 0.0, r[3]);
        g.add(m);
      });
      var water = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 5.9), new THREE.MeshStandardMaterial({
        color: 0x1d5fb8, transparent: true, opacity: 0.42, roughness: 0.15, metalness: 0.2,
        emissive: 0x0b3a7a, emissiveIntensity: 0.6, depthWrite: false}));
      water.rotation.x = -Math.PI / 2;
      water.position.y = 0.0;
      water.renderOrder = 2;
      g.add(water);
      // sparkles on the water that come and go
      var sparks = [];
      for (var i = 0; i < 14; i++) {
        var s = new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial({color: i % 3 ? 0xe0fbff : C.accent, transparent: true, opacity: 0, depthWrite: false}));
        s.rotation.x = -Math.PI / 2;
        s.rotation.z = Math.PI / 4;
        s.position.set((Math.random() - 0.5) * 3.2, 0.02, (Math.random() - 0.5) * 5.4);
        s.userData.phase = Math.random() * Math.PI * 2;
        s.renderOrder = 3;
        g.add(s);
        sparks.push(s);
      }
      var glow = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 6.7),
        new THREE.MeshBasicMaterial({color: C.accent2, transparent: true, opacity: 0.08, depthWrite: false}));
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = -0.66;
      g.add(glow);
      g.userData.sparks = sparks;
      return g;
    }
    function groundIdle(g, now) {
      g.userData.sparks.forEach(function (s) {
        s.material.opacity = Math.max(0, Math.sin(now / 600 + s.userData.phase)) * 0.9;
      });
    }

    // A mermaid facing +x, her waist at the water line. Each one gets her own colours.
    function make(i) {
      var g = new THREE.Group();
      var rig = new THREE.Group();
      g.add(rig);
      var skin = mat(SKIN[(i * 3) % SKIN.length]);
      var hair = mat(HAIR[(i * 5 + 1) % HAIR.length]);
      var tail = mat(TAIL[(i * 7 + 2) % TAIL.length], 0.2);
      function put(geo, m, x, y, z, parent) {
        var mesh = new THREE.Mesh(geo, m);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        (parent || rig).add(mesh);
        return mesh;
      }
      // the tail: a curve of shrinking beads, down under the water and up again behind her
      var curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.3, 0), new THREE.Vector3(-0.06, 0.1, 0), new THREE.Vector3(-0.24, 0.0, 0),
        new THREE.Vector3(-0.46, 0.03, 0), new THREE.Vector3(-0.62, 0.12, 0), new THREE.Vector3(-0.76, 0.2, 0)]);
      var beads = 30;
      for (var b = 0; b < beads; b++) {
        var p = curve.getPoint(b / (beads - 1));
        put(new THREE.SphereGeometry(0.135 - b * 0.0032, 14, 10), tail, p.x, p.y, p.z);
      }
      // the fin, which flicks
      var fin = new THREE.Group();
      var end = curve.getPoint(1);
      fin.position.copy(end);
      var fluke = new THREE.Mesh(finGeo, mat(TAIL[(i * 7 + 2) % TAIL.length], 0.5));
      // lie flat, lobes pointing back: the shape's width goes sideways and its length goes backwards
      fluke.setRotationFromMatrix(new THREE.Matrix4().makeBasis(
        new THREE.Vector3(0, 0, 1), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 1, 0)));
      fin.rotation.order = 'YXZ';
      fluke.castShadow = true;
      fluke.add(new THREE.LineSegments(new THREE.EdgesGeometry(finGeo, 40), new THREE.LineBasicMaterial({color: C.hi, transparent: true, opacity: 0.6})));
      fin.add(fluke);
      rig.add(fin);
      // a lit band at the waist, where the tail begins
      var band = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.022, 8, 24), aquaMat);
      band.rotation.x = Math.PI / 2;
      band.position.y = 0.3;
      rig.add(band);
      // body, top, head, eyes, hair, arms
      put(new THREE.CylinderGeometry(0.115, 0.1, 0.3, 16), skin, 0, 0.45, 0);
      put(new THREE.SphereGeometry(0.115, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), skin, 0, 0.6, 0);
      put(new THREE.CylinderGeometry(0.122, 0.118, 0.08, 16), mat(C.accent, 0.25), 0, 0.53, 0);
      put(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 10), skin, 0, 0.66, 0);
      put(new THREE.SphereGeometry(0.15, 18, 14), skin, 0, 0.77, 0);
      [-1, 1].forEach(function (s) { put(new THREE.SphereGeometry(0.024, 8, 6), eyeMat, 0.137, 0.79, s * 0.05); });
      put(new THREE.SphereGeometry(0.162, 18, 14), hair, -0.065, 0.81, 0);
      var back = put(new THREE.SphereGeometry(1, 16, 12), hair, -0.11, 0.63, 0);
      back.scale.set(0.1, 0.27, 0.15);
      back.rotation.z = 0.2;
      put(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({color: C.accent2}), -0.07, 0.94, 0.13);
      var arms = [-1, 1].map(function (s) {
        var arm = new THREE.Group();
        arm.position.set(0, 0.58, s * 0.125);
        put(new THREE.CylinderGeometry(0.03, 0.026, 0.3, 8), skin, 0, -0.14, 0, arm);
        put(new THREE.SphereGeometry(0.032, 8, 6), skin, 0, -0.29, 0, arm);
        arm.rotation.x = s * 0.45;
        rig.add(arm);
        return arm;
      });
      rig.scale.setScalar(1.6);
      g.userData.rig = {group: rig, fin: fin, arms: arms, flick: 0, phase: i * 1.7};
      return g;
    }

    function idle(t, now, dt) {
      var r = t.userData.rig;
      r.group.position.y = Math.sin(now / 700 + r.phase) * 0.04;
      r.flick = Math.max(0, r.flick - dt * 2.5);
      r.fin.rotation.z = 0.35 + Math.sin(now / 380 + r.phase) * 0.25 + r.flick * Math.sin(now / 50) * 0.7;
      r.arms[0].rotation.x = -0.45 - Math.sin(now / 900 + r.phase) * 0.12 - r.flick * 0.9;
      r.arms[1].rotation.x = 0.45 + Math.sin(now / 900 + r.phase) * 0.12 + r.flick * 0.9;
    }

    function splashAt(p, big) {
      kit.ring(p, C.accent2, big ? 0.9 : 0.5);
      kit.burst(p.clone().setY(0.1), big ? 22 : 8, [0xbff4ff, C.accent2, 0xffffff], big ? 1.6 : 1, {up: 1.5, upRand: 2.5, fade: 1.2});
    }

    // Splash!: she flicks her tail and throws water at the other pool.
    function act(t, side) {
      var r = t.userData.rig;
      r.flick = 1;
      var other = kit.padCenter(1 - side);
      var start = t.position.clone().add(new THREE.Vector3(0, 0.45, 0));
      var n = kit.reduced ? 3 : 6;
      for (var i = 0; i < n; i++) {
        var goal = other.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2.6, 0, (Math.random() - 0.5) * 4.6));
        var time = 0.8 + Math.random() * 0.35, gravity = 6;
        var v = goal.clone().sub(start).divideScalar(time);
        v.y = (goal.y - start.y) / time + 0.5 * gravity * time;
        var d = new THREE.Mesh(dropGeo, dropMat);
        d.position.copy(start);
        kit.launch(d, v, {gravity: gravity, life: time + 0.4, onLand: function (p) { splashAt(p, false); }});
      }
      splashAt(t.position.clone(), false);
      kit.noise({len: 0.35, freq: 1800, type: 'bandpass', q: 0.7, gain: 0.35, power: 3});
    }

    // Dive: she tips forward and slides below the surface, in a ring of splash.
    function remove(t) {
      var r = t.userData.rig, at = t.position.clone(), second = false;
      splashAt(at, true);
      kit.flash(at, 1.5);
      return {dur: 1.0, step: function (p) {
        r.group.rotation.z = -p * 1.5;
        r.group.position.y = -p * p * 1.8;
        r.group.position.x = p * 0.35;
        r.fin.rotation.z = Math.sin(p * 20) * 0.5;
        if (p > 0.55 && !second) { second = true; splashAt(at.clone().add(new THREE.Vector3(0.2, 0, 0)), false); }
      }};
    }

    return {
      ground: ground, groundIdle: groundIdle, make: make, idle: idle, act: act, remove: remove, faceEachOther: true,
      enterFrom: function () { return new THREE.Vector3(0, -1.6, 0); },
      sounds: {
        add: function () { kit.tone({type: 'sine', f1: 330, f2: 880, len: 0.22, gain: 0.12}); },
        remove: function () {
          kit.noise({len: 0.45, freq: 1400, type: 'bandpass', q: 0.8, gain: 0.45, power: 2});
          kit.tone({type: 'sine', f1: 700, f2: 140, len: 0.4, gain: 0.14});
        },
        move: function () { kit.tone({type: 'sine', f1: 440, f2: 990, len: 0.18, gain: 0.1}); }
      }
    };
  }
};
if (typeof module !== 'undefined') module.exports = THEME;
