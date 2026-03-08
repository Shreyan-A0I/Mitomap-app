declare module "react-plotly.js" {
    import { Component } from "react";
    import Plotly from "plotly.js";

    interface PlotParams {
        data: Plotly.Data[];
        layout?: Partial<Plotly.Layout>;
        config?: Partial<Plotly.Config>;
        style?: React.CSSProperties;
        className?: string;
        useResizeHandler?: boolean;
        onInitialized?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
        onUpdate?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
        onHover?: (event: Plotly.PlotHoverEvent) => void;
        onClick?: (event: Plotly.PlotMouseEvent) => void;
    }

    export default class Plot extends Component<PlotParams> { }
}
