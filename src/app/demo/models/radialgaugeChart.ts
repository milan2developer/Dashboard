import * as d3 from "d3";

export interface config {
    id: string;
}
export class RadialGauge {
    id;
    value;
    upperLimit;
    lowerLimit;
    valueUnit;
    precision;
    ranges;
    renderTimeout = 5000;
    duration = 500;
    padding = { top: 5, left: 5, right: 5, bottom: 5 };
    innerRadius = 130;
    outterRadius = 145;
    majorGraduations: any = 6;
    minorGraduations: any = 10;
    majorGraduationLength = 20;
    minorGraduationLength = 10;
    majorGraduationMarginTop = 7;
    majorGraduationColor = "#a5a5a5";
    minorGraduationColor = "#EAEAEA";
    majorGraduationTextColor = "#6C6C6C";
    textSize = 12;
    needleColor = "#2DABC1";
    valueVerticalOffset = 40;
    unActiveColor = "#D7D7D7";
    borderWidth = 3;
    borderColor = "green";
    needleWidth = 10;
    needleLineThickness = 1;
    startAngle = -120;
    endAngle = 120;
    cScale;
    oldVal = 0;
    circleRadius = 6;
    rawData;
    width;
    height;
    svg;
    chartData: any;
    needleWayPointOffset;
    pathNeedle;
    color = d3.scaleOrdinal(d3.schemeCategory10);
    centerX;
    centerY;
    needleAngleOld;
    needleAngleNew;
    arc: any;
    borderArc: any;

    constructor(public config: config) {
        this.id = this.config.id;
        this.majorGraduations = parseInt(this.majorGraduations) - 1 || 5;
        this.minorGraduations = parseInt(this.minorGraduations) || 10;
        this.majorGraduationLength = this.majorGraduationLength
            ? this.majorGraduationLength
            : Math.round((this.width * 16) / this.width);
        this.minorGraduationLength = this.majorGraduationLength
            ? this.majorGraduationLength
            : Math.round((this.width * 10) / this.width);
        this.majorGraduationMarginTop = this.majorGraduationMarginTop
            ? this.majorGraduationMarginTop
            : Math.round((this.width * 7) / this.width);
        this.majorGraduationColor = this.majorGraduationColor || "#B0B0B0";
        this.minorGraduationColor = this.minorGraduationColor || "#D0D0D0";
        this.majorGraduationTextColor =
            this.majorGraduationTextColor || "#6C6C6C";
        this.needleColor = this.needleColor || "#416094";
        this.needleWayPointOffset = this.needleWidth / 2;
        this.valueVerticalOffset = Math.round((this.width * 30) / 300);
        this.loadData();
    }
    loadData() {
        d3.json("assets/radialguage.json").then(async (response) => {
            this.chartData = response;
            console.log(this.chartData);

            this.createEle();
            await this.updateDataAndEle();
        });
    }

    createEle() {
        this.width = d3.select("#" + this.id).node()["clientWidth"];
        this.height = d3.select("#" + this.id).node()["clientHeight"];
        this.centerX =
            (this.width + (this.padding.top + this.padding.bottom)) / 2;
        this.centerY =
            (this.height + (this.padding.left + this.padding.right)) / 2;
        this.innerRadius = this.height / 2 - 30;
        this.outterRadius = this.height / 2 - 15;

        d3.select("#" + this.id)
            .selectAll("svg")
            .remove();
        this.svg = d3
            .select("#" + this.id)
            .append("svg")
            .attr("width", this.width + this.padding.top + this.padding.bottom)
            .attr(
                "height",
                this.height + this.padding.left + this.padding.right
            );
        this.svg.append("g").attr("class", "lines");
        this.svg.append("g").attr("class", "texts");
        let needleG = this.svg.append("g").attr("class", "needleG");
        needleG.append("svg:path").attr("class", "needlePath");
        needleG.append("text").attr("class", "mtt-graduationValueText");
        needleG.append("circle").attr("class", "needleCircle");
    }

