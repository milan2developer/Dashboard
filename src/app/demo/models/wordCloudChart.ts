import * as d3 from "d3";
import * as d3Cloud from "d3-cloud";

export interface config {
    id: string;
    rawData: any[];
}
export class WordCloudChart {
    id;
    rawData;
    width;
    Data;
    height;
    margin = { top: 10, right: 10, bottom: 50, left: 50 };
    svg;
    mainEle: any;
    tooltipEle: any;
    chartData: any;
    color = d3.scaleOrdinal(d3.schemeCategory10);
    layout: any;
    myWords: any;

    constructor(public config: config) {
        this.id = this.config.id;
        this.rawData = this.config.rawData;
        this.loadData();
    }

    loadData() {
        this.chartData = [];
        this.myWords = [
            "Hello",
            "Everybody",
            "How",
            "Are",
            "You",
            "Today",
            "It",
            "Is",
            "A",
            "Lovely",
            "Day",
            "I",
            "Love",
            "Coding",
            "In",
            "My",
            "Van",
            "Mate",
            "Peace",
            "Love",
            "Keep",
            "The",
            "Good",
            "Work",
            "Make",
            "Love",
            "Not",
            "War",
            "Surfing",
            "R",
            "R",
            "Data-Viz",
            "Python",
            "Linux",
            "Programming",
            "Graph Gallery",
            "Biologie",
            "Resistance",
            "Computing",
            "Data-Science",
            "Reproductible",
            "GitHub",
            "Script",
            "Experimentation",
            "Talk",
            "Conference",
            "Writing",
            "Publication",
            "Analysis",
            "Bioinformatics",
            "Science",
            "Statistics",
            "Data",
            "Programming",
            "Wheat",
            "Virus",
            "Genotyping",
            "Work",
            "Fun",
            "Surfing",
            "R",
            "R",
            "Data-Viz",
            "Python",
            "Linux",
            "Programming",
        ];
        this.createEle();
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
            .attr(
                "transform",
                "translate(" + this.margin.left + "," + this.margin.top + ")"
            );
        this.layout = d3Cloud()
            .size([this.width, this.height])
            .words(
                this.myWords.map((d) => {
                    return { text: d };
                })
            )
            .padding(8)
            .rotate(-60)
            .fontSize(24)
            .on("end", (word) => this.drawChart(word));

        this.layout.start();
    }

    drawChart(word) {
        const selectParent = this.svg.selectAll("g.parentG").data([0]);
        const enterG = selectParent.enter().append("g");
        selectParent.exit().remove();
        enterG
            .merge(selectParent)
            .attr("class", "parentG")
            .attr(
                "transform",
                "translate(" +
                    this.layout.size()[0] / 2 +
                    "," +
                    this.layout.size()[1] / 2 +
                    ")"
            );

        const selectRect = enterG.selectAll("text.Name").data(word);

        selectRect
            .enter()
            .append("text")
            .merge(selectRect)
            .attr("class", "Name")
            .style("font-size", 24)
            .style("fill", (d) => this.color(d))
            .attr("text-anchor", "middle")
            .style("font-family", "Impact")
            .attr("transform", (d) => {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text((d) => {
                return d.text;
            });
        selectRect.exit().remove();
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
        this.svg.attr(
            "transform",
            "translate(" + this.margin.left + "," + this.margin.top + ")"
        );
        this.layout.size([this.width, this.height]);
        this.layout.start();
        this.svg
            .selectAll("g.parentG")
            .attr(
                "transform",
                "translate(" +
                    this.layout.size()[0] / 2 +
                    "," +
                    this.layout.size()[1] / 2 +
                    ")"
            );
        this.svg
            .selectAll("g.parentG")
            .selectAll("text.Name")
            .attr("transform", (d) => {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            });
    }
}
