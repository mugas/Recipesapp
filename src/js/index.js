import Search from "./models/Search";
import Recipe from "./models/Recipe";
import * as searchView from "./views/searchView";
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
  // const query = searchView.getInput(); // todo
  const query = "pizza";

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

// Testing
window.addEventListener("load", (e) => {
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

    // Create new recipe object
    state.recipe = new Recipe(id);
    // testing
    window.r = state.recipe;

    try {
      // get recipe data

      await state.recipe.getRecipe();

      // calculate time and servings
      state.recipe.calcTime();
      state.recipe.calcServings();

      // render recipe
      console.log(state.recipe);
    } catch (err) {
      alert("Error processing recipe!");
    }
  }
};

// window.addEventListener("hashchange", controlRecipe);
// window.addEventListener("load", controlRecipe);
// or
["haschange", "load"].forEach((event) =>
  window.addEventListener(event, controlRecipe)
);
