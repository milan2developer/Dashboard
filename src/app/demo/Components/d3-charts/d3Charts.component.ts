import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
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
    constructor(
        private breadcrumbService: AppBreadcrumbService,
        private store: Store<fromEmploye.AppState>
    ) {
        this.breadcrumbService.setItems([
            {
                label: "Dashboard Analytics",
                routerLink: ["/favorites/dashboardanalytics"],
            },
        ]);
    }
    ngOnInit(): void {
        clearTimeout(this.clearTimeOutOnInit);
        this.clearTimeOutOnInit = setTimeout(() => {
            this.employes$ = this.store.pipe(select(fromEmploye.getEmploye));
            this.employesSub = this.employes$.subscribe((loadEmp) => {
                this.setLineChart(loadEmp);
                this.setbarChartHorizontal(loadEmp);
                this.setScatter(loadEmp);
                this.setbarChartVertical(loadEmp);
            });
            this.getCsvData();
            this.getJsonData();
            this.setAreachart();
            this.setPieChart();
            this.setdonutLegendChart();
            this.sethierarchicalEdgeChart();
            this.setRadialGaugeChart();
            this.setTreeLayoutChart();
            this.setNetworkChart();
            this.setMapConnectionChart();
            this.setSunBurstChart();
            this.setHeatMapChart();
            this.setWordCloud();
        }, 2000);
    }

    getCsvData() {
        d3.csv("./assets/data_stacked.csv").then((response) => {
            this.setStackedChart(response);
        });
    }
    getJsonData() {
        d3.json("./assets/multilinechartData.json").then((response) => {
            this.setMultilineChart(response);
        });
    }
    setLineChart(response: any) {
        this.configLine = {
            id: "linechart",
            rawData: response,
        };
        this.lineChart = new LineChart(this.configLine);
    }
    setbarChartHorizontal(response: any) {
        this.configBarHorizontal = {
            id: "barcharthorizontal",
            rawData: response,
        };
        this.barChartHorizontal = new BarChartHorizontal(
            this.configBarHorizontal
        );
    }
    setScatter(response: any) {
        this.configScatter = {
            id: "scatterchart",
            rawData: response,
        };
        this.scatterChart = new ScatterChart(this.configScatter);
    }
    setStackedChart(response: any) {
        this.configBarStacked = {
            id: "barchartstacked",
            rawData: response,
        };
        this.barChartStacked = new barChartStacked(this.configBarStacked);
    }
    setbarChartVertical(response: any) {
        this.configBarVertical = {
            id: "barchartvertical",
            rawData: response,
        };
        this.barChartVertical = new barChartVertical(this.configBarVertical);
    }
    setMultilineChart(response: any) {
        this.configMultiLine = {
            id: "multilinechart",
            rawData: response,
        };
        this.multiLineChart = new MultiLineChart(this.configMultiLine);
    }
    setAreachart() {
        d3.csv("./assets/areachartData.csv").then((response) => {
            this.configArea = {
                id: "areachart",
                rawData: response,
            };
            this.areaChart = new AreaChart(this.configArea);
        });
    }
    setPieChart() {
        this.configPie = {
            id: "piechart",
        };
        this.pieChart = new PieChart(this.configPie);
    }
    setdonutLegendChart() {
        this.configDonutLegend = {
            id: "donutwithlegend",
        };
        this.donutLegendChart = new DonutLegendChart(this.configDonutLegend);
    }
    sethierarchicalEdgeChart() {
        this.confighierarchicalEdge = {
            id: "hierarchicaledge",
        };
        this.hierarchicalEdge = new HierarchicalEdgeChart(
            this.confighierarchicalEdge
        );
    }
    setRadialGaugeChart() {
        this.configradialgauge = {
            id: "radialgauge",
        };
        this.radialgauge = new RadialGauge(this.configradialgauge);
    }
    setTreeLayoutChart() {
        this.configtreelayout = {
            id: "treelayout",
        };
        this.treelayoutchart = new TreeLayout(this.configtreelayout);
    }
    setNetworkChart() {
        this.confignetwork = {
            id: "networkchart",
        };
        this.networkchart = new NetworkChart(this.confignetwork);
    }
    setMapConnectionChart() {
        this.configmapconnection = {
            id: "mapconnection",
        };
        this.mapconnectionchart = new MapConnection(this.configmapconnection);
    }
    setSunBurstChart() {
        this.configSunburst = {
            id: "sunburstchart",
        };
        this.sunBurstChart = new SunBurstChart(this.configSunburst);
    }
    setHeatMapChart() {
        this.configHeatMap = {
            id: "heatmapchart",
        };
        this.heatMapChart = new HeatMapChart(this.configHeatMap);
    }
    setWordCloud() {
        this.configwordcloud = {
            id: "wordcloud",
        };
        this.wordcloudChart = new WordCloudChart(this.configwordcloud);
    }

    ngOnDestroy(): void {
        clearTimeout(this.clearTimeOutOnInit);
        if (this.employesSub) {
            this.employesSub.unsubscribe();
        }
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
