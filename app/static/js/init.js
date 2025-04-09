import { loadHistoryFromAPI } from './api.js';
import { updateHistoryGrid } from './history.js';

export function initApp() {
  loadHistoryFromAPI()
    .then((history) => {
      window.detectionHistory = history;
      console.log('Đã tải lịch sử từ API:', window.detectionHistory.length, 'mục');
      updateHistoryGrid();
    })
    .catch((error) => {
      console.error('Lỗi khi tải lịch sử:', error);
      window.detectionHistory = [];
      updateHistoryGrid();
    });
}