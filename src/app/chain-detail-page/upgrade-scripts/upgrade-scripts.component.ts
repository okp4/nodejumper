import { Component, OnInit } from '@angular/core';
import { Chain } from "../../model/chain";
import { HighlightService } from "../../service/highlight.service";
import { HttpClient } from "@angular/common/http";
import { ChainService } from "../../service/chain.service";
import { UpgradeData } from "../../model/upgradeData";

@Component({
  selector: 'app-upgrade-scripts',
  templateUrl: './upgrade-scripts.component.html',
  styleUrls: ['./upgrade-scripts.component.css']
})
export class UpgradeScriptsComponent implements OnInit {

  chain?: Chain;
  upgradeDataArray?: Array<UpgradeData>;

  constructor(private highlightService: HighlightService,
              private http: HttpClient,
              public chainService: ChainService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.chain = this.chainService.activeChain;
    if (this.chain) {
      const salt = (new Date()).getTime();
      const chainName = this.chain.chainName.toLowerCase();
      const url = `https://raw.githubusercontent.com/nodejumper-org/cosmos-scripts/master/${chainName}/upgrade/upgrades.json?${salt}`;
      this.http.get(url).subscribe({
        next: (data: any) => {
          (<Array<UpgradeData>>data).sort((a, b) => {
            return b.height - a.height;
          });
          data.forEach((upgradeScript: UpgradeData) => {
            this.fetchManualUpgradeScriptContent(upgradeScript);
          });
          this.upgradeDataArray = data;
          this.highlightService.highlightAll();
        },
        error: (error: any) => {
          this.upgradeDataArray = [];
        }
      });
    }
  }

  fetchManualUpgradeScriptContent(upgradeScript: UpgradeData) {
    const salt = (new Date()).getTime();
    const chainName = this.chain?.chainName.toLowerCase();
    const url = `https://raw.githubusercontent.com/nodejumper-org/cosmos-scripts/master/${chainName}/upgrade/${upgradeScript.version}/upgrade_manual.sh?${salt}`;
    this.http.get(url, {responseType: 'text'}).subscribe((data: any) => {
      upgradeScript.manualScriptContent = data.trim();
      upgradeScript.manualScriptContent += `\nsudo journalctl -u ${this.chain?.serviceName} -f --no-hostname -o cat`;
      this.highlightService.highlightAllUnder(document.getElementById(upgradeScript.version));
    });
  }
}
