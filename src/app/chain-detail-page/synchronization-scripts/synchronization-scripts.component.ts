import { Component, OnInit } from '@angular/core';
import { Chain } from "../../model/chain";
import { HighlightService } from "../../service/highlight.service";
import { ChainService } from "../../service/chain.service";
import { SnapshotData } from "../../model/snapshotData";
import { UtilsService } from "../../service/utils.service";

@Component({
  selector: 'app-synchronization-data',
  templateUrl: './synchronization-scripts.component.html',
  styleUrls: ['./synchronization-scripts.component.css']
})
export class SynchronizationScriptsComponent implements OnInit {

  MAX_LIVE_PEERS = 100;

  chain?: Chain;
  snapshotData?: SnapshotData;
  snapshotBlockTime?: string;
  livePeers: string[] = [];

  constructor(private highlightService: HighlightService,
              public chainService: ChainService,
              private utilsService: UtilsService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.chain = this.chainService.activeChain;
    if (this.chain) {
      if (!this.chain.isArchive) {
        this.chainService.getChainNetInfo(this.chain)
          .subscribe((data: any) => {
              this.livePeers.push(this.chain?.rpcPeer || '');
              let peersArray = data.result.peers;
              for (let i = 0; i < peersArray.length && this.livePeers.length < this.MAX_LIVE_PEERS; i++) {
                const peerId = peersArray[i].node_info.id;
                const listenAddr = peersArray[i].node_info.listen_addr;
                const listenPort = listenAddr.slice(listenAddr.lastIndexOf(':') + 1);
                const remoteIp = peersArray[i].remote_ip;
                if (this.utilsService.isIP6Address(remoteIp)) {
                  this.livePeers.push(`${peerId}@[${remoteIp}]:${listenPort}`);
                } else {
                  this.livePeers.push(`${peerId}@${remoteIp}:${listenPort}`);
                }
              }
              this.updateLivePeersView();
            }
          );
      }
      this.chainService.getChainSnapshotInfo(this.chain)
        .subscribe((data: any) => {
          const snapshotHeight = data.snapshotHeight;
          const snapshotSize = data.snapshotSize + 'B';
          const snapshotBlockTime = this.utilsService.humanReadableTimeDifferenceString(data.snapshotBlockTime);
          this.snapshotData = new SnapshotData(snapshotHeight, snapshotSize, snapshotBlockTime);
          if (snapshotBlockTime && !snapshotBlockTime.startsWith('-')) {
            this.snapshotBlockTime = snapshotBlockTime;
          }
        });
    }
    this.highlightService.highlightAll(this.highlightLinks.bind(this));

  }

  updateLivePeersView(): void {
    const livePeersString = this.livePeers.join(',');
    const peersRow = document.getElementById('peers-row');
    if (peersRow) {
      peersRow.innerHTML = livePeersString;
    }
    const updatePeersRow = document.getElementById('update-peers-row')?.getElementsByClassName('token string')?.item(0);
    if (updatePeersRow) {
      updatePeersRow.innerHTML = `"${livePeersString}"`;
    }
  }

  highlightLinks(): void {
    const rpcLinkElement = document.getElementById('rpc-link');
    const apiLinkElement = document.getElementById('api-link');
    if (rpcLinkElement && apiLinkElement) {
      rpcLinkElement.innerHTML = `<a href="${this.chain?.rpcServer}" target="_blank">${this.chain?.rpcServer}</a>`;
      apiLinkElement.innerHTML = `<a href="${this.chain?.rpcServer + ':1317'}" target="_blank">${this.chain?.rpcServer + ':1317'}</a>`;
    }
  }
}
