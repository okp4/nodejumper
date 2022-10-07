import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LeftHandMenuService {

  constructor() {
  }

  openLeftHandMenuForMobile(): void {
    let body = document.getElementsByTagName('body');
    if (body && body.length) {
      body[0].classList.add('left-hand-menu-open')
    }
  }

  closeLeftHandMenuForMobile(): void {
    let body = document.getElementsByTagName('body');
    if (body && body.length) {
      body[0].classList.remove('left-hand-menu-open')
    }
  }
}
