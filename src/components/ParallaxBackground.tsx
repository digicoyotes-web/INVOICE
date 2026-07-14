import React, { useEffect, useRef, useState } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export default function ParallaxBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Responsive resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Mouse movement track
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Generate floating 3D particle nodes
    const nodes: Node[] = Array.from({ length: 45 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 3 + 1,
      color: Math.random() > 0.6 ? "rgba(245, 158, 11, 0.25)" : "rgba(30, 41, 59, 0.4)",
    }));

    // Draw the parallax scene
    const renderScene = () => {
      ctx.clearRect(0, 0, width, height);

      // Interpolate mouse coordinates for fluid lag (inertia)
      const dx = mouseRef.current.targetX - mouseRef.current.x;
      const dy = mouseRef.current.targetY - mouseRef.current.y;
      mouseRef.current.x += dx * 0.05;
      mouseRef.current.y += dy * 0.05;

      const mouseX = mouseRef.current.x || width / 2;
      const mouseY = mouseRef.current.y || height / 2;

      // 1. Draw subtle ambient cyber grid
      ctx.strokeStyle = "rgba(15, 23, 42, 0.045)";
      ctx.lineWidth = 1;
      const gridSize = 60;
      const xOffset = (mouseX * -0.02) % gridSize;
      const yOffset = (mouseY * -0.02) % gridSize;

      for (let x = xOffset; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = yOffset; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Render and animate particle nodes
      nodes.forEach((node, i) => {
        // Move nodes
        node.x += node.vx;
        node.y += node.vy;

        // Bounce on boundaries
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Apply mouse gravity warp (subtle 3D magnetic pull)
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let px = node.x;
        let py = node.y;

        if (dist < 220) {
          const force = (220 - dist) / 220;
          px -= dx * force * 0.08;
          py -= dy * force * 0.08;
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(px, py, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Connect near nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const odx = other.x - node.x;
          const ody = other.y - node.y;
          const odist = Math.sqrt(odx * odx + ody * ody);

          if (odist < 140) {
            const alpha = (140 - odist) / 140 * 0.07;
            ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        }
      });

      // 3. Render floating orbiting 3D rings in background corner
      const ringX = width * 0.85;
      const ringY = height * 0.25;
      const tiltX = (mouseX - width / 2) * 0.0003;
      const tiltY = (mouseY - height / 2) * 0.0003;

      ctx.save();
      ctx.translate(ringX, ringY);
      ctx.rotate(tiltX);
      ctx.scale(1, 0.4 + tiltY);

      // Outer glowing copper ring
      ctx.strokeStyle = "rgba(245, 158, 11, 0.06)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 160, 0, Math.PI * 2);
      ctx.stroke();

      // Inner elegant ring
      ctx.strokeStyle = "rgba(51, 65, 85, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 110, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(renderScene);
    };

    renderScene();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="parallax-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 bg-slate-950"
    />
  );
}
