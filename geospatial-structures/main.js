const map = new maplibregl.Map({
  container: "map",
  style: "style-pink-teal.json",
  center: [-73.97144, 40.70491],
  zoom: 10,
});

map.addControl(new maplibregl.NavigationControl());

const recommendationMarkers = [];
let recommendationsData;
const categoryInputs = document.querySelectorAll(
  '.category-filter input[type="checkbox"]',
);
const allCategoriesButton = document.querySelector(".category-filter__all");
const neighborhoodSelect = document.querySelector("#neighborhood-filter");
const boroughButtons = document.querySelectorAll(".borough-filter button");
const viewButtons = document.querySelectorAll(".view-toggle button");
const listView = document.querySelector(".list-view");
const listContent = document.querySelector(".list-view__content");

function getSelectedBorough() {
  return document.querySelector(".borough-filter button.is-active").dataset
    .borough;
}

function getNeighborhoodGroup(neighborhood) {
  if (!neighborhood) {
    return "";
  }

  if (
    neighborhood === "Bay Ridge" ||
    neighborhood === "Belmont" ||
    neighborhood === "Breezy Point-Belle Harbor-Rockaway Park-Broad Channel" ||
    neighborhood === "Great Kills-Eltingville" ||
    neighborhood === "Snug Harbor"
  ) {
    return "";
  }

  if (neighborhood.startsWith("Upper West Side")) {
    return "Upper West Side";
  }

  if (neighborhood.startsWith("Harlem")) {
    return "Harlem";
  }

  if (neighborhood.startsWith("Washington Heights")) {
    return "Washington Heights";
  }

  if (neighborhood.startsWith("Upper East Side")) {
    return "Upper East Side";
  }

  if (neighborhood === "Williamsburg" || neighborhood === "East Williamsburg") {
    return "Williamsburg";
  }

  if (neighborhood.startsWith("Bedford-Stuyvesant")) {
    return "Bedford-Stuyvesant";
  }

  if (neighborhood.startsWith("Bushwick")) {
    return "Bushwick";
  }

  if (neighborhood.startsWith("Crown Heights")) {
    return "Crown Heights";
  }

  if (
    neighborhood === "Astoria (Central)" ||
    neighborhood === "Astoria (East)-Woodside (North)" ||
    neighborhood === "Queensbridge-Ravenswood-Dutch Kills"
  ) {
    return "Astoria";
  }

  if (
    neighborhood === "Sunset Park (Central)" ||
    neighborhood === "Sunset Park (West)" ||
    neighborhood === "Sunset Park (East)-Borough Park (West)"
  ) {
    return "Sunset Park";
  }

  if (neighborhood === "Downtown Brooklyn-DUMBO-Boerum Hill") {
    return "Downtown Brooklyn";
  }

  if (neighborhood === "Carroll Gardens-Cobble Hill-Gowanus-Red Hook") {
    return "South Brooklyn";
  }

  if (neighborhood === "Financial District-Battery Park City") {
    return "Financial District";
  }

  if (neighborhood === "Tribeca-Civic Center") {
    return "Tribeca";
  }

  if (neighborhood === "Stuyvesant Town-Peter Cooper Village") {
    return "Stuytown";
  }

  if (neighborhood === "Prospect Lefferts Gardens-Wingate") {
    return "Prospect Lefferts";
  }

  if (neighborhood === "Midtown South-Flatiron-Union Square") {
    return "Midtown South";
  }

  if (neighborhood === "SoHo-Little Italy-Hudson Square") {
    return "SoHo";
  }

  return neighborhood;
}

function getFilterState() {
  return {
    selectedCategories: new Set(
      [...categoryInputs]
        .filter((input) => input.checked)
        .map((input) => input.value),
    ),
    selectedBorough: getSelectedBorough(),
    selectedNeighborhood: neighborhoodSelect.value,
  };
}

