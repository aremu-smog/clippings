window.addEventListener("copy", async () => {
	console.log("Something copied in the dom")
	await triggerOnAction()
})

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
