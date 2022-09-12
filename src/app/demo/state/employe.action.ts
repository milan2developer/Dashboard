import { Action } from "@ngrx/store";
import { Employe } from "../models/employe.model";

import { Update } from "@ngrx/entity";

export enum EmployeActionTypes {
    LOAD_EMPLOYES = `[Load] Load Employes`,
    LOAD_EMPLOYES_SUCCESS = `[Load] Load Employes Success`,
    LOAD_EMPLOYES_FAILED = `[Load] Load Employes Failed`,
    LOAD_EMPLOYE = `[Load] Load Employe`,
    LOAD_EMPLOYE_SUCCESS = `[Load] Load Employe Success`,
    LOAD_EMPLOYE_FAILED = `[Load] Load Employe Failed`,
    CREATE_EMPLOYE = `[Create] Create Employe`,
    CREATE_EMPLOYE_SUCCESS = `[Create] Create Employe Success`,
    CREATE_EMPLOYE_FAILED = `[Create] Create Employe Failed`,
    UPDATE_EMPLOYE = `[Update] Update Employe`,
    UPDATE_EMPLOYE_SUCCESS = `[Update] Update Employe Success`,
    UPDATE_EMPLOYE_FAILED = `[Update] Update Employe Failed`,
    DELETE_EMPLOYE = `[Delete] Delete Employe`,
    DELETE_EMPLOYE_SUCCESS = `[Delete] Delete Employe Success`,
    DELETE_EMPLOYE_FAILED = `[Delete] Delete Employe Failed`,
}

export class LoadEmployes implements Action {
    readonly type = EmployeActionTypes.LOAD_EMPLOYES;
}

export class LoadEmployesSuccess implements Action {
    readonly type = EmployeActionTypes.LOAD_EMPLOYES_SUCCESS;
    constructor(public payload: Employe[]) {}
}

export class LoadEmployesFailed implements Action {
    readonly type = EmployeActionTypes.LOAD_EMPLOYES_FAILED;
    constructor(public payload: string) {}
}
export class LoadEmploye implements Action {
    readonly type = EmployeActionTypes.LOAD_EMPLOYE;
    constructor(public payload: number) {}
}

export class LoadEmployeSuccess implements Action {
    readonly type = EmployeActionTypes.LOAD_EMPLOYE_SUCCESS;
    constructor(public payload: Employe) {}
}

export class LoadEmployeFailed implements Action {
    readonly type = EmployeActionTypes.LOAD_EMPLOYE_FAILED;
    constructor(public payload: string) {}
}
export class CreateEmploye implements Action {
    readonly type = EmployeActionTypes.CREATE_EMPLOYE;
    constructor(public payload: Employe) {}
}

export class CreateEmployeSuccess implements Action {
    readonly type = EmployeActionTypes.CREATE_EMPLOYE_SUCCESS;
    constructor(public payload: Employe) {}
}

export class CreateEmployeFailed implements Action {
    readonly type = EmployeActionTypes.CREATE_EMPLOYE_FAILED;
    constructor(public payload: string) {}
}

export class UpdateEmploye implements Action {
    readonly type = EmployeActionTypes.UPDATE_EMPLOYE;
    constructor(public payload: Employe) {}
}

export class UpdateEmployeSuccess implements Action {
    readonly type = EmployeActionTypes.UPDATE_EMPLOYE_SUCCESS;
    constructor(public payload: Update<Employe>) {}
}

export class UpdateEmployeFailed implements Action {
    readonly type = EmployeActionTypes.UPDATE_EMPLOYE_FAILED;
    constructor(public payload: string) {}
}
export class DeleteEmploye implements Action {
    readonly type = EmployeActionTypes.DELETE_EMPLOYE;
    constructor(public payload: string) {}
}

export class DeleteEmployeSuccess implements Action {
    readonly type = EmployeActionTypes.DELETE_EMPLOYE_SUCCESS;
    constructor(public payload: string) {}
}

export class DeleteEmployeFailed implements Action {
    readonly type = EmployeActionTypes.DELETE_EMPLOYE_FAILED;
    constructor(public payload: string) {}
}

export type EmpolyeActions =
    | LoadEmployes
    | LoadEmployesSuccess
    | LoadEmployesFailed
    | LoadEmploye
    | LoadEmployeSuccess
    | LoadEmployeFailed
    | CreateEmploye
    | CreateEmployeSuccess
    | CreateEmployeFailed
    | UpdateEmploye
    | UpdateEmployeFailed
    | UpdateEmployeSuccess
    | DeleteEmploye
    | DeleteEmployeSuccess
    | DeleteEmployeFailed;
