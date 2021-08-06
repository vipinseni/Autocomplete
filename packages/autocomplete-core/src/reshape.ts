import {
  AutocompleteReshapeReturn,
  AutocompleteReshapeSource,
  BaseItem,
} from './types';

export function unwrapReshapeSources<TItem extends BaseItem>(
  reshapeReturn: AutocompleteReshapeReturn<TItem>
): Array<AutocompleteReshapeSource<TItem>> {
  return (
    (typeof reshapeReturn === 'function' ? reshapeReturn() : reshapeReturn) ||
    []
  ).filter(Boolean);
}
