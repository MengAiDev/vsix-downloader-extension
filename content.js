// 创建下载按钮并注入到页面
function createDownloadButton() {
  // 创建按钮容器
  const container = document.createElement('div');
  container.id = 'vsix-download-container';
  container.style.marginTop = '20px';
  container.style.padding = '10px';
  container.style.backgroundColor = '#f5f5f5';
  container.style.borderRadius = '4px';
  container.style.border = '1px solid #ddd';
  
  // 创建标题
  const title = document.createElement('h3');
  title.textContent = 'VSIX 下载器';
  title.style.marginBottom = '10px';
  title.style.fontSize = '16px';
  
  // 创建按钮
  const button = document.createElement('button');
  button.id = 'download-vsix-btn';
  button.textContent = '下载最新版本 VSIX';
  button.style.padding = '8px 16px';
  button.style.backgroundColor = '#0078d4';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  button.style.fontWeight = 'bold';
  button.style.transition = 'background-color 0.3s';
  
  button.onmouseover = () => button.style.backgroundColor = '#005a9e';
  button.onmouseout = () => button.style.backgroundColor = '#0078d4';
  
  // 创建状态信息
  const status = document.createElement('div');
  status.id = 'vsix-download-status';
  status.style.marginTop = '10px';
  status.style.fontSize = '14px';
  status.style.color = '#666';
  
  // 组装元素
  container.appendChild(title);
  container.appendChild(button);
  container.appendChild(status);
  
  // 插入到页面中 - 放在插件信息区域
  const infoSection = document.querySelector('.ux-section-row');
  if (infoSection) {
    infoSection.parentNode.insertBefore(container, infoSection.nextSibling);
  }
  
  // 添加按钮点击事件
  button.addEventListener('click', startDownload);
}

// 获取插件信息
function getExtensionInfo() {
  // 从URL获取插件ID
  const params = new URLSearchParams(window.location.search);
  const itemName = params.get('itemName');
  
  if (!itemName) {
    return null;
  }
  
  const [publisher, name] = itemName.split('.');
  
  // 获取版本号
  const versionElement = document.querySelector('.version');
  const version = versionElement ? versionElement.textContent.trim().split(' ')[1] : '';
  
  return {
    publisher,
    name,
    version,
    fullName: itemName
  };
}

// 开始下载
async function startDownload() {
  const button = document.getElementById('download-vsix-btn');
  const status = document.getElementById('vsix-download-status');
  
  if (!button || !status) return;
  
  // 禁用按钮并更新状态
  button.disabled = true;
  button.textContent = '下载中...';
  status.textContent = '准备下载...';
  
  // 获取插件信息
  const extension = getExtensionInfo();
  
  if (!extension || !extension.publisher || !extension.name || !extension.version) {
    status.textContent = '错误：无法获取插件信息';
    button.textContent = '重试';
    button.disabled = false;
    return;
  }
  
  // 构建下载URL
  const downloadUrl = `https://marketplace.visualstudio.com/_apis/public/gallery/publishers/${extension.publisher}/vsextensions/${extension.name}/${extension.version}/vspackage`;
  
  // 发送下载请求到后台脚本
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'downloadVsix',
      url: downloadUrl,
      filename: `${extension.fullName}-${extension.version}.vsix`
    });
    
    if (response.success) {
      status.textContent = `下载成功: ${extension.fullName} v${extension.version}`;
      status.style.color = '#107c10';
    } else {
      status.textContent = '下载失败: ' + (response.error || '未知错误');
      status.style.color = '#d13438';
    }
  } catch (error) {
    status.textContent = '通信错误: ' + error.message;
    status.style.color = '#d13438';
  }
  
  button.textContent = '下载完成';
  setTimeout(() => {
    button.textContent = '下载最新版本 VSIX';
    button.disabled = false;
  }, 3000);
}

// 页面加载完成后初始化按钮
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createDownloadButton);
} else {
  createDownloadButton();
}
