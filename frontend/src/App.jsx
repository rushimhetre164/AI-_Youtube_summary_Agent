import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SummaryPage from './pages/SummaryPage'; 

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full">
        <Routes>
          {/* Main Library Page */}
          <Route path="/" element={<Home />} />
          
          {/* Summary Page */}
          <Route path="/summary" element={<SummaryPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;