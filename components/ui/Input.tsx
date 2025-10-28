import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, className, ...props }) => {
  return (
    <div className="form-control w-full">
      <label htmlFor={id} className="label">
        <span className="label-text">{label}</span>
      </label>
      <input
        id={id}
        className={`input input-bordered w-full ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
