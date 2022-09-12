import * as d3 from "d3";

export interface config {
    id: string;
    rawData: any[];
}
export class MultiLineChart {
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
    x: any = d3.scaleTime();
    y: any = d3.scaleLinear();
    chartData: any;
    color: any;
    line: any;

    constructor(public config: config) {
        this.id = this.config.id;
        this.rawData = this.config.rawData;
        this.loadData();
    }

    loadData() {
        this.chartData = [];
        if (this.rawData) {
            this.chartData = this.rawData;
            var parseDate = d3.timeParse("%Y");
            this.chartData.map((d) => {
                d.values.map((d) => {
                    d.date = parseDate(d.date);
                    d.price = +d.price;
                });
            });
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
        const maxValue = d3.max(this.chartData[0].values, (d) => d["price"]);
        this.x
            .range([0, newWidth])
            .domain(d3.extent(this.chartData[0].values, (d) => d["date"]));
        this.y.range([newHeight, 0]).domain([0, maxValue]);

        this.xAxisEle.call(d3.axisBottom(this.x));
        this.yAXisEle.call(d3.axisLeft(this.y).tickSizeOuter(0).ticks(10));
        this.color = d3.scaleOrdinal(d3.schemeCategory10);
    }
    drawChart() {
        const selectParent = this.mainEle
            .selectAll("g.LineG")
            .data(this.chartData);
        const enterParent = selectParent.enter().append("g");

        enterParent.merge(selectParent).attr("class", "LineG");
        selectParent.exit().remove();
        this.drawLine(enterParent);

        const selectParentcircle = this.mainEle
            .selectAll("g.circleG")
            .data(this.chartData);
        const enterParentCircle = selectParentcircle
            .enter()
            .append("g")
            .style("fill", (d, i) => this.color(i));
        enterParentCircle.merge(selectParentcircle).attr("class", "circleG");
        selectParentcircle.exit().remove();
        this.drawCircle(enterParentCircle);
    }
    drawLine(enterParent) {
        this.line = d3
            .line()
            .x((d) => this.x(d["date"]))
            .y((d) => this.y(d["price"]));

        const selectChild = enterParent
            .selectAll("path.line")
            .data(this.chartData);

        selectChild
            .enter()
            .append("path")
            .merge(selectChild)
            .attr("class", "line")
            .attr("d", (d) => this.line(d.values))
            .style("stroke", (d, i) => this.color(i))
            .style("opacity", "0.25")
            .style("fill", "none");
        selectChild.exit().remove();
    }
    drawCircle(enterParentCircle) {
        const selectCircleG = enterParentCircle
            .selectAll(".dot")
            .data((d) => d.values);
        selectCircleG
            .enter()
            .append("g")
            .append("circle")
            .merge(selectCircleG)
            .attr("class", "dot")
            .attr("cx", (d) => this.x(d.date))
            .attr("cy", (d) => this.y(d.price))
            .attr("r", "3")
            .style("opacity", "0.85");

        selectCircleG.exit().remove();
    }

    mousOver(event, d) {
        this.tooltipEle
            .style("opacity", 1)
            .html(d.name + ": " + d.value)
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
        this.line = d3
            .line()
            .x((d) => this.x(d["date"]))
            .y((d) => this.y(d["price"]));
        this.mainEle
            .selectAll("g.LineG")
            .selectAll("path.line")
            .attr("d", (d) => this.line(d.values));

        this.mainEle
            .selectAll("g.circleG")
            .selectAll(".dot")
            .attr("cx", (d) => this.x(d.date))
            .attr("cy", (d) => this.y(d.price));
    }
}
