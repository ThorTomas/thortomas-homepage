import * as THREE from 'three'

function chamferedSquare(half, cut) {
  const s = new THREE.Shape()
  s.moveTo(-half + cut, -half)
  s.lineTo(half - cut, -half)
  s.lineTo(half, -half + cut)
  s.lineTo(half, half - cut)
  s.lineTo(half - cut, half)
  s.lineTo(-half + cut, half)
  s.lineTo(-half, half - cut)
  s.lineTo(-half, -half + cut)
  s.closePath()
  return s
}

// Extrude a chamfered square along the X axis, centred on the origin.
function block(half, cut, length, bevel) {
  const geo = new THREE.ExtrudeGeometry(chamferedSquare(half, cut), {
    depth: length,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1
  })
  geo.translate(0, 0, -length / 2)
  geo.rotateY(Math.PI / 2)
  return geo
}

// The runes ᚦ ᚢ ᚱ (Thurisaz, Uruz, Raido) drawn as plain strokes.
function runeTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 216
  const ctx = canvas.getContext('2d')
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 15
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const runes = [
    [[[0, 0], [0, 1]], [[0, 0.28], [0.55, 0.5], [0, 0.72]]],
    [[[0, 1], [0, 0], [0.6, 0.4], [0.6, 1]]],
    [[[0, 1], [0, 0], [0.5, 0.25], [0, 0.5], [0.55, 1]]]
  ]
  const h = 150
  const w = 80
  runes.forEach((strokes, i) => {
    const ox = 92 + i * 140
    const oy = 33
    strokes.forEach(pts => {
      ctx.beginPath()
      pts.forEach(([x, y], j) => {
        const px = ox + x * w
        const py = oy + y * h
        if (j === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      })
      ctx.stroke()
    })
  })
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// An original, Norse-style Mjölnir built from primitives. The head is centred
// on the origin with its long side along X; the handle points up (+Y).
export function buildHammer() {
  const hammer = new THREE.Group()
  const steel = new THREE.MeshStandardMaterial({
    color: 0xa3adb8,
    roughness: 0.45,
    metalness: 0.35,
    flatShading: true
  })
  const darkSteel = new THREE.MeshStandardMaterial({
    color: 0x566170,
    roughness: 0.5,
    metalness: 0.35,
    flatShading: true
  })
  const leather = new THREE.MeshStandardMaterial({
    color: 0x6a4527,
    roughness: 0.9,
    flatShading: true
  })
  const darkLeather = new THREE.MeshStandardMaterial({
    color: 0x3f2815,
    roughness: 0.9,
    flatShading: true
  })

  const head = new THREE.Mesh(block(0.72, 0.2, 2.7, 0.13), steel)
  hammer.add(head)
  ;[-1.12, 1.12].forEach(x => {
    const cap = new THREE.Mesh(block(0.82, 0.24, 0.24, 0.08), darkSteel)
    cap.position.x = x
    hammer.add(cap)
  })
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.44, 0.3, 8), darkSteel)
  collar.position.y = 0.98
  hammer.add(collar)

  const runeMat = new THREE.MeshBasicMaterial({
    map: runeTexture(),
    color: 0x38d9c9,
    transparent: true,
    depthWrite: false
  })
  ;[1, -1].forEach(side => {
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 0.74), runeMat)
    plate.position.z = side * 0.862
    if (side < 0) plate.rotation.y = Math.PI
    hammer.add(plate)
  })

  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.23, 3.0, 8), leather)
  handle.position.y = 2.55
  hammer.add(handle)
  for (let y = 1.5; y < 3.9; y += 0.36) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.05, 5, 10), darkLeather)
    ring.rotation.x = Math.PI / 2
    ring.position.y = y
    hammer.add(ring)
  }
  const pommel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 0.3, 8), darkSteel)
  pommel.position.y = 4.18
  hammer.add(pommel)
  const strap = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 5, 12), darkLeather)
  strap.position.y = 4.6
  hammer.add(strap)

  return { hammer, runeMat, steel }
}
