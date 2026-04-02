import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../User/AuthProvider";
import useNotif from "../components/Notif";
import { apiPost } from "../Utils/api";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import Loading from "../components/Loading";
import Card from "../components/Card";

export default function CreateBoard() {
	const navigate = useNavigate();
	const userHandle = useAuth();
	const notifHandle = useNotif();

	const [boardName, setBoardName] = useState("");
	const [boardDescription, setBoardDescription] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (userHandle.loading) return;
		if (!userHandle.user) {
			notifHandle.pushError("Authentication required");
			navigate('/login');
		}
	}, [userHandle.loading, userHandle.user, navigate, notifHandle]);

	const handleCreateBoard = async (e) => {
		if (e) e.preventDefault();
		if (!boardName.trim()) {
			notifHandle.pushError("Board name is required");
			return;
		}

		setIsSubmitting(true);
		const response = await apiPost("/board/new", {
			body: JSON.stringify({
				name: boardName.trim(),
				description: boardDescription.trim(),
			}),
		});
		setIsSubmitting(false);

		if (!response.ok) {
			notifHandle.pushError(response.status || "Failed to create board");
		} else {
			notifHandle.pushSuccess(`Community "${boardName}" created`);
			navigate(`/board/${boardName}`);
		}
	};

	if (userHandle.loading || !userHandle.user) return <div className="p-12"><Loading /></div>;

	return (
		<div className="max-w-2xl mx-auto py-12">
			<Card 
				title="Create a Community" 
				description="Start a new space for discussions and collaboration."
			>
				<form onSubmit={handleCreateBoard} className="space-y-6 mt-4">
					<div>
						<label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2 ml-1">
							Community Name
						</label>
						<TextInput 
							value={boardName}
							onChange={setBoardName}
							placeholder="e.g. general, developers, gaming"
							autoFocus
						/>
						<p className="text-[10px] text-surface-400 mt-2 ml-1">
							Use a descriptive name. Short and memorable works best.
						</p>
					</div>

					<div>
						<label className="block text-xs font-black text-surface-400 uppercase tracking-widest mb-2 ml-1">
							Description (Optional)
						</label>
						<TextInput 
							value={boardDescription}
							onChange={setBoardDescription}
							placeholder="What is this community about?"
						/>
					</div>

					<div className="pt-4 flex flex-col sm:flex-row gap-3">
						<Button 
							type="submit" 
							variant="primary" 
							className="flex-1"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Creating..." : "Create Community"}
						</Button>
						<Button 
							variant="ghost" 
							onClick={() => navigate('/board')}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
					</div>
				</form>
			</Card>
		</div>
	);
}
