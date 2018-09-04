import Highcharts from '../lib/highcharts';
import InfoIcon from "../infoIcon/info-icon";

window.Highcharts = Highcharts;
require('../lib/exporting')(Highcharts);
require('../lib/highcharts-more')(Highcharts);

export default class TrendChart {
  constructor({chartContainer, tableContainer, palette, translations, questionName}) {
    this.container = document.getElementById(chartContainer);
    this.table = document.getElementById(tableContainer);
    this.palette = palette;
    this.translations = translations;
    this.indexOffset = 0;
    //console.log(translations["Priority Issues"]);
    this.data = [];
    this.labels = [];
    this.init();
  }

  init() {
    this.getDataFromTable();

    if (this.data.length > 0) {
      this.setupChart();
    } else {
      const container = document.getElementById(this.container);
      container.innerHTML = '<label class="no-data-label">No data to display</label>';
      container.style.height = '';
      container.style.marginBottom = '16px';
      container.style.marginLeft = '8px';
    }

    this.addInfoText();
  }

  getDataFromTable() {
    const rows = [...this.table.querySelectorAll("tbody>tr")];
    const headers = [...this.table.querySelectorAll("thead>tr")[0].querySelectorAll("td")].slice(1);
    headers.forEach((header) => {
      this.labels.push(header.innerText);
    });
    rows.forEach((row, index, rows) => {
      const dataValue = this.GetRowValues(row, index, rows);
      dataValue ? this.data.push(dataValue) : false;
      //this.data.push(this.GetRowValues(row, index) ? this.GetRowValues(row, index : );
    });
  }

  setupChart() {
    let chartConfig = {
      chart: {
        zoomType: 'xy'
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

      xAxis: {
        categories: this.labels
      },

      yAxis: {
        title: {
          enabled: true,
          text: this.translations['Overall Sentiment']
        },
        min: -5,
        max: 5
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

  GetRowValues(row, index, rows) {
    const GetCurrentRowCellValue = (cellIndex) => this.GetCellValue(row, cellIndex);
    const GetNextRowCellValue = (cellIndex) => this.GetCellValue(rows[index + 1], cellIndex);
    const GetPreviousRowCellValue = (cellIndex) => this.GetCellValue(rows[index - 1], cellIndex);

    let name = GetCurrentRowCellValue(0).trim();
    const nextRowName = index + 1 == rows.length ? "" : GetNextRowCellValue(0).trim();
    if (nextRowName.toUpperCase() == "EMPTY HEADER") return null;
    if (name.toUpperCase() == "EMPTY HEADER") {
      name = GetPreviousRowCellValue(0).trim();
      this.indexOffset--;
    }
    const data = [];
    for (let i = 1; i < row.childElementCount; i++) {
      data.push(GetCurrentRowCellValue(i) - 0)
    }
    const paletteColorIndex = index + this.indexOffset >= this.palette.chartColors.length ? (index + this.indexOffset - this.palette.chartColors.length * parseInt((index + this.indexOffset) / this.palette.chartColors.length)) : index + this.indexOffset;
    const color = this.palette.chartColors[paletteColorIndex];
    return {name: name, data: data, color: color};
  }

  addInfoText() {
    const icon = new InfoIcon({
      container: this.container, infoText: this.translations['cj cards info text']
    });

    this.container.style.position = 'relative';
    icon.infoIcon.style.top = '-32px';
    icon.infoText.style.top = '8px';
  }
}
