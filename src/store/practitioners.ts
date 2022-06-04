import { Practitioner } from '@prisma/client';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';
import config from 'config';
import { parseIds } from 'store/utils';

const SERVER_API_ENDPOINT = config.get('SERVER_API_ENDPOINT', '/api');

export const getPractitioners = createAsyncThunk(
  'getPractitioners',
  async () => {
    const response = await fetch(`${SERVER_API_ENDPOINT}/practitioners`);
    const parsedResponse = await response.json();
    return parseIds(parsedResponse) as Practitioner[];
  },
);

const practitionersAdapter = createEntityAdapter<Practitioner>({});

export const practitionersSelectors = practitionersAdapter.getSelectors();

const practitionersSlice = createSlice({
  name: 'practitioners',
  initialState: practitionersAdapter.getInitialState({
    loading: false,
    error: null,
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getPractitioners.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getPractitioners.fulfilled, (state, action) => {
      practitionersAdapter.setAll(state, action.payload);
      state.error = null;
      state.loading = false;
    });
    builder.addCase(getPractitioners.rejected, (state, action) => {
      state.error = action.error;
      state.loading = false;
    });
  },
});

export default practitionersSlice;
