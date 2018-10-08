import Highcharts from '../lib/highcharts';
import InfoIcon from "../infoIcon/info-icon";

window.Highcharts = Highcharts;
require('../lib/exporting')(Highcharts);
require('../lib/highcharts-more')(Highcharts);

export default class TrendChart {
  constructor({chartContainer, tableContainer, drilldownButtonContainer, drilldownSelectContainer, palette, translations, period, showPercent, questionName}) {
    this.container = document.getElementById(chartContainer);
    this.table = document.getElementById(tableContainer);
    this.drilldownButton = document.getElementById(drilldownButtonContainer).querySelector('input');
    this.drilldownSelect = document.getElementById(drilldownSelectContainer).querySelector('select');

    this.palette = palette;
    this.translations = translations;
    this.indexOffset = 0;
    //console.log(translations["Priority Issues"]);
    this.data = [];
    this.labels = [];
    this.period = period;
    this.showPercent = showPercent;
    this.init();
  }

  init() {
    this.getDataFromTable();

    if (this.data.length > 0) {
      this.setupChart();
    } else {
      const container = document.getElementById(this.container);
      container.innerHTML = `<label class="no-data-label">${this.translations['No data to display']}</label>`;
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
          text: this.translations['Overall Sentiment'] + (this.showPercent ? ", %" : "")
        },
        min: this.showPercent ? 0 : -5,
        max: this.showPercent ? 100 : 5
      },

      plotOptions: {
        series: {
          label: {
            connectionAllowed: false
          },
          point: {
            events: {
              click: (event) => {
                const datePickers = document.querySelectorAll('.reportal-datepicker input');
                const datePickerFrom = datePickers[0];
                const datePickerTo = datePickers[1];
                const datePeriodIndex = event.point.series.data.length - event.point.index - 1;
                const now = new Date();
                let fromDate, toDate;

                switch (this.period) {
                  case "w":
                    // ISO 8601 states that week 1 is the week with january 4th in it
                    const jan4 = new Date(now.getFullYear(), 0, 4);
                    const week = parseInt(event.point.category.substr(2));
                    const dayOfWeekIndex = (jan4.getDay() + 6) % 7;
                    const firstDayIndex = (jan4.getDate() - dayOfWeekIndex);
                    const firstDayOfFirstWeek = new Date(jan4.getFullYear(), jan4.getMonth(), firstDayIndex);

                    fromDate = new Date(
                      firstDayOfFirstWeek.getFullYear(),
                      firstDayOfFirstWeek.getMonth(),
                      firstDayOfFirstWeek.getDate() + (week - 1) * 7
                    );

                    toDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate() + 6);
                    break;
                  case "m":
                    const month = now.getMonth() - datePeriodIndex;
                    fromDate = new Date(now.getFullYear(), month, 1);
                    toDate = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0);
                    break;
                  case "q":
                    const quarter = Math.floor((now.getMonth() / 3)) - datePeriodIndex;
                    fromDate = new Date(now.getFullYear(), quarter * 3, 1);
                    toDate = new Date(fromDate.getFullYear(), fromDate.getMonth() + 3, 0);
                    break;
                  case "y":
                    const year = now.getFullYear() - datePeriodIndex;
                    fromDate = new Date(year, 0, 1);
                    toDate = new Date(year + 1, 0, 0);
                    break;
                }

                datePickerFrom.value = fromDate.toLocaleDateString(DatePicker_config.cultureName).replace(/[^ -~]/g,'');
                datePickerTo.value = toDate.toLocaleDateString(DatePicker_config.cultureName).replace(/[^ -~]/g,'');

                const selectValue = this.drilldownSelect
                  .querySelectorAll('option')[event.point.series.index + 1]
                  .getAttribute('value');

                this.drilldownSelect.value = selectValue;
                this.drilldownButton.click();
              }
            }
          }
        }
      },

      series: this.data,

      navigation: {
        buttonOptions: {
          enabled: false
        }
      },

      tooltip: {
        pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}' +
        (this.showPercent ? '%' : '') +
        '</b><br/>' +
        '<span style="color:{point.color}">\u25CF</span> ' +
        this.translations['# of Responses'] +
        ': <b>{point.count}</b><br/>'
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
    for (let i = 1; i < row.childElementCount; i += 2) {
      data.push({
        y: GetCurrentRowCellValue(i + 1) - 0,
        count: GetCurrentRowCellValue(i) - 0
      })
    }
    const paletteColorIndex = index + this.indexOffset >= this.palette.chartColors.length ? (index + this.indexOffset - this.palette.chartColors.length * parseInt((index + this.indexOffset) / this.palette.chartColors.length)) : index + this.indexOffset;
    const color = this.palette.chartColors[paletteColorIndex];
    return {name: name, data: data, color: color};
  }

  addInfoText() {
    const icon = new InfoIcon({
      container: this.container, infoText: this.translations['trend line info text']
    });

    this.container.style.position = 'relative';
    icon.infoIcon.style.top = '-76px';
    icon.infoText.style.top = '-36px';
    icon.infoIcon.style.right = '-4px';
    icon.infoText.style.right = '-4px';
  }
}
