//Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

//Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCxJmsRjuVsPEiM4Xue-IRI3gHxVfMEfks",
  authDomain: "lsc-sit.firebaseapp.com",
  databaseURL: "https://lsc-sit-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lsc-sit",
  storageBucket: "lsc-sit.firebasestorage.app",
  messagingSenderId: "45711166234",
  appId: "1:45711166234:web:34155ba32189f118dd7aa3"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

//วันที่ปัจจุบัน
document.getElementById("date").innerText = new Date().toLocaleDateString('th-TH');

//ฟังก์ชันตรวจสถานะ
function getTempStatus(temp) {
  if (temp >= 2 && temp <= 8) {
    return { text: "ปกติ", class: "status-normal" };
  } else {
    return { text: "ผิดปกติ", class: "status-danger" };
  }
}

function getHumidityStatus(humidity) {
  if (humidity >= 30 && humidity <= 60) {
    return { text: "ปกติ", class: "status-normal" };
  } else {
    return { text: "ผิดปกติ", class: "status-danger" };
  }
}

//Chart.js
const ctx = document.getElementById('dataChart').getContext('2d');
const myChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Temperature (°C)',
        data: [],
        borderColor: 'red',
        borderWidth: 2,
        fill: false,
        tension: 0.3
      },
      {
        label: 'Humidity (%)',
        data: [],
        borderColor: 'blue',
        borderWidth: 2,
        fill: false,
        tension: 0.3
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: 'white' } }
    },
    scales: {
      x: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.2)' } },
      y: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.2)' } }
    }
  }
});

// ดึงข้อมูลจาก Firebase
const sensorRef = ref(database, "sensor/data");

onValue(sensorRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    let temp = data.temperature;
    let humidity = data.humidity;

    // แสดงค่า
    document.getElementById("temp-value").innerText = temp + " °C";
    document.getElementById("humidity-value").innerText = humidity + " %";

    // อัปเดตสถานะ
    let tempStatus = getTempStatus(temp);
    let humidityStatus = getHumidityStatus(humidity);

    let tempStatusElement = document.getElementById("temp-status");
    tempStatusElement.innerText = tempStatus.text;
    tempStatusElement.className = tempStatus.class;

    let humidityStatusElement = document.getElementById("humidity-status");
    humidityStatusElement.innerText = humidityStatus.text;
    humidityStatusElement.className = humidityStatus.class;

    // อัปเดตกราฟ
    let timeLabel = data.timestamp ? data.timestamp : new Date().toLocaleTimeString();
    myChart.data.labels.push(timeLabel);
    myChart.data.datasets[0].data.push(temp);
    myChart.data.datasets[1].data.push(humidity);

    // เก็บข้อมูลล่าสุดไม่เกิน 10 จุด
    if (myChart.data.labels.length > 10) {
      myChart.data.labels.shift();
      myChart.data.datasets[0].data.shift();
      myChart.data.datasets[1].data.shift();
    }

    myChart.update();
  }
});
