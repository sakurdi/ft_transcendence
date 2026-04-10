export default function WrapReplies({ children }) {
	return (
		<div className="mt-6 pl-4 border-l-2 border-white/5 space-y-3">
			<p className="text-xs font-semibold text-[#46465a] uppercase tracking-wider mb-4">
				Replies
			</p>
			{children}
		</div>
	)
}
