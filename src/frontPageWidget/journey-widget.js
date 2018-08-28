export default class JourneyWidget {
  constructor({tableContainerId, cardContainerId, drilldownId, CJ_options}) {
    this.CJ_options = CJ_options;
    this.cj_table = document.getElementById(tableContainerId).querySelector('table');
    this.cardContainer = document.getElementById(cardContainerId);
    this.drilldownButton = document.getElementById(drilldownId).querySelector('input');
    this.init();
  }

  init() {
    this.getDataFromTable();
    this.filterByNegativeKeyMetric();
    if(this.CJ_objectToProcess.length > 0) {
      this.createWidget();
    }
  }

  getDataFromTable() {
    let options = this.CJ_options[0];

    this.CJ_objectToProcess = [].reduce.call(this.cj_table.tBodies[0].children, (result, current) => {
      if (current.children[0].innerText.trim().indexOf(options.linebreakSegment) >= 0) {
        options = this.CJ_options[result.length];

        result[result.length] = {
          KeyMetricId: options.KeyMetricId,
          colors: options.colors,
          rows: []
        };
      } else {
        if (options.isCollapsed) {
          if (options.isSomeStatisticUsed) {
            result[result.length - 1].rows.push(current);
          } else {
            if (current.children[0].innerText.trim().indexOf(options.questionSegment) >= 0) {
              current.children[0].innerText = current.previousElementSibling.previousElementSibling.children[0].innerText.trim();
              result[result.length - 1].rows.push(current);
            }
          }
        } else {
          result[result.length - 1].rows.push(current);
        }
      }

      return result;
    }, []);
  }

  filterByNegativeKeyMetric() {
    this.CJ_objectToProcess = this.CJ_objectToProcess.map(object => {
      const colors = Object.keys(object.colors);

      const minimumRangeColor = colors.reduce(
        (minimum, currentColor) => object.colors[currentColor][0] < object.colors[minimum][0] ? currentColor : minimum
      );

      const minimumRange = object.colors[minimumRangeColor];

      object.rows = object.rows.filter(row => {
        const metricId = object.KeyMetricId;
        const metricValueNumber = parseFloat(row.children[metricId + 1].innerText);
        return metricValueNumber >= minimumRange[0] && metricValueNumber <= minimumRange[1];
      });

      return object;
    }).filter(object => object.rows.length > 0);
  }

  createWidget() {
    const card = document.createElement('article');
    card.className = 'dashboard__widget dashboard__widget--small r2i-widget r2i-x-smal ta-widget ta-journey-widget';
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
    cardTitle.innerText = 'Where should we focus improvement?';

    let cardMenu = document.createElement('div');
    cardMenu.className = 'widget__header-menu-container';

    let infoIcon = document.createElement('div');
    infoIcon.className = 'ta-info-icon';

    let infoText = document.createElement('div');
    infoText.className = 'ta-info-text';
    infoText.innerText = "Surfaces any concerns customers are raising across the journey. " +
      "It will show the pain points based on your criteria for action. \n\n" +
      "Clicking on this box will take you through to the journey page to learn more.";
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

    this.CJ_objectToProcess.forEach(obj => {
      obj.rows.forEach(row => {
        const metricId = obj.KeyMetricId;
        const metricValueNumber = parseFloat(row.children[metricId + 1].innerText);
        let metricColor = '#dedede';

        for (let color in obj.colors) {
          if (metricValueNumber >= obj.colors[color][0] && metricValueNumber <= obj.colors[color][1]) {
            metricColor = color;
            break;
          }
        }

        text += ("<span style='color:" + metricColor + "'>" + row.children[0].innerText + "</span><br/>");
      });
    });

    wrapper.innerHTML = text;
    mainContent.appendChild(wrapper);

    return mainContent;
  }

  createButtons(card) {
    let button = document.createElement('button');
    button.className = "comd-button___studio";
    button.innerHTML = "Co to Customer Journey Page";
    // button.onclick = () => this.drilldownButton.click();

    let buttonsGroup = document.createElement('div');
    buttonsGroup.className = 'r2i-buttons-group-right';

    buttonsGroup.appendChild(button);
    card.appendChild(buttonsGroup);
  }
}
