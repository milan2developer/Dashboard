import * as d3 from "d3";

export interface config {
    id: string;
    rawData: any[];
}
export class TreeLayout {
    id;
    rawData;
    width;
    Data;
    height;
    margin = { top: 50, right: 50, bottom: 100, left: 50 };
    svg;
    mainEle: any;
    tooltipEle: any;
    chartData: any;
    color = d3.scaleOrdinal(d3.schemeCategory10);
    i = 0;
    duration = 750;
    root;
    rectSize = {
        width: 150,
        height: 50,
    };
    tree;
    diagonal;
    zoom;
    svgZoom: any;
    actualSvg: any;

    constructor(public config: config) {
        this.id = this.config.id;
        this.loadData();
    }

    loadData() {
        d3.json("./assets/data.json").then((response) => {
            this.chartData = response;
            this.createEle();
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
        this.zoom = d3
            .zoom()
            .scaleExtent([0, 8])
            .on("zoom", (event) => this.zoomed(event));
        this.svg = d3
            .select("#" + this.id)
            .append("svg")
            .attr("id", "main")
            .attr("width", this.width)
            .attr("height", this.height)
            .call(this.zoom);

        this.svgZoom = this.svg.append("g").attr("class", "svgZoom");
        this.actualSvg = this.svgZoom.append("g").attr("class", "actualsvg");
        this.tree = d3
            .tree()
            .size([this.height, this.width])
            .nodeSize([this.rectSize.width * 2, this.rectSize.height * 2]);

        this.root = d3.hierarchy(this.chartData.root, (d) => {
            return d.children;
        });
        this.root.x0 = this.width / 2;
        this.root.y0 = 0;

        this.drawchart(this.root, () => {
            const n = this.actualSvg.node().getBBox();
            const translate = {};
            n.height = n.height + 50;
            n.width = n.width + 50;
            n.x = n.x - 25;
            n.y = n.y - 25;
            translate["scale"] = Math.min(
                this.height / n.height,
                this.width / n.width
            );
            translate["translate"] = [
                -n.x * translate["scale"] +
                    this.width / 2 -
                    (n.width / 2) * translate["scale"],
                -n.y * translate["scale"] +
                    this.height / 2 -
                    (n.height / 2) * translate["scale"],
            ];
            this.svgZoom
                .transition()
                .duration(this.duration)
                .attr(
                    "transform",
                    "translate(" +
                        translate["translate"][0] +
                        "," +
                        translate["translate"][1] +
                        ")scale(" +
                        translate["scale"] +
                        ")"
                );
        });
    }

    zoomed = (event) => {
        this.svgZoom.attr("transform", event.transform);
    };

    drawchart(source, func) {
        var treeData = this.tree(this.root);
        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        nodes.forEach((d) => {
            d.y = d.depth * (this.rectSize.height * 2);
        });
        let max_height: any = d3.max(nodes, (d) => {
            if (d["y"] < 0) {
                return d["y"] * -1;
            }
            return d["y"];
        });
        let max_width: any = d3.max(nodes, (d) => {
            if (d["x"] < 0) {
                return d["x"] * -1;
            }
            return d["x"];
        });
        max_height = max_height + this.margin.top + this.margin.bottom;
        max_width = max_width * 2 + this.margin.left + this.margin.right;

        nodes.forEach((d) => {
            d.y = d.depth * (this.rectSize.height * 3);
        });

        var node = this.actualSvg.selectAll("g.node").data(nodes, (d) => {
            return d.id || (d.id = ++this.i);
        });

        var nodeEnter = node
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", (d) => {
                return "translate(" + source.x0 + "," + source.y0 + ")";
            })
            .on("click", (event, d) => this.click(d));

        nodeEnter
            .append("svg:rect")
            .attr("width", this.rectSize.width)
            .attr("height", this.rectSize.height)
            .attr("x", () => {
                return -(this.rectSize.width / 2);
            })
            .attr("y", 0)
            .style("fill", (d) => {
                return this.color(d.data.number);
            })
            .attr("ry", 10);

        nodeEnter
            .append("text")
            .attr("y", this.rectSize.height / 2)
            .text((d) => {
                return Math.random() * 1000000000;
            })
            .style("text-anchor", "middle")
            .style("dominant-baseline", "Central");

        var nodeUpdate = nodeEnter.merge(node);

        nodeUpdate
            .transition()
            .duration(this.duration)
            .attr("transform", (d) => {
                return "translate(" + d.x + "," + d.y + ")";
            });

        nodeUpdate
            .select("text")
            .style("fill-opacity", 1)
            .style("pointer-events", "none");

        nodeUpdate
            .select("rect")
            .style("fill-opacity", 1)
            .attr("stroke", (d, i) => {
                return this.color(d.data.number);
            })
            .style("fill", "white");

        var nodeExit = node
            .exit()
            .transition()
            .duration(this.duration)
            .attr("transform", (d) => {
                return "translate(" + source.x + "," + source.y + ")";
            })
            .remove();

        nodeExit.select("text").style("fill-opacity", 1e-6);

        var link = this.actualSvg.selectAll("path.link").data(links, (d) => {
            return d.id;
        });

        var linkEnter = link
            .enter()
            .insert("path", "g")
            .attr("class", "link")
            .style("stroke", (d) => {
                return this.color(d.parent.data.number);
            })
            .attr("d", (d) => {
                var o = { x: source.x0, y: source.y0 };
                return diagonal(o, o);
            })
            .attr("fill", "none");

        var linkUpdate = linkEnter.merge(link);

        linkUpdate
            .transition()
            .duration(this.duration)
            .attr("d", (d) => {
                return diagonal(d, d.parent);
            });

        var linkExit = link
            .exit()
            .transition()
            .duration(this.duration)
            .attr("d", (d) => {
                var o = { x: source.x, y: source.y };
                return diagonal(o, o);
            })
            .remove();

        nodes.forEach((d) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        function diagonal(s, d) {
            let path = `M ${s.x} ${s.y} 
            C ${(s.x + d.x) / 2} ${s.y},
              ${(s.x + d.x) / 2} ${d.y},
              ${d.x} ${d.y}`;

            return path;
        }

        if (typeof func === "function") {
            setTimeout(function () {
                func();
            }, this.duration);
        }
    }
    click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        this.drawchart(d, "");
    }

    resizeChart() {
        this.width =
            d3.select("#" + this.id).node()["clientWidth"] -
            (this.margin.left + this.margin.right);
        this.height =
            d3.select("#" + this.id).node()["clientHeight"] -
            (this.margin.top + this.margin.bottom);
        this.svg = d3
            .select("#" + this.id)
            .select("svg")
            .attr("width", this.width)
            .attr("height", this.height);
        this.drawchart(this.root, () => {
            const n = this.actualSvg.node().getBBox();
            const translate = {};
            n.height = n.height + 50;
            n.width = n.width + 50;
            n.x = n.x - 25;
            n.y = n.y - 25;
            translate["scale"] = Math.min(
                this.height / n.height,
                this.width / n.width
            );
            translate["translate"] = [
                -n.x * translate["scale"] +
                    this.width / 2 -
                    (n.width / 2) * translate["scale"],
                -n.y * translate["scale"] +
                    this.height / 2 -
                    (n.height / 2) * translate["scale"],
            ];
            this.svgZoom
                .transition()
                .duration(this.duration)
                .attr(
                    "transform",
                    "translate(" +
                        translate["translate"][0] +
                        "," +
                        translate["translate"][1] +
                        ")scale(" +
                        translate["scale"] +
                        ")"
                );
        });
    }
}
