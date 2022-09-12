import { RouterModule } from "@angular/router";
import { Component, NgModule } from "@angular/core";
import { HighChartsComponent } from "./demo/Components/dashboard/highCharts.component";
import { d3ChartsComponent } from "./demo/Components/d3-charts/d3Charts.component";

import { AppMainComponent } from "./app.main.component";
import { AppNotfoundComponent } from "./demo/Components/notfound/app.notfound.component";
import { AppLoginComponent } from "./demo/Components/login/app.login.component";
import { AppCrudComponent } from "./demo/Components/crud/app.crud.component";
import { AppWizardComponent } from "./demo/Components/register/app.wizard.component";
import { AuthGuard } from "./demo/guard/auth.guard";
import { UnAuthGuard } from "./demo/guard/un-auth.guard";
import { DynamicCrudComponent } from "./demo/Components/dynamicCrud/dynamicCrud.component";

@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                {
                    path: "login",
                    canActivate: [UnAuthGuard],
                    component: AppLoginComponent,
                },
                { path: "", redirectTo: "/login", pathMatch: "full" },
                { path: "signUp", component: AppWizardComponent },
                {
                    path: "",
                    canActivate: [AuthGuard],
                    component: AppMainComponent,
                    children: [
                        {
                            path: "dashboard",
                            component: HighChartsComponent,
                        },
                        {
                            path: "dashboard/d3charts",
                            component: d3ChartsComponent,
                        },

                        { path: "dashboard/crud", component: AppCrudComponent },
                        {
                            path: "dashboard/jsoncrud",
                            component: DynamicCrudComponent,
                        },
                    ],
                },

                { path: "notfound", component: AppNotfoundComponent },
                // { path: "**", redirectTo: "/notfound" },
            ],
            { useHash: true }
        ),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
