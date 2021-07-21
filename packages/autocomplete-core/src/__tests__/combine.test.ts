import { createPlayground, runAllMicroTasks } from '../../../../test/utils';
import { limit } from '../combine';
import { createAutocomplete } from '../createAutocomplete';

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
            { label: 'iphone case' },
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
            { query: 'iphone' },
            { query: 'iphone case' },
            { query: 'iphone 10' },
            { query: 'iphone 11' },
            { query: 'iphone 12' },
          ];
        },
      },
    ];
  },
};

const productsPlugin = {
  getSources() {
    return [
      {
        sourceId: 'productsPlugin',
        getItems() {
          return [
            { label: 'MacBook' },
            { label: 'MacBook Air' },
            { label: 'MacBook Pro' },
            { label: 'iPhone' },
          ];
        },
      },
    ];
  },
};

describe('combine', () => {
  test('gets called with sources and state', async () => {
    const combine = jest.fn(({ sources }) => Object.values(sources));
    const { inputElement } = createPlayground(createAutocomplete, {
      openOnFocus: true,
      plugins: [recentSearchesPlugin, querySuggestionsPlugin],
      combine,
    });

    inputElement.focus();
    await runAllMicroTasks();

    expect(combine).toHaveBeenCalledTimes(1);
    expect(combine).toHaveBeenCalledWith({
      sources: {
        recentSearchesPlugin: expect.objectContaining({
          sourceId: 'recentSearchesPlugin',
        }),
        querySuggestionsPlugin: expect.objectContaining({
          sourceId: 'querySuggestionsPlugin',
        }),
      },
      state: expect.any(Object),
    });
  });

  describe('limit', () => {
    test('with even value limits the items', async () => {
      const onStateChange = jest.fn();
      const { inputElement } = createPlayground(createAutocomplete, {
        openOnFocus: true,
        onStateChange,
        plugins: [recentSearchesPlugin, querySuggestionsPlugin],
        combine({ sources }) {
          return limit(4, Object.values(sources));
        },
      });

      inputElement.focus();
      await runAllMicroTasks();

      expect(onStateChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          state: expect.objectContaining({
            collections: [
              expect.objectContaining({
                items: [
                  expect.objectContaining({ label: 'macbook' }),
                  expect.objectContaining({ label: 'macbook pro' }),
                ],
              }),
              expect.objectContaining({
                items: [
                  expect.objectContaining({ query: 'macbook' }),
                  expect.objectContaining({ query: 'macbook air' }),
                ],
              }),
            ],
          }),
        })
      );
    });

    test('with odd value limits the items', async () => {
      const onStateChange = jest.fn();
      const { inputElement } = createPlayground(createAutocomplete, {
        openOnFocus: true,
        onStateChange,
        plugins: [recentSearchesPlugin, querySuggestionsPlugin],
        combine({ sources }) {
          return limit(3, Object.values(sources));
        },
      });

      inputElement.focus();
      await runAllMicroTasks();

      expect(onStateChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          state: expect.objectContaining({
            collections: [
              expect.objectContaining({
                items: [
                  expect.objectContaining({ label: 'macbook' }),
                  expect.objectContaining({ label: 'macbook pro' }),
                ],
              }),
              expect.objectContaining({
                items: [expect.objectContaining({ query: 'macbook' })],
              }),
            ],
          }),
        })
      );
    });

    test('accepts all remaining items if limit value was not reached', async () => {
      const onStateChange = jest.fn();
      const { inputElement } = createPlayground(createAutocomplete, {
        openOnFocus: true,
        onStateChange,
        plugins: [recentSearchesPlugin, querySuggestionsPlugin],
        combine({ sources }) {
          return limit(11, Object.values(sources));
        },
      });

      inputElement.focus();
      await runAllMicroTasks();

      expect(onStateChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          state: expect.objectContaining({
            collections: [
              expect.objectContaining({
                items: [
                  expect.objectContaining({ label: 'macbook' }),
                  expect.objectContaining({ label: 'macbook pro' }),
                  expect.objectContaining({ label: 'iphone' }),
                  expect.objectContaining({ label: 'iphone case' }),
                ],
              }),
              expect.objectContaining({
                items: [
                  expect.objectContaining({ query: 'macbook' }),
                  expect.objectContaining({ query: 'macbook air' }),
                  expect.objectContaining({ query: 'macbook pro' }),
                  expect.objectContaining({ query: 'iphone' }),
                  expect.objectContaining({ query: 'iphone case' }),
                  expect.objectContaining({ query: 'iphone 10' }),
                  expect.objectContaining({ query: 'iphone 11' }),
                ],
              }),
            ],
          }),
        })
      );
    });

    test.skip('with odd number of sources limits the items', async () => {
      const onStateChange = jest.fn();
      const { inputElement } = createPlayground(createAutocomplete, {
        openOnFocus: true,
        onStateChange,
        plugins: [recentSearchesPlugin, querySuggestionsPlugin, productsPlugin],
        combine({ sources }) {
          return limit(4, Object.values(sources));
        },
      });

      inputElement.focus();
      await runAllMicroTasks();

      expect(onStateChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          state: expect.objectContaining({
            collections: [
              expect.objectContaining({
                items: [
                  expect.objectContaining({ label: 'macbook' }),
                  expect.objectContaining({ label: 'macbook pro' }),
                ],
              }),
              expect.objectContaining({
                items: [expect.objectContaining({ query: 'macbook' })],
              }),
              expect.objectContaining({
                items: [expect.objectContaining({ label: 'MacBook' })],
              }),
            ],
          }),
        })
      );
    });

    test('works with curried form', async () => {
      const onStateChange = jest.fn();
      const { inputElement } = createPlayground(createAutocomplete, {
        openOnFocus: true,
        onStateChange,
        plugins: [recentSearchesPlugin, querySuggestionsPlugin],
        combine({ sources }) {
          return limit(4)(Object.values(sources));
        },
      });

      inputElement.focus();
      await runAllMicroTasks();

      expect(onStateChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          state: expect.objectContaining({
            collections: [
              expect.objectContaining({
                items: [
                  expect.objectContaining({ label: 'macbook' }),
                  expect.objectContaining({ label: 'macbook pro' }),
                ],
              }),
              expect.objectContaining({
                items: [
                  expect.objectContaining({ query: 'macbook' }),
                  expect.objectContaining({ query: 'macbook air' }),
                ],
              }),
            ],
          }),
        })
      );
    });
  });
});
