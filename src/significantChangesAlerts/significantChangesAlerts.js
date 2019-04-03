export default class SignificantChangesAlerts {

  constructor({table, containerId, translations, separator, period, drilldownButtonContainer, drilldownParameterContainer, drilldownPage}) {
    this.table = table;
    this.container = document.getElementById(containerId);
    this.translations = translations;
    this.period = period;
    this.separator = (!!separator && separator !== "") ? separator : "|";
    this.alerts = [];
    this.drilldownButton = document.querySelector('#' + drilldownButtonContainer + ' input');
    this.drilldownPage = drilldownPage;
    this.drilldownParameter = document.querySelector('#' + drilldownParameterContainer + ' select');
    this.init();
  }

  init() {
    this.getDataFromTable();
    this.createCards();
  }

  getDataFromTable() {
    let markedCells;
    markedCells = [...this.table.querySelectorAll('tbody td.increasingC:nth-last-child(8), tbody td.decreasingC:nth-last-child(8), tbody td.increasingS:nth-last-child(7), tbody td.decreasingS:nth-last-child(7)')];

    markedCells.forEach(cell => {
      let categoryText = "";
      let changesText = "";

      cell.parentElement.firstElementChild.innerText.split(this.separator).forEach(categoryLevel => {
        categoryText += categoryLevel.trim() + '<br>';
      });

      const changeTypesArray = [{
        changeTypeClass: 'increasingC',
        text: 'increased in Volume',
        r2class: 'target__number r2i-green-color'
      }, {
        changeTypeClass: 'increasingS',
        text: 'increased in Overall Satisfaction',
        r2class: 'target__number r2i-green-color'
      }, {
        changeTypeClass: 'decreasingC',
        text: 'decreased in Volume',
        r2class: 'target__number r2i-dark-red-color'
      }, {
        changeTypeClass: 'decreasingS',
        text: 'decreased in Overall Satisfaction',
        r2class: 'target__number r2i-dark-red-color'
      }];

      changeTypesArray.forEach(classItem => {
        if (cell.classList.contains(classItem.changeTypeClass)) {
          changesText += classItem.text + '\n';
          categoryText = "<span class = '" + classItem.r2class + "'>" + categoryText + "</span>";
        }
      });

      this.alerts.push({
        categoryText: categoryText,
        changesText: changesText,
        hierarchyElement: this.getHierarchyElement(cell)
      });
    })
  }

  createCards() {
    let rowContainer;
    rowContainer = document.createElement('div');
    rowContainer.className = 'r2i-row r2i-row--max-width';
    for (let i = 0; i < this.alerts.length; i++)
      rowContainer.appendChild(this.createCard(i));

    if (this.alerts.length > 0) {
      let headerContainer = document.createElement('div');
      headerContainer.className = "r2i-row r2i-row--max-width";
      let headerTitleWidget = document.createElement('div');
      headerTitleWidget.className = "r2-title-widget";
      let headerTitleView = document.createElement('div');
      headerTitleView.className = "r2-title-view";
      let headerTitleViewName = document.createElement('div');
      headerTitleViewName.className = "r2-title-view__name";

      headerTitleViewName.innerText = this.translations['What has significantly changed last '] + this.translations[this.period];

      this.container.appendChild(headerContainer);
      headerContainer.appendChild(headerTitleWidget);
      headerTitleWidget.appendChild(headerTitleView);
      headerTitleView.appendChild(headerTitleViewName);
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


    let alertCategory = document.createElement('div');
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
    button.innerHTML = this.translations['Alert Button To ' + this.drilldownPage];
    buttonsGroup.appendChild(button);

    alertCard.appendChild(alertHeader);
    alertCard.appendChild(widgetBody);
    alertCard.appendChild(buttonsGroup);

    button.onclick = () => {
      const options = [...this.drilldownParameter.options];
      const currentOptionIndex = this.findCategoryOptionIndex(options, alertItem.hierarchyElement);
      this.drilldownParameter.options[currentOptionIndex].selected = true;

      this.drilldownButton.click();
    };

    return alertCard;
  }

  findCategoryOptionIndex(options, hierarchyElement) {
    let isCategoryFound = false, isSubCategoryFound = false;
    let optionIndex = 0;

    for (let i = 0; i < options.length; i++) {
      const text = options[i].innerText.trim();

      if (hierarchyElement.attribute && isCategoryFound && isSubCategoryFound
        && text === hierarchyElement.attribute) {
        optionIndex = i;
        break;
      }

      if (hierarchyElement.subCategory && isCategoryFound && !isSubCategoryFound
        && text === hierarchyElement.subCategory) {
        isSubCategoryFound = true;
        optionIndex = i;
        if(!hierarchyElement.attribute) {
          break;
        }
      }

      if (!isCategoryFound && text === hierarchyElement.category) {
        isCategoryFound = true;
        optionIndex = i;
        if(!hierarchyElement.subCategory) {
          break;
        }
      }
    }

    return optionIndex;
  }

  getHierarchyElement(cell) {
    const row = cell.parentElement;
    const rowLevel = row.className[row.className.indexOf("level") + 5];

    const getRowText = (row) => row.querySelector("td:first-child").innerText.trim();

    switch (rowLevel) {
      case "0":
        return {
          category: getRowText(row)
        };
      case "1":
        return {
          category: getRowText(this.getAncestor(row, 0)),
          subCategory: getRowText(row)
        };
      case "2":
        const subCategory = this.getAncestor(row, 1);
        return {
          category: getRowText(this.getAncestor(subCategory, 0)),
          subCategory: getRowText(subCategory),
          attribute: getRowText(row)
        };
      default:
        return {
          category: getRowText(row)
        };
    }
  }

  getAncestor(row, ancestorLevel) {
    let ancestor = row.previousSibling;
    while (!ancestor || !ancestor.classList.contains("level" + ancestorLevel)) {
     ancestor = ancestor.previousSibling;
    }
    return ancestor;
  }
}
