import { Injectable } from '@angular/core';
import Chart from "chart.js/auto";
import { UtilsService } from "./utils.service";

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  borderColor = 'rgba(102, 153, 128, 1)';
  backgroundColor = 'rgba(102, 153, 128, 0.1)';
  colorSchema = [
    '#77B395', '#6FA68A', '#669980', '#5E8C75', '#55806A',
    '#4D7360', '#446655', '#3C594A', '#334D40', '#2B4035'
  ];

  constructor(private utilsService: UtilsService) {
  }

  drawLineChart(containerId: string, labels: string[], data: []) {
    const chart = new Chart(containerId, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            borderColor: this.borderColor,
            backgroundColor: this.backgroundColor,
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

  drawVotingPowerBarChart(containerId: string, labels: string[], data: []) {
    const _this = this;
    const chart = new Chart(containerId, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            barPercentage: 0.5,
            maxBarThickness: 50,
            borderRadius: {
              topRight: 10,
              bottomRight: 10
            },
            data: data,
            backgroundColor: this.colorSchema
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
                const label = context.label || '';
                let value: any = context.dataset.data[context.dataIndex];
                if (typeof value === 'string' || value instanceof String) {
                  value = _this.utilsService.compactNumber(parseInt(value.toString()), 2);
                }
                return label + ': ' + value;
              },
            },
          }
        },
        responsive: true,
        scales: {
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
          },
          y: {
            display: true,
            ticks: {
              font: {
                size: 15,
                family: 'Monaco'
              },
              callback: function (value, index) {
                const label = this.getLabelForValue(index);
                return label && label.length > 15 && data.length > 5
                  ? label.substring(0, 11) + '...'
                  : label;
              }
            }
          }
        }
      }
    });
  }

  drawCommissionBarChart(containerId: string, labels: string[], data: []) {
    const chart = new Chart(containerId, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            barPercentage: 0.5,
            maxBarThickness: 50,
            borderRadius: {
              topLeft: 10,
              topRight: 10
            },
            data: data,
            backgroundColor: this.colorSchema
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
                return label + ': ' + value;
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

  drawMissedBlocksBarChart(containerId: string, labels: string[], data: []) {
    const char = new Chart(containerId, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            barPercentage: 0.5,
            maxBarThickness: 50,
            borderRadius: {
              topLeft: 10,
              topRight: 10
            },
            data: data,
            backgroundColor: this.colorSchema
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
                return label + ': ' + value;
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
                return label && label.length > 15 && data.length > 5
                  ? label.substring(0, 11) + '...'
                  : label;
              }
            }
          },
          y: {
            min: 0,
            max: 100,
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

  drawNodesPerOrganizationBarChart(containerId: string, labels: string[], data: any[]) {
    const _this = this;
    const chart = new Chart(containerId, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            barPercentage: 0.5,
            maxBarThickness: 50,
            borderRadius: {
              topLeft: 10,
              topRight: 10
            },
            data: data,
            backgroundColor: this.colorSchema
          }
        ]
      },
      options: {
        indexAxis: 'x',
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
                return label + ': ' + value;
              },
            },
          }
        },
        responsive: true,
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
}
