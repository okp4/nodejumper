import { Component } from '@angular/core';
import { LeftHandMenuService } from "./service/left-hand-menu.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'nodejumper';

  constructor(private leftHandMenuService: LeftHandMenuService) {
  }

  closeLeftHandMenuForMobile(): void {
    let body = document.getElementsByTagName('body');
    if (body && body.length && body[0].classList.contains('left-hand-menu-open')) {
      this.leftHandMenuService.closeLeftHandMenuForMobile();
    }
  }
}
