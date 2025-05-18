import { Route, Router } from '@solidjs/router';
import './App.scss';
import { HomeScreen } from './features/home/page';

const App = () => {
  return (
    <Router>
      <Route path="/" component={HomeScreen}></Route>
    </Router>
  );
};

export default App;
