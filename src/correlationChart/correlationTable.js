export default class CorrelationTable {
  constructor({container, table, palette, translations}) {
    this.container = container;
    this.table = table;
    this.palette = palette;
    this.translations = translations;
    this.areas = [
      {
        id: "issues",
        text: translations["Priority Issues"],
        rows: []
      },
      {
        id: "strength",
        text: translations["Strength"],
        rows: []
      },
      {
        id: "monitor",
        text: translations["Monitor and Improve"],
        rows: []
      },
      {
        id: "maintain",
        text: translations["Maintain"],
        rows: []
      }
    ];
    this.monitor = [];
    this.strength = [];
    this.init();
  }

  createRow(row, index) {
    const tr = document.createElement('tr');

    const order = document.createElement('td');
    order.innerText = index;

    const categoryCell = document.createElement('td');
    const categoryContainer = row.firstElementChild;
    if (categoryContainer.firstElementChild && categoryContainer.firstElementChild.tagName.toLowerCase() === 'a') {
      const categoryName = categoryContainer.firstElementChild.cloneNode(true);
      categoryCell.appendChild(categoryName);
    } else {
      categoryCell.innerText = categoryContainer.innerText;
    }

    const counts = document.createElement('td');
    const countsDiv = document.createElement('div');
    const countsValue = row.children[row.children.length - 2].innerText;
    countsDiv.innerText = countsValue;
    counts.appendChild(countsDiv);

    tr.appendChild(order);
    tr.appendChild(categoryCell);
    tr.appendChild(counts);

    return tr
  }

  init() {
    const rows = [...this.table.querySelectorAll("tbody>tr")];

    if (rows.length > 0) {
      let isAnythingShown = false;
      this.areas.forEach((area, index) => {
        area.rows = rows.filter((row, index) => (index > 0 && row.children[1].classList.contains(`cf_${area.id}`)));
        area.rows.forEach((row, index) => document.getElementById(area.id).children[0].appendChild(this.createRow(row, index + 1)));
        if (area.rows.length === 0) {
          document.querySelector(`.correlation-header--${area.id}`).classList.add("hidden");
        } else {
          isAnythingShown = true;
        }
      });

      if (!isAnythingShown) {
        const container = document.getElementById(this.container);
        container.innerHTML = '<label class="no-data-label">No data to display</label>';
        container.style.marginBottom = '16px';
        container.style.marginLeft = '8px';
      }
    } else {
      const container = document.getElementById(this.container);
      container.innerHTML = '<label class="no-data-label">No data to display</label>';
      container.style.marginBottom = '16px';
      container.style.marginLeft = '8px';
    }
  }
}
