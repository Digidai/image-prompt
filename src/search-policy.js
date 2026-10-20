export const SEARCH_ORIGIN = 'https://prompt.genedai.me';
export const SEARCH_POLICY = 'listing-landings-v1';
export const SEARCH_URL_BUDGET = 52;

// Only first-page collection entrances are promoted. Browsable routes are a
// separate registry and must never be used as a search submission queue.
export function searchSubmissionUrls(categories) {
  const ids = categories.map(category => category.id).sort();
  if (new Set(ids).size !== ids.length || ids.some(id => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))) {
    throw new Error('Invalid search category allowlist');
  }
  const paths = ['/', '/prompts/', '/categories/', ...ids.map(id => `/categories/${id}/`)];
  const urls = ['', '/en'].flatMap(locale => paths.map(path => SEARCH_ORIGIN + locale + path));
  if (urls.length > SEARCH_URL_BUDGET) throw new Error('Search URL budget exceeded; review the submission policy before expanding it');
  return urls;
}

export function assertSearchSubmissionUrls(urls, categories) {
  const expected = searchSubmissionUrls(categories);
  const allowed = new Set(expected);
  if (!Array.isArray(urls) || urls.length !== expected.length || new Set(urls).size !== urls.length || urls.some(url => !allowed.has(url))) {
    throw new Error('Search submission list must contain exactly the approved collection entrances; details, pagination, filters and other URLs are excluded');
  }
  return urls;
}
