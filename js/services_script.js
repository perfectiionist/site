// Добавление количества объектов на info__panel
const totalCountElement = document.getElementById("totalCount");
totalCountElement.textContent = hydroObjects.length;

// api ключ
const API_KEY = "c53753cf-2db3-419f-932f-03022a0a8693";

const PROJECTION = "wgs84_mercator";

const bounds = L.latLngBounds(hydroObjects.map((obj) => [obj.lat, obj.lng]));

const INITIAL_ZOOM = 3;

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
    minZoom: 1,
    tileSize: 256,
  }
).addTo(map);

// Кнопка сброса zoom и центра позиционирования
const resetControl = L.control({ position: "topright" });

resetControl.onAdd = function () {
  const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
  div.innerHTML = `<img class="btn-reset-zoom" src="./images/reset.png" style="width: 30px; height: 30px; cursor: pointer;"/>`;

  div.onclick = function (e) {
    e.preventDefault();
    map.fitBounds(bounds, { padding: [30, 30] });
  };

  return div;
};

resetControl.addTo(map);

// Логотип Яндекса
const yandexLogo = L.control({ position: "bottomright" });
yandexLogo.onAdd = function () {
  const div = L.DomUtil.create("div");
  div.innerHTML =
    '<a href="https://yandex.ru/maps" target="_blank"><img src="./images/yndex_logo_ru.png" alt="Яндекс Карты" style="height: 40px;"></a>';
  return div;
};
yandexLogo.addTo(map);

// Кастомная иконка
const customIcon = L.icon({
  iconUrl: "./images/hydro-pin.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// ФИЛЬТРАЦИЯ ПО ОРГАНИЗАЦИЯМ

// Функция получения уникальных организаций
function getUniqueOrgs() {
  const orgs = [...new Set(hydroObjects.map((obj) => obj.org))];
  return orgs.sort();
}

// Создаём массив для хранения маркеров
const markers = [];

// Добавление всех маркеров с сохранением информации об организации
hydroObjects.forEach((obj) => {
  const marker = L.marker([obj.lat, obj.lng], {
    icon: customIcon,
    org: obj.org,
    name: obj.name,
  });

  // HOVER — краткая подсказка
  marker.bindTooltip(
    `
      <div class="custom-tooltip-name">${obj.name}</div>
      <div class="custom-tooltip-org">${obj.org}</div>
    `,
    {
      permanent: false,
      direction: "top",
      offset: [-2, -30],
      opacity: 0.9,
      className: "custom-tooltip",
    }
  );

  // CLICK — подробная информация
  marker.bindPopup(`
    <div>
      <div class="popup-header">
        <h3>${obj.name}</h3>
      </div>
      <div class="popup-body">
        <div class="popup-row">
          <div class="popup-label">Организация:</div>
          <div class="popup-value">${obj.org || "—"}</div>
        </div>
        <div class="popup-row">
          <div class="popup-label">Версия БИНГ:</div>
          <div class="popup-value">${obj.versionBING}</div>
        </div>
        <div class="popup-row">
          <div class="popup-label">Адрес:</div>
          <div class="popup-value">${obj.address || "—"}</div>
        </div>
      </div>
      <div class="popup-footer">
        Кликните в любом месте, чтобы закрыть
      </div>
    </div>
  `);

  marker.addTo(map);
  markers.push(marker);
});

// Добавление контрола фильтрации
const organisationSelect = L.control({ position: "topleft" });

organisationSelect.onAdd = function () {
  const div = L.DomUtil.create("div", "organisation-filter");
  div.innerHTML = `
    <select id="orgFilter" style="padding: 5px 10px; border-radius: 4px; border: 1px solid #ccc; background: white; margin-left: 10px; cursor: pointer;">
      <option value="all">Все организации (${hydroObjects.length})</option>
      ${getUniqueOrgs()
        .map((org) => `<option value="${org}">🏢 ${org}</option>`)
        .join("")}
    </select>
  `;
  return div;
};

organisationSelect.addTo(map);

// Функция обновления счётчика на панели
function updateCounter(selectedOrg) {
  let visibleCount;
  let labelText;

  if (selectedOrg === "all") {
    visibleCount = markers.length;
    labelText = "Всего организаций:";
  } else {
    visibleCount = markers.filter((m) => m.options?.org === selectedOrg).length;
    labelText = `${selectedOrg}:`;
  }

  if (totalCountElement) {
    const labelElement = document.querySelector(".info__panel");
    if (labelElement) {
      labelElement.childNodes[0].textContent = `${labelText} `;
    }
    totalCountElement.textContent = visibleCount;
  }
}

// Обработчик фильтрации
document.addEventListener("DOMContentLoaded", () => {
  const orgFilter = document.getElementById("orgFilter");

  if (orgFilter) {
    orgFilter.addEventListener("change", (e) => {
      const selectedOrg = e.target.value;

      markers.forEach((marker) => {
        const markerOrg = marker.options?.org;

        if (selectedOrg === "all") {
          if (!map.hasLayer(marker)) {
            marker.addTo(map);
          }
        } else {
          if (markerOrg === selectedOrg) {
            if (!map.hasLayer(marker)) {
              marker.addTo(map);
            }
          } else {
            if (map.hasLayer(marker)) {
              marker.removeFrom(map);
            }
          }
        }
      });

      // Обновляем счётчик
      updateCounter(selectedOrg);
    });
  }
});

// Автоматическая подгонка карты под все объекты (только при загрузке)
map.fitBounds(bounds, { padding: [30, 30] });

console.log(`✅ Карта загружена. Добавлено ${hydroObjects.length} маркеров.`);
