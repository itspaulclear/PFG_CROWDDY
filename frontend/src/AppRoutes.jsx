import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Administrator from './components/Administrator';
import Register from './components/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Explore from './components/Explore';
import Testimonies from './components/Testimonies';
import Contact from './components/Contact';
import Editor from './components/Editor';
import ExpDashboard from './components/Dashboard/ExpDashboard';
import NotificationsDashboard from './components/Dashboard/NotificationsDashboard';
import MessagesDashboard from './components/Dashboard/MessagesDashboard';
import ProfileDashboard from './components/Dashboard/ProfileDashboard';
import WelcomeScreen from './components/WelcomeScreen';
import PrivPol from './components/PrivPol';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/welcome" element={<WelcomeScreen />} />
        <Route path="/log-in" element={<Login />} />
        <Route path="/administrator" element={<Administrator />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/testimonies" element={<Testimonies />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/sign-up" element={<Register />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expdashboard" element={< ExpDashboard/>} />
        <Route path="/notificationsdashboard" element={<NotificationsDashboard />} />
        <Route path="/messagesdashboard" element={<MessagesDashboard />} />
        <Route path="/profiledashboard" element={<ProfileDashboard />} />
        <Route path="/privacy-policy" element={<PrivPol />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
