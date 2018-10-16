import Highcharts from '../lib/highcharts';
import InfoIcon from "../infoIcon/info-icon";

window.Highcharts = Highcharts;
require('../lib/exporting')(Highcharts);
require('../lib/highcharts-more')(Highcharts);

export default class ThemeDistributionChart {
  constructor({chartContainer, tableContainer, categoryOptions, drilldownButtonContainer, palette, translations, period}) {
    this.container = document.getElementById(chartContainer);
    this.table = tableContainer;
    this.drilldownButton = document.getElementById(drilldownButtonContainer).querySelector('input');
    this.category = categoryOptions.category.replace(/<span.*>: /, '').replace(/<\/span>/, '');
    this.subCategory = categoryOptions.subCategory.replace(/<span.*>: /, '').replace(/<\/span>/, '');
    this.attribute = categoryOptions.attribute.replace(/<span.*>: /, '').replace(/<\/span>/, '');

    this.palette = palette;
    this.translations = translations;
    this.indexOffset = 0;
    this.data = [];
    this.labels = [];
    this.period = period;

    this.emptyValue = 'emptyv';

    this.init();
  }

  init() {
    this.hideOverallSentiment();
    this.fixMovingHeaders();
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

  hideOverallSentiment() {
    const overallSentimentRow = this.table.querySelector("tbody>tr:first-child");
    overallSentimentRow.style.display = 'none';
  }

  fixMovingHeaders() {
    const secondTable = this.table.parentElement.querySelectorAll('table')[1];
    secondTable.style.width = this.table.style.width;
    const headers = [...secondTable.querySelectorAll("thead>tr")[0].querySelectorAll("td")].slice(1);
    headers.forEach((header) => {
      header.colSpan = 1;
    });

    let event;
    if (typeof(Event) === 'function') {
      event = new Event('resize');
    } else {
      event = document.createEvent('Event');
      event.initEvent('resize', true, true);
    }
    window.dispatchEvent(event);
  }

  findCurrentRow(rows) {
    let currentRow;
    let isCategoryFound = false, isSubCategoryFound = false;
    rows.forEach(row => {
      const td = row.querySelector("td:first-child");
      const text = td.innerText.trim();
      const level = row.className[row.className.indexOf('level') + 5];
      if (this.attribute && this.attribute !== this.emptyValue && isCategoryFound && isSubCategoryFound && text === this.attribute && level === "2") {
        currentRow = row;
      }
      if (this.subCategory && this.subCategory !== this.emptyValue && isCategoryFound && !isSubCategoryFound && text === this.subCategory && level === "1") {
        isSubCategoryFound = true;
        currentRow = row;
      }
      if (this.category !== this.emptyValue && !isCategoryFound && text === this.category && level === "0") {
        isCategoryFound = true;
        currentRow = row;
      }
    });
    return currentRow;
  }

  getDataFromTable() {
    const rows = [...this.table.querySelectorAll("tbody>tr")];
    const headers = [...this.table.querySelectorAll("thead>tr")[0].querySelectorAll("td")].slice(1);
    headers.forEach((header) => {
      header.colSpan = 1;
      this.labels.push(header.innerText);
    });

    let row = this.findCurrentRow(rows);
    row = !row ? rows[0] : row;

    const dataValue = this.GetRowValues(row);
    dataValue ?
      this.data.push({
        color: this.palette.chartColors[0],
        name: this.translations['Comment volume'],
        data: dataValue.volumeData,
        type: 'column'
      }, {
        color: this.palette.chartColors[1],
        name: this.translations['Sentiment'],
        data: dataValue.sentimentData,
        yAxis: 1
      })
      : false;
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

      xAxis: {
        categories: this.labels
      },

      yAxis: [
        {
          title: {
            enabled: true,
            text: this.translations['Comment volume']
          }
        },
        {
          title: {
            enabled: true,
            text: this.translations['Sentiment']
          },
          tickPositions: [-5, -2.5, 0, 2.5, 5],
          opposite: true,
          gridLineWidth: 0
        }
      ],

      plotOptions: {
        series: {
          cursor: 'pointer',
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

                datePickerFrom.value = fromDate.toLocaleDateString(DatePicker_config.cultureName).replace(/[^ -~]/g, '');
                datePickerTo.value = toDate.toLocaleDateString(DatePicker_config.cultureName).replace(/[^ -~]/g, '');

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
        formatter: function () {
          return `<span style="color:${this.points[0].color}">\u25CF</span> ` +
            `${this.points[0].series.yAxis.axisTitle.textStr}: <b>${this.points[0].y}<br/>` +
            `<span style="color:${this.points[1].color}">\u25CF</span> ` +
            `${this.points[1].series.yAxis.axisTitle.textStr}: <b>${this.points[1].y}<br/>`;
        },
        shared: true
      }
    };

    this.highchart = Highcharts.chart(this.container, chartConfig);
    this.highchart.reflow();
  }

  GetCellValue(row, index) {
    return row.children.item(index).innerText;
  }

  GetRowValues(row) {
    const GetCurrentRowCellValue = (cellIndex) => this.GetCellValue(row, cellIndex);
    const volumeData = [];
    const sentimentData = [];
    for (let i = 1; i < row.childElementCount; i += 2) {
      volumeData.push({
        y: GetCurrentRowCellValue(i).replace(',', '') - 0
      });
      sentimentData.push({
        y: GetCurrentRowCellValue(i + 1) - 0
      });
    }
    return {volumeData: volumeData, sentimentData: sentimentData};
  }

  addInfoText() {
    const icon = new InfoIcon({
      container: this.container, infoText: this.translations['theme distribution chart info text']
    });

    this.container.style.position = 'relative';
    icon.infoIcon.style.top = '-32px';
    icon.infoText.style.top = '8px';
  }
}
