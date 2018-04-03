let takeDataFromTable = ({elementId, countId, sentimentId}) => {
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

const takeExceptionsFromSelect = ({elementId}) => {
  const select = document.getElementById(elementId).querySelector('select');

  const selectedOptions = Array.from(select.children).filter(item => item.selected);
  return selectedOptions.map(item => item.innerText);
};

export {takeDataFromTable, takeExceptionsFromSelect};
