
import CorrelationChart from './correlationChart'
import CorrelationTable from './correlationTable'

export default class CorrelationView {
  constructor({tableContainer, chartContainer, buttonsContainer, table, palette, translations, questionName, correlationAxis}) {
    this.tableContainer = tableContainer;
    this.chartContainer = chartContainer;
    this.buttonsContainer = buttonsContainer;

    this.init({table, palette, translations, questionName, correlationAxis});
  }

  init({table, palette, translations, questionName, correlationAxis}) {
    this.correlationChart = new CorrelationChart({container: this.chartContainer, table, palette, translations, questionName, correlationAxis});
    this.correlationTable = new CorrelationTable({container: this.tableContainer, table, palette, translations});

    document.querySelector(`#${this.tableContainer}`).classList.add('hidden');
    document.querySelector(`#${this.buttonsContainer}>#chart-switcher`).classList.add('selected');
    document.querySelector(`#quadrant-table`).classList.add('hidden');


    document.querySelector(`#${this.buttonsContainer}>#table-switcher`).addEventListener('click', () => {
      document.querySelector(`#${this.tableContainer}`).classList.remove('hidden');
      document.querySelector(`#${this.chartContainer}`).classList.add('hidden');
      document.querySelector(`#${this.buttonsContainer}>#table-switcher`).classList.add('selected');
      document.querySelector(`#${this.buttonsContainer}>#chart-switcher`).classList.remove('selected');
      document.querySelector(`#quadrant-table`).classList.remove('hidden');
      document.querySelector(`#quadrant-chart`).classList.add('hidden');
    });

    document.querySelector(`#${this.buttonsContainer}>#chart-switcher`).addEventListener('click', () => {
      document.querySelector(`#${this.tableContainer}`).classList.add('hidden');
      document.querySelector(`#${this.chartContainer}`).classList.remove('hidden');
      document.querySelector(`#${this.buttonsContainer}>#table-switcher`).classList.remove('selected');
      document.querySelector(`#${this.buttonsContainer}>#chart-switcher`).classList.add('selected');
      document.querySelector(`#quadrant-table`).classList.add('hidden');
      document.querySelector(`#quadrant-chart`).classList.remove('hidden');

      //this made to fix overflowing chart, but it may cause some performance problems
      this.correlationChart = new CorrelationChart({container: this.chartContainer, table, palette, translations, questionName, correlationAxis});
    });

    document.querySelector(`#${this.buttonsContainer}>#correlation-help`).addEventListener('mouseenter', () => {
      document.querySelector(`#correlation-help-text`).classList.remove('hidden');
    });

    document.querySelector(`#${this.buttonsContainer}>#correlation-help`).addEventListener('mouseleave', () => {
      document.querySelector(`#correlation-help-text`).classList.add('hidden');
    });
  }
}
