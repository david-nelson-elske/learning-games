/* Theme: battle tanks. Tap one to blow it up; Fire! makes every tank shoot. */
var THEME = {
  id: 'tanks',
  folder: 'maths/03-tank-maths-game',
  title: 'Tank Maths',
  one: 'tank',
  many: 'tanks',
  buttons: {addLeft: '+ Build left', addRight: '+ Build right', act: 'Fire!'},
  help: 'Tap a tank to blow it up. Drag a tank to the other side. Build adds one.',
  stageLabel: 'Two groups of battle tanks. Build, blow up or drag tanks to change the numbers.',
  fonts: 'family=Russo+One&family=Nunito:wght@600;800',
  colors: {
    bg: '#071012', field: '#0c1a1c', fieldGlow: '#0f2a2b', ink: '#e6fffb', dim: '#7fb8b1',
    accent: '#2dd4bf', accent2: '#22d3ee', hi: '#ccfbf1', warn: '#fbbf24', sky: '#99f6e4',
    display: '"Russo One", "Arial Black", Impact, sans-serif', body: '"Nunito", "Segoe UI", system-ui, sans-serif'
  },
  lines: {},

  build: function (THREE, kit) {
    var C = kit.C;
    var bodyMat = new THREE.MeshStandardMaterial({color: 0x15403d, roughness: 0.55, metalness: 0.25, emissive: 0x031413});
    var darkMat = new THREE.MeshStandardMaterial({color: 0x0b2224, roughness: 0.8, metalness: 0.1});
    var litMat = new THREE.MeshBasicMaterial({color: C.accent});
    var hiMat = new THREE.MeshBasicMaterial({color: C.hi});
    var shellGeo = new THREE.SphereGeometry(0.07, 8, 8);

    // A plinth with a lit rim.
    function ground() {
      var g = new THREE.Group();
      var plinth = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.14, 5.9), darkMat);
      plinth.position.y = -0.07;
      plinth.receiveShadow = true;
      kit.withEdges(plinth, new THREE.LineBasicMaterial({color: C.accent, transparent: true, opacity: 0.8}));
      g.add(plinth);
      var glow = new THREE.Mesh(new THREE.PlaneGeometry(4.3, 6.6),
        new THREE.MeshBasicMaterial({color: C.accent, transparent: true, opacity: 0.07, depthWrite: false}));
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = -0.15;
      g.add(glow);
      return g;
    }

    // A battle tank, built along +x.
    function make() {
      var g = new THREE.Group();
      function add(geo, mat, x, y, z, rot) {
        var m = kit.withEdges(new THREE.Mesh(geo, mat));
        m.position.set(x, y, z);
        if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
        g.add(m);
        return m;
      }
      add(new THREE.BoxGeometry(1.32, 0.26, 0.26), darkMat, 0, 0.13, 0.36);
      add(new THREE.BoxGeometry(1.32, 0.26, 0.26), darkMat, 0, 0.13, -0.36);
      add(new THREE.BoxGeometry(1.12, 0.24, 0.62), bodyMat, 0.0, 0.36, 0);
      add(new THREE.BoxGeometry(0.26, 0.16, 0.6), bodyMat, 0.6, 0.31, 0, [0, 0, -0.65]);
      var turret = add(new THREE.CylinderGeometry(0.26, 0.31, 0.2, 20), bodyMat, -0.08, 0.58, 0);
      var gun = new THREE.Group();
      gun.position.set(0.12, 0.6, 0);
      var barrel = kit.withEdges(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.95, 12), bodyMat));
      barrel.rotation.z = -Math.PI / 2;
      barrel.position.x = 0.47;
      gun.add(barrel);
      var brake = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.13, 12), litMat);
      brake.rotation.z = -Math.PI / 2;
      brake.position.x = 0.98;
      gun.add(brake);
      g.add(gun);
      add(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 12), bodyMat, -0.15, 0.7, 0.08);
      // the road wheels: lit hubs on both tracks
      for (var i = 0; i < 5; i++) {
        [0.5, -0.5].forEach(function (z) {
          var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 10), litMat);
          hub.rotation.x = Math.PI / 2;
          hub.position.set(-0.5 + i * 0.25, 0.13, z);
          g.add(hub);
        });
      }
      // a lit stripe along each side of the hull
      [0.312, -0.312].forEach(function (z) {
        var s = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.03, 0.01), litMat);
        s.position.set(0, 0.42, z);
        g.add(s);
      });
      g.userData.rig = {gun: gun, turret: turret, recoil: 0};
      return g;
    }

    function idle(t, now, dt) {
      var r = t.userData.rig;
      if (r.recoil) { r.recoil = Math.max(0, r.recoil - dt * 4); r.gun.position.x = 0.12 - 0.12 * r.recoil; }
      var sway = Math.sin(now / 900 + t.id) * 0.06;
      r.turret.rotation.y = sway; r.gun.rotation.y = sway;
    }

    // Fire!: a shell from the muzzle, a flash, a burst where it lands.
    function act(t) {
      var muzzle = new THREE.Vector3(1.1, 0.6, 0).applyMatrix4(t.matrixWorld);
      var dir = new THREE.Vector3(1, 0, 0).applyQuaternion(t.quaternion);
      var s = new THREE.Mesh(shellGeo, hiMat);
      s.position.copy(muzzle);
      kit.launch(s, dir.multiplyScalar(9).setY(2.2), {gravity: 6, life: 1.2, onLand: function (p) {
        kit.burst(p.setY(0.1), 16, [C.accent, C.accent2, C.warn], 2.5);
      }});
      kit.burst(muzzle, 10, [C.hi, C.warn], 1.2);
      t.userData.rig.recoil = 1;
      kit.noise({len: 0.18, gain: 0.18});
    }

    // Blow up: gone at once, in squares of light.
    function remove(t) {
      kit.burst(t.position.clone().add(new THREE.Vector3(0, 0.4, 0)), 46, [C.accent, C.accent2, C.hi, C.warn]);
      kit.flash(t.position, 3);
      kit.shake(0.25);
      return null;
    }

    return {
      ground: ground, make: make, idle: idle, act: act, remove: remove, faceEachOther: false,
      sounds: {
        add: function () { kit.tone({f1: 220, f2: 440}); },
        remove: function () { kit.noise({len: 0.5, gain: 0.5}); },
        move: function () { kit.tone({f1: 330, f2: 660}); }
      }
    };
  }
};
if (typeof module !== 'undefined') module.exports = THEME;
