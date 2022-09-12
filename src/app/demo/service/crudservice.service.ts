import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { ApiService } from "./apiservice.service";

@Injectable({
    providedIn: "root",
})
export class CrudService extends ApiService {
    constructor(http: HttpClient) {
        super(environment.apiUrl + "/employes", http);
    }
}
