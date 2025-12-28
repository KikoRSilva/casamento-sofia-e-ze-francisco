import React from 'react';
import { Link } from 'react-router-dom';
import logo from './logo.png';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FCFBF7] flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="w-64 h-64 mx-auto mb-8 overflow-hidden rounded-full border-4 border-white shadow-lg bg-stone-100">
          <img 
            src={logo} 
            alt="Sofia & Zé Francisco"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#5D8AA8] serif">
          Sofia & Zé Francisco
        </h1>
        <p className="text-lg md:text-xl text-stone-500 tracking-widest uppercase font-light">
          27 de Junho de 2026
        </p>
        <div className="pt-8">
          <p className="text-stone-600 text-lg mb-6">
            Bem-vindos ao nosso casamento!
          </p>
          <Link 
            to="/save-the-date"
            className="inline-block px-8 py-4 bg-[#5D8AA8] text-white rounded-xl font-medium shadow-md hover:bg-[#4A6E86] transition-all"
          >
            Confirmar Presença
          </Link>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute top-10 -right-20 w-80 h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] rounded-full bg-[#5D8AA8]/10 blur-3xl"></div>
        <div className="absolute -bottom-10 -left-20 w-96 h-96 md:w-[450px] md:h-[450px] lg:w-[550px] lg:h-[550px] rounded-full bg-[#768D5D]/10 blur-3xl"></div>
      </div>
    </div>
  );
};

export default LandingPage;

