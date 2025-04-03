const defaultEnable = true;
const defaultRedirectUrl = "https://www.google.com";
const defaultBlockList = ["https://www.facebook.com"];
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ enable: defaultEnable }, () => {
    console.log("Default Enable saved:", defaultEnable);
  });
  chrome.storage.sync.set({ redirectUrl: defaultRedirectUrl }, () => {
    console.log("Default redirectUrl saved:", defaultRedirectUrl);
  });
  chrome.storage.sync.set({ blockList: defaultBlockList }, () => {
    console.log("Default block list saved:", defaultBlockList);
  });
});

chrome.webNavigation.onCommitted.addListener((details) => {
  const originUrl = new URL(details.url).origin;
  const { frameId } = details;
  let redirectTarget = "";
  let isEnable = true;

  chrome.storage.sync.get("redirectUrl", (data) => {
    redirectTarget = data.redirectUrl || "";
  });

  chrome.storage.sync.get("enable", (data) => {
    const { enable } = data;
    isEnable = enable;
  });

  chrome.storage.sync.get("blockList", (data) => {
    const blockList = data.blockList || [];
    if (blockList.includes(originUrl) && frameId === 0 && isEnable) {
      chrome.tabs.update(details.tabId, { url: redirectTarget });
    }
  });
});
