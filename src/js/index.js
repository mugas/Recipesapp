import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesViews from "./views/likesViews";
import { elements, renderLoader, clearLoader } from "./views/base";

/* Global state of the app
 * -Search Object
 * -Current recipe object
 * -Shopping list object
 *- Liked recipe
 */
const state = {};

//! !Search Controller
const controlSearch = async () => {
  // get the query from the view
  const query = searchView.getInput(); // todo

  if (query) {
    // new search object and add to state
    state.search = new Search(query);
    // Prepare Ui for results

    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try {
      // Search for recipes
      await state.search.getResults();

      // render  results on Ui
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (err) {
      alert("Something wrong with the search");
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

//! !Recipe controller

const controlRecipe = async () => {
  // get id from url
  const id = window.location.hash.replace("#", "");
  console.log(id);
  if (id) {
    // prepare Ui for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight selected search item

    if (state.search) searchView.highlightSelected(id);

    // Create new recipe object
    state.recipe = new Recipe(id);

    try {
      // get recipe data and parseIngredients

      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // calculate time and servings
      state.recipe.calcTime();
      state.recipe.calcServings();

      // render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (err) {
      console.log(err);
      alert("Error processing recipe!");
    }
  }
};

// window.addEventListener("hashchange", controlRecipe);
// window.addEventListener("load", controlRecipe);
// or
["hashchange", "load"].forEach((event) =>
  window.addEventListener(event, controlRecipe)
);

/**
 * List Controller
 */

const controlList = () => {
  // Create a new list if there is none yet
  if (!state.list) state.list = new List();
  // Add each ingredient to the list and Ui
  state.recipe.ingredients.forEach((el) => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

// Handle delete and update list items events
elements.shopping.addEventListener("click", (e) => {
  const id = e.target.closest(".shopping__item").dataset.itemid;

  // Handle the delete button
  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    // Delete from state
    state.list.deleteItem(id);
    // Delete from Ui
    listView.deleteItem(id);

    // Handle the count update
  } else if (e.target.matches(".shopping__count-value")) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});

/**
 * Like Controller
 */

const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentId = state.recipe.id;

  // user has not yet liked current recipe
  if (!state.likes.isLiked(currentId)) {
    // Add like to the state
    const newLike = state.likes.addLike(
      currentId,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    // Toggle the like button
    likesViews.toggleLikeBtn(true);
    // Add like to Ui list
    likesViews.renderLike(newLike);
    // user has liked current recipe
  } else {
    // Remove like from the state
    state.likes.deleteLike(currentId);
    // Toggle the like button
    likesViews.toggleLikeBtn(false);
    // Remove like fron Ui list
    likesViews.deleteLike(currentId);
  }
  likesViews.toggleLikeMenu(state.likes.getNumberLikes());
};

// Restore likes recipes on page load

window.addEventListener("load", () => {
  state.likes = new Likes();

  // Restore Likes
  state.likes.readStorage();

  // Toggle like menu button
  likesViews.toggleLikeMenu(state.likes.getNumberLikes());

  // Render the existing likes
  state.likes.likes.forEach((like) => likesViews.renderLike(like));
});

// Handling recipe button clicks
elements.recipe.addEventListener("click", (e) => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    // Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      console.log("ola");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    // Increase button is clicked
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
    console.log("hello");
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    // Add ingredient to shopping List
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    // Like controller
    controlLike();
  }
});
