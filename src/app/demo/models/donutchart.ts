import * as d3 from "d3";
import { schemeCategory10 } from "d3";
import * as d3C from "d3-collection";

export interface config {
    id: string;
}
export class DonutChart {
    id;
    rawData;
    width;
    Data;
    height;
    margin = { top: 10, right: 10, bottom: 40, left: 50 };
    svg;
    mainEle: any;
    chartData: any;
    color: any;
    arc: any;
    radius: any;
    bandWidth: any = 50;
    sideMargin = 30;
    pie: any;
    legendDiv: any;
    legendG: any;
    tooltipEle: any;
    outerArc: any;
    legendData = [];
    legendMargin = { top: 0, right: 0, bottom: 0, left: 0 }; // Legend margin
    filteredLegend = [];
    tooltip: any;
    pathSelection: any;
    constructor(public config: config) {
        this.id = this.config.id;
        this.loadData();
    }
    loadData() {
        d3.json("/assets/donutchart.json").then((response) => {
            this.chartData = response;
            this.legendData = this.chartData.map((d) => d.Room);
            this.createEle();
        });
        // d3.interval(, 3000);
    }

    createEle() {
        this.width = d3.select("#" + this.id).node()["clientWidth"];
        this.height =
            d3.select("#" + this.id).node()["clientHeight"] -
            this.margin.bottom;
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

        this.legendDiv = d3.select("#" + this.id).append("div");

        this.color = d3.scaleOrdinal().range(schemeCategory10);

        this.pie = d3
            .pie()
            .sort(null)
            .value((d) => {
                return d["value"];
            });

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
        this.updateLegend();
    }

    drawChart(interval?) {
        let self = this;
        const filteredData = this.chartData.map((d) => {
            const obj = {};
            obj["Room"] = d.Room;
            if (this.filteredLegend.indexOf(d.Room) !== -1) {
                obj["value"] = 0;
            } else {
                obj["value"] = d.Deficiency;
            }
            return obj;
        });
        //UPDATE PATTERN BEGIN

        this.arc = d3
            .arc()
            .outerRadius(this.radius)
            .innerRadius(this.radius - this.bandWidth);

        this.pathSelection = this.svg
            .selectAll("path")
            .data(this.pie(filteredData), (d) => d.data.Room)
            .each(function (d, i) {
                d3.select(this).transition().duration(0);
            });

        this.pathSelection
            .enter()
            .append("path")
            .merge(this.pathSelection)
            .on("mouseover", (event, d) => {
                this.mousOver(event, d);
            })
            .on("mouseout", (d) => {
                this.mouseout();
            })
            .attr("class", "arc")
            .style("fill", (d) => this.color(d.data.Room))
            .transition()
            .duration(interval ? interval : 500)
            .attrTween("d", function (d) {
                var i = d3.interpolate(this._current, d);
                this._current = i(0);
                return function (t) {
                    return self.arc(i(t));
                };
            });
        this.pathSelection
            .exit()
            .transition()
            .duration(interval ? interval : 500)
            .attrTween("d", function (d) {
                var i = d3.interpolate(this._current, d);
                return function (t) {
                    return self.arc(i(t));
                };
            })
            .remove();
    }

    resizeChart() {
        this.width = d3.select("#" + this.id).node()["clientWidth"];
        this.height =
            d3.select("#" + this.id).node()["clientHeight"] -
            this.margin.bottom;
        this.radius = Math.min(this.width, this.height) / 2 - this.sideMargin;
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

    updateLegend() {
        const legendParent = this.legendDiv
            .style("display", "flex")
            .style("flex-wrap", "wrap")
            .style("justify-content", "center")
            .style("margin-top", this.legendMargin.top + "px")
            .style("margin-right", this.legendMargin.right + "px")
            .style("margin-bottom", this.legendMargin.bottom + "px")
            .style("margin-left", this.legendMargin.left + "px");

        const legendSelection = legendParent
            .selectAll("div.legend")
            .data(this.chartData, (d) => [d.Room]);

        const newLegend = legendSelection
            .enter()
            .append("div")
            .attr("class", (d) => {
                return "legend " + d.Room + "";
            })
            .style("display", "flex")
            .style("margin-left", "10px")
            .style("margin-top", "5px")
            .style("align-items", "center");

        const RectSelection = newLegend
            .merge(legendSelection)
            .selectAll("div.rect")
            .data(
                (d) => [d.Room],
                (d, i) => i
            );

        const newRect = RectSelection.enter().append("div");

        newRect
            .merge(RectSelection)
            .attr("class", "rect")
            .style("width", "16px")
            .style("height", "16px")
            .style("display", "inline-block")
            .style("border-color", this.color)
            .style("border-style", "solid")
            .style("border-width", "2px")
            .style("margin-right", "5px")
            .style("background", this.color);

        const textSelection = newLegend
            .merge(legendSelection)
            .selectAll("span")
            .data((d) => [d.Room]);

        textSelection
            .enter()
            .append("span")
            .merge(textSelection)
            .attr("dy", "0.32em")
            .text((d) => [d]);

        textSelection.exit().remove();
        legendSelection.exit().remove();
        RectSelection.exit().remove();
    }

    chartUpdate(d) {
        this.legendDiv
            .selectAll("." + d.Room)
            .style("opacity", d.active ? "0.1" : "1");
    }

    mousOver(event, d) {
        this.tooltipEle
            .style("opacity", 1)
            .html(d.data.Room + ": " + d.value)
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 28 + "px");
    }

    mouseout() {
        this.tooltipEle.style("opacity", 0);
    }
}
