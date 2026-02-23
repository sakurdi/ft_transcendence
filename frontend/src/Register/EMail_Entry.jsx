// import React, { useState } from "react";
import styles from './TextEntry.module.css';

export function EMail_Entry(){
	const regexEmail = "[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}"

	return (
		<div className={`${styles.Text_Entry_Div} ${styles.EMail_Entry_Span}`}>
			<input
				type="email"
				placeholder="E-mail"
				pattern={regexEmail}
				className={`${styles.Text_Entry} ${styles.EMail_Entry}`}
				required>
			</input>
			<span className="validity"></span>
		</div>
	)
}


