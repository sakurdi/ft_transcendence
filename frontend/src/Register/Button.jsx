import React, { useEffect, useState } from "react";

export function Button({text = "Count: "}) {
	handleClick = () => {
		
	}
	return (
		<div>
			<button onClick = {handleClick}>
				{text}
			</button>
		</div>
	)
}
