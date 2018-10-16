import cloud from 'd3-cloud';
import * as d3 from 'd3';

const fontSize = {
  min: 13,
  max: 40
};

class WordCloud {
  constructor({elementFromId, elementToId, exceptionsFromId, countId, sentimentId, clickFunc, colorConfig, translations}) {
    this.data = this.takeDataFromTable({
      elementId: elementFromId,
      countId,
      sentimentId
    });
    this.elementFromId = elementFromId;
    this.elementToId = elementToId;
    this.exceptionsFromId = exceptionsFromId;
    this.countId = countId;
    this.sentimentId = sentimentId;
    this.clickFunc = clickFunc;
    this.colorConfig = colorConfig;

    this.takeDataFromTable = this.takeDataFromTable.bind(this);
    this.takeExceptionsFromSelect = this.takeExceptionsFromSelect.bind(this);
    this.setupWordCloud = this.setupWordCloud.bind(this);

    if (this.data.length > 0) {
      this.setupWordCloud();
    } else {
      const container = document.getElementById(elementToId);
      container.innerHTML = `<label class="no-data-label">${translations['No data to display']}</label>`;
      container.style.height = '';
      container.style.marginBottom = '16px';
      container.style.marginLeft = '8px';
      container.style.marginTop = '16px';
      container.style.height = 'inherit';
    }
  }

  takeDataFromTable({elementId, countId, sentimentId}) {
    let data = [];

    let maxCount = -1;

    let element = document.querySelector(`#${elementId} table`);
    let tableBody = element.children[1];

    for (let i = 0; i < tableBody.children.length; i++) {
      let row = tableBody.children[i]; //row = tr
      let element = {};

      element.text = row.children[0].innerText;

      element.count = parseInt(row.children[countId].innerText);
      if (sentimentId !== undefined) {
        element.sentiment = parseFloat(row.children[sentimentId].innerText);
      }

      //if row doesn't have any data
      if (isNaN(element.count) || sentimentId !== undefined && isNaN(element.sentiment) || element.count === 0) {
        continue;
      }

      if (maxCount < element.count) {
        maxCount = element.count;
      }

      data.push(element);
    }

    data.forEach(element => {
      element.ratio = element.count / maxCount;
      element.text = element.text[0].toUpperCase() + element.text.slice(1).toLowerCase();
    });

    return data;
  };

  takeExceptionsFromSelect({elementId}) {
    const select = document.querySelector(`#${elementId} > select`);

    if(!select) {
      return [];
    }

    const selectedOptions = Array.from(select.children).filter(item => item.selected);
    return selectedOptions.map(item => item.innerText);
  };

  setupWordCloud() {
    let exceptions = this.takeExceptionsFromSelect({
      elementId: this.exceptionsFromId
    });
    this.data = this.data.filter(item => exceptions.indexOf(item.text.toUpperCase()) < 0);
    const {
      elementFromId,
      elementToId,
      exceptionsFromId,
      countId,
      sentimentId,
      clickFunc,
      colorConfig,
      data,
      takeDataFromTable,
      takeExceptionsFromSelect
    } = this;

    let fill = d3.scaleOrdinal(d3.schemeCategory10);
    let size = d3.scaleLinear()
      .domain([0, 1])
      .range([fontSize.min, fontSize.max]);

    let update = ({ratio}) => {
      layout.size([cloudContainer.clientWidth, cloudContainer.clientHeight]);
      layout.stop().words(data).start();
    };

    let restart = () => {
      let newData = takeDataFromTable({
        elementId: elementFromId,
        countId,
        sentimentId
      });

      let newExceptions = takeExceptionsFromSelect({
        elementId: exceptionsFromId
      });
      this.data = newData.filter(item => newExceptions.indexOf(item.text.toUpperCase()) < 0);
      const data = this.data;

      layout.stop().words([]).start();
      layout.stop().words(data).start();

      let tags = Array.from(document.getElementsByClassName('tag'));
      tags.forEach(element => {
        element.onclick = clickFunc;
      });
    };

    let end = (words) => {
      svg.attr('width', layout.size()[0]).attr('height', layout.size()[1]);

      g.attr('transform', 'translate(' + layout.size()[0] / 2 + ',' + layout.size()[1] / 2 + ')');

      let text = g.selectAll('text')
        .data(words);

      text.transition()
        .duration(1000)
        .attr('transform', d => 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')')
        .style('font-size', d => d.size + 'px');

      text.enter().append('text')
        .attr('class', 'tag')
        .attr('text-anchor', 'middle')
        .style('font-size', d => d.size + 'px')
        .attr('transform', d => 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')')
        .style('font-size', d => d.size + 'px')
        .style("opacity", 1e-6)
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .style('fill', d => {
          if (colorConfig !== undefined && d.sentiment !== undefined) {
            let index = -1;
            for (let i = 0; i < colorConfig.limiters.length; ++i) {
              if (i < colorConfig.limiters.length - 1 && d.sentiment >= colorConfig.limiters[i] && d.sentiment <= colorConfig.limiters[i + 1]) {
                index = i;
                break;
              }
            }
            return colorConfig.colors[index];
          } else {
            return fill(d.ratio);
          }
        })
        .text(d => d.text);

      text.exit().remove();
    };

    let oldHeight = window.innerHeight;
    let oldWidth = window.innerWidth;
    window.onresize = () => {
      if (oldHeight !== window.innerHeight && oldWidth === window.innerWidth) {
        oldHeight = window.innerHeight;
      } else {
        update({ratio: window.innerWidth / oldWidth});
      }
      oldWidth = window.innerWidth;
    };

    const cloudContainer = document.getElementById(elementToId);

    let layout = cloud().size([cloudContainer.clientWidth, cloudContainer.clientHeight])
      .words(data)
      .fontSize(d => size(d.ratio))
      .padding(5)
      .rotate(0)
      .font('Impact')
      .text(d => d.text)
      .on('end', end);

    let svg = d3.select(`#${elementToId}`).append('svg')
      .attr('width', layout.size()[0])
      .attr('height', layout.size()[1]);

    let g = svg.append('g')
      .attr('transform', 'translate(' + layout.size()[0] / 2 + ',' + layout.size()[1] / 2 + ')');

    layout.start();

    let tags = Array.from(document.getElementsByClassName('tag'));
    tags.forEach(element => {
      element.onclick = clickFunc;
    });

    return {restart};
  }
}

export default WordCloud;
