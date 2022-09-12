import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { SelectItem } from "primeng/api";
import { AppBreadcrumbService } from "../../../app.breadcrumb.service";
import { AppMainComponent } from "src/app/app.main.component";
import { AppComponent } from "src/app/app.component";

@Component({
    templateUrl: "./highCharts.component.html",
})
export class HighChartsComponent implements OnInit {
    @ViewChild("chatcontainer") chatContainerViewChild: ElementRef;

    constructor(
        public app: AppComponent,
        public appMain: AppMainComponent,
        private breadcrumbService: AppBreadcrumbService
    ) {
        this.breadcrumbService.setItems([
            { label: "Dashboard", routerLink: ["/"] },
        ]);
    }

    messageArray = [];

    ngOnInit() {}
}
