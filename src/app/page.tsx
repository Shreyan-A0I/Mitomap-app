"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StatsBar";
import FeatureImportanceChart from "@/components/FeatureImportanceChart";
import LatentSpaceViewer from "@/components/LatentSpaceViewer";
import NetworkGraph from "@/components/NetworkGraph";
import PredictionTable from "@/components/PredictionTable";

export default function Home() {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-[1600px] space-y-6 px-6 py-6">
        {/* Hero Description */}
        <section className="rounded-xl border border-border bg-surface/50 px-6 py-5">
          <h2 className="text-base font-semibold mb-1.5">
            AI-Powered Pathogenicity Prediction for Mitochondrial DNA Variants
          </h2>
          <p className="text-sm text-muted leading-relaxed max-w-4xl">
            Mutations in mitochondrial DNA cause rare neurodegenerative and
            metabolic diseases, but roughly 40% of known variants remain
            classified as &ldquo;Variants of Uncertain Significance&rdquo;
            (VUS) - meaning clinicians cannot tell patients whether their
            mutation is harmful. MitoGraph uses a Graph Attention Network
            trained on a knowledge graph of genes, diseases, and conservation
            data to predict which VUS are likely pathogenic. Explore the
            knowledge graph, inspect per-edge attention weights learned by the
            model, browse ranked predictions, and examine how variants cluster
            in the neural network&apos;s latent space.
          </p>
        </section>

        {/* Stats & Diagnostics Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <StatsBar />
          </div>
          <div className="h-full">
            <FeatureImportanceChart />
          </div>
        </div>

        {/* 1. Network Graph (Concrete biology first) */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-semibold">
              Mitochondrial Complex Graph
            </h2>
            <p className="text-xs text-muted">
              Force-directed layout: Complexes → Genes → Variants → Phenotypes
              • Edge thickness = GATv2Conv attention weight (α) • Click any
              node to inspect features • Drag nodes to explore
            </p>
          </div>
          <NetworkGraph onNodeClick={setSelectedVariant} />
        </section>

        {/* 2. Variant–Phenotype Predictions (Actionable) */}
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

        {/* 3. Latent Space Explorer (Abstract mathematical proof) */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-semibold">Latent Space Explorer</h2>
            <p className="text-xs text-muted">
              UMAP projection of GATv2Conv variant embeddings •{" "}
              <span className="text-flagged">★</span> = VUS in pathogenic
              cluster • Click a point to filter the table above
            </p>
          </div>
          <LatentSpaceViewer onPointClick={setSelectedVariant} />
        </section>

        {/* Credits & Data Sources */}
        <footer className="rounded-xl border border-border bg-surface/30 px-6 py-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
            Data Sources &amp; Acknowledgements
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 text-xs text-muted leading-relaxed">
            <div>
              <span className="font-medium text-foreground/80">MITOMAP</span>{" "}
              &mdash; Variant-to-phenotype linkages, functional classifications,
              and APOGEE pathogenicity probabilities.
            </div>
            <div>
              <span className="font-medium text-foreground/80">
                ClinVar (NCBI)
              </span>{" "}
              &mdash; Clinical observations and the primary set of Variants of
              Uncertain Significance (VUS).
            </div>
            <div>
              <span className="font-medium text-foreground/80">
                rCRS (NC_012920.1)
              </span>{" "}
              &mdash; 16,569 bp revised Cambridge Reference Sequence, the
              coordinate system for the knowledge graph.
            </div>
            <div>
              <span className="font-medium text-foreground/80">
                PhyloP (UCSC)
              </span>{" "}
              &mdash; 100-vertebrate evolutionary conservation scores used as
              structural features for the GATv2Conv encoder.
            </div>
          </div>
          <p className="mt-4 text-[10px] text-muted/60 border-t border-border/50 pt-3">
            MitoGraph • GATv2Conv + Hard Negative Mining • Built with PyG,
            Next.js, Plotly
          </p>
        </footer>
      </main>
    </div>
  );
}
