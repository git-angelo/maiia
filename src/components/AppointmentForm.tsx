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
import { ArrowBackIos, ArrowForwardIos } from '@material-ui/icons';

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

  // Database entries starts on 2023-04-27
  const [currentDate, setCurrentDate] = useState(new Date(2023, 3, 27));

  useEffect(() => {
    dispatch(getTimeSlots());
    dispatch(getPractitioners());
    dispatch(getPatients());
  }, [dispatch]);

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

  // timeslots depending on selected practitioner
  const filteredTimeslots = useMemo(() => {
    return timeslots.filter(
      (item) => item.practitionerId === values.practitioner?.id,
    );
  }, [timeslots, values.practitioner?.id]);

  // timeslots selector
  const timeslotsContainer = useMemo(() => {
    // data formatting
    const dates = [];
    for (let i = 0; i <= 4; i++) {
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
        newDate.setDate(old.getDate() - 5);
        return newDate;
      });
    };

    const handleNext = () => {
      setCurrentDate((old) => {
        const newDate = new Date(old);
        newDate.setDate(old.getDate() + 5);
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
        {submitCount > 0 && errors.timeslot ? (
          <span className="required">{errors.timeslot}</span>
        ) : (
          ''
        )}
      </div>
    );
  }, [
    submitCount,
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
                options={patients}
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
