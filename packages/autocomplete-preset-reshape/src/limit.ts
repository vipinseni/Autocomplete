import {
  AutocompleteReshapeFunction,
  unwrapReshapeSources,
} from '@algolia/autocomplete-core';

export const limit: AutocompleteReshapeFunction<number> = (value) => {
  return function runLimit(reshapeExpression) {
    const sources = unwrapReshapeSources(reshapeExpression);

    const limitPerSource = Math.ceil(value / sources.length);
    let sharedLimitRemaining = value;

    return sources.map((source, index) => {
      const isLastSource = index === sources.length - 1;
      const items = source
        .getItems()
        .slice(
          0,
          isLastSource
            ? sharedLimitRemaining
            : Math.min(limitPerSource, sharedLimitRemaining)
        );
      sharedLimitRemaining = Math.max(sharedLimitRemaining - items.length, 0);

      return {
        ...source,
        getItems() {
          return items;
        },
      };
    });
  };
};
