import appointmentsSlice, {
  appointmentsSelectors,
  getAppointments,
} from 'store/appointments';
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  CardActions,
  Button,
  TextField,
  Grid,
} from '@material-ui/core';
import { getPatients, patientsSelectors } from 'store/patients';
import { getPractitioners, practitionersSelectors } from 'store/practitioners';
import { formatDateRange } from 'utils/date';
import { DateTimePicker } from '@material-ui/pickers';

const AppointmentList = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    (async function () {
      await dispatch(getPractitioners());
      await dispatch(getPatients());
      await dispatch(getAppointments());
    })();
  }, [dispatch]);

  const [filters, setFilters] = useState({
    practitioner: undefined,
    patient: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const practitioners = useSelector((state) =>
    practitionersSelectors.selectAll(state.practitioners),
  );

  const patients = useSelector((state) =>
    patientsSelectors.selectAll(state.patients),
  );

  const appointments = useSelector((state) => {
    // practitioner filter
    let list = appointmentsSelectors
      .selectAll(state.appointments)
      .filter((item) => {
        if (!filters.practitioner || filters.practitioner === '') {
          return true;
        } else {
          const practitioner = practitioners.find(
            (p) => p.id === item.practitionerId,
          );
          if (practitioner) {
            const fullName = `${practitioner.firstName} ${practitioner.lastName}`.toLowerCase();
            return fullName.includes(filters.practitioner.toLowerCase());
          }
          return false;
        }
      });

    // patient filter
    list = list.filter((item) => {
      if (!filters.patient || filters.patient === '') {
        return true;
      } else {
        const patient = patients.find((p) => p.id === item.patientId);
        if (patient) {
          const fullName = `${patient.firstName} ${patients.lastName}`.toLowerCase();
          return fullName.includes(filters.patient.toLowerCase());
        }
        return false;
      }
    });

    // startDate filter
    list = list.filter((item) => {
      if (!filters.startDate) {
        return true;
      } else {
        return new Date(item.startDate) > new Date(filters.startDate);
      }
    });

    // endDate filter
    list = list.filter((item) => {
      if (!filters.endDate) {
        return true;
      } else {
        return new Date(item.endDate) <= new Date(filters.endDate);
      }
    });

    return list;
  });

  useEffect(() => {
    if (filters.startDate === undefined && appointments?.[0]?.startDate) {
      setFilters((old) => ({
        ...old,
        startDate: new Date(appointments?.[0]?.startDate),
      }));
    }
  }, [appointments, filters.startDate]);

  const handleDelete = useCallback(
    (id: number) => {
      dispatch(appointmentsSlice.actions.appointmentRemoveOne(id));
    },
    [dispatch],
  );

  return (
    <div className="appointment__list__container">
      <div className="appointment__list__container__filters">
        <Typography variant="h5">Filters</Typography>
        <Grid container spacing={2}>
          <Grid item>
            <TextField
              label="Practitioner"
              variant="outlined"
              onChange={(e) =>
                setFilters((old) => ({ ...old, practitioner: e.target.value }))
              }
            />
          </Grid>
          <Grid item>
            <TextField
              label="Patient"
              variant="outlined"
              onChange={(e) =>
                setFilters((old) => ({ ...old, patient: e.target.value }))
              }
            />
          </Grid>
          <Grid item>
            <DateTimePicker
              value={filters.startDate || null}
              onChange={(date) =>
                setFilters((old) => ({ ...old, startDate: date }))
              }
              label="Start date"
              clearable
            />
          </Grid>
          <Grid item>
            <DateTimePicker
              value={filters.endDate || null}
              onChange={(date) =>
                setFilters((old) => ({ ...old, endDate: date }))
              }
              label="End date"
              clearable
            />
          </Grid>
        </Grid>
      </div>
      <div className="appointment__list__container__items">
        {appointments.map((appointment) => {
          const practitioner = practitioners.find(
            (practitioner) => practitioner.id === appointment.practitionerId,
          );
          const patient = patients.find(
            (patient) => patient.id === appointment.patientId,
          );
          const appointmentDateString = formatDateRange({
            from: new Date(appointment.startDate),
            to: new Date(appointment.endDate),
          });

          return (
            <div
              key={appointment.id}
              className="appointment__list__container__items__item"
            >
              <Card>
                <CardActionArea>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                      {`${practitioner.firstName} ${practitioner.lastName}`}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      component="p"
                    >
                      {`${patient.firstName} ${patient.lastName}`}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      component="p"
                    >
                      {appointmentDateString}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={() => handleDelete(appointment.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AppointmentList;
