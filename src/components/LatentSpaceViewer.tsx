"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamic import for Plotly (it uses window/document internally)
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface ScatterPoint {
    id: string;
    x: number;
    y: number;
    category: "Pathogenic" | "Benign" | "VUS";
    is_flagged: boolean;
    cluster: number;
}

export default function LatentSpaceViewer() {
    const [data, setData] = useState<ScatterPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/data/umap_scatter.json")
            .then((res) => res.json())
            .then((d: ScatterPoint[]) => {
                setData(d);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex h-[500px] items-center justify-center rounded-xl border border-border bg-surface">
                <div className="flex items-center gap-3 text-muted">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                    Loading latent space...
                </div>
            </div>
        );
    }

    // Separate by category
    const pathogenic = data.filter(
        (p) => p.category === "Pathogenic" && !p.is_flagged
    );
    const benign = data.filter((p) => p.category === "Benign");
    const vusNormal = data.filter(
        (p) => p.category === "VUS" && !p.is_flagged
    );
    const flagged = data.filter((p) => p.is_flagged);

    const traces = [
        {
            x: benign.map((p) => p.x),
            y: benign.map((p) => p.y),
            text: benign.map((p) => p.id),
            mode: "markers" as const,
            type: "scattergl" as const,
            name: `Benign (${benign.length})`,
            marker: {
                color: "#22c55e",
                size: 4,
                opacity: 0.4,
            },
            hovertemplate: "<b>%{text}</b><br>Category: Benign<extra></extra>",
        },
        {
            x: vusNormal.map((p) => p.x),
            y: vusNormal.map((p) => p.y),
            text: vusNormal.map((p) => p.id),
            mode: "markers" as const,
            type: "scattergl" as const,
            name: `VUS (${vusNormal.length})`,
            marker: {
                color: "#3b82f6",
                size: 5,
                opacity: 0.5,
            },
            hovertemplate: "<b>%{text}</b><br>Category: VUS<extra></extra>",
        },
        {
            x: pathogenic.map((p) => p.x),
            y: pathogenic.map((p) => p.y),
            text: pathogenic.map((p) => p.id),
            mode: "markers" as const,
            type: "scattergl" as const,
            name: `Pathogenic (${pathogenic.length})`,
            marker: {
                color: "#ef4444",
                size: 6,
                opacity: 0.8,
            },
            hovertemplate: "<b>%{text}</b><br>Category: Pathogenic<extra></extra>",
        },
        {
            x: flagged.map((p) => p.x),
            y: flagged.map((p) => p.y),
            text: flagged.map((p) => `${p.id} (${p.category})`),
            mode: "markers" as const,
            type: "scattergl" as const,
            name: `⚠ Flagged VUS (${flagged.length})`,
            marker: {
                color: "#f59e0b",
                size: 10,
                symbol: "star",
                opacity: 0.9,
                line: { color: "#d97706", width: 1 },
            },
            hovertemplate:
                "<b>%{text}</b><br>⚠ Flagged — in pathogenic cluster<extra></extra>",
        },
    ];

    const layout = {
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(20,20,20,0.5)",
        font: { color: "#a3a3a3", family: "system-ui" },
        title: {
            text: "Variant Latent Space (UMAP)",
            font: { size: 16, color: "#ededed" },
        },
        xaxis: {
            title: "UMAP Dimension 1",
            gridcolor: "#262626",
            zerolinecolor: "#333",
        },
        yaxis: {
            title: "UMAP Dimension 2",
            gridcolor: "#262626",
            zerolinecolor: "#333",
        },
        legend: {
            bgcolor: "rgba(20,20,20,0.8)",
            bordercolor: "#333",
            borderwidth: 1,
            font: { size: 11 },
        },
        margin: { l: 60, r: 20, t: 50, b: 50 },
        dragmode: "zoom",
        hovermode: "closest",
    };

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <Plot
                data={traces}
                layout={layout}
                config={{
                    responsive: true,
                    displayModeBar: true,
                    modeBarButtonsToRemove: ["lasso2d", "select2d"],
                    displaylogo: false,
                }}
                style={{ width: "100%", height: "520px" }}
                useResizeHandler
            />
        </div>
    );
}
