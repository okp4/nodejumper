import { Component, OnInit, ViewChild } from '@angular/core';
import { ChainService } from "../../service/chain.service";
import { Chain } from "../../model/chain";
import { Router } from "@angular/router";
import { UtilsService } from "../../service/utils.service";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { forkJoin, map } from "rxjs";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from '@angular/material/sort';
import { ChartService } from "../../service/chart.service";

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {

  chain: Chain | undefined;
  price: string | undefined;
  summary: any;
  CHART_INTERVAL_DAYS: number;
  noPriceData: boolean | undefined;
  noVolumeData: boolean | undefined;
  noMissedBlocksData: boolean | undefined;
  bondedTokensRatio: any;
  tokensDistributionRatio: any;
  athPriceRatio: any;

  chainSummarySubscription: any;
  coingekoMarketDataSubscription: any;
  chainValidatorsSubscription: any;

  geoLocationDataLength: number | undefined;

  @ViewChild('nodesPerCountryPaginator') nodesPerCountryPaginator: MatPaginator | undefined;
  @ViewChild('nodesPerOrganizationPaginator') nodesPerOrganizationPaginator: MatPaginator | undefined;
  @ViewChild('nodesPerContinentPaginator') nodesPerContinentPaginator: MatPaginator | undefined;
  @ViewChild('nodesPerCountrySort') nodesPerCountrySort: MatSort | undefined;
  @ViewChild('nodesPerOrganizationSort') nodesPerOrganizationSort: MatSort | undefined;
  @ViewChild('nodesPerContinentSort') nodesPerContinentSort: MatSort | undefined;

  nodesPerCountryDisplayColumns = ['country', 'count'];
  nodesPerOrganizationDisplayColumns = ['organization', 'count'];
  nodesPerContinentDisplayColumns = ['continent', 'count'];

  nodesPerCountryDatasource: any;
  nodesPerOrganizationDatasource: any;
  nodesPerContinentDatasource: any;

  isCoingekoChartLoading = true;
  isValidatorChartLoading = true;
  isDecentralizationMapLoading = true;

  strokeInnerColor: string;
  strokeOuterColor: string;
  borderColor: string;
  backgroundColor: string;

  constructor(private router: Router,
              public chainService: ChainService,
              public utilsService: UtilsService,
              private chartService: ChartService) {
    this.CHART_INTERVAL_DAYS = 14;
    this.strokeInnerColor = 'rgba(102, 153, 128, 0.4)';
    this.strokeOuterColor = 'rgba(102, 153, 128, 1)';
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.chain = this.chainService.activeChain;
    if (!this.chain) {
      this.router.navigateByUrl('/');
      return;
    }
    if (this.chain.isSummaryEnabled) {
      const apiChainId = this.chain.apiChainId || this.chain.id;
      this.chainService.getChainSummary(apiChainId)
        .subscribe((summary: any) => {
          const ratio = this.extractBondedTokensRatio(this.chain!, summary);
          this.bondedTokensRatio = ratio;
          this.summary = summary;
          this.summary.blockTime = this.extractBlockTime(summary);
          this.summary.inflation = this.extractInflation(summary);
          this.summary.bondedTokens = this.extractBondedTokens(this.chain!, summary);
          this.summary.totalSupply = this.extractTotalSupply(this.chain!, summary);
          this.summary.communityPool = this.extractCommunityPool(this.chain!, summary);
        });
      const coingekoCoinId = this.chain.coingekoCoinId || this.chain.id;
      this.chainSummarySubscription = this.chainService.getCoingekoSummary(coingekoCoinId)
        .subscribe({
          next: (coingekoSummary: any) => {
            this.price = this.extractPrice(coingekoSummary);
            const ratio = this.extractAthPriceRatio(coingekoSummary);
            if (ratio) {
              this.athPriceRatio = ratio;
            }
          },
          error: (err: any) => {
            this.price = '-';
            this.athPriceRatio = '-';
          }
        });

      this.coingekoMarketDataSubscription = this.chainService.getCoingekoMarketData(coingekoCoinId, this.CHART_INTERVAL_DAYS)
        .subscribe({
          next: (coingekoMarketData: any) => {
            this.isCoingekoChartLoading = false;
            this.drawPriceChart(coingekoMarketData);
            this.drawVolumeChart(coingekoMarketData);
          },
          error: (err: any) => {
            this.isCoingekoChartLoading = false;
            this.noPriceData = true;
            this.noVolumeData = true;
          }
        });

      this.chainValidatorsSubscription = this.chainService.getChainValidators(apiChainId)
        .subscribe((validators: any) => {
          this.isValidatorChartLoading = false;
          const ratio = this.extractTokensDistributionRatio(validators);
          this.tokensDistributionRatio = ratio;
          this.drawVotingPowerChart(validators, this.chain!);
          this.drawCommissionChart(validators);
          this.drawMissedBlocksChart(validators);
        });
    }
    if (this.chain.isDecentralizationMapEnabled) {
      this.chainService.getChainAddressBook(this.chain)
        .subscribe((addressBook: any) => {
          const addressBookEntries: any = [];
          addressBook.addrs
            .filter((address: any) => address.last_success !== '0001-01-01T00:00:00Z')
            .forEach((address: any) => {
            addressBookEntries.push({
              id: address.addr.id,
              ip: address.addr.ip
            });
          });
          this.drawNodesDecentralizationAnalytics(addressBookEntries);
        });
    }
  }

  ngOnDestroy(): void {
    if (this.chainSummarySubscription) {
      this.chainSummarySubscription.unsubscribe();
    }
    if (this.coingekoMarketDataSubscription) {
      this.coingekoMarketDataSubscription.unsubscribe();
    }
    if (this.chainValidatorsSubscription) {
      this.chainValidatorsSubscription.unsubscribe();
    }
  }

  extractBlockTime(summary: any): string {
    return Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(summary.blockTime) + 's';
  }

  extractPrice(coingekoSummary: any): string {
    const price = coingekoSummary?.market_data?.current_price?.usd;
    if (!price) {
      return '-';
    }
    return Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumSignificantDigits: 4
    }).format(price);
  }

  extractInflation(summary: any): string {
    const inflation = summary.inflation;
    if (!inflation) {
      return '-';
    }
    return this.displayPercent(inflation);
  }

  displayPercent(val: any): string {
    return Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
      style: 'percent'
    }).format(val);
  }

  extractBondedTokens(chain: Chain, summary: any): string {
    const bondedTokens = summary.bondedTokens / Math.pow(10, chain.denomPow);
    return this.utilsService.compactNumber(bondedTokens, 1);
  }

  extractTotalSupply(chain: Chain, summary: any): string {
    let totalSupply = this.findTotalSupply(chain, summary);
    totalSupply = totalSupply / Math.pow(10, chain.denomPow);
    return this.utilsService.compactNumber(totalSupply, 1);
  }

  findTotalSupply(chain: Chain, summary: any) {
    let totalSupply = 0;
    summary.totalSupply.supply.forEach(function (item: any) {
      if (item.denom === chain.denomName) {
        totalSupply = +item.amount;
      }
    });
    return totalSupply
  }

  extractCommunityPool(chain: Chain, summary: any): string {
    let communityPool = 0;
    summary.communityPool.forEach(function (item: any) {
      if (item.denom === chain.denomName) {
        communityPool = +item.amount;
      }
    });
    communityPool = communityPool / Math.pow(10, chain.denomPow);
    return this.utilsService.compactNumber(communityPool);
  }

  extractBondedTokensRatio(chain: Chain, summary: any): number {
    const bondedTokens = summary.bondedTokens;
    const totalSupply = this.findTotalSupply(chain, summary);
    return +(bondedTokens / totalSupply * 100).toFixed(2);
  }

  extractTokensDistributionRatio(validators: any): number {
    let totalVotingPower = 0;
    validators.forEach((validator: any) => {
      totalVotingPower += validator.votingPower;
    });
    let validatorsNum = 0;
    let tmpVotingPower = 0;
    let percentage = 0;
    for (let i = 0; i < validators.length && !percentage; i++) {
      const validator = validators[i];
      tmpVotingPower += validator.votingPower;
      validatorsNum++;
      if (tmpVotingPower / totalVotingPower * 100 >= 50) {
        percentage = +(validatorsNum / validators.length * 100).toFixed(2);
      }
    }
    return percentage;
  }

  extractAthPriceRatio(coingekoSummary: any): any {
    const currentPrice = coingekoSummary?.market_data?.current_price?.usd;
    const athPrice = coingekoSummary?.market_data?.ath?.usd;
    if (!currentPrice || !athPrice) {
      return;
    }
    return +(currentPrice / athPrice * 100).toFixed(2);
  }

  drawPriceChart(coingekoMarketData: any): void {
    const prices = coingekoMarketData.prices.slice(0, -1);
    if (!prices.length) {
      this.noPriceData = true;
      return;
    }
    const dataX = prices.map((item: any) => item[0]);
    const dataY = prices.map((item: any) => item[1]);
    const labels: string[] = [];
    dataX.forEach((item: any) => {
      let label = new Date(item);
      labels.push(label.toLocaleDateString('en', {month: 'short', day: 'numeric'}));
    });
    this.chartService.drawLineChart('priceChart', labels, dataY);
  }

  drawVolumeChart(coingekoMarketData: any): void {
    const volume = coingekoMarketData.total_volumes.slice(0, -1);
    if (!volume.length) {
      this.noVolumeData = true;
      return;
    }
    const dataX = volume.map((item: any) => item[0]);
    const dataY = volume.map((item: any) => item[1]);
    const labels: string[] = [];
    dataX.forEach((item: any) => {
      let label = new Date(item);
      labels.push(label.toLocaleDateString('en', {month: 'short', day: 'numeric'}));
    });
    this.chartService.drawLineChart('volumeChart', labels, dataY);
  }

  drawVotingPowerChart(validators: any, chain: Chain): void {
    validators.sort((a: any, b: any) => b.votingPower - a.votingPower)
    const topValidators = validators.slice(0, 9);
    const labels = topValidators.map((validator: any) => validator.moniker);
    const data = topValidators.map((validator: any) => {
      const votingPower = validator.votingPower / Math.pow(10, chain.denomPow);
      return votingPower.toFixed();
    })
    this.chartService.drawVotingPowerBarChart('votingPowerChart', labels, data);
  }

  drawCommissionChart(validators: any): void {
    const commissionDistribution: any = {};
    validators.forEach((validator: any) => {
      if (!commissionDistribution[validator.commission]) {
        commissionDistribution[validator.commission] = 0;
      }
      commissionDistribution[validator.commission]++;
    });

    let sortableArray: any = [];
    for (let commission in commissionDistribution) {
      sortableArray.push([commission, commissionDistribution[commission]]);
    }

    sortableArray = sortableArray.sort((a: any, b: any) => b[1] - a[1]);
    sortableArray = sortableArray.slice(0, 5);

    const labels = sortableArray.map((res: any) => this.displayPercent(res[0]));
    const data = sortableArray.map((res: any) => res[1]);
    this.chartService.drawCommissionBarChart('commissionChart', labels, data);
  }

  drawMissedBlocksChart(validators: any): void {
    validators.sort((a: any, b: any) => a.moniker.length - b.moniker.length);
    const labels = validators.filter((validator: any) => validator.missedBlocks).map((validator: any) => validator.moniker);
    const data = validators.filter((validator: any) => validator.missedBlocks).map((validator: any) => validator.missedBlocks);
    if (!data.length) {
      this.noMissedBlocksData = true;
      return;
    }
    this.chartService.drawMissedBlocksBarChart('missedBlocksChart', labels, data);
  }

  drawNodesDecentralizationAnalytics(addressBookEntries: []) {
    const getIPGeoHttpRequests = this.buildGetIPGeoHttpRequests(addressBookEntries);
    forkJoin(getIPGeoHttpRequests).subscribe((geoLocationData: any) => {
      this.isDecentralizationMapLoading = false;
      this.geoLocationDataLength = this.getGeoLocationDataLength(geoLocationData);
      this.drawGoogleMap(geoLocationData);
      this.drawNodesPerContinentDistributionTable(geoLocationData);
      this.drawNodesPerCountryDistributionTable(geoLocationData);
      this.drawNodesPerOrganizationDistribution(geoLocationData);
    });
  }

  buildGetIPGeoHttpRequests(addressBookEntries: []): any {
    const getIPGeoHttpRequests = [];
    const chunkSize = 50; // 50 is max number of IPs per bulk operation for ipgeolocation.io
    for (let i = 0; i < addressBookEntries.length; i += chunkSize) {
      const chunk = addressBookEntries.slice(i, i + chunkSize);
      const ips = chunk.map((nodeInfo: any) => {
        return nodeInfo.ip;
      });
      const httpRequest = this.chainService.getIPGeoInfoBulk(ips)
        .pipe(map((data: any) => {
          return {
            data: data,
            addressBookEntries: chunk
          };
        }));
      getIPGeoHttpRequests.push(httpRequest);
    }
    return getIPGeoHttpRequests;
  }

  getGeoLocationDataLength(geoLocationData: []): number {
    let geoLocationDataLength = 0;
    geoLocationData.forEach((httpResponse: any) => {
      const data = httpResponse.data;
      geoLocationDataLength += data.filter((geolocation: any) => !geolocation.message).length;
    });
    return geoLocationDataLength;
  }

  drawGoogleMap(geoLocationData: []) {
    const googleMap = new google.maps.Map(document.getElementById('decentralization-map') as HTMLElement, {
      zoom: 1,
      center: {lat: 20, lng: 20},
      streetViewControl: false
    });
    const infoWindow = new google.maps.InfoWindow({
      content: "",
      disableAutoPan: true
    });

    const markers: any = [];
    const markerClustererMap = new MarkerClusterer({markers, map: googleMap});

    geoLocationData.forEach((httpResponse: any) => {
      const data = httpResponse.data;
      const addressBookEntries = httpResponse.addressBookEntries;
      data
        .filter((geolocation: any) => !geolocation.message)
        .forEach((geolocation: any, i: number) => {
          const position = {lat: +geolocation.latitude, lng: +geolocation.longitude};
          const addressBookEntry: any = addressBookEntries[i];
          const label = `Node ID: ${addressBookEntry.id}
                        <br> IP: ${geolocation.ip}
                        <br> Provider: ${geolocation.isp}
                        <br> Country: <img height="20px" src="${geolocation.country_flag}" alt="${geolocation.country_name}"> ${geolocation.country_name}`;
          const marker = new google.maps.Marker({
            position
          });
          marker.addListener("click", () => {
            const innerStyles = "word-wrap: break-word;" +
              "  font-family: 'Monaco', sans-serif !important;" +
              "  font-size: 14px;" +
              "  line-height: 25px;";
            const content = `<div style="${innerStyles}">${label}</div>`;
            infoWindow.setContent(content);
            infoWindow.open(googleMap, marker);
          });
          markers.push(marker);
        });
    });
    markerClustererMap.addMarkers(markers);
  }

  drawNodesPerContinentDistributionTable(geoLocationData: []) {
    const nodesPerContinent: any = {};
    geoLocationData.forEach((httpResponse: any) => {
      const data = httpResponse.data;
      data
        .filter((geolocation: any) => !geolocation.message)
        .forEach((geolocation: any) => {
          const currentCount = nodesPerContinent[geolocation.continent_name] || 0;
          nodesPerContinent[geolocation.continent_name] = currentCount + 1;
        });
    });
    const tableData: any = [];
    for (let continent in nodesPerContinent) {
      const count = nodesPerContinent[continent];
      const total = this.geoLocationDataLength;
      const percentage = this.utilsService.calculatePercentage(count, total!);
      tableData.push({
        continent: continent,
        count: nodesPerContinent[continent],
        countWithPercentage: `${count} (${percentage}%)`
      })
    }
    tableData.sort((a: any, b: any) => {
      return b.count - a.count;
    });
    this.nodesPerContinentDatasource = new MatTableDataSource<any[]>(tableData);
    this.nodesPerContinentDatasource.paginator = this.nodesPerContinentPaginator;
    this.nodesPerContinentDatasource.sort = this.nodesPerContinentSort;
  }

  drawNodesPerCountryDistributionTable(geoLocationData: []) {
    const countryFlags: any = {};
    const nodesPerCountry: any = {};
    geoLocationData.forEach((httpResponse: any) => {
      const data = httpResponse.data;
      data
        .filter((geolocation: any) => !geolocation.message)
        .forEach((geolocation: any) => {
          const currentCount = nodesPerCountry[geolocation.country_name] || 0;
          nodesPerCountry[geolocation.country_name] = currentCount + 1;
          countryFlags[geolocation.country_name] = geolocation.country_flag;
        });
    });
    const tableData: any = [];
    for (let country in nodesPerCountry) {
      const count = nodesPerCountry[country];
      const total = this.geoLocationDataLength;
      const percentage = this.utilsService.calculatePercentage(count, total!);
      tableData.push({
        countryFlag: countryFlags[country],
        country: country,
        count: count,
        countWithPercentage: `${count} (${percentage}%)`
      })
    }
    tableData.sort((a: any, b: any) => {
      return b.count - a.count;
    });
    this.nodesPerCountryDatasource = new MatTableDataSource<any[]>(tableData);
    this.nodesPerCountryDatasource.paginator = this.nodesPerCountryPaginator;
    this.nodesPerCountryDatasource.sort = this.nodesPerCountrySort;
  }

  drawNodesPerOrganizationDistribution(geoLocationData: []) {
    const organizationMergeMap: { [key: string]: string } = {
      'Contabo': 'Contabo GmbH',
      'Amazon Technologies Inc.': 'Amazon.com, Inc.',
      'Charter Communications Inc': 'Charter Communications, Inc',
    };
    const nodesPerOrganization: any = {};
    geoLocationData.forEach((httpResponse: any) => {
      const data = httpResponse.data;
      data
        .filter((geolocation: any) => !geolocation.message)
        .map((geolocation: any) => {
          for (let key in organizationMergeMap) {
            if (!geolocation.organization) {
              geolocation.organization = 'Unknown';
            }
            if (geolocation.organization.toLowerCase() === key.toLowerCase()
              || geolocation.organization.toLowerCase().includes(key.toLowerCase())) {
              geolocation.organization = organizationMergeMap[key];
            }
          }
          return geolocation;
        })
        .forEach((geolocation: any) => {
          const currentCount = nodesPerOrganization[geolocation.organization] || 0;
          nodesPerOrganization[geolocation.organization] = currentCount + 1;
        });
    });
    const tableData: any = [];
    for (let organization in nodesPerOrganization) {
      const count = nodesPerOrganization[organization];
      const total = this.geoLocationDataLength;
      const percentage = this.utilsService.calculatePercentage(count, total!);
      tableData.push({
        organization: organization,
        count: nodesPerOrganization[organization],
        countWithPercentage: `${count} (${percentage}%)`
      })
    }
    tableData.sort((a: any, b: any) => {
      return b.count - a.count;
    });
    this.nodesPerOrganizationDatasource = new MatTableDataSource<any[]>(tableData);
    this.nodesPerOrganizationDatasource.paginator = this.nodesPerOrganizationPaginator;
    this.nodesPerOrganizationDatasource.sort = this.nodesPerOrganizationSort;
    this.drawNodesPerOrganizationChart(tableData);
  }

  drawNodesPerOrganizationChart(tableData: any[]): void {
    const customShortOrganizationNames : { [key: string]: string } = {
      'The Constant Company, LLC': 'The Constant'
    };
    const topOrganizations = tableData.slice(0, 5);
    const otherOrganizations = tableData.slice(5);
    const otherOrganization = {
      organization: 'Others',
      count: 0,
      countWithPercentage: ''
    };
    otherOrganizations.forEach((organization: any) => {
      otherOrganization.count += organization.count;
    })
    if (otherOrganization.count) {
      topOrganizations.push(otherOrganization);
    }

    const labels = topOrganizations.map((organization => {
      const count = organization.count;
      const total = this.geoLocationDataLength;
      const percentage = this.utilsService.calculatePercentage(count, total!);
      let shortOrganizationName = organization.organization.split(' ')[0].replace(',', '');
      Object.keys(customShortOrganizationNames).forEach((name: string) => {
        if (name === organization.organization) {
          shortOrganizationName = customShortOrganizationNames[name];
        }
      })
      return `${shortOrganizationName} (${percentage}%)`;
    }));
    const data = topOrganizations.map((organization) => organization.count);
    this.chartService.drawNodesPerOrganizationBarChart('organizationChart', labels, data);
  }
}
