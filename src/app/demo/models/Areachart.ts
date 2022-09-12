import * as d3 from "d3";
import { schemeCategory10 } from "d3";

export interface config {
    id: string;
    rawData: any[];
}
export class AreaChart {
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
    x: any = d3.scaleLinear();
    y: any = d3.scaleLinear();
    chartData: any;
    keys: any;
    color: any;

    constructor(public config: config) {
        this.id = this.config.id;
        this.rawData = this.config.rawData;
        this.loadData();
    }

    loadData() {
        this.chartData = [];
        if (this.rawData) {
            this.chartData = this.rawData;
            this.keys = this.rawData.columns.slice(1);
            this.chartData = d3.stack().keys(this.keys)(this.rawData);
        }
        this.createEle();
        this.drawLine();
    }

    createEle() {
        this.width = d3.select("#" + this.id).node()["clientWidth"];
        this.height = d3.select("#" + this.id).node()["clientHeight"];
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
                "translate(" + this.margin.left + "," + this.margin.top + ")"
            );
        this.xAxisEle = this.svg
            .append("g")
            .attr("class", "axis axisX")
            .attr(
                "transform",
                "translate(0," +
                    (this.height - (this.margin.top + this.margin.bottom)) +
                    ")"
            );

        this.yAXisEle = this.svg
            .append("g")
            .attr("class", "axis axisY")
            .attr("transform", "translate(0,0)");

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

        this.drawAxis();
    }

    drawAxis() {
        const newWidth = this.width - (this.margin.left + this.margin.right);
        const newHeight = this.height - (this.margin.top + this.margin.bottom);

        this.x.range([0, newWidth]).domain(
            d3.extent(this.rawData, function (d) {
                return d["year"];
            })
        );
        this.y.range([newHeight, 0]).domain([0, 200000]);

        this.xAxisEle.call(d3.axisBottom(this.x));
        this.yAXisEle.call(d3.axisLeft(this.y).tickSizeOuter(0).ticks(10));

        this.color = d3
            .scaleOrdinal()
            .domain(this.keys)
            .range(schemeCategory10);
    }

    drawLine() {
        const selectChild = this.mainEle.selectAll("path").data(this.chartData);
        selectChild
            .enter()
            .append("path")
            .merge(selectChild)
            .style("fill", (e) => this.color(e.key))
            .attr(
                "d",
                d3
                    .area()
                    .x((d, i) => this.x(d["data"].year))
                    .y0((d) => this.y(d[0]))
                    .y1((d) => this.y(d[1]))
            );
        selectChild.exit().remove();
    }

    mousOver(event, d) {
        this.tooltipEle
            .style("opacity", 1)
            .html(d.year + ": " + d.value)
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 28 + "px");
    }

    mouseout() {
        this.tooltipEle.style("opacity", 0);
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
        this.yAXisEle.call(
            d3
                .axisLeft(this.y)
                .tickSizeOuter(0)
                .ticks(d3.min([this.width / 60, 12]))
        );
        this.mainEle.selectAll("path").attr(
            "d",
            d3
                .area()
                .x((d, i) => this.x(d["data"].year))
                .y0((d) => this.y(d[0]))
                .y1((d) => this.y(d[1]))
        );
    }
}
