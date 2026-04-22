function sendGetMulti(btn, endpoint, keys) {
  const card = btn.closest('.ep-body');
  const inputs = card.querySelectorAll('.try-input');

  let params = [];

  inputs.forEach(input => {
    const key = input.dataset.key;
    const value = input.value.trim();
    if (value) params.push(`${key}=${encodeURIComponent(value)}`);
  });

  const url = endpoint + '?' + params.join('&');

  fetch(url)
    .then(res => res.json())
    .then(data => showResponse(btn, 200, data))
    .catch(err => showResponse(btn, 500, { error: err.message }));
}
