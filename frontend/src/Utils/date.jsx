

export default function getDateDifferenceISO(dateISO) {
	const date = new Date(dateISO)
	return getDateDifference(date)
}
export function getDateDifference(date) {
	if (!date) return "0second ago"

	const diffSecond = Math.floor((Date.now() - date.getTime()) / 1000)
	const diffMinute = Math.floor(diffSecond / 60)
	const diffHour = Math.floor(diffMinute / 60)
	const diffDay = Math.floor(diffHour / 24)
	const diffMonth = Math.floor(diffDay / 30)
	const diffYear = Math.floor(diffMonth / 12)

	if (diffYear > 0)	return (`${diffYear} year${diffYear > 1 ? 's' : ''} ago`)
	if (diffMonth > 0)	return (`${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`)
	if (diffDay > 0)	return (`${diffDay} day${diffDay > 1 ? 's' : ''} ago`)
	if (diffHour > 0)	return (`${diffHour} hour${diffHour > 1 ? 's' : ''} ago`)
	if (diffMinute > 0)	return (`${diffMinute} minute${diffMinute > 1 ? 's' : ''} ago`)
	else				return (`${diffSecond} second${diffSecond > 1 ? 's' : ''} ago`)
}
