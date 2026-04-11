export default function Layout({ children }) {
	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-6 min-h-[calc(100vh-56px)] flex flex-col">
			{children}
		</main>
	)
}