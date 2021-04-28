import { Component } from '@angular/core';
import { WhatasappService } from './whatasapp.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  elementType: 'url' | 'canvas' | 'img' = 'url';
  valueCode: string = 'dummy-code';
  valueKey: string = 'test';
  salida: string ='';

  constructor(private whatsappService:   WhatasappService) {}

  refreshCode() {
    this.valueCode = 'dummy-code';
    this.salida = '...Solicitando QR';

    this.whatsappService.getQRCode(this.valueKey).subscribe((r: { data: string }) => {
      this.valueCode = r.data;
    }, err => {
      this.salida = err.message;
    });
  }

  deleteAllSessions() {
    this.salida = '...Solicitando borrado de sesiones';
    this.whatsappService.deleteAllSessions().subscribe(r=> {
      console.log(r);
    }, err => {
      this.salida = err.message;
    });
  }

  getAllSessions() {
    this.salida = '...Solicitando lista de sesiones';
    this.whatsappService.getAllClients().subscribe(r => {
      console.log(r);
    }, err => {
      this.salida = err.message;
    });
  }
}
