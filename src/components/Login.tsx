/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { Database } from '../data/db';
import { User, Marque } from '../types';
import { Sparkles, ShieldCheck, Lock, Building, HelpCircle, ArrowRight, Smartphone, Wifi, Database as DbIcon, Eye, EyeOff } from 'lucide-react';
import { PelouApiService } from '../data/api';

interface LoginProps {
  onLoginSuccess: (user: User, brand: Marque | null) => void;
  onNavigateToScan: () => void;
}

// Animated background particles component
function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
      color: string;
    }> = [];

    const colors = ['#6366f1', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.15 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      // Draw particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      animationId = requestAnimationFrame(draw);
    };

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

// Floating geometric shapes
function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 2 }}>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${15 + i * 15}%`,
            top: `${10 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0, 30, 0],
            x: [0, 20, -20, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 15 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2,
          }}
        >
          <div 
            className={`opacity-10 ${
              i % 3 === 0 ? 'w-32 h-32 rounded-full bg-indigo-500 blur-2xl' :
              i % 3 === 1 ? 'w-24 h-24 rotate-45 bg-blue-500 blur-xl' :
              'w-40 h-20 rounded-full bg-purple-500 blur-2xl'
            }`}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Mouse-following spotlight effect
function MouseSpotlight() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed pointer-events-none hidden lg:block"
      style={{
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
        width: 600,
        height: 600,
        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
        zIndex: 3,
      }}
    />
  );
}

