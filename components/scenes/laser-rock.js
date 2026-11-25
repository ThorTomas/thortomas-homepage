import * as THREE from 'three'
import {
  hash3,
  mulberry32,
  jitterGeometry,
  disposeObject,
  clamp01,
  easeInOut
} from './util'

// Timeline of one loop, in seconds
const T_BEAM_ON = 0.9
const T_SHATTER = 3.9
const T_BEAM_OFF = 4.25
const T_REBUILD = 6.8
const T_REBUILT = 8.8
const T_LOOP = 9.6

const ROCK_CENTER = new THREE.Vector3(1.0, 2.35, 0)
const FLOOR_Y = 0.16
const BASE_RADIUS = 4.3

export function createLaserRock(scene) {
  const rnd = mulberry32(7)
  const group = new THREE.Group()
  group.scale.setScalar(0.9)
  scene.add(group)

  // --- platform ---------------------------------------------------------
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(4.4, 4.8, 0.6, 10),
    new THREE.MeshStandardMaterial({
      color: 0x4b5563,
      roughness: 0.9,
      flatShading: true
    })
  )
  base.position.y = -0.3
  group.add(base)

  // --- rock made of 80 shards --------------------------------------------
  const rockGeo = jitterGeometry(new THREE.IcosahedronGeometry(1.9, 1), 0.15)
  rockGeo.scale(1, 1.12, 0.95)
  const rp = rockGeo.attributes.position
  const fragments = []
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const colA = new THREE.Color(0x8a8f98)
  const colB = new THREE.Color(0x5f6672)

  for (let i = 0; i < rp.count; i += 3) {
    a.fromBufferAttribute(rp, i)
    b.fromBufferAttribute(rp, i + 1)
    c.fromBufferAttribute(rp, i + 2)
    const g = new THREE.Vector3().add(a).add(b).add(c).multiplyScalar(0.25)
    const A = a.clone().sub(g)
    const B = b.clone().sub(g)
    const C = c.clone().sub(g)
    const O = g.clone().negate()
    const verts = [A, B, C, O, B, A, O, C, B, O, A, C].flatMap(v => [v.x, v.y, v.z])
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    geo.computeVertexNormals()

    const mat = new THREE.MeshStandardMaterial({
      color: colA.clone().lerp(colB, hash3(g.x, g.y, g.z)),
      roughness: 0.95,
      flatShading: true
    })
    const mesh = new THREE.Mesh(geo, mat)
    const home = g.clone().add(ROCK_CENTER)
    mesh.position.copy(home)
    group.add(mesh)
    fragments.push({
      mesh,
      home,
      out: g.clone().normalize(),
      vel: new THREE.Vector3(),
      axis: new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(),
      spin: 0,
      fromPos: new THREE.Vector3(),
      fromQuat: new THREE.Quaternion(),
      fromScale: 1
    })
  }
  rockGeo.dispose()

  // --- laser emitter ------------------------------------------------------
  const emitter = new THREE.Group()
  emitter.position.set(-3.45, 0, 0)
  group.add(emitter)
  const dark = new THREE.MeshStandardMaterial({
    color: 0x2d3440,
    roughness: 0.6,
    metalness: 0.2,
    flatShading: true
  })
  const accent = new THREE.MeshStandardMaterial({
    color: 0x88ccca,
    emissive: 0x2f7f7c,
    roughness: 0.4,
    flatShading: true
  })
  const lensMat = new THREE.MeshBasicMaterial({ color: 0x5a1626 })

  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 0.16, 8), dark)
  foot.position.y = 0.08
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.18, 1.9, 6), dark)
  post.position.y = 1.0
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 0.8), dark)
  body.position.y = ROCK_CENTER.y
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.84, 0.84), accent)
  stripe.position.set(-0.35, ROCK_CENTER.y, 0)
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.5, 8), dark)
  nozzle.rotation.z = -Math.PI / 2
  nozzle.position.set(0.95, ROCK_CENTER.y, 0)
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 8), lensMat)
  lens.rotation.z = -Math.PI / 2
  lens.position.set(1.21, ROCK_CENTER.y, 0)
  emitter.add(foot, post, body, stripe, nozzle, lens)

  // --- beam, impact glow, sparks -----------------------------------------
  const beamStartX = emitter.position.x + 1.23
  const hit = new THREE.Vector3(ROCK_CENTER.x - 1.72, ROCK_CENTER.y, 0)
  const beamGeo = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true)
  beamGeo.rotateZ(Math.PI / 2)
  const beamCore = new THREE.Mesh(
    beamGeo,
    new THREE.MeshBasicMaterial({ color: 0xff3d6e })
  )
  const beamGlow = new THREE.Mesh(
    beamGeo,
    new THREE.MeshBasicMaterial({
      color: 0xff3d6e,
      transparent: true,
      opacity: 0.28,
      depthWrite: false
    })
  )
  group.add(beamCore, beamGlow)

  const glow = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.3, 1),
    new THREE.MeshBasicMaterial({ color: 0xffc56b })
  )
  glow.position.copy(hit)
  group.add(glow)

  const SPARKS = 110
  const sparkPos = new Float32Array(SPARKS * 3).fill(-999)
  const sparkVel = new Float32Array(SPARKS * 3)
  const sparkLife = new Float32Array(SPARKS)
  const sparkGeo = new THREE.BufferGeometry()
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3))
  const sparks = new THREE.Points(
    sparkGeo,
    new THREE.PointsMaterial({
      color: 0xff9f43,
      size: 4,
      sizeAttenuation: false
    })
  )
  sparks.frustumCulled = false
  group.add(sparks)
  let sparkCursor = 0

  function emitSpark(speed) {
    const i = sparkCursor
    sparkCursor = (sparkCursor + 1) % SPARKS
    sparkPos[i * 3] = hit.x
    sparkPos[i * 3 + 1] = hit.y
    sparkPos[i * 3 + 2] = hit.z
    sparkVel[i * 3] = -(0.4 + rnd() * 1.0) * speed
    sparkVel[i * 3 + 1] = (rnd() - 0.25) * 1.4 * speed
    sparkVel[i * 3 + 2] = (rnd() - 0.5) * 1.6 * speed
    sparkLife[i] = 0.5 + rnd() * 0.5
  }

  function setBeam(on, endX, pulse) {
    beamCore.visible = beamGlow.visible = on
    if (!on) return
    const len = endX - beamStartX
    const mid = beamStartX + len / 2
    beamCore.position.set(mid, hit.y, 0)
    beamGlow.position.set(mid, hit.y, 0)
    beamCore.scale.set(len, 0.05 * pulse, 0.05 * pulse)
    beamGlow.scale.set(len, 0.15 * pulse, 0.15 * pulse)
  }

  const identity = new THREE.Quaternion()
  const dq = new THREE.Quaternion()
  let phase = 'whole'
  let heat = 0

  function setPhase(next) {
    if (next === phase) return
    phase = next
    if (next === 'shatter') {
      fragments.forEach(f => {
        f.vel
          .copy(f.out)
          .multiplyScalar(2.2 + rnd() * 3.2)
          .add(new THREE.Vector3(1.4 + rnd(), 1.4 + rnd() * 2.4, 0))
        f.spin = 3 + rnd() * 8
      })
      for (let i = 0; i < 50; i++) emitSpark(5)
    }
    if (next === 'rebuild') {
      fragments.forEach(f => {
        f.fromPos.copy(f.mesh.position)
        f.fromQuat.copy(f.mesh.quaternion)
        f.fromScale = f.mesh.scale.x
      })
    }
    if (next === 'whole') {
      fragments.forEach(f => {
        f.mesh.position.copy(f.home)
        f.mesh.quaternion.identity()
        f.mesh.scale.setScalar(1)
      })
    }
  }

  function update(dt, time) {
    const t = time % T_LOOP
    setPhase(
      t < T_SHATTER ? 'whole' : t < T_REBUILD ? 'shatter' : t < T_REBUILT ? 'rebuild' : 'whole'
    )

    // beam + heat
    const beamOn = t >= T_BEAM_ON && t < T_BEAM_OFF
    const pulse = 1 + 0.25 * Math.sin(time * 60)
    setBeam(beamOn, t < T_SHATTER ? hit.x : 5.2, pulse)
    lensMat.color.setHex(beamOn ? 0xff3d6e : t < T_BEAM_ON ? 0xa62646 : 0x5a1626)

    if (t >= T_BEAM_ON && t < T_SHATTER) {
      heat = clamp01((t - T_BEAM_ON) / (T_SHATTER - T_BEAM_ON))
      if (dt > 0) {
        emitSpark(2 + heat * 3)
        if (heat > 0.5) emitSpark(2 + heat * 3)
      }
    } else if (t >= T_SHATTER) {
      heat = Math.max(0, heat - dt * 0.7)
    } else {
      heat = 0
    }

    glow.visible = beamOn && t < T_SHATTER
    glow.scale.setScalar((0.5 + heat * 1.1) * pulse)

    // shards
    const shake = phase === 'whole' ? heat * heat * 0.035 : 0
    fragments.forEach(f => {
      const m = f.mesh
      if (phase === 'whole') {
        m.position.set(
          f.home.x + (rnd() - 0.5) * shake,
          f.home.y + (rnd() - 0.5) * shake,
          f.home.z + (rnd() - 0.5) * shake
        )
      } else if (phase === 'shatter') {
        f.vel.y -= 14 * dt
        m.position.addScaledVector(f.vel, dt)
        dq.setFromAxisAngle(f.axis, f.spin * dt)
        m.quaternion.premultiply(dq)
        const onBase = Math.hypot(m.position.x, m.position.z) < BASE_RADIUS
        if (onBase && m.position.y < FLOOR_Y && f.vel.y < 0) {
          m.position.y = FLOOR_Y
          f.vel.y *= -0.28
          f.vel.x *= 0.55
          f.vel.z *= 0.55
          f.spin *= 0.5
          if (Math.abs(f.vel.y) < 0.6) {
            f.vel.set(0, 0, 0)
            f.spin = 0
          }
        }
        // shards that fly off the platform shrink away as they fall
        if (m.position.y < -0.8) {
          m.scale.setScalar(clamp01(1 + (m.position.y + 0.8) / 3))
        }
      } else if (phase === 'rebuild') {
        const k = easeInOut(clamp01((t - T_REBUILD) / (T_REBUILT - T_REBUILD)))
        m.position.lerpVectors(f.fromPos, f.home, k)
        m.quaternion.slerpQuaternions(f.fromQuat, identity, k)
        m.scale.setScalar(f.fromScale + (1 - f.fromScale) * k)
      }
      const d = f.home.distanceTo(hit)
      const h = clamp01(heat * 1.5 - d * 0.5)
      m.material.emissive.setRGB(h, h * 0.32, h * 0.04)
    })

    // sparks
    for (let i = 0; i < SPARKS; i++) {
      if (sparkLife[i] <= 0) continue
      sparkLife[i] -= dt
      if (sparkLife[i] <= 0) {
        sparkPos[i * 3 + 1] = -999
        continue
      }
      sparkVel[i * 3 + 1] -= 9 * dt
      sparkPos[i * 3] += sparkVel[i * 3] * dt
      sparkPos[i * 3 + 1] += sparkVel[i * 3 + 1] * dt
      sparkPos[i * 3 + 2] += sparkVel[i * 3 + 2] * dt
    }
    sparkGeo.attributes.position.needsUpdate = true
  }

  return {
    target: new THREE.Vector3(-0.3, 0.5, 0),
    stillTime: 2.9,
    update,
    dispose: () => disposeObject(group)
  }
}
