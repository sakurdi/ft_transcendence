const sections = [
	{
		title: "1. Account Registration and Security",
		content: [
			"To use certain features of our platform, you must register for an account.",
			"You are responsible for safeguarding your password and all activity under your account.",
			"You agree to provide accurate, current, and complete information during registration.",
			"We may suspend or terminate accounts that provide false information or violate these Terms.",
		],
	},
	{
		title: "2. User-Generated Content (UGC)",
		content: [
			"You retain your rights over the content you post, but you are solely responsible for it.",
			"You must not post unlawful, abusive, defamatory, or otherwise harmful content.",
			"You must not upload malicious files, malware, or content that infringes third-party rights.",
			"We may review and remove content that breaches these Terms.",
		],
	},
	{
		title: "3. Acceptable Use",
		content: [
			"You must not spam, scrape, or use automated systems to abuse the service.",
			"You must not disrupt servers, networks, or real-time service features.",
			"You must not impersonate another person or entity.",
		],
	},
	{
		title: "4. Service Availability",
		content: [
			"We provide real-time features, but we do not guarantee uninterrupted, secure, or error-free service at all times.",
			"Temporary disruptions may occur due to maintenance or network issues.",
		],
	},
	{
		title: "5. Termination",
		content: [
			"We may suspend or terminate access immediately if you breach these Terms.",
			"Upon termination, your right to use the service stops immediately.",
		],
	},
	{
		title: "6. Limitation of Liability",
		content: [
			"To the maximum extent permitted by law, ft_transcendence is not liable for indirect, incidental, special, consequential, or punitive damages.",
			"This includes losses of data, profits, goodwill, or other intangible losses related to use of the service.",
		],
	},
	{
		title: "7. Changes to These Terms",
		content: [
			"We may update these Terms from time to time.",
			"When changes are significant, we will update the date on this page.",
		],
	},
	{
		title: "8. Contact",
		content: ["For questions about these Terms, contact the project administrators."],
	},
]

export default function TermOfServicePage() {
	return (
		<section className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6">
			<div className="glass rounded-2xl p-6 sm:p-8 border border-white/10">
				<h1 className="text-2xl sm:text-3xl font-bold mb-2">Terms of Service</h1>
				<p className="text-sm text-[#9898b8] mb-6">Last updated: April 10, 2026</p>
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