function matchesFilters(feature, filterState) {
  const featureCategories = (feature.properties.Categories || "")
    .split("|")
    .map((category) => category.trim());
  const matchesCategory = featureCategories.some((category) =>
    filterState.selectedCategories.has(category),
  );
  const matchesBorough =
    !filterState.selectedBorough ||
    feature.properties.Borough === filterState.selectedBorough;
  const matchesNeighborhood =
    !filterState.selectedNeighborhood ||
    feature.properties.Neighborhood_Group === filterState.selectedNeighborhood;

  return matchesCategory && matchesBorough && matchesNeighborhood;
}

function appendCardField(card, label, value) {
  const field = document.createElement("p");
  const fieldLabel = document.createElement("span");
  fieldLabel.textContent = `${label}: `;
  field.append(fieldLabel, value);
  card.append(field);
}

function renderList(filteredRecommendations) {
  listContent.replaceChildren();

  if (!filteredRecommendations.length) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "list-view__empty";
    emptyMessage.textContent = "no recommendations match these filters.";
    listContent.append(emptyMessage);
    return;
  }

  filteredRecommendations.forEach(({ feature }) => {
    const properties = feature.properties;
    const card = document.createElement("article");
    card.className = "recommendation-card";

    const title = document.createElement("h2");
    title.textContent = properties.Title || "Untitled place";
    card.append(title);

    appendCardField(card, "category", properties.Categories || "not provided");
    appendCardField(
      card,
      "neighborhood",
      properties.Neighborhood_Group || properties.Neighborhood || "not provided",
    );

    if (properties.Note) {
      appendCardField(card, "note", properties.Note);
    }

    if (properties.URL) {
      const link = document.createElement("a");
      link.href = properties.URL;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "open in google maps";
      card.append(link);
    }

    listContent.append(card);
  });
}

function applyCategoryFilters() {
  const filterState = getFilterState();
  const filteredRecommendations = [];

  recommendationMarkers.forEach((recommendation) => {
    const { marker, feature } = recommendation;
    const isVisible = matchesFilters(feature, filterState);

    marker.getElement().style.display = isVisible ? "" : "none";

    if (isVisible) {
      filteredRecommendations.push(recommendation);
    } else {
      marker.getPopup().remove();
    }
  });

  renderList(filteredRecommendations);

  const allSelected = [...categoryInputs].every((input) => input.checked);
  allCategoriesButton.classList.toggle("is-active", allSelected);
  allCategoriesButton.setAttribute("aria-pressed", String(allSelected));
}

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const showList = button.dataset.view === "list";
    listView.hidden = !showList;

    viewButtons.forEach((viewButton) => {
      const isActive = viewButton === button;
      viewButton.classList.toggle("is-active", isActive);
      viewButton.setAttribute("aria-pressed", String(isActive));
    });

    if (showList) {
      applyCategoryFilters();
    }
  });
});

categoryInputs.forEach((input) => {
  input.addEventListener("change", applyCategoryFilters);
});

allCategoriesButton.addEventListener("click", () => {
  categoryInputs.forEach((input) => {
    input.checked = true;
  });
  applyCategoryFilters();
});

neighborhoodSelect.addEventListener("change", applyCategoryFilters);

boroughButtons.forEach((button) => {
  button.addEventListener("click", () => {
    boroughButtons.forEach((boroughButton) => {
      const isActive = boroughButton === button;
      boroughButton.classList.toggle("is-active", isActive);
      boroughButton.setAttribute("aria-pressed", String(isActive));
    });

    populateNeighborhoodFilter(
      recommendationsData ? recommendationsData.features : [],
      button.dataset.borough,
    );
    applyCategoryFilters();
  });
});

