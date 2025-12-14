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
          vec2 p = (gl_FragCoord.xy - iResolution.xy * 0.5) / iResolution.y * mat2(6.0, -4.0, 4.0, 6.0);
          vec2 v;
          vec4 o = vec4(0.0);

          for (float i = 0.0; i < 15.0; i++) {
            v = p + cos(i * i + iTime * 0.02 + i * vec2(13.0, 11.0)) * 3.5;
            vec4 auroraColors = vec4(
              0.1 + 0.3 * sin(i * 0.2 + iTime * 0.3),
              0.3 + 0.5 * cos(i * 0.3 + iTime * 0.4),
              0.7 + 0.3 * sin(i * 0.4 + iTime * 0.25),
              1.0
            );
            vec4 currentContribution = auroraColors * exp(sin(i * i + iTime * 0.6)) / length(max(v, vec2(v.x * 0.03, v.y * 1.5)));
            float thinnessFactor = smoothstep(0.0, 1.0, i / 15.0) * 0.6;
            o += currentContribution * thinnessFactor;
          }

          o = tanh(pow(o / 80.0, vec4(1.6)));
          gl_FragColor = o * 1.5;
        }
      `
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let frameId: number;
    const animate = () => {
      material.uniforms.iTime.value += 0.016;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      material.uniforms.iResolution.value.set(w, h);
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
