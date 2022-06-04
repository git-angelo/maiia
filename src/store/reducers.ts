import timeslots from './timeslots';
import practitioners from './practitioners';
import patients from './patients';

export default {
  timeslots: timeslots.reducer,
  practitioners: practitioners.reducer,
  patients: patients.reducer,
};
