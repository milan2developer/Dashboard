import * as d3 from "d3";

export interface config {
    id: string;
    rawData: any[];
}
export class NetworkChart {
    id: any;
    color: any;
    width: any;
    height: any;
    label: { nodes: any[]; links: any[] };
    labelLayout: any;
    graphLayout: any;
    data: any;
    canvas: any;
    context: any;
    scaleFactor: any;
    radius: any;
    margin = { top: 50, right: 50, bottom: 100, left: 50 };
    adjlist: any[];
    transform: d3.ZoomTransform;
    chartData: any;

    constructor(public config: config) {
        this.id = this.config.id;
        this.color = d3.scaleOrdinal(d3.schemeCategory10);
        this.width =
            d3.select("#" + this.id).node()["clientWidth"] -
            (this.margin.left + this.margin.right);
        this.height =
            d3.select("#" + this.id).node()["clientHeight"] -
            (this.margin.top + this.margin.bottom);
        this.label = {
            nodes: [],
            links: [],
        };
        this.labelLayout = "";
        this.graphLayout = "";
        this.data = "";
        this.canvas = "";
        this.context = "";
        this.scaleFactor = 1.1;
        this.radius = 5;
        this.adjlist = [];

        this.transform = d3.zoomIdentity;
        this.loadData();
    }
    loadData() {
        d3.json("./assets/dataforce.json").then((graph) => {
            this.chartData = graph;
            graph["nodes"].forEach((d, i) => {
                this.label.nodes.push({ node: d });
                this.label.nodes.push({ node: d });
                this.label.links.push({
                    source: i * 2,
                    target: i * 2 + 1,
                });
            });
            this.labelLayout = d3
                .forceSimulation(this.label.nodes)
                .force("charge", d3.forceManyBody().strength(-50))
                .force(
                    "link",
                    d3.forceLink(this.label.links).distance(0).strength(1)
                );
            this.graphLayout = d3
                .forceSimulation(graph["nodes"])
                .force("charge", d3.forceManyBody().strength(-3000))
                .force(
                    "center",
                    d3.forceCenter(this.width / 2, this.height / 2)
                )
                .force("x", d3.forceX(this.width / 2).strength(1))
                .force("y", d3.forceY(this.height / 2).strength(1))
                .force(
                    "link",
                    d3
                        .forceLink(graph["links"])
                        .id((d) => {
                            return d["id"];
                        })
                        .distance(50)
                        .strength(1)
                )
                .on("tick", this.ticked.bind(this));

            graph["links"].forEach((d) => {
                this.adjlist[d.source.index + "-" + d.target.index] = true;
                this.adjlist[d.target.index + "-" + d.source.index] = true;
            });
            this.createCanvasEle();
            this.drawCanvas();
        });
    }

    drawCanvas() {
        this.context.save();
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.translate(this.transform.x, this.transform.y);
        this.context.scale(this.transform.k, this.transform.k);
        this.context.fillStyle = "#fff";
        this.context.rect(
            0,
            0,
            this.canvas.attr("width"),
            this.canvas.attr("height")
        );
        this.context.fill();
        this.drawCanvasLine();
        this.drawCanvasNodeAndLabel();
        this.context.restore();
    }

    drawCanvasLine() {
        this.chartData.links.forEach((d) => {
            this.context.beginPath();
            this.context.strokeStyle = "#aaa";
            this.context.moveTo(this.fixna(d.source.x), this.fixna(d.source.y));
            this.context.lineTo(this.fixna(d.target.x), this.fixna(d.target.y));
            this.context.stroke();
            this.context.closePath();
        });
    }

    drawCanvasNodeAndLabel() {
        this.chartData.nodes.forEach((d, i) => {
            this.context.beginPath();
            this.context.fillStyle = this.color(d.group);
            this.context.arc(
                this.fixna(d.x),
                this.fixna(d.y),
                this.radius,
                0,
                2 * Math.PI
            );
            this.context.fill();
            this.context.closePath();
            this.context.beginPath();
            this.context.font = "12px Arial";
            this.context.fillStyle = "#555";
            this.context.fillText(
                d.id,
                this.fixna(d.x) + 5,
                this.fixna(d.y) + 5
            );
            this.context.closePath();
        });
    }
    createCanvasEle() {
        this.canvas = d3
            .select("#" + this.id)
            .append("canvas")
            .attr("width", this.width)
            .attr("height", this.height);
        this.context = this.canvas.node().getContext("2d");
        d3.select(this.canvas.node())
            .call(
                d3
                    .drag()
                    .subject(this.dragsubject.bind(this))
                    .on("start", (event) => this.dragstarted(event))
                    .on("drag", (event) => this.dragged(event))
                    .on("end", (event) => this.dragended(event))
            )
            .call(
                d3
                    .zoom()
                    .scaleExtent([1 / 10, 8])
                    .on("zoom", (event) => this.zoomed(event))
            );
    }
    zoomed = (event) => {
        this.transform = event.transform;
        this.drawCanvas();
    };

    ticked() {
        this.labelLayout.alphaTarget(0.3).restart();
        this.drawCanvas();
    }

    fixna(x) {
        if (isFinite(x)) return x;
        return 0;
    }

    dragstarted = (event) => {
        event.sourceEvent.stopPropagation();
        if (!event.active) this.graphLayout.alphaTarget(0.3).restart();
        event.subject.fx = this.transform.invertX(event.x);
        event.subject.fy = this.transform.invertY(event.y);
    };

    dragsubject = (event) => {
        let i;

        let x = this.transform.invertX(event.x);
        let y = this.transform.invertY(event.y);
        let dx;
        let dy;
        for (i = this.chartData.nodes.length - 1; i >= 0; --i) {
            const node = this.chartData.nodes[i];
            dx = x - node.x;
            dy = y - node.y;
            if (dx * dx + dy * dy < this.radius * this.radius) {
                node.x = this.transform.applyX(node.x);
                node.y = this.transform.applyY(node.y);
                return node;
            }
        }
    };

    dragged = (event) => {
        event.subject.fx = this.transform.invertX(event.x);
        event.subject.fy = this.transform.invertY(event.y);
    };

    dragended = (event) => {
        if (!event.active) this.graphLayout.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    };
    resizeChart() {
        this.width =
            d3.select("#" + this.id).node()["clientWidth"] -
            (this.margin.left + this.margin.right);
        this.height =
            d3.select("#" + this.id).node()["clientHeight"] -
            (this.margin.top + this.margin.bottom);
        this.canvas = d3
            .select("#" + this.id)
            .select("canvas")
            .attr("width", this.width)
            .attr("height", this.height);

        this.drawCanvas();
    }
}
