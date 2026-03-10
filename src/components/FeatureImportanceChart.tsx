import { useEffect, useState } from "react";

interface FeatureImportance {
    feature: string;
    importance: number;
}

export default function FeatureImportanceChart() {
    const [data, setData] = useState<FeatureImportance[]>([]);

    useEffect(() => {
        fetch("/data/feature_importance.json")
            .then((res) => res.json())
            .then((json) => setData(json))
            .catch((err) => console.error("Error loading feature importance", err));
    }, []);

    if (data.length === 0) return <div className="animate-pulse h-32 bg-surface/50 rounded-lg"></div>;

    return (
        <div className="rounded-xl border border-border bg-surface/30 px-6 py-5 h-full">
            <div className="mb-4">
                <h3 className="text-sm font-semibold">Model Feature Diagnostics (14D)</h3>
                <p className="text-xs text-muted mt-0.5">
                    Linear projection weights from the GATv2Conv encoder (Avg % magnitude).
                </p>
            </div>
            <div className="space-y-3">
                {data.slice(0, 8).map((item) => (
                    <div key={item.feature} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-foreground/90">{item.feature}</span>
                            <span className="text-muted font-mono">{item.importance.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface border border-border/40">
                            <div
                                className="h-full rounded-full bg-accent/70 transition-all duration-1000"
                                style={{ width: `${item.importance * 2}%` }} // Scaled relative to highest ~8%
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
