export default class ThemeDistributionTable {
  constructor({tableContainerId, toggleStatus, significantTestScore}) {
    this.table = document.querySelector('#' + tableContainerId + " table tbody");
    this.sigTestType = toggleStatus;
    this.significantTestScore = parseFloat(significantTestScore);
    this.overallRowCells = [];
    this.rows = [];
    this.init();
  }

  init() {
    this.hideOverallSentiment();
    this.rows = [...this.table.querySelectorAll('tr')];
    this.rows.forEach((row,index) => {
        if (index === 0)
          this.overallRowCells = row.querySelectorAll('td');
        else {
          this.rowFormatting(row);
        }
    });
    let tableContainer = document.querySelector('#alerts-container ~ article.dashboard__widget');
    if (tableContainer) {
      tableContainer.classList.add('page-break');
      console.log("pdf export test");
    }
  }

  hideOverallSentiment() {
    const overallSentimentRow = this.table.querySelector("tbody>tr:first-child");
    overallSentimentRow.style.display = 'none';
  }

  rowFormatting(row) {
    let cells = row.querySelectorAll('td');
    let currentCount , currentAvg, currentStdev, currentTotal, previousCount , previousAvg, previousStdev, previousTotal;
    let sentimentStyle;
    for(let i = 1; i < cells.length; i += 4){
      currentCount = parseFloat(cells[i].innerText.replace(',', ''));
      currentAvg = parseFloat(cells[i+1].innerText.replace(',', ''));
      currentStdev = parseFloat(cells[i+3].innerText.replace(',', ''));
      currentTotal = parseFloat(this.overallRowCells[i].innerText.replace(',', ''));
      sentimentStyle = this.sentimentFormatting(currentAvg, i);

      for (let j = 0; sentimentStyle && j < 4; j++)
        if (sentimentStyle) cells[i + j].classList.add(sentimentStyle);

      if (i > 4){
        previousCount = parseFloat(cells[i-4].innerText.replace(',', ''));
        previousAvg = parseFloat(cells[i-3].innerText.replace(',', ''));
        previousStdev = parseFloat(cells[i-1].innerText.replace(',', ''));
        previousTotal = parseFloat(this.overallRowCells[i-4].innerText.replace(',', ''));
        let sigTestVolume = this.sigTestingVolume(currentCount, previousCount, currentTotal, previousTotal);
        let sigTestSentiment = this.sigTestingSentiment(currentCount, previousCount, currentAvg , previousAvg , currentStdev, previousStdev);
        if (sigTestVolume){
          cells[i].classList.add(sigTestVolume);
          cells[i].classList.add(sigTestVolume + "C");
          cells[i+2].classList.add(sigTestVolume);
        }
        if (sigTestSentiment){
          cells[i+1].classList.add(sigTestSentiment);
          cells[i+1].classList.add(sigTestSentiment + "S");
        }
      }

      switch (this.sigTestType) {
        case "0" :
          cells[i+1].style.display = "none";
          cells[i+2].style.display = "none";
          cells[i+3].style.display = "none";
          break;
        case "1" :
          cells[i].style.display = "none";
          cells[i+2].style.display = "none";
          cells[i+3].style.display = "none";
          break;
        case "2" :
          cells[i].style.display = "none";
          cells[i+1].style.display = "none";
          cells[i+3].style.display = "none";
          break;
      }
    }
  }

  sentimentFormatting(sentimentValue){
    let style;
    if (sentimentValue < sentimentConfig[1].range.min) style = 'cf_negative';
    else if ( sentimentValue  > sentimentConfig[1].range.max) style = 'cf_positive';
    else if (!isNaN(sentimentValue)) style = 'cf_neutral';
    return style;
  }


  sigTestingSentiment (curCount, prevCount, curAvg , prevAvg , curStdev, prevStdev){
    if (curCount >= 10 && prevCount >=10)  {
      let result = (curAvg -  prevAvg ) /
        Math.sqrt(
          (1/prevCount + 1/curCount) *
          ((prevCount - 1)*Math.pow(prevStdev, 2) + (curCount - 1)*Math.pow(curStdev, 2)) /
          (prevCount + curCount - 2)
        );
      if (result < -this.significantTestScore)
        return 'decreasing';
      else if (result > this.significantTestScore)
        return 'increasing';
    }
    return;
  }

  sigTestingVolume(curCount, prevCount, curTotal, prevTotal){
    if (curCount >= 5 && prevCount >=5)  {
      let result = (curCount / curTotal  - prevCount / prevTotal ) /
        Math.sqrt(
          ( prevCount  + curCount )/( prevTotal + curTotal )*
          (1 - ( prevCount + curCount )/(prevTotal + curTotal ))*
          (1/curTotal + 1/prevTotal )
        );

      if (result < -this.significantTestScore)
        return 'decreasing';
      else if (result > this.significantTestScore)
        return 'increasing';
    }
    return;
  }
}
