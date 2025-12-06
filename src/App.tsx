import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CreateRFP from "./pages/CreateRPF";
import Inbox from "./pages/Inbox";
import MyRFPs from "./pages/MyRFPs";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  🤖 RFP Manager Pro
                </h1>
                <div className="flex space-x-2">
                  <Link
                    to="/"
                    className="px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors"
                  >
                    📝 Create RFP
                  </Link>
                  <Link
                    to="/my-rfps"
                    className="px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors"
                  >
                    📋 My RFPs
                  </Link>
                  <Link
                    to="/inbox"
                    className="px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium transition-colors"
                  >
                    📬 Inbox
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<CreateRFP />} />
          <Route path="/my-rfps" element={<MyRFPs />} />
          <Route path="/inbox" element={<Inbox />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
