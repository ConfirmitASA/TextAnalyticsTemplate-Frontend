import cloud from 'd3-cloud';
import * as d3 from 'd3';
import {takeDataFromTable, takeExceptionsFromSelect} from './data';

const fontSize = {
    min: 13,
    max: 40
};


class WordCloud {
  constructor({elementFromId, elementToId, exceptionsFromId, countId, sentimentId, clickFunc, colorConfig}) {
    let data = takeDataFromTable({
      elementId: elementFromId,
      countId,
      sentimentId
    });

    let exceptions = takeExceptionsFromSelect({
      elementId: exceptionsFromId
    });
    data = data.filter(item => exceptions.indexOf(item.text.toUpperCase()) < 0);

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
      data = newData.filter(item => newExceptions.indexOf(item.text.toUpperCase()) < 0);

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
            let index = colorConfig.limiters.findIndex((limiter, index, limiters) => {
              return index < limiters.length - 1 && d.sentiment >= limiter && d.sentiment <= limiters[index + 1];
            });
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
