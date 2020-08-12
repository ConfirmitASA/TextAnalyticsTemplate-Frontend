import CorrelationChartSixAreas from './correlationChartSixAreas'

export default class CorrelationViewSixAreas {
  constructor({tableContainer, chartContainer, buttonsContainer, table, palette, translations, questionName}) {
    this.tableContainer = tableContainer;
    this.chartContainer = chartContainer;
    this.buttonsContainer = buttonsContainer;

    this.init({table, palette, translations, questionName});
  }

  init({table, palette, translations, questionName}) {
    this.correlationChart = new CorrelationChartSixAreas({container: this.chartContainer, table, palette, translations, questionName});
    document.querySelector(`#table-switcher`).style.display = "none";
    if (localStorage && localStorage['switcher-state'] === 'table') {
      localStorage['switcher-state'] = 'chart'
    }
    document.querySelector(`#${this.tableContainer}`).classList.add('hidden');
    document.querySelector(`#${this.buttonsContainer}>#chart-switcher`).classList.add('selected');
    document.querySelector(`#quadrant-table`).classList.add('hidden');

    document.querySelector(`#${this.buttonsContainer}>#table-switcher`).addEventListener('click', () => {
      if (localStorage) {
        localStorage['switcher-state'] = 'table';
      }

      document.querySelector(`#${this.tableContainer}`).classList.remove('hidden');
      document.querySelector(`#${this.chartContainer}`).classList.add('hidden');
      document.querySelector(`#${this.buttonsContainer}>#table-switcher`).classList.add('selected');
      document.querySelector(`#${this.buttonsContainer}>#chart-switcher`).classList.remove('selected');
      document.querySelector(`#quadrant-table`).classList.remove('hidden');
      document.querySelector(`#quadrant-chart`).classList.add('hidden');
    });

    document.querySelector(`#${this.buttonsContainer}>#chart-switcher`).addEventListener('click', () => {
      if (localStorage) {
        localStorage['switcher-state'] = 'chart';
      }

      document.querySelector(`#${this.tableContainer}`).classList.add('hidden');
      document.querySelector(`#${this.chartContainer}`).classList.remove('hidden');
      document.querySelector(`#${this.buttonsContainer}>#table-switcher`).classList.remove('selected');
      document.querySelector(`#${this.buttonsContainer}>#chart-switcher`).classList.add('selected');
      document.querySelector(`#quadrant-table`).classList.add('hidden');
      document.querySelector(`#quadrant-chart`).classList.remove('hidden');

      //this made to fix overflowing chart, but it may cause some performance problems
      this.correlationChart = new CorrelationChartSixAreas({container: this.chartContainer, table, palette, translations, questionName});
    });
  }
}
