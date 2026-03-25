const pastel = [
	"#FFAACC", "#FFBBCC", "#FFCCCC", "#FFDDCC", "#FFEECC", "#FFFFCC",
	"#FFAADD", "#FFBBDD", "#FFCCDD", "#FFDDDD",
	"#FFBBEE", "#FFCCEE", "#FFDDEE", 
	"#FFCCFF", "#FFDDFF", "#FFEEFF",
	"#CCAAFF", "#CCBBFF", "#CCCCFF", "#CCDDFF", "#CCEEFF", 
	"#CCAAEE", "#CCBBEE", "#CCCCEE", "#CCEEEE", 
	"#CCAADD", "#CCBBDD", "#CCEEDD", "#CCFFDD", "#CCFFFF",
	"#CCAACC", "#CCEECC", "#CCFFCC", "#CCFFEE",
]
const Ncolors = pastel.length

export default function getRandomPastel(seed) {
	if (seed !== undefined)
		return pastel[seed % Ncolors]
	return pastel[Math.floor(Math.random() * Ncolors)]
}

function hashArcozon(string) {
	const primeA = 17
	const primeB = 29
	let h = 7
	for (let i = 0; i < string.length; i++) {
		h = Math.abs((h * primeA) ^ (string.charCodeAt(i) * primeB) )
	}
	return h
}

export function getRandomPastelString(string) {
	const hash = hashArcozon(string)
	// console.log(hash)
	return (getRandomPastel(hash))
}

export function getRandomPastelDate(dateIso) {
	const date = new Date(dateIso)
	const seed = date.getMilliseconds() + (date.getSeconds() + date.getMinutes() * 60) * 1000 

	return getRandomPastel(seed) 
}


// https://stackoverflow.com/questions/8317508/hash-function-for-a-string
