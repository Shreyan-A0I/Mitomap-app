"use client";

import { useEffect, useState } from "react";
import {
    FlaskConical,
    Dna,
    AlertTriangle,
    BarChart3,
    Target,
    Layers,
} from "lucide-react";

interface DashboardStats {
    total_variants: number;
    n_pathogenic: number;
    n_benign: number;
    n_vus: number;
    n_other: number;
    n_phenotypes: number;
    vus_in_pathogenic_clusters: number;
    silhouette_score: number | null;
    test_auprc: number | null;
    test_auroc: number | null;
}

interface StatCardProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    glowColor: string;
    subtext?: string;
}

function StatCard({ label, value, icon, glowColor, subtext }: StatCardProps) {
    return (
        <div
            className="stat-card rounded-xl border border-border bg-surface p-5"
            style={{ "--glow-color": glowColor } as React.CSSProperties}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted">
                        {label}
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
                    {subtext && (
                        <p className="mt-0.5 text-xs text-muted">{subtext}</p>
                    )}
                </div>
                <div className="rounded-lg bg-background/50 p-2.5 text-muted">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function StatsBar() {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        fetch("/data/dashboard_stats.json")
            .then((r) => r.json())
            .then(setStats)
            .catch(() => { });
    }, []);

    if (!stats) {
        return (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-24 animate-pulse rounded-xl border border-border bg-surface"
                    />
                ))}
            </div>
        );
    }

    const flaggedPct = (
        (stats.vus_in_pathogenic_clusters / stats.n_vus) *
        100
    ).toFixed(0);

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <StatCard
                label="Total Variants"
                value={stats.total_variants.toLocaleString()}
                icon={<Dna className="h-5 w-5" />}
                glowColor="#6366f1"
                subtext={`${stats.n_phenotypes} phenotypes`}
            />
            <StatCard
                label="VUS"
                value={stats.n_vus.toLocaleString()}
                icon={<FlaskConical className="h-5 w-5" />}
                glowColor="#3b82f6"
                subtext="Uncertain significance"
            />
            <StatCard
                label="Flagged VUS"
                value={`${stats.vus_in_pathogenic_clusters}`}
                icon={<AlertTriangle className="h-5 w-5" />}
                glowColor="#f59e0b"
                subtext={`${flaggedPct}% of VUS`}
            />
            <StatCard
                label="Test AUPRC"
                value={stats.test_auprc ? stats.test_auprc.toFixed(3) : "—"}
                icon={<Target className="h-5 w-5" />}
                glowColor="#22c55e"
                subtext="Link prediction"
            />
            <StatCard
                label="Test AUROC"
                value={stats.test_auroc ? stats.test_auroc.toFixed(3) : "—"}
                icon={<BarChart3 className="h-5 w-5" />}
                glowColor="#8b5cf6"
                subtext="Classification"
            />
            <StatCard
                label="Silhouette"
                value={
                    stats.silhouette_score != null
                        ? stats.silhouette_score.toFixed(3)
                        : "—"
                }
                icon={<Layers className="h-5 w-5" />}
                glowColor="#ec4899"
                subtext="Cluster quality"
            />
        </div>
    );
}
