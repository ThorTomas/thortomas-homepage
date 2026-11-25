import { useState, useEffect, useRef } from 'react'
import { IconButton, VStack, useColorModeValue } from '@chakra-ui/react'
import { GiLaserPrecision, GiStonePile, GiThorHammer } from 'react-icons/gi'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { SceneContainer } from './hero-scene-loader'
import { createLaserRock } from './scenes/laser-rock'
import { createMjolnir } from './scenes/mjolnir'
import { createOpticalBench } from './scenes/optical-bench'
import { useI18n } from '../lib/i18n'

const SCENES = {
  optics: createOpticalBench,
  laser: createLaserRock,
  mjolnir: createMjolnir
}
const STORAGE_KEY = 'heroScene'
const INTRO_FRAMES = 100

function easeOutCirc(x) {
  return Math.sqrt(1 - Math.pow(x - 1, 4))
}

function initialScene() {
  try {
    const q = new URLSearchParams(window.location.search).get('scene')
    if (q && SCENES[q]) return q
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved && SCENES[saved]) return saved
  } catch (e) {
    /* storage unavailable */
  }
  return 'optics'
}

const HeroScene = () => {
  const { t } = useI18n()
  const refContainer = useRef()
  const refStage = useRef(null)
  const [sceneKey, setSceneKey] = useState(initialScene)
  const activeScheme = useColorModeValue('purple', 'orange')

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

    const stage = {
      scene,
      camera,
      controls,
      orbit,
      current: null,
      frame: 0,
      reducedMotion
    }
    refStage.current = stage

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
      if (stage.current) stage.current.dispose()
      stage.current = null
      refStage.current = null
      controls.dispose()
      renderer.domElement.remove()
      renderer.dispose()
    }
  }, [])

  // Swap the model when the visitor picks the other one.
  useEffect(() => {
    const stage = refStage.current
    if (!stage) return
    if (stage.current) stage.current.dispose()
    const next = SCENES[sceneKey](stage.scene)
    stage.current = next
    stage.frame = 0
    stage.controls.target.copy(next.target)
    stage.camera.position.copy(next.target).add(stage.orbit)
    stage.camera.lookAt(next.target)
    stage.controls.update()
    try {
      window.localStorage.setItem(STORAGE_KEY, sceneKey)
    } catch (e) {
      /* storage unavailable */
    }
  }, [sceneKey])

  const buttons = [
    { key: 'optics', label: t.hero.sceneOptics, icon: <GiLaserPrecision /> },
    { key: 'laser', label: t.hero.sceneLaser, icon: <GiStonePile /> },
    { key: 'mjolnir', label: t.hero.sceneHammer, icon: <GiThorHammer /> }
  ]

  return (
    <SceneContainer ref={refContainer}>
      <VStack
        position="absolute"
        right={[0, 2, 4]}
        top={['22%', '26%', '30%']}
        spacing={2}
        zIndex={1}
      >
        {buttons.map(b => (
          <IconButton
            key={b.key}
            aria-label={b.label}
            title={b.label}
            aria-pressed={sceneKey === b.key}
            size="sm"
            fontSize="18px"
            isRound
            variant={sceneKey === b.key ? 'solid' : 'outline'}
            colorScheme={sceneKey === b.key ? activeScheme : 'gray'}
            icon={b.icon}
            onClick={() => setSceneKey(b.key)}
          />
        ))}
      </VStack>
    </SceneContainer>
  )
}

export default HeroScene
