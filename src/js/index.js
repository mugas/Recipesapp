import Search from "./models/Search";
import * as searchView from "./views/searchView";
import { elements, renderLoader, clearLoader } from "./views/base";

/* Global state of the app
 * -Search Object
 * -Current recipe object
 * -Shopping list object
 *- Liked recipe
 */
const state = {};

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
    // Search for recipes
    await state.search.getResults();

    // render  results on Ui
    clearLoader();
    searchView.renderResults(state.search.result);
  }
};

elements.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  controlSearch();
});
