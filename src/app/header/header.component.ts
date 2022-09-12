import { Component, OnInit } from '@angular/core';
import { LeftHandMenuService } from "../service/left-hand-menu.service";
import { StateService } from "../service/state.service";
import { ViewportScroller } from "@angular/common";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private leftHandMenuService: LeftHandMenuService,
              private stateService: StateService,
              private viewportScroller: ViewportScroller) {
  }

  ngOnInit(): void {
  }

  openLeftHandMenuForMobile(): void {
    this.leftHandMenuService.openLeftHandMenuForMobile();
  }

  handleLogoClick() {
    this.stateService.chainType.next('all');
    this.viewportScroller.scrollToPosition([0, 0]);
  }
}
