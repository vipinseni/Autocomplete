import {
  AutocompleteReshapeFunction,
  AutocompleteReshapeSource,
  BaseItem,
  unwrapReshapeSources,
} from '@algolia/autocomplete-core';

type UniqByPredicate<TItem extends BaseItem> = (params: {
  source: AutocompleteReshapeSource<TItem>;
  item: TItem;
}) => TItem;

export const uniqBy: AutocompleteReshapeFunction<UniqByPredicate<any>> = <
  TItem extends BaseItem
>(
  predicate
) => {
  return function runUniqBy(reshapeExpression) {
    const sources = unwrapReshapeSources(reshapeExpression);
    const seen: TItem[] = [];

    return sources.map((source) => {
      const items = source.getItems().filter((item) => {
        const appliedItem = predicate({ source, item });
        const hasSeen = seen.includes(appliedItem);

        seen.push(appliedItem);

        return !hasSeen;
      });

      return {
        ...source,
        getItems() {
          return items;
        },
      };
    });
  };
};
