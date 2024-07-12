const clipboardDiv = document.querySelector("#clipboard")
const clippingsHistoryList = document.querySelector("#clippings-history-list")

window.addEventListener("focus", async () => {
	await triggerOnAction()
})

const truncateText = text => {
	const LENGTH_OF_STRING = 100
	let truncatedText = text.substring(0, LENGTH_OF_STRING)
	if (text.length > LENGTH_OF_STRING) {
		truncatedText += "..."
	}
	return truncatedText
}
const populateClipboarDiv = async () => {
	const clipboardHistory = await getClipboardHistory()

	clippingsHistoryList.innerHTML = ""
	await clipboardHistory
		.filter(text => text.trim() !== "")
		.reverse()
		.forEach(async item => {
			const listItem = document.createElement("li")
			listItem.setAttribute("data-full-text", item)
			listItem.setAttribute("class", "order-history-list-item")
			const listItemButton = document.createElement("button")
			listItemButton.innerText = truncateText(item)

			listItem.append(listItemButton)

			clippingsHistoryList.append(listItem)
			await makeClippingCopiable(listItem)
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

	await makeItemsCopiable()
}

const makeClippingCopiable = async clippingItem => {
	const contentToCopy = clippingItem.getAttribute("data-full-text")
	const clippingItemButton = clippingItem.querySelector("button")

	const copyContent = async () => {
		try {
			await navigator.clipboard.writeText(`${contentToCopy}`)
			clippingItemButton.innerText = "Copied!"
			setTimeout(() => {
				clippingItemButton.innerText = truncateText(contentToCopy)
			}, 1000)
		} catch (e) {
			console.warn("Unable to copy text to clipboard", e?.message)
		}
	}
	clippingItem.addEventListener("keyup", async e => {
		if (e.key === "Enter") {
			await copyContent()
		}
	})
	clippingItem.addEventListener("click", async e => {
		await copyContent()
	})
}
