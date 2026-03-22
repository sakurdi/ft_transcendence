const Card = ({ title, description, children, className = "" }) => {
  return (
    <div className={`bg-white border border-surface-200 rounded-2xl shadow-soft transition-all duration-300 p-6 sm:p-8 ${className}`}>
      
      {title && (
        <h3 className="text-xl sm:text-2xl font-bold text-surface-900 mb-2 tracking-tight">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-surface-500 leading-relaxed text-sm mb-6">
          {description}
        </p>
      )}

      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default Card;
