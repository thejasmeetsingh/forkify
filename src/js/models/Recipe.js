import Axios from "axios";
import { key, proxy } from "../config";

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const result = await Axios(`${proxy}/https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
            this.title = result.data.recipe.title;
            this.author = result.data.recipe.publisher;
            this.img = result.data.recipe.image_url;
            this.url = result.data.recipe.source_url;
            this.ingredients = result.data.recipe.ingredients;
        } catch (error) {
            alert('Something Went Wrong...Please try again later');
        }
    }

    calcTime() {
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];

        const newIngredients = this.ingredients.map(el => {
            // Uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });

            // Remove Parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // Parse ingredients into count, unit and ingredients
            const arrIngredient = ingredient.split(' ');
            const unitIndex = arrIngredient.findIndex(element => unitsShort.includes(element))

            let objIngredient;
            if (unitIndex > -1) {
                // There is a unit
                const arrCount = arrIngredient.slice(0, unitIndex);
                let count;
                if (arrCount === 1) {
                    count = eval(arrIngredient[0].replace('-', '+'));
                } else {
                    count = eval(arrIngredient.slice(0, unitIndex).join('+'));
                }
                objIngredient = {
                    count,
                    unit: arrIngredient[unitIndex],
                    ingredient: arrIngredient.slice(unitIndex + 1).join(' ')
                }
            } else if (parseInt(arrIngredient[0], 10)) {
                // There is no unit, but 1st element is number
                objIngredient = {
                    count: parseInt(arrIngredient[0], 10),
                    unit: '',
                    ingredient: arrIngredient.slice(1).join(' ') 
                }
            } else if (unitIndex === -1) {
                // There is no unit and no number in 1st position
                objIngredient = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            } 

            return objIngredient;
        });
        this.ingredients = newIngredients;
    }

    updateServings(type) {
        // Servings
        const newServings = type ==='dec' ? this.servings - 1 : this.servings + 1;

        // Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    }
}