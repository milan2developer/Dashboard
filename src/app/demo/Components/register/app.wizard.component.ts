import { Component, OnInit } from "@angular/core";
import { MessageService, SelectItem } from "primeng/api";
import { state, style, trigger } from "@angular/animations";
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    Validators,
} from "@angular/forms";
import { first } from "rxjs/operators";
import { AuthenticationService } from "../../service/authentication.service";
import { Router } from "@angular/router";

@Component({
    selector: "app-wizard",
    templateUrl: "./app.wizard.component.html",
    animations: [
        trigger("tabBar", [
            state(
                "register",
                style({
                    width: "33.3333%",
                    left: "0",
                })
            ),
            state(
                "tier",
                style({
                    width: "33.3333%",
                    left: "33.3333%",
                })
            ),
            state(
                "payment",
                style({
                    width: "33.3333%",
                    left: "66.6667%",
                })
            ),
        ]),
    ],
})
export class AppWizardComponent {
    activeTab = "register";
    signupForm: FormGroup;
    get username(): AbstractControl {
        return this.signupForm.get("username") as AbstractControl;
    }

    get password(): AbstractControl {
        return this.signupForm.get("password") as AbstractControl;
    }

    get email(): AbstractControl {
        return this.signupForm.get("email") as AbstractControl;
    }

    constructor(
        private _builder: FormBuilder,
        private authentication: AuthenticationService,
        private router: Router,
        private messageService: MessageService
    ) {
        this.signupForm = this._builder.group({
            username: ["", [Validators.required, Validators.maxLength(20)]],
            password: [
                "",
                [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(64),
                ],
            ],
            email: [
                "",
                [
                    Validators.required,
                    Validators.pattern(
                        "[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$"
                    ),
                ],
            ],
        });
    }

    signUp() {
        this.authentication
            .authentication(this.signupForm)
            .subscribe((user) => {
                if (!user) {
                    this.authentication
                        .register(this.signupForm)
                        .pipe()
                        .subscribe(
                            (data) => {
                                this.router.navigate(["login"]);
                            },
                            (error) => {
                                this.messageService.add({
                                    severity: "error",
                                    summary: "Something went wrong",
                                    detail: "server doesn't response",
                                });
                            }
                        );
                } else {
                    this.messageService.add({
                        severity: "warn",
                        summary: "Already Exist",
                        detail: "This user is already exist",
                    });
                }
            });
    }
}
