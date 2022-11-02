import { Component, OnInit } from '@angular/core';
import { Chain } from "../model/chain";
import { ChainService } from "../service/chain.service";
import { StateService } from "../service/state.service";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  mainnetChains: Chain[] = [];
  testnetChains: Chain[] = [];
  archiveChains: Chain[] = [];
  upcomingChains: Chain[] = [];
  searchQuery: string = '';
  chainType = 'all';
  showAbout = false;
  showArchive = false;
  chainsCount: number;

  constructor(public chainService: ChainService, public stateService: StateService) {
    this.applyChainTypeWithFilter(this.chainType, "");
  }

  ngOnInit(): void {
    this.stateService.chainType.subscribe({
        next: (chainType: string) => {
          this.chainType = chainType;
          this.applyChainTypeWithFilter(chainType, this.searchQuery);
        }
      }
    );
  }

  onSearchQueryChange(newQuery: string) {
    this.applyChainTypeWithFilter(this.chainType, newQuery)
  }

  applyChainTypeWithFilter(chainType: string, searchText: string): void {
    switch (chainType) {
      case 'mainnet':
        this.mainnetChains = this.chainService.getChains(chainType, searchText);
        this.testnetChains = [];
        this.upcomingChains = this.chainService.getChains(chainType, searchText, false, true);
        this.archiveChains = this.chainService.getChains(chainType, searchText, true);
        this.chainsCount = this.mainnetChains.length;
        break;
      case 'testnet':
        this.mainnetChains = [];
        this.testnetChains = this.chainService.getChains(chainType, searchText);
        this.upcomingChains = this.chainService.getChains(chainType, searchText, false, true);
        this.archiveChains = this.chainService.getChains(chainType, searchText, true);
        this.chainsCount = this.testnetChains.length;
        break;
      case 'upcoming':
        this.mainnetChains = [];
        this.testnetChains = [];
        this.upcomingChains = this.chainService.getChains(chainType, searchText, false, true);
        this.archiveChains = [];
        this.chainsCount = this.upcomingChains.length;
        break;
      case 'all':
      default:
        this.mainnetChains = this.chainService.getChains('mainnet', searchText);
        this.testnetChains = this.chainService.getChains('testnet', searchText);
        this.upcomingChains = this.chainService.getChains('all', searchText, false, true);
        this.archiveChains = this.chainService.getChains('all', searchText, true);
        this.chainsCount = this.mainnetChains.length + this.testnetChains.length;
    }
    if (searchText) {
      this.chainsCount = this.mainnetChains.length
        + this.testnetChains.length
        + this.upcomingChains.length
        + this.archiveChains.length;
      if (this.archiveChains.length) {
        this.showArchive = true;
      }
    }
  }

  rootRouterLink(chain: Chain) {
    if (chain.isSummaryEnabled || chain.isDecentralizationMapEnabled) {
      return '/' + chain.id;
    }
    return '/' + chain.id + '/installation';
  }
}
