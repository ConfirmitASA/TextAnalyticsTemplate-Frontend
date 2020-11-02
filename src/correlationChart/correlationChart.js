import Highcharts from '../lib/highcharts';

window.Highcharts = Highcharts;
require('../lib/exporting')(Highcharts);
require('../lib/highcharts-more')(Highcharts);

export default class CorrelationChart {

  constructor({container, table, palette, translations, questionName, correlationAxis}) {
    this.container = container;
    this.table = table;
    this.palette = palette;
    this.translations = translations;
    this.questionName = questionName;
    console.log(translations["Priority Issues"]);
    this.data = [];
    this.correlationAxis = correlationAxis;
    this.init();
  }

  init() {
    this.getDataFromTable();
    if (this.data.length > 0) {
      this.setupChart();
    } else {
      const container = document.getElementById(this.container);
      container.innerHTML = `<label class="no-data-label">${this.translations['No data to display']}</label>`;
      container.style.height = 'inherit';
      container.style.marginBottom = '16px';
      container.style.marginLeft = '8px';
    }
  }

  getDataFromTable() {
    if(!!this.table) {
      let rows = [...this.table.querySelectorAll("tbody>tr")];
      this.getMinMaxZValues();

      rows.forEach((row, index) => {
        index === 0 ? this.xAxis = +(parseFloat(this.GetCellValue(row, 1).replace(/,/g, "."))) : this.data.push(this.GetRowValues(row, index));
      })
    }
  }

  getMinMaxZValues() {
    let td_z = this.table.querySelectorAll('tbody > tr > td:nth-last-child(2)');
    td_z = Array.prototype.slice.call(td_z, 1);

    this.minZValue =  td_z.map( z => parseInt(z.innerText.replace(/,/g, "")))
      .reduce((min, z) => ( min == null ? z : (min > z ? z : min)), null);

    this.maxZValue =  td_z.map( z => parseInt(z.innerText.replace(/,/g, "")))
      .reduce((max, z) => (max == null ? z : (max < z ? z : max)), null);

    this.cDiff = (this.maxZValue - this.minZValue)/this.minZValue;
  }

  setupChart() {
    const setupChartAreas = this.SetupChartAreasWithTranslationsAndPalette(this.translations, this.palette);

    const getMaximumProperty = (data, propertyName, zero = 0) => (
      Math.abs(
        data.reduce(
          (max, current) => Math.abs(current[propertyName] - zero) > Math.abs(max[propertyName] - zero) ? current : max
        )[propertyName] - zero
      )
    );

    const getMinimumProperty = (data, propertyName, zero = 0) => (
      Math.abs(
        data.reduce(
          (min, current) => Math.abs(current[propertyName] - zero) < Math.abs(min[propertyName] - zero) ? current : min
        )[propertyName] - zero
      )
    );

    const maxXValue = getMaximumProperty(this.data, "x", this.xAxis);

    let maxYValue;
    let minYValue;
    let zeroYValue;

    if(this.correlationAxis.Type.toLowerCase() === 'manual') {
      maxYValue = parseFloat(this.correlationAxis.TopLimit);
      minYValue = parseFloat(this.correlationAxis.BottomLimit);
      zeroYValue = parseFloat(this.correlationAxis.ZeroLine);
    } else {
      maxYValue = 1;
      let averageMinYValue = getMinimumProperty(this.data, "y");
      minYValue = averageMinYValue < -0.3 ? averageMinYValue : -0.3;
      zeroYValue = (maxYValue + minYValue) / 2;
    }

    let chartConfig = {

      chart: {
        type: 'bubble',
        plotBorderWidth: 1,
        zoomType: 'xy',
        events: {
          load: (a) => setupChartAreas(a.target),
          redraw: (a) => setupChartAreas(a.target)
        }
      },

      legend: {
        enabled: false
      },

      title: {
        text: this.questionName ? `${this.translations['Impact on']} ${this.questionName}` : this.translations['Correlation chart'],
        margin: 30
      },

      subtitle: {
        text: ''
      },

      xAxis: {
        max: 100 < this.xAxis + maxXValue + 5 ? 105 : this.xAxis + maxXValue + 5,
        min: -100 > this.xAxis - maxXValue - 5 ? -105: this.xAxis - maxXValue - 5,
        gridLineWidth: 1,
        tickInterval: 1,
        title: {
          text: this.translations['Average'],
          margin: 40
        },
        labels: {
          format: '{value:.0f}',
          y: -5
        },
        tickWidth: 0,
        plotLines: [{
          color: 'black',
          dashStyle: 'dot',
          width: 2,
          value: this.xAxis,
          label: {
            rotation: 0,
            y: 15,
            style: {
              fontStyle: 'italic'
            },
            text: this.translations['Overall']
          },
          zIndex: 3
        }]
      },

      yAxis: {
        max: maxYValue + 0.2,
        min: minYValue - 0.2,
        startOnTick: false,
        endOnTick: false,
        title: {
          text: this.questionName ? `${this.translations['Correlation with']} ${this.questionName}` : this.translations['Correlation with NPS']
        },
        labels: {
          enabled: false,
          format: '{value}'
        },
        maxPadding: 0.2,
        plotLines: [{
          color: 'black',
          dashStyle: 'dot',
          width: 2,
          value: zeroYValue,
          label: {
            align: 'right',
            x: -10,
            style: {
              fontStyle: 'italic'
            },
            text: this.translations['Zero correlation']
          },
          zIndex: 3
        }]
      },

      tooltip: {
        useHTML: true,
        headerFormat: '<table>',
        pointFormat: `<tr><th colspan="2"><h3 onclick="{point.click}">{point.name}</h3></th></tr>
        <tr><th>${this.translations['Average']}:</th><td>{point.x}</td></tr>`,
        footerFormat: '</table>',
        followPointer: true
      },

      plotOptions: {
        bubble: {
          allowPointSelect: true,
          point: {
            events: {
              select: function (e) {
                e.target.click();
              }
            }
          },
          dataLabels: {
            enabled: true,
            format: '{point.name}',
            allowOverlap: true,
            color: '#3F454C',
            style: {
              "color": "#3F454C",
              "fontFamily": '"Helvetica Neue", Roboto, sans-serif',
              "textOutline": 'none'
            }
          },
          marker: {
            enabled: true,
            states: {
              hover: {
                enabled: false,
                animation: false
              }
            }
          }
        }
      },

      series: [{
        type: "bubble",
        data: this.data,
        cursor: 'pointer',
        stickyTracking: false,
        states: {
          hover: {
            enabled: false,
            animation: false
          }
        },
        sizeByAbsoluteValue: true
      }],

      exporting: {
        filename: 'correlation-chart',
        printMaxWidth: 10000,
        buttons: {
          contextButton: {
            enabled: false
          }
        }
      }

    };

    this.highchart = Highcharts.chart(this.container, chartConfig);
  }

