import * as THREE from 'three'
import { mulberry32, jitterGeometry, disposeObject, createBolt } from './util'
import { buildHammer } from './hammer'

const T_LOOP = 4.4
const T_BOLT = 0.34
const T_ARCS = 1.0

export function createMjolnir(scene) {
  const rnd = mulberry32(21)
  const group = new THREE.Group()
  group.scale.setScalar(0.8)
  scene.add(group)

  // --- rock slab ----------------------------------------------------------
  const stone = new THREE.MeshStandardMaterial({
    color: 0x5b6470,
    roughness: 0.95,
    flatShading: true
  })
  const slabGeo = jitterGeometry(new THREE.IcosahedronGeometry(3.5, 1), 0.1)
  slabGeo.scale(1, 0.26, 1)
  const slab = new THREE.Mesh(slabGeo, stone)
  group.add(slab)
  ;[
    [2.9, 0.35, 1.6, 0.55],
    [-2.6, 0.3, -2.0, 0.45],
    [-3.0, 0.25, 1.4, 0.32]
  ].forEach(([x, y, z, r]) => {
    const g = jitterGeometry(new THREE.IcosahedronGeometry(r, 0), 0.2)
    const m = new THREE.Mesh(g, stone)
    m.position.set(x, y, z)
    group.add(m)
  })

  // --- hammer -------------------------------------------------------------
  const { hammer, runeMat } = buildHammer()
  group.add(hammer)

  const REST_Y = 2.25
  hammer.position.set(0, REST_Y, 0)
  hammer.rotation.z = 0.2
  hammer.scale.setScalar(0.95)

  // --- lightning ----------------------------------------------------------
  const boltMat = new THREE.MeshBasicMaterial({ color: 0x4db5ff })
  const bolt = createBolt(group, 11, 0.06, boltMat)
  const branch = createBolt(group, 5, 0.035, boltMat)
  const arcs = [0, 1, 2, 3].map(() => createBolt(hammer, 5, 0.028, boltMat))
  const flash = new THREE.PointLight(0x9fd4ff, 0, 40)
  flash.position.set(0, 4, 2)
  group.add(flash)

  const from = new THREE.Vector3()
  const to = new THREE.Vector3()
  const p1 = new THREE.Vector3()
  const p2 = new THREE.Vector3()
  let lastCycle = -1
  let lastFlicker = -1
  let lastArc = -1

  const headPoint = v =>
    v.set((rnd() - 0.5) * 2.6, (rnd() < 0.5 ? -1 : 1) * 0.9, (rnd() - 0.5) * 1.7)

  function strikeBolt() {
    hammer.updateWorldMatrix(true, false)
    to.set(0, 4.75, 0).applyMatrix4(hammer.matrixWorld)
    from.set((rnd() - 0.5) * 5, 11.5, (rnd() - 0.5) * 5)
    bolt.strike(from, to, 0.75, rnd)
    p1.lerpVectors(from, to, 0.45)
    p2.set(p1.x + (rnd() - 0.5) * 5, p1.y - 2.5 - rnd() * 1.5, p1.z + (rnd() - 0.5) * 5)
    branch.strike(p1, p2, 0.35, rnd)
  }

  function update(dt, time) {
    const cycle = Math.floor(time / T_LOOP)
    const t = time - cycle * T_LOOP

    if (cycle !== lastCycle) {
      lastCycle = cycle
      lastFlicker = -1
      lastArc = -1
    }

    // main bolt: re-drawn a few times while it is visible
    const boltOn = t < T_BOLT
    const flicker = Math.floor(t / 0.085)
    if (boltOn && flicker !== lastFlicker) {
      lastFlicker = flicker
      strikeBolt()
    }
    const blink = boltOn && flicker !== 2
    bolt.setVisible(blink)
    branch.setVisible(blink && flicker < 2)

    // small arcs crawling over the head afterwards
    const arcsOn = t < T_ARCS
    const arcStep = Math.floor(t / 0.07)
    if (arcsOn && arcStep !== lastArc) {
      lastArc = arcStep
      arcs.forEach(a => a.strike(headPoint(p1), headPoint(p2), 0.3, rnd))
    }
    arcs.forEach((a, i) => a.setVisible(arcsOn && (arcStep + i) % 3 !== 0))

    // energy decays after the strike
    const energy = Math.exp(-t * 2.2)
    flash.intensity = (boltOn ? 32 : 10) * energy
    runeMat.opacity = 0.55 + 0.45 * energy + 0.12 * Math.sin(time * 2)
    runeMat.color.setRGB(0.22 + 0.78 * energy, 0.85 + 0.15 * energy, 0.79 + 0.21 * energy)

    // hover, with a jolt when the bolt lands
    const jolt = Math.exp(-t * 5) * Math.cos(t * 22)
    hammer.position.y = REST_Y + 0.16 * Math.sin(time * 1.3) - 0.22 * jolt
    hammer.rotation.z = 0.2 + 0.03 * Math.sin(time * 0.9) + 0.05 * jolt
    hammer.rotation.x = 0.03 * Math.sin(time * 1.1)
  }

  return {
    target: new THREE.Vector3(0, 1.9, 0),
    stillTime: 0.2,
    update,
    dispose: () => disposeObject(group)
  }
}
