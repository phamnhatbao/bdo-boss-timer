import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BossService {

  constructor(
    private http: HttpClient
  ) { }

  getAll() {
    return this.http.get('assets/boss.json');
  }
}
