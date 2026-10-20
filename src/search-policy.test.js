import test from 'node:test';
import assert from 'node:assert/strict';
import meta from './catalog-meta.json' with {type:'json'};
import {SEARCH_ORIGIN, searchSubmissionUrls, assertSearchSubmissionUrls} from './search-policy.js';

test('search promotion contains only 26 collection entrances in each interface language', () => {
  const urls = searchSubmissionUrls(meta.categories);
  assert.equal(urls.length, 52);
  for (const prefix of ['', '/en']) {
    for (const path of ['/', '/prompts/', '/categories/', '/categories/product/', '/categories/opennana/']) {
      assert(urls.includes(SEARCH_ORIGIN + prefix + path));
    }
    assert.equal(urls.filter(url => new URL(url).pathname.startsWith(prefix + '/categories/') && url !== SEARCH_ORIGIN + prefix + '/categories/').length, 23);
  }
  assert.doesNotThrow(() => assertSearchSubmissionUrls([...urls].reverse(), meta.categories));
});

test('submission guard rejects detail pages, pagination, utility pages and altered origins', () => {
  const urls = searchSubmissionUrls(meta.categories);
  const excluded = [
    '/prompts/gpt4o-097/', '/en/prompts/opennana-123/',
    '/prompts/page/2/', '/en/categories/opennana/page/2/',
    '/guide/', '/sources/', '/about/', '/agents/', '/en/agents/',
    '/api/v1/prompts', '/data/catalog.json', '/prompts/?q=glass', '/#catalog',
    '/categories/unknown/', '/categories/product/index.html'
  ].map(path => SEARCH_ORIGIN + path);
  excluded.push('http://prompt.genedai.me/', 'https://example.com/', 'https://prompt.genedai.me.evil.example/', 'https://user@prompt.genedai.me/');
  for (const url of excluded) {
    assert.throws(() => assertSearchSubmissionUrls([url, ...urls.slice(1)], meta.categories), /approved collection entrances/, url);
    assert.throws(() => assertSearchSubmissionUrls([...urls, url], meta.categories), /approved collection entrances/, url);
  }
  assert.throws(() => assertSearchSubmissionUrls([], meta.categories));
  assert.throws(() => assertSearchSubmissionUrls([urls[1], ...urls.slice(1)], meta.categories));
});

test('category changes cannot silently expand the search budget or inject routes', () => {
  assert.throws(() => searchSubmissionUrls([...meta.categories, {id:'extra'}]), /budget exceeded/);
  assert.throws(() => searchSubmissionUrls([{id:'product'}, {id:'product'}]), /category allowlist/);
  assert.throws(() => searchSubmissionUrls([{id:'product/page/2'}]), /category allowlist/);
});
