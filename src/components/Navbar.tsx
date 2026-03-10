"use client";

import { Dna, Github, Activity } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                        <Dna className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">MitoGraph</h1>
                        <p className="text-xs text-muted">
                            Mitochondrial Variant Pathogenicity Explorer
                        </p>
                    </div>
                </div>

                {/* Status + Links */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                        <Activity className="h-3 w-3" />
                        <span>GATv2Conv • 8 Heads</span>
                    </div>
                    <a
                        href="https://github.com/Shreyan-A0I/spotNUMT"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                    >
                        <Github className="h-5 w-5" />
                    </a>
                </div>
            </div>
        </nav>
    );
}
