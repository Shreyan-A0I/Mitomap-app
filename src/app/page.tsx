"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StatsBar";
import LatentSpaceViewer from "@/components/LatentSpaceViewer";
import NetworkGraph from "@/components/NetworkGraph";
import PredictionTable from "@/components/PredictionTable";

export default function Home() {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-[1600px] space-y-6 px-6 py-6">
        {/* Stats Overview */}
        <StatsBar />

        {/* Latent Space Explorer */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-semibold">Latent Space Explorer</h2>
            <p className="text-xs text-muted">
              UMAP projection of GATv2Conv variant embeddings •{" "}
              <span className="text-flagged">★</span> = VUS in pathogenic
              cluster • Click a point to filter the table below
            </p>
          </div>
          <LatentSpaceViewer onPointClick={setSelectedVariant} />
        </section>

        {/* Network Graph */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-semibold">
              Mitochondrial Complex Graph
            </h2>
            <p className="text-xs text-muted">
              Force-directed layout: Complexes → Genes → Variants → Phenotypes
              • Click a variant to filter the table • Drag nodes to explore
            </p>
          </div>
          <NetworkGraph onNodeClick={setSelectedVariant} />
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Variant–Phenotype Predictions
              </h2>
              <p className="text-xs text-muted">
                Top-ranked phenotype association per VUS • Hard negative mining +
                attention scoring •{" "}
                <span className="text-flagged">△</span> = probability &gt; 85%
              </p>
            </div>
            {selectedVariant && (
              <button
                onClick={() => setSelectedVariant(null)}
                className="rounded-lg border border-border bg-accent/10 px-3 py-1.5 text-xs text-accent transition-colors hover:bg-accent/20"
              >
                ✕ Clear Selection
              </button>
            )}
          </div>
          <PredictionTable externalFilter={selectedVariant} />
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-6 text-center text-xs text-muted">
          MitoGraph — Mitochondrial DNA Variant Pathogenicity Prediction •
          GATv2Conv + Hard Negative Mining • Built with PyG, Next.js, Plotly
        </footer>
      </main>
    </div>
  );
}
