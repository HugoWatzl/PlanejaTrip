import React, { useState } from 'react';
import { User } from '../types';
import { XCircleIcon } from './IconComponents';
import PasswordInput from './PasswordInput';

interface ForgotPasswordModalProps {
  onClose: () => void;
  onPasswordReset: (email: string, newPassword: string) => string | null;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose, onPasswordReset }) => {
  const [step, setStep] = useState<'email' | 'code' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const SIMULATED_CODE = "123456";

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const users = JSON.parse(localStorage.getItem('planejaTrip_users') || '{}') as Record<string, User>;
    if (users[email]) {
      alert(`Simulação: Um código foi enviado para ${email}. Use o código: ${SIMULATED_CODE}`);
      setStep('code');
    } else {
      setError("Nenhum usuário encontrado com este e-mail.");
    }
  };
  
  const handleResendCode = () => {
    alert(`Código reenviado para ${email}! Use o código: ${SIMULATED_CODE}`);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (code === SIMULATED_CODE) {
      setStep('reset');
    } else {
      setError("Código de verificação incorreto.");
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 4) {
        setError("A senha deve ter pelo menos 4 caracteres.");
        return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    const result = onPasswordReset(email, newPassword);
    if (result) {
        setError(result);
    } else {
        setStep('success');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'email':
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Recuperar Senha</h2>
            <p className="text-brand-subtext mb-6">Insira o e-mail associado à sua conta para enviarmos um código de recuperação.</p>
            <div>
              <label htmlFor="email-forgot" className="block text-sm font-medium text-brand-subtext mb-1">E-mail</label>
              <input
                id="email-forgot"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm"
                placeholder="seu.email@exemplo.com"
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full px-6 py-3 rounded-lg text-white bg-brand-primary hover:bg-opacity-90 transition font-semibold">Enviar Código</button>
          </form>
        );
      case 'code':
        return (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Verificar Código</h2>
            <p className="text-brand-subtext mb-6">Insira o código de 6 dígitos que enviamos para {email}.</p>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-brand-subtext mb-1">Código de Verificação</label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-center text-lg tracking-[0.5em]"
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={handleResendCode} className="text-sm font-medium text-brand-primary hover:underline">
                    Reenviar código
                </button>
                <button type="submit" className="px-6 py-3 rounded-lg text-white bg-brand-primary hover:bg-opacity-90 transition font-semibold">Verificar</button>
            </div>
          </form>
        );
      case 'reset':
        return (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Redefinir Senha</h2>
            <p className="text-brand-subtext mb-6">Crie uma nova senha para sua conta.</p>
            <PasswordInput
                id="new-password"
                placeholder="Nova Senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
             />
            <PasswordInput
                id="confirm-new-password"
                placeholder="Confirme a Nova Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full px-6 py-3 rounded-lg text-white bg-brand-primary hover:bg-opacity-90 transition font-semibold">Redefinir Senha</button>
          </form>
        );
      case 'success':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Senha Alterada!</h2>
            <p className="text-brand-subtext mb-6">Sua senha foi redefinida com sucesso. Você já pode fazer login com a nova senha.</p>
            <button onClick={onClose} className="w-full px-6 py-3 rounded-lg text-white bg-brand-primary hover:bg-opacity-90 transition font-semibold">Voltar para o Login</button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-brand-light rounded-xl shadow-2xl p-8 m-4 max-w-md w-full relative transform transition-all duration-300 ease-out text-brand-text">
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-subtext hover:text-brand-text">
          <XCircleIcon className="w-8 h-8" />
        </button>
        {renderStep()}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;