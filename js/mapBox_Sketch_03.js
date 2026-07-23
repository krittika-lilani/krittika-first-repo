/*
 * Mapbox map for New York City restaurant locations.
 */

var mapboxSketch03 = function () {
  mapboxgl.accessToken =
    "pk.eyJ1IjoibWFwYm94a3JpdHRzIiwiYSI6ImNtcmdzaTFjNzFnZ28zMHB2Mmx5aWVwbDEifQ.ao9zL5h6g_KlQ11ztij8Gg";

  const map3 = new mapboxgl.Map({
    container: "mapbox-container",
    style: "mapbox://styles/mapbox/light-v11",
    center: [-74.006, 40.7128],
    zoom: 10,
    pitch: 0,
    bearing: 0,
  });

  map3.addControl(new mapboxgl.NavigationControl(), "top-right");
  map3.addControl(new mapboxgl.FullscreenControl(), "top-right");
  map3.addControl(
    new mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: "metric",
    }),
    "bottom-left",
  );

  map3.on("load", () => {
    map3.getStyle().layers.forEach((layer) => {
      const layerId = layer.id.toLowerCase();

      if (layer.type === "background") {
        map3.setPaintProperty(layer.id, "background-color", "#f3d8b6");
      }

      if (
        layer.type === "fill" &&
        (layerId.includes("land") ||
          layerId.includes("landuse") ||
          layerId.includes("park"))
      ) {
        map3.setPaintProperty(layer.id, "fill-color", "#f3d8b6");
      }

      if (layerId.includes("water")) {
        if (layer.type === "fill") {
          map3.setPaintProperty(layer.id, "fill-color", "#fff4dc");
        }

        if (layer.type === "line") {
          map3.setPaintProperty(layer.id, "line-color", "#fff4dc");
        }
      }

      if (
        layer.type === "line" &&
        (layerId.includes("road") ||
          layerId.includes("street") ||
          layerId.includes("bridge") ||
          layerId.includes("tunnel"))
      ) {
        map3.setPaintProperty(layer.id, "line-color", "#ffffff");
      }

      if (layer.type === "symbol") {
        map3.setPaintProperty(layer.id, "text-color", "#6f2d24");
        map3.setPaintProperty(layer.id, "text-halo-color", "#fff4dc");
      }
    });

    fetch("data/turkish-restaurants.geojson")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load restaurant data: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        const seenCamis = new Set();
        const uniqueRestaurants = data.features.filter((feature) => {
          const camis = feature.properties.camis;

          if (seenCamis.has(camis)) {
            return false;
          }

          seenCamis.add(camis);
          return true;
        });

        map3.addSource("turkish-restaurants", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: uniqueRestaurants,
          },
        });

        map3.addLayer({
          id: "turkish-restaurants",
          type: "circle",
          source: "turkish-restaurants",
          paint: {
            "circle-radius": 6,
            "circle-color": "#f4e5c3",
            "circle-stroke-color": "#741f1f",
            "circle-stroke-width": 1.5,
          },
        });

        map3.on("mouseenter", "turkish-restaurants", () => {
          map3.getCanvas().style.cursor = "pointer";
        });

        map3.on("mouseleave", "turkish-restaurants", () => {
          map3.getCanvas().style.cursor = "";
        });

        map3.on("click", "turkish-restaurants", (event) => {
          const properties = event.features[0].properties;
          const address = [
            properties.building,
            properties.street,
            properties.zipcode,
          ]
            .filter(Boolean)
            .join(" ");

          const escapeHtml = (value) =>
            String(value || "Not available")
              .replaceAll("&", "&amp;")
              .replaceAll("<", "&lt;")
              .replaceAll(">", "&gt;")
              .replaceAll('"', "&quot;")
              .replaceAll("'", "&#039;");

          new mapboxgl.Popup()
            .setLngLat(event.lngLat)
            .setHTML(`
              <strong>${escapeHtml(properties.dba)}</strong>
              <p>${escapeHtml(address)}</p>
              <p>${escapeHtml(properties.boro)}</p>
              <p>Inspection grade: ${escapeHtml(properties.grade)}</p>
            `)
            .addTo(map3);
        });
      })
      .catch((error) => {
        console.error(error);
      });
  });
};

mapboxSketch03();
