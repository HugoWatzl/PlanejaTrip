import React, { useState } from 'react';
import Logo from './Logo';
import PasswordInput from './PasswordInput';
import { GoogleIcon } from './IconComponents';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => string | null;
  onRegister: (name: string, email: string, password: string) => string | null;
  onForgotPassword: () => void;
  onGoogleLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegister, onForgotPassword, onGoogleLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (email && password) {
        const result = onLogin(email, password);
        if (result) setError(result);
      } else {
        setError('Por favor, preencha e-mail e senha.');
      }
    } else { // register mode
      if (name && email && password && confirmPassword) {
        if (password !== confirmPassword) {
          setError('As senhas não coincidem.');
          return;
        }
        const result = onRegister(name, email, password);
        if (result) setError(result);
      } else {
        setError('Por favor, preencha todos os campos.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-brand-dark">
      <div className="max-w-md w-full bg-brand-light rounded-2xl shadow-2xl p-8 space-y-6">
        <Logo />
        <h2 className="text-center text-2xl font-bold text-brand-text pt-2">
          {mode === 'login' ? 'Faça seu Login' : 'Crie sua Conta'}
        </h2>
        <div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="sr-only">Nome</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-brand-text placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
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
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <PasswordInput
              id="password"
              name="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {mode === 'register' && (
               <PasswordInput
                id="confirm-password"
                name="confirm-password"
                autoComplete="new-password"
                required
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}
            
            <div className="flex items-center justify-end">
                {mode === 'login' && (
                    <button type="button" onClick={onForgotPassword} className="text-sm font-medium text-brand-primary hover:underline">
                        Esqueceu a senha?
                    </button>
                )}
            </div>


            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-brand-primary transition-colors"
              >
                {mode === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            </div>
          </form>
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink mx-4 text-brand-subtext text-xs">OU</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>
          <button
            type="button"
            onClick={onGoogleLogin}
            className="group relative w-full flex justify-center items-center py-3 px-4 border border-gray-600 text-sm font-semibold rounded-lg text-brand-text bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-brand-primary transition-colors"
          >
            <GoogleIcon className="w-5 h-5 mr-3" />
            Entrar com o Google
          </button>
          
          <div className="text-center text-sm pt-4">
            {mode === 'login' ? (
                <>
                    <span className="text-brand-subtext">Não tem uma conta? </span>
                    <button
                        onClick={() => { setMode('register'); setError(''); }}
                        className="font-medium text-brand-primary hover:underline"
                    >
                        Cadastre-se
                    </button>
                </>
            ) : (
                <>
                    <span className="text-brand-subtext">Já tem uma conta? </span>
                    <button
                        onClick={() => { setMode('login'); setError(''); }}
                        className="font-medium text-brand-primary hover:underline"
                    >
                        Faça login
                    </button>
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;