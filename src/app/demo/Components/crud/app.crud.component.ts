import { Component, OnDestroy, OnInit } from "@angular/core";
import { ConfirmationService, SelectItem } from "primeng/api";
import { MessageService } from "primeng/api";
import { AppBreadcrumbService } from "../../../app.breadcrumb.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Employe } from "../../models/employe.model";
import { Store, select } from "@ngrx/store";
import * as fromEmploye from "../../state/employe.reducer";
import * as employeAction from "../../state/employe.action";
import { Observable, Subscription } from "rxjs";

@Component({
    templateUrl: "./app.crud.component.html",
    styleUrls: ["./app.crud.component.scss"],
    providers: [MessageService, ConfirmationService],
})
export class AppCrudComponent implements OnInit {
    employeDailog: boolean;

    Categories: SelectItem[];

    item: string;

    employes$: Observable<Employe[]>;

    subscrpition: Subscription;

    EmployeData: any;

    submitted: boolean;

    sortOptions: SelectItem[];

    sortOrder: number;

    sortField: string;

    employeeForm: FormGroup;

    file: any;

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private breadcrumbService: AppBreadcrumbService,
        private store: Store<fromEmploye.AppState>
    ) {
        this.breadcrumbService.setItems([
            { label: "Pages" },
            { label: "Crud", routerLink: ["/pages/crud"] },
        ]);
        this.Categories = [
            { label: "Data-Analyst", value: "Data-Analyst" },
            { label: "FrontEnd-Developer", value: "FrontEnd-Developer" },
            { label: "Backend-Developer", value: "Backend-Developer" },
            { label: "Fullstack-Developer", value: "Fullstack-Developer" },
            { label: "Android-Developer", value: "Android-Developer" },
            { label: "IOS-Developer", value: "IOS-Developer" },
            { label: "Angular-Developer", value: "Angular-Developer" },
            { label: "Flutter-Developer", value: "Flutter-Developer" },
            { label: "React-Developer", value: "React-Developer" },
            { label: "UI_UX-designer", value: "UI_UX-designer" },
            { label: "Tester", value: "Tester" },
        ];
        this.sortOptions = [
            { label: "Price High to Low", value: "!salary" },
            { label: "Price Low to High", value: "salary" },
        ];
    }

    ngOnInit() {
        this.employeeForm = new FormGroup({
            image: new FormControl(""),
            name: new FormControl("", [Validators.required]),
            category: new FormControl("", [Validators.required]),
            description: new FormControl("", [Validators.required]),
            salary: new FormControl("", [Validators.required]),
            id: new FormControl(),
        });
        this.getAllRecord();
    }
    getAllRecord() {
        this.employes$ = this.store.pipe(select(fromEmploye.getEmploye));
        this.employes$.subscribe((loadEmp) => {
            this.EmployeData = loadEmp;
        });
    }

    onChange(event) {
        const file = event.target.files[0];
        var reader = new FileReader();
        reader.addEventListener("load", (result: any) => {
            this.file = reader.result;
            this.employeeForm.controls["image"].setValue(this.file);
        });
        reader.readAsDataURL(file);
    }

    onSortChange(event) {
        let value = event.value;
        if (value.indexOf("!") === 0) {
            this.sortOrder = -1;
            this.sortField = value.substring(1, value.length);
        } else {
            this.sortOrder = 1;
            this.sortField = value;
        }
    }

    openNew() {
        this.employeeForm.reset();
        this.submitted = false;
        this.employeDailog = true;
    }

    editemploye(employe: Employe) {
        this.employeDailog = true;
        this.employeeForm.controls["category"].setValue(employe.category);
        this.employeeForm.controls["name"].setValue(employe.name);
        this.employeeForm.controls["description"].setValue(employe.description);
        this.employeeForm.controls["id"].setValue(employe.id);
        this.employeeForm.controls["image"].setValue(employe.image);
        this.employeeForm.controls["salary"].setValue(employe.salary);
    }

    deleteemploye(employe: Employe) {
        this.confirmationService.confirm({
            message: "Are you sure you want to delete " + employe.name + "?",
            header: "Confirm",
            icon: "pi pi-exclamation-triangle",
            accept: () => {
                this.EmployeData = this.EmployeData.filter(
                    (val) => val.id !== employe.id
                );
                this.store.dispatch(
                    new employeAction.DeleteEmploye(employe.id)
                );
                this.messageService.add({
                    severity: "success",
                    summary: "Successful",
                    detail: "Product Deleted",
                    life: 3000,
                });
            },
        });
    }

    CancelButton() {
        this.submitted = false;
        this.employeDailog = false;
    }

    saveProduct() {
        this.submitted = true;
        if (this.employeeForm.value.name.trim()) {
            if (this.employeeForm.value.id !== null) {
                this.EmployeData[
                    this.findIndexById(this.employeeForm.value.id)
                ] = this.employeeForm.value;
                this.employeeForm.value.image = this.file;

                this.store.dispatch(
                    new employeAction.UpdateEmploye(this.employeeForm.value)
                );
                this.messageService.add({
                    severity: "success",
                    summary: "Successful",
                    detail: "Product Updated",
                    life: 3000,
                });
            } else {
                this.employeeForm.value.image = this.file;
                this.store.dispatch(
                    new employeAction.CreateEmploye(this.employeeForm.value)
                );
                this.employeeForm.reset();
                this.messageService.add({
                    severity: "success",
                    summary: "Successful",
                    detail: "Product Created",
                    life: 3000,
                });
            }
            this.employeDailog = false;
        }
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.EmployeData.length; i++) {
            if (this.EmployeData[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    }
}
