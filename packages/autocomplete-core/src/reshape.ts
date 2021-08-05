import {
  AutocompleteReshapeExpression,
  AutocompleteReshapeSource,
  BaseItem,
} from './types';

export function unwrapReshapeSources<TItem extends BaseItem>(
  reshapeExpression: AutocompleteReshapeExpression<TItem>
): Array<AutocompleteReshapeSource<TItem>> {
  return (
    (typeof reshapeExpression === 'function'
      ? reshapeExpression()
      : reshapeExpression) || []
  ).filter(Boolean);
}
