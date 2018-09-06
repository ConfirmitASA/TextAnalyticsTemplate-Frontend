export default class ImpactAnalysisWidget {
  constructor({tableContainerId, cardContainerId, translations, areaId}) {
    this.table = document.getElementById(tableContainerId).querySelector('table');
    this.cardContainer = document.getElementById(cardContainerId);

    this.area = {
      id: areaId,
      headerText: translations["impact analysis widget header text " + areaId],
      infoText: translations['impact analysis widget info text ' + areaId],
      title: translations['impact analysis widget title ' + areaId],
      buttonText: translations['impact analysis widget button'],
      rows: []
    };

    this.init();
  }

  init() {
    this.getDataFromTable();
    this.createWidget();
  }


  getDataFromTable() {
    this.rows = [...this.table.querySelectorAll("tbody>tr")];
  }

  createWidget() {
    const card = document.createElement('article');
    card.className = 'dashboard__widget dashboard__widget--small r2i-widget r2i-x-smal ta-widget ta-impact-analysis-widget';
    card.onclick = () => this.drilldownButton.click();

    this.createCardHeader(card);
    this.createCardBody(card);
    this.createButtons(card);

    this.cardContainer.appendChild(card);
  }

  createCardHeader(card) {
    let cardHeader = document.createElement('header');
    cardHeader.className = 'widget__header';

    let cardTitle = document.createElement('h3');
    cardTitle.className = 'widget__title';
    cardTitle.innerText = this.area.title;

    let cardMenu = document.createElement('div');
    cardMenu.className = 'widget__header-menu-container';

    let infoIcon = document.createElement('div');
    infoIcon.className = 'ta-info-icon';

    let infoText = document.createElement('div');
    infoText.className = 'ta-info-text';
    infoText.innerHTML = this.area.infoText;
    infoText.style.display = "none";

    infoIcon.onmouseover = () => {
      infoText.style.display = "";
    };

    infoIcon.onmouseout = () => {
      infoText.style.display = "none";
    };

    cardMenu.appendChild(infoIcon);
    cardHeader.appendChild(cardTitle);
    cardHeader.appendChild(cardMenu);

    card.appendChild(cardHeader);
    card.appendChild(infoText);
  }

  createCardBody(card) {
    let widgetBody = document.createElement('div');
    widgetBody.className = 'widget__body widget__body--no-scrolling';

    let kpiElement = document.createElement('div');
    kpiElement.className = 'co-st-r-widget-kpi r2i-kpi-content-center';

    let mainContent = this.createCategoriesContainer();

    kpiElement.appendChild(mainContent);
    widgetBody.appendChild(kpiElement);
    card.appendChild(widgetBody);
  }

  createCategoriesContainer() {
    const rows = this.rows;

    let mainContent = document.createElement('div');
    mainContent.className = 'target__number';

    let isAnythingShown = false;

    if (rows.length > 0) {
      let area = this.area;
      area.rows = rows.filter((row, index) => (index > 0 && row.children[1].classList.contains(`cf_${area.id}`)));

      if (area.rows.length > 0) {
        isAnythingShown = true;

        const wrapper = document.createElement('div');
        const header = document.createElement('div');
        header.className = `correlation-header correlation-header--${area.id}`;
        header.innerText = area.headerText;
        const table = document.createElement('table');
        table.className = 'reportal-table';
        const tbody = document.createElement('tbody');
        tbody.className = `correlation-list correlation-list--${area.id}`;

        table.appendChild(tbody);
        wrapper.appendChild(header);
        wrapper.appendChild(table);
        mainContent.appendChild(wrapper);

        area.rows.forEach((row, index) => {
          const newRow = this.createRow(row, index + 1);
          newRow.style.verticalAlign = '';
          tbody.appendChild(newRow);
        });
      }
    }

    if (!isAnythingShown) {
      const label = document.createElement('label');
      label.innerText = 'No data to display';
      mainContent.appendChild(label);
    }

    return mainContent;
  }

  createRow(row, index) {
    const tr = document.createElement('tr');

    const order = document.createElement('td');
    order.innerText = index;

    const categoryCell = document.createElement('td');
    const categoryContainer = row.firstElementChild;
    if (categoryContainer.firstElementChild && categoryContainer.firstElementChild.tagName.toLowerCase() === 'a') {
      const categoryName = categoryContainer.firstElementChild.cloneNode(true);
      categoryCell.appendChild(categoryName);
    } else {
      categoryCell.innerText = categoryContainer.innerText;
    }

    const counts = document.createElement('td');
    const countsDiv = document.createElement('div');
    const countsValue = row.children[row.children.length - 2].innerText;
    countsDiv.innerText = countsValue;
    counts.appendChild(countsDiv);

    tr.appendChild(order);
    tr.appendChild(categoryCell);
    tr.appendChild(counts);

    return tr
  }


  createButtons(card) {
    let button = document.createElement('div');
    button.className = "comd-button___studio";
    button.innerHTML = this.area.buttonText;
    // button.onclick = () => this.drilldownButton.click();

    let buttonsGroup = document.createElement('div');
    buttonsGroup.className = 'r2i-buttons-group-right';

    buttonsGroup.appendChild(button);
    card.appendChild(buttonsGroup);
  }
}
