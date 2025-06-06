import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '10m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1100'],
    checks: ['rate>0.98']
  }
};

export default function () {
  // 1. GET all stations
  let stationsRes = http.get('http://localhost:8080/api/stations');
  check(stationsRes, { 'stations: status 200': r => r.status === 200 });

  const stations = JSON.parse(stationsRes.body);
  if (!stations.length) return;

  // Escolhe uma estação aleatória
  const stationId = stations[Math.floor(Math.random() * stations.length)].id;

  // 2. POST /reservations
  const reservationPayload = JSON.stringify({
    userId: 1,              // coloca um ID válido do teu sistema
    chargerId: 1,           // ajustar para um charger real se necessário
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(), // +1h
  });

  const headers = { 'Content-Type': 'application/json' };
  const res = http.post('http://localhost:8080/api/reservations', reservationPayload, { headers });

  check(res, {
    'reservation created': (r) => r.status === 200 || r.status === 201,
  });

  const reservation = res.json();
  const reservationId = reservation?.id;
  if (!reservationId) return;

  // 3. DELETE /reservations/{id}
  const delRes = http.del(`http://localhost:8080/api/reservations/${reservationId}`);
  check(delRes, { 'reservation deleted': r => r.status === 200 || r.status === 204 });

  sleep(1); // simula espera de 1s entre utilizadores
}
