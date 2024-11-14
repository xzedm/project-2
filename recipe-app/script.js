const apiKey = "f1d4c68a9ffc47e7babac2f19dd99dc6"; // api key

// auto-suggest search functionality
async function suggestRecipes() {
    const query = document.getElementById("search").value;
    const suggestionsDiv = document.getElementById("suggestions");
    suggestionsDiv.innerHTML = '';
  
    if (query.length > 2) {
      const response = await fetch(`https://api.spoonacular.com/recipes/autocomplete?query=${query}&number=5&apiKey=${apiKey}`);
      const data = await response.json();
  
      data.forEach(recipe => {
        const suggestion = document.createElement("div");
        suggestion.classList.add("suggestion-item");
        suggestion.innerText = recipe.title;
        
        // on click, set the input field value, trigger search, and clear suggestions
        suggestion.onclick = () => {
          document.getElementById("search").value = recipe.title;  // set selected suggestion as input value
          searchRecipes(recipe.title);  
          suggestionsDiv.innerHTML = '';  // clear suggestions
        };
  
        suggestionsDiv.appendChild(suggestion);
      });
    }
  }
  

// search for recipes
async function searchRecipes(query) {
  const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=6&apiKey=${apiKey}`);
  const data = await response.json();

  displayRecipes(data.results);
}


// display recipes in grid
async function displayRecipes(recipes) {
  const recipeGrid = document.getElementById("recipe-grid");
  const recipesHeading = document.querySelector(".recipe-section .section-name");

  recipeGrid.innerHTML = ''; // clear existing recipes

  if (recipes.length > 0) {
    recipesHeading.style.display = "block"; // show the heading only if recipes are found
  } else {
    recipesHeading.style.display = "none"; // hide if no recipes are found
  }

  // Loop through each recipe and fetch its preparation time
  for (const recipe of recipes) {

    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");

    recipeCard.innerHTML = `
      <img src="https://spoonacular.com/recipeImages/${recipe.id}-312x231.jpg" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <button onclick="openRecipe(${recipe.id})">View Recipe</button>
      <button onclick="addToFavorites(${recipe.id}, '${recipe.title}'); event.stopPropagation();">Add to Favorites</button>
    `;
    
    recipeGrid.appendChild(recipeCard);
  }
}



// fetch and display recipe details
async function openRecipe(recipeId) {
  const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=true&apiKey=${apiKey}`);
  const recipe = await response.json();

  document.getElementById("recipe-name").innerText = recipe.title;
  document.getElementById("ingredients-list").innerHTML = recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('');
  document.getElementById("instructions-list").innerHTML = recipe.analyzedInstructions[0]?.steps.map(step => `<li>${step.step}</li>`).join('') || "<li>No instructions available</li>";
  document.getElementById("nutrition-info").innerText = `Calories: ${recipe.nutrition.nutrients[0]?.amount} | Protein: ${recipe.nutrition.nutrients[1]?.amount}g | Fat: ${recipe.nutrition.nutrients[2]?.amount}g`;

  document.getElementById("recipe-modal").style.display = "block";
}

function closeModal() {
  document.getElementById("recipe-modal").style.display = "none";
}

// add to favorites using localStorage
function addToFavorites(recipeId, recipeName) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.some(fav => fav.id === recipeId)) {
    favorites.push({ id: recipeId, name: recipeName });
    localStorage.setItem("favorites", JSON.stringify(favorites));
    alert(`${recipeName} added to favorites!`);
  } else {
    alert(`${recipeName} is already in favorites.`);
  }
  loadFavorites();
}

// load favorites from localStorage
function loadFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const favoritesList = document.getElementById("favorites-list");
  const favoritesHeading = document.getElementById("favorites-heading");
  favoritesList.innerHTML = '';

  // show the favorites heading only if there are favorites
  if (favorites.length > 0) {
    favoritesHeading.style.display = "block";
  } else {
    favoritesHeading.style.display = "none";
  }

  favorites.forEach(fav => {
    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");
    recipeCard.innerHTML = `
      <img src="https://spoonacular.com/recipeImages/${fav.id}-312x231.jpg">
      <h3>${fav.name}</h3>
      <button onclick="removeFromFavorites(${fav.id})">Remove</button>
      <button onclick="openRecipe(${fav.id})">View Recipe</button>
    `;
    favoritesList.appendChild(recipeCard);
  });
}



function removeFromFavorites(recipeId) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(fav => fav.id !== recipeId);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  loadFavorites();
}

// load favorites when page loads
window.onload = loadFavorites;
