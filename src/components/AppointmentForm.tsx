import * as yup from 'yup';
import { useFormik } from 'formik';
import { Button, Grid, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

const staticPractitioners = [
  { id: 1, name: 'Jean' },
  { id: 2, name: 'Sandrine' },
];

const staticPatients = [
  { id: 101, name: 'Julie' },
  { id: 102, name: 'Pierre' },
];

const requiredMessage = (fieldName: string) => {
  return `Field ${fieldName} is required`;
};

const AppointmentForm = () => {
  const validationSchema = yup.object({
    practitioner: yup.number().required(requiredMessage('practitioner')),
    patient: yup.number().required(requiredMessage('patient')),
  });

  const formik = useFormik({
    initialValues: {
      practitioner: null,
      patient: null,
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const { setFieldValue, values } = formik;

  return (
    <div className="appointment__form__container">
      <Grid container spacing={2}>
        <Grid item className="appointment__form__container__left">
          <Grid container spacing={2}>
            <Grid item>
              <Autocomplete
                disablePortal
                id="practitioner"
                options={staticPractitioners}
                onChange={(e, value) => {
                  setFieldValue('practitioner', value);
                }}
                value={values.practitioner}
                getOptionSelected={(option, value) => option.id === value.id}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Practitioner"
                    variant="outlined"
                    error={
                      formik.touched.practitioner &&
                      Boolean(formik.errors.practitioner)
                    }
                    helperText={
                      formik.touched.practitioner && formik.errors.practitioner
                    }
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
                  setFieldValue('patient', value);
                }}
                value={values.patient}
                getOptionSelected={(option, value) => option.id === value.id}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Patient"
                    variant="outlined"
                    error={
                      formik.touched.patient && Boolean(formik.errors.patient)
                    }
                    helperText={formik.touched.patient && formik.errors.patient}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item className="appointment__form__container__right">
          Date
        </Grid>
      </Grid>
      <div className="appointment__form__container__submit">
        <Button variant="contained">Validate</Button>
      </div>
    </div>
  );
};

export default AppointmentForm;
