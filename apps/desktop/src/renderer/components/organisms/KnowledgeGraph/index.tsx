import React, { useRef, useEffect, useCallback, useMemo } from "react";
import clsx from "clsx";
import { GlassPanel } from "../GlassPanel";
import { Button } from "../../atoms/Button";
import type { GraphNode, GraphLink } from "../../../store/types";

export interface KnowledgeGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  isAnimating?: boolean;
  onNodeClick?: (node: GraphNode) => void;
  onRefresh?: () => void;
  onToggleAnimation?: () => void;
  className?: string;
}

// Node colors by type (Kanagawa Dragon palette)
const NODE_COLORS = {
  main: "#8ba4b0", // dragonBlue - primary/info
  document: "#87a987", // dragonGreen - success/document
  concept: "#c4b28a", // dragonYellow - warning/concept
} as const;

// Force simulation parameters
const SIMULATION_CONFIG = {
  centerForce: 0.01,
  repulsionForce: 500,
  linkDistance: 100,
  friction: 0.9,
  minVelocity: 0.1,
};

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  nodes,
  links,
  isAnimating = true,
  onNodeClick,
  onRefresh,
  onToggleAnimation,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const animationRef = useRef<number | null>(null);
  const hoveredNodeRef = useRef<string | null>(null);

  // Initialize nodes with velocity
  useEffect(() => {
    nodesRef.current = nodes.map((node) => ({
      ...node,
      vx: node.vx ?? 0,
      vy: node.vy ?? 0,
    }));
  }, [nodes]);

  // Build link map for quick lookup
  const linkMap = useMemo(() => {
    const map = new Map<string, string[]>();
    links.forEach((link) => {
      if (!map.has(link.source)) map.set(link.source, []);
      if (!map.has(link.target)) map.set(link.target, []);
      map.get(link.source)?.push(link.target);
      map.get(link.target)?.push(link.source);
    });
    return map;
  }, [links]);

  // Force simulation step
  const simulationStep = useCallback(
    (canvas: HTMLCanvasElement) => {
      const simNodes = nodesRef.current;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Apply forces
      for (let i = 0; i < simNodes.length; i++) {
        const nodeA = simNodes[i];
        let fx = 0;
        let fy = 0;

        // Center force
        fx += (centerX - nodeA.x) * SIMULATION_CONFIG.centerForce;
        fy += (centerY - nodeA.y) * SIMULATION_CONFIG.centerForce;

        // Repulsion from other nodes
        for (let j = 0; j < simNodes.length; j++) {
          if (i === j) continue;
          const nodeB = simNodes[j];
          const dx = nodeA.x - nodeB.x;
          const dy = nodeA.y - nodeB.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force =
            SIMULATION_CONFIG.repulsionForce / (distance * distance);
          fx += (dx / distance) * force;
          fy += (dy / distance) * force;
        }

        // Link spring force
        const linkedNodes = linkMap.get(nodeA.id) || [];
        for (const linkedId of linkedNodes) {
          const linkedNode = simNodes.find((n) => n.id === linkedId);
          if (linkedNode) {
            const dx = linkedNode.x - nodeA.x;
            const dy = linkedNode.y - nodeA.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const displacement = distance - SIMULATION_CONFIG.linkDistance;
            fx += (dx / distance) * displacement * 0.1;
            fy += (dy / distance) * displacement * 0.1;
          }
        }

        // Update velocity
        nodeA.vx = (nodeA.vx! + fx) * SIMULATION_CONFIG.friction;
        nodeA.vy = (nodeA.vy! + fy) * SIMULATION_CONFIG.friction;
      }

      // Update positions
      for (const node of simNodes) {
        if (
          Math.abs(node.vx!) > SIMULATION_CONFIG.minVelocity ||
          Math.abs(node.vy!) > SIMULATION_CONFIG.minVelocity
        ) {
          node.x += node.vx!;
          node.y += node.vy!;

          // Boundary constraints
          node.x = Math.max(50, Math.min(canvas.width - 50, node.x));
          node.y = Math.max(50, Math.min(canvas.height - 50, node.y));
        }
      }
    },
    [linkMap],
  );

  // Draw graph
  const draw = useCallback(
    (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      const simNodes = nodesRef.current;

      // Clear canvas
      ctx.fillStyle = "transparent";
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw links
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      for (const link of links) {
        const source = simNodes.find((n) => n.id === link.source);
        const target = simNodes.find((n) => n.id === link.target);
        if (source && target) {
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      }

      // Draw nodes
      for (const node of simNodes) {
        const isHovered = hoveredNodeRef.current === node.id;
        const color = NODE_COLORS[node.type];
        const radius = node.size + (isHovered ? 4 : 0);

        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = isHovered ? 20 : 10;

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Reset shadow
        ctx.shadowBlur = 0;

        // Label
        ctx.font = "12px system-ui, sans-serif";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y + radius + 16);
      }
    },
    [links],
  );

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to fit container
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = () => {
      if (isAnimating) {
        simulationStep(canvas);
      }
      draw(canvas, ctx);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, simulationStep, draw]);

  // Handle mouse events
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if hovering over a node
      let foundNode: string | null = null;
      for (const node of nodesRef.current) {
        const dx = x - node.x;
        const dy = y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= node.size + 5) {
          foundNode = node.id;
          break;
        }
      }

      hoveredNodeRef.current = foundNode;
      canvas.style.cursor = foundNode ? "pointer" : "default";
    },
    [],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !onNodeClick) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (const node of nodesRef.current) {
        const dx = x - node.x;
        const dy = y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= node.size + 5) {
          onNodeClick(node);
          break;
        }
      }
    },
    [onNodeClick],
  );

  return (
    <GlassPanel
      radius="lg"
      blur="lg"
      className={clsx("relative overflow-hidden", className)}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {onToggleAnimation && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleAnimation}
            leftIcon={isAnimating ? "pause" : "play"}
          >
            {isAnimating ? "停止" : "再生"}
          </Button>
        )}
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            leftIcon="refresh-cw"
          >
            更新
          </Button>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 flex gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: NODE_COLORS.main }}
          />
          <span className="text-xs text-white/60">メイン</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: NODE_COLORS.document }}
          />
          <span className="text-xs text-white/60">ドキュメント</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: NODE_COLORS.concept }}
          />
          <span className="text-xs text-white/60">コンセプト</span>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        aria-label="Knowledge Graph visualization"
      />

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60">グラフデータがありません</p>
        </div>
      )}
    </GlassPanel>
  );
};

KnowledgeGraph.displayName = "KnowledgeGraph";
