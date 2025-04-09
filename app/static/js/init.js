import { initIndexedDB, loadHistoryFromDB } from './db.js';
import { updateHistoryGrid } from './history.js';

export function initApp() {
  initIndexedDB()
    .then(() => {
      console.log('IndexedDB đã sẵn sàng');
      return loadHistoryFromDB();
    })
    .then(() => {
      if (checkLocalStorage() && (!window.detectionHistory || window.detectionHistory.length === 0)) {
        try {
          const savedHistory = localStorage.getItem('faceDetectionHistory');
          if (savedHistory) {
            window.detectionHistory = JSON.parse(savedHistory);
            console.log('Đã tải lịch sử từ localStorage:', window.detectionHistory.length, 'mục');
            Promise.all(window.detectionHistory.map((item) => saveHistoryToDB(item))).then(() => {
              console.log('Đã đồng bộ lịch sử từ localStorage vào IndexedDB');
              updateHistoryGrid();
            });
          } else {
            updateHistoryGrid();
          }
        } catch (error) {
          console.error('Lỗi khi tải lịch sử từ localStorage:', error);
          updateHistoryGrid();
        }
      } else {
        updateHistoryGrid();
      }
    })
    .catch((error) => {
      console.error('Lỗi khi khởi tạo hoặc tải từ IndexedDB:', error);
      if (checkLocalStorage()) {
        try {
          const savedHistory = localStorage.getItem('faceDetectionHistory');
          if (savedHistory) {
            window.detectionHistory = JSON.parse(savedHistory);
            console.log('Đã tải lịch sử từ localStorage (fallback):', window.detectionHistory.length, 'mục');
          }
        } catch (error) {
          console.error('Lỗi khi tải lịch sử từ localStorage:', error);
        }
      }
      updateHistoryGrid();
    });
}

function checkLocalStorage() {
  try {
    const testKey = 'test_localStorage';
    localStorage.setItem(testKey, 'test');
    const testResult = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    return testResult === 'test';
  } catch (e) {
    console.warn('localStorage không khả dụng:', e);
    return false;
  }
}