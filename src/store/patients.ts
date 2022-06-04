import { Patient } from '@prisma/client';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';
import config from 'config';
import { parseIds } from 'store/utils';

const SERVER_API_ENDPOINT = config.get('SERVER_API_ENDPOINT', '/api');

export const getPatients = createAsyncThunk('getPatients', async () => {
  const response = await fetch(`${SERVER_API_ENDPOINT}/patients`);
  const parsedResponse = await response.json();
  return parseIds(parsedResponse) as Patient[];
});

const patientsAdapter = createEntityAdapter<Patient>({});

export const patientsSelectors = patientsAdapter.getSelectors();

const patientsSlice = createSlice({
  name: 'patients',
  initialState: patientsAdapter.getInitialState({
    loading: false,
    error: null,
  }),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getPatients.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getPatients.fulfilled, (state, action) => {
      patientsAdapter.setAll(state, action.payload);
      state.error = null;
      state.loading = false;
    });
    builder.addCase(getPatients.rejected, (state, action) => {
      state.error = action.error;
      state.loading = false;
    });
  },
});

export default patientsSlice;
