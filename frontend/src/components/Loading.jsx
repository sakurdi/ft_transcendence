import { Oval } from 'react-loader-spinner'

import getRandomPastel from "../Utils/colors"

export default function Loading() {
	const secondaryColor = getRandomPastel()

	return (
		<div className="w-full h-full flex items-center justify-center bg-transparent">
			<Oval
			height={45}
			width={45}
			color="#cfcfcf"
			wrapperStyle={{}}
			secondaryColor={secondaryColor}
			strokeWidth={4}
			strokeWidthSecondary={4}
			/>
		</div>
	)
}
