import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StatsBar";
import LatentSpaceViewer from "@/components/LatentSpaceViewer";
import PredictionTable from "@/components/PredictionTable";

export default function Home() {
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
              cluster • Zoom, pan, and hover to explore
            </p>
          </div>
          <LatentSpaceViewer />
        </section>

        {/* Predictions Table */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-semibold">
              Variant–Phenotype Predictions
            </h2>
            <p className="text-xs text-muted">
              Top-ranked phenotype association per VUS • Hard negative mining +
              attention scoring •{" "}
              <span className="text-flagged">△</span> = probability &gt; 85%
            </p>
          </div>
          <PredictionTable />
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
