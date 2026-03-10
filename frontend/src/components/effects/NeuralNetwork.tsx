"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
}

interface Edge {
  a: number;
  b: number;
}

const NODE_COUNT = 40;
const CONNECTION_DISTANCE = 160;
const SPEED = 0.25;

export default function NeuralNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let nodes: Node[] = [];
    let edges: Edge[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initNodes();
    };

    const initNodes = () => {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        radius: Math.random() * 2 + 1,
        pulsePhase: Math.random() * Math.PI * 2,
      }));
    };

    const buildEdges = () => {
      edges = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            edges.push({ a: i, b: j });
          }
        }
      }
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move nodes
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      }

      buildEdges();

      // Draw edges
      for (const edge of edges) {
        const a = nodes[edge.a];
        const b = nodes[edge.b];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.3;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw nodes
      for (const node of nodes) {
        const pulse = Math.sin(time * 0.001 + node.pulsePhase) * 0.5 + 0.5;
        const alpha = 0.4 + pulse * 0.4;
        const r = node.radius * (1 + pulse * 0.3);

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
        ctx.fill();

        // Glow ring for larger nodes
        if (node.radius > 2) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(5, 150, 105, ${alpha * 0.3})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
      style={{ opacity: 0.6 }}
    />
  );
}
