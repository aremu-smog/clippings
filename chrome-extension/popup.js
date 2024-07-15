const clipboardDiv = document.querySelector("#clipboard")
const clippingsHistoryList = document.querySelector("#clippings-history-list")
const body = document.querySelector("body")

const splashScreen = document.querySelector("#splash-screen")

window.addEventListener("load", async () => {
	await handleSplashScreen()
})

const handleSplashScreen = async () => {
	await chrome.storage.local.get(["has-seen-splash-screen"]).then(result => {
		const hasResult = Object.keys(result).length > 0

		if (hasResult) {
			body.removeChild(splashScreen)
		} else {
			showSplashScreenAnimation()
		}
	})
}

const showSplashScreenAnimation = () => {
	const contentContainer = splashScreen.querySelector(".content-container")

	contentContainer.innerHTML = `<img src="./assets/clippings.svg" class="logo zoom-in" alt="Clippings" />`

	setTimeout(() => {
		contentContainer.innerHTML = `<p class="intro zoom-in"><b>seamlessly</b> access <br />all copied content</p>`
	}, 2_000)

	setTimeout(async () => {
		contentContainer.innerHTML = ""
		splashScreen.style.opacity = 0

		await chrome.storage.local
			.set({ "has-seen-splash-screen": "true" })
			.then(() => {
				console.log("[has-seen-splash-screen]", "Set successfully")
			})
	}, 4_000)
}
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
