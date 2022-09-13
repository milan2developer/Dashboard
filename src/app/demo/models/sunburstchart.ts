import * as d3 from "d3";

export interface config {
    id: string;
    rawData: any[];
}
export class SunBurstChart {
    id;
    width;
    height;
    margin = { top: 10, right: 10, bottom: 40, left: 50 };
    svg;
    chartData: any;
    arc: any;
    radius: any;
    pathSelection: any;
    color: any;
    root: any;
    gElement: any;
    x;
    y;
    parent: any;
    selectPath: any;
    format: any;
    labelText: any;
    rawData: any;

    constructor(public config: config) {
        this.id = this.config.id;
        this.rawData = this.config.rawData;
        this.loadData();
    }
    loadData() {
        this.chartData = this.rawData;
        this.root = this.partition(this.chartData);
        this.root.each((d) => (d.current = d));
        this.createEle();
        this.drawChart();
    }

    createEle() {
        this.width =
            d3.select("#" + this.id).node()["clientWidth"] -
            (this.margin.left + this.margin.right);
        this.height =
            d3.select("#" + this.id).node()["clientHeight"] -
            (this.margin.top + this.margin.bottom);
        this.radius = this.height / 6;
        this.color = d3.scaleOrdinal(
            d3.quantize(
                d3.interpolateRainbow,
                this.chartData.children.length + 1
            )
        );
        d3.select("#" + this.id)
            .selectAll("svg")
            .remove();

        this.svg = d3
            .select("#" + this.id)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("font", "10px sans-serif");

        this.gElement = this.svg
            .append("g")
            .attr(
                "transform",
                `translate(${this.width / 2},${this.height / 2})`
            );

        this.arc = d3
            .arc()
            .startAngle((d) => d["x0"])
            .endAngle((d) => d["x1"])
            .padAngle((d) => Math.min((d["x1"] - d["x0"]) / 2, 0.005))
            .padRadius(this.radius * 1.5)
            .innerRadius((d) => d["y0"] * this.radius)
            .outerRadius((d) =>
                Math.max(d["y0"] * this.radius, d["y1"] * this.radius - 1)
            );
        this.format = d3.format(",d");
    }

    drawChart() {
        this.selectPath = this.gElement
            .append("g")
            .attr("class", "pathG")
            .selectAll("path")
            .data(this.root.descendants().slice(1));

        this.selectPath
            .enter()
            .append("path")
            .merge(this.selectPath)
            .attr("fill", (d) => {
                while (d.depth > 1) d = d.parent;
                return this.color(d.data.name);
            })
            .attr("fill-opacity", (d) =>
                this.arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0
            )
            .attr("pointer-events", (d) =>
                this.arcVisible(d.current) ? "auto" : "none"
            )
            .attr("d", (d) => this.arc(d.current));

        this.gElement
            .select("g.pathG")
            .selectAll("path")
            .filter((d) => d.children)
            .style("cursor", "pointer")
            .on("click", (event, d) => this.clicked(event, d));

        this.gElement
            .select("g.pathG")
            .selectAll("path")
            .append("title")
            .text(
                (d) =>
                    `${d
                        .ancestors()
                        .map((d) => d.data.name)
                        .reverse()
                        .join("/")}\n${this.format(d.value)}`
            );

        this.labelText = this.gElement
            .append("g")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .style("user-select", "none")
            .selectAll("text")
            .data(this.root.descendants().slice(1));

        this.labelText
            .enter()
            .append("text")
            .merge(this.labelText)
            .attr("dy", "0.35em")
            .attr("fill-opacity", (d) => +this.labelVisible(d.current))
            .attr("transform", (d) => this.labelTransform(d.current))
            .text((d) => d.data.name);

        this.parent = this.gElement
            .append("circle")
            .datum(this.root)
            .attr("r", this.radius)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", (event, d) => this.clicked(event, d));

        this.selectPath.exit().remove();
        this.labelText.exit().remove();
    }

    partition = (data) => {
        const root = d3
            .hierarchy(data)
            .sum((d) => d.value)
            .sort((a, b) => b.value - a.value);
        return d3.partition().size([2 * Math.PI, root.height + 1])(root);
    };

    arcVisible = (d) => {
        return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    };

    labelVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    labelTransform(d) {
        const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
        const y = ((d.y0 + d.y1) / 2) * this.radius;
        return `rotate(${x - 90}) translate(${y},0) rotate(${
            x < 180 ? 0 : 180
        })`;
    }

    clicked = (event, p) => {
        this.parent.datum(p.parent || this.root);

        this.root.each(
            (d) =>
                (d.target = {
                    x0:
                        Math.max(
                            0,
                            Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))
                        ) *
                        2 *
                        Math.PI,
                    x1:
                        Math.max(
                            0,
                            Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))
                        ) *
                        2 *
                        Math.PI,
                    y0: Math.max(0, d.y0 - p.depth),
                    y1: Math.max(0, d.y1 - p.depth),
                })
        );

        const t = this.gElement.transition().duration(750);

        this.gElement
            .select("g.pathG")
            .selectAll("path")
            .transition(t)
            .tween("data", (d) => {
                const i = d3.interpolate(d.current, d.target);
                return (t) => (d.current = i(t));
            })
            .attr("fill-opacity", (d) =>
                this.arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0
            )
            .attr("pointer-events", (d) =>
                this.arcVisible(d.target) ? "auto" : "none"
            )
            .filter((d) => {
                return this.arcVisible(d.target);
            })
            .attrTween("d", (d) => () => this.arc(d.current));

        this.gElement
            .selectAll("g")
            .selectAll("text")
            .transition(t)
            .tween("data", (d) => {
                const i = d3.interpolate(d.current, d.target);
                return (t) => (d.current = i(t));
            })
            .attr("fill-opacity", (d) => +this.labelVisible(d.target))
            .filter((d) => {
                return this.labelVisible(d.target);
            })
            .attrTween(
                "transform",
                (d) => () => this.labelTransform(d.current)
            );
    };

    resizeChart() {
        this.width =
            d3.select("#" + this.id).node()["clientWidth"] -
            (this.margin.left + this.margin.right);
        this.height =
            d3.select("#" + this.id).node()["clientHeight"] -
            (this.margin.top + this.margin.bottom);
        this.radius = this.height / 6;
        this.svg = d3
            .select("#" + this.id)
            .select("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        this.gElement = this.svg
            .select("g")
            .attr(
                "transform",
                `translate(${this.width / 2},${this.height / 2})`
            );
    }
}
