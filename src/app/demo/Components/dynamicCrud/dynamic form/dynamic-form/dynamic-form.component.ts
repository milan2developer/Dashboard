import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnChanges,
} from "@angular/core";

@Component({
    selector: "app-dynamic-form",
    templateUrl: "./dynamic-form.component.html",
    styleUrls: ["./dynamic-form.component.scss"],
})
export class DynamicFormComponent implements OnChanges {
    @Input() formJSONData: any;
    @Output() validFormchange = new EventEmitter<FormGroup>();
    form: FormGroup;
    base64Image: any;

    constructor(private fb: FormBuilder) {}
    submit() {
        this.validFormchange.emit(this.form);
    }
    ngOnChanges() {
        this.form = this.createControl();
    }

    toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });

    async onFileChange($event) {
        let file = $event.target.files[0];
        if (file) {
            this.base64Image = await this.toBase64(file);
            this.form.controls["image"].setValue(this.base64Image);
        }
    }

    createControl() {
        const group = this.fb.group({});
        this.formJSONData.fields.forEach((field) => {
            if (field.type === "buttonGroup") return;
            const control = this.fb.control(
                field.value,
                this.bindValidations(field.validations || [])
            );
            if (field.name !== undefined) {
                group.addControl(field.name, control);
            }
        });
        return group;
    }

    bindValidations(validations: any) {
        if (validations.length > 0) {
            const validList: any[] = [];
            validations.forEach((valid) => {
                if (valid.name == "required") {
                    validList.push(Validators.required);
                }
                if (valid.name == "pattern") {
                    validList.push(Validators.pattern(valid.validator));
                }
            });
            return Validators.compose(validList);
        }
        return null;
    }
}