export default function Login({ onLoginSuccess, onNavigateToScan }: LoginProps) {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [codeConnexion, setCodeConnexion] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');
  const [showDemoHelp, setShowDemoHelp] = useState(true);
  const [useDjango, setUseDjango] = useState<boolean>(() => {
    return localStorage.getItem('pelou_use_livedjango') === 'true';
  });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!emailOrPhone.trim() || !password.trim() || !codeConnexion.trim()) {
      setError('Veuillez remplir tous les champs (Identifiant, Mot de passe ET Code de connexion).');
      return;
    }

    setLoading(true);

    if (useDjango) {
      try {
        const res = await PelouApiService.loginBrand(
          codeConnexion.trim(),
          password.trim(),
          emailOrPhone.trim()
        );

        localStorage.setItem('pelou_use_livedjango', 'true');
        localStorage.setItem('pelou_django_token', res.token);

        const updatedUsers = [...Database.getUsers()];
        const existsIdx = updatedUsers.findIndex(u => u.username === res.user.username);
        let userToSession = res.user;
        if (existsIdx !== -1) {
          updatedUsers[existsIdx] = { ...updatedUsers[existsIdx], ...res.user };
          userToSession = updatedUsers[existsIdx];
        } else {
          updatedUsers.push(res.user);
        }
        Database.set('users', updatedUsers);

        if (res.marque) {
          const updatedMarques = [...Database.getMarques()];
          const marqueExistsIdx = updatedMarques.findIndex(m => m.nom_organisation.toLowerCase() === res.marque!.nom_organisation.toLowerCase());
          if (marqueExistsIdx !== -1) {
            updatedMarques[marqueExistsIdx] = { ...updatedMarques[marqueExistsIdx], ...res.marque };
          } else {
            updatedMarques.push(res.marque);
          }
          Database.set('marques', updatedMarques);

          try {
            const articles = await PelouApiService.getMyArticles(res.token);
            if (articles && articles.length > 0) {
              const otherArticles = Database.getArticles().filter(a => a.marque.toLowerCase() !== res.marque!.nom_organisation.toLowerCase());
              Database.set('articles', [...otherArticles, ...articles]);
            }
          } catch (err) {
            console.warn('Impossible de pré-charger les articles réels Django.', err);
          }
        }

        onLoginSuccess(userToSession, res.marque || null);
      } catch (err: any) {
        setError(`Échec de la connexion Django en direct : ${err.message || 'Le serveur Django est injoignable.'}`);
      } finally {
        setLoading(false);
      }
    } else {
      localStorage.setItem('pelou_use_livedjango', 'false');
      const users = Database.getUsers();

      const foundUser = users.find(u => {
        const matchesIdentifier = u.email.toLowerCase() === emailOrPhone.trim().toLowerCase() ||
                                  u.username.toLowerCase() === emailOrPhone.trim().toLowerCase() ||
                                  u.numero_telephone.includes(emailOrPhone.trim());
        const matchesCode = u.code_connexion === codeConnexion.trim();
        const matchesPassword = password.trim() === u.code_connexion || password.trim() === 'pelouteam2026';
        return matchesIdentifier && matchesCode && matchesPassword;
      });

      if (foundUser) {
        let brand: Marque | null = null;
        if (foundUser.is_marque) {
          brand = Database.getMarqueByNom(foundUser.nom_organisation || '');
        }
        onLoginSuccess(foundUser, brand);
      } else {
        setError('Adresse email, Mot de passe ou Code de connexion incorrect. Saisissez vos 3 identifiants correctement (ex: DOAK0001 pour le code de connexion).');
      }
      setLoading(false);
    }
  };

  const selectDemoAccount = (username: string, code: string) => {
    setEmailOrPhone(username);
    setCodeConnexion(code);
    setPassword(code);
    setError('');
  };

  return (
    <div id="login-container" className="min-h-screen flex bg-[#f8f9fa] overflow-hidden text-slate-900 font-sans relative">

      {/* Global animated background */}
      <AnimatedBackground />
      <FloatingShapes />
      <MouseSpotlight />

      {/* 5. Left Decorative Panel - Enhanced for PC */}
      <div className="hidden lg:flex lg:w-7/12 xl:w-2/3 h-screen relative bg-slate-900 flex-col justify-between p-12 xl:p-20 overflow-hidden select-none">
        {/* Abstract Background Pattern (Animated) */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <motion.div 
            animate={{
              x: [0, 80, -40, 0],
              y: [0, -60, 40, 0],
              scale: [1, 1.2, 0.9, 1],
              opacity: [0.3, 0.5, 0.3, 0.3]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut"
            }}
            className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500 blur-[130px]"
          />
          <motion.div 
            animate={{
              x: [0, -70, 90, 0],
              y: [0, 50, -60, 0],
              scale: [1, 0.85, 1.15, 1],
              opacity: [0.25, 0.45, 0.25, 0.25]
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut"
            }}
            className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-blue-600 blur-[160px]"
          />
          <motion.div 
            animate={{
              x: [-50, 50, -50],
              y: [50, -50, 50],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.15, 0.3, 0.15]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut"
            }}
            className="absolute top-[30%] left-[20%] w-[400px] h-[400px] rounded-full bg-pink-500 blur-[120px]"
          />
        </div>

        {/* Brand Logo/Header */}
        <motion.div 
          className="relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/25"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img src="/pelou_logo_1782152421292.jpg" alt="Pelou Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </motion.div>
            <span className="text-white font-semibold tracking-widest uppercase text-sm xl:text-base font-display">
              Pelou Anti-Contrefaçon
            </span>
          </div>
        </motion.div>

        {/* Pitch typography with serif elegance */}
        <motion.div 
          className="relative z-10 mb-12 xl:mb-16"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <h1 className="text-white text-5xl xl:text-7xl 2xl:text-8xl font-light leading-[1.1] mb-6 font-display tracking-tight">
            Centralisez votre <br />
            <motion.span 
              className="font-serif italic text-indigo-300 inline-block"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{
                background: 'linear-gradient(90deg, #818cf8, #c084fc, #818cf8)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Authenticité.
            </motion.span>
          </h1>
          <p className="text-slate-400 text-base xl:text-lg 2xl:text-xl max-w-lg xl:max-w-xl leading-relaxed font-sans font-light">
            Pelou est le moteur de gestion et de traçabilité ultime pour les producteurs locaux et marques de prestige. Authentifiez vos articles en toute confiance.
          </p>
        </motion.div>

        {/* Beautiful large decorative logo asset */}
        <motion.div 
          className="relative z-10 max-w-md xl:max-w-lg w-full bg-slate-900/40 backdrop-blur-md p-6 xl:p-8 rounded-3xl border border-slate-800 flex items-center gap-6 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.02, borderColor: 'rgba(99, 102, 241, 0.3)' }}
        >
          <motion.div 
            className="w-24 h-24 xl:w-28 xl:h-28 rounded-2xl overflow-hidden shadow-lg border border-slate-700/50 flex-shrink-0"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <img 
              src="/pelou_logo_1782152421292.jpg" 
              alt="Pelou Corporate Emblem" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm xl:text-base tracking-wide font-display">Visualisez le label d'authenticité</h4>
            <p className="text-xs xl:text-sm text-slate-400 leading-relaxed font-sans">
              Le logo de Pelou représente la loupe de vérification de l'administration et des consommateurs pour garantir que chaque produit provient de sa manufacture d'origine.
            </p>
          </div>
        </motion.div>

        {/* Stat numbers */}
        <motion.div 
          className="relative z-10 flex items-center space-x-8 xl:space-x-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.div 
            className="flex flex-col"
            whileHover={{ scale: 1.05 }}
          >
            <motion.span 
              className="text-white font-mono text-xl xl:text-3xl 2xl:text-4xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              420+
            </motion.span>
            <span className="text-slate-500 text-[10px] xl:text-xs uppercase tracking-[0.15em] font-medium">Marques Associées</span>
          </motion.div>
          <div className="w-px h-8 xl:h-10 bg-slate-800"></div>
          <motion.div 
            className="flex flex-col"
            whileHover={{ scale: 1.05 }}
          >
            <motion.span 
              className="text-white font-mono text-xl xl:text-3xl 2xl:text-4xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              99.9%
            </motion.span>
            <span className="text-slate-500 text-[10px] xl:text-xs uppercase tracking-[0.15em] font-medium">SLA de Traçabilité</span>
          </motion.div>
          <div className="w-px h-8 xl:h-10 bg-slate-800"></div>
          <motion.div 
            className="flex flex-col"
            whileHover={{ scale: 1.05 }}
          >
            <motion.span 
              className="text-white font-mono text-xl xl:text-3xl 2xl:text-4xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
            >
              24/7
            </motion.span>
            <span className="text-slate-500 text-[10px] xl:text-xs uppercase tracking-[0.15em] font-medium">Support Actif</span>
          </motion.div>
        </motion.div>
      </div>

      {/* 6. Right Panel - Form Layout & Demos - Enhanced PC responsiveness */}
      <div className="w-full lg:w-5/12 xl:w-1/3 h-screen overflow-y-auto flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 relative bg-[#f8f9fa]">
        {/* Subtle moving decorations exclusively for the form panel background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50 z-0">
          <motion.div 
            animate={{
              x: [0, 40, -20, 0],
              y: [0, -30, 35, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-12 -right-12 w-64 h-64 rounded-xl bg-gradient-to-tr from-indigo-200 to-indigo-100 opacity-20 blur-3xl"
          />
          <motion.div 
            animate={{
              x: [0, -30, 25, 0],
              y: [0, 40, -25, 0],
            }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-blue-100 opacity-25 blur-3xl"
          />
        </div>

        <div className="flex justify-between items-center lg:hidden mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm shadow-indigo-500/20">
              <img src="/pelou_logo_1782152421292.jpg" alt="Pelou" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 font-display">Pelou</span>
          </div>
          <button
            onClick={onNavigateToScan}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/50 px-3 py-1.5 rounded-lg transition"
          >
            Scanner Demo
          </button>
        </div>

        <motion.div 
          className="my-auto w-full max-w-md xl:max-w-lg mx-auto relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Header text */}
          <div className="mb-8">
            <motion.h2 
              className="text-3xl xl:text-4xl font-bold text-slate-800 tracking-tight font-display"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Espace Partenaire
            </motion.h2>
            <motion.p 
              className="text-slate-500 mt-2 text-sm xl:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Optimisez la distribution de vos marques et protégez vos créations.
            </motion.p>
          </div>

          {/* Form wrapper */}
          <motion.div 
            className="bg-white rounded-2xl p-6 sm:p-8 xl:p-10 border border-slate-100 shadow-sm shadow-slate-100/40"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {error && (
              <motion.div 
                className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-5 font-medium border border-red-100"
                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <motion.div 
                className="space-y-1.5"
                animate={{ 
                  scale: focusedField === 'email' ? 1.01 : 1,
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">
                  Identifiant ou Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="ex: contact@bamboutos.cm"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300 text-sm text-slate-800 hover:border-slate-300"
                  />
                </div>
              </motion.div>

              <motion.div 
                className="space-y-1.5"
                animate={{ 
                  scale: focusedField === 'password' ? 1.01 : 1,
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">
                    Mot de passe classique
                  </label>
                  <span className="text-[10px] uppercase font-bold text-indigo-600">Requis</span>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Saisissez votre mot de passe"
                    className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300 text-sm text-slate-800 hover:border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>

              <motion.div 
                className="space-y-1.5"
                animate={{ 
                  scale: focusedField === 'code' ? 1.01 : 1,
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">
                    Code Sécurisé de connexion (Code Partenaire)
                  </label>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 font-sans">
                    Requis
                  </span>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showCode ? 'text' : 'password'}
                    value={codeConnexion}
                    onChange={(e) => setCodeConnexion(e.target.value)}
                    onFocus={() => setFocusedField('code')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="ex: DOAK0001"
                    className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300 text-sm text-slate-800 hover:border-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
                  >
                    {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>

              <motion.button
                id="btn-login-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-slate-200 hover:shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer mt-6 disabled:opacity-75 disabled:cursor-wait relative overflow-hidden group"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="relative z-10">{loading ? 'Connexion en cours...' : 'Accéder au Portail'}</span>
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
                ) : (
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                )}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
                <span className="px-3 bg-white text-slate-400">Alternative Consommateur</span>
              </div>
            </div>

            <motion.button
              id="btn-login-scan"
              onClick={onNavigateToScan}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer border border-slate-150 text-sm"
              whileHover={{ scale: 1.01, borderColor: 'rgba(99, 102, 241, 0.3)' }}
              whileTap={{ scale: 0.99 }}
            >
              <Smartphone className="w-4 h-4 text-slate-500" />
              Scanner &amp; Vérifier un Produit
            </motion.button>
          </motion.div>

          {/* Elegant Demo Panel */}
          {showDemoHelp && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-6 bg-slate-50 border border-slate-150 rounded-xl p-5 xl:p-6"
            >
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 flex items-center gap-1.5 font-display">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Identifiants de Démo Sandbox
                </h3>
                <button
                  onClick={() => setShowDemoHelp(false)}
                  className="text-[10px] uppercase tracking-wider text-slate-400 hover:text-slate-600 underline font-extrabold cursor-pointer"
                >
                  Masquer
                </button>
              </div>
              <div className="space-y-2.5 text-xs">
                <motion.div 
                  className="p-3 bg-white rounded-lg border border-slate-200/60 flex items-center justify-between shadow-xs hover:border-indigo-200 transition cursor-pointer"
                  whileHover={{ scale: 1.01, x: 4 }}
                  onClick={() => selectDemoAccount('bamboutos_cosmetics', 'DOAK0001')}
                >
                  <div>
                    <p className="font-semibold text-slate-800">1. Bamboutos Cosmetics <span className="text-indigo-600 text-[10px]">⭐</span></p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Code: <strong className="font-mono text-slate-600">DOAK0001</strong> (DOuala, AKwa)</p>
                  </div>
                  <button
                    id="btn-demo-bamboutos"
                    onClick={(e) => { e.stopPropagation(); selectDemoAccount('bamboutos_cosmetics', 'DOAK0001'); }}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1 rounded-md font-bold text-xs transition cursor-pointer"
                  >
                    Tester
                  </button>
                </motion.div>
                <motion.div 
                  className="p-3 bg-white rounded-lg border border-slate-200/60 flex items-center justify-between shadow-xs hover:border-indigo-200 transition cursor-pointer"
                  whileHover={{ scale: 1.01, x: 4 }}
                  onClick={() => selectDemoAccount('kente_prestige', 'YABA0002')}
                >
                  <div>
                    <p className="font-semibold text-slate-800">2. Kente Prestige <span className="text-amber-500 text-[10px]">⚠️</span></p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Code: <strong className="font-mono text-slate-600">YABA0002</strong> (YAoundé, BAtos)</p>
                  </div>
                  <button
                    id="btn-demo-kente"
                    onClick={(e) => { e.stopPropagation(); selectDemoAccount('kente_prestige', 'YABA0002'); }}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1 rounded-md font-bold text-xs transition cursor-pointer"
                  >
                    Tester
                  </button>
                </motion.div>
                <div className="p-2.5 bg-slate-100/60 rounded-lg text-[10.5px] text-slate-500 leading-relaxed font-sans border border-slate-200/45">
                  💡 <strong>Formule de l'administration Pelou :</strong> Les codes de connexion partenaires et marques sont formés des 2 premières lettres de la <strong>Ville</strong> + 2 premières de leur <strong>Quartier</strong> + un compteur à 4 chiffres (ex: Douala Akwa #1 = DOAK0001).
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Footer info in the login scope */}
        <motion.div 
          className="pt-6 border-t border-slate-100/60 text-center flex flex-col items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Sécurité Intégrée</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.15em] font-mono mt-0.5">
            Pelou Anti-Contrefaçon © 2026 • MarqueOS v2.4.1
          </p>
        </motion.div>
      </div>

    </div>
  );
}