export default class SigTestingTable {
  constructor({tableContainerId, totalTableContainerId, distribution, significantTestScore}) {
    this.table = document.querySelector('#' + tableContainerId + " table");
    this.totalTable = document.querySelector('#' + totalTableContainerId + " table");
    this.tableForMovingHeaders = document.querySelector('#' + tableContainerId + " table:last-child");
    this.distribution = distribution;
    this.significantTestScore = parseFloat(significantTestScore);
    this.overallRowCells = [];
    this.rows = [];
    this.init();
  }

  init() {
    this.hideStdevColumn();
    if (!this.table.querySelector(".firstInBlock") || this.distribution === "1") {
      this.hideCountColumn();
    }
    if (this.table.querySelector(".firstInBlock")) {
      this.addNewColumnHeaders();
      this.addNewRowCells();
    }
  }

  hideStdevColumn() {
    const stdevHeader = this.table.querySelector("thead>tr>td:nth-child(4)");
    stdevHeader.style.display = 'none';
    const stdevMovingHeader = this.tableForMovingHeaders.querySelector("thead>tr>td:nth-child(4)");
    stdevMovingHeader.style.display = 'none';

    let tbodyRows = Array.prototype.slice.call(this.table.querySelectorAll("tbody tr"));
    tbodyRows.forEach(function (row) {
      let cells = row.querySelectorAll('td');
      let stdeColumnIndex = (row.classList.contains("firstInBlock") ? 4 : 3);
      cells[stdeColumnIndex].style.display = 'none';
    });
  }

  hideCountColumn() {
    const countHeader = this.table.querySelector("thead>tr>td:nth-child(5)");
    countHeader.style.display = 'none';
    const countMovingHeader = this.tableForMovingHeaders.querySelector("thead>tr>td:nth-child(5)");
    countMovingHeader.style.display = 'none';

    let tbodyRows = Array.prototype.slice.call(this.table.querySelectorAll("tbody tr"));
    tbodyRows.forEach(function (row) {
      let cells = row.querySelectorAll('td');
      let countColumnIndex = (row.classList.contains("firstInBlock") ? 5 : 4);
      cells[countColumnIndex].style.display = 'none';
    });
  }

  addNewColumnHeaders() {
    this.addOneNewColumnHeader("t5_chc", 3, "Average significance testing");
    this.addOneNewColumnHeader("t5_chc", 2, "Comments significance testing");
    this.addOneNewColumnHeader("t5_cc", 0);
  }

  addOneNewColumnHeader(className, childBeforeIndex, innerText) {
    const tables = [this.table, this.tableForMovingHeaders];
    tables.forEach(function(table) {
      let theadRow = table.querySelector("thead tr");
      if (!theadRow) {
        return;
      }
      let columnHeader = document.createElement("td");
      columnHeader.classList.add(className);
      columnHeader.innerText = innerText ? innerText : "";
      theadRow.insertBefore(columnHeader, theadRow.children[childBeforeIndex]);
    });
  }

  addNewRowCells() {
    this.addIndexCells();
    this.addSigTestCells();
  }

  addIndexCells() {
    let tbodyRows = Array.prototype.slice.call(this.table.querySelectorAll("tbody tr"));
    if (!tbodyRows || tbodyRows.length <= 0) {
      return;
    }
    let sigSubcategoryDropdown = document.querySelector("#sig-subcategory-dropdown select");
    let sigAttributeDropdown = document.querySelector("#sig-attribute-dropdown select");

    let themeIndex = 0;
    let subcategoryIndex = 0;
    let attributeIndex = 0;

    tbodyRows.forEach(function (row) {
      let newCell = document.createElement("td");
      newCell.classList.add("t5_rhc");

      if (row.classList.contains("level0")) {
        themeIndex++;
        subcategoryIndex = 0;
        attributeIndex = 0;
        let letter = (!sigSubcategoryDropdown || sigSubcategoryDropdown.options[0].selected) ? "t" : (!sigAttributeDropdown || sigAttributeDropdown.options[0].selected) ? "s" : "a";
        newCell.innerText = letter + themeIndex;
      }

      if (row.classList.contains("level1")) {
        subcategoryIndex++;
        attributeIndex = 0;
        var firstLetter = (!sigSubcategoryDropdown || sigSubcategoryDropdown.options[0].selected) ? "t" : (!sigAttributeDropdown || sigAttributeDropdown.options[0].selected) ? "s" : "a";
        var secondLetter = (!sigSubcategoryDropdown || sigSubcategoryDropdown.options[0].selected) ? "s" : "a";
        newCell.innerText = firstLetter + themeIndex + "_" + secondLetter + subcategoryIndex;
      }

      if (row.classList.contains("level2")) {
        attributeIndex++;
        newCell.innerText = "t" + themeIndex + "_" + "s" + subcategoryIndex + "_" + "a" + attributeIndex;
      }

      row.insertBefore(newCell, row.children[0]);
    });
  }

