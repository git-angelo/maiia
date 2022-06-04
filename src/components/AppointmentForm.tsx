import * as yup from 'yup';
import { useFormik } from 'formik';
import { Button, Grid, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useEffect, useMemo, useState } from 'react';
import { timeslotsSelectors, getTimeSlots } from 'store/timeslots';
import { useDispatch, useSelector } from 'react-redux';
import { Patient, Practitioner, Timeslot } from '.prisma/client';
import { getPractitioners, practitionersSelectors } from 'store/practitioners';
import { getPatients, patientsSelectors } from 'store/patients';
import appointmentsSlice, {
  getAppointments,
  appointmentsSelectors,
} from 'store/appointments';
import { ArrowBackIos, ArrowForwardIos } from '@material-ui/icons';

const DAYS_TO_DISPLAY = 4;

const requiredMessage = (fieldName: string) => {
  return `Field ${fieldName} is required`;
};

const AppointmentForm = () => {
  const dispatch = useDispatch();
  const timeslots = useSelector((state) =>
    timeslotsSelectors.selectAll(state.timeslots),
  );
  const practitioners = useSelector((state) =>
    practitionersSelectors.selectAll(state.practitioners),
  );
  const patients = useSelector((state) =>
    patientsSelectors.selectAll(state.patients),
  );
  const appointments = useSelector((state) =>
    appointmentsSelectors.selectAll(state.appointments),
  );

  // Database entries starts on 2023-04-27
  const [currentDate, setCurrentDate] = useState(new Date(2023, 3, 27));

  useEffect(() => {
    dispatch(getTimeSlots());
    dispatch(getPractitioners());
    dispatch(getPatients());
    dispatch(getAppointments());
  }, [dispatch]);

  const validationSchema = yup.object({
    practitioner: yup.mixed().required(requiredMessage('practitioner')),
    patient: yup.mixed().required(requiredMessage('patient')),
    timeslot: yup.mixed().required(requiredMessage('timeslot')),
  });

  const initialValues = {
    practitioner: null,
    patient: null,
    timeslot: null,
  } as {
    practitioner: Practitioner;
    patient: Patient;
    timeslot: Timeslot;
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    validateOnChange: true,
    onSubmit: (values, { resetForm }) => {
      const newAppointment = {
        id: Math.max(...appointments.map((o) => o.id)) + 1,
        patientId: values.patient.id,
        practitionerId: values.practitioner.id,
        startDate: values.timeslot.startDate,
        endDate: values.timeslot.endDate,
      };
      dispatch(appointmentsSlice.actions.appointmentAddOne(newAppointment));
      resetForm();
    },
  });

  const {
    errors,
    setFieldValue,
    values,
    handleSubmit,
    submitCount,
    touched,
  } = formik;

  // Avaiblables timeslots depending on selected practitioner
  const filteredTimeslots = useMemo(() => {
    return timeslots.filter((timeslot) => {
      const isCurrentPractitioner =
        timeslot.practitionerId === values.practitioner?.id;

      const appointmentExists =
        appointments.findIndex(
          (appointment) =>
            appointment.practitionerId === values.practitioner?.id &&
            appointment.startDate === timeslot.startDate,
        ) !== -1
          ? true
          : false;

      return isCurrentPractitioner && appointmentExists === false;
    });
  }, [appointments, timeslots, values.practitioner?.id]);

  // timeslots selector
  const timeslotsContainer = useMemo(() => {
    // data formatting
    const dates = [];
    for (let i = 1; i <= DAYS_TO_DISPLAY; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + i);
      const dayTimeslots = filteredTimeslots.filter(
        (timeslot) => new Date(timeslot.startDate).getDate() === date.getDate(),
      );
      const dateItem = {
        day: date.toLocaleDateString(undefined, { weekday: 'short' }),
        dayNum: date.toLocaleDateString(undefined, { day: 'numeric' }),
        month: date.toLocaleDateString(undefined, { month: 'short' }),
        timeslots: dayTimeslots.map((dayTimeslot) => {
          const dayTimeslotDate = new Date(dayTimeslot.startDate);
          const hours = String(dayTimeslotDate.getHours()).padStart(2, '0');
          const minuts = String(dayTimeslotDate.getMinutes()).padStart(2, '0');
          const selectedClassName =
            values.timeslot && dayTimeslot?.id === values.timeslot.id
              ? 'selected'
              : '';
          return {
            ...dayTimeslot,
            formattedSlot: `${hours}:${minuts}`,
            selectedClassName: selectedClassName,
          };
        }),
      };
      while (dateItem.timeslots.length < 3) {
        dateItem.timeslots.push(null);
      }
      dates.push(dateItem);
    }

    const handlePrevious = () => {
      setCurrentDate((old) => {
        const newDate = new Date(old);
        newDate.setDate(old.getDate() - DAYS_TO_DISPLAY);
        return newDate;
      });
    };

    const handleNext = () => {
      setCurrentDate((old) => {
        const newDate = new Date(old);
        newDate.setDate(old.getDate() + DAYS_TO_DISPLAY);
        return newDate;
      });
    };

    const handleSelectTimeslot = (timeslot) => {
      setFieldValue('timeslot', timeslot);
    };

    return (
      <div className="timeslots-wrapper">
        <div className="timeslots-container">
          <div className="timeslots-container__arrow">
            <ArrowBackIos onClick={handlePrevious} />
          </div>
          {dates.map((date, index) => (
            <div key={`date-${index}`} className="timeslots-container__day">
              <div className="timeslots-container__day__header">
                <span className="day">{date.day}</span>
                <span className="date">{`${date.dayNum} ${date.month}`}</span>
              </div>
              <div className="timeslots-container__day__slots">
                {date.timeslots.map((timeslot, timeslotIndex) => {
                  return timeslot ? (
                    <div
                      key={`date-${index}-timeslot-${timeslotIndex}`}
                      className={`timeslots-container__day__slots__available ${timeslot.selectedClassName}`}
                      onClick={() => handleSelectTimeslot(timeslot)}
                    >
                      {timeslot.formattedSlot}
                    </div>
                  ) : (
                    <div
                      key={`date-${index}-timeslot-${timeslotIndex}`}
                      className="timeslots-container__day__slots__empty"
                    >
                      -
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="timeslots-container__arrow">
            <ArrowForwardIos onClick={handleNext} />
          </div>
        </div>
        {submitCount > 0 && touched.timeslot && errors.timeslot ? (
          <span className="required">{errors.timeslot}</span>
        ) : (
          ''
        )}
      </div>
    );
  }, [
    submitCount,
    touched.timeslot,
    errors.timeslot,
    currentDate,
    filteredTimeslots,
    values.timeslot,
    setFieldValue,
  ]);

  return (
    <div className="appointment__form__container">
      <Grid container spacing={4}>
        <Grid item className="appointment__form__container__left">
          <Grid container spacing={2}>
            <Grid item>
              <Autocomplete
                disablePortal
                id="practitioner"
                options={practitioners}
                onChange={(e, value) => {
                  setFieldValue('timeslot', null, true);
                  setFieldValue('practitioner', value || null);
                }}
                value={values.practitioner || null}
                getOptionSelected={(option, value) => option.id === value.id}
                getOptionLabel={(option) =>
                  `${option.firstName} ${option.lastName} | ${option.speciality}`
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Practitioner"
                    variant="outlined"
                    error={touched.practitioner && Boolean(errors.practitioner)}
                    helperText={touched.practitioner && errors.practitioner}
                  />
                )}
              />
            </Grid>
            <Grid item>
              <Autocomplete
                disablePortal
                id="patient"
                options={patients}
                onChange={(e, value) => {
                  setFieldValue('patient', value || null);
                }}
                value={values.patient || null}
                getOptionSelected={(option, value) => option.id === value.id}
                getOptionLabel={(option) =>
                  `${option.firstName} ${option.lastName}`
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Patient"
                    variant="outlined"
                    error={touched.patient && Boolean(errors.patient)}
                    helperText={touched.patient && errors.patient}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item className="appointment__form__container__right">
          {timeslotsContainer}
        </Grid>
      </Grid>
      <div className="appointment__form__container__submit">
        <Button variant="outlined" onClick={() => handleSubmit()}>
          Validate
        </Button>
      </div>
    </div>
  );
};

export default AppointmentForm;
