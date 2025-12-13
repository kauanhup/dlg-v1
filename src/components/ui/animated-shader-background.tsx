import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AnimatedShaderBackgroundProps {
  className?: string;
}

const AnimatedShaderBackground = ({ className }: AnimatedShaderBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
      // Limit pixel ratio for performance
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.error('WebGL not supported:', err);
      return;
    }

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2() }
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;

        float rand(vec2 n) {
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 u = fract(p);
          u = u*u*(3.0-2.0*u);
          float res = mix(
            mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
            mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x), u.y);
          return res * res;
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / iResolution.xy;
          vec2 p = (uv - 0.5) * 2.0;
          
          vec4 o = vec4(0.0);
          float t = iTime * 0.3;
          
          // Simplified aurora - only 12 iterations
          for (float i = 0.0; i < 12.0; i++) {
            vec2 v = p + cos(i * i + t + i * vec2(13.0, 11.0)) * 2.0;
            float n = noise(v * 2.0 + t);
            vec4 col = vec4(
              0.1 + 0.2 * sin(i * 0.3 + t),
              0.3 + 0.4 * cos(i * 0.4 + t),
              0.6 + 0.3 * sin(i * 0.5 + t),
              1.0
            );
            o += col * exp(-length(v) * 0.5) * (0.3 + n * 0.2);
          }
          
          gl_FragColor = clamp(o * 0.15, 0.0, 1.0);
        }
      `
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let frameId: number;
    let lastTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;
    
    const animate = (currentTime: number) => {
      frameId = requestAnimationFrame(animate);
      
      const delta = currentTime - lastTime;
      if (delta < frameInterval) return;
      
      lastTime = currentTime - (delta % frameInterval);
      material.uniforms.iTime.value += 0.033;
      renderer.render(scene, camera);
    };
    requestAnimationFrame(animate);

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      // Render at half resolution for performance
      renderer.setSize(w * 0.5, h * 0.5, false);
      renderer.domElement.style.width = w + 'px';
      renderer.domElement.style.height = h + 'px';
      material.uniforms.iResolution.value.set(w * 0.5, h * 0.5);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      
      const canvas = renderer.domElement;
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default AnimatedShaderBackground;
