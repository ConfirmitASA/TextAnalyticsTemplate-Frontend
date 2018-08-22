if (!Object.assign) {
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function (target, firstSource) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert first argument to object');
      }

      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
          continue;
        }

        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    }
  });
}

/**
 * This is required to fix a bug in MicrosoftAjaxWebForms.js
 * in Firefox where if window.event is not initialized, it loops stack
 * via arguments.callee.caller chain and breaks because of the
 * "use strict" mode
 */
function hackEventWithinDoPostBack() {
  var originalDoPostBack = window.WebForm_DoPostBackWithOptions;

  window.WebForm_DoPostBackWithOptions = function hackedDoPostBack() {
    if (!window.event)
      window.event = {};
    return originalDoPostBack.apply(this, arguments);
  };
}

export default class JourneyWidget {
  constructor({tableContainerId, cardContainerId, drilldownId, CJ_options}) {
    this.CJ_options = CJ_options;
    this.cj_table = document.getElementById(tableContainerId).querySelector('table');
    this.cardContainer = document.getElementById(cardContainerId);
    this.cardContainer.className = "cj-cards";

    const drilldownContainer = document.getElementById(drilldownId);
    this.drilldownSelect = drilldownContainer.querySelector('select');
    this.drilldownButton = drilldownContainer.querySelector('input');

    this.cj_namespace = "http://www.w3.org/2000/svg";
    this.cj_circleRadius = 55;
    this.cj_thickness = 5;

    this.init();
  }

  init() {
    this.getDataFromTable();
    this.filterByNegativeKeyMetric();
    this.createWidget();
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
    card.className = 'dashboard__widget dashboard__widget--small r2i-widget r2i-x-smal';

    let cardHeader = document.createElement('header');
    cardHeader.className = 'widget__header';

    let cardTitle = document.createElement('h3');
    cardTitle.className = 'widget__title';
    cardTitle.innerText = 'Where should we focus improvement?';
    cardTitle.style.whiteSpace = "normal";

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


    /*cardMenuButtonSpan.innerHTML = "";


  <div class="widget__header-menu-container">
      <button class="comd-button___studio comd-button--icon___studio">
      <span class="widget__options">icon</span>
      </button>
  </div>*/


    let widgetBody = document.createElement('div');
    widgetBody.className = 'widget__body widget__body--no-scrolling';

    let kpiElement = document.createElement('div');
    kpiElement.className = 'co-st-r-widget-kpi r2i-kpi-content-center';

    let mainContent = this.createCategoriesContainer();

    let button = document.createElement('button');
    button.className = "comd-button___studio";
    button.innerHTML = "Co to Customer Journey Page";
    button.onclick = () => this.drilldownButton.click();

    let buttonsGroup = document.createElement('div');
    buttonsGroup.className = 'r2i-buttons-group-right';

    cardMenu.appendChild(infoIcon);
    cardHeader.appendChild(cardTitle);
    cardHeader.appendChild(cardMenu);
    card.appendChild(cardHeader);

    kpiElement.appendChild(mainContent);
    widgetBody.appendChild(kpiElement);
    card.appendChild(widgetBody);

    buttonsGroup.appendChild(button);
    card.appendChild(buttonsGroup);

    card.appendChild(infoText);

    this.cardContainer.appendChild(card);
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
}
