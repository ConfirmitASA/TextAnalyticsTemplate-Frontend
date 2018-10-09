class FilterPanel {
  constructor() {
    const sideBar = document.querySelectorAll('.dashboard__sidebar')[0];
    const filterBtn = document.querySelectorAll('.dashboard__toolbar-filter .comd-button___studio')[0];
    const filterBtnChevron = filterBtn.querySelectorAll('.toolbar__icon--filter--chevron ')[0];
    const filterCloseBtn = document.querySelectorAll('.filter__header .comd-button___studio')[0];

    sideBar.addEventListener("animationend", chartResize);

    function chartResize() {
      window.dispatchEvent(new Event('resize'));
    }

    filterBtn.onclick = function() {
      if (filterBtn.classList.contains('toolbar__icon--filter--open')) {
        hideSideBar();
      }
      else {
        showSideBar();
      }
    };

    filterCloseBtn.onclick = function()  {
      hideSideBar();
    };

    function hideSideBar() {
      sideBar.classList.add('dashboard__sidebar--hide');
      sideBar.addEventListener("animationend", handlerHide);
      filterBtn.classList.remove('toolbar__icon--filter--open');
      filterBtn.classList.add('toolbar__icon--filter--closed');
      filterBtnChevron.style['display'] = 'none';
    }

    function showSideBar() {
      sideBar.removeEventListener("animationend", handlerHide);
      sideBar.classList.remove('dashboard__sidebar--hide');
      sideBar.style['display'] = 'block';
      filterBtn.classList.add('toolbar__icon--filter--open');
      filterBtn.classList.remove('toolbar__icon--filter--closed');
      filterBtnChevron.style['display'] = 'block';
    }

    function handlerHide() {
      sideBar.style['display'] = 'none';
    }
  }
}

export default FilterPanel;
