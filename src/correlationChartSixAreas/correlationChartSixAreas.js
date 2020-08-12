import Highcharts from '../lib/highcharts';

window.Highcharts = Highcharts;
require('../lib/exporting')(Highcharts);
require('../lib/highcharts-more')(Highcharts);

export default class CorrelationChartSixAreas {
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
    let rows = [...this.table.querySelectorAll("tbody>tr")];

    rows.forEach((row, index) => {
      index === 0 ? this.xAxis = +this.GetCellValue(row, 1) : this.data.push(this.GetRowValues(row, index));
    })
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

    const maxXValue = getMaximumProperty(this.data, "x", this.xAxis);
    const maxYValue = getMaximumProperty(this.data, "y");
    // Math.abs(this.data.reduce((max, current) => Math.abs(current.y) > Math.abs(max.y) ? current : max).y);


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
        max: this.xAxis + maxXValue + 0.5,
        min: this.xAxis - maxXValue - 0.5,
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
        },
          {
            color: 'black',
            dashStyle: 'dot',
            width: 2,
            value: 0,
            label: {
              rotation: 0,
              y: 15,
              style: {
                fontStyle: 'italic'
              },
              text: this.translations['Zero Overall Sentiment']
            },
            zIndex: 3
          }
        ]
      },

      yAxis: {
        max: maxYValue + 0.5,
        min: -maxYValue - 0.5,
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
            color: "#797979",
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
    const z = +(GetCurrentRowCellValue(row.children.length - 2).replace(/,/g, ""));
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
    let yPlotlineZero = xAxis[0].toPixels(xAxis[0].plotLinesAndBands[1].options.value);
    let yFirst, ySecond;
    if (yPlotline > plotWidth + plotLeft) {
      yPlotline = plotWidth + plotLeft;
    } else if (yPlotline < plotLeft) {
      yPlotline = plotLeft;
    }

    if (yPlotlineZero > plotWidth + plotLeft) {
      yPlotlineZero = plotWidth + plotLeft;
    } else if (yPlotlineZero < plotLeft) {
      yPlotlineZero = plotLeft;
    }

    if (yPlotlineZero < yPlotline) {
      yFirst = yPlotlineZero;
      ySecond = yPlotline;
    } else {
      yFirst = yPlotline;
      ySecond = yPlotlineZero;
    }

    let titleHeight = 30;

    const areas = [
      {
        title: translations["Unfavorable"],
        color: "#fffe86" ,
        coordinates: [
          plotLeft,
          plotTop - titleHeight,
          yFirst - plotLeft,
          titleHeight
        ]
      },
      {
        title: translations["Positive"],
        color: "#d8ff9c",
        coordinates: [
          yFirst,
          plotTop - titleHeight,
          ySecond - yFirst,
          titleHeight
        ]
      },
      {
        title: translations["Strength"],
        color: palette.areasColors["Strength"],
        coordinates: [
          ySecond,
          plotTop - titleHeight,
          plotWidth - ySecond + plotLeft,
          titleHeight
        ]
      },
      {
        title: translations["Improve"],
        color: "#ffa94c",
        coordinates: [
          plotLeft,
          plotHeight + plotTop,
          yFirst - plotLeft,
          titleHeight
        ]
      },
      {
        title: translations["Maintain"],
        color: "#cccccc",
        coordinates: [
          yFirst,
          plotHeight + plotTop,
          ySecond - yFirst,
          titleHeight
        ]
      },
      {
        title: translations["Maintain"],
        color: palette.areasColors['Maintain'],
        coordinates: [
          ySecond,
          plotHeight + plotTop,
          plotWidth - ySecond + plotLeft,
          titleHeight
        ]
      }
    ];

    return areas;
  }
}
