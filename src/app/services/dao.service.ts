import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export default class DaoService {
    private apiAddress: string = environment.apiUrl;
    
    constructor(private httpClient: HttpClient) {}
    
    sendGetRequest(endpoint: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        
        return this.httpClient.get<any>(this.apiAddress + endpoint, { headers: headers });
    }

    sendPostRequest(endpoint: string, body: any): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        return this.httpClient.post<any>(this.apiAddress + endpoint, body, { headers: headers});
    }
}