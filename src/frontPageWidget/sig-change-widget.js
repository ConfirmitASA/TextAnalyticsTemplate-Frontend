export default class SignificantChangeWidget {
  constructor({tableContainerId, cardContainerId, drilldownId, type, translations}) {
    this.table = document.getElementById(tableContainerId).querySelector('table');
    this.cardContainer = document.getElementById(cardContainerId);
    this.drilldownButton = document.getElementById(drilldownId).querySelector('input');
    this.isSentiment = (type === "sentiment");
    this.translations = translations;
    this.init();
  }

  init() {
    this.getDataFromTable();
    this.createWidget();
  }

  getDataFromTable() {
    const classes = this.isSentiment ? '.decreasingS, .increasingS' : '.decreasingC, .increasingC';

    this.data = [].slice.call(this.table.querySelectorAll(classes))
      .sort(
        this.isSentiment ?
          SignificantChangeWidget.sortBySentiment :
          SignificantChangeWidget.sortByVolume
      )
      .slice(0, 3);
  }

  static sortBySentiment(first, second) {
    const firstDifference = Math.abs(
      parseFloat(first.nextElementSibling.innerText) -
      parseFloat(first.previousElementSibling.previousElementSibling.innerText)
    );

    const secondDifference = Math.abs(
      parseFloat(second.nextElementSibling.innerText) -
      parseFloat(second.previousElementSibling.previousElementSibling.innerText)
    );

    return secondDifference - firstDifference;
  }

  static sortByVolume(first, second) {
    const firstDifference = Math.abs(
      parseFloat(first.innerText) -
      parseFloat(first.previousElementSibling.previousElementSibling.previousElementSibling.innerText)
    );

    const secondDifference = Math.abs(
      parseFloat(second.innerText) -
      parseFloat(second.previousElementSibling.previousElementSibling.previousElementSibling.innerText)
    );

    return secondDifference - firstDifference;
  }

  createWidget() {
    const card = document.createElement('article');
    card.className = 'dashboard__widget dashboard__widget--small r2i-widget r2i-x-smal ta-widget ta-sig-change-widget';
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
    cardTitle.innerText = (
      this.isSentiment ?
        this.translations['sig change in sentiment title'] :
        this.translations['sig change in volume title']
    );

    let cardMenu = document.createElement('div');
    cardMenu.className = 'widget__header-menu-container';

    let infoIcon = document.createElement('div');
    infoIcon.className = 'ta-info-icon';

    let infoText = document.createElement('div');
    infoText.className = 'ta-info-text';
    infoText.innerHTML = (
      this.isSentiment ?
        this.translations['sig change in sentiment info text'] :
        this.translations['sig change in volume info text']
    );
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

    let text = "";

    if(this.data.length <= 0) {
      text = this.translations['Nothing significant'];
    } else {
      this.data.forEach(cell => {
        text += ("<span class='" +
          (cell.className.indexOf('increasing' + (this.isSentiment ? 'S' : 'C')) >= 0 ?
            "ta-sig-change-widget__increasing" :
            "ta-sig-change-widget__decreasing") +
          "'>" + cell.parentNode.children[0].innerText + "</span><br/>");
      });
    }

    wrapper.innerHTML = text;
    mainContent.appendChild(wrapper);

    return mainContent;
  }

  createButtons(card) {
    let button = document.createElement('button');
    button.className = "comd-button___studio";
    button.innerHTML = this.translations['sig change widget button'];
    // button.onclick = () => this.drilldownButton.click();

    let buttonsGroup = document.createElement('div');
    buttonsGroup.className = 'r2i-buttons-group-right';

    buttonsGroup.appendChild(button);
    card.appendChild(buttonsGroup);
  }
}
