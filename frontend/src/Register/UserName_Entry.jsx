// import React, { useState } from "react";
import styles from './TextEntry.module.css';

export function UserName_Entry(){
	return (
		<div className={styles.Text_Entry_Div}>
			<input
				type="text"
				placeholder="UserName"
				required
				className={styles.Text_Entry}>
			</input>
		</div>
	)
}
