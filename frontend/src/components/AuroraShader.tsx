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

    // Use WebGL context with optimized attributes
    const gl =
      canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
        preserveDrawingBuffer: false,
      }) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) return;

    let animFrameId: number;
    let isRunning = true;

    // Scale factor: 0.5x resolution cuts GPU fragment fill-rate by 75%,
    // producing a much softer, dreamier ambient aurora while keeping scrolling locked at 60-120fps.
    const RENDER_SCALE = 0.5;

    function resizeCanvas() {
      if (!canvas) return;
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;

      // Cap internal buffer resolution to max 960x540 for silky-smooth performance
      const targetW = Math.min(960, Math.round(displayWidth * RENDER_SCALE));
      const targetH = Math.min(540, Math.round(displayHeight * RENDER_SCALE));

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        if (gl) {
          gl.viewport(0, 0, targetW, targetH);
        }
      }
    }

    // Initial resize
    resizeCanvas();

    // Listen to resize on window debounced via RAF (NEVER read clientWidth in render loop)
    let resizeScheduled = false;
    const handleWindowResize = () => {
      if (!resizeScheduled) {
        resizeScheduled = true;
        requestAnimationFrame(() => {
          resizeCanvas();
          resizeScheduled = false;
        });
      }
    };
    window.addEventListener("resize", handleWindowResize, { passive: true });

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision mediump float;
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
        float t = u_time * 0.16;

        // Smooth fluid displacement around mouse
        vec2 delta = st - u_mouse;
        delta.x *= u_resolution.x / u_resolution.y;
        float dist = length(delta);

        float fluidRipple = sin(dist * 14.0 - u_time * 2.2) * exp(-dist * 4.2) * min(u_speed * 10.0, 0.3);
        vec2 fluidDisplace = normalize(delta + 0.0001) * fluidRipple;
        vec2 p = st + fluidDisplace;

        float n1 = snoise(p * 1.4 + vec2(t * 0.3, t * 0.22));
        float n2 = snoise(p * 2.0 - vec2(t * 0.25, -t * 0.35) + vec2(n1 * 0.5));
        float n3 = snoise(p * 3.0 + vec2(n2 * 0.35, t * 0.18));

        vec3 baseColor = vec3(0.988, 0.976, 0.961);
        vec3 peachColor = vec3(0.975, 0.902, 0.827);
        vec3 amberColor = vec3(0.91, 0.659, 0.424);
        vec3 terraColor = vec3(0.761, 0.396, 0.165);

        float wave1 = smoothstep(-0.4, 0.6, sin(p.x * 2.2 + p.y * 1.2 + n1 * 1.2 + t));
        float wave2 = smoothstep(-0.3, 0.7, cos(p.x * 1.6 - p.y * 1.8 + n2 * 1.4 - t * 0.65));
        float wave3 = smoothstep(0.0, 0.8, snoise(p * 1.0 + vec2(t * 0.1)));

        vec3 col = mix(baseColor, peachColor, wave1 * 0.85);
        col = mix(col, amberColor, wave2 * 0.45);
        col = mix(col, terraColor, wave3 * 0.28 * wave1);

        // Subtle fluid glow near cursor
        col = mix(col, amberColor, smoothstep(0.3, 0.0, dist) * u_speed * 0.2);

        // Soft micro-texture
        float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
        col += (grain - 0.5) * 0.02;

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

    // Fast, zero-reflow mouse tracking (no getBoundingClientRect calls)
    const handleMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w > 0 && h > 0) {
        targetMouse.x = e.clientX / w;
        targetMouse.y = 1.0 - e.clientY / h;
      }
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Pause rendering when tab is hidden to save resources
    const handleVisibilityChange = () => {
      isRunning = !document.hidden;
      if (isRunning) {
        animFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    function render(time: number) {
      if (!isRunning || !gl || !canvas) return;

      // Smooth spring damping
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
      isRunning = false;
      window.removeEventListener("resize", handleWindowResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <div
      className={`${className} transform-gpu will-change-transform pointer-events-none`}
      style={{
        display: "block",
        transform: "translate3d(0,0,0)",
        backfaceVisibility: "hidden",
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block mix-blend-multiply opacity-85 transform-gpu"
        style={{
          imageRendering: "auto",
        }}
      />
    </div>
  );
}
