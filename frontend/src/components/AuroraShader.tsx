"use client";

import React, { useEffect, useRef } from "react";

interface AuroraShaderProps {
  className?: string;
  opacity?: number;
}

export function AuroraShader({
  className = "fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden",
  opacity = 0.85,
}: AuroraShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) return;

    let animFrameId: number;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_speed;
      varying vec2 v_texCoord;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        float t = u_time * 0.18;

        // Smooth ocean fluid ripple around cursor
        vec2 delta = st - u_mouse;
        delta.x *= u_resolution.x / u_resolution.y;
        float dist = length(delta);

        // Fluid mixing wave that dissipates naturally with distance
        float fluidRipple = sin(dist * 16.0 - u_time * 2.5) * exp(-dist * 4.5) * min(u_speed * 12.0, 0.35);
        vec2 fluidDisplace = normalize(delta + 0.0001) * fluidRipple;

        vec2 p = st + fluidDisplace;

        float n1 = snoise(p * 1.5 + vec2(t * 0.35, t * 0.25));
        float n2 = snoise(p * 2.2 - vec2(t * 0.3, -t * 0.4) + vec2(n1 * 0.6));
        float n3 = snoise(p * 3.4 + vec2(n2 * 0.4, t * 0.2));

        vec3 baseColor = vec3(0.988, 0.976, 0.961);
        vec3 peachColor = vec3(0.975, 0.902, 0.827);
        vec3 amberColor = vec3(0.91, 0.659, 0.424);
        vec3 terraColor = vec3(0.761, 0.396, 0.165);

        float wave1 = smoothstep(-0.4, 0.6, sin(p.x * 2.5 + p.y * 1.3 + n1 * 1.3 + t));
        float wave2 = smoothstep(-0.3, 0.7, cos(p.x * 1.8 - p.y * 2.0 + n2 * 1.5 - t * 0.7));
        float wave3 = smoothstep(0.0, 0.8, snoise(p * 1.1 + vec2(t * 0.12)));

        vec3 col = mix(baseColor, peachColor, wave1 * 0.85);
        col = mix(col, amberColor, wave2 * 0.45);
        col = mix(col, terraColor, wave3 * 0.28 * wave1);

        // Subtle fluid glow near cursor
        col = mix(col, amberColor, smoothstep(0.3, 0.0, dist) * u_speed * 0.25);

        // Tactile micro-grain
        float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
        col += (grain - 0.5) * 0.03;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function compileShader(type: number, src: string) {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vs);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fs);
    if (!vertexShader || !fragmentShader) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vertexShader);
    gl.attachShader(prog, fragmentShader);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(prog));
      return;
    }

    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uSpeed = gl.getUniformLocation(prog, "u_speed");

    const targetMouse = { x: 0.5, y: 0.5 };
    const currentMouse = { x: 0.5, y: 0.5 };
    let speed = 0.0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        targetMouse.x = (e.clientX - rect.left) / rect.width;
        targetMouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    function render(time: number) {
      if (!gl || !canvas) return;
      syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);

      // Damped spring interpolation for silky-smooth fluid response with zero lag
      const dx = targetMouse.x - currentMouse.x;
      const dy = targetMouse.y - currentMouse.y;
      currentMouse.x += dx * 0.08;
      currentMouse.y += dy * 0.08;
      const instantSpeed = Math.sqrt(dx * dx + dy * dy);
      speed += (instantSpeed - speed) * 0.1;

      if (uTime) gl.uniform1f(uTime, time * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, currentMouse.x, currentMouse.y);
      if (uSpeed) gl.uniform1f(uSpeed, speed);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animFrameId = requestAnimationFrame(render);
    }

    animFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (resizeObserver) resizeObserver.disconnect();
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <div
      className={`${className} aurora-bg-mesh`}
      style={{ display: "block" }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block mix-blend-multiply opacity-85"
        width={1280}
        height={720}
      />
    </div>
  );
}
