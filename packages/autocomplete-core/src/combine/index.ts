import {
  AutocompleteCombineSource,
  AutocompleteSource,
  BaseItem,
  CombineTransformer,
} from '../types';
import { flatten } from '../utils';

export function evalCombiner<TItem extends BaseItem>(
  transformer: CombineTransformer<TItem>
): Array<AutocompleteCombineSource<TItem>> {
  return (
    (typeof transformer === 'function' ? transformer() : transformer) || []
  ).filter(Boolean);
}

export function limit<TItem extends BaseItem>(
  value: number,
  _transformer?: CombineTransformer<TItem>
): CombineTransformer<TItem> {
  return function runLimit(transformer = _transformer || []) {
    const sources = evalCombiner(transformer);

    const limitPerSource = Math.ceil(value / sources.length);
    let sharedLimitRemaining = value;

    return sources.map<AutocompleteCombineSource<TItem>>((source, index) => {
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
}

export function uniqBy<TItem extends BaseItem>(
  predicate: (params: {
    source: AutocompleteCombineSource<TItem>;
    item: TItem;
  }) => unknown,
  _transformer?: CombineTransformer<TItem>
): CombineTransformer<TItem> {
  return function runUniqBy(transformer = _transformer || []) {
    const sources = evalCombiner(transformer);
    const seen: unknown[] = [];

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
}

type GroupByOptions<
  TItem extends BaseItem,
  TSource extends AutocompleteSource<TItem>
> = {
  getSource(params: { title: string }): Partial<TSource>;
};

export function groupBy<
  TItem extends BaseItem,
  TSource extends AutocompleteSource<TItem> = AutocompleteSource<TItem>
>(
  predicate: (value: TItem) => string,
  options: GroupByOptions<TItem, TSource>,
  _transformer?: Array<AutocompleteCombineSource<TItem>>
): CombineTransformer<TItem> {
  return function runGroupBy(transformer = _transformer || []) {
    const sources = evalCombiner(transformer);

    if (sources.length === 0) {
      return [];
    }

    // Since we create multiple sources from a single one, we take the first one
    // as reference to create the new sources from.
    const referenceSource = sources[0];
    const items = flatten(sources.map((source) => source.getItems()));
    const groupedItems = items.reduce<Record<string, TItem[]>>((acc, item) => {
      const key = predicate(item);

      if (!acc.hasOwnProperty(key)) {
        acc[key] = [];
      }

      acc[key].push(item);

      return acc;
    }, {});

    const titles = Object.keys(groupedItems);

    return titles.map((title) => {
      const userSource = options.getSource({ title });

      return {
        ...referenceSource,
        sourceId: title,
        ...userSource,
        templates: {
          ...((referenceSource as any).templates as any),
          ...(userSource as any).templates,
        },
        getItems() {
          return groupedItems[title];
        },
      };
    });
  };
}

export function balance<TItem extends BaseItem>(
  minLimit: number,
  _transformer?: Array<AutocompleteCombineSource<TItem>>
): CombineTransformer<TItem> {
  return function runBalance(transformer = _transformer || []) {
    const sources = evalCombiner(transformer);

    const numberOfItemsPerSection = Math.ceil(
      sources.flatMap((x) => x.getItems()).length / sources.length
    );
    const limit = Math.max(minLimit, numberOfItemsPerSection);

    return sources.map((source, index) => {
      const isLastSource = index === sources.length - 1;
      const items = source.getItems();

      return {
        ...source,
        getItems() {
          return isLastSource ? items : items.slice(0, limit);
        },
      };
    });
  };
}
