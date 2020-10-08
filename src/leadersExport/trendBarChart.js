import Highcharts from '../lib/highcharts';

window.Highcharts = Highcharts;
require('../lib/exporting')(Highcharts);
require('../lib/highcharts-more')(Highcharts);

export default class TrendBarChart {
  constructor({chartContainer, translations, table}) {
    this.chartContainer = chartContainer;
    this.translations = translations;
    this.table = table;

    this.questionCategories = [];
    this.trendCategories = [];
    this.scoreData = [];

    this.init();
  }

  init() {
    this.collectData();

    if (this.scoreData.length > 0) {
      this.setUpChart();
    } else {
      const container = document.getElementById(this.chartContainer);
      container.innerHTML = `<label class="no-data-label">${this.translations['No data to display']}</label>`;
      container.style.height = 'inherit';
      container.style.marginBottom = '16px';
      container.style.marginLeft = '8px';
    }
  }

  collectData() {
    let rows = [...this.table.querySelectorAll("tbody>tr")];

    rows.forEach((row) => {
      let cols = [...row.querySelectorAll("td")];

      this.questionCategories.push(cols[0].innerText);
      this.scoreData.push(parseInt(cols[1].innerText));
      this.trendCategories.push(parseInt(cols[3].innerText) > 0 ? '+' + cols[3].innerText : cols[3].innerText);
    });
  }

  setUpChart() {
    let chartConfig = {
      chart: {
        type: 'bar',
        height: 600,
        backgroundColor: '#FAF9F7'
      },
      title: {
        text: this.translations['Engagement and Culture'],
        style: {
          color: '#331E11',
          fontWeight: 'bold',
          fontFamily: 'Trebuchet MS, Sans-Serif',
        }
      },
      legend: {
        enabled: false
      },
      xAxis: [{
        categories: this.questionCategories,
        reversed: true,
        lineWidth: 0,
        tickWidth: 0,
        labels: {
          step: 1,
          style: {
            color: '#A76238',
            fontFamily: 'Trebuchet MS, Sans-Serif',
          }
        },
      }, {
        categories: this.trendCategories,
        reversed: true,
        opposite: true,
        linkedTo: 0,
        lineWidth: 0,
        tickWidth: 0,
        labels: {
          step: 1,
          style: {
            color: '#EAE2DB'
          }
        },
        title: {
          text: this.translations['Trend'],
          style: {
            color: '#EAE2DB'
          }
        },
      }],
      yAxis: {
        opposite: true,
        title: {
          text: null
        },
        gridLineColor: '#EEDACD',
        labels: {
          format: '{value:.0f}',
          style: {
            color: '#A76238'
          }
        },
      },

      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
            color: '#A76238'
          }
        },
        series: {
          color: '#87C7BA'
        }
      },

      tooltip: {
        formatter: function () {
          return '<b>' + this.point.category + '</b>: ' + this.point.y;
        }
      },

      credits: {
        enabled: false
      },

      series: [{
        data: this.scoreData,
      }],

      exporting: {
        filename: 'trend-chart',
        printMaxWidth: 10000,
        buttons: {
          contextButton: {
            enabled: false
          }
        }
      }
    };

    this.highchart = Highcharts.chart(this.chartContainer, chartConfig);
  }
}
