const sections = [
	{
		title: "1. Information We Collect",
		content: [
			"Account data: username, email, and hashed password.",
			"Profile data: files you upload such as avatar images.",
			"Communication data: messages sent through chat features.",
			"Presence data: online/offline status visible to other users.",
			"Technical data: connection logs and diagnostics used for security and stability.",
		],
	},
	{
		title: "2. How We Use Your Information",
		content: [
			"Create and manage your account.",
			"Provide messaging and presence-related features.",
			"Store and display uploaded profile files.",
			"Detect abuse, spam, and technical security issues.",
		],
	},
	{
		title: "3. Storage and Security",
		content: [
			"Passwords are stored only in hashed form.",
			"Uploaded files are validated to reduce malicious content risk.",
			"No internet transmission or storage method can be guaranteed as 100% secure.",
		],
	},
	{
		title: "4. Information Sharing",
		content: [
			"We do not sell or rent personal data to third parties.",
			"Core profile and communication data are shared only as required by platform features.",
		],
	},
	{
		title: "5. Your Rights",
		content: [
			"You can access and update your account information.",
			"You can request deletion of your account and associated personal data.",
			"Additional rights may apply based on your jurisdiction.",
		],
	},
	{
		title: "6. Cookies",
		content: [
			"We use essential session mechanisms to keep users authenticated.",
			"If analytics are enabled in the future, this page will be updated accordingly.",
		],
	},
	{
		title: "7. Policy Updates",
		content: [
			"We may revise this Privacy Policy over time.",
			"When changes are made, we update the 'Last updated' date on this page.",
		],
	},
	{
		title: "8. Contact",
		content: ["For privacy requests or questions, contact the project administrators."],
	},
]

export default function PrivacyPage() {
	return (
		<section className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6">
			<div className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
				<h1 className="text-2xl sm:text-3xl font-bold mb-2">Privacy Policy</h1>
				<p className="text-sm text-[#9898b8] mb-6">Last updated: April 11, 2026</p>

				<p className="text-sm text-[#eaeaf4] leading-7 mb-6">
					This policy explains what data we collect, why we collect it, and how we protect
					it when you use ft_transcendence.
				</p>

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