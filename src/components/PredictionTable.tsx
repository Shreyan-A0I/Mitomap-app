"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Search, AlertTriangle, ArrowUpDown, Download, X } from "lucide-react";
import { formatVariantId, formatProbability } from "@/lib/utils";

interface Prediction {
    variant_id: string;
    variant_idx: number;
    phenotype: string;
    phenotype_idx: number;
    score: number;
    probability: number;
    rank: number;
}

type SortField = "probability" | "variant_id" | "phenotype";

interface Props {
    externalFilter?: string | null;
}

export default function PredictionTable({ externalFilter }: Props) {
    const [data, setData] = useState<Prediction[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState<SortField>("probability");
    const [sortAsc, setSortAsc] = useState(false);
    const [page, setPage] = useState(0);
    const pageSize = 25;

    useEffect(() => {
        fetch("/data/vus_predictions.json")
            .then((res) => res.json())
            .then((d: Prediction[]) => {
                setData(d.filter((p) => p.rank === 1));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Combine internal search with external filter from chart click
    const activeSearch = externalFilter || search;

    const filtered = useMemo(() => {
        let result = data;
        if (activeSearch.trim()) {
            const q = activeSearch.toLowerCase();
            result = result.filter(
                (p) =>
                    p.variant_id.toLowerCase().includes(q) ||
                    formatVariantId(p.variant_id).toLowerCase().includes(q) ||
                    p.phenotype.toLowerCase().includes(q)
            );
        }
        result = [...result].sort((a, b) => {
            const va = a[sortField];
            const vb = b[sortField];
            const cmp = va < vb ? -1 : va > vb ? 1 : 0;
            return sortAsc ? cmp : -cmp;
        });
        return result;
    }, [data, activeSearch, sortField, sortAsc]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

    useEffect(() => {
        setPage(0);
    }, [activeSearch]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortAsc(!sortAsc);
        } else {
            setSortField(field);
            setSortAsc(false);
        }
    };

    // CSV export of currently filtered data
    const exportCSV = useCallback(() => {
        const header = "Variant,Phenotype,Probability\n";
        const rows = filtered
            .map(
                (p) =>
                    `${formatVariantId(p.variant_id)},${p.phenotype},${formatProbability(p.probability)}`
            )
            .join("\n");
        const blob = new Blob([header + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "mitograph_vus_predictions.csv";
        a.click();
        URL.revokeObjectURL(url);
    }, [filtered]);

    if (loading) {
        return (
            <div className="flex h-[300px] items-center justify-center rounded-xl border border-border bg-surface">
                <div className="flex items-center gap-3 text-muted">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                    Loading predictions...
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-surface">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                    <h2 className="text-base font-semibold">VUS Predictions</h2>
                    <p className="text-xs text-muted">
                        Top-1 phenotype link per VUS variant •{" "}
                        {filtered.length} of {data.length} shown
                        {externalFilter && (
                            <span className="ml-1 text-accent">
                                • Filtered by chart selection
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            placeholder="Search variant or phenotype..."
                            value={externalFilter ? formatVariantId(externalFilter) : search}
                            onChange={(e) => setSearch(e.target.value)}
                            disabled={!!externalFilter}
                            className="rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 w-64 disabled:opacity-50"
                        />
                        {search && !externalFilter && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                    {/* Export */}
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                        title="Download filtered data as CSV"
                    >
                        <Download className="h-3.5 w-3.5" />
                        CSV
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
                            <th className="px-5 py-3 font-medium">
                                <button
                                    onClick={() => handleSort("variant_id")}
                                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                                >
                                    Variant
                                    <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </th>
                            <th className="px-5 py-3 font-medium">
                                <button
                                    onClick={() => handleSort("phenotype")}
                                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                                >
                                    Predicted Phenotype
                                    <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </th>
                            <th className="px-5 py-3 font-medium w-56">
                                <button
                                    onClick={() => handleSort("probability")}
                                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                                >
                                    Confidence
                                    <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paged.map((pred, i) => {
                            const pct = pred.probability * 100;
                            const barColor =
                                pct > 95
                                    ? "bg-red-500"
                                    : pct > 85
                                        ? "bg-amber-500"
                                        : pct > 50
                                            ? "bg-blue-500"
                                            : "bg-zinc-500";
                            const textColor =
                                pct > 95
                                    ? "text-red-400"
                                    : pct > 85
                                        ? "text-amber-400"
                                        : pct > 50
                                            ? "text-blue-400"
                                            : "text-zinc-400";

                            return (
                                <tr
                                    key={`${pred.variant_id}-${pred.phenotype_idx}-${i}`}
                                    className="table-row-hover border-b border-border/50 last:border-b-0"
                                >
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            {pred.probability > 0.85 && (
                                                <AlertTriangle className="h-4 w-4 shrink-0 text-flagged animate-subtle-pulse" />
                                            )}
                                            <code className="rounded bg-background/50 px-2 py-0.5 text-xs font-mono text-foreground">
                                                {formatVariantId(pred.variant_id)}
                                            </code>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-muted">{pred.phenotype}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            {/* Progress bar */}
                                            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${barColor} transition-all`}
                                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                                />
                                            </div>
                                            {/* Label */}
                                            <span
                                                className={`text-xs font-semibold tabular-nums w-14 text-right ${textColor}`}
                                            >
                                                {formatProbability(pred.probability)}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {paged.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-5 py-10 text-center text-muted">
                                    No variants match your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted">
                    <span>
                        Page {page + 1} of {totalPages}
                    </span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                            className="rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-surface-hover disabled:opacity-30"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                            disabled={page >= totalPages - 1}
                            className="rounded-md border border-border px-3 py-1.5 transition-colors hover:bg-surface-hover disabled:opacity-30"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