    updateDataAndEle() {
        this.oldVal = this.value ? this.value : 0;
        this.value = this.chartData[0].scope_value;
        this.upperLimit = this.chartData[1].scope_upperLimit;
        this.lowerLimit = this.chartData[2].scope_lowerLimit;
        this.valueUnit = this.chartData[3].scope_units;
        this.precision = this.chartData[4].scope_precision;
        this.ranges = this.chartData[5].scope_ranges;

        var maxLimit = this.upperLimit ? this.upperLimit : 100;
        var minLimit = this.lowerLimit ? this.lowerLimit : 0;
        var d3DataSource = [];

        if (typeof this.ranges === "undefined") {
            d3DataSource.push([minLimit, maxLimit, this.unActiveColor]);
        } else {
            this.ranges.forEach((value, index) => {
                d3DataSource.push([value.min, value.max, value.color]);
            });
        }

        var translate = "translate(" + this.centerX + "," + this.centerY + ")";

        this.cScale = d3
            .scaleLinear()
            .domain([minLimit, maxLimit])
            .range([this.startAngle, this.endAngle]);

        this.arc = d3
            .arc()
            .innerRadius(this.innerRadius)
            .outerRadius(this.outterRadius)
            .startAngle((d) => {
                return this.cScale(d[0]);
            })
            .endAngle((d) => {
                return this.degToRad(this.cScale(d[1]));
            });

        this.borderArc = d3
            .arc()
            .innerRadius(this.outterRadius)
            .outerRadius(this.outterRadius + this.borderWidth)
            .startAngle(0)
            .endAngle(2 * Math.PI);

        const borderArcPath = this.svg.selectAll("path.borderArc").data([1]);
        borderArcPath
            .enter()
            .append("path")
            .merge(borderArcPath)
            .attr("class", "borderArc")
            .attr("d", this.borderArc)
            .style("fill", this.borderColor)
            .attr("transform", translate);
        borderArcPath.exit().remove();

        const radialGuagePath = this.svg
            .selectAll("path.radialGauge")
            .data(d3DataSource);
        radialGuagePath
            .enter()
            .append("path")
            .merge(radialGuagePath)
            .attr("class", "radialGauge")
            .attr("d", (d) => this.arc(d))
            .style("fill", (d) => {
                return d[2];
            })
            .attr("transform", translate);

        radialGuagePath.exit().remove();

        var majorGraduationsAngles = this.getMajorGraduationAngles();
        var majorGraduationValues = this.getMajorGraduationValues(
            minLimit,
            maxLimit
        );
        this.renderMajorGraduations(majorGraduationsAngles);
        this.renderMajorGraduationTexts(
            majorGraduationsAngles,
            majorGraduationValues
        );
        this.renderGraduationNeedle(minLimit, maxLimit);
    }

    renderGraduationNeedle(minLimit, maxLimit) {
        var centerColor;

        if (typeof this.value === "undefined") {
            centerColor = this.unActiveColor;
        } else {
            centerColor = this.needleColor;
            var fontStyle = this.textSize + "px Courier";
            if (this.value >= minLimit && this.value <= maxLimit) {
                const needlePath = this.svg
                    .select("g.needleG")
                    .selectAll("path.needlePath")
                    .data([minLimit]);
                needlePath
                    .enter()
                    .append("svg:path")
                    .merge(needlePath)
                    .attr("class", "needlePath")
                    .attr("d", (d) => this.pathCalc(d))
                    .attr("stroke-width", this.needleLineThickness)
                    .style("stroke", this.needleColor)
                    .style("fill", this.needleColor);

                needlePath
                    .attr("stroke-width", this.needleLineThickness)
                    .style("stroke", this.needleColor)
                    .style("fill", this.needleColor)
                    .transition()
                    .duration(1000)
                    .attrTween("transform", (d, i, a) => {
                        this.needleAngleOld =
                            this.cScale(this.oldVal) - this.startAngle;
                        this.needleAngleNew =
                            this.cScale(this.value) - this.startAngle;
                        //Check for min/max ends of the needle
                        if (
                            this.needleAngleOld + this.startAngle >
                            this.endAngle
                        ) {
                            this.needleAngleOld =
                                this.endAngle - this.startAngle;
                        }
                        if (
                            this.needleAngleOld + this.startAngle <
                            this.startAngle
                        ) {
                            this.needleAngleOld = 0;
                        }
                        if (
                            this.needleAngleNew + this.startAngle >
                            this.endAngle
                        ) {
                            this.needleAngleNew =
                                this.endAngle - this.startAngle;
                        }
                        if (
                            this.needleAngleNew + this.startAngle <
                            this.startAngle
                        ) {
                            this.needleAngleNew = 0;
                        }
                        var needleCentre = this.centerX + "," + this.centerY;
                        return d3.interpolateString(
                            "rotate(" +
                                this.needleAngleOld +
                                "," +
                                needleCentre +
                                ")",
                            "rotate(" +
                                this.needleAngleNew +
                                "," +
                                needleCentre +
                                ")"
                        );
                    });
                needlePath.exit().remove();
            }
            const needleText = this.svg
                .select("g.needleG")
                .selectAll("text.mtt-graduationValueText")
                .data([this.value.toFixed(this.precision) + this.valueUnit]);

            needleText
                .enter()
                .append("text")
                .merge(needleText)
                .attr("x", this.centerX)
                .attr("y", this.centerY + 40)
                .attr("class", "mtt-graduationValueText")
                .attr("fill", this.needleColor)
                .attr("text-anchor", "middle")
                .attr("font-weight", "bold")
                .style("font", fontStyle)
                .text((d) => {
                    return d;
                });
            needleText.exit().remove();
        }

        const needleCircle = this.svg
            .select("g.needleG")
            .selectAll("circle.needleCircle")
            .data([this.circleRadius]);

        needleCircle
            .enter()
            .append("circle")
            .merge(needleCircle)
            .attr("r", (d) => {
                return d;
            })
            .attr("cy", this.centerY)
            .attr("cx", this.centerX)
            .attr("fill", centerColor);
        needleCircle
            .attr("r", (d) => {
                return d;
            })
            .attr("cy", this.centerY)
            .attr("cx", this.centerX)
            .attr("fill", centerColor);
        needleCircle.exit().remove();
    }

