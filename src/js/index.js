import * as recipeView from './views/recipeView';
import * as searchView from './views/searchView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import Recipe from './models/Recipe';
import Search from './models/Search';
import List from './models/List';
import Likes from './models/Likes';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global State of the app
 - Search oject
 - Current recipe object
 - Shopping list object
 - Liked object
*/

const state = {};

// Search Controller
const controlSearch = async () => {
    // Get query from view
    const query = searchView.getInput();

    if (query) {
        // new search object and add to state
        state.search = new Search(query);

        // Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchResults);

        try {
            // Search for recipes
            await state.search.getResult();
            // render results on UI
            clearLoader();
            searchView.renderResult(state.search.recipes);
        } catch (error) {
            alert('Something Went Wrong');
        }
    }
};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.SearchResultPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResult(state.search.recipes, goToPage);
    }
});

// Recipe Controller
const controlRecipe = async () => {
    // Get the ID from URL
    const id = window.location.hash.replace('#', '');

    if (id) {
        // Prepare UI fro Chaneges
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if (state.search) {
            searchView.highlightedSelected(id);
        }

        // Create Recipe Object
        state.recipe = new Recipe(id);

        try {
            // Get Recipe Data and Parse the Ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            
            // Calculate serving and time
            state.recipe.calcTime();
            state.recipe.calcServings();
        } catch (error) {
            alert('Error Processing Recipe!');
        }

        // Render recipe
        clearLoader();
        recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// List Controller
const controlList = () => {
    // create a new list IF there is none yet
    if (!state.list) {
        state.list = new List();
    }

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// Likes Controller
const controlLike = () => {
    if (!state.likes) {
        state.likes = new Likes();
    }

    const currentID = state.recipe.id;

    // User has NOT Liked the current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add to the state
        const newLike = state.likes.addLike(currentID, state.recipe.title, state.recipe.author, state.recipe.img);

        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to the UI List
        likesView.renderLikes(newLike);
    // User has Liked the current recipe
    } else {
        // Remove to the state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like to the UI List
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle Delete event 
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

    // Handle Count Update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value);
        state.list.updateCount(id, val);
    }
});

// Restore liked recipe on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    // Restore Likes
    state.likes.readStorage();

    // toggle likes menu
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => {
        likesView.renderLikes(like);
    });
});

// Handeling Recipe Button Clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredient(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredient(state.recipe); 
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add Ingredients to the shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like Controller
        controlLike();
    }
});

