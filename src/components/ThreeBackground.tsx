import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export const ThreeBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    // Dynamically import THREE only on the client side
    let THREE: any;
    let cleanup = () => {};

    if (typeof window !== "undefined") {
      import("three").then((module) => {
        THREE = module;
        initScene(THREE);
      });
    }

    const initScene = (THREE: any) => {
      if (!mountRef.current) return;

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 5;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      mountRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // === Particles ===
      const particleCount = 1000;
      const particles = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const color1 = new THREE.Color(theme === "dark" ? 0x667eea : 0x764ba2);
      const color2 = new THREE.Color(theme === "dark" ? 0xf093fb : 0x4facfe);

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = (Math.random() - 0.5) * 20;
        positions[i + 2] = (Math.random() - 0.5) * 20;

        const color = Math.random() > 0.5 ? color1 : color2;
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
      }

      particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      particles.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });

      const particleSystem = new THREE.Points(particles, particleMaterial);
      scene.add(particleSystem);

      // === Glowing orbs ===
      const orbs: any[] = [];
      for (let i = 0; i < 5; i++) {
        const geometry = new THREE.SphereGeometry(0.3, 32, 32);
        const material = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? color1 : color2,
          transparent: true,
          opacity: 0.3,
        });
        const orb = new THREE.Mesh(geometry, material);
        orb.position.set(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 5
        );
        scene.add(orb);
        orbs.push(orb);
      }

      const gridHelper = new THREE.GridHelper(20, 20, color1, color2);
      (gridHelper.material as any).opacity = 0.2;
      (gridHelper.material as any).transparent = true;
      scene.add(gridHelper);

      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);
        particleSystem.rotation.y += 0.001;
        particleSystem.rotation.x += 0.0005;

        orbs.forEach((orb, i) => {
          orb.position.y += Math.sin(Date.now() * 0.001 + i) * 0.01;
          orb.rotation.x += 0.01;
          orb.rotation.y += 0.01;
        });

        gridHelper.rotation.z += 0.0005;
        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener("resize", handleResize);

      cleanup = () => {
        window.removeEventListener("resize", handleResize);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement);
        renderer.dispose();
        particles.dispose();
        particleMaterial.dispose();
        orbs.forEach((orb) => {
          orb.geometry.dispose();
          orb.material.dispose();
        });
      };
    };

    return () => cleanup();
  }, [theme]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ background: "transparent" }}
    />
  );
};
