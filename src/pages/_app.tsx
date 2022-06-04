import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import { Layout } from 'components/Layout';
import { Provider } from 'react-redux';
import store from 'store';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import 'styles/styles.scss';

const theme = createMuiTheme({
  palette: {
    primary: { main: '#000' },
    secondary: { main: '#FFF' },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Layout title={Component.pageTitle} subtitle={Component.pageSubtitle}>
            <Component {...pageProps} />
          </Layout>
        </MuiPickersUtilsProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default MyApp;
