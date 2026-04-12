import Button from '../../components/Button';
import Layout from '../../components/Layout';

const Endpoint = ({ method, path, description, body, response }) => (
	<div className="mb-10 group">
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

export default function ApiDocs() {
	return (
		<Layout>
			<div className="max-w-3xl mx-auto py-12 px-4">
				<header className="mb-12 border-b border-white/10 pb-8">
					<h1 className="text-3xl font-black text-[#eaeaf4] mb-3 tracking-tight">
						Public API <span className="text-g_seagreen">v1</span> Documentation
					</h1>
					<p className="text-[#9898b8] text-lg leading-relaxed">
						Build your own tools and integrations using our robust public endpoints.
					</p>
				</header>

				<section className="mb-16 space-y-8">
					<div>
						<h2 className="text-xl font-bold text-[#eaeaf4] mb-4 flex items-center gap-3">
							<span className="w-8 h-8 rounded-lg bg-g_seagreen/10 text-g_seagreen flex items-center justify-center text-sm">01</span>
							Base URL
						</h2>
						<div className="p-4 glass rounded-xl border border-white/5 font-mono text-sm text-g_seagreen">
							https://localhost:1043/public/v1
						</div>
					</div>

					<div>
						<h2 className="text-xl font-bold text-[#eaeaf4] mb-4 flex items-center gap-3">
							<span className="w-8 h-8 rounded-lg bg-g_seagreen/10 text-g_seagreen flex items-center justify-center text-sm">02</span>
							Authentication
						</h2>
						<p className="text-[#9898b8] text-sm mb-4 leading-relaxed">
							All requests must include the <code className="text-g_seagreen font-bold px-1 bg-white/5 rounded">X-API-Key</code> header. 
							Generate your keys in <span className="text-[#eaeaf4] font-semibold italic">User Settings &gt; API Management</span>.
						</p>
						<pre className="p-4 glass-elevated rounded-xl text-xs font-mono text-[#9898b8] border border-white/5">
							X-API-Key: ftpub_abcd1234_yoursecrettoken
						</pre>
					</div>

					<div>
						<h2 className="text-xl font-bold text-[#eaeaf4] mb-4 flex items-center gap-3">
							<span className="w-8 h-8 rounded-lg bg-g_seagreen/10 text-g_seagreen flex items-center justify-center text-sm">03</span>
							Rate Limiting
						</h2>
						<div className="grid grid-cols-2 gap-4">
							<div className="p-4 glass rounded-xl border border-white/5">
								<span className="block text-[10px] font-bold text-[#55556a] uppercase tracking-widest mb-1">Limit</span>
								<span className="text-[#eaeaf4] font-bold">60 req/min</span>
							</div>
							<div className="p-4 glass rounded-xl border border-white/5">
								<span className="block text-[10px] font-bold text-[#55556a] uppercase tracking-widest mb-1">Burst</span>
								<span className="text-[#eaeaf4] font-bold">20 req</span>
							</div>
						</div>
					</div>
				</section>

				<section>
					<h2 className="text-2xl font-black text-[#eaeaf4] mb-8 border-b border-white/10 pb-4">
						Endpoints
					</h2>

					<Endpoint 
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
						method="GET"
						path="/boards/{boardName}"
						description="Retrieve detailed information about a specific board."
					/>

					<Endpoint 
						method="GET"
						path="/boards/{boardName}/threads"
						description="Get the latest discussion threads for a board."
					/>

					<Endpoint 
						method="POST"
						path="/boards/{boardID}/posts"
						description="Create a new discussion thread."
						body={{ title: "New Feature", content: "I have a great idea..." }}
						response={{ success: true, message: "Post created", data: 42 }}
					/>

					<Endpoint 
						method="PUT"
						path="/posts/{postID}"
						description="Update the content of a post you authored."
						body={{ content: "Updated content here" }}
					/>

					<Endpoint 
						method="DELETE"
						path="/posts/{postID}"
						description="Permanently remove a post. Requires authorship or moderator permissions."
					/>
				</section>

				<footer className="mt-20 pt-8 border-t border-white/10 flex justify-center">
					<Button onClick={() => window.history.back()} variant="ghost" className="text-xs uppercase tracking-widest">
						← Back to Application
					</Button>
				</footer>
			</div>
		</Layout>
	);
}
