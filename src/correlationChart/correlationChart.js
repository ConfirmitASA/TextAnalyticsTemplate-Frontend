import Highcharts from '../lib/highcharts';
window.Highcharts = Highcharts;
require('../lib/exporting')(Highcharts);
require('../lib/highcharts-more')(Highcharts);

export default class CorrelationChart {
  constructor({container, table, palette, translations, questionName}) {
    this.container = container;
    this.table = table;
    this.palette = palette;
    this.translations = translations;
    this.questionName = questionName;
    console.log(translations["Priority Issues"]);
    this.data = [];
    this.init();
  }

  init() {
    this.getDataFromTable();
    this.setupChart();

  }

  getDataFromTable() {
    let rows = [...this.table.querySelectorAll("tbody>tr")];

    rows.forEach((row, index) => {
      index === 0 ? this.xAxis = +this.GetCellValue(row, 1) : this.data.push(this.GetRowValues(row, index));
    })
  }

  setupChart() {
    const setupChartAreas = this.SetupChartAreasWithTranslationsAndPalette(this.translations, this.palette);

    let chartConfig = {

      chart: {
        type: 'bubble',
        plotBorderWidth: 1,
        zoomType: 'xy',
        events: {
          redraw: (a) => setupChartAreas(a.target)
        }
      },

      legend: {
        enabled: false
      },

      title: {
        text: this.questionName ? `${this.translations['Impact on']} ${this.questionName}` : this.translations['Correlation chart'],
        margin: 21
      },

      subtitle: {
        text: ''
      },

      xAxis: {
        gridLineWidth: 1,
        title: {
          text: this.translations['Average Category Sentiment'],
          margin: 40
        },
        labels: {
          format: '{value}',
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
            text: this.translations['Average Overall Sentiment']
          },
          zIndex: 3
        }]
      },

      yAxis: {
        startOnTick: false,
        endOnTick: false,
        title: {
          text: this.questionName ? `${this.translations['Correlation with']} ${this.questionName}` : this.translations['Correlation with NPS']
        },
        labels: {
          format: '{value}'
        },
        maxPadding: 0.2,
        plotLines: [{
          color: 'black',
          dashStyle: 'dot',
          width: 2,
          value: 0,
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
        <tr><th>${this.translations['Average Category Sentiment']}:</th><td>{point.x}</td></tr>
        <tr><th>${this.questionName ? `${this.translations['Correlation with']} ${this.questionName}` : this.translations['Correlation with NPS']}:</th><td>{point.y}</td></tr>
        <tr><th>${this.translations['Answer Count'] || 'Answer Count'}:</th><td>{point.z}</td></tr>`,
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
        }

      }],

      exporting: {
        buttons: {
          contextButton: {
            y: -5
          }
        }
      }

    };

    Highcharts.chart(this.container, chartConfig, setupChartAreas);
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
      })
    };

    return SetupChartAreas
  }


  GetCellValue(row, index) {
    return row.children.item(index).innerText
  }

  CellClick(row) {
    row.children.item(0).children.item(0).click()
  }

  GetRowValues(row, index) {
    const GetCurrentRowCellValue = (cellIndex) => this.GetCellValue(row, cellIndex);
    const paletteColorIndex = index >= this.palette.chartColors.length ? (index - this.palette.chartColors.length * parseInt(index / this.palette.chartColors.length)) : index;
    const name = GetCurrentRowCellValue(0);
    const x = +GetCurrentRowCellValue(1);
    const y = +GetCurrentRowCellValue(2);
    const z = +(GetCurrentRowCellValue(3).replace(/,/g, ""));
    const color = this.palette.chartColors[paletteColorIndex];
    const click = () => {
      this.CellClick(row)
    };

    return {x, y, z, name, color, click};
  }

  GetChartAreasMetaData(chart) {
    const translations = this.translations;
    const palette = this.palette;
    let {plotLeft, plotWidth, plotTop, plotBottom, xAxis, plotHeight} = chart;
    let yPlotline = xAxis[0].toPixels(xAxis[0].plotLinesAndBands[0].options.value);

    if(yPlotline > plotWidth + plotLeft) {
      yPlotline = plotWidth + plotLeft;
    } else if(yPlotline < plotLeft) {
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
