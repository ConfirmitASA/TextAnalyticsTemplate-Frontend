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
    this.increasingClassName = "increasing";
    this.decreasingClassName = "decreasing";

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
    for(let i = 0; i < rows.length; i++) {
      const td = rows[i].querySelector("td:first-child");
      const text = td.innerText.trim();
      const level = rows[i].className[rows[i].className.indexOf('level') + 5];

      if (this.attribute && this.attribute !== this.emptyValue && isCategoryFound && isSubCategoryFound && text === this.attribute && level === "2") {
        currentRow = rows[i];
        break;
      }
      if (this.subCategory && this.subCategory !== this.emptyValue && isCategoryFound && !isSubCategoryFound && text === this.subCategory && level === "1") {
        isSubCategoryFound = true;
        currentRow = rows[i];
      }
      if (this.category !== this.emptyValue && !isCategoryFound && text === this.category && level === "0") {
        isCategoryFound = true;
        currentRow = rows[i];
      }
    }
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
        color: this.palette.NotSignificant,
        name: this.translations['Sentiment'],
        data: dataValue.sentimentData,
        yAxis: 1,
        zIndex: 2
      }, {
        color: this.palette.NotSignificant,
        name: this.translations['Comment volume'],
        data: dataValue.volumeData,
        type: 'column',
        zIndex: 1
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
          tickPositions: [0, 25, 50, 75, 100],
          opposite: true,
          gridLineWidth: 0
        }
      ],

      plotOptions: {
        series: {
          cursor: 'pointer',
          marker: {
            radius: 6
          },
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
          let sentimentMarker;
          switch(this.points[0].point.marker.symbol) {
            case "triangle":
              sentimentMarker = "\u25B2";
              break;
            case "triangle-down":
              sentimentMarker = "\u25BC";
              break;
            default:
              sentimentMarker = "\u25CF";
          }
          return `<span style="color:${this.points[0].point.marker.fillColor}">${sentimentMarker}</span> ` +
            `${this.points[0].series.yAxis.axisTitle.textStr}: <b>${this.points[0].y.toFixed(0)%}<br/>` +
            `<span style="color:${this.points[1].color}">\u25CF</span> ` +
            `${this.points[1].series.yAxis.axisTitle.textStr}: <b>${this.points[1].y.toFixed(0)}<br/>`;
        },
        shared: true,
        outside: true
      }
    };

    this.highchart = Highcharts.chart(this.container, chartConfig);
  }

  GetCellValue(row, index) {
    return row.children.item(index).innerText;
  }

  GetCellClass(row, index) {
    return row.children.item(index).className;
  }

  GetRowValues(row) {
    const GetCurrentRowCellValue = (cellIndex) => this.GetCellValue(row, cellIndex);
    const GetCurrentRowCellClass = (cellIndex) => this.GetCellClass(row, cellIndex);

    const volumeData = [];
    const sentimentData = [];

    for (let i = 1; i < row.childElementCount; i += 4) {
      let countCellClassName = GetCurrentRowCellClass(i);
      let sentimentCellClassName = GetCurrentRowCellClass(i + 1);
      let columnColor = this.palette.NotSignificant;
      let sentimentMarker = {
        symbol: "circle",
        fillColor: this.palette.SymbolNotSignificant
      };

      if (countCellClassName.indexOf(this.increasingClassName) >= 0) {
        columnColor = this.palette.Increasing;
      }
      if (countCellClassName.indexOf(this.decreasingClassName) >= 0) {
        columnColor = this.palette.Decreasing;
      }

      if (sentimentCellClassName.indexOf(this.increasingClassName) >= 0) {
        sentimentMarker.symbol = "triangle";
        sentimentMarker.fillColor = this.palette.SymbolIncreasing;
      }
      if (sentimentCellClassName.indexOf(this.decreasingClassName) >= 0) {
        sentimentMarker.symbol = "triangle-down";
        sentimentMarker.fillColor = this.palette.SymbolDecreasing;
      }

      volumeData.push({
        y: GetCurrentRowCellValue(i).replace(',', '') - 0,
        color: columnColor
      });
      sentimentData.push({
        y: GetCurrentRowCellValue(i + 1).slice(0, -1) - 0,
        marker: sentimentMarker
      });
    }

    return {
      volumeData: volumeData,
      sentimentData: sentimentData
    };
  }

  addInfoText() {
    const icon = new InfoIcon({
      container: this.container, infoText: this.translations['theme distribution chart info text']
    });

    this.container.style.position = 'relative';
    icon.infoIcon.style.top = '-32px';
    icon.infoIcon.style.right = '16px';
    icon.infoText.style.top = '-8px';
  }
}
