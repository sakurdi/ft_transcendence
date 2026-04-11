import { useNavigate } from "react-router-dom"

export default function FooterTOS() {
	const navigate = useNavigate()

	return (
		<>
			<footer className="text-center mt-auto text-[0.65rem] px-2 py-1 rounded-lg bg-g_seagreen/15 text-g_seagreen
								font-semibold">
				<div>
					<btn className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
							text-[#9898b8] hover:text-[#eaeaf4] hover:bg-white/8 transition-all duration-150"
						onClick={() => navigate(`/termofservice`)}>
							Term of service
					</btn>
				</div>
				<div>
					<btn className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
							text-[#9898b8] hover:text-[#eaeaf4] hover:bg-white/8 transition-all duration-150"
						onClick={() => navigate(`/privacy`)}>
							Privacy
					</btn>
				</div>
				<div>
					<btn className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
							text-[#9898b8] hover:text-[#eaeaf4] hover:bg-white/8 transition-all duration-150"
						onClick={() => navigate(`/contact`)}>
							Contact
					</btn>
				</div>
				<div>
					<p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
							text-[#9898b8] transition-all duration-150">
						© 2026 ft_transcendence
					</p>
				</div>
				<div>
					<p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
							text-[#9898b8] transition-all duration-150">
						Samy uWu (✿◠‿◠)
					</p>
				</div>
				
			</footer>
		</>
	)
}