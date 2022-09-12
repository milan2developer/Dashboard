import * as d3 from "d3";
import { schemeCategory10 } from "d3";

export interface config {
    id: string;
    rawData: any[];
}
export class barChartStacked {
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
    y: any = d3.scaleLinear();
    chartData: any;
    subgroups: any;
    groups: any;
    color: any;

    constructor(public config: config) {
        this.id = this.config.id;
        this.rawData = this.config.rawData;
        this.loadData();
    }

    loadData() {
        this.chartData = [];
        if (this.rawData) {
            this.subgroups = this.rawData.columns.slice(1);
            this.groups = this.rawData.map((ele) => ele.group);
            this.chartData = d3.stack().keys(this.subgroups)(this.rawData);
        }

        this.createEle();
        this.drawChart();
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
        // const maxvalue = d3.max(this.chartData, (e) => e["value"]);

        this.x.range([0, newWidth]).domain(this.groups).padding(0.4);
        this.y.range([newHeight, 0]).domain([0, 300000]);

        this.xAxisEle.call(d3.axisBottom(this.x));
        this.yAXisEle.call(d3.axisLeft(this.y).tickSizeOuter(0).ticks(10));

        this.color = d3
            .scaleOrdinal()
            .domain(this.subgroups)
            .range(schemeCategory10);
    }

    drawChart() {
        const selectParent = this.mainEle
            .selectAll("g.parentG")
            .data(this.chartData);
        const enterParent = selectParent
            .enter()
            .append("g")
            .attr("class", "parentG");
        enterParent.merge(selectParent).attr("fill", (d) => {
            return this.color(d.key);
        });
        selectParent.exit().remove();
        this.drawRect(enterParent);
    }

    drawRect(enterRectG) {
        const selectChild = enterRectG.selectAll("rect").data((d) => d);

        selectChild
            .enter()
            .append("rect")
            .merge(selectChild)
            .attr("x", (d) => {
                return this.x(d.data.group);
            })
            .attr("y", (d) => {
                return this.y(d[1]);
            })
            .attr("height", (d) => {
                return this.y(d[0]) - this.y(d[1]);
            })
            .attr("width", this.x.bandwidth())
            .on("mouseover", (event, d) => {
                this.mousOver(event, d);
            })
            .on("mouseout", (d) => {
                this.mouseout();
            });

        selectChild.exit().remove();
    }

    mousOver(event, d) {
        this.tooltipEle
            .style("opacity", 1)
            .html(
                d.data.group +
                    "<br>" +
                    "Freshar :" +
                    d.data["Freshar"] +
                    "<br>" +
                    "1 year Experience :" +
                    d.data[" 1 year Experience"] +
                    "<br>" +
                    "2 year experience :" +
                    d.data["2 year experience"] +
                    "<br>" +
                    "2 years - 5 years :" +
                    d.data["2 years - 5 years"] +
                    "<br>" +
                    "more than 5 years :" +
                    d.data["more than 5 years"]
            )
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
            .attr("transform", "rotate(-30)");
        this.yAXisEle.call(
            d3
                .axisLeft(this.y)
                .tickSizeOuter(0)
                .ticks(d3.min([this.width / 60, 12]))
        );
        this.mainEle
            .selectAll("g.parentG")
            .selectAll("rect")
            .attr("x", (d) => {
                return this.x(d.data.group);
            })
            .attr("y", (d) => {
                return this.y(d[1]);
            })
            .attr("height", (d) => {
                return this.y(d[0]) - this.y(d[1]);
            })
            .attr("width", this.x.bandwidth());
    }
}
