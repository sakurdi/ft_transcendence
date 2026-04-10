import { useState } from "react"

export default function Tooltip({ content = "Tooltip", children }) {
	const [visible, setVisible] = useState(false)

	return (
		<div className="relative inline-flex"
			onMouseEnter={() => setVisible(true)}
			onMouseLeave={() => setVisible(false)}
		>
			{children}
			{visible && (
				<span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
					z-50 whitespace-nowrap pointer-events-none
					bg-[#2a2a38] text-[#eaeaf4] text-xs font-medium
					px-2.5 py-1 rounded-lg border border-white/8
					shadow-lg shadow-black/40">
					{content}
				</span>
			)}
		</div>
	)
}
