import timeslots from './timeslots';
import practitioners from './practitioners';
import patients from './patients';
import appointments from './appointments';

export default {
  timeslots: timeslots.reducer,
  practitioners: practitioners.reducer,
  patients: patients.reducer,
  appointments: appointments.reducer,
};
