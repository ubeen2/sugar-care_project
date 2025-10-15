// src/utils/plotly.js
export function applyPlotlyLayout(figLayout, dark) {
    return {
        ...figLayout,
        template: dark ? "plotly_dark" : "plotly_white",
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: {color: dark ? "#e6e9ef" : "#0f172a"},
        xaxis: {gridcolor: dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)"},
        yaxis: {gridcolor: dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)"},
        margin: {l: 6, r: 6, t: 6, b: 6},
    };
}
