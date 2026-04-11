const sections = [
	{
		title: "ft_transcendence",
		content: [
			"kevwang@student.42.fr",
			"96 boulevard Bessieres, 75017, Paris",
		],
	}
]

export default function Contact() {
	return (
		<section className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6">
			<div className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
				<h1 className="text-2xl sm:text-3xl font-bold mb-2">Contact</h1>
				<p className="text-sm text-[#9898b8] mb-6">Last updated: April 11, 2026</p>

				<div className="space-y-6">
					{sections.map((section) => (
						<article key={section.title} className="space-y-3">
							<h2 className="text-lg font-semibold text-[#eaeaf4]">{section.title}</h2>
							<ul className="list-disc pl-5 space-y-2 text-sm text-[#9898b8] leading-6">
								{section.content.map((point) => (
									<li key={point}>{point}</li>
								))}
							</ul>
						</article>
					))}
				</div>
			</div>
		</section>
	)
}