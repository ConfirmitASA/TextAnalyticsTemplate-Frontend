export default class SignificantChangesAlerts {

  constructor({tableId, containerId, separator}) {
    this.table = document.getElementById(tableId);
    this.container = document.getElementById(containerId);
    this.separator = (!!separator && separator != "") ? separator : "|";
    this.alerts = [];
    this.init();
  }

  init() {
    this.getDataFromTable();
    this.createCards();
    this.setCardsHeight();
  }

  getDataFromTable() {
    let markedCells;
    markedCells  = [...this.table.querySelectorAll('body td.increasingC:last-child, tbody td.decreasingC:last-child, tbody td.increasingS:last-child, tbody td.decreasingS:last-child')];
    markedCells.forEach(cell => {
      let categoryText = "";
      let changesText = "";
      let drilldownRef = cell.parentElement.firstElementChild.firstElementChild;
      cell.parentElement.firstElementChild.innerText.split(this.separator).forEach(categoryLevel => {
        categoryText += categoryLevel.trim() + '\n';
      });
      const changeTypesArray = [{class:'increasingC', text:'<span class="alert-card__increasing">increased</span> in Volume'},
                                {class:'increasingS', text:'<span class="alert-card__increasing">increased</span> in Sentiment'},
                                {class:'decreasingC', text:'<span class="alert-card__decreasing">decreased</span> in Volume'},
                                {class:'decreasingS', text:'<span class="alert-card__decreasing">decreased</span> in Sentiment'}];
      changeTypesArray.forEach(classItem => {
        if (cell.classList.contains(classItem.class))
          changesText += classItem.text+ '<br>';
      });
      this.alerts.push({categoryText: categoryText, changesText: changesText, drilldownRef: drilldownRef});
    })
  }

  createCards() {
    this.alerts.forEach(alertItem => {
      let alertCard = document.createElement('div');
      alertCard.className = 'alert-card';

      let alertHeader = document.createElement('div');
      alertHeader.innerText = 'Category';
      alertHeader.className = 'alert-card__title';

      let alertCategory  = document.createElement('div');
      alertCategory.innerText = alertItem.categoryText;
      alertCategory.className = 'alert-card__category';


      let alertChanges = document.createElement('div');
      alertChanges.innerHTML = alertItem.changesText;
      alertChanges.className = 'alert-card__changes';


      alertCard.appendChild(alertHeader);
      alertCard.appendChild(alertCategory);
      alertCard.appendChild(alertChanges);
      alertCard.onclick = () => {
       alertItem.drilldownRef.click();
      }

      this.container.appendChild(alertCard);
      this.container.className += " alerts-content";
    });
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











