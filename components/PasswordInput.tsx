import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from './IconComponents';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput: React.FC<PasswordInputProps> = (props) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const toggleVisibility = () => {
    setIsPasswordVisible(prev => !prev);
  };

  return (
    <div className="relative">
      <input
        {...props}
        type={isPasswordVisible ? 'text' : 'password'}
        className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-600 bg-gray-700 text-brand-text placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
      />
      <button
        type="button"
        onClick={toggleVisibility}
        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200"
        aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
      >
        {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  );
};

export default PasswordInput;