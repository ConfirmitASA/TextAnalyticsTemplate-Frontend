export default class CustomerJourneyCards {

  constructor({tableId, cardContainerId, CJ_options}) {
    this.CJ_options = CJ_options;
    this.cj_table = document.getElementById(tableId);
    this.cardContainer = document.getElementById(cardContainerId);
    this.cardContainer.classList.add("cj-cards");

    this.cj_namespace = "http://www.w3.org/2000/svg";
    this.cj_circleRadius = 55;
    this.cj_thickness = 5;

    this.init();
  }

  init() {
    this.getDataFromTable();
    this.createCards();
  }

  getDataFromTable() {
    this.CJ_objectToProcess = [].reduce.call(document.getElementById('confirmit_agg_table').tBodies[0].children, (result, current) => {
      if (current.querySelector('td.t0_hc_line.active')) {
        result[result.length] = Object.assign({}, CJ_options[result.length]);
        result[result.length - 1].rows = [];
      } else {
        result[result.length - 1].rows.push(current);
      }

      return result;
    }, []);
  }

  createCards() {
    this.CJ_objectToProcess.forEach(obj => {
      obj.rows.forEach(row => {
        const card = this.createCard(obj, row);
        this.cardContainer.appendChild(card);
      });
    });
  }

  createCard(obj, row) {
    const cj_table_firstRow = this.cj_table.tHead.children[0];

    const card = document.createElement('div');
    const cardTitle = this.createTitle(row);
    card.appendChild(cardTitle);
    card.classList.add('cj-card');

    obj.MetricIds.forEach(metricId => {
      const metricName = cj_table_firstRow.children[metricId + 1].innerText;
      const metricValue = row.children[metricId + 1].innerText;

      if (obj.KeyMetricId === metricId) {
        const cardGauge = this.createGauge(obj, metricName, metricValue);
        card.insertBefore(cardGauge, cardTitle.nextElementSibling);
      } else {
        const cardRow = this.createCardRow(metricName, metricValue);
        card.appendChild(cardRow);
      }
    });

    return card;
  }

  createTitle(row) {
    const cardTitle = document.createElement('div');
    cardTitle.classList.add('cj-card__title');
    cardTitle.innerText = row.children[0].innerText;
    return cardTitle;
  }

  createGauge(obj, metricName, metricValue) {
    const cardGauge = document.createElement('div');
    cardGauge.classList.add('cj-card__gauge');
    cardGauge.style.width = this.cj_circleRadius * 2 + 'px';

    const svg = this.createGaugeSVG(obj, metricName, metricValue);
    cardGauge.appendChild(svg);

    return cardGauge;
  }

  createGaugeSVG(obj, metricName, metricValue) {
    const metricValueNumber = parseFloat(metricValue);

    const svg = document.createElementNS(this.cj_namespace, "svg");
    svg.setAttribute('xmlns', this.cj_namespace);
    svg.setAttribute('width', this.cj_circleRadius * 2);
    svg.setAttribute('height', this.cj_circleRadius * 2);
    svg.setAttribute('heiviewBoxght', '0 0 ' + this.cj_circleRadius * 2 + ' ' + this.cj_circleRadius * 2);

    const allLimits = Object.keys(obj.colors).reduce((result, color) => {
      return [...result, ...obj.colors[color]];
    }, []).sort((a, b) => a - b);

    const minValue = allLimits[0];
    const maxValue = allLimits[allLimits.length - 1];
    let angle = (metricValueNumber - minValue) * 270 / (maxValue - minValue);
    angle = isNaN(angle) ? 0 : angle;
    const grayColor = '#dedede';
    let metricColor = grayColor;

    for (let color in obj.colors) {
      if (metricValueNumber >= obj.colors[color][0] && metricValueNumber <= obj.colors[color][1]) {
        metricColor = color;
        break;
      }
    }

    const pathGray = this.createSector(-135, 135, grayColor);
    const pathColored = this.createSector(225, 225 + angle, metricColor);
    const circle = this.createCircle();
    const textV = this.createText(metricValue, {x: this.cj_circleRadius, y: this.cj_circleRadius, fontSize: '24px'});
    const textN = this.createText(metricName, {x: this.cj_circleRadius, y: this.cj_circleRadius + 20, fontSize: '9px'});
    const textMin = this.createText(minValue, {
      x: this.cj_circleRadius - this.cj_circleRadius / 2,
      y: this.cj_circleRadius * 2 - 9,
      fontSize: '9px',
      color: '#DEDEDE'
    });
    const textMax = this.createText(maxValue, {
      x: this.cj_circleRadius + this.cj_circleRadius / 2,
      y: this.cj_circleRadius * 2 - 9,
      fontSize: '9px',
      color: '#DEDEDE'
    });

    svg.appendChild(pathGray);
    svg.appendChild(pathColored);
    svg.appendChild(circle);
    svg.appendChild(textN);
    svg.appendChild(textV);
    svg.appendChild(textMin);
    svg.appendChild(textMax);
    return svg;
  }

  createCircle() {
    const circle = document.createElementNS(this.cj_namespace, "circle");
    circle.setAttribute("cx", this.cj_circleRadius);
    circle.setAttribute("cy", this.cj_circleRadius);
    circle.setAttribute("r", this.cj_circleRadius - this.cj_thickness);
    circle.setAttribute("fill", 'white');

    return circle;
  }

  createCardRow(metricName, metricValue) {
    const metricNameDiv = document.createElement('div');
    metricNameDiv.innerText = metricName;
    metricNameDiv.classList.add('cj-card__metric-name');

    const metricValueDiv = document.createElement('div');
    metricValueDiv.innerText = metricValue;
    metricValueDiv.classList.add('cj-card__metric-value');

    const cardRow = document.createElement('div');
    cardRow.classList.add('cj-card__card-row');
    cardRow.appendChild(metricNameDiv);
    cardRow.appendChild(metricValueDiv);

    return cardRow;
  }

  createText(content, {x, y, fontSize, color = '#6E6E6E'}) {
    const text = document.createElementNS(this.cj_namespace, "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("alignment-baseline", 'middle');
    text.setAttribute("text-anchor", 'middle');
    text.setAttribute("font-size", fontSize);
    text.setAttribute("font-weight", '300');
    text.setAttribute("color", color);
    text.textContent = content;

    return text;
  }

  createSector(start_angle, end_angle, color) {
    const path = document.createElementNS(this.cj_namespace, "path");
    path.setAttribute('fill', color);
    path.setAttribute('stroke', 'none');
    path.setAttribute('fill-rule', 'evenodd');
    path.setAttribute('d', this.getSectorDAttribute(start_angle, end_angle));

    return path;
  }

  getSectorDAttribute(start_angle, end_angle) {
    const opts = {
      cx: this.cj_circleRadius,
      cy: this.cj_circleRadius,
      radius: this.cj_circleRadius,
      thickness: this.cj_thickness,
      start_angle, end_angle
    };

    const start = this.polarToCartesian(opts.cx, opts.cy, opts.radius, opts.end_angle);
    const end = this.polarToCartesian(opts.cx, opts.cy, opts.radius, opts.start_angle);
    const largeArcFlag = opts.end_angle - opts.start_angle <= 180 ? "0" : "1";

    const cutout_radius = opts.radius - opts.thickness,
      start2 = this.polarToCartesian(opts.cx, opts.cy, cutout_radius, opts.end_angle),
      end2 = this.polarToCartesian(opts.cx, opts.cy, cutout_radius, opts.start_angle);

    return [
      "M", start.x, start.y,
      "A", opts.radius, opts.radius, 0, largeArcFlag, 0, end.x, end.y,
      "L", opts.cx, opts.cy,
      "Z",

      "M", start2.x, start2.y,
      "A", cutout_radius, cutout_radius, 0, largeArcFlag, 0, end2.x, end2.y,
      "L", opts.cx, opts.cy,
      "Z"
    ].join(" ");
  }

  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }
}











