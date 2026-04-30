import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';

import Navbar from './components/layout/Navbar';
import CustomCursor from './components/layout/CustomCursor';
import GridBackground from './components/canvas/GridBackground';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Profile from './components/sections/Profile';
import Generate from './components/Generate';
import ProjectView from './components/projects/ProjectView';
import ProjectsList from './components/projects/ProjectsList';
import { config } from './constants/config';

const App = () => {
  useEffect(() => {
    if (document.title !== config.html.title) {
      document.title = config.html.title;
    }
  }, []);

  return (
    <BrowserRouter>
      {/* Global layers */}
      <CustomCursor />
      <GridBackground />

      {/* Shared navbar */}
      <Navbar />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/about" element={<About />} />
        
        {/* Legacy generation route left for backward compatibility, but we now have better project views */}
        <Route path="/generate" element={<Generate />} />
        
        <Route path="/projects" element={<ProjectsList />} />
        <Route path="/projects/:id" element={<ProjectView />} />
        
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
