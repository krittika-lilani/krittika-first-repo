// Connect the game to the shared Firebase project and the `dishes` collection.
const firebaseConfig = {
  apiKey: "AIzaSyDMe_hgk7nSMfyIHRS5rJ6uDb4yeJC2ASQ",
  authDomain: "comp-design-46068.firebaseapp.com",
  databaseURL: "https://comp-design-46068-default-rtdb.firebaseio.com",
  projectId: "comp-design-46068",
  storageBucket: "comp-design-46068.firebasestorage.app",
  messagingSenderId: "915582893208",
  appId: "1:915582893208:web:8f2ce17c15285d941ae4ed",
};

firebase.initializeApp(firebaseConfig);
const dishesRef = firebase.database().ref("dishes");

// Cache the page elements used by the ingredient picker, form, and card list.
const ingredientHolders = document.querySelectorAll(".ingredient-holder");
const selectedIngredientsList = document.querySelector(
  "#selected-ingredients-list",
);
const dishForm = document.querySelector("#dish-form");
const dishNameInput = document.querySelector("#dish-name");
const dishNoteInput = document.querySelector("#dish-note");
const addDishButton = document.querySelector("#add-dish-button");
const recipeCards = document.querySelector("#recipe-cards");
let detectedCity = "Unknown location";

// Detect only the visitor's approximate city for the submitted dish metadata.
// If the request fails or returns no city, keep the privacy-safe fallback value.
fetch(
  "https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en",
)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Location detection failed");
    }

    return response.json();
  })
  .then(({ city, locality }) => {
    detectedCity = city || locality || "Unknown location";
  })
  .catch(() => {
    detectedCity = "Unknown location";
  });

// Enable the form fields after two ingredients are selected, then enable the
// submit button once the user has also entered a dish name.
function updateAddDishButton() {
  const selectedCount = document.querySelectorAll(
    ".ingredient-holder.selected",
  ).length;
  const hasEnoughIngredients = selectedCount >= 2;
  const hasDishName = dishNameInput.value.trim().length > 0;

  dishNameInput.disabled = !hasEnoughIngredients;
  dishNoteInput.disabled = !hasEnoughIngredients;
  addDishButton.disabled = !hasEnoughIngredients || !hasDishName;
}

// Rebuild the visible ingredient-name list from the holders currently marked
// with the existing `selected` class.
function updateSelectedIngredients() {
  const selectedNames = Array.from(ingredientHolders)
    .filter((holder) => holder.classList.contains("selected"))
    .map((holder) => holder.dataset.ingredient);

  selectedIngredientsList.replaceChildren(
    ...selectedNames.map((name) => {
      const listItem = document.createElement("li");
      listItem.textContent = name;
      return listItem;
    }),
  );

  updateAddDishButton();
}

// Toggle one ingredient's visual and accessible selected state.
function toggleIngredient(holder) {
  const isSelected = holder.classList.toggle("selected");
  holder.setAttribute("aria-pressed", String(isSelected));
  updateSelectedIngredients();
}

// Turn a dish object from Firebase into a recipe card and place the newest card
// at the top of the sidebar.
function createRecipeCard(dish) {
  const card = document.createElement("article");
  card.className = "recipe-card";

  const title = document.createElement("h2");
  title.textContent = dish.name;
  card.append(title);

  const ingredients = document.createElement("p");
  const ingredientsLabel = document.createElement("span");
  ingredientsLabel.className = "recipe-card__label";
  ingredientsLabel.textContent = "Ingredients: ";
  ingredients.append(ingredientsLabel, dish.ingredients.join(", "));
  card.append(ingredients);

  if (dish.note) {
    const note = document.createElement("p");
    const noteLabel = document.createElement("span");
    noteLabel.className = "recipe-card__label";
    noteLabel.textContent = "Note: ";
    note.append(noteLabel, dish.note);
    card.append(note);
  }

  const location = document.createElement("p");
  location.className = "recipe-card__meta";
  location.textContent = `City: ${dish.city}`;
  card.append(location);

  const time = document.createElement("p");
  time.className = "recipe-card__meta";
  time.textContent = `Local time: ${dish.createdAt}`;
  card.append(time);

  recipeCards.prepend(card);
}

// Firebase emits `child_added` once for every existing dish and again whenever
// a new dish is saved, keeping the sidebar synchronized without duplicate local cards.
dishesRef.on(
  "child_added",
  (snapshot) => {
    createRecipeCard(snapshot.val());
  },
  (error) => {
    console.error("Could not load dishes:", error);
  },
);

// Support ingredient selection with both pointer clicks and keyboard controls.
ingredientHolders.forEach((holder) => {
  holder.addEventListener("click", () => {
    toggleIngredient(holder);
  });

  holder.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleIngredient(holder);
    }
  });
});

// Recheck form validity whenever the required dish name changes.
dishNameInput.addEventListener("input", updateAddDishButton);

// Assemble the current selections and form values into one dish object, then
// save it to Firebase. The realtime listener above creates the visible card.
dishForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const dish = {
    ingredients: Array.from(ingredientHolders)
      .filter((holder) => holder.classList.contains("selected"))
      .map((holder) => holder.dataset.ingredient),
    name: dishNameInput.value.trim(),
    note: dishNoteInput.value.trim(),
    city: detectedCity,
    createdAt: new Date().toLocaleString(),
  };

  console.log(dish);
  dishesRef.push(dish).catch((error) => {
    console.error("Could not save dish:", error);
  });
});
