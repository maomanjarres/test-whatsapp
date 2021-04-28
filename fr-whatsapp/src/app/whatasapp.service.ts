import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class WhatasappService {
    api = 'http://localhost:3001/';
    constructor(private httpClient: HttpClient) { }

    getQRCode(key: string) {
        return this.httpClient.get(this.api + '?key='+key);
    }

    getAllClients() {
        return this.httpClient.get(this.api + 'allclients');
    }

    deleteAllSessions() {
        return this.httpClient.delete(this.api + 'clearallsessions');
    }
}