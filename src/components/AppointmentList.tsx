import { appointmentsSelectors, getAppointments } from 'store/appointments';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  CardActions,
  Button,
} from '@material-ui/core';
import { patientsSelectors } from 'store/patients';
import { practitionersSelectors } from 'store/practitioners';
import { formatDateRange } from 'utils/date';

const AppointmentList = () => {
  const dispatch = useDispatch();
  const appointments = useSelector((state) =>
    appointmentsSelectors.selectAll(state.appointments),
  );
  const practitioners = useSelector((state) =>
    practitionersSelectors.selectAll(state.practitioners),
  );
  const patients = useSelector((state) =>
    patientsSelectors.selectAll(state.patients),
  );
  useEffect(() => {
    dispatch(getAppointments());
  }, [dispatch]);

  console.log(appointments);
  return (
    <div className="appointment__list__container">
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
                    disabled
                    variant="contained"
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    disabled
                    variant="contained"
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
