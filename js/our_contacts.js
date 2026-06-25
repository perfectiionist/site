// api ключ
const API_KEY = "c53753cf-2db3-419f-932f-03022a0a8693";

const PROJECTION = "wgs84_mercator";

const bounds = L.latLngBounds(office.map((obj) => [obj.lat, obj.lng]));

const INITIAL_ZOOM = 5;

// Инициализация карты
const map = L.map("map", {
  crs: L.CRS.EPSG3395,
  center: bounds.getCenter(),
  zoom: INITIAL_ZOOM,
  zoomControl: true,
});

// ZOOM
map.zoomControl.remove();
L.control.zoom({ position: "topright" }).addTo(map);

// Добавление подложки (Тайлов)
L.tileLayer(
  `https://tiles.api-maps.yandex.ru/v1/tiles/?apikey=${API_KEY}&l=map&lang=ru_RU&projection=${PROJECTION}&x={x}&y={y}&z={z}&scale=2`,
  {
    maxZoom: 19,
    minZoom: 5,
    tileSize: 256,
  }
).addTo(map);

// Кнопка сброса zoom и центра позиционирования
const resetControl = L.control({ position: "topright" });

resetControl.onAdd = function () {
  const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
  div.innerHTML = `<img class="btn-reset-zoom" src="/site/images/reset.png" style="width: 30px; height: 30px; cursor: pointer;"/>`;

  div.onclick = function (e) {
    e.preventDefault();
    map.fitBounds(bounds, { padding: [30, 30] });
  };

  return div;
};

resetControl.addTo(map);

// Логотип Яндекса
// const yandexLogo = L.control({ position: "bottomright" });
// yandexLogo.onAdd = function () {
//   const div = L.DomUtil.create("div");
//   div.innerHTML =
//     '<a href="https://yandex.ru/maps" target="_blank"><img src="/site/images/yndex_logo_ru.png" alt="Яндекс Карты" style="height: 40px;"></a>';
//   return div;
// };
// yandexLogo.addTo(map);

// Кастомная иконка
const customIcon = L.icon({
  iconUrl: "/site/images/map-marker.svg",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Создаём массив для хранения маркеров
const markers = [];

// Добавление всех маркеров с сохранением информации об организации
office.forEach((obj) => {
  const marker = L.marker([obj.lat, obj.lng], {
    icon: customIcon,
  });

  marker.addTo(map);
  markers.push(marker);
});

// Автоматическая подгонка карты под все объекты (только при загрузке)
map.fitBounds(bounds, { padding: [30, 30] });

console.log(`✅ Карта загружена. Добавлено ${office.length} маркеров.`);
