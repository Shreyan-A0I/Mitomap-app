declare module "react-force-graph-2d" {
    import { Component } from "react";

    interface NodeObject {
        id?: string | number;
        x?: number;
        y?: number;
        vx?: number;
        vy?: number;
        fx?: number;
        fy?: number;
        [key: string]: unknown;
    }

    interface LinkObject {
        source?: string | number | NodeObject;
        target?: string | number | NodeObject;
        [key: string]: unknown;
    }

    interface GraphData {
        nodes: NodeObject[];
        links: LinkObject[];
    }

    interface ForceGraphProps {
        graphData?: GraphData;
        width?: number;
        height?: number;
        backgroundColor?: string;
        nodeLabel?: string | ((node: NodeObject) => string);
        nodeColor?: string | ((node: NodeObject) => string);
        nodeVal?: string | number | ((node: NodeObject) => number);
        nodeRelSize?: number;
        nodeCanvasObject?: (
            node: NodeObject,
            ctx: CanvasRenderingContext2D,
            globalScale: number
        ) => void;
        nodeCanvasObjectMode?: string | ((node: NodeObject) => string);
        linkColor?: string | ((link: LinkObject) => string);
        linkWidth?: number | ((link: LinkObject) => number);
        linkDirectionalParticles?: number | ((link: LinkObject) => number);
        linkDirectionalParticleWidth?: number;
        linkDirectionalParticleSpeed?: number;
        linkCurvature?: number;
        onNodeClick?: (node: NodeObject, event: MouseEvent) => void;
        onNodeHover?: (node: NodeObject | null, prevNode: NodeObject | null) => void;
        cooldownTicks?: number;
        warmupTicks?: number;
        d3AlphaDecay?: number;
        d3VelocityDecay?: number;
        dagMode?: string;
        dagLevelDistance?: number;
        enableZoomInteraction?: boolean;
        enablePanInteraction?: boolean;
        enableNodeDrag?: boolean;
    }

    export default class ForceGraph2D extends Component<ForceGraphProps> { }
}
