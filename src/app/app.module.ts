import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import {ChainService} from "./service/chain.service";
import {HomePageComponent} from './home-page/home-page.component';
import {ChainCardComponent} from './home-page/chain-card/chain-card.component';
import {ChainDetailPageComponent} from './chain-detail-page/chain-detail-page.component';
import {FormsModule} from "@angular/forms";
import {HighlightService} from "./service/highlight.service";
import {HttpClientModule} from "@angular/common/http";
import {LeftHandMenuComponent} from './chain-detail-page/left-hand-menu/left-hand-menu.component';
import {
  SynchronizationScriptsComponent
} from './chain-detail-page/synchronization-scripts/synchronization-scripts.component';
import {InstallationScriptsComponent} from './chain-detail-page/installation-scripts/installation-scripts.component';
import {NgxGoogleAnalyticsModule, NgxGoogleAnalyticsRouterModule} from "ngx-google-analytics";
import {SummaryComponent} from './chain-detail-page/summary/summary.component';
import {NgCircleProgressModule} from "ng-circle-progress";
import { NgbModule, NgbTooltipConfig } from "@ng-bootstrap/ng-bootstrap";
import {LeftHandMenuService} from "./service/left-hand-menu.service";
import {CheatSheetComponent} from './chain-detail-page/cheat-sheet/cheat-sheet.component';
import {UpgradeScriptsComponent} from './chain-detail-page/upgrade-scripts/upgrade-scripts.component';
import {ApiComponent} from "./chain-detail-page/api/api.component";
import {Router} from "@angular/router";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {MatSortModule} from '@angular/material/sort';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { TbdComponent } from './chain-detail-page/tbd/tbd.component';
import { DeviceDetectorService } from "ngx-device-detector";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomePageComponent,
    ChainCardComponent,
    ChainDetailPageComponent,
    LeftHandMenuComponent,
    SynchronizationScriptsComponent,
    InstallationScriptsComponent,
    SummaryComponent,
    CheatSheetComponent,
    UpgradeScriptsComponent,
    ApiComponent,
    TbdComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgxGoogleAnalyticsModule.forRoot('G-J46ZYRRDQD'),
    NgxGoogleAnalyticsRouterModule,
    NgCircleProgressModule.forRoot({
      // set defaults here
      outerStrokeWidth: 5,
      innerStrokeWidth: 5,
      outerStrokeColor: "rgba(120, 192, 0, 1)",
      innerStrokeColor: "rgba(120, 192, 0, 0.4)",
      animationDuration: 500,
      animation: true,
      responsive: true
    }),
    NgbModule,
    MatTableModule,
    MatPaginatorModule,
    BrowserAnimationsModule,
    MatSortModule,
    MatProgressSpinnerModule
  ],
  providers: [ChainService, HighlightService, LeftHandMenuService, NgbTooltipConfig],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(router: Router, ngbTooltipConfig: NgbTooltipConfig, deviceService: DeviceDetectorService) {
    ngbTooltipConfig.triggers = deviceService.isMobile() ? 'click:blur' : 'hover focus';
  }
}
