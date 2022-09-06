import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from "./home-page/home-page.component";
import { ChainDetailPageComponent } from "./chain-detail-page/chain-detail-page.component";
import {
  SynchronizationScriptsComponent
} from "./chain-detail-page/synchronization-scripts/synchronization-scripts.component";
import { InstallationScriptsComponent } from "./chain-detail-page/installation-scripts/installation-scripts.component";
import { SummaryComponent } from "./chain-detail-page/summary/summary.component";
import { CheatSheetComponent } from "./chain-detail-page/cheat-sheet/cheat-sheet.component";
import { UpgradeScriptsComponent } from "./chain-detail-page/upgrade-scripts/upgrade-scripts.component";
import { ApiComponent } from "./chain-detail-page/api/api.component";

const routes: Routes = [
  {path: '', component: HomePageComponent},
  {
    path: ':id', component: ChainDetailPageComponent,
    children: [
      {path: '', component: SummaryComponent},
      {path: 'installation', component: InstallationScriptsComponent},
      {path: 'sync', component: SynchronizationScriptsComponent},
      {path: 'upgrade', component: UpgradeScriptsComponent},
      {path: 'cheat-sheet', component: CheatSheetComponent},
      {path: 'api', component: ApiComponent}
    ]
  },
  {path: '**', redirectTo: '/', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
