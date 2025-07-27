import * as THREE from 'three'
import { useLayoutEffect, useMemo, useRef, useState, useEffect } from 'react'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { Image, ScrollControls, useScroll, Billboard, Text } from '@react-three/drei'
import { suspend } from 'suspend-react'
import { generate } from 'random-words'
import { easing, geometry } from 'maath'
import { fetchBlobImages } from './utils/blobImages'

extend(geometry)
const inter = import('@pmndrs/assets/fonts/inter_regular.woff')

export const App = () => (
  <Canvas dpr={[1, 1.5]}>
    <ScrollControls pages={4} infinite>
      <Scene position={[0, 1.5, 0]} />
    </ScrollControls>
  </Canvas>
)

function Scene({ children, ...props }) {
  const ref = useRef()
  const scroll = useScroll()
  const [hovered, hover] = useState(null)
  useFrame((state, delta) => {
    ref.current.rotation.y = -scroll.offset * (Math.PI * 2) // Rotate contents
    state.events.update() // Raycasts every frame rather than on pointer-move
    easing.damp3(state.camera.position, [-state.pointer.x * 2, state.pointer.y * 2 + 4.5, 5 + state.scroll.offset * 25], 0.3, delta)
    state.camera.lookAt(0, 0, 0)
  })
  return (
    <group ref={ref} {...props}>
      <Cards category="spring" from={0} len={Math.PI / 4} onPointerOver={hover} onPointerOut={hover} />
      <Cards category="summer" from={Math.PI / 4} len={Math.PI / 2} position={[0, 0.4, 0]} onPointerOver={hover} onPointerOut={hover} />
      <Cards category="autumn" from={Math.PI / 4 + Math.PI / 2} len={Math.PI / 2} onPointerOver={hover} onPointerOut={hover} />
      <Cards category="winter" from={Math.PI * 1.25} len={Math.PI * 2 - Math.PI * 1.25} position={[0, -0.4, 0]} onPointerOver={hover} onPointerOut={hover} />
      <ActiveCard hovered={hovered} />
    </group>
  )
}

function Cards({ category, data, from = 0, len = Math.PI * 2, radius = 5.25, onPointerOver, onPointerOut, ...props }) {
  const [hovered, hover] = useState(null)
  const [blobImages, setBlobImages] = useState([])
  const amount = Math.round(len * 22)
  const textPosition = from + (amount / 2 / amount) * len

  useEffect(() => {
    console.log('🔄 Načítám blob obrázky...')
    fetchBlobImages()
      .then(images => {
        console.log('✅ Blob obrázky načteny:', images.length, 'obrázků')
        console.log('📝 První 3 URL:', images.slice(0, 3))
        setBlobImages(images)
      })
      .catch(error => {
        console.error('❌ Chyba při načítání blob obrázků:', error)
      })
  }, [])

  const getImageUrl = (index) => {
    console.log(`🖼️ getImageUrl(${index}): blobImages.length=${blobImages.length}`)
    if (blobImages.length > 0) {
      const url = blobImages[index % blobImages.length]
      console.log(`✅ Používám blob URL pro index ${index}:`, url)
      return url
    }
    // Fallback: použít všech 362 lokálních obrázků místo pouze prvních 10
    const fallbackUrl = `/img${(index % 362) + 1}.jpg`
    console.log(`⚠️ Používám fallback URL pro index ${index}:`, fallbackUrl)
    return fallbackUrl
  }

  return (
    <group {...props}>
      <Billboard position={[Math.sin(textPosition) * radius * 1.4, 0.5, Math.cos(textPosition) * radius * 1.4]}>
        <Text font={suspend(inter).default} fontSize={0.25} anchorX="center" color="black">
          {category}
        </Text>
      </Billboard>
      {Array.from({ length: amount - 3 /* minus 3 images at the end, creates a gap */ }, (_, i) => {
        const angle = from + (i / amount) * len
        return (
          <Card
            key={angle}
            onPointerOver={(e) => (e.stopPropagation(), hover(i), onPointerOver(i))}
            onPointerOut={() => (hover(null), onPointerOut(null))}
            position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
            rotation={[0, Math.PI / 2 + angle, 0]}
            active={hovered !== null}
            hovered={hovered === i}
            url={getImageUrl(i)}
          />
        )
      })}
    </group>
  )
}

function Card({ url, active, hovered, ...props }) {
  const ref = useRef()
  useFrame((state, delta) => {
    const f = hovered ? 1.4 : active ? 1.25 : 1
    // Make image square
    easing.damp3(ref.current.scale, [1.4 * f, 1.4 * f, 1], 0.15, delta)
  })
  return (
    <group {...props}>
      <Image ref={ref} transparent radius={0.075} url={url} scale={[1.618, 1, 1]} side={THREE.DoubleSide} />
    </group>
  )
}

function ActiveCard({ hovered, ...props }) {
  const ref = useRef()
  const [blobImages, setBlobImages] = useState([])
  const name = useMemo(() => generate({ exactly: 2 }).join(' '), [hovered])
  
  useEffect(() => {
    console.log('🔄 ActiveCard: Načítám blob obrázky...')
    fetchBlobImages()
      .then(images => {
        console.log('✅ ActiveCard: Blob obrázky načteny:', images.length, 'obrázků')
        setBlobImages(images)
      })
      .catch(error => {
        console.error('❌ ActiveCard: Chyba při načítání blob obrázků:', error)
      })
  }, [])

  const getImageUrl = (index) => {
    console.log(`🖼️ ActiveCard getImageUrl(${index}): blobImages.length=${blobImages.length}`)
    if (blobImages.length > 0 && index !== null) {
      const url = blobImages[index % blobImages.length]
      console.log(`✅ ActiveCard: Používám blob URL pro index ${index}:`, url)
      return url
    }
    // Fallback: použít všech 362 lokálních obrázků místo pouze prvních 10
    const fallbackUrl = `/img${((index || 0) % 362) + 1}.jpg`
    console.log(`⚠️ ActiveCard: Používám fallback URL pro index ${index}:`, fallbackUrl)
    return fallbackUrl
  }

  useLayoutEffect(() => void (ref.current?.material && (ref.current.material.zoom = 0.8)), [hovered])
  useFrame((state, delta) => {
    if (ref.current?.material) {
      easing.damp(ref.current.material, 'zoom', 1, 0.5, delta)
      easing.damp(ref.current.material, 'opacity', hovered !== null, 0.3, delta)
    }
  })
  return (
    <Billboard {...props}>
      <Text font={suspend(inter).default} fontSize={0.5} position={[2.15, 3.85, 0]} anchorX="left" color="black">
        {hovered !== null && `${name}\n${hovered}`}
      </Text>
      <Image ref={ref} transparent radius={0.3} position={[0, 1.5, 0]} scale={[3.5, 1.618 * 3.5, 0.2, 1]} url={getImageUrl(hovered)} />
    </Billboard>
  )
}
