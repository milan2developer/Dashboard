import * as d3 from "d3";

export interface config {
    id: string;
    rawData: any[];
}
export class MapConnection {
    id;
    rawData;
    width;
    Data;
    height;
    margin = { top: 50, right: 50, bottom: 100, left: 50 };
    svg;
    color: any;
    projection: any;
    link: any;
    path: any;
    chartData: any;
    zoom: any;
    mainEle: any;
    initialScale = 1 << 12;
    initialCenter = [-98 - 35 / 60, 39 + 50 / 60];
    d3Transform: any;
    tile: any;
    image: any;

    constructor(public config: config) {
        this.id = this.config.id;

        this.loadData();
    }

    loadData() {
        d3.json("assets/world-countries.json").then((data) => {
            this.chartData = data;
            this.createEle();
            this.drawChart();
        });
        this.link = [
            {
                type: "LineString",
                coordinates: [
                    [100, 60],
                    [-60, -30],
                ],
            },
            {
                type: "LineString",
                coordinates: [
                    [25, -25],
                    [-60, -30],
                ],
            },
            {
                type: "LineString",
                coordinates: [
                    [10, 60],
                    [75, 22],
                ],
            },
            {
                type: "LineString",
                coordinates: [
                    [-90, 34], //[longitude ,latitude] starting
                    [75, 22], //[longitude ,latitude] Ending
                ],
            },
        ];
    }

    createEle() {
        this.width =
            d3.select("#" + this.id).node()["clientWidth"] -
            (this.margin.left + this.margin.right);
        this.height =
            d3.select("#" + this.id).node()["clientHeight"] -
            (this.margin.bottom + this.margin.top);
        d3.select("#" + this.id)
            .selectAll("svg")
            .remove();
        this.svg = d3
            .select("#" + this.id)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        this.mainEle = this.svg.append("g");

        this.projection = d3
            .geoMercator()
            .center([0, 2])
            .scale(150)
            .translate([this.width / 2, (this.height / 2) * 1.3]);

        this.zoom = d3.zoom().on("zoom", (event) => this.zoomed(event));

        this.path = d3.geoPath().projection(this.projection);
        this.svg.call(this.zoom);
    }

    zoomed = (event: any) => {
        this.d3Transform = event.transform;
        this.mainEle.attr(
            "transform",
            "translate(" +
                this.d3Transform.x +
                "," +
                this.d3Transform.y +
                ")scale(" +
                this.d3Transform.k +
                ")"
        );
    };

    drawChart() {
        const selectPath = this.mainEle
            .selectAll("path")
            .data(this.chartData.features);
        selectPath
            .enter()
            .append("g")
            .append("path")
            .merge(selectPath)
            .attr("fill", "#b8b8b8")
            .attr("d", this.path)
            .style("stroke", "black")
            .style("stroke-width", 0.5)
            .style("fill", "rgb(255, 204, 204)");
        selectPath.exit().remove();

        const selectconnection = this.mainEle
            .selectAll("path.myPath")
            .data(this.link);

        selectconnection
            .enter()
            .append("path")
            .merge(selectconnection)
            .attr("d", (d) => {
                return this.path(d);
            })
            .attr("class", "myPath")
            .style("fill", "none")
            .style("stroke", "#000")
            .style("stroke-width", 1);
        selectconnection.exit().remove();
    }
    resizeChart() {
        this.width =
            d3.select("#" + this.id).node()["clientWidth"] -
            (this.margin.left + this.margin.right);
        this.height =
            d3.select("#" + this.id).node()["clientHeight"] -
            (this.margin.bottom + this.margin.top);
        d3.select("#" + this.id)
            .select("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        this.projection = d3
            .geoMercator()
            .center([0, 2])
            .scale(1 / (2 * Math.PI))
            .translate([this.width / 2, (this.height / 2) * 1.3]);

        this.mainEle.selectAll("path").attr("d", this.path);
        this.mainEle.selectAll("path.myPath").attr("d", (d) => {
            return this.path(d);
        });
    }
}
