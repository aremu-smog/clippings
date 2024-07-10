const clipboardDiv = document.querySelector("#clipboard")
const clipbaordTextarea = document.querySelector("#clipboard-textarea")

window.addEventListener("focus", async () => {
	await triggerOnAction()
})

const truncateText = text => {
	return text.substring(0, 100)
}
const populateClipboarDiv = async () => {
	const clipboardHistory = await getClipboardHistory()
	let htmlTemplate = "<ul class='order-history-list'>"
	await clipboardHistory
		.filter(text => text.trim() !== "")
		.reverse()
		.forEach(item => {
			htmlTemplate += `
		<li data-full-text="${item}" class="order-history-list-item">
		<button>${truncateText(item)}</button>
		</li>`
		})

	htmlTemplate += "</ul>"

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

	await makeItemsCopiable()
}

const makeItemsCopiable = async () => {
	const allClippingsItem = document.querySelectorAll(".order-history-list-item")

	for (const clippingItem of allClippingsItem) {
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
}
