export default class SignificantChangesAlerts_studio {

  constructor({tableId, containerId, translations, separator}) {
    this.table = document.getElementById(tableId);
    this.container = document.getElementById(containerId);
    this.translations = translations;
    this.separator = (!!separator && separator != "") ? separator : "|";
    this.alerts = [];
    this.init();
  }

  init() {
    this.getDataFromTable();
    this.createCards();
    //this.setCardsHeight();
  }

  getDataFromTable() {
    let markedCells;
    markedCells  = [...this.table.querySelectorAll('body td.increasingC:last-child, tbody td.decreasingC:last-child, tbody td.increasingS:last-child, tbody td.decreasingS:last-child')];
    markedCells.forEach(cell => {
      let categoryText = "";
      let changesText = "";
      let drilldownRef = cell.parentElement.firstElementChild.firstElementChild;
      cell.parentElement.firstElementChild.innerText.split(this.separator).forEach(categoryLevel => {
        categoryText += categoryLevel.trim() + '<br>';
      });
      const changeTypesArray = [{class:'increasingC', text:'increased in Volume', r2class :'target__number r2i-green-color'},
          {class:'increasingS', text:'increased in Sentiment', r2class :'target__number r2i-green-color'},
          {class:'decreasingC', text:'decreased in Volume', r2class :'target__number r2i-dark-red-color'},
          {class:'decreasingS', text:'decreased in Sentiment', r2class :'target__number r2i-dark-red-color'}];
      changeTypesArray.forEach(classItem => {
        if (cell.classList.contains(classItem.class)){
          changesText += classItem.text + '\n';
          categoryText = "<span class = '" + classItem.r2class+ "'>" + categoryText  + "</span>";
        }
      });
      this.alerts.push({categoryText: categoryText, changesText: changesText, drilldownRef: drilldownRef});
    })
  }

  createCards() {
    let rowContainer;
    let headerContainer, header;
    rowContainer = document.createElement('div');
    rowContainer.className = 'r2i-row r2i-row--max-width';
    for(var i = 0; i < this.alerts.length; i++)
      rowContainer.appendChild(this.createCard(i));

    if ( this.alerts.length > 0) {
      headerContainer = document.createElement('div');
      headerContainer.className = "r2i-row r2i-row--max-width";
      header = document.createElement('div');
      header.className = "r2-title-view text_headline";
      header.innerText = this.translations['What has significantly changed last month'];
      this.container.appendChild((headerContainer));
      headerContainer.appendChild((header));
    }
    this.container.appendChild(rowContainer);
  }

  createCard(index) {
    let alertItem = this.alerts[index];
    let alertCard = document.createElement('article');
    alertCard.className = 'dashboard__widget dashboard__widget--small r2i-widget r2i-TA-x-small';

    let alertHeader = document.createElement('header');
    alertHeader.className = 'widget__header';
    let alertTitle = document.createElement('h3');
    alertTitle.className = 'widget__title';
    alertTitle.innerText = 'Category';
    alertHeader.appendChild(alertTitle);


    let alertCategory  = document.createElement('div');
    alertCategory.innerHTML = alertItem.categoryText;

    let alertChanges = document.createElement('div');
    alertChanges.innerText = alertItem.changesText;
    alertChanges.className = 'small__text';

    let widgetBody = document.createElement('div');
    widgetBody.className = 'widget__body widget__body--no-scrolling';
    let kpiElement = document.createElement('div');
    kpiElement.className = 'co-st-r-widget-kpi r2i-kpi-content-center';
    let mainContent = document.createElement('div');

    widgetBody.appendChild(kpiElement);
    kpiElement.appendChild(mainContent);
    mainContent.appendChild(alertCategory);
    mainContent.appendChild(alertChanges);

    let buttonsGroup = document.createElement('div');
    buttonsGroup.className = 'r2i-buttons-group-right';
    let button = document.createElement('button');
    button.className = "comd-button___studio";
    button.innerHTML = this.translations['Alert Button'];
    buttonsGroup.appendChild(button);

    alertCard.appendChild(alertHeader);
    alertCard.appendChild(widgetBody );
    alertCard.appendChild(buttonsGroup );

    button.onclick = () => {
      alertItem.drilldownRef.click();
    }
    return alertCard;
  }


  setCardsHeight() {
    const categoriesSections = [...this.container.querySelectorAll('.alert-card__category')];
    const maxHeightCategories = categoriesSections.length > 0 ? categoriesSections.reduce((res, cur) => cur.clientHeight > res.clientHeight ? cur : res).clientHeight : 0;
    categoriesSections.forEach(title => title.style.height = maxHeightCategories + 'px');

    const changesSections = [...this.container.querySelectorAll('.alert-card__changes')];
    const maxHeightChanges = changesSections.length > 0? changesSections.reduce((res, cur) => cur.clientHeight > res.clientHeight ? cur : res).clientHeight : 0;
    changesSections.forEach(title => title.style.height = maxHeightChanges + 'px');
  }
}









