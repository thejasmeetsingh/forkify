import Axios from "axios";
import { key, proxy } from "../config";

export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResult() {
        try {
            const result = await Axios(`${proxy}/https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
            //console.log(result);
            this.recipes = result.data.recipes;
            //console.log(this.recipes);
        } catch (error) {
            alert(`Error: ${error}`);
        }
    }
}



