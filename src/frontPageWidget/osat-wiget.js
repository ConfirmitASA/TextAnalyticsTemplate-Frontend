export default class OSATWidget {
  constructor({tableContainerId, cardContainerId, drilldownId, translations, sentimentConfig = [
    { sentiment: "positive", range: {min: 2, max: 5} },
    { sentiment: "neutral", range: {min: -1, max: 1} },
    { sentiment: "negative", range: {min: -5, max: -2} }
    ]}) {
    this.sentimentConfig = sentimentConfig;
    this.table = document.getElementById(tableContainerId).querySelector('table');
    this.cardContainer = document.getElementById(cardContainerId);
    this.drilldownButton = document.getElementById(drilldownId).querySelector('input');
    this.translations = translations;
    this.init();
  }

  init() {
    this.getDataFromTable();
    this.createWidget();
  }

  getDataFromTable() {
    const data = [].slice.call(this.table.querySelectorAll('tbody td'), 1, 3);
    this.previousValue = data[0];
    this.currentValue = data[1];
  }

  createWidget() {
    const card = document.createElement('article');
    card.className = 'dashboard__widget dashboard__widget--small r2i-widget r2i-x-smal ta-widget ta-osat-widget';
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
    cardTitle.innerText = this.translations['osat widget title'];

    let cardMenu = document.createElement('div');
    cardMenu.className = 'widget__header-menu-container';

    let infoIcon = document.createElement('div');
    infoIcon.className = 'ta-info-icon';

    let infoText = document.createElement('div');
    infoText.className = 'ta-info-text';
    infoText.innerHTML = this.translations['osat widget info text'];
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
    let mainContent = document.createElement('div');
    mainContent.className = 'target__number';
    let wrapper = document.createElement('div');
    wrapper.className = 'ta-osat-widget__wrapper';

    const prevColumn = document.createElement('div');
    prevColumn.className = 'ta-osat-widget__previous-period';
    const prevTitle = document.createElement('div');
    prevTitle.className = 'ta-osat-widget__previous-title';
    prevTitle.innerText = this.translations['osat widget previous period'];
    const prevValue = document.createElement('div');
    prevValue.className = 'ta-osat-widget__previous-value';
    prevValue.innerText = this.previousValue.innerText;

    const prevValueNumber = parseFloat(this.previousValue.innerText);

    for (let i = 0; i < this.sentimentConfig.length; i++) {
      if (prevValueNumber <= this.sentimentConfig[i].range.max &&
        prevValueNumber >= this.sentimentConfig[i].range.min) {
        prevValue.className += ' ta-osat-widget__' + this.sentimentConfig[i].sentiment;
      }
    }

    prevColumn.appendChild(prevTitle);
    prevColumn.appendChild(prevValue);



    const currentColumn = document.createElement('div');
    currentColumn.className = 'ta-osat-widget__current-period';
    const currentTitle = document.createElement('div');
    currentTitle.className = 'ta-osat-widget__current-title';
    currentTitle.innerText = this.translations['osat widget current period'];
    const currentValue = document.createElement('div');
    currentValue.className = 'ta-osat-widget__current-value';
    currentValue.innerText = this.currentValue.innerText;

    const currentValueNumber = parseFloat(this.previousValue.innerText);

    for (let i = 0; i < this.sentimentConfig.length; i++) {
      if (currentValueNumber <= this.sentimentConfig[i].range.max &&
        currentValueNumber >= this.sentimentConfig[i].range.min) {
        currentValue.className += ' ta-osat-widget__' + this.sentimentConfig[i].sentiment;
      }
    }

    currentColumn.appendChild(currentTitle);
    currentColumn.appendChild(currentValue);

    wrapper.appendChild(prevColumn);
    wrapper.appendChild(currentColumn);
    mainContent.appendChild(wrapper);

    return mainContent;
  }

  createButtons(card) {
    let button = document.createElement('button');
    button.className = "comd-button___studio";
    button.innerHTML = this.translations['osat widget button'];
    // button.onclick = () => this.drilldownButton.click();

    let buttonsGroup = document.createElement('div');
    buttonsGroup.className = 'r2i-buttons-group-right';

    buttonsGroup.appendChild(button);
    card.appendChild(buttonsGroup);
  }
}
