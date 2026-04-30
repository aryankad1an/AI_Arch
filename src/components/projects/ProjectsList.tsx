import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Folder } from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  createdAt: string;
  promptHistory: string[];
}

const ProjectsList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('http://localhost:4000/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createNewProject = async () => {
    const name = prompt("Enter project name:", "New Project");
    if (!name) return;
    try {
      const res = await axios.post('http://localhost:4000/projects', { name });
      navigate(`/projects/${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create project");
    }
  };

  return (
    <section className="relative min-h-screen px-6 sm:px-16 overflow-hidden">
      {/* Decorative gradient orb for blending with grid background */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[30rem] w-[30rem] translate-x-1/2 translate-y-1/2 rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none" />
      
      <div className="relative z-10 mx-auto max-w-6xl pt-32 pb-20">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-3">Your Projects</h1>
            <p className="text-[15px] leading-relaxed text-[#888] max-w-lg">
              Manage your AI-generated spatial layouts. Create new rooms, iterate on designs, and visualize them instantly in 3D.
            </p>
          </div>
          <button 
            onClick={createNewProject} 
            className="group relative flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-black transition-all hover:scale-105 hover:bg-gray-100"
          >
            <Plus size={18} className="transition-transform group-hover:rotate-90" />
            New Project
          </button>
        </div>

        {loading ? (
          <p className="text-white text-center mt-20">Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] py-20">
            <Folder size={48} className="text-[#333] mb-4" />
            <p className="text-white font-medium">No projects found</p>
            <p className="text-[#555] text-sm mt-2 mb-6">Create a new project to start generating architectural models.</p>
            <button onClick={createNewProject} className="btn-primary">Get Started</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-white/[0.04] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-blue-500/20"
              >
                <div className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent pointer-events-none" />
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{project.name || 'Untitled'}</h3>
                  <p className="text-[13px] text-[#888] font-medium mb-4 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {project.promptHistory?.length || 0} Iterations
                  </p>
                </div>
                <div className="relative z-10 text-[12px] font-medium text-[#555]">
                  Created {new Date(project.createdAt).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsList;