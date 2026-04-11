import React from 'react';

interface DisabledButtonProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  onClick?: () => void;
}

export const DisabledButton: React.FC<DisabledButtonProps> = ({
  children,
  title = "Coming soon",
  className = "",
  onClick
}) => {
  return (
    <button
      className={`${className} opacity-50 cursor-not-allowed`}
      title={title}
      disabled
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const ComingSoonButton: React.FC<DisabledButtonProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <DisabledButton
      title="Feature coming soon"
      className={`${className} text-gray-500 hover:text-gray-400`}
      {...props}
    >
      {children}
    </DisabledButton>
  );
};

export default DisabledButton;
