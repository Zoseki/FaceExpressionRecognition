import { initApp } from './init.js';
import { setupTabs } from './tabs.js';
import { handleUpload } from './upload.js';
import { handleWebcam } from './webcam.js';
import { handlePaste } from './paste.js';
import { manageHistory } from './history.js';

// Khởi tạo ứng dụng khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupTabs();
  handleUpload();
  handleWebcam();
  handlePaste();
  manageHistory();  
});