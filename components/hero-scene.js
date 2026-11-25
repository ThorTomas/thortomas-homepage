import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { SceneContainer } from './hero-scene-loader'
import { createOpticalBench } from './scenes/optical-bench'

const INTRO_FRAMES = 100

function easeOutCirc(x) {
  return Math.sqrt(1 - Math.pow(x - 1, 4))
}

const HeroScene = () => {
  const refContainer = useRef()

  // Renderer, camera and render loop live for the lifetime of the component.
  useEffect(() => {
    const container = refContainer.current
    if (!container) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.add(new THREE.AmbientLight(0xffffff, 1.5))
    const sun = new THREE.DirectionalLight(0xffffff, 2.2)
    sun.position.set(6, 12, 8)
    scene.add(sun)
    const fill = new THREE.DirectionalLight(0x9fb4ff, 0.7)
    fill.position.set(-8, 4, -6)
    scene.add(fill)

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 50000)
    const orbit = new THREE.Vector3(
      20 * Math.sin(0.2 * Math.PI),
      8.8,
      20 * Math.cos(0.2 * Math.PI)
    )

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.autoRotate = !reducedMotion
    controls.autoRotateSpeed = 1.6
    controls.enablePan = false
    controls.enableZoom = false

    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      renderer.setSize(w, h)
      // 640px -> 8 units, 280px -> 6.2 units
      const s = h * 0.005 + 4.8
      camera.left = -s
      camera.right = s
      camera.top = s
      camera.bottom = -s
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize, false)

    const current = createOpticalBench(scene)
    controls.target.copy(current.target)
    camera.position.copy(current.target).add(orbit)
    camera.lookAt(current.target)
    controls.update()
    const stage = { current, frame: 0, reducedMotion }

    const clock = new THREE.Clock()
    let time = 0
    let req = null
    const animate = () => {
      req = requestAnimationFrame(animate)
      const dt = Math.min(clock.getDelta(), 0.05)
      const { current } = stage
      if (current) {
        const target = current.target
        if (stage.reducedMotion) {
          current.update(0, current.stillTime)
        } else {
          time += dt
          current.update(dt, time)
        }

        if (stage.frame <= INTRO_FRAMES && !stage.reducedMotion) {
          // spin in around the model, like the original template
          stage.frame++
          const rot = -easeOutCirc(stage.frame / 120) * Math.PI * 20
          camera.position.set(
            target.x + orbit.x * Math.cos(rot) + orbit.z * Math.sin(rot),
            target.y + orbit.y,
            target.z + orbit.z * Math.cos(rot) - orbit.x * Math.sin(rot)
          )
          camera.lookAt(target)
        } else {
          controls.update()
        }
      }
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(req)
      window.removeEventListener('resize', resize, false)
      current.dispose()
      controls.dispose()
      renderer.domElement.remove()
      renderer.dispose()
    }
  }, [])

  return (
    <SceneContainer ref={refContainer} />
  )
}

export default HeroScene
