
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ChevronRight, CheckCircle, Mail, User, Info } from 'lucide-react';
import { FormStep, RSVPFormData } from './types';
import logo from './logo.png';

// The URL provided by the user for Google Sheets integration
const SUBMIT_URL = 'https://script.google.com/macros/s/AKfycbxXD04PFI0elHBzOJNJZqPHhXxFsN973qGSmSNg9CJqr8KUxzSGZ6hNOhhhuhFQh5iu1Q/exec';

// Security constants
const MIN_FORM_COMPLETION_TIME = 10000; // 10 seconds in milliseconds
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds
const RATE_LIMIT_STORAGE_KEY = 'rsvp_submissions';
const MAX_LENGTHS = {
  nome: 100,
  email: 255,
  quaisRestricoes: 500
};

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Input sanitization function to prevent basic XSS
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
};

// Rate limiting functions
const checkRateLimit = (email: string): { allowed: boolean; timeRemaining?: number } => {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    const submissions: Array<{ email: string; timestamp: number }> = stored ? JSON.parse(stored) : [];
    
    const now = Date.now();
    const recentSubmissions = submissions.filter(
      sub => sub.email.toLowerCase() === email.toLowerCase() && (now - sub.timestamp) < RATE_LIMIT_WINDOW
    );
    
    if (recentSubmissions.length > 0) {
      const oldestSubmission = recentSubmissions[0];
      const timeRemaining = RATE_LIMIT_WINDOW - (now - oldestSubmission.timestamp);
      return { allowed: false, timeRemaining };
    }
    
    return { allowed: true };
  } catch (error) {
    // If localStorage fails, allow submission (fail open)
    console.error('Rate limit check failed:', error);
    return { allowed: true };
  }
};

const recordSubmission = (email: string): void => {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    const submissions: Array<{ email: string; timestamp: number }> = stored ? JSON.parse(stored) : [];
    
    const now = Date.now();
    // Clean up old submissions (older than rate limit window)
    const recentSubmissions = submissions.filter(
      sub => (now - sub.timestamp) < RATE_LIMIT_WINDOW
    );
    
    // Add new submission
    recentSubmissions.push({ email: email.toLowerCase(), timestamp: now });
    
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(recentSubmissions));
  } catch (error) {
    console.error('Failed to record submission:', error);
  }
};

