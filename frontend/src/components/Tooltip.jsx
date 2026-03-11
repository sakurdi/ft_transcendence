import { useState } from "react"

export default function Tooltip({content = "Default Tooltip", children})
{
	const [mouseHover, setMouseHover] = useState(false)
	return (
		<div
			onMouseEnter={() => setMouseHover(true)}
			onMouseLeave = {() => setMouseHover(false)}
		>
			{children}
			{mouseHover &&
				<span className="fixed z-50 bg-zinc-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none font-">
					{content}
				</span>
			}
		</div>
	)
}
