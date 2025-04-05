document.addEventListener("DOMContentLoaded", function () {
  // enable?
  const enableButton = document.getElementById("enable-button");
  chrome.storage.sync.get("enable", function (result) {
    const { enable = true } = result;
    enableButton.checked = enable;
  });
  enableButton.addEventListener("change", () => {
    chrome.storage.sync.set({ enable: enableButton.checked });
  });

  // redirect
  const addRedirectButton = document.querySelector(".redirect-button");
  const addRedirectInput = document.getElementById("redirect-input");
  const redirectUrlContent = document.querySelector(".redirect-url-content");
  const redirectUrlDelete = document.querySelector(".redirect-url-delete");
  const redirectUrlGroup = document.querySelector(".redirect-url-group");
  chrome.storage.sync.get("redirectUrl", function (result) {
    const { redirectUrl } = result;
    if (redirectUrl) {
      redirectUrlContent.textContent = redirectUrl;
    }
    updateDeleteButtonVisibility();
  });

  addRedirectButton.addEventListener("click", () => {
    const rawUrl = addRedirectInput.value.trim();
    if (!rawUrl) return;
    if (!isValidUrl(rawUrl)) return;
    const originUrl = new URL(rawUrl).origin;
    redirectUrlContent.textContent = originUrl;
    chrome.storage.sync.set({ redirectUrl: originUrl });
    updateDeleteButtonVisibility();
    addRedirectInput.value = "";
  });

  redirectUrlDelete.addEventListener("click", () => {
    redirectUrlContent.textContent = "";
    chrome.storage.sync.set({ redirectUrl: "" });
    updateDeleteButtonVisibility();
  });

  function updateDeleteButtonVisibility() {
    const hasContent = redirectUrlContent.textContent.trim().length > 0;

    redirectUrlGroup.style.display = hasContent ? "flex" : "none";
    redirectUrlDelete.style.display = hasContent ? "inline-block" : "none";
    addRedirectButton.style.display = hasContent ? "none" : "";
    addRedirectInput.style.display = hasContent ? "none" : "";
  }
  updateDeleteButtonVisibility();

  // block list
  const addBlockButton = document.querySelector(".add-block-button");
  const addInput = document.getElementById("add-input");
  const urlList = document.querySelector(".block-url-list");
  let blockUrlList = [];

  chrome.storage.sync.get("blockList", function (result) {
    const { blockList } = result;
    if (blockList.length !== 0) {
      blockList.forEach((url) => addUrlToList(url));
    }
  });

  addBlockButton.addEventListener("click", addBlockUrl);
  function addBlockUrl() {
    const url = addInput.value.trim();
    if (!isValidUrl(url)) return;

    if (url) {
      addUrlToList(url);
      saveListToStorage();
      addInput.value = "";
    }
  }

  function addUrlToList(url) {
    const urlOrigin = new URL(url).origin;
    if (blockUrlList.includes(urlOrigin)) {
      alert("URL is already in the block list.");
      return;
    }
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = urlOrigin;

    const button = document.createElement("button");
    button.textContent = "X";
    button.addEventListener("click", function () {
      removeUrl(li);
    });

    li.appendChild(span);
    li.appendChild(button);
    urlList.appendChild(li);
    blockUrlList.push(urlOrigin);
  }

  function removeUrl(target) {
    const url = target.firstElementChild.textContent;
    blockUrlList = blockUrlList.filter((item) => item !== url);
    target.remove();
    saveListToStorage();
  }

  function saveListToStorage() {
    const blockList = Array.from(urlList.children).map(
      (li) => li.firstElementChild.innerText
    );
    chrome.storage.sync.set({ blockList });
  }

  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (error) {
      alert("Invalid URL");
      return false;
    }
  }
});
