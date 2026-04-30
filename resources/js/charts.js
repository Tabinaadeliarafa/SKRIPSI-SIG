import {
  Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend,
  DoughnutController, ArcElement,
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend, DoughnutController, ArcElement);

const data = window.__VIZ_DATA__ || [];
const labels = data.map((r) => r.nama);
const banjir = data.map((r) => Number(r.banjir));
const longsor = data.map((r) => Number(r.longsor));

function gradient(ctx, from, to) {
  const g = ctx.createLinearGradient(0, 0, 600, 0);
  g.addColorStop(0, from);
  g.addColorStop(1, to);
  return g;
}

const elBar = document.getElementById('chart-banjir-bar');
if (elBar) {
  new Chart(elBar, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Desa terdampak banjir',
        data: banjir,
        backgroundColor: (c) => gradient(c.chart.ctx, '#1a4870', '#b8d4ec'),
        borderRadius: 4,
      }],
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  });
}

const elDonut = document.getElementById('chart-donut');
if (elDonut) {
  const tBanjir = banjir.reduce((a, b) => a + b, 0);
  const tLongsor = longsor.reduce((a, b) => a + b, 0);
  new Chart(elDonut, {
    type: 'doughnut',
    data: {
      labels: ['Banjir', 'Longsor'],
      datasets: [{ data: [tBanjir, tLongsor], backgroundColor: ['#2d6ca8', '#c0522a'] }],
    },
    options: { plugins: { legend: { position: 'bottom' } }, cutout: '65%' },
  });
}

const elGrouped = document.getElementById('chart-grouped');
if (elGrouped) {
  new Chart(elGrouped, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Banjir', data: banjir, backgroundColor: '#2d6ca8', borderRadius: 4 },
        { label: 'Longsor', data: longsor, backgroundColor: '#c0522a', borderRadius: 4 },
      ],
    },
    options: {
      plugins: { legend: { position: 'top' } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { ticks: { autoSkip: false, maxRotation: 60, minRotation: 45 } } },
    },
  });
}
