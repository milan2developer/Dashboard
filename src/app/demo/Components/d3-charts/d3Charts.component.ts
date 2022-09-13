import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    HostListener,
    OnDestroy,
    OnInit,
} from "@angular/core";
import { AppBreadcrumbService } from "../../../app.breadcrumb.service";
import { BarChartHorizontal } from "../../models/Barchart_Horizontal";
import { barChartStacked } from "../../models/Barchart_Stacked";
import { barChartVertical } from "../../models/Barchart_vertical";
import { LineChart } from "../../models/Linechart";
import { ScatterChart } from "../../models/Scatterplot";
import { MultiLineChart } from "../../models/Multi_Linechart";
import { AreaChart } from "../../models/Areachart";
import { PieChart } from "../../models/pieChart";
import { DonutLegendChart } from "../../models/donutWithLegends";
import { HierarchicalEdgeChart } from "../../models/HierarchicalEdge";
import { RadialGauge } from "../../models/radialgaugeChart";
import { TreeLayout } from "../../models/treelayout";
import { NetworkChart } from "../../models/networkChart";
import { MapConnection } from "../../models/mapConnection";
import { SunBurstChart } from "../../models/sunburstchart";
import { HeatMapChart } from "../../models/heatMapChart";
import { WordCloudChart } from "../../models/wordCloudChart";
import { Employe } from "../../models/employe.model";
import { Store, select } from "@ngrx/store";
import * as fromEmploye from "../../state/employe.reducer";
import { Observable, Subscription } from "rxjs";
import * as d3 from "d3";
import {
    Router,
    NavigationStart,
    Event,
    NavigationEnd,
    RouterEvent,
} from "@angular/router";
import { MenuService } from "src/app/app.menu.service";

@Component({
    templateUrl: "./d3Charts.component.html",
    styleUrls: ["./d3Charts.component.scss"],
})
export class d3ChartsComponent implements OnInit, OnDestroy {
    configBarVertical: any;
    configBarHorizontal: any;
    configLine: any;
    configScatter: any;
    configMultiLine: any;
    configBarStacked: any;
    configArea: any;
    configPie: any;
    confignetwork: any;
    configtreelayout: any;
    configDonutLegend: any;
    configmapconnection: any;
    confighierarchicalEdge: any;
    configradialgauge: any;
    configSunburst: any;
    configHeatMap: any;
    configwordcloud: any;
    barChartVertical: barChartVertical;
    barChartHorizontal: BarChartHorizontal;
    barChartStacked: barChartStacked;
    lineChart: LineChart;
    scatterChart: ScatterChart;
    multiLineChart: MultiLineChart;
    areaChart: AreaChart;
    pieChart: PieChart;
    donutLegendChart: DonutLegendChart;
    hierarchicalEdge: HierarchicalEdgeChart;
    radialgauge: RadialGauge;
    networkchart: NetworkChart;
    treelayoutchart: TreeLayout;
    mapconnectionchart: MapConnection;
    sunBurstChart: SunBurstChart;
    heatMapChart: HeatMapChart;
    configSankeyChart: any;
    wordcloudChart: WordCloudChart;
    employes$: Observable<Employe[]>;
    employesSub: Subscription;
    clearTimeOutOnInit;
    IsLoading: boolean = true;
    isDestory: boolean;
    constructor(
        private breadcrumbService: AppBreadcrumbService,
        private store: Store<fromEmploye.AppState>,
        private cd: ChangeDetectorRef,
        public menuService: MenuService
    ) {
        // this.menuService.IsLoading = false;
        this.employes$ = this.store.pipe(select(fromEmploye.getEmploye));
        this.breadcrumbService.setItems([
            {
                label: "Dashboard Analytics",
                routerLink: ["/favorites/dashboardanalytics"],
            },
        ]);
    }

    async ngOnInit() {
        this.IsLoading = true;
        await Promise.all([
            this.getUserData(),
            this.getCsvData(),
            this.getJsonData(),
            this.setAreachart(),
            this.setHierarchicalEdgeChart(),
            this.setRadialGaugeChart(),
            this.setTreeLayoutChart(),
            this.setNetworkChart(),
            this.setMapConnectionChart(),
            this.setSunBurstChart(),
            this.setHeatMapChart(),
            this.setPieChart(),
            this.setdonutLegendChart(),
            this.setWordCloud(),
        ]).then(() => {
            this.IsLoading = false;
        });
        this.cd.detectChanges();
    }

    loadEmp(loadEmp) {
        this.setLineChart(loadEmp);
        this.setbarChartHorizontal(loadEmp);
        this.setScatter(loadEmp);
        this.setbarChartVertical(loadEmp);
    }
    getUserData() {
        return new Promise((resolve, rejects) => {
            this.employesSub = this.employes$.subscribe((loadEmp) => {
                resolve(loadEmp);
                if (loadEmp && loadEmp.length) {
                    return this.loadEmp(loadEmp);
                }
            });
        });
    }

