import { FormControl } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-show-errors',
  templateUrl: './show-errors.component.html',
})
export class ShowErrorsComponent {
  @Input() ctrl: any;
  @Input() validations: any;
  constructor() {}

  shouldShowErrors(): boolean {
    return this.ctrl && this.ctrl.errors && this.ctrl.touched;
  }

  listOfErrors(): string[] {
    return Object.keys(this.ctrl.errors).map(
      (err) => this.validations.find((e) => e.name == err).message
    );
  }
}
