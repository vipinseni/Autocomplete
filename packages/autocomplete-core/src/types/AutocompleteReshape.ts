import { BaseItem } from './AutocompleteApi';
import { AutocompleteSource } from './AutocompleteSource';
import { AutocompleteState } from './AutocompleteState';

export type AutocompleteReshapeSource<
  TItem extends BaseItem
> = AutocompleteSource<TItem> & {
  getItems(): TItem[];
};

export type AutocompleteReshapeSourcesBySourceId<
  TItem extends BaseItem
> = Record<string, AutocompleteReshapeSource<TItem>>;

type MaybeFunction<TType> = TType | (() => TType);

export type AutocompleteReshapeExpression<
  TItem extends BaseItem
> = MaybeFunction<Array<AutocompleteReshapeSource<TItem>>>;

export type Reshape<
  TState extends AutocompleteState<any> = AutocompleteState<any>
> = (params: {
  sources: Array<AutocompleteReshapeSource<any>>;
  sourcesBySourceId: AutocompleteReshapeSourcesBySourceId<any>;
  state: TState;
}) => AutocompleteReshapeExpression<any>;

export type AutocompleteReshapeFunction<TParams = any> = <
  TItem extends BaseItem
>(
  ...params: TParams[]
) => (
  ...expressions: Array<AutocompleteReshapeSource<TItem>>
) => Array<AutocompleteReshapeSource<TItem>>;
