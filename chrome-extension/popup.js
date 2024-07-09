const clipboardDiv = document.querySelector("#clipboard")
const clipbaordTextarea = document.querySelector("#clipboard-textarea")

window.addEventListener("focus", async () => {
	await triggerOnAction()
})

const populateClipboarDiv = async () => {
	const clipboardHistory = await getClipboardHistory()
	let htmlTemplate = "<ol>"
	await clipboardHistory.reverse().forEach(item => {
		htmlTemplate += `<li>${item}</li>`
	})

	htmlTemplate += "</ol>"

	clipboardDiv.innerHTML = htmlTemplate
}

const getClipboardHistory = async () => {
	let clipboardHistory = []
	await chrome.storage.local.get(["clipboard-history"]).then(result => {
		const hasResult = Object.keys(result).length > 0

		if (hasResult) {
			clipboardHistory = JSON.parse(result["clipboard-history"])
		} else {
			console.warn("Nothing available in storage atm")
		}
	})

	return clipboardHistory
}

const triggerOnAction = async () => {
	const clipboardHistory = await getClipboardHistory()
	await navigator.clipboard.readText().then(text => {
		if (!clipboardHistory.includes(text)) {
			chrome.storage.local
				.set({
					"clipboard-history": JSON.stringify([...clipboardHistory, text]),
				})
				.then(() => {
					console.log("[clipboard-history]", "Set successfully")
				})
		}
	})

	await populateClipboarDiv()
}
