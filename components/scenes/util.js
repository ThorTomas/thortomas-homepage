import * as THREE from 'three'

// Deterministic pseudo-random helpers so the models look the same on every load.
export function hash3(x, y, z) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
  return s - Math.floor(s)
}

export function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Push vertices in/out along their radius. The offset depends only on the
// vertex position, so vertices shared by several faces stay welded.
export function jitterGeometry(geo, amount) {
  const p = geo.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const k = 1000
    const d =
      (hash3(
        Math.round(v.x * k) / k,
        Math.round(v.y * k) / k,
        Math.round(v.z * k) / k
      ) -
        0.5) *
      2 *
      amount
    v.multiplyScalar(1 + d)
    p.setXYZ(i, v.x, v.y, v.z)
  }
  p.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

export function disposeObject(root) {
  root.traverse(o => {
    if (o.geometry) o.geometry.dispose()
    if (o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material]
      mats.forEach(m => {
        if (m.map) m.map.dispose()
        m.dispose()
      })
    }
  })
  if (root.parent) root.parent.remove(root)
}

export const clamp01 = x => Math.min(1, Math.max(0, x))
export const easeInOut = x => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)

const UP = new THREE.Vector3(0, 1, 0)
const _dir = new THREE.Vector3()

// A pool of thin cylinders that can be laid along a jagged path (lightning).
export function createBolt(parent, segments, radius, material) {
  const geo = new THREE.CylinderGeometry(radius, radius, 1, 5, 1, true)
  const meshes = []
  for (let i = 0; i < segments; i++) {
    const m = new THREE.Mesh(geo, material)
    m.visible = false
    parent.add(m)
    meshes.push(m)
  }
  const pts = Array.from({ length: segments + 1 }, () => new THREE.Vector3())

  return {
    meshes,
    setVisible(v) {
      meshes.forEach(m => (m.visible = v))
    },
    // Lay the bolt from `from` to `to`, displacing the inner points sideways.
    strike(from, to, spread, rnd) {
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        pts[i].lerpVectors(from, to, t)
        if (i > 0 && i < segments) {
          const fall = Math.sin(t * Math.PI)
          pts[i].x += (rnd() - 0.5) * 2 * spread * fall
          pts[i].y += (rnd() - 0.5) * spread * 0.6 * fall
          pts[i].z += (rnd() - 0.5) * 2 * spread * fall
        }
      }
      for (let i = 0; i < segments; i++) {
        const a = pts[i]
        const b = pts[i + 1]
        const m = meshes[i]
        _dir.subVectors(b, a)
        const len = _dir.length() || 0.0001
        m.position.addVectors(a, b).multiplyScalar(0.5)
        m.scale.set(1, len, 1)
        m.quaternion.setFromUnitVectors(UP, _dir.divideScalar(len))
      }
    }
  }
}
