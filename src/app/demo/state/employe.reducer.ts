import { Employe } from "../models/employe.model";
import * as employeAction from "./employe.action";
import * as fromRoot from "./app-state";
import { createFeatureSelector, createSelector } from "@ngrx/store";
import { EntityState, EntityAdapter, createEntityAdapter } from "@ngrx/entity";

export interface EmployeState extends EntityState<Employe> {
    selectEmployeId: number | null;
    loading: boolean;
    loaded: boolean;
    error: string;
}

export interface AppState extends fromRoot.AppState {
    employes: EmployeState;
}

export const employeAdapter: EntityAdapter<Employe> =
    createEntityAdapter<Employe>();

export const defaultEmploye: EmployeState = {
    ids: [],
    entities: {},
    selectEmployeId: null,
    loading: false,
    loaded: false,
    error: "",
};
export const initialateState: EmployeState =
    employeAdapter.getInitialState(defaultEmploye);

export function employeReducer(
    state = initialateState,
    action: employeAction.EmpolyeActions
): EmployeState {
    switch (action.type) {
        case employeAction.EmployeActionTypes.LOAD_EMPLOYES_SUCCESS:
            return employeAdapter.addMany(action.payload, {
                ...state,
                loading: false,
                loaded: true,
            });
        case employeAction.EmployeActionTypes.LOAD_EMPLOYES_FAILED:
            return {
                ...state,
                entities: {},
                loading: false,
                loaded: false,
                error: action.payload,
            };
        case employeAction.EmployeActionTypes.CREATE_EMPLOYE_SUCCESS:
            return employeAdapter.addOne(action.payload, state);
        case employeAction.EmployeActionTypes.CREATE_EMPLOYE_FAILED:
            return {
                ...state,
                error: action.payload,
            };

        case employeAction.EmployeActionTypes.UPDATE_EMPLOYE_SUCCESS:
            return employeAdapter.updateOne(action.payload, state);
        case employeAction.EmployeActionTypes.UPDATE_EMPLOYE_FAILED:
            return {
                ...state,
                error: action.payload,
            };

        case employeAction.EmployeActionTypes.DELETE_EMPLOYE_SUCCESS:
            return employeAdapter.removeOne(action.payload, state);
        case employeAction.EmployeActionTypes.DELETE_EMPLOYE_FAILED:
            return {
                ...state,
                error: action.payload,
            };

        default:
            return state;
    }
}

const getEmployeFeatureState = createFeatureSelector<EmployeState>("employe");

export const getEmploye = createSelector(
    getEmployeFeatureState,
    employeAdapter.getSelectors().selectAll
);

export const getError = createSelector(
    getEmployeFeatureState,
    (state: EmployeState) => state.error
);
export const getEmployeLoading = createSelector(
    getEmployeFeatureState,
    (state: EmployeState) => state.loading
);
export const getEmployeLoaded = createSelector(
    getEmployeFeatureState,
    (state: EmployeState) => state.loaded
);

export const getCurrentEmployeId = createSelector(
    getEmployeFeatureState,
    (state: EmployeState) => state.selectEmployeId
);

export const getCurrentEmploye = createSelector(
    getEmployeFeatureState,
    getCurrentEmployeId,
    (state) => state.entities[state.selectEmployeId]
);
