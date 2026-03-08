"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { formatVariantId } from "@/lib/utils";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
    ssr: false,
});

interface GraphNode {
    id: string;
    label: string;
    type: "Complex" | "Gene" | "Pathogenic" | "Flagged_VUS" | "Phenotype";
    size: number;
    x?: number;
    y?: number;
    [key: string]: unknown;
}

interface GraphLink {
    source: string;
    target: string;
    type: "PART_OF" | "LOCATED_IN" | "ASSOCIATED_WITH";
    [key: string]: unknown;
}

interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

// Color mapping for node types
const NODE_COLORS: Record<string, string> = {
    Complex: "#a78bfa",    // violet
    Gene: "#38bdf8",       // sky blue
    Pathogenic: "#ef4444", // red
    Flagged_VUS: "#f59e0b",// amber
    Phenotype: "#34d399",  // emerald
};

const LINK_COLORS: Record<string, string> = {
    PART_OF: "#7c3aed55",
    LOCATED_IN: "#0ea5e955",
    ASSOCIATED_WITH: "#f5990b44",
};

interface Props {
    onNodeClick?: (variantId: string) => void;
}

export default function NetworkGraph({ onNodeClick }: Props) {
    const [data, setData] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(true);
    const [hovered, setHovered] = useState<GraphNode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 520 });

    useEffect(() => {
        fetch("/data/network_graph.json")
            .then((res) => res.json())
            .then((d: GraphData) => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Responsive sizing
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: 520,
                });
            }
        };
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    const formatLabel = useCallback((node: GraphNode) => {
        if (node.type === "Pathogenic" || node.type === "Flagged_VUS") {
            return formatVariantId(node.label);
        }
        return node.label;
    }, []);

    // Custom canvas rendering for nodes
    const drawNode = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const gNode = node as GraphNode;
            const label = formatLabel(gNode);
            const size = gNode.size / 2;
            const x = node.x ?? 0;
            const y = node.y ?? 0;
            const color = NODE_COLORS[gNode.type] || "#888";

            // Draw node circle
            ctx.beginPath();
            if (gNode.type === "Flagged_VUS") {
                // Star shape for flagged VUS
                const spikes = 5;
                const outerR = size * 1.2;
                const innerR = size * 0.5;
                for (let i = 0; i < spikes * 2; i++) {
                    const r = i % 2 === 0 ? outerR : innerR;
                    const angle = (i * Math.PI) / spikes - Math.PI / 2;
                    const px = x + Math.cos(angle) * r;
                    const py = y + Math.sin(angle) * r;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
            } else if (gNode.type === "Complex") {
                // Rounded rect for complexes
                const w = size * 2.5;
                const h = size * 1.8;
                const r = 3;
                ctx.moveTo(x - w / 2 + r, y - h / 2);
                ctx.lineTo(x + w / 2 - r, y - h / 2);
                ctx.quadraticCurveTo(x + w / 2, y - h / 2, x + w / 2, y - h / 2 + r);
                ctx.lineTo(x + w / 2, y + h / 2 - r);
                ctx.quadraticCurveTo(x + w / 2, y + h / 2, x + w / 2 - r, y + h / 2);
                ctx.lineTo(x - w / 2 + r, y + h / 2);
                ctx.quadraticCurveTo(x - w / 2, y + h / 2, x - w / 2, y + h / 2 - r);
                ctx.lineTo(x - w / 2, y - h / 2 + r);
                ctx.quadraticCurveTo(x - w / 2, y - h / 2, x - w / 2 + r, y - h / 2);
            } else if (gNode.type === "Phenotype") {
                // Diamond for phenotypes
                ctx.moveTo(x, y - size * 1.3);
                ctx.lineTo(x + size, y);
                ctx.lineTo(x, y + size * 1.3);
                ctx.lineTo(x - size, y);
                ctx.closePath();
            } else {
                // Circle for genes and pathogenic variants
                ctx.arc(x, y, size, 0, 2 * Math.PI);
            }

            ctx.fillStyle = color;
            ctx.fill();

            // Border on hover
            if (hovered && hovered.id === gNode.id) {
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Label (only show at sufficient zoom or for large nodes)
            const showLabel =
                globalScale > 1.5 ||
                gNode.type === "Complex" ||
                gNode.type === "Gene" ||
                (globalScale > 0.8 && gNode.type === "Phenotype");

            if (showLabel) {
                const fontSize = Math.max(
                    10 / globalScale,
                    gNode.type === "Complex" ? 4 : 2.5
                );
                ctx.font = `${fontSize}px system-ui`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle =
                    gNode.type === "Complex" ? "#fff" : "rgba(255,255,255,0.85)";

                if (gNode.type === "Complex") {
                    ctx.fillText(label, x, y);
                } else {
                    ctx.fillText(label, x, y + size + fontSize + 1);
                }
            }
        },
        [hovered, formatLabel]
    );

    if (loading || !data) {
        return (
            <div className="flex h-[520px] items-center justify-center rounded-xl border border-border bg-surface">
                <div className="flex items-center gap-3 text-muted">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                    Loading network graph...
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative overflow-hidden rounded-xl border border-border bg-surface"
        >
            <ForceGraph2D
                graphData={data}
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor="rgba(0,0,0,0)"
                nodeCanvasObject={drawNode}
                nodeCanvasObjectMode={() => "replace"}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                linkColor={(link: any) => LINK_COLORS[link.type] || "#333"}
                linkWidth={1}
                linkDirectionalParticles={1}
                linkDirectionalParticleWidth={1.5}
                linkDirectionalParticleSpeed={0.004}
                linkCurvature={0.15}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onNodeHover={(node) => setHovered((node as GraphNode) ?? null)}
                onNodeClick={(node) => {
                    const gNode = node as GraphNode;
                    if (
                        (gNode.type === "Pathogenic" || gNode.type === "Flagged_VUS") &&
                        onNodeClick
                    ) {
                        // Extract raw variant id from node id (V:var_3733_G_A → var_3733_G_A)
                        const rawId = gNode.id.replace(/^V:/, "");
                        onNodeClick(rawId);
                    }
                }}
                cooldownTicks={100}
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.3}
                enableZoomInteraction
                enablePanInteraction
                enableNodeDrag
            />

            {/* Legend */}
            <div className="absolute bottom-3 left-3 rounded-lg border border-border/50 bg-surface/90 px-3 py-2 backdrop-blur-sm">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted">
                    {Object.entries(NODE_COLORS).map(([type, color]) => (
                        <div key={type} className="flex items-center gap-1.5">
                            <span
                                className="inline-block h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                            {type.replace("_", " ")} (
                            {data.nodes.filter((n) => n.type === type).length})
                        </div>
                    ))}
                </div>
            </div>

            {/* Hover tooltip */}
            {hovered && (
                <div className="absolute top-3 right-3 rounded-lg border border-border/50 bg-surface/90 px-3 py-2 backdrop-blur-sm text-xs">
                    <p className="font-semibold text-foreground">
                        {formatLabel(hovered)}
                    </p>
                    <p className="text-muted capitalize">{hovered.type.replace("_", " ")}</p>
                </div>
            )}
        </div>
    );
}
