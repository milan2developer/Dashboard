import * as d3 from "d3";

export interface config {
    id: string;
}
export class DonutLegendChart {
    id;
    rawData;
    width;
    Data;
    height;
    margin = { top: 10, right: 10, bottom: 40, left: 50 };
    svg;
    mainEle: any;
    chartData: any;
    color = d3.scaleOrdinal(d3.schemeCategory10);
    arc: any;
    radius: any;
    bandWidth: any = 50;
    sideMargin = 50;
    pie: any;
    legend: any;
    outerArc: any;
    tooltipEle: any;
    pathSelection: any;
    legendRectSize = 10;
    legendSpacing = 3;
    constructor(public config: config) {
        this.id = this.config.id;
        this.loadData();
    }
    loadData() {
        this.chartData = [
            { label: "Assamese", count: 13 },
            { label: "Bengali", count: 83 },
            { label: "Bodo", count: 1.4 },
            { label: "Dogri", count: 2.3 },
            { label: "Gujarati", count: 46 },
            { label: "Hindi", count: 100 },
            { label: "Kannada", count: 38 },
            { label: "Kashmiri", count: 5.5 },
            { label: "Konkani", count: 5 },
        ];
        this.chartData.forEach((d) => {
            d.count = +d.count;
            d.enabled = true;
        });
        this.createEle();
        this.createLegends();
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

        this.arc = d3
            .arc()
            .innerRadius(this.radius - this.sideMargin)
            .outerRadius(this.radius);
        this.pie = d3
            .pie()
            .sort(null)
            .value((d) => {
                return d["count"];
            });

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
        this.pathSelection = this.svg
            .selectAll("path")
            .data(this.pie(this.chartData));

        this.pathSelection
            .enter()
            .append("path")
            .merge(this.pathSelection)
            .attr("d", this.arc)
            .attr("class", "arc")
            .attr("fill", (d) => {
                return this.color(d.data.label);
            })
            .each(function (d) {
                this._current - d;
            })
            .on("mouseover", (event, d) => {
                this.tooltipEle
                    .style("opacity", 1)
                    .html(d.data.label + ": " + d.data.count);
            })
            .on("mouseout", (event) => {
                this.tooltipEle.style("opacity", 0);
            })
            .on("mousemove", (event, d) => {
                this.tooltipEle
                    .style("top", event.layerY + 10 + "px")
                    .style("left", event.layerX + 10 + "px");
            });
        this.pathSelection.exit().remove();
    }

    createLegends() {
        const parentGofLegend = this.svg.selectAll("g.legendGroup").data([0]);
        const enterParentG = parentGofLegend
            .enter()
            .append("g")
            .attr("class", "legendGroup");
        enterParentG.merge(parentGofLegend);
        parentGofLegend.exit().remove();
        const selectLegendG = enterParentG
            .selectAll("g.legend")
            .data(this.color.domain());
        const enterG = selectLegendG
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => {
                const Newheight = this.legendRectSize + this.legendSpacing;
                const offset = (Newheight * this.color.domain().length) / 2;
                const horz = 15 * this.legendRectSize;
                const vert = i * Newheight - offset;

                return "translate(" + horz + "," + vert + ")";
            });
        enterG.merge(selectLegendG);
        selectLegendG.exit().remove();

        enterG
            .append("rect")
            .attr("width", this.legendRectSize)
            .attr("height", this.legendRectSize)
            .style("fill", this.color)
            .style("stroke", this.color)
            .on("click", (event, label) => {
                let rectEle = d3.select(event.target);
                let enabled = true;
                let totalEnabled = d3.sum(
                    this.chartData.map((d) => {
                        return d.enabled ? 1 : 0;
                    })
                );
                if (rectEle.attr("class") === "disabled") {
                    rectEle.attr("class", "");
                } else {
                    if (totalEnabled < 2) return;
                    rectEle.attr("class", "disabled");
                    enabled = false;
                }

                this.pie.value((d) => {
                    if (d.label === label) d.enabled = enabled;
                    return d.enabled ? d.count : 0;
                });

                this.pathSelection
                    .selectAll("path")
                    .transition()
                    .duration(2000)
                    .attrTween("d", function (d) {
                        var interpolate = d3.interpolate(this._current, d);
                        this._current = interpolate(0);
                        return function (t) {
                            return this.arc(interpolate(t));
                        };
                    });
                this.drawChart();
            });
        enterG
            .append("text")
            .attr("x", this.legendRectSize + this.legendSpacing)
            .attr("y", this.legendRectSize - this.legendSpacing)
            .text((d) => {
                return d;
            });
    }

    resizeChart() {
        this.width = d3.select("#" + this.id).node()["clientWidth"];
        this.height = d3.select("#" + this.id).node()["clientHeight"];
        this.radius = Math.min(this.width, this.height) / 2 - this.sideMargin;
        d3.select("#" + this.id)
            .select("svg")
            .attr("width", this.width)
            .attr("height", this.height);
        this.svg.attr(
            "transform",
            "translate(" + this.width / 2 + "," + this.height / 2 + ")"
        );
        this.svg
            .selectAll("g.legendGroup")
            .selectAll("g.legend")
            .attr("transform", (d, i) => {
                const Newheight = this.legendRectSize + this.legendSpacing;
                const offset = (Newheight * this.color.domain().length) / 2;
                const horz = 15 * this.legendRectSize;
                const vert = i * Newheight - offset;

                return "translate(" + horz + "," + vert + ")";
            });
    }
}