    renderMajorGraduations(majorGraduationsAngles) {
        var lineData = [];

        //Render Major Graduations
        majorGraduationsAngles.forEach((data, index) => {
            const obj = { className: "major", value: data };
            lineData.push(obj);
            if (index > 0) {
                var minScale = majorGraduationsAngles[index - 1];
                var maxScale = majorGraduationsAngles[index];
                var scaleRange = maxScale - minScale;

                for (var i = 1; i < this.minorGraduations; i++) {
                    var scaleValue =
                        minScale + (i * scaleRange) / this.minorGraduations;
                    const obj = { className: "minor", value: scaleValue };
                    lineData.push(obj);
                }
            }
        });

        const lines = this.svg
            .select("g.lines")
            .selectAll("line")
            .data(lineData);
        lines
            .enter()
            .append("svg:line")
            .merge(lines)
            .attr("class", (d) => {
                return d.className;
            })
            .attr("x1", (d) => {
                var cos1Adj = Math.round(
                    Math.cos(((90 - d.value) * Math.PI) / 180) *
                        (this.innerRadius -
                            this.majorGraduationMarginTop -
                            (d.className === "major"
                                ? this.majorGraduationLength
                                : this.minorGraduationLength))
                );
                return this.centerX + cos1Adj;
            })
            .attr("y1", (d) => {
                var sin1Adj = Math.round(
                    Math.sin(((90 - d.value) * Math.PI) / 180) *
                        (this.innerRadius -
                            this.majorGraduationMarginTop -
                            (d.className === "major"
                                ? this.majorGraduationLength
                                : this.minorGraduationLength))
                );
                return this.centerY + sin1Adj * -1;
            })
            .attr("x2", (d) => {
                var cos2Adj = Math.round(
                    Math.cos(((90 - d.value) * Math.PI) / 180) *
                        (this.innerRadius - this.majorGraduationMarginTop)
                );
                return this.centerX + cos2Adj;
            })
            .attr("y2", (d) => {
                var sin2Adj = Math.round(
                    Math.sin(((90 - d.value) * Math.PI) / 180) *
                        (this.innerRadius - this.majorGraduationMarginTop)
                );
                return this.centerY + sin2Adj * -1;
            })
            .style("stroke", (d) => {
                return d.className === "major"
                    ? this.majorGraduationColor
                    : this.minorGraduationColor;
            });
        lines
            .selectAll("line")
            .attr("x1", (d) => {
                var cos1Adj = Math.round(
                    Math.cos(((90 - d.value) * Math.PI) / 180) *
                        (this.innerRadius -
                            this.majorGraduationMarginTop -
                            (d.className === "major"
                                ? this.majorGraduationLength
                                : this.minorGraduationLength))
                );
                return this.centerX + cos1Adj;
            })
            .attr("y1", (d) => {
                var sin1Adj = Math.round(
                    Math.sin(((90 - d.value) * Math.PI) / 180) *
                        (this.innerRadius -
                            this.majorGraduationMarginTop -
                            (d.className === "major"
                                ? this.majorGraduationLength
                                : this.minorGraduationLength))
                );
                return this.centerY + sin1Adj * -1;
            })
            .attr("x2", (d) => {
                var cos2Adj = Math.round(
                    Math.cos(((90 - d.value) * Math.PI) / 180) *
                        (this.innerRadius - this.majorGraduationMarginTop)
                );
                return this.centerX + cos2Adj;
            })
            .attr("y2", (d) => {
                var sin2Adj = Math.round(
                    Math.sin(((90 - d.value) * Math.PI) / 180) *
                        (this.innerRadius - this.majorGraduationMarginTop)
                );
                return this.centerY + sin2Adj * -1;
            })
            .transition()
            .duration(this.duration)
            .style("stroke", (d) => {
                return d.className === "major"
                    ? this.majorGraduationColor
                    : this.minorGraduationColor;
            });

        lines.exit().remove();
    }

