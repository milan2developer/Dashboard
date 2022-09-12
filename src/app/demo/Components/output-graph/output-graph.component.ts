import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import * as Highcharts from "highcharts";
import { CrudService } from "../../service/crudservice.service";
import { Employe } from "../../models/employe.model";
import { Store, select } from "@ngrx/store";
import * as fromEmploye from "../../state/employe.reducer";
import { Observable, Subscription } from "rxjs";
@Component({
    selector: "app-output-graph",
    templateUrl: "./output-graph.component.html",
    styleUrls: ["./output-graph.component.scss"],
})
export class OutputGraphComponent implements OnInit, OnDestroy {
    @Input() type;
    myUserSub: Subscription;
    highcharts = Highcharts;
    updateFlag = false;
    employeSalaryData = [];
    chartOptions;
    employes$: Observable<Employe[]>;
    constructor(private store: Store<fromEmploye.AppState>) {}

    ngOnInit(): void {
        let xaxisData = [];
        let pieChartData = [];
        this.employes$ = this.store.pipe(select(fromEmploye.getEmploye));
        this.myUserSub = this.employes$.subscribe((loadEmp) => {
            loadEmp.forEach((element, index) => {
                let obj = {
                    name: element.name,
                    y: element.salary,
                };
                xaxisData.push(element.name);
                this.employeSalaryData.push(element.salary);
                pieChartData.push(obj);
            });
            if (this.type === "pie") {
                this.pieOption(pieChartData);
            } else {
                this.setOption(xaxisData);
            }
        });
    }
    setOption(xaxisData) {
        this.chartOptions = {
            chart: {
                type: this.type,
            },
            title: {
                text: "Salary Report",
            },
            xAxis: {
                categories: xaxisData,
            },
            series: [
                {
                    name: "salary",
                    data: this.employeSalaryData,
                },
            ],
        };
    }
    pieOption(Data) {
        this.chartOptions = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: "pie",
            },
            title: {
                text: "Salary Report",
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: "pointer",
                    dataLabels: {
                        enabled: true,
                    },
                },
            },
            series: [
                {
                    name: "Salary Report",
                    colorByPoint: true,
                    data: Data,
                },
            ],
        };
    }
    ngOnDestroy(): void {
        if (this.myUserSub) {
            this.myUserSub.unsubscribe();
        }
    }
}
