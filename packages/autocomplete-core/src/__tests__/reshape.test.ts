import { createPlayground, runAllMicroTasks } from '../../../../test/utils';
import { createAutocomplete } from '../createAutocomplete';
import { AutocompleteReshapeFunction } from '../types';

const recentSearchesPlugin = {
  getSources() {
    return [
      {
        sourceId: 'recentSearchesPlugin',
        getItems() {
          return [
            { label: 'macbook' },
            { label: 'macbook pro' },
            { label: 'iphone' },
          ];
        },
      },
    ];
  },
};

const querySuggestionsPlugin = {
  getSources() {
    return [
      {
        sourceId: 'querySuggestionsPlugin',
        getItems() {
          return [
            { query: 'macbook' },
            { query: 'macbook air' },
            { query: 'macbook pro' },
          ];
        },
      },
    ];
  },
};

const customLimit: AutocompleteReshapeFunction<number> = (value) => {
  return function runCustomLimit(...sources) {
    return sources.map((source) => {
      const items = source.getItems();

      return {
        ...source,
        getItems() {
          return items.slice(0, value);
        },
      };
    });
  };
};

const limitToOnePerSource = customLimit(1);

describe('reshape', () => {
  test('gets called with sources and state', async () => {
    const reshape = jest.fn(({ sources }) => sources);
    const { inputElement } = createPlayground(createAutocomplete, {
      openOnFocus: true,
      plugins: [recentSearchesPlugin, querySuggestionsPlugin],
      reshape,
    });

    inputElement.focus();
    await runAllMicroTasks();

    expect(reshape).toHaveBeenCalledTimes(1);
    expect(reshape).toHaveBeenCalledWith({
      sourcesBySourceId: {
        recentSearchesPlugin: expect.objectContaining({
          sourceId: 'recentSearchesPlugin',
        }),
        querySuggestionsPlugin: expect.objectContaining({
          sourceId: 'querySuggestionsPlugin',
        }),
      },
      sources: expect.arrayContaining([
        expect.objectContaining({ sourceId: 'recentSearchesPlugin' }),
        expect.objectContaining({ sourceId: 'querySuggestionsPlugin' }),
      ]),
      state: expect.any(Object),
    });
  });

  test('supports a reshape function', async () => {
    const onStateChange = jest.fn();
    const reshape = jest.fn(({ sources }) => limitToOnePerSource(...sources));
    const { inputElement } = createPlayground(createAutocomplete, {
      openOnFocus: true,
      onStateChange,
      plugins: [recentSearchesPlugin, querySuggestionsPlugin],
      reshape,
    });

    inputElement.focus();
    await runAllMicroTasks();

    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        state: expect.objectContaining({
          collections: [
            expect.objectContaining({
              items: [{ __autocomplete_id: 0, label: 'macbook' }],
            }),
            expect.objectContaining({
              items: [{ __autocomplete_id: 1, query: 'macbook' }],
            }),
          ],
        }),
      })
    );
  });

  test('supports an array of reshape functions', async () => {
    const onStateChange = jest.fn();
    const reshape = jest.fn(({ sources }) => [limitToOnePerSource(...sources)]);
    const { inputElement } = createPlayground(createAutocomplete, {
      openOnFocus: true,
      onStateChange,
      plugins: [recentSearchesPlugin, querySuggestionsPlugin],
      reshape,
    });

    inputElement.focus();
    await runAllMicroTasks();

    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        state: expect.objectContaining({
          collections: [
            expect.objectContaining({
              items: [{ __autocomplete_id: 0, label: 'macbook' }],
            }),
            expect.objectContaining({
              items: [{ __autocomplete_id: 1, query: 'macbook' }],
            }),
          ],
        }),
      })
    );
  });
});
