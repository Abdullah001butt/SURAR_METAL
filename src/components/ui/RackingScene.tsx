import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const STEEL = '#9ca3af'
const STEEL_DARK = '#4b5563'
const ACCENT = '#FF5A1F'

/** One racking bay: two vertical uprights + horizontal beams at 3 levels +
 *  a pallet-like box resting on each level. Built entirely from primitive
 *  geometry — no external 3D model file needed. */
function RackingBay({ position }: { position: [number, number, number] }) {
  const uprightGeo: [number, number, number] = [0.08, 3, 0.08]
  const beamGeo: [number, number, number] = [1.6, 0.06, 0.06]
  const levels = [-1.3, -0.2, 0.9]

  return (
    <group position={position}>
      {/* Uprights */}
      <mesh position={[-0.8, 0, 0]}>
        <boxGeometry args={uprightGeo} />
        <meshStandardMaterial color={STEEL_DARK} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0.8, 0, 0]}>
        <boxGeometry args={uprightGeo} />
        <meshStandardMaterial color={STEEL_DARK} metalness={0.7} roughness={0.35} />
      </mesh>

      {levels.map((y, i) => (
        <group key={i}>
          <mesh position={[0, y, 0]}>
            <boxGeometry args={beamGeo} />
            <meshStandardMaterial color={STEEL} metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Pallet/box load — every other level accented in brand orange */}
          <mesh position={[0, y + 0.22, 0]}>
            <boxGeometry args={[1.1, 0.32, 0.7]} />
            <meshStandardMaterial color={i === 1 ? ACCENT : '#e5e7eb'} metalness={0.15} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function RackingRig() {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!group.current) return
    // Slow ambient rotation + a gentle mouse-parallax tilt — never spins fast
    // enough to be distracting, just enough to read as "alive."
    group.current.rotation.y = state.clock.elapsedTime * 0.12
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, state.pointer.y * 0.12, 0.05)
  })

  return (
    <group ref={group} rotation={[0.15, 0.5, 0]}>
      <RackingBay position={[-1.9, 0, 0]} />
      <RackingBay position={[0, 0, 0]} />
      <RackingBay position={[1.9, 0, 0]} />
    </group>
  )
}

/** Procedural 3D warehouse racking rendered in WebGL — no external model or
 *  video asset required. Sits behind/beside the hero copy as an ambient,
 *  slowly-rotating centerpiece. Desktop-first: mounted conditionally by the
 *  caller since a WebGL canvas is wasted weight on small/low-power screens. */
export function RackingScene({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0.4, 6], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 5, 3]} intensity={1.4} />
          <directionalLight position={[-4, -2, -3]} intensity={0.3} color="#FF5A1F" />
          <RackingRig />
        </Suspense>
      </Canvas>
    </div>
  )
}
