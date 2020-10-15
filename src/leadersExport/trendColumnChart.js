import Highcharts from '../lib/highcharts';

window.Highcharts = Highcharts;
require('../lib/exporting')(Highcharts);
require('../lib/highcharts-more')(Highcharts);

export default class TrendColumnChart {
  constructor({chartContainer, table, tableSection, translations}) {
    this.chartContainer = chartContainer;
    this.translations = translations;
    this.questionCategories = [];
    this.table = table;
    this.tableSection = tableSection;
    this.title = this.tableSection.qName;
    this.seriesData = [];
    this.colors = ['#87C7BA', '#FCC74F', '#FF8569', '#4CB0D3', '#6B9994', '#B08759', '#40897A', '#C38803', '#D82800', '#226F8A', '#A6C2BF', '#FDD272'];

    this.init();
  }

  init(){
    this.collectData();

    if (this.seriesData.length > 0) {

      for(let i = 0; i < this.seriesData.length; i++) {
        let colorIndex = i >= this.colors.length ? (i - this.colors.length * parseInt(i / this.colors.length)) : i;

        this.seriesData[i].color = this.colors[colorIndex];
      }

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
    let headerRow = [...this.table.querySelectorAll("thead>tr")][0];
    let bodyRows = [...this.table.querySelectorAll("tbody>tr")];
    let headerCols = headerRow.children;

    for(let i = 1; i < headerCols.length; i++) {
      if(this.isColumnInTableSection(this.tableSection, headerCols[i].innerText)) {
        let seriesData = [];

        bodyRows.forEach((row) => {
          let rowCols = [...row.querySelectorAll("td")];
          seriesData.push(parseInt(rowCols[i].innerHTML));
        });

        this.seriesData.push({
          name: headerCols[i].innerText,
          data: seriesData
        });
      }
    }

    bodyRows.forEach((row) => {
      let rowCols = [...row.querySelectorAll("td")];
      this.questionCategories.push(rowCols[0].innerText);
    });
  }

  isColumnInTableSection(tableSection, column){
    return tableSection.qAnswers.includes(column);
  }

  setUpChart() {
    let chartConfig = {
      chart: {
        type: 'column',
        height: 600,
        backgroundColor: '#FAF9F7'
      },
      title: {
        text: this.title,
        style: {
          color: '#331E11',
          fontWeight: 'bold',
          fontFamily: 'Trebuchet MS, Sans-Serif',
        }
      },
      subtitle: {
        text: ''
      },
      xAxis: {
        categories: this.questionCategories,
        crosshair: true,
        lineWidth: 0,
        tickWidth: 0,
        labels: {
          step: 1,
          style: {
            color: '#A76238',
            fontFamily: 'Trebuchet MS, Sans-Serif',
          }
        },
      },
      yAxis: {
        title: {
          text: ''
        },
        max: 100,
        gridLineColor: '#EEDACD',
        labels: {
          format: '{value:.0f}',
          style: {
            color: '#A76238'
          }
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>{point.y:.0f}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        column: {
          pointPadding: 0.2,
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            color: '#A76238'
          }
        }
      },
      credits: {
        enabled: false
      },
      series: this.seriesData,
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
