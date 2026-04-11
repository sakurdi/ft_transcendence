const Card = ({ title, description, children, className = "" }) => {
  return (
    <div className={`
      relative w-full max-w-sm mx-auto mt-12
      glass rounded-2xl shadow-2xl shadow-black/30
      p-8
      ${className}
    `}>
      {}
      <div className="absolute top-0 left-8 right-8 h-px
        bg-gradient-to-r from-transparent via-g_seagreen/50 to-transparent rounded-full" />

      {title && (
        <h3 className="text-2xl font-bold text-[#eaeaf4] mb-2 tracking-tight text-center">
          {title}
        </h3>
      )}

      {description && (
        <p className="text-[#9898b8] text-sm text-center mb-6 leading-relaxed">
          {description}
        </p>
      )}

      <div className="mt-4">
        {children}
      </div>
    </div>
  )
}

export default Card
