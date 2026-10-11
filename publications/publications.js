(() => {
  const cards = [...document.querySelectorAll('.pub-card')];
  const buttons = [...document.querySelectorAll('.filter-tab')];
  const year = document.getElementById('year-filter');
  const search = document.getElementById('search-input');
  const english = document.documentElement.lang === 'en';
  let category = 'all';
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase().trim();
  function applyFilters() {
    const query = normalize(search.value);
    let count = 0;
    cards.forEach(card => {
      const y = Number(card.dataset.year);
      const categoryMatch = category === 'all' || (category === 'selected' ? card.dataset.selected === 'true' : card.dataset.cat === category);
      const yearMatch = year.value === 'all' || (year.value === '2020s' ? y >= 2020 && y < 2030 : y >= 2010 && y < 2020);
      card.hidden = !(categoryMatch && yearMatch && (!query || normalize((card.dataset.search || '') + ' ' + card.textContent).includes(query)));
      if (!card.hidden) count++;
    });
    document.getElementById('result-count').textContent = english ? `${count} / ${cards.length} publications` : `${count} / ${cards.length} 件を表示`;
    document.getElementById('no-results').hidden = count !== 0;
    document.getElementById('label-selected').textContent = category === 'selected' ? (english ? 'Selected publications' : '代表業績') : (english ? 'Publication index' : '業績一覧');
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  }
  buttons.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; applyFilters(); }));
  year.addEventListener('change', applyFilters);
  search.addEventListener('input', applyFilters);
  document.getElementById('reset-filters').addEventListener('click', () => { category = 'all'; year.value = 'all'; search.value = ''; applyFilters(); search.focus(); });
  document.querySelector('.filter-bar').hidden = false;
  applyFilters();
})();
