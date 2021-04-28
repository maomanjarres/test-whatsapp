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

  constructor(private whatsappService:   WhatasappService) {}

  refreshCode() {
    this.whatsappService.getQRCode(this.valueKey).subscribe((r: { data: string }) => {
      this.valueCode = r.data;
    });
  }

  deleteAllSessions() {
    this.whatsappService.deleteAllSessions().subscribe(r=> {
      console.log(r);
    });
  }

  getAllSessions() {
    this.whatsappService.getAllClients().subscribe(r => {
      console.log(r);
    });
  }
}
