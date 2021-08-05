/** @jsx h */
import { autocomplete, AutocompleteSource } from '@algolia/autocomplete-js';
import {
  groupBy,
  limit,
  balance,
  uniqBy,
} from '@algolia/autocomplete-preset-reshape';
import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions';
import { createLocalStorageRecentSearchesPlugin } from '@algolia/autocomplete-plugin-recent-searches';
import { h, Fragment } from 'preact';
import pipe from 'ramda/src/pipe';

import '@algolia/autocomplete-theme-classic';

import { createCategoriesPlugin } from './categoriesPlugin';
import { productsPlugin } from './productsPlugin';
import { searchClient } from './searchClient';
import { ProductHit } from './types';

const recentSearchesPlugin = createLocalStorageRecentSearchesPlugin({
  key: 'search',
  limit: 10,
});
const querySuggestionsPlugin = createQuerySuggestionsPlugin({
  searchClient,
  indexName: 'instant_search_demo_query_suggestions',
  getSearchParams() {
    return {
      hitsPerPage: 10,
    };
  },
});
const categoriesPlugin = createCategoriesPlugin({ searchClient });

autocomplete({
  container: '#autocomplete',
  placeholder: 'Search',
  debug: true,
  openOnFocus: true,
  plugins: [
    recentSearchesPlugin,
    querySuggestionsPlugin,
    categoriesPlugin,
    productsPlugin,
  ],
  reshape({ sources }) {
    const {
      recentSearchesPlugin,
      querySuggestionsPlugin,
      products,
      ...rest
    } = sources;

    const reshapeSuggestions = pipe(
      uniqBy(({ source, item }) =>
        source.sourceId === 'querySuggestionsPlugin' ? item.query : item.label
      ),
      limit(4)
    );
    const reshapeProducts = pipe(
      groupBy<ProductHit, AutocompleteSource<ProductHit>>(
        (hit) => hit.categories[0],
        {
          getSource({ title }) {
            return {
              templates: {
                header() {
                  return (
                    <Fragment>
                      <span className="aa-SourceHeaderTitle">{title}</span>
                      <div className="aa-SourceHeaderLine" />
                    </Fragment>
                  );
                },
              },
            };
          },
        }
      ),
      balance(2)
    );

    return [
      reshapeSuggestions([recentSearchesPlugin, querySuggestionsPlugin]),
      Object.values(rest),
      reshapeProducts([products]),
    ];
  },
});
