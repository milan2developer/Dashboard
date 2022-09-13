import * as d3 from "d3";

export interface config {
    id: string;
    rawData: any[];
}
export class HierarchicalEdgeChart {
    id;
    rawData;
    width;
    Data;
    height;
    margin = { top: 10, right: 10, bottom: 40, left: 50 };
    svg;
    mainEle: any;
    chartData: any;
    color: any = d3.scaleOrdinal().range(d3.schemeCategory10);
    tooltip: any;
    radius;
    curveBeta: 0.65;
    cluster;
    innerRadius;
    line;
    root;
    link;
    timeout;
    colorin = "#00f";
    colorout = "#f00";
    colornone = "#ccc";

    constructor(public config: config) {
        console.log();

        this.id = this.config.id;
        this.rawData = this.config.rawData;
        this.loadData();
    }
    loadData() {
        this.chartData = this.rawData;
        this.createEle();
        this.drawChart();
    }

    createEle() {
        const parentwidth = d3.select("#" + this.id).node()["clientWidth"];
        const parentheight = d3.select("#" + this.id).node()["clientHeight"];
        this.width = Math.min(parentwidth, parentheight);
        d3.select("#" + this.id)
            .selectAll("svg")
            .remove();
        this.svg = d3
            .select("#" + this.id)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.width)
            .attr("viewBox", [
                -this.width / 2,
                -this.width / 2,
                this.width,
                this.width,
            ])
            .append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10);
        this.radius = this.width / 2;
        this.innerRadius = this.radius - 120;
        this.cluster = d3.cluster().size([this.radius, this.innerRadius]);

        this.drawChart();
    }

    drawChart() {
        this.line = d3
            .lineRadial()
            .curve(d3.curveBundle.beta(0.85))
            .radius((d) => d["y"])
            .angle((d) => d["x"]);

        const newData = this.hierarchy(
            JSON.parse(JSON.stringify(this.chartData))
        );
        this.color.domain(newData.children.map((c) => c.name));
        this.root = this.cluster(this.bilink(d3.hierarchy(newData)));

        const parentG = this.svg
            .selectAll("g.parentG")
            .data(this.root.leaves());

        parentG.exit().remove();
        const enterParentG = parentG
            .enter()
            .append("g")
            .attr("class", "parentG")
            .attr("id", (d) => this.Getid(d));
        enterParentG.append("text").attr("class", "text");
        const updateParentG = enterParentG.merge(parentG);
        updateParentG.attr(
            "transform",
            (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`
        );

        updateParentG
            .selectAll(".text")
            .attr("id", (d) => this.Getid(d))
            .attr("dy", "0.31em")
            .attr("x", (d) => (d.x < Math.PI ? 6 : -6))
            .attr("text-anchor", (d) => (d.x < Math.PI ? "start" : "end"))
            .attr("transform", (d) => (d.x >= Math.PI ? "rotate(180)" : null))
            .text((d) => {
                return d.data.name;
            })
            .each(function (d) {
                d.text = this;
            })
            .on("mouseover", (event, d) => {
                this.overed(event, d);
            })
            .on("mouseout", (event, d) => {
                this.outed(event, d);
            })
            .call((text) =>
                text.append("title").text(
                    (d) => `${this.Getid(d, " ")}

            ${
                d.outgoing && d.outgoing.length
                    ? this.getPathData(d, "outgoing").length
                    : "0"
            } outgoing
            ${
                d.incoming && d.incoming.length
                    ? this.getPathData(d, "incoming").length
                    : "0"
            } incoming`
                )
            );

        const pathG = this.svg.selectAll("g.pathG").data([1]);
        pathG.exit().remove();
        const enterPathG = pathG.enter().append("g");

        const updatePathG = enterPathG
            .merge(pathG)
            .attr("class", "pathG")
            .attr("stroke", this.colornone)
            .attr("fill", "none");
        const a = this.root
            .leaves()
            .flatMap((leaf) => leaf.outgoing)
            .filter((v, i) => {
                return v[0].data.Label === v[1].data.Label;
            });

        this.link = updatePathG.selectAll("path.childPath").data(a);
        this.link.exit().remove();
        this.link
            .enter()
            .append("path")
            .merge(this.link)
            .attr("class", "childPath")
            .attr("id", (d) => this.Getid(d[0]))
            .style("mix-blend-mode", "multiply")
            .attr("d", ([i, o]) => {
                return this.line(i.path(o));
            })
            .attr("stroke", (d) => {
                return this.color(d[0].data.Label);
            })
            .each(function (d) {
                d.path = this;
            });
    }

    resizeChart() {
        const parentwidth = d3.select("#" + this.id).node()["clientWidth"];
        const parentheight = d3.select("#" + this.id).node()["clientHeight"];
        this.width = Math.min(parentwidth, parentheight);
        this.svg = d3
            .select("#" + this.id)
            .select("svg")
            .attr("width", this.width)
            .attr("height", this.width)
            .attr("viewBox", [
                -this.width / 2,
                -this.width / 2,
                this.width,
                this.width,
            ]);
        this.radius = this.width / 2;
        this.innerRadius = this.radius - 120;
        this.cluster = d3.cluster().size([this.radius, this.innerRadius]);
        this.svg
            .selectAll("g.parentG")
            .attr(
                "transform",
                (d) =>
                    `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`
            );
    }

    hierarchy(data, delimiter = ".") {
        let root;
        const map = new Map();
        data.forEach(function find(data) {
            const { name } = data;
            if (map.has(name)) return map.get(name);
            const i = name.lastIndexOf(delimiter);
            map.set(name, data);
            if (i >= 0) {
                find({
                    name: name.substring(0, i),
                    children: [],
                }).children.push(data);
                data.name = name.substring(i + 1);
            } else {
                root = data;
            }
            return data;
        });
        return root;
    }

    bilink(root) {
        const map = new Map(root.leaves().map((d) => [this.Getid(d), d]));
        for (const d of root.leaves()) {
            (d.incoming = []),
                (d.outgoing = d.data.imports
                    .filter((i) => map.get(i))
                    .map((i) => [d, map.get(i)]));
        }
        for (const d of root.leaves())
            for (const o of d.outgoing) o[1]?.incoming.push(o);
        return root;
    }

    Getid(node, pre = ".") {
        return `${node.parent ? this.Getid(node.parent) + pre : ""}${
            node.data.name
        }`;
    }

    overed(event, d) {
        this.link.style("mix-blend-mode", null);
        d3.select(event.target).attr("font-weight", "bold");
        d3.selectAll("path.childPath")
            .attr("stroke", null)
            .style("opacity", "0")
            .raise();

        let ll = d.data.Label;
        d3.selectAll(
            d.incoming.map((d) => {
                return d.path && d.path.id.split(".")[1] == ll ? d.path : "";
            })
        )
            .attr("stroke", this.color(d.data.Label))
            .style("opacity", "1")
            .raise();
        d3.selectAll(
            d.incoming.map(([v]) => {
                return v.text && v.data.Label == ll ? v.text : "";
            })
        )
            .attr("fill", this.color(d.data.Label))
            .style("opacity", "1")
            .attr("font-weight", "bold");
        d3.selectAll(
            d.outgoing.map((d) => {
                return d.path && d.path.id.split(".")[1] == ll ? d.path : "";
            })
        )
            .attr("stroke", this.color(d.data.Label))
            .style("opacity", "0.3")
            .raise();
        d3.selectAll(
            d.outgoing.map(([, v]) => {
                return v.text && v.data.Label == ll ? v.text : "";
            })
        )
            .attr("fill", this.color(d.data.Label))
            .style("opacity", "0.3")
            .attr("font-weight", "bold");
    }

    outed(event, d) {
        this.link.style("mix-blend-mode", "multiply");
        d3.select(event.target).attr("font-weight", null);
        let ll = d.data.Label;
        d3.selectAll(
            d.incoming.map((d) => {
                return d.path && d.path.id.split(".")[1] == ll ? d.path : "";
            })
        )
            .attr("stroke", null)
            .style("opacity", "1")
            .raise();
        d3.selectAll(
            d.incoming.map(([v]) => {
                return v.text && v.data.Label == ll ? v.text : "";
            })
        )
            .attr("fill", null)
            .style("opacity", "1")
            .attr("font-weight", null);
        d3.selectAll(
            d.outgoing.map((d) => {
                return d.path && d.path.id.split(".")[1] == ll ? d.path : "";
            })
        )
            .attr("stroke", null)
            .style("opacity", "1")
            .raise();
        d3.selectAll(
            d.outgoing.map(([, v]) => {
                return v.text && v.data.Label == ll ? v.text : "";
            })
        )
            .attr("fill", null)
            .style("opacity", "1")
            .attr("font-weight", null);

        d3.selectAll("path.childPath")
            .attr("stroke", () => {
                return this.color(d.data.Label);
            })
            .style("opacity", "1")
            .raise();
    }

    getPathData(d, path) {
        return d[path].filter((d) => {
            return d[0].data.Label === d[1].data.Label;
        });
    }

    getTextData(d, path = "incoming") {
        let ll = d.data.Label;
        return d[path].filter((d) => {
            return d.path && d.path.id.split(".")[1] == ll;
        });
    }
}
