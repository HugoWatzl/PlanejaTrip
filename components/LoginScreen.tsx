import React, { useState } from 'react';
import Logo from './Logo';
import SignUpModal from './SignUpModal';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha e-mail e senha.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onLogin(email, password);
      // On success, the onAuthStateChange listener in App.tsx will handle navigation
    } catch (err: any) {
      if (err.message.includes('Invalid login credentials')) {
        setError('E-mail ou senha inválidos.');
      } else {
        setError('Ocorreu um erro ao tentar fazer login. Tente novamente.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-brand-dark">
        <div className="max-w-md w-full bg-brand-light rounded-2xl shadow-2xl p-8 space-y-8">
            <Logo />
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-brand-text">Bem vindo!</h1>
                    <p className="text-brand-subtext">Faça login para planejar sua próxima viagem</p>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-brand-text placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                      placeholder="Endereço de e-mail"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">Senha</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-brand-text placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                      placeholder="Senha"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      disabled={isLoading}
                    />
                  </div>

                  {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-brand-primary transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Aguarde...' : 'Entrar'}
                    </button>
                  </div>
                </form>

                <div className="text-center text-sm">
                    <span className="text-brand-subtext">Não tem uma conta? </span>
                    <button type="button" onClick={() => setIsSignUpOpen(true)} className="font-medium text-brand-primary hover:text-brand-secondary focus:outline-none">
                        Cadastre-se
                    </button>
                </div>
            </div>
        </div>
      </div>
      {isSignUpOpen && (
        <SignUpModal 
            onClose={() => setIsSignUpOpen(false)}
            onSignUp={onSignUp}
        />
      )}
    </>
  );
};

export default LoginScreen;