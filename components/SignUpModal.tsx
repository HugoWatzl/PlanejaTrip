import React, { useState } from 'react';

interface SignUpModalProps {
  onClose: () => void;
  onSignUp: (name: string, email: string, password: string) => Promise<void>;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ onClose, onSignUp }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpa erros antigos antes de uma nova tentativa

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    
    setIsLoading(true);

    try {
      await onSignUp(name, email, password);
      onClose(); // Close modal on success
    } catch (err: any) {
      if (err.message.includes('already be registered')) {
        setError('Este e-mail já está cadastrado. Tente fazer login.');
      } else if (err.message.includes('Password should be at least 6 characters')) {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Ocorreu um erro ao tentar se cadastrar. Tente novamente.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-dark flex justify-center items-center z-50 p-4">
      <div className="bg-brand-light rounded-xl shadow-2xl p-8 m-4 max-w-md w-full transform transition-all duration-300 ease-out text-brand-text">
        <h2 className="text-2xl font-bold mb-2 text-center">Criar Conta</h2>
        <p className="text-brand-subtext mb-6 text-center">Vamos começar a planejar!</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium text-brand-subtext mb-1">Nome Completo</label>
            <input type="text" id="signup-name" required value={name} onChange={(e) => { setName(e.target.value); setError(''); }} disabled={isLoading} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
          </div>
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-brand-subtext mb-1">E-mail</label>
            <input type="email" id="signup-email" required value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} disabled={isLoading} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
          </div>
          <div>
            <label htmlFor="signup-password"className="block text-sm font-medium text-brand-subtext mb-1">Senha</label>
            <input type="password" id="signup-password" required value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} disabled={isLoading} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
          </div>
          <div>
            <label htmlFor="signup-confirm-password"className="block text-sm font-medium text-brand-subtext mb-1">Confirmar Senha</label>
            <input type="password" id="signup-confirm-password" required value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }} disabled={isLoading} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" />
          </div>

          {error && <p className="text-red-400 text-sm text-center bg-red-900/30 p-2 rounded-lg">{error}</p>}

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition">Cancelar</button>
            <button type="submit" disabled={isLoading} className="px-6 py-2 rounded-lg text-white bg-brand-primary hover:bg-opacity-90 transition font-semibold shadow-md disabled:bg-gray-500">
              {isLoading ? 'Cadastrando...' : 'Cadastrar-se'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpModal;