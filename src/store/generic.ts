import {
  SliceCaseReducers,
  ValidateSliceCaseReducers,
  createSlice,
  ActionReducerMapBuilder,
  Dictionary,
  EntityId,
} from '@reduxjs/toolkit';

export interface GenericState<T> {
  ids: EntityId[];
  entities: Dictionary<T>;
  loading: boolean;
  error: any;
}

export const createGenericSlice = <
  T,
  Reducers extends SliceCaseReducers<GenericState<T>>
>({
  name = '',
  initialState,
  reducers,
  extraReducers,
}: {
  name: string;
  initialState: GenericState<T>;
  reducers: ValidateSliceCaseReducers<GenericState<T>, Reducers>;
  extraReducers: (builder: ActionReducerMapBuilder<GenericState<T>>) => void;
}) => {
  const slice = createSlice({
    name,
    initialState,
    reducers,
    extraReducers,
  });

  return slice;
};
