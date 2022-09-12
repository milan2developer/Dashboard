import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Injectable({ providedIn: "root" })
export class AuthenticationService {
    constructor(private http: HttpClient) {}
    authentication(data) {
        return this.http.get<any>(`${environment.apiUrl}/users`).pipe(
            map((getres) => {
                const user = getres.find((a: any) => {
                    return (
                        a.email === data.value.email &&
                        a.password === data.value.password
                    );
                });
                return user;
            })
        );
    }

    register(signupForm) {
        return this.http
            .post<any>(`${environment.apiUrl}/users`, signupForm.value)
            .pipe(
                map((res) => {
                    return res;
                })
            );
    }
}
