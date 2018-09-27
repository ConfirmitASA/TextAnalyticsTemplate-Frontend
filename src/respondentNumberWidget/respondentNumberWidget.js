export default class RespondentNumberWidget {
  constructor({
                totalCommentsTableContainerId,
                positiveCommentsTableContainerId,
                neutralCommentsTableContainerId,
                negativeCommentsTableContainerId,
                cardContainerId,
                translations
              }) {
    this.tilesInfo = {
      total: {
        number: this.getDataFromTable(totalCommentsTableContainerId),
        icon: '<div class="icon icon-comment"></div>',
        title: translations['respondent number widget title - total']
      },
      positive: {
        number: this.getDataFromTable(positiveCommentsTableContainerId),
        icon: '<div class="icon">\n' +
        '\t<svg class="cf_positive" height="48" viewBox="0 0 24 24" width="48" xmlns="https://www.w3.org/2000/svg">\n' +
        '\t<circle cx="15.5" cy="9.5" r="1.5"></circle>\n' +
        '\t<circle cx="8.5" cy="9.5" r="1.5"></circle>\n' +
        '\t<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-4c-1.48 0-2.75-.81-3.45-2H6.88c.8 2.05 2.79 3.5 5.12 3.5s4.32-1.45 5.12-3.5h-1.67c-.7 1.19-1.97 2-3.45 2z"></path>\n' +
        '\t</svg>\n' +
        '</div>',
        title: translations['respondent number widget title - positive']
      },
      neutral: {
        number: this.getDataFromTable(neutralCommentsTableContainerId),
        icon: '<div class="icon">\n' +
        '\t<svg class="cf_neutral" height="48" viewBox="0 0 24 24" width="48" xmlns="https://www.w3.org/2000/svg">\n' +
        '\t<path d="M9 14h6v1.5H9z"></path>\n' +
        '\t<circle cx="15.5" cy="9.5" r="1.5"></circle>\n' +
        '\t<circle cx="8.5" cy="9.5" r="1.5"></circle>\n' +
        '\t<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path>\n' +
        '\t</svg>\n' +
        '</div>',
        title: translations['respondent number widget title - neutral']
      },
      negative: {
        number: this.getDataFromTable(negativeCommentsTableContainerId),
        icon: '<div class="icon">\n' +
        '\t<svg class="cf_negative" height="48" viewBox="0 0 24 24" width="48" xmlns="https://www.w3.org/2000/svg">\n' +
        '\t<circle cx="15.5" cy="9.5" r="1.5"></circle>\n' +
        '\t<circle cx="8.5" cy="9.5" r="1.5"></circle>\n' +
        '\t<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-6c-2.33 0-4.32 1.45-5.12 3.5h1.67c.69-1.19 1.97-2 3.45-2s2.75.81 3.45 2h1.67c-.8-2.05-2.79-3.5-5.12-3.5z"></path>\n' +
        '\t</svg>\n' +
        '</div>',
        title: translations['respondent number widget title - negative']
      }
    };
    this.cardContainer = document.getElementById(cardContainerId);
    this.init();
  }

  init() {
    Object.keys(this.tilesInfo).forEach(key => {
      this.createWidget(key);
    });
  }

  getDataFromTable(tableContainerId) {
    return document.getElementById(tableContainerId)
      .querySelector('table > tbody > tr > td:last-child').innerText.trim();
  }

  createWidget(key) {
    const card = document.createElement('article');
    card.className = 'dashboard__widget dashboard__widget--small';

    this.createCardHeader(card, key);
    this.createCardBody(card, key);

    this.cardContainer.appendChild(card);
  }

  createCardHeader(card, name) {
    const cardHeader = document.createElement('header');
    cardHeader.className = 'widget__header';

    const cardTitle = document.createElement('h3');
    cardTitle.className = 'widget__title';
    cardTitle.innerText = this.tilesInfo[name].title;

    cardHeader.appendChild(cardTitle);
    card.appendChild(cardHeader);
  }

  createCardBody(card, key) {
    const widgetBody = document.createElement('div');
    widgetBody.className = 'widget__body widget__body--no-scrolling';

    const kpiElement = document.createElement('div');
    kpiElement.className = 'co-st-r-widget-kpi r2i-kpi-content-center ta-respondent-number__body';

    const mainContent = this.createContent(key);

    kpiElement.appendChild(mainContent);
    widgetBody.appendChild(kpiElement);
    card.appendChild(widgetBody);
  }

  createContent(key) {
    const mainContent = document.createElement('div');
    mainContent.className = 'ta-respondent-number__content';

    const svgContainer = document.createElement('div');
    svgContainer.className = 'ta-respondent-number__icon';
    svgContainer.innerHTML = this.tilesInfo[key].icon;

    const numberContainer = document.createElement('div');
    numberContainer.className = 'target__number';
    numberContainer.innerText = this.tilesInfo[key].number;

    mainContent.appendChild(svgContainer);
    mainContent.appendChild(numberContainer);
    return mainContent;
  }
}
