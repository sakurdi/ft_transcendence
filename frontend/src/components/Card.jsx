const Card = ({ title, description, children }) => {
  return (
    <div className="group relative max-w-sm w-full p-8 bg-white border border-gray-100 rounded-2xl 
                    shadow-sm hover:shadow-xl hover:shadow-blue-500/5 
                    transition-all duration-500 ease-out mx-auto mt-10">
      
      {title && (
        <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight text-center">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-gray-500 leading-relaxed text-sm text-center mb-6">
          {description}
        </p>
      )}

      {}
      <div className="mt-4">
        {children}
      </div>
    </div>
  );
};

export default Card;