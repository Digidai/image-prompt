const button = document.querySelector('[data-copy-prompt]');
button?.addEventListener('click', async () => {
  const text = document.getElementById('full-prompt').textContent;
  try { await navigator.clipboard.writeText(text); button.textContent='已复制'; }
  catch { const range=document.createRange();range.selectNodeContents(document.getElementById('full-prompt'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);button.textContent='已选中，请复制'; }
  setTimeout(()=>button.textContent='复制 Prompt',2000);
});
