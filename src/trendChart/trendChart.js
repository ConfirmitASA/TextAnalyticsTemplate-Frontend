import Highcharts from '../lib/highcharts';
window.Highcharts = Highcharts;
require('../lib/exporting')(Highcharts);
require('../lib/highcharts-more')(Highcharts);

export default class TrendChart {
  constructor({chartContainer, tableContainer, palette, translations, questionName}) {
    this.container = document.getElementById(chartContainer);
    this.table = document.getElementById(tableContainer);
    this.palette = palette;
    this.translations = translations;
    //this.questionName = questionName;
    //console.log(translations["Priority Issues"]);
    this.data = [];
    this.labels = [];
    this.init();
  }

  init() {
    this.getDataFromTable();
    if(this.data.length > 0) {
      this.setupChart();
    } else {
      const container = document.getElementById(this.container);
      container.innerHTML = '<label class="no-data-label">No data to display</label>';
      container.style.height = '';
      container.style.marginBottom = '16px';
      container.style.marginLeft = '8px';
    }
  }
  getDataFromTable() {
    const rows = [...this.table.querySelectorAll("tbody>tr")];
    const headers =  [ ...this.table.querySelectorAll("thead>tr")[0].querySelectorAll("td")].slice(1);
    headers.forEach((header) => {
      this.labels.push(header.innerText);
    });
    rows.forEach((row, index) => {
      this.data.push(this.GetRowValues(row, index));
    });
  }

  setupChart() {
    //const setupChartAreas = this.SetupChartAreasWithTranslationsAndPalette(this.translations, this.palette);

    let chartConfig = {
      legend: {
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom'
      },

      title: {
        text: this.translations['Trend chart'],
        margin: 21
      },

      subtitle: {
        text: ''
      },

      xAxis: {
        categories: this.labels
      },

      yAxis: {
        title: null
      },

      plotOptions: {
        series: {
          label: {
            connectionAllowed: false
          }
        }
      },

      series: this.data,

      navigation: {
        buttonOptions: {
          enabled: false
        }
      }

    };

    this.highchart = Highcharts.chart(this.container, chartConfig);
  }

  GetCellValue(row, index) {
    return row.children.item(index).innerText;
  }

  GetRowValues(row, index) {
    const GetCurrentRowCellValue = (cellIndex) => this.GetCellValue(row, cellIndex);
    const paletteColorIndex = index >= this.palette.chartColors.length ? (index - this.palette.chartColors.length * parseInt(index / this.palette.chartColors.length)) : index;
    const name = GetCurrentRowCellValue(0).trim();
    const data = [];
    for (let i = 1; i < row.childElementCount; i ++) {
      data.push(GetCurrentRowCellValue(i) - 0)
    }
    const color = this.palette.chartColors[paletteColorIndex];
    return {name: name, data: data, color: color};
  }
}
