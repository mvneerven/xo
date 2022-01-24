import ExoListControl from './ExoListControl';

// Renders a single select / dropdown list
class ExoDropdownListControl extends ExoListControl {
    constructor() {
        super(...arguments);       
        this.htmlElement = document.createElement('select');
        this.htmlElement.setAttribute("size", "1");
    }

    async render() {
        await super.render();
        this._rendered = false;
        let f = this.context.field;
        const tpl = /*html*/`<option class="{{class}}" {{selected}} value="{{value}}">{{name}}</option>`;
        await this.populateList(this.htmlElement, tpl);
        
        this.htmlElement.value = this.value;
        this.container.classList.add("exf-input-group", "exf-std-lbl");
        this._rendered = true;
        return this.container;
    }

    set value(data){
        this._value = data;
        
        //if(this.rendered){
            this.htmlElement.value = data;
            
       // }
            
        
    }

    get value(){
        if(this.rendered)
            return this.htmlElement.value;
        
        return this._value;
    }
}

export default ExoDropdownListControl;