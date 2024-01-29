import './App.css';
import Ticket from './components/ticket';
import Home from './components/home';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/" element={<Ticket />} />
        </Routes>
      </div>
    </Router>    
  );
}

export default App;
