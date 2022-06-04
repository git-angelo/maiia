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

const AppointmentList = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPractitioners());
    dispatch(getPatients());
    dispatch(getAppointments());
  }, [dispatch]);

  const [filters, setFilters] = useState({
    practitioner: undefined,
    patient: undefined,
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

    return list;
  });

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