    getMajorGraduationValues(minLimit, maxLimit) {
        var scaleRange = maxLimit - minLimit;
        var majorGraduationValues = [];
        for (var i = 0; i <= this.majorGraduations; i++) {
            var scaleValue =
                minLimit + (i * scaleRange) / this.majorGraduations;
            majorGraduationValues.push(scaleValue.toFixed(this.precision));
        }

        return majorGraduationValues;
    }

    getMajorGraduationAngles() {
        var scaleRange = Math.abs(this.startAngle) + Math.abs(this.endAngle);
        var minScale = this.startAngle;
        var graduationsAngles = [];
        for (var i = 0; i <= this.majorGraduations; i++) {
            var scaleValue =
                minScale + (i * scaleRange) / this.majorGraduations;
            graduationsAngles.push(scaleValue);
        }

        return graduationsAngles;
    }

    renderMajorGraduationTexts(majorGraduationsAngles, majorGraduationValues) {
        if (!this.ranges) return;
        const textVerticalPadding = 5;
        const textHorizontalPadding = 5;

        const lastGraduationValue =
            majorGraduationValues[majorGraduationValues.length - 1];
        // const textSize = (width * 12) / 300;
        const fontStyle = this.textSize + "px Courier";

        const dummyText = this.svg
            .append("text")
            .attr("x", this.centerX)
            .attr("y", this.centerY)
            .attr("fill", "transparent")
            .attr("text-anchor", "middle")
            .style("font", fontStyle)
            .text(lastGraduationValue + this.valueUnit);

        const textWidth = dummyText.node().getBBox().width;
        const texts = this.svg
            .select("g.texts")
            .selectAll("text")
            .data(majorGraduationsAngles);
        texts
            .enter()
            .append("text")
            .merge(texts)
            .attr("class", "mtt-majorGraduationText")
            .style("font", fontStyle)
            .attr("text-align", "center")
            .attr("x", (d) => {
                var cos1Adj = Math.round(
                    Math.cos(((90 - d) * Math.PI) / 180) *
                        (this.innerRadius -
                            this.majorGraduationMarginTop -
                            this.majorGraduationLength -
                            textHorizontalPadding)
                );
                if (cos1Adj > 0) {
                    if (d > 0 && d < 45) {
                        cos1Adj -= textWidth / 2;
                    } else {
                        cos1Adj -= textWidth;
                    }
                }
                if (cos1Adj < 0) {
                    if (d < 0 && d > -45) {
                        cos1Adj -= textWidth / 2;
                    }
                }
                if (cos1Adj == 0) {
                    cos1Adj -= d == 0 ? textWidth / 4 : textWidth / 2;
                }
                return this.centerX + cos1Adj;
            })
            .attr("dy", (d) => {
                var sin1Adj = Math.round(
                    Math.sin(((90 - d) * Math.PI) / 180) *
                        (this.innerRadius -
                            this.majorGraduationMarginTop -
                            this.majorGraduationLength -
                            textVerticalPadding)
                );

                var sin1Factor = 1;
                if (sin1Adj < 0) sin1Factor = 1.1;
                if (sin1Adj > 0) sin1Factor = 0.9;
                return this.centerY + sin1Adj * sin1Factor * -1;
            })
            .attr("fill", this.majorGraduationTextColor)
            .text((d, i) => {
                return majorGraduationValues[i] + this.valueUnit;
            });
        texts.exit().remove();
        texts
            .attr("class", "mtt-majorGraduationText")
            .style("font", fontStyle)
            .attr("text-align", "center")
            .attr("x", (d) => {
                var cos1Adj = Math.round(
                    Math.cos(((90 - d) * Math.PI) / 180) *
                        (this.innerRadius -
                            this.majorGraduationMarginTop -
                            this.majorGraduationLength -
                            textHorizontalPadding)
                );
                if (cos1Adj > 0) {
                    if (d > 0 && d < 45) {
                        cos1Adj -= textWidth / 2;
                    } else {
                        cos1Adj -= textWidth;
                    }
                }
                if (cos1Adj < 0) {
                    if (d < 0 && d > -45) {
                        cos1Adj -= textWidth / 2;
                    }
                }
                if (cos1Adj == 0) {
                    cos1Adj -= d == 0 ? textWidth / 4 : textWidth / 2;
                }
                return this.centerX + cos1Adj;
            })
            .attr("dy", (d) => {
                var sin1Adj = Math.round(
                    Math.sin(((90 - d) * Math.PI) / 180) *
                        (this.innerRadius -
                            this.majorGraduationMarginTop -
                            this.majorGraduationLength -
                            textVerticalPadding)
                );

                var sin1Factor = 1;
                if (sin1Adj < 0) sin1Factor = 1.1;
                if (sin1Adj > 0) sin1Factor = 0.9;
                return this.centerY + sin1Adj * sin1Factor * -1;
            })
            .attr("fill", this.majorGraduationTextColor)
            .text((d, i) => {
                return majorGraduationValues[i] + this.valueUnit;
            });
        texts.exit().remove();
        dummyText.remove();
    }

