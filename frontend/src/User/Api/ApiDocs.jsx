import Button from '../../components/Button';
import Layout from '../../components/Layout';

const Endpoint = ({ id, method, path, description, body, response }) => (
	<div id={id} className="mb-16 pt-4 group">
		<div className="flex items-center gap-3 mb-3">
			<span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider
				${method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 
				  method === 'POST' ? 'bg-g_seagreen/20 text-g_seagreen' : 
				  method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' : 
				  'bg-red-500/20 text-red-400'}`}>
				{method}
			</span>
			<code className="text-sm font-mono text-[#eaeaf4] font-bold">{path}</code>
		</div>
		<p className="text-sm text-[#9898b8] mb-4 leading-relaxed">{description}</p>
		
		{body && (
			<div className="mb-4">
				<h5 className="text-[10px] font-bold text-[#55556a] uppercase tracking-widest mb-2">Request Body</h5>
				<pre className="p-4 glass-elevated rounded-xl text-xs font-mono text-g_seagreen overflow-x-auto border border-white/5">
					{JSON.stringify(body, null, 2)}
				</pre>
			</div>
		)}
		
		{response && (
			<div>
				<h5 className="text-[10px] font-bold text-[#55556a] uppercase tracking-widest mb-2">Example Response</h5>
				<pre className="p-4 glass-elevated rounded-xl text-xs font-mono text-[#9898b8] overflow-x-auto border border-white/5">
					{JSON.stringify(response, null, 2)}
				</pre>
			</div>
		)}
	</div>
);

const NavLink = ({ href, children }) => (
	<a href={href} className="block text-xs font-medium text-[#55556a] hover:text-g_seagreen transition-colors py-1.5 border-l-2 border-transparent hover:border-g_seagreen/30 pl-4">
		{children}
	</a>
);

export default function ApiDocs() {
	return (
		<Layout>
			<div className="max-w-6xl mx-auto py-12 px-4 lg:px-8">
				<div className="flex flex-col lg:flex-row gap-12">
					
					{/* Sidebar Outline */}
					<aside className="lg:w-64 flex-shrink-0">
						<div className="sticky top-24 space-y-8">
							<div>
								<h3 className="text-[10px] font-black text-[#eaeaf4] uppercase tracking-[0.2em] mb-4 opacity-50">
									Getting Started
								</h3>
								<nav className="space-y-1">
									<NavLink href="#base-url">Base URL</NavLink>
									<NavLink href="#authentication">Authentication</NavLink>
									<NavLink href="#rate-limiting">Rate Limiting</NavLink>
								</nav>
							</div>

							<div>
								<h3 className="text-[10px] font-black text-[#eaeaf4] uppercase tracking-[0.2em] mb-4 opacity-50">
									Endpoints
								</h3>
								<nav className="space-y-1">
									<NavLink href="#list-boards">List Boards</NavLink>
									<NavLink href="#get-board">Get Board</NavLink>
									<NavLink href="#board-threads">Board Threads</NavLink>
									<NavLink href="#create-post">Create Post</NavLink>
									<NavLink href="#update-post">Update Post</NavLink>
									<NavLink href="#delete-post">Delete Post</NavLink>
								</nav>
							</div>

							<div className="pt-8 border-t border-white/5">
								<Button onClick={() => window.history.back()} variant="ghost" className="w-full text-[10px] uppercase tracking-widest justify-start px-0">
									← Back
								</Button>
							</div>
						</div>
					</aside>

					{/* Main Content */}
					<main className="flex-1 max-w-3xl">
						<header className="mb-16 border-b border-white/10 pb-10">
							<div className="flex items-center gap-3 mb-4">
								<span className="px-2 py-0.5 rounded bg-g_seagreen/10 text-g_seagreen text-[10px] font-bold uppercase tracking-widest">v1.0.0</span>
							</div>
							<h1 className="text-4xl font-black text-[#eaeaf4] mb-4 tracking-tight">
								Public API Documentation
							</h1>
							<p className="text-[#9898b8] text-lg leading-relaxed font-medium">
								Integrate the power of <span className="text-[#eaeaf4]">ft_transcendence</span> into your own applications and workflows.
							</p>
						</header>

						<section className="space-y-20">
							<div id="base-url" className="scroll-mt-24">
								<h2 className="text-xl font-bold text-[#eaeaf4] mb-4 flex items-center gap-3">
									<span className="w-8 h-8 rounded-lg bg-g_seagreen/10 text-g_seagreen flex items-center justify-center text-sm">01</span>
									Base URL
								</h2>
								<p className="text-sm text-[#9898b8] mb-4">All API requests should be made to this root URL:</p>
								<div className="p-4 glass rounded-xl border border-white/5 font-mono text-sm text-g_seagreen">
									https://localhost:1043/public/v1
								</div>
							</div>

							<div id="authentication" className="scroll-mt-24">
								<h2 className="text-xl font-bold text-[#eaeaf4] mb-4 flex items-center gap-3">
									<span className="w-8 h-8 rounded-lg bg-g_seagreen/10 text-g_seagreen flex items-center justify-center text-sm">02</span>
									Authentication
								</h2>
								<p className="text-[#9898b8] text-sm mb-4 leading-relaxed">
									All requests must include the <code className="text-g_seagreen font-bold px-1 bg-white/5 rounded">X-API-Key</code> header. 
									Keys can be managed in your profile settings.
								</p>
								<pre className="p-4 glass-elevated rounded-xl text-xs font-mono text-[#9898b8] border border-white/5">
									X-API-Key: ftpub_abcd1234_yoursecrettoken
								</pre>
							</div>

							<div id="rate-limiting" className="scroll-mt-24">
								<h2 className="text-xl font-bold text-[#eaeaf4] mb-4 flex items-center gap-3">
									<span className="w-8 h-8 rounded-lg bg-g_seagreen/10 text-g_seagreen flex items-center justify-center text-sm">03</span>
									Rate Limiting
								</h2>
								<p className="text-[#9898b8] text-sm mb-6">Our API uses token bucket rate limiting to ensure platform stability.</p>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="p-4 glass rounded-xl border border-white/5">
										<span className="block text-[10px] font-bold text-[#55556a] uppercase tracking-widest mb-1">Standard Limit</span>
										<span className="text-[#eaeaf4] font-bold text-lg">60 req / min</span>
									</div>
									<div className="p-4 glass rounded-xl border border-white/5">
										<span className="block text-[10px] font-bold text-[#55556a] uppercase tracking-widest mb-1">Burst Capacity</span>
										<span className="text-[#eaeaf4] font-bold text-lg">20 requests</span>
									</div>
								</div>
							</div>

							<div id="endpoints" className="scroll-mt-24">
								<h2 className="text-2xl font-black text-[#eaeaf4] mb-10 border-b border-white/10 pb-4">
									Endpoints
								</h2>

								<Endpoint 
									id="list-boards"
									method="GET"
									path="/boards"
									description="Fetch a list of all available discussion boards."
									response={{
										success: true,
										message: "Success",
										data: [{ id: 1, name: "General", description: "All things general" }]
									}}
								/>

								<Endpoint 
									id="get-board"
									method="GET"
									path="/boards/{boardName}"
									description="Retrieve detailed information about a specific board."
								/>

								<Endpoint 
									id="board-threads"
									method="GET"
									path="/boards/{boardName}/threads"
									description="Get the latest discussion threads for a board."
								/>

								<Endpoint 
									id="create-post"
									method="POST"
									path="/boards/{boardID}/posts"
									description="Create a new discussion thread."
									body={{ title: "New Feature", content: "I have a great idea..." }}
									response={{ success: true, message: "Post created", data: 42 }}
								/>

								<Endpoint 
									id="update-post"
									method="PUT"
									path="/posts/{postID}"
									description="Update the content of a post you authored."
									body={{ content: "Updated content here" }}
								/>

								<Endpoint 
									id="delete-post"
									method="DELETE"
									path="/posts/{postID}"
									description="Permanently remove a post. Requires authorship or moderator permissions."
								/>
							</div>
						</section>
					</main>
				</div>
			</div>
		</Layout>
	);
}
