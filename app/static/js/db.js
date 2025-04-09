let db = null;
const DB_NAME = "FaceDetectionHistory";
const DB_VERSION = 1;
const STORE_NAME = "detectionHistory";

export function initIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "timestamp" });
        console.log("Đã tạo object store mới");
      }
    };
    request.onsuccess = (event) => {
      db = event.target.result;
      console.log("Đã kết nối thành công đến IndexedDB");
      resolve(db);
    };
    request.onerror = (event) => {
      console.error("Lỗi khi mở IndexedDB:", event.target.error);
      reject(event.target.error);
    };
  });
}

export function loadHistoryFromDB() {
  if (!db) {
    console.error("IndexedDB chưa được khởi tạo khi cố gắng tải lịch sử");
    return Promise.reject(new Error("IndexedDB chưa được khởi tạo"));
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = (event) => {
        const items = event.target.result;
        console.log(`Đã tải ${items.length} mục lịch sử từ IndexedDB`);
        window.detectionHistory = items.sort(
          (a, b) => b.timestamp - a.timestamp
        );
        resolve(items);
      };
      request.onerror = (event) => {
        console.error("Lỗi khi tải lịch sử từ IndexedDB:", event.target.error);
        reject(event.target.error);
      };
    } catch (error) {
      console.error("Lỗi khi tải lịch sử từ IndexedDB:", error);
      reject(error);
    }
  });
}

export function saveHistoryToDB(historyItem) {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error("IndexedDB chưa được khởi tạo");
      return reject(new Error("IndexedDB chưa được khởi tạo"));
    }
    try {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(historyItem);
      request.onsuccess = () => {
        console.log(
          "Đã lưu thành công mục lịch sử vào IndexedDB:",
          historyItem.timestamp
        );
        resolve();
      };
      request.onerror = (event) => {
        console.error(
          "Lỗi khi lưu mục lịch sử vào IndexedDB:",
          event.target.error
        );
        reject(event.target.error);
      };
    } catch (error) {
      console.error("Lỗi khi lưu mục lịch sử vào IndexedDB:", error);
      reject(error);
    }
  });
}

export function deleteHistoryItemFromDB(timestamp) {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error("IndexedDB chưa được khởi tạo");
      return reject(new Error("IndexedDB chưa được khởi tạo"));
    }
    try {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(timestamp);
      request.onsuccess = () => {
        console.log("Đã xóa mục lịch sử có timestamp:", timestamp);
        resolve();
      };
      request.onerror = (event) => {
        console.error("Lỗi khi xóa mục lịch sử:", event.target.error);
        reject(event.target.error);
      };
    } catch (error) {
      console.error("Lỗi khi xóa mục lịch sử:", error);
      reject(error);
    }
  });
}

export function clearAllHistory() {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error("IndexedDB chưa được khởi tạo");
      return reject(new Error("IndexedDB chưa được khởi tạo"));
    }
    try {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => {
        console.log("Đã xóa tất cả lịch sử từ IndexedDB");
        if (checkLocalStorage()) {
          try {
            localStorage.removeItem("faceDetectionHistory");
            console.log("Đã xóa lịch sử từ localStorage");
          } catch (e) {
            console.warn("Không thể xóa localStorage:", e);
          }
        }
        resolve();
      };
      request.onerror = (event) => {
        console.error("Lỗi khi xóa tất cả lịch sử:", event.target.error);
        reject(event.target.error);
      };
    } catch (error) {
      console.error("Lỗi khi xóa tất cả lịch sử:", error);
      reject(error);
    }
  });
}

function checkLocalStorage() {
  try {
    const testKey = "test_localStorage";
    localStorage.setItem(testKey, "test");
    const testResult = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    return testResult === "test";
  } catch (e) {
    console.warn("localStorage không khả dụng:", e);
    return false;
  }
}
