import { createAutocomplete } from '@algolia/autocomplete-core';

import { createPlayground, runAllMicroTasks } from '../../../../test/utils';
import { limit } from '../limit';

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

const limitToFour = limit(4);

describe('limit', () => {
  test('with even value limits the items', async () => {
    const onStateChange = jest.fn();
    const { inputElement } = createPlayground(createAutocomplete, {
      openOnFocus: true,
      onStateChange,
      plugins: [recentSearchesPlugin, querySuggestionsPlugin],
      reshape({ sources }) {
        return limitToFour(sources);
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

// describe('limit', () => {
//   test('with even value limits the items', async () => {
//     const onStateChange = jest.fn();
//     const { inputElement } = createPlayground(createAutocomplete, {
//       openOnFocus: true,
//       onStateChange,
//       plugins: [recentSearchesPlugin, querySuggestionsPlugin],
//       reshape({ sources }) {
//         return limit(4, sources);
//       },
//     });

//     inputElement.focus();
//     await runAllMicroTasks();

//     expect(onStateChange).toHaveBeenLastCalledWith(
//       expect.objectContaining({
//         state: expect.objectContaining({
//           collections: [
//             expect.objectContaining({
//               items: [
//                 expect.objectContaining({ label: 'macbook' }),
//                 expect.objectContaining({ label: 'macbook pro' }),
//               ],
//             }),
//             expect.objectContaining({
//               items: [
//                 expect.objectContaining({ query: 'macbook' }),
//                 expect.objectContaining({ query: 'macbook air' }),
//               ],
//             }),
//           ],
//         }),
//       })
//     );
//   });

//   test('with odd value limits the items', async () => {
//     const onStateChange = jest.fn();
//     const { inputElement } = createPlayground(createAutocomplete, {
//       openOnFocus: true,
//       onStateChange,
//       plugins: [recentSearchesPlugin, querySuggestionsPlugin],
//       reshape({ sources }) {
//         return limit(3, sources);
//       },
//     });

//     inputElement.focus();
//     await runAllMicroTasks();

//     expect(onStateChange).toHaveBeenLastCalledWith(
//       expect.objectContaining({
//         state: expect.objectContaining({
//           collections: [
//             expect.objectContaining({
//               items: [
//                 expect.objectContaining({ label: 'macbook' }),
//                 expect.objectContaining({ label: 'macbook pro' }),
//               ],
//             }),
//             expect.objectContaining({
//               items: [expect.objectContaining({ query: 'macbook' })],
//             }),
//           ],
//         }),
//       })
//     );
//   });

//   test('accepts all remaining items if limit value was not reached', async () => {
//     const onStateChange = jest.fn();
//     const { inputElement } = createPlayground(createAutocomplete, {
//       openOnFocus: true,
//       onStateChange,
//       plugins: [recentSearchesPlugin, querySuggestionsPlugin],
//       reshape({ sources }) {
//         return limit(11, sources);
//       },
//     });

//     inputElement.focus();
//     await runAllMicroTasks();

//     expect(onStateChange).toHaveBeenLastCalledWith(
//       expect.objectContaining({
//         state: expect.objectContaining({
//           collections: [
//             expect.objectContaining({
//               items: [
//                 expect.objectContaining({ label: 'macbook' }),
//                 expect.objectContaining({ label: 'macbook pro' }),
//                 expect.objectContaining({ label: 'iphone' }),
//                 expect.objectContaining({ label: 'iphone case' }),
//               ],
//             }),
//             expect.objectContaining({
//               items: [
//                 expect.objectContaining({ query: 'macbook' }),
//                 expect.objectContaining({ query: 'macbook air' }),
//                 expect.objectContaining({ query: 'macbook pro' }),
//                 expect.objectContaining({ query: 'iphone' }),
//                 expect.objectContaining({ query: 'iphone case' }),
//                 expect.objectContaining({ query: 'iphone 10' }),
//                 expect.objectContaining({ query: 'iphone 11' }),
//               ],
//             }),
//           ],
//         }),
//       })
//     );
//   });

//   test.skip('with odd number of sources limits the items', async () => {
//     const onStateChange = jest.fn();
//     const { inputElement } = createPlayground(createAutocomplete, {
//       openOnFocus: true,
//       onStateChange,
//       plugins: [recentSearchesPlugin, querySuggestionsPlugin, productsPlugin],
//       reshape({ sources }) {
//         return limit(4, sources);
//       },
//     });

//     inputElement.focus();
//     await runAllMicroTasks();

//     expect(onStateChange).toHaveBeenLastCalledWith(
//       expect.objectContaining({
//         state: expect.objectContaining({
//           collections: [
//             expect.objectContaining({
//               items: [
//                 expect.objectContaining({ label: 'macbook' }),
//                 expect.objectContaining({ label: 'macbook pro' }),
//               ],
//             }),
//             expect.objectContaining({
//               items: [expect.objectContaining({ query: 'macbook' })],
//             }),
//             expect.objectContaining({
//               items: [expect.objectContaining({ label: 'MacBook' })],
//             }),
//           ],
//         }),
//       })
//     );
//   });

//   test('works with curried form', async () => {
//     const onStateChange = jest.fn();
//     const { inputElement } = createPlayground(createAutocomplete, {
//       openOnFocus: true,
//       onStateChange,
//       plugins: [recentSearchesPlugin, querySuggestionsPlugin],
//       reshape({ sources }) {
//         return limit(4)(sources);
//       },
//     });

//     inputElement.focus();
//     await runAllMicroTasks();

//     expect(onStateChange).toHaveBeenLastCalledWith(
//       expect.objectContaining({
//         state: expect.objectContaining({
//           collections: [
//             expect.objectContaining({
//               items: [
//                 expect.objectContaining({ label: 'macbook' }),
//                 expect.objectContaining({ label: 'macbook pro' }),
//               ],
//             }),
//             expect.objectContaining({
//               items: [
//                 expect.objectContaining({ query: 'macbook' }),
//                 expect.objectContaining({ query: 'macbook air' }),
//               ],
//             }),
//           ],
//         }),
//       })
//     );
//   });
// });
