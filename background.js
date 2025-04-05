const defaultEnable = true;
const defaultRedirectUrl = "https://www.google.com";
const defaultBlockList = ["https://www.facebook.com"];
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    enable: defaultEnable,
    redirectUrl: defaultRedirectUrl,
    blockList: defaultBlockList,
  });
});

chrome.webNavigation.onCommitted.addListener((details) => {
  const originUrl = new URL(details.url).origin;
  const { frameId } = details;
  chrome.storage.sync.get(["redirectUrl", "enable", "blockList"], (data) => {
    const { redirectUrl, enable, blockList } = data;
    if (blockList.includes(originUrl) && frameId === 0 && enable) {
      chrome.tabs.update(details.tabId, { url: redirectUrl || "" });
    }
  });
});
