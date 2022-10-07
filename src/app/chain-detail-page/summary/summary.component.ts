import { Component, OnInit, ViewChild } from '@angular/core';
import { ChainService } from "../../service/chain.service";
import { Chain } from "../../model/chain";
import Chart from 'chart.js/auto';
import { Router } from "@angular/router";
import { UtilsService } from "../../service/utils.service";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { forkJoin, map } from "rxjs";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {

  chain?: Chain;
  price?: string;
  summary?: any;
  CHART_INTERVAL_DAYS: number;
  noPrices?: boolean;
  noVolumes?: boolean;
  noMissedBlocks?: boolean;
  bondedTokensRatio?: any;
  tokensDistributionRatio?: any;
  athPriceRatio?: any;

  innerStrokeColor_SUCCESS: string;
  outerStrokeColor_SUCCESS: string;
  innerStrokeColor_WARN: string;
  outerStrokeColor_WARN: string;
  innerStrokeColor_DANGER: string;
  outerStrokeColor_DANGER: string;

  chainSummarySubscription: any;
  coingekoMarketDataSubscription: any;
  chainValidatorsSubscription: any;

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatPaginator) nodesPerCountryPaginator?: MatPaginator;

  nodesPerCountryData = [];
  nodesPerCountryDisplayColumns = ['country', 'count'];
  nodesPerCountryDatasource?: any;
  nodesPerCountryPageSize = 5;
  nodesPerCountryCurrentPage = 0;
  nodesPerCountryTotalSize = 0;

  @ViewChild(MatPaginator) nodesPerOrganizationPaginator?: MatPaginator;

  nodesPerOrganizationData = [];
  nodesPerOrganizationDisplayColumns = ['organization', 'count'];
  nodesPerOrganizationDatasource?: any;
  nodesPerOrganizationPageSize = 5;
  nodesPerOrganizationCurrentPage = 0;
  nodesPerOrganizationTotalSize = 0;

  constructor(private router: Router,
              public chainService: ChainService,
              public utilsService: UtilsService) {
    this.CHART_INTERVAL_DAYS = 14;
    this.innerStrokeColor_SUCCESS = 'rgba(120, 192, 0, 0.4)';
    this.outerStrokeColor_SUCCESS = 'rgba(120, 192, 0, 1)';
    this.innerStrokeColor_WARN = 'rgba(255, 193, 7, 0.4)';
    this.outerStrokeColor_WARN = 'rgba(255, 193, 7, 1)';
    this.innerStrokeColor_DANGER = 'rgba(220, 53, 69, 0.4)';
    this.outerStrokeColor_DANGER = 'rgba(220, 53, 69, 1)';
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.chain = this.chainService.activeChain;
    if (this.chain && !this.chain.summaryDisabled) {
      let apiChainId = this.chain.apiChainId || this.chain.id;
      this.chainService.getChainSummary(apiChainId)
        .subscribe((summary: any) => {
          if (this.chain) {
            let ratio = this.extractBondedTokensRatio(this.chain, summary);
            this.bondedTokensRatio = {
              ratio: ratio,
              innerStrokeColor: this.innerStokeColorForRatio(ratio, 10, 25),
              outerStrokeColor: this.outerStokeColorByRatio(ratio, 10, 25)
            };
            this.summary = summary;
            this.summary.blockTime = this.extractBlockTime(summary);
            this.summary.inflation = this.extractInflation(summary);
            this.summary.bondedTokens = this.extractBondedTokens(this.chain, summary);
            this.summary.totalSupply = this.extractTotalSupply(this.chain, summary);
            this.summary.communityPool = this.extractCommunityPool(this.chain, summary);
          }
        });
      let coingekoCoinId = this.chain.coingekoCoinId || this.chain.id;
      this.chainSummarySubscription = this.chainService.getCoingekoSummary(coingekoCoinId)
        .subscribe((coingekoSummary: any) => {
          this.price = this.extractPrice(coingekoSummary);
          let ratio = this.extractAthPriceRatio(coingekoSummary);
          if (ratio) {
            this.athPriceRatio = {
              ratio: ratio,
              innerStrokeColor: this.innerStokeColorForRatio(ratio, 10, 40),
              outerStrokeColor: this.outerStokeColorByRatio(ratio, 10, 40)
            };
          }
        });

      this.coingekoMarketDataSubscription = this.chainService.getCoingekoMarketData(coingekoCoinId, this.CHART_INTERVAL_DAYS)
        .subscribe((coingekoMarketData: any) => {
          this.drawPriceChart(coingekoMarketData);
          this.drawVolumeChart(coingekoMarketData);
        });

       this.chainValidatorsSubscription = this.chainService.getChainValidators(apiChainId)
        .subscribe((validators: any) => {
          if (this.chain) {
            let ratio = this.extractTokensDistributionRatio(validators);
            this.tokensDistributionRatio = {
              ratio: ratio,
              innerStrokeColor: this.innerStokeColorForRatio(ratio, 10, 25),
              outerStrokeColor: this.outerStokeColorByRatio(ratio, 10, 25)
            };
            this.drawVotingPowerChart(validators, this.chain);
            this.drawCommissionDistributionChart(validators);
            this.drawMissedBlocksChart(validators);
          }
        });

      this.chainService.getChainAddressBook(this.chain)
        .subscribe((addressBook: any) => {
          const addressBookEntries: any = [];
          addressBook.addrs.forEach((address: any) => {
            addressBookEntries.push({
              id: address.addr.id,
              ip: address.addr.ip
            });
          });
          this.drawNodesDistributionAnalytics(addressBookEntries);
        });
    } else {
      this.router.navigateByUrl('/');
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
    let price = coingekoSummary?.market_data?.current_price?.usd;
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
    let inflation = summary.inflation;
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
    let bondedTokens = summary.bondedTokens / Math.pow(10, chain.denomPow);
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
    let bondedTokens = summary.bondedTokens;
    let totalSupply = this.findTotalSupply(chain, summary);
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
      let validator = validators[i];
      tmpVotingPower += validator.votingPower;
      validatorsNum++;
      if (tmpVotingPower / totalVotingPower * 100 >= 50) {
        percentage = +(validatorsNum / validators.length * 100).toFixed(2);
      }
    }
    return percentage;
  }

  extractAthPriceRatio(coingekoSummary: any): any {
    let currentPrice = coingekoSummary?.market_data?.current_price?.usd;
    let athPrice = coingekoSummary?.market_data?.ath?.usd;
    if (!currentPrice || !athPrice) {
      return;
    }
    return +(currentPrice / athPrice * 100).toFixed(2);
  }

  innerStokeColorForRatio(ratio: number, limit1: number, limit2: number) : string {
    return ratio <= limit1
      ? this.innerStrokeColor_DANGER
      : ratio <= limit2
        ? this.innerStrokeColor_WARN
        : this.innerStrokeColor_SUCCESS;
  }

  outerStokeColorByRatio(ratio: number, limit1: number, limit2: number) : string {
    return ratio <= limit1
      ? this.outerStrokeColor_DANGER
      : ratio <= limit2
        ? this.outerStrokeColor_WARN
        : this.outerStrokeColor_SUCCESS;
  }

  drawPriceChart(coingekoMarketData: any): void {
    let prices = coingekoMarketData.prices.slice(0, -1);
    if (!prices.length) {
      this.noPrices = true;
      return;
    }

    let pricesX = prices.map((item: any) => item[0]);
    let pricesY = prices.map((item: any) => item[1]);

    let pricesLabels: any = [];
    pricesX.forEach((item: any) => {
      let priceLabel = new Date(item);
      pricesLabels.push(priceLabel.toLocaleDateString('en', {month: 'short', day: 'numeric'}));
    });

    let priceChart = new Chart('priceChart', {
      type: 'line',
      data: {
        labels: pricesLabels,
        datasets: [
          {
            data: pricesY,
            borderColor: "rgb(234, 128, 252)",
            backgroundColor: "rgb(234, 128, 252, 0.1)",
            fill: true,
            borderWidth: 2,
            tension: 0.4,
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            titleFont: {
              size: 20,
              family: 'Monaco'
            },
            bodyFont: {
              size: 20,
              family: 'Monaco'
            },
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        responsive: true,
        interaction: {
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            ticks: {
              font: {
                size: 15,
                family: 'Monaco'
              }
            }
          },
          y: {
            display: true,
            ticks: {
              font: {
                size: 15,
                family: 'Monaco'
              }
            }
          }
        }
      }
    });
  }

  drawVolumeChart(coingekoMarketData: any): void {
    let _this = this;
    let volume = coingekoMarketData.total_volumes.slice(0, -1);
    if (!volume.length) {
      this.noVolumes = true;
      return;
    }

    let volumeX = volume.map((item: any) => item[0]);
    let volumeY = volume.map((item: any) => item[1]);

    let volumeLabels: any = [];
    volumeX.forEach((item: any) => {
      let volumeLabel = new Date(item);
      volumeLabels.push(volumeLabel.toLocaleDateString('en', {month: 'short', day: 'numeric'}));
    });

    let volumeChart = new Chart('volumeChart', {
      type: 'line',
      data: {
        labels: volumeLabels,
        datasets: [
          {
            data: volumeY,
            borderColor: "rgb(234, 128, 252)",
            backgroundColor: "rgb(234, 128, 252, 0.1)",
            fill: true,
            borderWidth: 2,
            tension: 0.4,
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            titleFont: {
              size: 20,
              family: 'Monaco'
            },
            bodyFont: {
              size: 20,
              family: 'Monaco'
            },
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        responsive: true,
        interaction: {
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            ticks: {
              font: {
                size: 15,
                family: 'Monaco'
              }
            }
          },
          y: {
            display: true,
            ticks: {
              font: {
                size: 15,
                family: 'Monaco'
              },
              callback: function (value) {
                return _this.utilsService.compactNumber(parseInt(value.toString()), 2);
              }
            },
          }
        }
      }
    });
  }

  drawVotingPowerChart(validators: any, chain: Chain): void {
    let _this = this;
    validators.sort((a: any, b: any) => b.votingPower - a.votingPower)
    let top20validators = validators.slice(0, 9);
    let labels = top20validators.map((validator: any) => validator.moniker);
    let data = top20validators.map((validator: any) => validator.votingPower / Math.pow(10, chain.denomPow))
    let votingPowerChart = new Chart('votingPowerChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [
              '#89D4F5', '#BCD759', '#FFBF00', '#9961A7',
              '#4891EA', '#EE965B', '#F284D1', '#6FDBCB',
              '#2D71C4', '#EF5A5A', '#609C29', '#C69B06',
              '#8A2299', '#996D6C', '#2F2F6C', '#1C6C61',
            ]
          }
        ]
      },
      options: {
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            titleFont: {
              size: 20,
              family: 'Monaco'
            },
            bodyFont: {
              size: 20,
              family: 'Monaco'
            },
            callbacks: {
              title: function () {
                return ''
              },
              label: function (context) {
                let label = context.label || '';
                let value = context.dataset.data[context.dataIndex];
                return label  + ': ' + value;
              },
            },
          }
        },
        responsive: true,
        scales: {
          y: {
            display: true,
            ticks: {
              font: {
                size: 15,
                family: 'Monaco'
              },
              callback: function (value, index) {
                let label = this.getLabelForValue(index);
                return label && label.length > 15
                  ? label.substring(0, 11) + '...'
                  : label;
              }
            }
          },
          x: {
            display: true,
            ticks: {
              precision: 0,
              font: {
                size: 15,
                family: 'Monaco'
              },
              callback: function (value) {
                return _this.utilsService.compactNumber(parseInt(value.toString()));
              }
            }
          }
        }
      }
    });
  }

  drawCommissionDistributionChart(validators: any): void {
    let commissionDistribution: any = {};
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

    let labels = sortableArray.map((res: any) => this.displayPercent(res[0]));
    let data = sortableArray.map((res: any) => res[1]);
    let commissionChart = new Chart('commissionChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [
              '#89D4F5', '#BCD759', '#FFBF00', '#9961A7',
              '#4891EA', '#EE965B', '#F284D1', '#6FDBCB',
              '#2D71C4', '#EF5A5A', '#609C29', '#C69B06',
              '#8A2299', '#996D6C', '#2F2F6C', '#1C6C61',
            ]
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            titleFont: {
              size: 20,
              family: 'Monaco'
            },
            bodyFont: {
              size: 20,
              family: 'Monaco'
            },
            callbacks: {
              title: function () {
                return ''
              },
              label: function (context) {
                let label = context.label || '';
                let value = context.dataset.data[context.dataIndex];
                return label  + ': ' + value;
              },
            },
          }
        },
        responsive: true,
        interaction: {
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            ticks: {
              font: {
                size: 15,
                family: 'Monaco'
              }
            }
          },
          y: {
            display: true,
            ticks: {
              precision: 0,
              font: {
                size: 15,
                family: 'Monaco'
              }
            }
          }
        }
      }
    });
  }

  drawMissedBlocksChart(validators: any): void {

    let labels = validators.filter((validator: any) => validator.missedBlocks).map((validator: any) => validator.moniker);
    let data = validators.filter((validator: any) => validator.missedBlocks).map((validator: any) => validator.missedBlocks);

    if (!data.length) {
      this.noMissedBlocks = true;
      return;
    }

    let missedBlocksChart = new Chart('missedBlocksChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: [
              '#89D4F5', '#BCD759', '#FFBF00', '#9961A7',
              '#4891EA', '#EE965B', '#F284D1', '#6FDBCB',
              '#2D71C4', '#EF5A5A', '#609C29', '#C69B06',
              '#8A2299', '#996D6C', '#2F2F6C', '#1C6C61',
            ]
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            titleFont: {
              size: 20,
              family: 'Monaco'
            },
            bodyFont: {
              size: 20,
              family: 'Monaco'
            },
            callbacks: {
              title: function () {
                return ''
              },
              label: function (context) {
                let label = context.label || '';
                let value = context.dataset.data[context.dataIndex];
                return label  + ': ' + value;
              },
            },
          }
        },
        responsive: true,
        interaction: {
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            ticks: {
              font: {
                size: 15,
                family: 'Monaco'
              },
              callback: function (value, index) {
                let label = this.getLabelForValue(index);
                return label && label.length > 15
                  ? label.substring(0, 11) + '...'
                  : label;
              }
            }
          },
          y: {
            display: true,
            ticks: {
              precision: 0,
              font: {
                size: 15,
                family: 'Monaco'
              }
            }
          }
        }
      }
    });
  }

  drawNodesDistributionAnalytics(addressBookEntries: []) {
    const getIPGeoHttpRequests = this.buildGetIPGeoHttpRequests(addressBookEntries);
    forkJoin(getIPGeoHttpRequests).subscribe((geoLocationData: any) => {
      this.drawGoogleMap(geoLocationData);
      this.drawNodesPerCountryDistributionTable(geoLocationData);
      this.drawNodesPerOrganizationDistributionTable(geoLocationData);
    });
  }

  buildGetIPGeoHttpRequests(addressBookEntries: []) : any {
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

  drawGoogleMap(geoLocationData: []) {
    const googleMap = new google.maps.Map(document.getElementById('google-map') as HTMLElement, {
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
      data.forEach((geolocation: any, i: number) => {
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

  drawNodesPerCountryDistributionTable(geoLocationData: []) {
    const countryFlags: any = {};
    const nodesPerCountry: any = {};
    geoLocationData.forEach((httpResponse: any) => {
      const data = httpResponse.data;
      data.forEach((geolocation: any) => {
        const currentCount = nodesPerCountry[geolocation.country_name] || 0;
        nodesPerCountry[geolocation.country_name] = currentCount + 1;
        countryFlags[geolocation.country_name] = geolocation.countryFlag;
      });
    });
    const tableData: any = [];
    for (let country in nodesPerCountry) {
      tableData.push({
        countryFlag: countryFlags[country],
        country: country,
        count: nodesPerCountry[country]
      })
    }
    tableData.sort((a: any, b: any) => {
      return b.count - a.count;
    });
    this.nodesPerCountryDatasource = new MatTableDataSource<any[]>(tableData);
    this.nodesPerCountryDatasource.paginator = this.nodesPerCountryPaginator;
    this.nodesPerCountryData = tableData;
    this.nodesPerCountryTotalSize = this.nodesPerCountryData.length;
    this.nodesPerCountryIterator();
  }

  nodesPerCountryIterator() {
    const end = (this.nodesPerCountryCurrentPage + 1) * this.nodesPerCountryPageSize;
    const start = this.nodesPerCountryCurrentPage * this.nodesPerCountryPageSize;
    const part = this.nodesPerCountryData.slice(start, end);
    this.nodesPerCountryDatasource = part;
  }

  nodesPerCountryHandlePage(e: any) {
    this.nodesPerCountryCurrentPage = e.pageIndex;
    this.nodesPerCountryPageSize = e.pageSize;
    this.nodesPerCountryIterator();
  }

  drawNodesPerOrganizationDistributionTable(geoLocationData: []) {
    const nodesPerOrganization: any = {};
    geoLocationData.forEach((httpResponse: any) => {
      const data = httpResponse.data;
      data.forEach((geolocation: any) => {
        const currentCount = nodesPerOrganization[geolocation.organization] || 0;
        nodesPerOrganization[geolocation.organization] = currentCount + 1;
      });
    });
    const tableData: any = [];
    for (let organization in nodesPerOrganization) {
      tableData.push({
        organization: organization,
        count: nodesPerOrganization[organization]
      })
    }
    tableData.sort((a: any, b: any) => {
      return b.count - a.count;
    });
    this.nodesPerOrganizationDatasource = new MatTableDataSource<any[]>(tableData);
    this.nodesPerOrganizationDatasource.paginator = this.nodesPerOrganizationPaginator;
    this.nodesPerOrganizationData = tableData;
    this.nodesPerOrganizationTotalSize = this.nodesPerOrganizationData.length;
    this.nodesPerOrganizationIterator();
  }

  nodesPerOrganizationIterator() {
    const end = (this.nodesPerOrganizationCurrentPage + 1) * this.nodesPerOrganizationPageSize;
    const start = this.nodesPerOrganizationCurrentPage * this.nodesPerOrganizationPageSize;
    const part = this.nodesPerOrganizationData.slice(start, end);
    this.nodesPerOrganizationDatasource = part;
  }

  nodesPerOrganizationHandlePage(e: any) {
    this.nodesPerOrganizationCurrentPage = e.pageIndex;
    this.nodesPerOrganizationPageSize = e.pageSize;
    this.nodesPerOrganizationIterator();
  }
}
