const pastel = [
	"#FFAACC", "#FFBBCC", "#FFCCCC", "#FFDDCC", "#FFEECC", "#FFFFCC",
	"#FFAADD", "#FFBBDD", "#FFCCDD", "#FFDDDD", "#FFEEDD", "#FFFFDD",
	"#FFAAEE", "#FFBBEE", "#FFCCEE", "#FFDDEE", "#FFEEEE", "#FFFFEE",
	"#FFAAFF", "#FFBBFF", "#FFCCFF", "#FFDDFF", "#FFEEFF", "#FFFFFF",
	"#CCAAFF", "#CCBBFF", "#CCCCFF", "#CCDDFF", "#CCEEFF", "#CCFFFF",
	"#CCAAEE", "#CCBBEE", "#CCCCEE", "#CCDDEE", "#CCEEEE", "#CCFFEE",
	"#CCAADD", "#CCBBDD", "#CCCCDD", "#CCDDDD", "#CCEEDD", "#CCFFDD",
	"#CCAACC", "#CCBBCC", "#CCCCCC", "#CCDDCC", "#CCEECC", "#CCFFCC",
]
const Ncolors = pastel.length

export default function getRandomPastel(seed) {
	if (seed !== undefined)
		return pastel[seed % Ncolors]
	return pastel[Math.floor(Math.random() * Ncolors)]
}
