export default class InfoIcon {
  constructor({container, infoText}) {
    this.container = container;
    this.infoText = infoText;

    this.init();
  }

  init() {
    this.createIcon();
  }

  createIcon() {
    let infoIcon = document.createElement('div');
    infoIcon.className = 'ta-info-icon';

    let infoText = document.createElement('div');
    infoText.className = 'ta-info-text';
    infoText.innerHTML = this.infoText;
    infoText.style.display = "none";

    infoIcon.onmouseover = () => infoText.style.display = "";
    infoIcon.onmouseout = () => infoText.style.display = "none";

    this.container.appendChild(infoIcon);
    this.container.appendChild(infoText);

    this.infoIcon = infoIcon;
    this.infoText = infoText;
  }
}
