
import CorrelationChart from './correlationChart'
import CorrelationTable from './correlationTable'

export default class CorrelationView {
  constructor({tableContainer, chartContainer, buttonsContainer, table, palette, translations}){
    this.tableContainer = tableContainer;
    this.chartContainer = chartContainer;
    this.buttonsContainer = buttonsContainer;

    this.init({table, palette, translations});
  }

  init({table, palette, translations}) {
      this.correlationChart = new CorrelationChart({container: this.chartContainer, table, palette, translations});
      this.correlationTable = new CorrelationTable({table, palette, translations});

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
    });


  }
}
