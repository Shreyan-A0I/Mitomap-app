"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { formatVariantId } from "@/lib/utils";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface ScatterPoint {
    id: string;
    x: number;
    y: number;
    category: "Pathogenic" | "Benign" | "VUS";
    is_flagged: boolean;
    cluster: number;
}

interface Props {
    onPointClick?: (variantId: string) => void;
}

export default function LatentSpaceViewer({ onPointClick }: Props) {
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
            <div className="flex h-[520px] items-center justify-center rounded-xl border border-border bg-surface">
                <div className="flex items-center gap-3 text-muted">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                    Loading latent space...
                </div>
            </div>
        );
    }

    // BUG FIX: only flag VUS that are in pathogenic clusters
    // Previously this caught Pathogenic + Benign points too, inflating the legend count
    const pathogenic = data.filter((p) => p.category === "Pathogenic");
    const benign = data.filter((p) => p.category === "Benign");
    const vusNormal = data.filter(
        (p) => p.category === "VUS" && !p.is_flagged
    );
    const flaggedVus = data.filter(
        (p) => p.category === "VUS" && p.is_flagged
    );

    // Format IDs for hover display
    const fmtId = (id: string) => formatVariantId(id);

    const traces = [
        {
            x: benign.map((p) => p.x),
            y: benign.map((p) => p.y),
            text: benign.map((p) => fmtId(p.id)),
            customdata: benign.map((p) => p.id),
            mode: "markers" as const,
            type: "scattergl" as const,
            name: `Benign (${benign.length})`,
            marker: {
                color: "#22c55e",
                size: 4,
                opacity: 0.35,
            },
            hovertemplate: "<b>%{text}</b><br>Benign<extra></extra>",
        },
        {
            x: vusNormal.map((p) => p.x),
            y: vusNormal.map((p) => p.y),
            text: vusNormal.map((p) => fmtId(p.id)),
            customdata: vusNormal.map((p) => p.id),
            mode: "markers" as const,
            type: "scattergl" as const,
            name: `VUS (${vusNormal.length})`,
            marker: {
                color: "#3b82f6",
                size: 5,
                opacity: 0.45,
            },
            hovertemplate: "<b>%{text}</b><br>VUS<extra></extra>",
        },
        {
            x: pathogenic.map((p) => p.x),
            y: pathogenic.map((p) => p.y),
            text: pathogenic.map((p) => fmtId(p.id)),
            customdata: pathogenic.map((p) => p.id),
            mode: "markers" as const,
            type: "scattergl" as const,
            name: `Pathogenic (${pathogenic.length})`,
            marker: {
                color: "#ef4444",
                size: 6,
                opacity: 0.8,
            },
            hovertemplate: "<b>%{text}</b><br>Pathogenic<extra></extra>",
        },
        {
            x: flaggedVus.map((p) => p.x),
            y: flaggedVus.map((p) => p.y),
            text: flaggedVus.map((p) => fmtId(p.id)),
            customdata: flaggedVus.map((p) => p.id),
            mode: "markers" as const,
            type: "scattergl" as const,
            name: `⚠ Flagged VUS (${flaggedVus.length})`,
            marker: {
                color: "#f59e0b",
                size: 10,
                symbol: "star",
                opacity: 0.9,
                line: { color: "#d97706", width: 1 },
            },
            hovertemplate:
                "<b>%{text}</b><br>⚠ VUS in pathogenic cluster<extra></extra>",
        },
    ];

    const layout = {
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: { color: "#a3a3a3", family: "system-ui" },
        title: {
            text: "Variant Latent Space (UMAP)",
            font: { size: 16, color: "#ededed" },
        },
        xaxis: {
            showticklabels: false,
            title: "",
            gridcolor: "rgba(255,255,255,0.04)",
            zeroline: false,
            showline: false,
        },
        yaxis: {
            showticklabels: false,
            title: "",
            gridcolor: "rgba(255,255,255,0.04)",
            zeroline: false,
            showline: false,
        },
        legend: {
            bgcolor: "rgba(10,10,10,0.85)",
            bordercolor: "rgba(255,255,255,0.08)",
            borderwidth: 1,
            font: { size: 11, color: "#a3a3a3" },
            x: 1,
            xanchor: "right",
            y: 1,
        },
        margin: { l: 20, r: 20, t: 50, b: 20 },
        dragmode: "zoom" as const,
        hovermode: "closest" as const,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleClick = (event: any) => {
        if (event.points && event.points.length > 0 && onPointClick) {
            const rawId = event.points[0].customdata;
            if (rawId) onPointClick(rawId);
        }
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
                onClick={handleClick}
            />
        </div>
    );
}