  addSigTestCells() {
    let childBeforeIndexForComments = 3;
    let childBeforeIndexForAverage = 4;

    let tbodyRows = Array.prototype.slice.call(this.table.querySelectorAll("tbody tr"));
    if (!tbodyRows || tbodyRows.length <= 0) {
      return;
    }

    for (let i = 0; i < tbodyRows.length; i++) {
      let row = tbodyRows[i];
      const firstInBlockShift = row.classList.contains("firstInBlock") ? 1 : 0;

      let avgNewCell = document.createElement("td");
      avgNewCell.classList.add("t5_rhc");
      avgNewCell.classList.add("sig_test_avg");
      row.insertBefore(avgNewCell, row.children[childBeforeIndexForAverage + firstInBlockShift]);

      let commentsNewCell = document.createElement("td");
      commentsNewCell.classList.add("t5_rhc");
      commentsNewCell.classList.add("sig_test_comments");
      row.insertBefore(commentsNewCell, row.children[childBeforeIndexForComments + firstInBlockShift]);
    }

    var currentBlockIndex = -1;
    for (let i = 0; i < tbodyRows.length; i++) {
      let row = tbodyRows[i];
      if (row.classList.contains("firstInBlock")) {
        currentBlockIndex++;
      }
      this.rowFormatting(row, tbodyRows, i, rowheaders.length / blocks.length, currentBlockIndex);
    }
  }

  rowFormatting(row, rows, currentRowIndex, rowShift, currentBlockIndex) {
    const firstInBlockShift = row.classList.contains("firstInBlock") ? 1 : 0;
    let cells = row.querySelectorAll('td');
    let totalRows = this.totalTable.querySelectorAll("tbody tr");
    let currentBlockTotalCells = totalRows[currentBlockIndex].querySelectorAll("td");
    let currentCount, currentAvg, currentStdev, currentTotal, nextCount, nextAvg, nextStdev, nextTotal;

    currentCount = parseFloat(cells[(this.distribution !== "1" ? 2 : 7) + firstInBlockShift].innerText.replace(',', ''));
    currentAvg = parseFloat(cells[4 + firstInBlockShift].innerText.replace(',', ''));
    currentStdev = parseFloat(cells[6 + firstInBlockShift].innerText.replace(',', ''));
    currentTotal = parseFloat(currentBlockTotalCells[2].innerText.replace(',', ''));

    let blockIndex = currentBlockIndex+1;
    for(let i = currentRowIndex + rowShift; i < rows.length; i+=rowShift) {
      let nextRow = rows[i];
      let nextRowCells = nextRow.querySelectorAll('td');
      let nextBlockTotalCells = totalRows[blockIndex].querySelectorAll("td");
      nextCount = parseFloat(nextRowCells[(this.distribution !== "1" ? 2 : 7) + firstInBlockShift].innerText.replace(',', ''));
      nextAvg = parseFloat(nextRowCells[4 + firstInBlockShift].innerText.replace(',', ''));
      nextStdev = parseFloat(nextRowCells[6 + firstInBlockShift].innerText.replace(',', ''));
      nextTotal = parseFloat(nextBlockTotalCells[2].innerText.replace(',', ''));

      let sigTestVolume = this.sigTestingVolume(nextCount, currentCount, nextTotal, currentTotal);
      let sigTestSentiment = this.sigTestingSentiment(nextCount, currentCount, nextAvg, currentAvg, nextStdev, currentStdev);

      if (sigTestVolume){
        cells[3 + firstInBlockShift].innerText += (cells[3 + firstInBlockShift].innerText ? ", " : "") + nextRowCells[0].innerText;
        nextRowCells[3 + firstInBlockShift].innerText += (nextRowCells[3 + firstInBlockShift].innerText ? ", " : "") + cells[0].innerText;
      }
      if (sigTestSentiment){
        cells[5 + firstInBlockShift].innerText += (cells[5 + firstInBlockShift].innerText ? ", " : "") + nextRowCells[0].innerText;
        nextRowCells[5 + firstInBlockShift].innerText += (nextRowCells[5 + firstInBlockShift].innerText ? ", " : "") + cells[0].innerText;
      }

      blockIndex++;
    }
  }

  sigTestingSentiment (curCount, prevCount, curAvg , prevAvg , curStdev, prevStdev){
    if (curCount >= 10 && prevCount >=10)  {
      let result = (curAvg -  prevAvg ) /
        Math.sqrt(
          (1/prevCount + 1/curCount) *
          ((prevCount - 1)*Math.pow(prevStdev, 2) + (curCount - 1)*Math.pow(curStdev, 2)) /
          (prevCount + curCount - 2)
        );
      if (result < -this.significantTestScore || result > this.significantTestScore)
        return true;
    }
    return false;
  }

  sigTestingVolume(curCount, prevCount, curTotal, prevTotal){
    if (curCount >= 5 && prevCount >=5)  {
      let result = (curCount / curTotal  - prevCount / prevTotal ) /
        Math.sqrt(
          ( prevCount  + curCount )/( prevTotal + curTotal )*
          (1 - ( prevCount + curCount )/(prevTotal + curTotal ))*
          (1/curTotal + 1/prevTotal )
        );
      if (result < -this.significantTestScore || result > this.significantTestScore)
        return true;
    }
    return false;
  }
}
