import * as d3 from "d3";
import * as d3Sankey from "d3-sankey";

export interface config {
    id: string;
    rawData: any[];
}
export class SankeyChart {
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
    chartData: any;
    units = "Widgets";
    sankey: any;
    color = d3.scaleOrdinal(d3.schemeCategory10);
    formatNumber;
    format;
    path: any;
    graphData;
    constructor(public config: config) {
        this.id = this.config.id;
        this.rawData = this.config.rawData;
        this.loadData();
    }

    loadData() {
        this.createEle();
        d3.json("assets/sankey.json").then((data) => {
            this.chartData = data;
            var nodeMap = {};

            this.chartData.nodes.forEach((x) => {
                nodeMap[x.name] = x;
            });
            this.chartData.links = this.chartData.links.map((x) => {
                return {
                    source: nodeMap[x.source],
                    target: nodeMap[x.target],
                    value: x.value,
                };
            });
            this.graphData = this.sankey(this.chartData);
            this.drawPath();
        });
    }

    createEle() {
        this.width =
            d3.select("#" + this.id).node()["clientWidth"] -
            (this.margin.left + this.margin.right);
        this.height =
            d3.select("#" + this.id).node()["clientHeight"] -
            (this.margin.top + this.margin.bottom);

        d3.select("#" + this.id)
            .selectAll("svg")
            .remove();

        this.svg = d3
            .select("#" + this.id)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g")
            .attr("transform", "translate(0,0)");

        this.formatNumber = d3.format(",.0f");
        this.format = (d) => {
            return this.formatNumber(d) + " " + this.units;
        };
        this.sankey = d3Sankey
            .sankey()
            .nodeWidth(36)
            .nodePadding(10)
            .size([this.width, this.height]);

        this.path = this.sankey.links();

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
    }

    drawPath() {
        const selectionPath = this.svg.selectAll("g.linkG").data([0]);
        const enterG = selectionPath.enter().append("g");
        enterG.merge(selectionPath).attr("class", "linkG");
        selectionPath.exit().remove();
        this.drawLine(enterG);

        const selectionNode = this.svg.selectAll("g.nodesG").data([0]);
        const enterNode = selectionNode.enter().append("g");
        enterNode.merge(selectionNode).attr("class", "nodesG");
        selectionNode.exit().remove();
        this.drawNodes(enterNode);
    }

    drawNodes(enterNode) {
        const selectChild = enterNode
            .selectAll("g.nodeG")
            .data(this.graphData.nodes);
        const enterNodeG = selectChild.enter().append("g");
        enterNodeG.merge(selectChild).attr("class", "nodeG");

        selectChild.exit().remove();

        const selectRect = enterNodeG
            .selectAll("rect.node")
            .data(this.graphData.nodes);

        var enterRect = selectRect.enter().append("rect");

        enterRect
            .merge(selectRect)
            .attr("class", "node")
            .attr("x", (d) => {
                return d.x0;
            })
            .attr("y", (d) => {
                return d.y0;
            })
            .attr("height", (d) => {
                return d.y1 - d.y0;
            })
            .attr("width", this.sankey.nodeWidth())
            .style("fill", (d) => {
                return (d.color = this.color(d.name.replace(/ .*/, "")));
            })
            .style("stroke", (d) => {
                return d3.rgb(d.color).darker(2);
            });

        enterRect
            .append("title")
            .text((d) => {
                return d.name + "\n" + this.format(d.value);
            })
            .attr("class", "TitleG");

        enterNodeG
            .append("text")
            .attr("class", "TextG")
            .attr("x", (d) => {
                return d.x0 - 6;
            })
            .attr("y", (d) => {
                return (d.y1 + d.y0) / 2;
            })
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            .text((d) => {
                return d.name;
            })
            .filter((d) => {
                return d.x0 < this.width / 2;
            })
            .attr("x", (d) => {
                return d.x1 + 6;
            })
            .attr("text-anchor", "start");
        selectRect.exit().remove();
    }

    drawLine(enterG) {
        const selectChild = enterG
            .selectAll("path.link")
            .data(this.graphData.links);

        const enterLines = selectChild.enter().append("path");
        enterLines
            .merge(selectChild)
            .attr("class", "link")
            .attr("d", d3Sankey.sankeyLinkHorizontal())
            .style("stroke-width", (d) => {
                return d.width;
            })
            .sort((a, b) => {
                return b.dy - a.dy;
            });

        enterLines.append("title").text((d) => {
            return (
                d.source.name +
                " → " +
                d.target.name +
                "\n" +
                this.format(d.value)
            );
        });

        selectChild.exit().remove();
    }

    resizeChart() {
        this.width =
            d3.select("#" + this.id).node()["clientWidth"] -
            (this.margin.left + this.margin.right);
        this.height =
            d3.select("#" + this.id).node()["clientHeight"] -
            (this.margin.top + this.margin.bottom);
        d3.select("#" + this.id)
            .select("svg")
            .attr("width", this.width)
            .attr("height", this.height);
        this.graphData = this.sankey
            .size([this.width, this.height])
            .update(this.chartData);
        console.log(this.sankey, this.width, this.height);

        this.svg
            .selectAll("g.linkG")
            .selectAll("path.link")
            .attr("d", d3Sankey.sankeyLinkHorizontal())
            .style("stroke-width", (d) => {
                return d.width;
            });
        this.svg
            .selectAll("g.nodesG")
            .selectAll("g.nodeG")
            .selectAll("text.node")
            .attr("x", (d) => {
                return d.x0;
            })
            .attr("y", (d) => {
                return d.y0;
            })
            .attr("height", (d) => {
                return d.y1 - d.y0;
            })
            .attr("width", this.sankey.nodeWidth());

        this.svg
            .selectAll("g.nodesG")
            .selectAll("g.nodeG")
            .selectAll("rect.TextG")
            .attr("x", (d) => {
                return d.x0 - 6;
            })
            .attr("y", (d) => {
                return (d.y1 + d.y0) / 2;
            })
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            .text((d) => {
                return d.name;
            })
            .filter((d) => {
                return d.x0 < this.width / 2;
            })
            .attr("x", (d) => {
                return d.x1 + 6;
            })
            .attr("text-anchor", "start");
    }
}
