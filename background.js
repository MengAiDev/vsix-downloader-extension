// 处理下载请求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadVsix') {
    chrome.downloads.download({
      url: request.url,
      filename: request.filename,
      conflictAction: 'uniquify'
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        sendResponse({ 
          success: false, 
          error: chrome.runtime.lastError.message 
        });
      } else {
        sendResponse({ success: true, downloadId });
      }
    });
    
    // 保持消息通道打开以发送异步响应
    return true;
  }
});
