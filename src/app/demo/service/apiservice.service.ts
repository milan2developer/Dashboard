import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { Employe } from "../models/employe.model";

export class ApiService {
    constructor(private url: string, private http: HttpClient) {}

    getAllRecord(): Observable<any> {
        return this.http.get<any>(`${this.url}`).pipe(
            map((res) => {
                return res;
            })
        );
    }
    createRecord(data: Employe): Observable<any> {
        return this.http
            .post<any>(`${this.url}`, data)
            .pipe(catchError(this.handleError));
    }

    updateRecord(changes: Employe): Observable<any> {
        return this.http
            .put<any>(`${this.url}/${changes.id}`, changes)
            .pipe(catchError(this.handleError));
    }

    deleteRecord(id: any): Observable<any> {
        return this.http
            .delete(`${this.url}/${id}`)
            .pipe(catchError(this.handleError));
    }

    getRecordById(id: any): Observable<any> {
        return this.http
            .get(`${this.url}/${id}`)
            .pipe(catchError(this.handleError));
    }

    handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            console.error("An error occurred:", error.error.message);
        } else {
            console.error(
                `Backend returned code ${error.status}, ` +
                    `body was: ${error.error}`
            );
        }
        return throwError("Something bad happened; please try again later.");
    }
}
