import * as yup from 'yup';
import { useFormik } from 'formik';
import { Button, Grid, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useEffect, useMemo } from 'react';
import { timeslotsSelectors, getTimeSlots } from 'store/timeslots';
import { useDispatch, useSelector } from 'react-redux';
import { Patient, Practitioner, Timeslot } from '.prisma/client';

const staticPractitioners: Practitioner[] = [
  { id: 62, firstName: 'Angelo', lastName: 'GALLO', speciality: 'General' },
  { id: 64, firstName: 'Sandrine', lastName: 'Dupont', speciality: 'Dentist' },
];

const staticPatients: Patient[] = [
  {
    id: 1,
    firstName: 'Antony',
    lastName: 'Rey',
    birthDate: new Date('1995-12-17T03:24:00'),
  },
  {
    id: 2,
    firstName: 'Olivier',
    lastName: 'Romand',
    birthDate: new Date('1990-12-17T03:24:00'),
  },
];

const requiredMessage = (fieldName: string) => {
  return `Field ${fieldName} is required`;
};

const AppointmentForm = () => {
  const dispatch = useDispatch();
  const timeslots = useSelector((state) =>
    timeslotsSelectors.selectAll(state.timeslots),
  );

  useEffect(() => {
    dispatch(getTimeSlots());
  }, []);

  const validationSchema = yup.object({
    practitioner: yup.object().required(requiredMessage('practitioner')),
    patient: yup.object().required(requiredMessage('patient')),
    timeslot: yup.object().required(requiredMessage('timeslot')),
  });

  const initialValues = {
    practitioner: undefined,
    patient: undefined,
    timeslot: undefined,
  } as {
    practitioner: Practitioner;
    patient: Patient;
    timeslot: Timeslot;
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    validateOnChange: true,
    onSubmit: (values) => {
      console.log(values);
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

  const filteredTimeslots = useMemo(() => {
    return timeslots.filter(
      (item) => item.practitionerId === values.practitioner?.id,
    );
  }, [values.practitioner]);

  const timeslotsContainer = useMemo(() => {
    const dates = [];
    for (let i = 0; i <= 4; i++) {
      const date = new Date(2023, 3, 26);
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
          return {
            ...dayTimeslot,
            formattedSlot: `${hours}:${minuts}`,
          };
        }),
      };
      while (dateItem.timeslots.length < 3) {
        dateItem.timeslots.push(null);
      }
      dates.push(dateItem);
    }

    return (
      <div className="timeslots-wrapper">
        <div className="timeslots-container">
          {dates.map((date, index) => (
            <div key={`date-${index}`} className="timeslots-container__day">
              <div className="timeslots-container__day__header">
                <span className="day">{date.day}</span>
                <span className="date">{`${date.dayNum} ${date.month}`}</span>
              </div>
              <div className="timeslots-container__day__slots">
                {date.timeslots.map((timeslot, timeslotIndex) => {
                  const selectedClassName =
                    values.timeslot && timeslot?.id === values.timeslot.id
                      ? 'selected'
                      : '';
                  return timeslot ? (
                    <div
                      key={`date-${index}-timeslot-${timeslotIndex}`}
                      className={`timeslots-container__day__slots__available ${selectedClassName}`}
                      onClick={() => {
                        setFieldValue('timeslot', timeslot);
                      }}
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
        </div>
        <span className="required">{submitCount > 0 && errors.timeslot}</span>
      </div>
    );
  }, [filteredTimeslots, values.timeslot, submitCount, errors.timeslot]);

  return (
    <div className="appointment__form__container">
      <Grid container spacing={4}>
        <Grid item className="appointment__form__container__left">
          <Grid container spacing={2}>
            <Grid item>
              <Autocomplete
                disablePortal
                id="practitioner"
                options={staticPractitioners}
                onChange={(e, value) => {
                  setFieldValue('practitioner', value || undefined);
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
                options={staticPatients}
                onChange={(e, value) => {
                  setFieldValue('patient', value || undefined);
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
        <Button variant="contained" onClick={() => handleSubmit()}>
          Validate
        </Button>
      </div>
    </div>
  );
};

export default AppointmentForm;
