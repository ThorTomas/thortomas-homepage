import * as THREE from 'three'
import { mulberry32, disposeObject, createBolt, clamp01 } from './util'
import { buildHammer } from './hammer'

// Timeline of one loop, in seconds
const T_FIRE = 0.7 // laser switches on, the beam front starts travelling
const T_ARRIVE = 1.9 // beam front reaches the hammer
const T_FULL = 5.4 // hammer fully charged, laser off, discharge
const T_BOLT = 0.4 // length of the discharge
const T_LOOP = 8.2

const BEAM_Y = 0.75
const UP = new THREE.Vector3(0, 1, 0)
const _dir = new THREE.Vector3()
const _end = new THREE.Vector3()

// Lay a unit cylinder between two points, showing only the first `k` of it.
function placeSegment(mesh, a, b, k, radius) {
  if (k <= 0) {
    mesh.visible = false
    return
  }
  mesh.visible = true
  _dir.subVectors(b, a)
  const len = _dir.length()
  _dir.divideScalar(len)
  _end.copy(a).addScaledVector(_dir, len * k)
  mesh.position.addVectors(a, _end).multiplyScalar(0.5)
  mesh.scale.set(radius, len * k, radius)
  mesh.quaternion.setFromUnitVectors(UP, _dir)
}

export function createOpticalBench(scene) {
  const rnd = mulberry32(5)
  const group = new THREE.Group()
  group.scale.setScalar(1.15)
  scene.add(group)

  const mat = (color, extra = {}) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.6,
      metalness: 0.15,
      flatShading: true,
      ...extra
    })
  const black = mat(0x2a2f38)
  const metal = mat(0xc9d0d9, { metalness: 0.4, roughness: 0.4 })
  const mirrorMat = mat(0xf3e2b0, { metalness: 0.7, roughness: 0.2 })
  const glassMat = mat(0x9fe3e0, {
    transparent: true,
    opacity: 0.55,
    roughness: 0.1,
    depthWrite: false
  })

  // --- helpers for the optics --------------------------------------------
  function post(x, z, height) {
    const g = new THREE.Group()
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.1, 8), metal)
    foot.position.y = 0.05
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, height, 6), metal)
    rod.position.y = height / 2
    g.add(foot, rod)
    g.position.set(x, 0, z)
    group.add(g)
    return g
  }

  // A kinematic mount holding a round optic whose face looks along local +Z.
  function opticMount(x, z, rotY, opticMaterial) {
    post(x, z, BEAM_Y - 0.36)
    const g = new THREE.Group()
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.78, 0.14), black)
    plate.position.z = -0.1
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.78, 0.08), metal)
    back.position.z = -0.26
    const optic = new THREE.Mesh(
      new THREE.CylinderGeometry(0.31, 0.31, 0.06, 14),
      opticMaterial
    )
    optic.rotation.x = Math.PI / 2
    const knobGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.16, 6)
    ;[
      [0.3, 0.3],
      [-0.3, -0.3]
    ].forEach(([kx, ky]) => {
      const knob = new THREE.Mesh(knobGeo, metal)
      knob.rotation.x = Math.PI / 2
      knob.position.set(kx, ky, -0.36)
      g.add(knob)
    })
    g.add(plate, back, optic)
    g.position.set(x, BEAM_Y, z)
    g.rotation.y = rotY
    group.add(g)
    return g
  }

  // --- beam path ----------------------------------------------------------
  const P_COLL = new THREE.Vector3(-3.55, BEAM_Y, -1.25)
  const P_SAMPLER = new THREE.Vector3(-1.9, BEAM_Y, -1.25)
  const P_M1 = new THREE.Vector3(0.5, BEAM_Y, -1.25)
  const P_M2 = new THREE.Vector3(0.5, BEAM_Y, 1.25)
  const P_HAMMER = new THREE.Vector3(2.62, BEAM_Y, 1.25)
  const P_DIODE = new THREE.Vector3(-1.9, BEAM_Y, 1.0)
  const path = [P_COLL, P_SAMPLER, P_M1, P_M2, P_HAMMER]
  const lengths = path.slice(1).map((p, i) => p.distanceTo(path[i]))
  const total = lengths.reduce((a, b) => a + b, 0)

  // --- collimator and fibre ----------------------------------------------
  post(-3.9, -1.25, BEAM_Y - 0.2)
  const collimator = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.7, 8), black)
  collimator.rotation.z = Math.PI / 2
  collimator.position.set(-3.9, BEAM_Y, -1.25)
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.14, 8), metal)
  ring.rotation.z = Math.PI / 2
  ring.position.set(-3.68, BEAM_Y, -1.25)
  const lensMat = new THREE.MeshBasicMaterial({ color: 0x5a1010 })
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 8), lensMat)
  lens.rotation.z = Math.PI / 2
  lens.position.set(-3.55, BEAM_Y, -1.25)
  const fibre = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-4.25, BEAM_Y, -1.25),
        new THREE.Vector3(-4.75, BEAM_Y - 0.05, -1.2),
        new THREE.Vector3(-5.1, 0.25, -0.9),
        new THREE.Vector3(-5.15, -0.35, -0.2),
        new THREE.Vector3(-5.0, -1.1, 0.5)
      ]),
      24,
      0.045,
      5
    ),
    mat(0xe9b949)
  )
  group.add(collimator, ring, lens, fibre)

  // --- beam sampler, two mirrors, photodiode -----------------------------
  opticMount(P_SAMPLER.x, P_SAMPLER.z, -Math.PI / 4, glassMat)
  opticMount(P_M1.x, P_M1.z, -Math.PI / 4, mirrorMat)
  opticMount(P_M2.x, P_M2.z, (3 * Math.PI) / 4, mirrorMat)

  post(P_DIODE.x, P_DIODE.z + 0.2, BEAM_Y - 0.3)
  const diode = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.34), black)
  diode.position.set(P_DIODE.x, BEAM_Y, P_DIODE.z + 0.2)
  const ledMat = new THREE.MeshBasicMaterial({ color: 0x1d3b2a })
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.04), ledMat)
  led.position.set(P_DIODE.x + 0.15, BEAM_Y + 0.42, P_DIODE.z + 0.2)
  const ledStem = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), black)
  ledStem.position.set(P_DIODE.x + 0.15, BEAM_Y + 0.34, P_DIODE.z + 0.2)
  group.add(diode, led, ledStem)

  // --- small Mjölnir, handle down, floating at the end of the beam path ----
  const STAGE_X = 3.25
  const STAGE_Z = 1.25
  const { hammer, runeMat, steel } = buildHammer()
  const H_SCALE = 0.42
  const REST_Y = BEAM_Y
  const TILT_X = 0.26
  const TILT_Z = 0.14
  hammer.scale.setScalar(H_SCALE)
  hammer.position.set(STAGE_X, REST_Y, STAGE_Z)
  // flipped upside down (handle towards the ground) and leaning a little
  hammer.rotation.set(TILT_X, 0, Math.PI + TILT_Z)
  // keep the runes upright on the flipped head
  hammer.children.forEach(c => {
    if (c.material === runeMat) c.rotation.z = Math.PI
  })
  group.add(hammer)
  steel.emissive = new THREE.Color(0x000000)

  // --- beams --------------------------------------------------------------
  const beamGeo = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true)
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xff2a2a })
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xff2a2a,
    transparent: true,
    opacity: 0.25,
    depthWrite: false
  })
  const diagMat = new THREE.MeshBasicMaterial({
    color: 0xff8f8f,
    transparent: true,
    opacity: 0.8
  })
  const segs = lengths.map(() => {
    const core = new THREE.Mesh(beamGeo, beamMat)
    const halo = new THREE.Mesh(beamGeo, haloMat)
    group.add(core, halo)
    return { core, halo }
  })
  const diag = new THREE.Mesh(beamGeo, diagMat)
  group.add(diag)

  const spotGeo = new THREE.IcosahedronGeometry(0.1, 1)
  const spots = [P_SAMPLER, P_M1, P_M2].map(p => {
    const s = new THREE.Mesh(spotGeo, beamMat)
    s.position.copy(p)
    group.add(s)
    return s
  })
  const impact = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.16, 1),
    new THREE.MeshBasicMaterial({ color: 0xffd08a })
  )
  impact.position.copy(P_HAMMER)
  group.add(impact)

  // --- electricity --------------------------------------------------------
  const boltMat = new THREE.MeshBasicMaterial({ color: 0x4db5ff })
  const arcs = [0, 1, 2, 3].map(() => createBolt(hammer, 5, 0.05, boltMat))
  const bolt = createBolt(group, 10, 0.05, boltMat)
  const flash = new THREE.PointLight(0x9fd4ff, 0, 30)
  flash.position.set(STAGE_X, 2.2, STAGE_Z + 1)
  group.add(flash)

  const p1 = new THREE.Vector3()
  const p2 = new THREE.Vector3()
  const headPoint = v =>
    v.set((rnd() - 0.5) * 2.8, (rnd() < 0.5 ? -1 : 1) * 0.92, (rnd() - 0.5) * 1.8)
  let lastArc = -1
  let lastFlicker = -1

  function update(dt, time) {
    const t = time % T_LOOP
    const laserOn = t >= T_FIRE && t < T_FULL
    // lock-in style modulation of the excitation beam
    const mod = 0.75 + 0.25 * Math.sign(Math.sin(time * 2 * Math.PI * 5))
    const radius = 0.045 * mod

    // how far along the path the beam front has travelled
    const reach = laserOn ? clamp01((t - T_FIRE) / (T_ARRIVE - T_FIRE)) * total : 0
    let acc = 0
    segs.forEach((s, i) => {
      const k = clamp01((reach - acc) / lengths[i])
      placeSegment(s.core, path[i], path[i + 1], k, radius)
      placeSegment(s.halo, path[i], path[i + 1], k, radius * 2.8)
      acc += lengths[i]
    })
    spots.forEach((s, i) => {
      const passed = lengths.slice(0, i + 1).reduce((a, b) => a + b, 0)
      s.visible = laserOn && reach >= passed
      s.scale.setScalar(mod)
    })
    const diagK = laserOn
      ? clamp01((reach - lengths[0]) / P_SAMPLER.distanceTo(P_DIODE))
      : 0
    placeSegment(diag, P_SAMPLER, P_DIODE, diagK, radius * 0.55)
    ledMat.color.setHex(diagK >= 1 && mod > 0.8 ? 0x4dff88 : 0x1d3b2a)
    lensMat.color.setHex(laserOn ? 0xff2a2a : t < T_FIRE ? 0xa01c1c : 0x5a1010)

    // charge builds while the beam is on the hammer, then drains after the bolt
    const hitting = laserOn && reach >= total
    let charge = 0
    if (t >= T_ARRIVE && t < T_FULL) charge = (t - T_ARRIVE) / (T_FULL - T_ARRIVE)
    else if (t >= T_FULL) charge = Math.exp(-(t - T_FULL) * 2.4)
    impact.visible = hitting
    impact.scale.setScalar((0.7 + charge * 0.9) * mod)

    runeMat.opacity = 0.35 + 0.65 * charge
    runeMat.color.setRGB(0.22 + 0.78 * charge, 0.85 + 0.15 * charge, 0.79 + 0.21 * charge)
    steel.emissive.setRGB(0.05 * charge, 0.22 * charge, 0.5 * charge)

    // arcs crawl over the head, more of them as the charge grows
    const arcsOn = charge > 0.15
    const arcStep = Math.floor(time / 0.07)
    if (arcsOn && arcStep !== lastArc) {
      lastArc = arcStep
      arcs.forEach(a => a.strike(headPoint(p1), headPoint(p2), 0.35, rnd))
    }
    arcs.forEach((a, i) =>
      a.setVisible(arcsOn && i < Math.ceil(charge * 4) && (arcStep + i) % 3 !== 0)
    )

    // discharge: a bolt leaves the hammer upwards
    const sinceFull = t - T_FULL
    const boltOn = sinceFull >= 0 && sinceFull < T_BOLT
    const flicker = Math.floor(sinceFull / 0.08)
    if (boltOn && flicker !== lastFlicker) {
      lastFlicker = flicker
      hammer.updateWorldMatrix(true, false)
      p1.set(0, -0.9, 0).applyMatrix4(hammer.matrixWorld)
      group.worldToLocal(p1)
      p2.set(p1.x + (rnd() - 0.5) * 3, 9.5, p1.z + (rnd() - 0.5) * 3)
      bolt.strike(p1, p2, 0.6, rnd)
    }
    bolt.setVisible(boltOn && flicker !== 2)
    flash.intensity = boltOn ? 26 : 9 * charge

    // the charged hammer rises a little and trembles
    const lift = charge * charge
    hammer.position.y = REST_Y + 0.06 * Math.sin(time * 1.4) + 0.12 * lift
    hammer.position.x = STAGE_X + (rnd() - 0.5) * 0.03 * lift
    hammer.rotation.z = Math.PI + TILT_Z + 0.06 * lift * Math.sin(time * 2.2)
    hammer.rotation.x = TILT_X + 0.03 * Math.sin(time * 1.1)
  }

  return {
    target: new THREE.Vector3(0, -0.1, 0),
    stillTime: 4.6,
    update,
    dispose: () => disposeObject(group)
  }
}
