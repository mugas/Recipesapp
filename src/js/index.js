import Search from "./models/Search";

/* Global state of the app
 * -Search Object
 * -Current recipe object
 * -Shopping list object
 *- Liked recipe
 */
const state = {};

const search = new Search("pizza");
console.log(search);
search.getResults();
