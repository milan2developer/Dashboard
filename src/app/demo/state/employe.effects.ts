import { Injectable } from "@angular/core";
import { Actions, createEffect, Effect, ofType } from "@ngrx/effects";
import { Action } from "@ngrx/store";

import { Observable, observable, of } from "rxjs";
import { map, mergeMap, catchError, switchMap } from "rxjs/operators";
import { CrudService } from "../service/crudservice.service";

import * as employeAction from "../state/employe.action";
import { Employe } from "../models/employe.model";

@Injectable()
export class EmployeEffect {
    constructor(private actions$: Actions, private crudservice: CrudService) {}
    @Effect()
    loadEmployes$: Observable<Action> = this.actions$.pipe(
        ofType<employeAction.LoadEmployes>(
            employeAction.EmployeActionTypes.LOAD_EMPLOYES
        ),
        mergeMap((actions: employeAction.LoadEmployes) =>
            this.crudservice.getAllRecord().pipe(
                map(
                    (employes: Employe[]) =>
                        new employeAction.LoadEmployesSuccess(employes)
                ),
                catchError((err) =>
                    of(new employeAction.LoadEmployesFailed(err))
                )
            )
        )
    );

    @Effect()
    loadEmploye$: Observable<Action> = this.actions$.pipe(
        ofType<employeAction.LoadEmploye>(
            employeAction.EmployeActionTypes.LOAD_EMPLOYE
        ),
        mergeMap((actions: employeAction.LoadEmploye) =>
            this.crudservice.getRecordById(actions.payload).pipe(
                map(
                    (employe: Employe) =>
                        new employeAction.LoadEmployeSuccess(employe)
                ),
                catchError((err) =>
                    of(new employeAction.LoadEmployeFailed(err))
                )
            )
        )
    );

    @Effect()
    createEmploye$: Observable<Action> = this.actions$.pipe(
        ofType<employeAction.CreateEmploye>(
            employeAction.EmployeActionTypes.CREATE_EMPLOYE
        ),
        map((action: employeAction.CreateEmploye) => action.payload),
        mergeMap((employe: Employe) =>
            this.crudservice.createRecord(employe).pipe(
                map(
                    (newEmploye: Employe) =>
                        new employeAction.CreateEmployeSuccess(newEmploye)
                ),
                catchError((err) =>
                    of(new employeAction.CreateEmployeFailed(err))
                )
            )
        )
    );

    // updateEmploye$: Observable<Action> = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(employeAction.EmployeActionTypes.UPDATE_EMPLOYE),
    //         switchMap((action: employeAction.UpdateEmploye) => {
    //             return this.crudservice.updateRecord(action.payload).pipe(
    //                 map((employe: any) => {
    //                     return new employeAction.UpdateEmployeSuccess(employe);
    //                 }),
    //                 catchError((err) =>
    //                     of(new employeAction.CreateEmployeFailed(err))
    //                 )
    //             );
    //         })
    //     )
    // );

    @Effect()
    updateEmploye$: Observable<Action> = this.actions$.pipe(
        ofType<employeAction.UpdateEmploye>(
            employeAction.EmployeActionTypes.UPDATE_EMPLOYE
        ),
        map((action: employeAction.UpdateEmploye) => action.payload),
        mergeMap((employe: Employe) =>
            this.crudservice.updateRecord(employe).pipe(
                map((updateEmploye: any) => {
                    const updatedData = updateEmploye.find(
                        (emp) => emp.id === employe.id
                    );
                    return new employeAction.UpdateEmployeSuccess({
                        id: updatedData.id,
                        changes: updatedData,
                    });
                }),
                catchError((err) =>
                    of(new employeAction.UpdateEmployeFailed(err))
                )
            )
        )
    );

    @Effect()
    deleteEmploye$: Observable<Action> = this.actions$.pipe(
        ofType<employeAction.DeleteEmploye>(
            employeAction.EmployeActionTypes.DELETE_EMPLOYE
        ),
        map((action: employeAction.DeleteEmploye) => action.payload),
        mergeMap((id: string) =>
            this.crudservice.deleteRecord(id).pipe(
                map(() => new employeAction.DeleteEmployeSuccess(id)),
                catchError((err) =>
                    of(new employeAction.DeleteEmployeFailed(err))
                )
            )
        )
    );
}
