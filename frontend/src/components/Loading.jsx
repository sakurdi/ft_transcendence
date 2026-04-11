import { Oval } from 'react-loader-spinner'

export default function Loading() {
	return (
		<div className="w-full flex items-center justify-center py-12">
			<Oval
				height={36}
				width={36}
				color="#03B5AA"
				secondaryColor="rgba(3, 181, 170, 0.2)"
				strokeWidth={3}
				strokeWidthSecondary={3}
			/>
		</div>
	)
}
