import { useNavigate } from "react-router-dom";

const variants = {
  primary: "bg-brand-600 hover:bg-brand-700 text-white border-transparent shadow-sm",
  secondary: "bg-surface-50 hover:bg-surface-100 text-surface-900 border-surface-200 shadow-sm",
  danger: "bg-red-500 hover:bg-red-600 text-white border-transparent shadow-sm",
  ghost: "bg-transparent hover:bg-surface-50 text-surface-600 border-transparent",
  outline: "bg-white hover:bg-surface-50 text-surface-700 border-surface-200 shadow-sm",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  onClick,
  children = "Button",
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed";
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  link = "/",
  children = "Link",
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const navigate = useNavigate();

  const onClick = (e) => {
    if (props.onClick) props.onClick(e);
    navigate(link);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}