  SetupChartAreasWithTranslationsAndPalette(translations, palette) {
    const headers = [];
    const texts = [];

    const SetupChartAreas = (chart) => {
      let areas = this.GetChartAreasMetaData(chart);

      areas.forEach((area, index) => {
        let {title, color, coordinates} = area;
        headers[index] = headers[index] || chart.renderer.rect().attr({
          fill: color,
          class: "ta-correlation-table--area-label"
        }).add();

        headers[index].attr({
          x: coordinates[0],
          y: coordinates[1],
          width: coordinates[2],
          height: coordinates[3],
        });

        let textX = coordinates[0] + 10,
          textY = coordinates[1] + 21;

        texts[index] = texts[index] ||
          chart.renderer.text(title).css({
            color: "#ffffff",
            zIndex: 10,
            fontSize: 16,
            fontWeight: "bold"
          }).add();

        texts[index].attr({
          x: textX,
          y: textY
        });

        chart.update({
          exporting: {
            sourceWidth: chart.chartWidth
          }
        }, false);
      })
    };

    return SetupChartAreas
  }


  GetCellValue(row, index) {
    var temp = row.children.item(index).innerText;
    return row.children.item(index).innerText;
  }

  CellClick(row) {
    row.children.item(0).children.item(0).click()
  }

  GetRowValues(row, index) {
    const GetCurrentRowCellValue = (cellIndex) => this.GetCellValue(row, cellIndex);
    const paletteColorIndex = index >= this.palette.chartColors.length ? (index - this.palette.chartColors.length * parseInt(index / this.palette.chartColors.length)) : index;
    const name = GetCurrentRowCellValue(0);
    const x = +(parseFloat(GetCurrentRowCellValue(1).replace(/,/g, ".")));
    const y = +(parseFloat(GetCurrentRowCellValue(2).replace(/,/g, ".")));
    const count = +(GetCurrentRowCellValue(row.children.length - 2).replace(/,/g, ""));
    let z = count;
    if (this.cDiff < 0.5) {
      z = (count/this.minZValue).toFixed(0)
    }
    const color = this.palette.chartColors[paletteColorIndex];
    const click = () => {
      this.CellClick(row)
    };

    return {x, y, z, count, name, color, click};
  }

  GetChartAreasMetaData(chart) {
    const translations = this.translations;
    const palette = this.palette;
    let {plotLeft, plotWidth, plotTop, plotBottom, xAxis, plotHeight} = chart;
    let yPlotline = xAxis[0].toPixels(xAxis[0].plotLinesAndBands[0].options.value);

    if (yPlotline > plotWidth + plotLeft) {
      yPlotline = plotWidth + plotLeft;
    } else if (yPlotline < plotLeft) {
      yPlotline = plotLeft;
    }

    let titleHeight = 30;

    const areas = [
      {
        title: translations["Priority Issues"],
        color: palette.areasColors["Priority Issues"],
        coordinates: [
          plotLeft,
          plotTop - titleHeight,
          yPlotline - plotLeft,
          titleHeight
        ]
      },
      {
        title: translations["Strength"],
        color: palette.areasColors["Strength"],
        coordinates: [
          yPlotline,
          plotTop - titleHeight,
          plotWidth - yPlotline + plotLeft,
          titleHeight
        ]
      },
      {
        title: translations["Monitor and Improve"],
        color: palette.areasColors["Monitor and Improve"],
        coordinates: [
          plotLeft,
          plotHeight + plotTop,
          yPlotline - plotLeft,
          titleHeight
        ]
      },
      {
        title: translations["Maintain"],
        color: palette.areasColors['Maintain'],
        coordinates: [
          yPlotline,
          plotHeight + plotTop,
          plotWidth - yPlotline + plotLeft,
          titleHeight
        ]
      }
    ];

    return areas;
  }
}