    getCsvData() {
        return new Promise((resolve, rejects) => {
            d3.csv("./assets/data_stacked.csv").then((response) => {
                resolve(response);
                return this.setStackedChart(response);
            });
        });
    }

    getJsonData() {
        return new Promise((resolve, rejects) => {
            d3.json("./assets/multilinechartData.json").then((response) => {
                resolve(response);
                return this.setMultilineChart(response);
            });
        });
    }

    setAreachart() {
        return new Promise((resolve, rejects) => {
            d3.csv("./assets/areachartData.csv").then((response) => {
                resolve(response);
                this.configArea = {
                    id: "areachart",
                    rawData: response,
                };
                if (!this.isDestory) {
                    this.areaChart = new AreaChart(this.configArea);
                }
            });
        });
    }

    setHierarchicalEdgeChart() {
        let objDuplicate = {};
        let newDataaa = [];
        return new Promise((resolve, rejects) => {
            d3.csv(
                "assets/Year_Wise_Interaction_Counts_Full_Data_data.csv",
                (obj: any) => {
                    let name = obj["Source Label"];
                    let target = obj["Target Label"];
                    obj.name = "root." + obj["Label"] + "." + name;
                    obj.target = target;

                    const string = "root." + obj["Label"] + "." + obj.target;
                    const json1 = JSON.parse(JSON.stringify(obj));
                    const target1 = json1["Target Label"];
                    const Source = json1["Source Label"];
                    json1["Source Label"] = target1;
                    json1["Target Label"] = Source;
                    json1.name =
                        "root." + obj["Label"] + "." + json1["Source Label"];
                    json1.target = json1["Target Label"];
                    const string1 =
                        "root." + json1["Label"] + "." + json1["Target Label"];

                    if (!objDuplicate[string]) {
                        json1.imports = [string1];
                        objDuplicate[string] = {
                            [name]: json1["Label"],
                            data: json1,
                        };
                        newDataaa.push(json1);
                    } else if (
                        objDuplicate[string] &&
                        !objDuplicate[string][name]
                    ) {
                        objDuplicate[string].data.imports.push(string1);
                        json1.imports = objDuplicate[string].data.imports;
                        objDuplicate[string] = {
                            [name]: json1["Label"],
                            data: json1,
                        };
                        newDataaa.push(json1);
                    }
                    if (!objDuplicate[obj.name]) {
                        obj.imports = [string];
                        objDuplicate[obj.name] = {
                            [target]: obj["Label"],
                            data: obj,
                        };

                        return obj;
                    } else if (
                        objDuplicate[obj.name] &&
                        !objDuplicate[obj.name][target]
                    ) {
                        objDuplicate[obj.name].data.imports.push(string);
                        obj.imports = objDuplicate[obj.name].data.imports;
                        objDuplicate[obj.name] = {
                            [target]: obj["Label"],
                            data: obj,
                        };

                        return obj;
                    } else if (
                        objDuplicate[obj.name] &&
                        objDuplicate[obj.name][target] &&
                        objDuplicate[obj.name][target] !== obj["Label"]
                    ) {
                        objDuplicate[obj.name].data.imports.push(string);
                        obj.imports = objDuplicate[obj.name].data.imports;
                        objDuplicate[obj.name] = {
                            [target]: obj["Label"],
                            data: obj,
                        };

                        return obj;
                    }
                }
            ).then((d) => {
                resolve(d.concat(newDataaa));
                this.confighierarchicalEdge = {
                    id: "hierarchicaledge",
                    rawData: d.concat(newDataaa),
                };
                if (!this.isDestory) {
                    this.hierarchicalEdge = new HierarchicalEdgeChart(
                        this.confighierarchicalEdge
                    );
                }
            });
        });
    }

    setRadialGaugeChart() {
        return new Promise((resolve, rejects) => {
            d3.json("assets/radialguage.json").then((response) => {
                resolve(response);
                this.configradialgauge = {
                    id: "radialgauge",
                    rawData: response,
                };
                if (!this.isDestory) {
                    this.radialgauge = new RadialGauge(this.configradialgauge);
                }
            });
        });
    }

    setTreeLayoutChart() {
        return new Promise((resolve, rejects) => {
            d3.json("./assets/data.json").then((response) => {
                resolve(response);
                this.configtreelayout = {
                    id: "treelayout",
                    rawData: response,
                };
                if (!this.isDestory) {
                    this.treelayoutchart = new TreeLayout(
                        this.configtreelayout
                    );
                }
            });
        });
    }

    setNetworkChart() {
        return new Promise((resolve, rejects) => {
            d3.json("assets/dataforce.json").then((graph) => {
                resolve(graph);
                this.confignetwork = {
                    id: "networkchart",
                    rawData: graph,
                };
                if (!this.isDestory) {
                    this.networkchart = new NetworkChart(this.confignetwork);
                }
            });
        });
    }

