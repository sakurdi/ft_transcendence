import styles from "./WrapError.module.css";

export default function WrapError ({
	children,
	errorText,
}) {
	return (
		<div className={styles.entryError}>
			<ErrorText errorText={errorText}/>
			{children}
		</div>
	)
}

export function ErrorText ({
	errorText,
}) {
	return (
		<div className={styles.Error}>
			{errorText}
		</div>
	)
}
