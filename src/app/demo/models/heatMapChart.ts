import * as d3 from "d3";
import { schemeCategory10 } from "d3";

export interface config {
    id: string;
    rawData: any[];
}
export class HeatMapChart {
    id;
    rawData;
    width;
    Data;
    height;
    margin = { top: 10, right: 10, bottom: 50, left: 50 };
    svg;
    xAxisEle: any;
    yAXisEle: any;
    mainEle: any;
    tooltipEle: any;
    x: any = d3.scaleBand();
    y: any = d3.scaleBand();
    chartData: any;
    keys: any;
    color: any;
    Groups: any;
    Vars: any;

    constructor(public config: config) {
        this.id = this.config.id;
        this.rawData = this.config.rawData;
        this.loadData();
    }

    loadData() {
        this.chartData = [];
        d3.csv("assets/heatmap_data.csv").then((data) => {
            this.chartData = data;
            this.Groups = Array.from(
                new Set(this.chartData.map((d) => d.group))
            );
            this.Vars = Array.from(
                new Set(this.chartData.map((d) => d.variable))
            );
            this.createEle();
        });
    }

    createEle() {
        d3.select("#" + this.id)
            .selectAll("svg")
            .remove();
        this.width = d3.select("#" + this.id).node()["clientWidth"];
        this.height = d3.select("#" + this.id).node()["clientHeight"];

        this.svg = d3
            .select("#" + this.id)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g")
            .attr(
                "transform",
                "translate(" + this.margin.left + "," + this.margin.top + ")"
            );
        this.xAxisEle = this.svg
            .append("g")
            .style("font-size", 15)
            .attr("class", "axis axisX")
            .attr(
                "transform",
                "translate(0," +
                    (this.height - (this.margin.top + this.margin.bottom)) +
                    ")"
            );

        this.yAXisEle = this.svg
            .append("g")
            .style("font-size", 15)
            .attr("class", "axis axisY")
            .attr("transform", "translate(0,0)");

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

        this.drawAxis();
    }

    drawAxis() {
        const newWidth = this.width - (this.margin.left + this.margin.right);
        const newHeight = this.height - (this.margin.top + this.margin.bottom);

        this.x.range([0, newWidth]).domain(this.Groups).padding(0.05);
        this.y.range([newHeight, 0]).domain(this.Vars).padding(0.05);

        this.xAxisEle.call(d3.axisBottom(this.x).tickSize(0));
        this.yAXisEle.call(d3.axisLeft(this.y).tickSize(0));

        this.color = d3
            .scaleSequential()
            .interpolator(d3.interpolateBlues)
            .domain([1, 100]);

        this.drawChart();
    }

    drawChart() {
        const selectParent = this.svg
            .selectAll("rect")
            .data(this.chartData, (d) => {
                return d.group + ":" + d.variable;
            });

        selectParent
            .enter()
            .append("rect")
            .merge(selectParent)
            .attr("x", (d) => {
                return this.x(d.group);
            })
            .attr("y", (d) => {
                return this.y(d.variable);
            })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", this.x.bandwidth())
            .attr("height", this.y.bandwidth())
            .style("fill", (d) => {
                return this.color(d.value);
            })
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8)
            .on("mouseover", (event, d) => {
                this.tooltipEle
                    .style("opacity", 1)
                    .html("The exact value of<br>this cell is: " + d.value);
            })
            .on("mouseout", (event) => {
                this.tooltipEle.style("opacity", 0);
            })
            .on("mousemove", (event, d) => {
                this.tooltipEle
                    .style("top", event.layerY + 10 + "px")
                    .style("left", event.layerX + 10 + "px");
            });
    }

    resizeChart() {
        this.width = d3.select("#" + this.id).node()["clientWidth"];
        this.height = d3.select("#" + this.id).node()["clientHeight"];

        this.svg = d3
            .select("#" + this.id)
            .select("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .select("g")
            .attr(
                "transform",
                "translate(" + this.margin.left + "," + this.margin.top + ")"
            );

        const newWidth = this.width - (this.margin.left + this.margin.right);
        const newHeight = this.height - (this.margin.top + this.margin.bottom);
        this.xAxisEle.attr("transform", "translate(0," + newHeight + ")");
        this.x.range([0, newWidth]);
        this.y.range([newHeight, 0]);
        this.xAxisEle.call(d3.axisBottom(this.x));
        this.xAxisEle
            .selectAll(".tick")
            .select("text")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-50)");
        this.yAXisEle.call(d3.axisLeft(this.y));
        this.svg
            .selectAll("rect")
            .attr("x", (d) => {
                return this.x(d.group);
            })
            .attr("y", (d) => {
                return this.y(d.variable);
            })
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", this.x.bandwidth())
            .attr("height", this.y.bandwidth());
    }
}
