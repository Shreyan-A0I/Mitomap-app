"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { formatVariantId } from "@/lib/utils";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
    ssr: false,
});

interface NodeFeatures {
    // Variant
    position?: number;
    ref?: string;
    alt?: string;
    clinical_significance?: string;
    phylop?: number;
    apogee?: number;
    mitotip?: number;
    // Gene
    biotype?: string;
    genome_range?: string;
    // Complex
    complex_id?: string;
    // Phenotype
    disease_name?: string;
    connected_variants?: number;
}

interface GraphNode {
    id: string;
    label: string;
    type: "Complex" | "Gene" | "Pathogenic" | "Flagged_VUS" | "Phenotype";
    size: number;
    features?: NodeFeatures;
    x?: number;
    y?: number;
    [key: string]: unknown;
}

interface GraphLink {
    source: string;
    target: string;
    type: "PART_OF" | "LOCATED_IN" | "ASSOCIATED_WITH";
    attention?: number;
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

const LINK_COLORS_BRIGHT: Record<string, string> = {
    PART_OF: "#a78bfa",
    LOCATED_IN: "#38bdf8",
    ASSOCIATED_WITH: "#f59e0b",
};

interface Props {
    onNodeClick?: (variantId: string) => void;
}

export default function NetworkGraph({ onNodeClick }: Props) {
    const [data, setData] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(true);
    const [hovered, setHovered] = useState<GraphNode | null>(null);
    const [inspected, setInspected] = useState<GraphNode | null>(null);
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

    // Responsive sizing via ResizeObserver (clientWidth excludes border)
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            setDimensions({
                width: el.clientWidth,
                height: 520,
            });
        });
        ro.observe(el);
        return () => ro.disconnect();
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
            const isInspected = inspected?.id === gNode.id;

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

            // Border on hover or inspected
            if ((hovered && hovered.id === gNode.id) || isInspected) {
                ctx.strokeStyle = isInspected ? "#fff" : "rgba(255,255,255,0.7)";
                ctx.lineWidth = isInspected ? 2 : 1.5;
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
        [hovered, inspected, formatLabel]
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
                linkColor={(link: any) => {
                    const att = link.attention ?? 0.5;
                    if (att > 0.3) return LINK_COLORS_BRIGHT[link.type] || "#666";
                    return LINK_COLORS[link.type] || "#333";
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                linkWidth={(link: any) => {
                    const att = link.attention ?? 0.5;
                    return 0.5 + att * 4;
                }}
                linkDirectionalParticles={1}
                linkDirectionalParticleWidth={1.5}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                linkDirectionalParticleSpeed={(link: any) => {
                    const att = link.attention ?? 0.5;
                    return 0.002 + att * 0.006;
                }}
                linkCurvature={0.15}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onNodeHover={(node) => setHovered((node as GraphNode) ?? null)}
                onNodeClick={(node) => {
                    const gNode = node as GraphNode;
                    setInspected(prev => prev?.id === gNode.id ? null : gNode);
                    if (
                        (gNode.type === "Pathogenic" || gNode.type === "Flagged_VUS") &&
                        onNodeClick
                    ) {
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
                <div className="mt-1.5 flex items-center gap-2 text-[9px] text-muted/70">
                    <span>Edge thickness = attention weight (α)</span>
                </div>
            </div>

            {/* Hover tooltip */}
            {hovered && !inspected && (
                <div className="absolute top-3 right-3 rounded-lg border border-border/50 bg-surface/90 px-3 py-2 backdrop-blur-sm text-xs">
                    <p className="font-semibold text-foreground">
                        {formatLabel(hovered)}
                    </p>
                    <p className="text-muted capitalize">{hovered.type.replace("_", " ")}</p>
                </div>
            )}

            {/* Node inspection panel */}
            {inspected && (
                <div className="absolute top-3 right-3 w-72 rounded-xl border border-border/60 bg-surface/95 px-4 py-3 backdrop-blur-md shadow-xl">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <p className="font-semibold text-sm text-foreground">
                                {formatLabel(inspected)}
                            </p>
                            <p className="text-[10px] text-muted capitalize">
                                {inspected.type.replace("_", " ")}
                            </p>
                        </div>
                        <button
                            onClick={() => setInspected(null)}
                            className="text-muted hover:text-foreground text-xs ml-2 mt-0.5"
                        >
                            ✕
                        </button>
                    </div>

                    {inspected.features && (
                        <div className="space-y-1.5 text-[11px]">
                            {/* Variant features */}
                            {(inspected.type === "Pathogenic" || inspected.type === "Flagged_VUS") && (
                                <>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                        <FeatureRow label="Position" value={`m.${inspected.features.position}`} />
                                        <FeatureRow label="Change" value={`${inspected.features.ref}>${inspected.features.alt}`} />
                                        <FeatureRow label="ClinSig" value={inspected.features.clinical_significance} />
                                        <FeatureRow label="PhyloP" value={inspected.features.phylop?.toFixed(3)} highlight={
                                            (inspected.features.phylop ?? 0) > 1.5
                                        } />
                                        {inspected.features.apogee !== undefined && inspected.features.apogee > 0 && (
                                            <FeatureRow label="APOGEE" value={inspected.features.apogee.toFixed(3)} />
                                        )}
                                        {inspected.features.mitotip !== undefined && inspected.features.mitotip > 0 && (
                                            <FeatureRow label="MitoTIP" value={inspected.features.mitotip.toFixed(3)} />
                                        )}
                                    </div>
                                </>
                            )}

                            {/* Gene features */}
                            {inspected.type === "Gene" && (
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                    <FeatureRow label="Biotype" value={inspected.features.biotype} />
                                    <FeatureRow label="Range" value={inspected.features.genome_range} />
                                </div>
                            )}

                            {/* Complex features */}
                            {inspected.type === "Complex" && (
                                <FeatureRow label="Complex" value={inspected.features.complex_id} />
                            )}

                            {/* Phenotype features */}
                            {inspected.type === "Phenotype" && (
                                <div className="space-y-1">
                                    <FeatureRow label="Disease" value={inspected.features.disease_name} />
                                    <FeatureRow label="Linked variants" value={inspected.features.connected_variants} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function FeatureRow({ label, value, highlight }: {
    label: string;
    value?: string | number | null;
    highlight?: boolean;
}) {
    if (value === undefined || value === null) return null;
    return (
        <div className="flex items-baseline gap-1">
            <span className="text-muted/70 shrink-0">{label}</span>
            <span className={`font-mono text-[10px] ${highlight ? 'text-accent font-semibold' : 'text-foreground'}`}>
                {value}
            </span>
        </div>
    );
}
