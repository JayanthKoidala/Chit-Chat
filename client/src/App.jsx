import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import ChatPage from './Pages/ChatPage';
import { useSelector } from 'react-redux';
import ProtectedRoute from './components/Authentication/ProtectedRoute';

function App() {
  const { userInfo } = useSelector((state) => state.user);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={userInfo ? <Navigate to="/chats" /> : <HomePage />} />
          <Route 
            path="/chats" 
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
