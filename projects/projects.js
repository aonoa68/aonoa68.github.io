(() => {
  const cards = [...document.querySelectorAll('.project')];
  const groups = [...document.querySelectorAll('.research-group')];
  const buttons = [...document.querySelectorAll('[data-category]')];
  const status = document.querySelector('#status-filter');
  const search = document.querySelector('#project-search');
  let category = 'all';
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase().trim();
  function applyFilters() {
    const query = normalize(search.value);
    let count = 0;
    cards.forEach(card => {
      const show = (category === 'all' || card.dataset.cat === category)
        && (status.value === 'all' || card.dataset.status === status.value)
        && (!query || normalize(card.textContent + ' ' + card.closest('.research-group').querySelector('.group-heading').textContent).includes(query));
      card.hidden = !show;
      if (show) count++;
    });
    groups.forEach(group => { group.hidden = ![...group.querySelectorAll('.project')].some(card => !card.hidden); });
    document.querySelector('#result-count').textContent = `${count} / ${cards.length} 件`;
    document.querySelector('#no-results').hidden = count !== 0;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
  }
  buttons.forEach(button => button.addEventListener('click', () => { category = button.dataset.category; applyFilters(); }));
  status.addEventListener('change', applyFilters);
  search.addEventListener('input', applyFilters);
  document.querySelector('#reset-filters').addEventListener('click', () => { category = 'all'; status.value = 'all'; search.value = ''; applyFilters(); search.focus(); });
  document.querySelector('#controls').hidden = false;
  applyFilters();
})();
