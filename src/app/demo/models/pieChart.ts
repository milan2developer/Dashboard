import * as d3 from "d3";
import { schemeCategory10 } from "d3";
import * as d3C from "d3-collection";

export interface config {
    id: string;
}
export class PieChart {
    id;
    rawData;
    width;
    Data;
    height;
    margin = { top: 10, right: 10, bottom: 50, left: 50 };
    svg;
    mainEle: any;
    tooltipEle: any;
    chartData: any;
    color: any;
    arc: any;
    radius: any;
    bandWidth: any = 50;
    sideMargin = 30;
    pie: any;
    legendDiv: any;
    legendG: any;

    constructor(public config: config) {
        this.id = this.config.id;
        this.loadData();
    }
    loadData() {
        this.chartData = { a: 6, b: 16, c: 20, d: 14, e: 19, f: 12 };
        this.createEle();
    }

    createEle() {
        this.width = d3.select("#" + this.id).node()["clientWidth"];
        this.height = d3.select("#" + this.id).node()["clientHeight"];
        this.radius = Math.min(this.width, this.height) / 2 - this.sideMargin;
        d3.select("#" + this.id)
            .selectAll("svg")
            .remove();
        this.svg = d3
            .select("#" + this.id)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g")
            .attr(
                "transform",
                "translate(" + this.width / 2 + "," + this.height / 2 + ")"
            );

        this.color = d3.scaleOrdinal().range(schemeCategory10);

        this.mainEle = this.svg.append("g").attr("class", "mainEle");
        this.tooltipEle = d3
            .select("#" + this.id)
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .attr("id", "tooltip")
            .style("text-align", "center")
            .style("position", "absolute")
            .style("font", "12px sans-serif")
            .style("pointer-events", "none")
            .style("background-color", "rgba(0,0,0,0.6)")
            .style("color", "#FFF")
            .style("border-radius", "5px")
            .style("padding", "5px");
        this.drawChart();
    }
    drawChart() {
        this.arc = d3
            .arc()
            .outerRadius(this.radius)
            .innerRadius(this.radius - this.bandWidth);

        this.pie = d3
            .pie()
            .sort(null)
            .value((d) => {
                return d["value"];
            });

        this.chartData = this.pie(d3C.entries(this.chartData));

        const selectPie = this.mainEle.selectAll("path").data(this.chartData);
        selectPie
            .enter()
            .append("path")
            .merge(this.mainEle)
            .transition()
            .duration(1000)
            .attr("d", d3.arc().innerRadius(0).outerRadius(this.radius))
            .attr("fill", (d) => this.color(d.data.key))
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 1);

        selectPie.exit().remove();
    }
    resizeChart() {
        this.width = d3.select("#" + this.id).node()["clientWidth"];
        this.height = d3.select("#" + this.id).node()["clientHeight"];
        d3.select("#" + this.id)
            .select("svg")
            .attr("width", this.width)
            .attr("height", this.height);
        this.svg.attr(
            "transform",
            "translate(" + this.width / 2 + "," + this.height / 2 + ")"
        );
        this.mainEle
            .selectAll("path")
            .attr("d", d3.arc().innerRadius(0).outerRadius(this.radius));
    }
}
