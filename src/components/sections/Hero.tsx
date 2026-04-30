import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="page-wrapper flex items-center justify-center px-6 sm:px-16">
      <div className="relative z-10 mx-auto max-w-5xl pt-32 pb-20">
        <div className="flex min-h-[calc(100vh-10rem)] flex-col justify-center">
          {/* Eyebrow */}
          <p className="fade-in-up text-[13px] font-medium uppercase tracking-[0.3em] text-[#555]">
            AI-Powered Architecture
          </p>

          {/* Main headline */}
          <h1 className="fade-in-up-delay-1 mt-6 text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-white">
            Where ideas
            <br />
            <span className="gradient-text">construct themselves.</span>
          </h1>

          {/* Subtitle */}
          <p className="fade-in-up-delay-2 mt-8 max-w-xl text-[16px] leading-[1.7] text-[#888]">
            Describe your architectural vision in plain text. The AI engine transforms
            your words into interactive 3D models — instantly. Built for
            architects, designers, and dreamers.
          </p>

          {/* CTA buttons */}
          <div className="fade-in-up-delay-3 mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link to="/projects" className="btn-primary">
              Start Generating
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/about" className="btn-secondary">
              Learn More
            </Link>
          </div>

          {/* Bottom stats */}
          <div className="fade-in-up-delay-4 mt-20 flex gap-12 border-t border-[#1a1a1a] pt-8">
            <div>
              <p className="text-2xl font-bold text-white">3D</p>
              <p className="mt-1 text-[13px] text-[#555]">Model Output</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">AI</p>
              <p className="mt-1 text-[13px] text-[#555]">Powered Engine</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">∞</p>
              <p className="mt-1 text-[13px] text-[#555]">Possibilities</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
