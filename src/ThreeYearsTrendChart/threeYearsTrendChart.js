import Highcharts from '../lib/highcharts';
import InfoIcon from "../infoIcon/info-icon";

window.Highcharts = Highcharts;
require('../lib/exporting')(Highcharts);
require('../lib/highcharts-more')(Highcharts);

export default class TrendChart {
  constructor({chartContainer, tableContainer, palette, translations}) {
    this.container = document.getElementById(chartContainer);
    this.table = document.getElementById(tableContainer);
    this.palette = palette;
    this.translations = translations;

    this.categories = [];
    this.series = [];
    this.dashStyles = ["Dot", "LongDash", "Solid"];
    this.init();
  }

  init() {
    this.getDataFromTable();
    this.setupChart();
//    this.addInfoText();
  }

  getDataFromTable() {
    const rows = [...this.table.querySelectorAll("tbody>tr")];
    const headerRow = this.table.querySelector("thead>tr");

    rows.forEach((row, index) => {
      index === 0 ? "" : this.series.push(this.GetRowValues(row, index));
    })
    for (let i = 1; i< headerRow.children.length; i++)
      this.categories.push(this.GetCellValue(headerRow, i));
  }

  setupChart() {
    let chartConfig = {
      chart: {
        zoomType: 'y'
      },

      legend: {
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom'
      },

      title: {
        text: ''
      },

      subtitle: {
        text: ''
      },

      plotOptions: {
        series: {
          animation: false
        }
      },

      xAxis: {
        categories: this.categories
      },

      yAxis: {
        title: {
          enabled: true,
          text: this.translations['Overall Sentiment']
        },
        min: -5,
        max: 5
      },

      navigation: {
        buttonOptions: {
          enabled: false
        }
      },

      series: this.series,
    };

    this.highchart = Highcharts.chart(this.container, chartConfig);
  }

  GetCellValue(row, index) {
    return row.children.item(index).innerText;
  }

  GetRowValues(row, index) {
    const GetCurrentRowCellValue = (cellIndex) =>  this.GetCellValue(row, cellIndex);
    const data = [];
    const name = this.GetCellValue(row, 0).trim();
    for (let i = 1; i< row.children.length; i++)
      data.push(parseFloat(GetCurrentRowCellValue(i)));
    return {name: name, data: data, color: this.palette.chartColors[index-1], dashStyle: this.dashStyles[index-1] };
  }

 /* addInfoText() {
    const icon = new InfoIcon({
      container: this.container, infoText: this.translations['trend line info text']
    });

    this.container.style.position = 'relative';
    icon.infoIcon.style.top = '-76px';
    icon.infoText.style.top = '-36px';
    icon.infoIcon.style.right = '-4px';
    icon.infoText.style.right = '-4px';
  }*/
}
