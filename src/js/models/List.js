import uniqid from 'uniqid';

export default class List {
    constructor() {
        this.items = [];
    }

    addItem(count, unit, ingredient) {
        const item = {
            id: uniqid(),
            count,
            unit,
            ingredient
        }
        this.items = item;
        return item;
    }

    deleteItem(id) {
        let index;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].id === id) {
                index = i;
                break;
            }
        }
        this.items.splice(index, 1);
    }

    updateCount(id, newCount) {
        for (let index = 0; index < this.items.length; index++) {
            if (this.items[index].id === id) {
                this.items[index].count = newCount;
            }            
        }
    }
}