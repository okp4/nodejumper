import { Component, Input, OnInit } from '@angular/core';
import { Chain } from "../../model/chain";
import { ChainStatus } from "../../model/chainStatus";
import { ViewportScroller } from '@angular/common';
import { LeftHandMenuService } from "../../service/left-hand-menu.service";
import { ChainService } from "../../service/chain.service";
import { UtilsService } from "../../service/utils.service";

@Component({
  selector: 'app-left-hand-menu',
  templateUrl: './left-hand-menu.component.html',
  styleUrls: ['./left-hand-menu.component.css']
})
export class LeftHandMenuComponent implements OnInit {

  @Input() chain?: Chain;
  chainStatus?: ChainStatus;
  chainStatusMessage?: string;

  constructor(private leftHandMenuService: LeftHandMenuService,
              public chainService: ChainService,
              private utilsService: UtilsService,
              private viewportScroller: ViewportScroller) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const barsMenuIcon = document.getElementById('btn-bars-menu');
    barsMenuIcon?.classList.remove('hide');
    const socialIcons = document.getElementsByClassName('btn-social');
    if (socialIcons && socialIcons.length) {
      for (let i = 0; i < socialIcons.length; i++) {
        socialIcons.item(i)?.classList.add('hide');
      }
    }
    if (this.chain && !this.chain.isArchive && !this.chain.isUpcoming) {
      this.chainService.getChainStatus(this.chain)
        .subscribe({
          next: (data: any) => {
            const latestBlockHeight = data.result.sync_info.latest_block_height;
            const latestBlockTime = data.result.sync_info.latest_block_time;
            const timeDifferenceInSeconds = this.utilsService.humanReadableTimeDifferenceSeconds(latestBlockTime);
            this.chainStatus = timeDifferenceInSeconds > 60 ? ChainStatus.HALTED : ChainStatus.SYNCED;
            this.chainStatusMessage = `Latest Block: ${latestBlockHeight}\n`;
            if (timeDifferenceInSeconds > 0) {
              this.chainStatusMessage += `(${this.utilsService.secondsToHumanReadableFormat(timeDifferenceInSeconds)} ago)`;
            }
          },
          error: (error: any) => {
            this.chainStatus = ChainStatus.INACTIVE;
            this.chainStatusMessage = 'RPC server is temporary unavailable.';
          }
        });
    }
  }

  ngOnDestroy(): void {
    const barsMenuIcon = document.getElementById('btn-bars-menu');
    barsMenuIcon?.classList.add('hide');
    const socialIcons = document.getElementsByClassName('btn-social');
    if (socialIcons && socialIcons.length) {
      for (let i = 0; i < socialIcons.length; i++) {
        socialIcons.item(i)?.classList.remove('hide');
      }
    }
  }

  scrollToFragment(fragmentId: string) {
    this.viewportScroller.scrollToAnchor(fragmentId);
  }
}
