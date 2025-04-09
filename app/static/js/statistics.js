import { showNotification } from "./utils.js";
// import Chart from "https://cdn.jsdelivr.net/npm/chart.js@4.4.3/+esm";

let emotionsChart = null;
let pieChart = null; // Biến để lưu biểu đồ tròn

// Hàm cập nhật giao diện thống kê
export function updateStatistics(data) {
  const statisticsSummary = document.getElementById("statisticsSummary");
  const ctx = document.getElementById("emotionsChart").getContext("2d");
  const { total_faces, emotions_count, emotions_percentage } = data;

  // Hiển thị tóm tắt với biểu đồ tròn
  statisticsSummary.innerHTML = `
    <p class="text-lg font-semibold mb-2">Tổng số khuôn mặt: ${total_faces}</p>
    <canvas id="emotionsPieChart" class="max-w-full"></canvas>
  `;

  // Lấy context của canvas biểu đồ tròn
  const pieCtx = document.getElementById('emotionsPieChart').getContext('2d');

  // Hủy biểu đồ tròn cũ nếu có
  if (pieChart) {
    pieChart.destroy();
  }

  // Vẽ biểu đồ tròn
  pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: Object.keys(emotions_percentage),
      datasets: [{
        label: 'Phần trăm',
        data: Object.values(emotions_percentage),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',  // Angry
          'rgba(54, 162, 235, 0.6)',  // Disgust
          'rgba(255, 206, 86, 0.6)',  // Fear
          'rgba(75, 192, 192, 0.6)',  // Happy
          'rgba(153, 102, 255, 0.6)', // Neutral
          'rgba(255, 159, 64, 0.6)',  // Sad
          'rgba(199, 199, 199, 0.6)', // Surprise
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Phần trăm cảm xúc'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: ${value}%`;
            }
          }
        }
      }
    }
  });

  // Hủy biểu đồ cũ nếu có
  if (emotionsChart) {
    emotionsChart.destroy();
  }

  // Vẽ biểu đồ mới
  emotionsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(emotions_count),
      datasets: [
        {
          label: "Số lượng",
          data: Object.values(emotions_count),
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)", // Angry
            "rgba(54, 162, 235, 0.6)", // Disgust
            "rgba(255, 206, 86, 0.6)", // Fear
            "rgba(0, 255, 100, 0.6)", // Happy
            "rgba(199, 199, 199, 0.6)", // Neutral
            "rgba(28, 43, 255, 0.6)", // Sad
            "rgba(153, 102, 255, 0.6)", // Surprise
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)", // Angry
            "rgba(54, 162, 235, 1)", // Disgust
            "rgba(255, 206, 86, 1)", // Fear
            "rgba(0, 255, 100, 1)", // Happy
            "rgba(199, 199, 199, 1)", // Neutral
            "rgba(28, 43, 255, 1)", // Sad
            "rgba(153, 102, 255, 1)", // Surprise
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Số lượng",
          },
        },
        x: {
          title: {
            display: true,
            text: "Cảm xúc",
          },
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Thống kê cảm xúc",
        },
      },
    },
  });
}

export function displayStatistics() {
  const periodFilter = document.getElementById("periodFilter");
  const refreshButton = document.getElementById("refreshStatistics");

  // Hàm lấy và hiển thị dữ liệu thống kê
  async function fetchStatistics() {
    const period = periodFilter.value;
    refreshButton.disabled = true;
    refreshButton.innerHTML = 'Đang tải...';
    try {
      const response = await fetch(`/face-expression/statistics?period=${period}`);
      if (!response.ok) {
        throw new Error('Không thể lấy dữ liệu thống kê');
      }
      const data = await response.json();
      updateStatistics(data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu thống kê:', error);
      showNotification('Đã xảy ra lỗi khi lấy dữ liệu thống kê', 'error');
    } finally {
      refreshButton.disabled = false;
      refreshButton.innerHTML = 'Làm mới';
    }
  }

  // Làm mới dữ liệu khi thay đổi bộ lọc hoặc nhấn nút "Làm mới"
  periodFilter.addEventListener("change", fetchStatistics);
  refreshButton.addEventListener("click", fetchStatistics);
}
