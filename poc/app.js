const clipboardDiv = document.querySelector("#clipboard")
const clipbaordTextarea = document.querySelector("#clipboard-textarea")

const clipboardHistory = []

window.addEventListener("focus", async () => {
	await navigator.clipboard.readText().then(text => {
		if (!clipboardHistory.includes(text)) {
			clipboardHistory.push(text)
		}
	})

	await populateClipboarDiv()
})

window.addEventListener("copy", async () => {
	await navigator.clipboard.readText().then(text => {
		if (!clipboardHistory.includes(text)) {
			clipboardHistory.push(text)
		}
	})

	await populateClipboarDiv()
})

const populateClipboarDiv = async () => {
	let htmlTemplate = "<ol>"
	clipboardHistory.forEach(item => {
		htmlTemplate += `<li>${item}</li>`
	})

	htmlTemplate += "</ol>"

	clipboardDiv.innerHTML = htmlTemplate
}
