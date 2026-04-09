import { BASE } from "./api";

export default async function uploadFile(path, body) {
	var xhttp = new XMLHttpRequest();

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
	const route = path.startsWith(BASE) ? path : `${BASE}/${path}`
	xhttp.open("POST", route, true);
	// xhttp.setRequestHeader("Content-Type", "multipart/form-data");
	xhttp.send(body);

	xhttp.responseType = "json";

	return new Promise((resolve) => {
		xhttp.onload = function() {
			resolve({ ok: this.status >= 200 && this.status < 300, status: this.status, json: this.response });
		};
	});
}