function populateNeighborhoodFilter(features, borough = "") {
  neighborhoodSelect.replaceChildren();

  const allNeighborhoodsOption = document.createElement("option");
  allNeighborhoodsOption.value = "";
  allNeighborhoodsOption.textContent = "all neighborhoods";
  neighborhoodSelect.append(allNeighborhoodsOption);

  const neighborhoods = [
    ...new Set(
      features
        .filter(
          (feature) => !borough || feature.properties.Borough === borough,
        )
        .map((feature) => feature.properties.Neighborhood_Group)
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));

  neighborhoods.forEach((neighborhood) => {
    const option = document.createElement("option");
    option.value = neighborhood;
    option.textContent = neighborhood;
    neighborhoodSelect.append(option);
  });
}

function updateMarkerBadgeColors(swatch) {
  const mapContainer = map.getContainer();
  mapContainer.style.setProperty("--marker-badge-halo", swatch.dataset.landColor);
  mapContainer.style.setProperty(
    "--marker-badge-ring",
    swatch.dataset.roadColor,
  );
  document.documentElement.style.setProperty(
    "--mood-land",
    swatch.dataset.landColor,
  );
  document.documentElement.style.setProperty(
    "--mood-road",
    swatch.dataset.roadColor,
  );
}

updateMarkerBadgeColors(document.querySelector(".map-mood__swatch.is-active"));

function restoreRecommendationsSource() {
  if (recommendationsData && !map.getSource("recommendations")) {
    map.addSource("recommendations", {
      type: "geojson",
      data: recommendationsData,
    });
  }
}

map.on("style.load", restoreRecommendationsSource);

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value ?? "";
  return element.innerHTML;
}

function createPopup(feature) {
  const properties = feature.properties;
  const title = escapeHtml(properties.Title || "Untitled place");
  const categories = escapeHtml(properties.Categories || "Not provided");
  const note = properties.Note
    ? `<p><strong>Note:</strong> ${escapeHtml(properties.Note)}</p>`
    : "";
  const url = properties.URL;
  const mapsLink = url
    ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Open in Google Maps</a>`
    : "Google Maps link unavailable";

  return new maplibregl.Popup({ offset: 18 }).setHTML(`
      <h3>${title}</h3>
      <p><strong>Categories:</strong> ${categories}</p>
      ${note}
      <p>${mapsLink}</p>
    `);
}

map.on("load", async () => {
  try {
    const response = await fetch("data/nyc-recommendations.geojson");

    if (!response.ok) {
      throw new Error(`Could not load recommendations: ${response.status}`);
    }

    recommendationsData = await response.json();

    recommendationsData.features.forEach((feature) => {
      feature.properties.Neighborhood_Group = getNeighborhoodGroup(
        feature.properties.Neighborhood,
      );
    });

    restoreRecommendationsSource();
    populateNeighborhoodFilter(
      recommendationsData.features,
      getSelectedBorough(),
    );

    recommendationsData.features.forEach((feature) => {
      const markerElement = document.createElement("button");
      markerElement.className = "recommendation-marker";
      markerElement.type = "button";
      markerElement.textContent = feature.properties.Emoji || "📍";
      markerElement.setAttribute(
        "aria-label",
        feature.properties.Title || "Recommendation",
      );

      const marker = new maplibregl.Marker({
        element: markerElement,
        anchor: "center",
      })
        .setLngLat(feature.geometry.coordinates)
        .setPopup(createPopup(feature))
        .addTo(map);

      recommendationMarkers.push({ marker, feature });
    });

    applyCategoryFilters();
  } catch (error) {
    console.error(error);
  }
});

document.querySelectorAll(".map-mood__swatch").forEach((swatch) => {
  swatch.addEventListener("click", () => {
    if (swatch.classList.contains("is-active")) {
      return;
    }

    const camera = {
      center: map.getCenter(),
      zoom: map.getZoom(),
      bearing: map.getBearing(),
      pitch: map.getPitch(),
    };

    map.once("style.load", () => map.jumpTo(camera));
    updateMarkerBadgeColors(swatch);
    map.setStyle(swatch.dataset.style);

    document.querySelectorAll(".map-mood__swatch").forEach((button) => {
      const isActive = button === swatch;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  });
});