    degToRad(deg) {
        return (deg * Math.PI) / 180;
    }

    pathCalc(d) {
        var needleValue = this.cScale(d) + 90;
        var thetaRad = this.degToRad(needleValue);
        var needleLen =
            this.innerRadius -
            this.majorGraduationLength -
            this.majorGraduationMarginTop;
        var needleRadius = (this.width * 2.5) / 300;
        var topX = this.centerX - needleLen * Math.cos(thetaRad);
        var topY = this.centerY - needleLen * Math.sin(thetaRad);
        var leftX =
            this.centerX - needleRadius * Math.cos(thetaRad - Math.PI / 2);
        var leftY =
            this.centerY - needleRadius * Math.sin(thetaRad - Math.PI / 2);
        var rightX =
            this.centerX - needleRadius * Math.cos(thetaRad + Math.PI / 2);
        var rightY =
            this.centerY - needleRadius * Math.sin(thetaRad + Math.PI / 2);
        let lineData: any = [
            { x: leftX, y: leftY },
            { x: topX, y: topY },
            { x: rightX, y: rightY },
        ];
        var lineFunc = d3
            .line()
            .x(function (d) {
                return d["x"];
            })
            .y(function (d) {
                return d["y"];
            });

        var lineSVG = lineFunc(lineData);
        return lineSVG;
    }

    resizeChart() {
        this.width = d3.select("#" + this.id).node()["clientWidth"];
        this.height = d3.select("#" + this.id).node()["clientHeight"];
        this.centerX =
            (this.width + (this.padding.top + this.padding.bottom)) / 2;
        this.centerY =
            (this.height + (this.padding.left + this.padding.right)) / 2;
        this.innerRadius = this.height / 2 - 30;
        this.outterRadius = this.height / 2 - 15;

        d3.select("#" + this.id)
            .select("svg")
            .attr("width", this.width)
            .attr("height", this.height);
        const translate =
            "translate(" + this.centerX + "," + this.centerY + ")";

        this.svg.selectAll("path.borderArc").attr("transform", translate);
        this.svg.selectAll("path.radialGauge").attr("transform", translate);
        this.updateDataAndEle();
    }
}