const App: React.FC = () => {
  const [step, setStep] = useState<FormStep>(FormStep.WELCOME);
  const [formData, setFormData] = useState<RSVPFormData>({
    nome: '',
    email: '',
    presenca: true,
    restricoesAlimentares: false,
    quaisRestricoes: '',
    honeypot: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string>('');
  const [nomeError, setNomeError] = useState<string>('');
  const [restricoesError, setRestricoesError] = useState<string>('');
  const formStartTime = useRef<number | null>(null);
  
  // Track form start time when user moves to DETAILS step
  useEffect(() => {
    if (step === FormStep.DETAILS && formStartTime.current === null) {
      formStartTime.current = Date.now();
    }
  }, [step]);
  
  // Validate nome
  const validateNome = (nome: string): boolean => {
    if (!nome.trim()) {
      setNomeError('Por favor, insere o teu nome completo.');
      return false;
    }
    if (nome.length > MAX_LENGTHS.nome) {
      setNomeError(`O nome não pode exceder ${MAX_LENGTHS.nome} caracteres.`);
      return false;
    }
    setNomeError('');
    return true;
  };
  
  // Validate email format
  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailError('Por favor, insere um endereço de email.');
      return false;
    }
    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Por favor, insere um endereço de email válido.');
      return false;
    }
    if (email.length > MAX_LENGTHS.email) {
      setEmailError(`O email não pode exceder ${MAX_LENGTHS.email} caracteres.`);
      return false;
    }
    setEmailError('');
    return true;
  };
  
  // Validate restricoes alimentares
  const validateRestricoes = (): boolean => {
    if (formData.restricoesAlimentares && !formData.quaisRestricoes.trim()) {
      setRestricoesError('Por favor, indica quais são as restrições alimentares.');
      return false;
    }
    if (formData.quaisRestricoes.length > MAX_LENGTHS.quaisRestricoes) {
      setRestricoesError(`As restrições não podem exceder ${MAX_LENGTHS.quaisRestricoes} caracteres.`);
      return false;
    }
    setRestricoesError('');
    return true;
  };

  const handleNext = () => {
    if (step === FormStep.WELCOME) setStep(FormStep.DETAILS);
    else if (step === FormStep.DETAILS) {
      // Validate nome and email before proceeding
      const nomeValid = validateNome(formData.nome);
      const emailValid = validateEmail(formData.email);
      if (nomeValid && emailValid) {
        setStep(FormStep.PRESENCE);
      }
    }
    else if (step === FormStep.PRESENCE) {
      if (formData.presenca) setStep(FormStep.DIET);
      else handleSubmit();
    }
    else if (step === FormStep.DIET) {
      // Validate restricoes if needed before submitting
      if (validateRestricoes()) {
        handleSubmit();
      }
    }
  };

  const validateInputs = (): { valid: boolean; error?: string } => {
    // Validate email format
    if (!EMAIL_REGEX.test(formData.email)) {
      return { valid: false, error: 'Por favor, insere um endereço de email válido.' };
    }
    
    // Validate length limits
    if (formData.nome.length > MAX_LENGTHS.nome) {
      return { valid: false, error: `O nome não pode exceder ${MAX_LENGTHS.nome} caracteres.` };
    }
    
    if (formData.email.length > MAX_LENGTHS.email) {
      return { valid: false, error: `O email não pode exceder ${MAX_LENGTHS.email} caracteres.` };
    }
    
    if (formData.quaisRestricoes.length > MAX_LENGTHS.quaisRestricoes) {
      return { valid: false, error: `As restrições alimentares não podem exceder ${MAX_LENGTHS.quaisRestricoes} caracteres.` };
    }
    
    return { valid: true };
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    // Security check 1: Honeypot field must be empty
    if (formData.honeypot && formData.honeypot.trim() !== '') {
      // Silently reject - this is a bot
      console.warn('Bot detected: honeypot field filled');
      return;
    }
    
    // Security check 2: Rate limiting
    const rateLimitCheck = checkRateLimit(formData.email);
    if (!rateLimitCheck.allowed) {
      const minutesRemaining = Math.ceil((rateLimitCheck.timeRemaining || 0) / 60000);
      alert(`Por favor, aguarda ${minutesRemaining} minuto(s) antes de submeter novamente.`);
      setIsSubmitting(false);
      return;
    }
    
    // Security check 3: Minimum form completion time
    if (formStartTime.current) {
      const timeSpent = Date.now() - formStartTime.current;
      if (timeSpent < MIN_FORM_COMPLETION_TIME) {
        // Silently reject - form completed too quickly (likely automated)
        console.warn('Bot detected: form completed too quickly');
        return;
      }
    }
    
    // Security check 4: Input validation
    const validation = validateInputs();
    if (!validation.valid) {
      alert(validation.error || 'Por favor, verifica os dados inseridos.');
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Sanitize inputs before submission
      const sanitizedNome = sanitizeInput(formData.nome);
      const sanitizedEmail = sanitizeInput(formData.email);
      const sanitizedRestricoes = sanitizeInput(formData.quaisRestricoes);
      
      // Prepare the data as URLSearchParams for compatibility with simple Google Apps Script setups
      const params = new URLSearchParams();
      params.append('Nome Completo', sanitizedNome);
      params.append('Email', sanitizedEmail);
      params.append('Presença', formData.presenca ? 'Sim' : 'Não');
      params.append('Restrições Alimentares', formData.restricoesAlimentares ? 'Sim' : 'Não');
      params.append('Quais?', sanitizedRestricoes || 'N/A');
      params.append('Data de Submissão', new Date().toLocaleString('pt-PT'));
      params.append('token', 'rsvp_2026_sofia_ze_francisco');

      // We use no-cors because Google Apps Script often doesn't handle CORS preflight (OPTIONS)
      // unless specifically configured. Standard form POSTs work best.
      await fetch(SUBMIT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      // Record successful submission for rate limiting
      recordSubmission(formData.email);
      
      // Clear form data to prevent accidental resubmission
      setFormData({
        nome: '',
        email: '',
        presenca: true,
        restricoesAlimentares: false,
        quaisRestricoes: '',
        honeypot: ''
      });
      formStartTime.current = null;

      // In no-cors mode, we can't read the response, but if it doesn't throw, the request was sent.
      setStep(FormStep.THANK_YOU);
    } catch (error) {
      console.error('Erro ao enviar RSVP:', error);
      alert('Houve um erro ao enviar a sua resposta. Por favor, tente novamente ou contacte os noivos diretamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (updates: Partial<RSVPFormData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      // Apply length limits
      if (newData.nome && newData.nome.length > MAX_LENGTHS.nome) {
        newData.nome = newData.nome.substring(0, MAX_LENGTHS.nome);
      }
      if (newData.email && newData.email.length > MAX_LENGTHS.email) {
        newData.email = newData.email.substring(0, MAX_LENGTHS.email);
      }
      if (newData.quaisRestricoes && newData.quaisRestricoes.length > MAX_LENGTHS.quaisRestricoes) {
        newData.quaisRestricoes = newData.quaisRestricoes.substring(0, MAX_LENGTHS.quaisRestricoes);
      }
      return newData;
    });
  };

  return (
    <div className="min-h-screen lg:h-screen bg-[#FCFBF7] flex flex-col items-center justify-start p-4 md:p-6 lg:p-8 lg:overflow-hidden">
      <div className="max-w-md md:max-w-2xl w-full bg-white/40 rounded-3xl overflow-hidden shadow-sm border border-stone-100 flex flex-col min-h-[600px] lg:max-h-full lg:overflow-y-auto">
        
        {/* Header/Hero Section */}
        <div className="relative pt-8 pb-4 md:pt-6 md:pb-3 lg:pt-6 lg:pb-3 flex flex-col items-center text-center">
          <div className="w-48 h-48 md:w-52 md:h-52 lg:w-56 lg:h-56 mb-6 md:mb-4 lg:mb-4 overflow-hidden rounded-full border-4 border-white shadow-lg bg-stone-100">
            {/* Display the wedding logo using the string path */}
            <img 
              src={logo} 
              alt="Sofia & Zé Francisco"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold text-[#5D8AA8] serif px-4">
            Sofia & Zé Francisco
          </h1>
          <p className="text-sm md:text-sm lg:text-base text-stone-500 tracking-widest mt-2 uppercase font-light">
            27 de Junho de 2026
          </p>
        </div>

        <div className="flex-1 px-6 md:px-8 lg:px-10 pb-8 md:pb-8 lg:pb-8">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: WELCOME */}
            {step === FormStep.WELCOME && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6 pt-4"
              >
                <div className="bg-[#5D8AA8]/5 p-6 md:p-6 lg:p-6 rounded-2xl border border-[#5D8AA8]/10 text-stone-700 leading-relaxed text-sm md:text-sm lg:text-base">
                  <p className="mb-4">Queridos Amigos, Tios e Família,</p>
                  <p className="mb-4">
                    Gostávamos de contar com a vossa presença no dia <strong className="italic">27 de Junho de 2026</strong>, 
                    onde iremos celebrar o nosso Casamento. A Missa decorrerá na <span className="italic">Igreja de Nossa Senhora da Salvação</span>, em Arruda dos Vinhos, e o jantar na <span className="italic">Quinta da Sardinha</span>, em Marinhais.
                  </p>
                  <p className="mb-4">Em breve daremos mais novidades e indicações.</p>
                  <p className="mb-4">Pedimos que preencham o formulário individualmente, por favor.</p>
                  <p>Um abraço e um beijinho grande,<br/><strong className="serif text-[#5D8AA8]">Sofia & Zé Francisco</strong></p>
                </div>
                <button 
                  onClick={handleNext}
                  className="w-full py-4 md:py-4 lg:py-4 bg-[#5D8AA8] text-white rounded-xl font-medium md:text-sm lg:text-base shadow-md hover:bg-[#4A6E86] transition-all flex items-center justify-center gap-2"
                >
                  Confirmar Presença <ChevronRight size={18} />
                </button>
              </motion.div>
            )}

            {/* STEP 2: PERSONAL DETAILS */}
            {step === FormStep.DETAILS && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 md:space-y-6 lg:space-y-6 pt-4 md:pt-4 lg:pt-4"
              >
                <h2 className="text-xl md:text-xl lg:text-2xl serif text-[#5D8AA8] flex items-center gap-2">
                  <User size={20} /> Informação Pessoal
                </h2>
                
                <div className="space-y-6 md:grid md:grid-cols-2 md:gap-4 lg:gap-4">
                  <div className="relative">
                    <label className="block text-xs md:text-xs uppercase tracking-widest text-stone-400 mb-1 ml-1">Nome Completo</label>
                    <input 
                      type="text"
                      value={formData.nome}
                      onChange={(e) => {
                        updateFormData({ nome: e.target.value });
                        // Clear error when user starts typing
                        if (nomeError) setNomeError('');
                      }}
                      placeholder="Como queres aparecer na lista?"
                      maxLength={MAX_LENGTHS.nome}
                      className={`w-full bg-transparent border-b py-3 px-1 focus:border-[#5D8AA8] outline-none transition-colors ${
                        nomeError ? 'border-red-300' : 'border-stone-200'
                      }`}
                    />
                    {nomeError && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{nomeError}</p>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-xs md:text-xs uppercase tracking-widest text-stone-400 mb-1 ml-1">Email</label>
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        updateFormData({ email: e.target.value });
                        // Clear error when user starts typing
                        if (emailError) setEmailError('');
                      }}
                      placeholder="Para te enviarmos novidades"
                      maxLength={MAX_LENGTHS.email}
                      className={`w-full bg-transparent border-b py-3 px-1 focus:border-[#5D8AA8] outline-none transition-colors ${
                        emailError ? 'border-red-300' : 'border-stone-200'
                      }`}
                    />
                    {emailError && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{emailError}</p>
                    )}
                  </div>
                  
                  {/* Honeypot field - hidden from users, visible to bots */}
                  <input
                    type="text"
                    name="website"
                    value={formData.honeypot || ''}
                    onChange={(e) => updateFormData({ honeypot: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                    style={{
                      position: 'absolute',
                      left: '-9999px',
                      opacity: 0,
                      pointerEvents: 'none',
                      width: '1px',
                      height: '1px'
                    }}
                    aria-hidden="true"
                  />
                </div>

                <button 
                  disabled={!formData.nome || !formData.email}
                  onClick={handleNext}
                  className="w-full py-4 md:py-4 lg:py-4 bg-[#5D8AA8] disabled:opacity-50 text-white rounded-xl font-medium md:text-sm lg:text-base shadow-md transition-all flex items-center justify-center gap-2"
                >
                  Continuar <ChevronRight size={18} />
                </button>
              </motion.div>
            )}

            {/* STEP 3: PRESENCE */}
            {step === FormStep.PRESENCE && (
              <motion.div
                key="presence"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 md:space-y-6 lg:space-y-6 pt-4 md:pt-4 lg:pt-4"
              >
                <h2 className="text-xl md:text-xl lg:text-2xl serif text-[#5D8AA8] text-center">
                  Podemos contar com a tua presença?
                </h2>
                
                <div className="grid grid-cols-2 gap-4 md:gap-4 lg:gap-4">
                  <button
                    onClick={() => updateFormData({ presenca: true })}
                    className={`py-6 md:py-5 lg:py-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      formData.presenca 
                        ? 'border-[#5D8AA8] bg-[#5D8AA8]/5 text-[#5D8AA8]' 
                        : 'border-stone-100 text-stone-400 grayscale'
                    }`}
                  >
                    <div className="w-6 h-6 md:w-6 md:h-6 lg:w-6 lg:h-6 flex items-center justify-center">
                      <Heart className={`w-full h-full ${formData.presenca ? 'fill-[#5D8AA8]' : ''}`} />
                    </div>
                    <span className="font-bold md:text-sm lg:text-base">Sim</span>
                  </button>

                  <button
                    onClick={() => updateFormData({ presenca: false })}
                    className={`py-6 md:py-5 lg:py-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      !formData.presenca 
                        ? 'border-[#D97706] bg-[#D97706]/5 text-[#D97706]' 
                        : 'border-stone-100 text-stone-400 grayscale'
                    }`}
                  >
                    <span className="text-2xl md:text-2xl lg:text-3xl">😢</span>
                    <span className="font-bold md:text-sm lg:text-base">Não</span>
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="w-full py-4 md:py-4 lg:py-4 bg-[#5D8AA8] text-white rounded-xl font-medium md:text-sm lg:text-base shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'A enviar...' : (formData.presenca ? 'Próximo' : 'Confirmar Ausência')}
                    {!isSubmitting && <ChevronRight size={18} />}
                  </button>
                  <button 
                    onClick={() => setStep(FormStep.DETAILS)}
                    className="text-stone-400 text-sm underline"
                    disabled={isSubmitting}
                  >
                    Voltar
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: DIETARY RESTRICTIONS */}
            {step === FormStep.DIET && (
              <motion.div
                key="diet"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 md:space-y-6 lg:space-y-6 pt-4 md:pt-4 lg:pt-4"
              >
                <h2 className="text-xl md:text-xl lg:text-2xl serif text-[#5D8AA8] flex items-center gap-2">
                  <Info size={20} /> Restrições Alimentares
                </h2>
                
                <p className="text-stone-500 text-sm md:text-sm lg:text-base">Tens alguma alergia ou restrição que devamos saber?</p>

                <div className="grid grid-cols-2 gap-4 md:gap-4 lg:gap-4">
                  <button
                    onClick={() => updateFormData({ restricoesAlimentares: true })}
                    className={`py-4 md:py-4 lg:py-4 rounded-xl border-2 transition-all md:text-sm lg:text-base ${
                      formData.restricoesAlimentares 
                        ? 'border-[#5D8AA8] bg-[#5D8AA8]/5 text-[#5D8AA8]' 
                        : 'border-stone-100 text-stone-400'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => updateFormData({ restricoesAlimentares: false })}
                    className={`py-4 md:py-4 lg:py-4 rounded-xl border-2 transition-all md:text-sm lg:text-base ${
                      !formData.restricoesAlimentares 
                        ? 'border-[#5D8AA8] bg-[#5D8AA8]/5 text-[#5D8AA8]' 
                        : 'border-stone-100 text-stone-400'
                    }`}
                  >
                    Não
                  </button>
                </div>

                {formData.restricoesAlimentares && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="relative"
                  >
                    <label className="block text-xs md:text-xs uppercase tracking-widest text-stone-400 mb-1 ml-1">Quais?</label>
                    <textarea 
                      value={formData.quaisRestricoes}
                      onChange={(e) => {
                        updateFormData({ quaisRestricoes: e.target.value });
                        // Clear error when user starts typing
                        if (restricoesError) setRestricoesError('');
                      }}
                      rows={3}
                      maxLength={MAX_LENGTHS.quaisRestricoes}
                      className={`w-full bg-stone-50 rounded-xl p-4 border focus:border-[#5D8AA8] outline-none transition-colors text-sm md:rows-4 ${
                        restricoesError ? 'border-red-300' : 'border-stone-100'
                      }`}
                      placeholder="Ex: Vegetariano, Sem Glúten, Alergia a Marisco..."
                    />
                    {restricoesError && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{restricoesError}</p>
                    )}
                  </motion.div>
                )}

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="w-full py-4 md:py-4 lg:py-4 bg-[#5D8AA8] disabled:opacity-50 text-white rounded-xl font-medium md:text-sm lg:text-base shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'A enviar...' : 'Finalizar RSVP'}
                    {!isSubmitting && <CheckCircle size={18} />}
                  </button>
                  <button 
                    onClick={() => setStep(FormStep.PRESENCE)}
                    className="text-stone-400 text-sm underline"
                    disabled={isSubmitting}
                  >
                    Voltar
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: THANK YOU */}
            {step === FormStep.THANK_YOU && (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center space-y-4 md:space-y-4 lg:space-y-4 pt-8 md:pt-8 lg:pt-8"
              >
                <div className="w-20 h-20 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-2">
                  <CheckCircle className="w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14" />
                </div>
                <h2 className="text-3xl md:text-3xl lg:text-4xl serif text-[#5D8AA8]">Obrigado!</h2>
                <div className="text-stone-600 leading-relaxed md:text-sm lg:text-base">
                  {formData.presenca ? (
                    <p>Ficamos muito felizes em saber que vais estar connosco! <br/> Guardámos o teu lugar com muito carinho.</p>
                  ) : (
                    <p>Sentiremos a tua falta, mas agradecemos por nos avisares. <br/> Esperamos ver-te em breve noutra ocasião!</p>
                  )}
                </div>
                <div className="pt-6 md:pt-6 lg:pt-6 text-[#5D8AA8] watercolor-text text-3xl md:text-3xl lg:text-4xl">
                  Sofia & Zé Francisco
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="pb-8 pt-4 flex flex-col items-center gap-4 text-[10px] text-stone-400 tracking-widest uppercase">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><Mail size={10} /> Casamento 2026</span>
          </div>
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

export default App;
