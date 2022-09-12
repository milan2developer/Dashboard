import { Component } from "@angular/core";
import { AppComponent } from "./app.component";

@Component({
    selector: "app-footer",
    template: `
        <div
            class="layout-footer flex align-items-center justify-content-between p-2 shadow-2"
        >
            <img
                id="footer-logo"
                [src]="
                    'assets/images/' +
                    (app.layoutMode === 'light'
                        ? 'kalantak_logo_black'
                        : 'kalantak_logo') +
                    '.png'
                "
                alt="kalantak-footer-logo"
                style="height: 3.25rem"
            />
            <div class="flex align-items-baseline ">
                <a
                    class="layout-topbar-action rounded-circle"
                    [ngClass]="{ 'mr-2': !app.isRTL, 'ml-2': app.isRTL }"
                    href="https://hi-in.facebook.com/kalantaktechnologyllp/"
                    pRipple
                >
                    <i class="pi pi-facebook fs-large"></i>
                </a>
                <a
                    class="layout-topbar-action rounded-circle"
                    [ngClass]="{ 'mr-2': !app.isRTL, 'ml-2': app.isRTL }"
                    href="https://in.linkedin.com/company/kalantak-technology?original_referer=https%3A%2F%2Fwww.google.com%2F"
                    pRipple
                >
                    <i class="pi pi-linkedin fs-large"></i>
                </a>
            </div>
        </div>
    `,
})
export class AppFooterComponent {
    constructor(public app: AppComponent) {}
}
