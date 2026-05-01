import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Box, Torus } from "@react-three/drei";
import * as THREE from "three";

function FloatingBook({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1 + rotation[1];
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={meshRef} position={position} rotation={rotation}>
        {/* Book cover */}
        <Box args={[0.8, 1, 0.1]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#1e40af" roughness={0.3} metalness={0.2} />
        </Box>
        {/* Book pages */}
        <Box args={[0.7, 0.9, 0.08]} position={[0, 0, 0.02]}>
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </Box>
      </group>
    </Float>
  );
}

function GraduationCap({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={1.5}>
      <group ref={meshRef} position={position}>
        {/* Cap base */}
        <Box args={[1.2, 0.08, 1.2]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.3} />
        </Box>
        {/* Cap dome */}
        <Sphere args={[0.4, 16, 16]} position={[0, -0.15, 0]} scale={[1, 0.5, 1]}>
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.3} />
        </Sphere>
        {/* Tassel button */}
        <Sphere args={[0.08, 8, 8]} position={[0, 0.08, 0]}>
          <meshStandardMaterial color="#eab308" roughness={0.3} metalness={0.5} />
        </Sphere>
      </group>
    </Float>
  );
}

function DataNode({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={3} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
      </mesh>
    </Float>
  );
}

function GlowingSphere({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
      <Sphere args={[0.5, 32, 32]} position={position}>
        <MeshDistortMaterial
          color="#3b82f6"
          roughness={0.1}
          metalness={0.8}
          distort={0.4}
          speed={2}
        />
      </Sphere>
    </Float>
  );
}

function TorusRing({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <torusGeometry args={[0.5, 0.1, 16, 32]} />
        <meshStandardMaterial color="#22c55e" roughness={0.2} metalness={0.6} />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} color="#60a5fa" />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#3b82f6" />

      {/* Objects */}
      <FloatingBook position={[-3, 1, 0]} rotation={[0.2, 0.5, 0.1]} />
      <FloatingBook position={[3.5, -0.5, -1]} rotation={[-0.1, -0.3, 0.2]} />
      <GraduationCap position={[2, 2, -1]} />
      <DataNode position={[-2, -1.5, 0]} color="#f97316" />
      <DataNode position={[1, 0, 1]} color="#22c55e" />
      <DataNode position={[-1.5, 2, -0.5]} color="#8b5cf6" />
      <GlowingSphere position={[0, -2, -2]} />
      <TorusRing position={[-3, -1, -1]} />
    </>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
