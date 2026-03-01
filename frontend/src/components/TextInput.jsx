import { useState } from "react";

const baseInputStyles = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200";
const defaultTheme = "border-surface-200 focus:ring-brand-500 focus:border-transparent bg-white text-surface-900 placeholder-surface-400";

export default function TextInput({
  value,
  onChange,
  placeholder = "",
  type = "text",
  id,
  name,
  autoComplete = "off",
  className = "",
  onEnter = undefined,
  onKeypress = undefined,
  children,
  error = false,
  ...props
}) {
  const errorStyles = error ? "border-red-500 focus:ring-red-500" : defaultTheme;

  return (
    <div className="relative flex flex-col w-full">
      <div className="relative flex items-center">
        <input
          className={`${baseInputStyles} ${errorStyles} ${className}`}
          id={id}
          name={name}
          autoComplete={autoComplete}
          onKeyDown={(e) => {
            onKeypress?.(e);
            if (e.key === "Enter") onEnter?.();
          }}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          {...props}
        />
        {children}
      </div>
    </div>
  );
}

export function EMailInputVerify({
  value,
  oldOnChange,
  placeholder = "Email",
  id,
  name,
  autoComplete = "email",
  onEnter = undefined,
  onKeypress = undefined,
}) {
  const regexEmail = "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}";
  const validEMailTrue = "✓";
  const validEMailFalse = "✖";

  const [status, setStatus] = useState(""); // "", "valid", "invalid"

  const handleChange = (v) => {
    oldOnChange(v);
    if (v === "") setStatus("");
    else if (!v.match(regexEmail)) setStatus("invalid");
    else setStatus("valid");
  };

  const indicatorStyles = {
    valid: "text-green-500",
    invalid: "text-red-500",
    default: "text-gray-400",
  };

  return (
    <TextInput
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      type="email"
      id={id}
      name={name}
      autoComplete={autoComplete}
      onEnter={onEnter}
      onKeypress={onKeypress}
      error={status === "invalid"}
    >
      {status && (
        <span className={`absolute right-3 font-bold ${indicatorStyles[status]}`}>
          {status === "valid" ? validEMailTrue : validEMailFalse}
        </span>
      )}
    </TextInput>
  );
}

export function EMailInput({
  value,
  onChange,
  placeholder = "Email",
  verifyEmail = true,
  id,
  name,
  autoComplete = "email",
  onEnter = undefined,
  onKeypress = undefined,
}) {
  if (verifyEmail === true) {
    return (
      <EMailInputVerify
        value={value}
        oldOnChange={onChange}
        placeholder={placeholder}
        id={id}
        name={name}
        autoComplete={autoComplete}
        onEnter={onEnter}
        onKeypress={onKeypress}
      />
    );
  }
  return (
    <TextInput
      value={value}
      onChange={onChange}
      type="email"
      placeholder={placeholder}
      id={id}
      name={name}
      autoComplete={autoComplete}
      onEnter={onEnter}
      onKeypress={onKeypress}
    />
  );
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  id,
  name,
  autoComplete = "current-password",
  onEnter = undefined,
  onKeypress = undefined,
}) {
  return (
    <TextInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      id={id}
      name={name}
      autoComplete={autoComplete}
      onEnter={onEnter}
      onKeypress={onKeypress}
      type="password"
    />
  );
}
