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
    xScale: any;
    constructor(public config: config) {
        this.id = this.config.id;
        this.rawData = this.config.rawData;
        this.loadData();
    }

    loadData() {
        var text_string =
            " kalantak kalantak Of course that’s your contention. You’re a first year grad student. You just got is nest kalantak company  finished readin’ kalantak is good ,kalanatak is very nice company, kalantak is progressive company some Marxian historian, Pete Garrison probably. You’re gonna be convinced of that ’til next month when you get to James Lemon and then you’re gonna be talkin’ about how the economies of Virginia and Pennsylvania were entrepreneurial and capitalist way back in 1740. That’s gonna last until next year. You’re gonna be in here regurgitating Gordon Wood, talkin’ about, you know, the Pre-Revolutionary utopia and the capital-forming effects of military mobilization… ‘Wood drastically underestimates the impact of social distinctions predicated upon wealth, especially inherited wealth.’ You got that from Vickers, Work in Essex County, page 98, right? Yeah, I read that, too. Were you gonna plagiarize the whole thing for us? Do you have any thoughts of your own on this matter? Or do you, is that your thing? You come into a bar. You read some obscure passage and then pretend, you pawn it off as your own, as your own idea just to impress some girls and embarrass my friend? See, the sad thing about a guy like you is in 50 years, you’re gonna start doin’ some thinkin’ on your own and you’re gonna come up with the fact that there are two certainties in life. One: don’t do that. And two: you dropped a hundred and fifty grand on a fuckin’ education you coulda got for a dollar fifty in late charges at the public library.";
        this.myWords = this.drawWordCloud(text_string);
        this.createEle();
    }
    drawWordCloud(text_string) {
        var common =
            "kalantak,good,company,poop,i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall";

        var word_count = {};

        var words = text_string.split(/[ '\-\(\)\*":;\[\]|{},.!?]+/);
        if (words.length == 1) {
            word_count[words[0]] = 1;
        } else {
            words.forEach(function (word) {
                var word = word.toLowerCase();
                if (
                    word != "" &&
                    common.indexOf(word) == -1 &&
                    word.length > 1
                ) {
                    if (word_count[word]) {
                        word_count[word]++;
                    } else {
                        word_count[word] = 1;
                    }
                }
            });
        }
        return Object.entries(word_count);
    }

    createEle() {
        const max = d3.max(this.myWords, (d) => {
            return Number(d["1"]);
        });

        this.xScale = d3.scaleLinear().domain([0, max]).range([10, 100]);
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
        this.layout = d3Cloud()
            .size([this.width, this.height])
            .words(
                this.myWords.map((d) => {
                    return { text: d[0], value: d[1] };
                })
            )
            .padding(7)
            .rotate(function () {
                return ~~(Math.random() * 2) * 90;
            })
            .fontSize((d) => {
                return this.xScale(+d["value"]);
            })
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
            .style("font-size", (d) => this.xScale(+d["value"]))
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