    setMapConnectionChart() {
        return new Promise((resolve, rejects) => {
            d3.json("assets/world-countries.json").then((data) => {
                resolve(data);
                this.configmapconnection = {
                    id: "mapconnection",
                    rawData: data,
                };
                if (!this.isDestory) {
                    this.mapconnectionchart = new MapConnection(
                        this.configmapconnection
                    );
                }
            });
        });
    }

    setSunBurstChart() {
        return new Promise((resolve, rejects) => {
            d3.json("assets/sunburstchartData.json").then((response) => {
                resolve(response);
                this.configSunburst = {
                    id: "sunburstchart",
                    rawData: response,
                };
                if (!this.isDestory) {
                    this.sunBurstChart = new SunBurstChart(this.configSunburst);
                }
            });
        });
    }

    setHeatMapChart() {
        return new Promise((resolve, rejects) => {
            d3.csv("assets/heatmap_data.csv").then((data) => {
                resolve(data);
                this.configHeatMap = {
                    id: "heatmapchart",
                    rawData: data,
                };
                if (!this.isDestory) {
                    this.heatMapChart = new HeatMapChart(this.configHeatMap);
                }
            });
        });
    }

    setLineChart(response: any) {
        this.configLine = {
            id: "linechart",
            rawData: response,
        };
        if (!this.isDestory) {
            this.lineChart = new LineChart(this.configLine);
        }
    }
    setbarChartHorizontal(response: any) {
        this.configBarHorizontal = {
            id: "barcharthorizontal",
            rawData: response,
        };
        if (!this.isDestory) {
            this.barChartHorizontal = new BarChartHorizontal(
                this.configBarHorizontal
            );
        }
    }
    setScatter(response: any) {
        this.configScatter = {
            id: "scatterchart",
            rawData: response,
        };
        if (!this.isDestory) {
            this.scatterChart = new ScatterChart(this.configScatter);
        }
    }
    setStackedChart(response: any) {
        this.configBarStacked = {
            id: "barchartstacked",
            rawData: response,
        };
        if (!this.isDestory) {
            this.barChartStacked = new barChartStacked(this.configBarStacked);
        }
    }
    setbarChartVertical(response: any) {
        this.configBarVertical = {
            id: "barchartvertical",
            rawData: response,
        };
        if (!this.isDestory) {
            this.barChartVertical = new barChartVertical(
                this.configBarVertical
            );
        }
    }
    setMultilineChart(response: any) {
        this.configMultiLine = {
            id: "multilinechart",
            rawData: response,
        };
        if (!this.isDestory) {
            this.multiLineChart = new MultiLineChart(this.configMultiLine);
        }
    }
    setPieChart() {
        this.configPie = {
            id: "piechart",
        };

        if (!this.isDestory) {
            this.pieChart = new PieChart(this.configPie);
        }
    }
    setdonutLegendChart() {
        this.configDonutLegend = {
            id: "donutwithlegend",
        };
        if (!this.isDestory) {
            this.donutLegendChart = new DonutLegendChart(
                this.configDonutLegend
            );
        }
    }
    setWordCloud() {
        this.configwordcloud = {
            id: "wordcloud",
        };
        if (!this.isDestory) {
            this.wordcloudChart = new WordCloudChart(this.configwordcloud);
        }
    }

    ngOnDestroy(): void {
        clearTimeout(this.clearTimeOutOnInit);
        if (this.employesSub) {
            this.employesSub.unsubscribe();
        }
        this.isDestory = true;
    }
    @HostListener("window:resize", ["$event"])
    onResize(event) {
        if (this.barChartVertical) {
            this.barChartVertical.resizeChart();
        }
        if (this.barChartHorizontal) {
            this.barChartHorizontal.resizeChart();
        }
        if (this.barChartStacked) {
            this.barChartStacked.resizeChart();
        }
        if (this.lineChart) {
            this.lineChart.resizeChart();
        }
        if (this.multiLineChart) {
            this.multiLineChart.resizeChart();
        }
        if (this.areaChart) {
            this.areaChart.resizeChart();
        }
        if (this.scatterChart) {
            this.scatterChart.resizeChart();
        }
        if (this.pieChart) {
            this.pieChart.resizeChart();
        }
        if (this.radialgauge) {
            this.radialgauge.resizeChart();
        }
        if (this.donutLegendChart) {
            this.donutLegendChart.resizeChart();
        }
        if (this.hierarchicalEdge) {
            this.hierarchicalEdge.resizeChart();
        }
        if (this.treelayoutchart) {
            this.treelayoutchart.resizeChart();
        }
        if (this.networkchart) {
            this.networkchart.resizeChart();
        }
        if (this.mapconnectionchart) {
            this.mapconnectionchart.resizeChart();
        }
        if (this.sunBurstChart) {
            this.sunBurstChart.resizeChart();
        }
        if (this.heatMapChart) {
            this.heatMapChart.resizeChart();
        }
        if (this.wordcloudChart) {
            this.wordcloudChart.resizeChart();
        }
    }
}
