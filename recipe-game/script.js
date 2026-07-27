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

function toggleIngredient(holder) {
  const isSelected = holder.classList.toggle("selected");
  holder.setAttribute("aria-pressed", String(isSelected));
  updateSelectedIngredients();
}

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

dishesRef.on(
  "child_added",
  (snapshot) => {
    createRecipeCard(snapshot.val());
  },
  (error) => {
    console.error("Could not load dishes:", error);
  },
);

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

dishNameInput.addEventListener("input", updateAddDishButton);

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
