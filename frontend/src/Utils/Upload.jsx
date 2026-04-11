import { BASE } from "./api";

export default async function uploadFile(path, body, options = {}) {
	const { onProgress } = options;
	const xhttp = new XMLHttpRequest();
	const route = path.startsWith(BASE) ? path : `${BASE}/${path}`;

	xhttp.onreadystatechange = function() {
		if (this.readyState == 0) {
			console.log("request not initialized...");
		}
		else if (this.readyState == 1) {
			console.log("server connection established...");
		}
		else if (this.readyState == 2) {
			console.log("request received....");
		}
		else if (this.readyState == 3) {
			console.log("processing request...");
		}
		else if (this.readyState == 4) {
			if (this.status >= 200 && this.status < 300) {
				console.log("File uploaded successfully");
			} else {
				console.error(`File upload failed with status ${this.status}`);
			}
		}
	};
	
	return new Promise((resolve) => {
		xhttp.upload.addEventListener("progress", (event) => {
			if (!event.lengthComputable) {
				onProgress?.(0);
				return;
			}

			const percentComplete = Math.round((event.loaded / event.total) * 100);
			onProgress?.(Math.min(100, Math.max(0, percentComplete)));
		});

		xhttp.responseType = "json";
		xhttp.open("POST", route, true);

		xhttp.onload = function() {
			onProgress?.(100);
			const data = this.response
			resolve({ ok: data.ok, status: data.message, json: data.json });
		};

		xhttp.onerror = function() {
			resolve({ ok: false, status: this.status || 0, json: undefined });
		};

		xhttp.send(body);
	});
}