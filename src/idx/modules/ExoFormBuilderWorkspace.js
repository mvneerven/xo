class ExoFormBuilderWorkspace {

    constructor(){
        this._data = {};

        let storedData = localStorage.getItem("xo-workspace");
        
        if(storedData){
            console.debug("ExoFormBuilderWorkspace", "Restored workspace from local storage 'xo-workspace'");

            try{
                this._data = JSON.parse(storedData)
            }
            catch(ex){};
        }
    }

    get(name){
        return this._data[name];
    }

    set (name, value){
        this._data[name] = value;
        this._save();
    }

    _save(){
        console.debug("ExoFormBuilderWorkspace", "Store current workspace in local storage 'xo-workspace'")
        localStorage.setItem("xo-workspace", this.toString())
    }

    toString(){
        return JSON.stringify(this._data, null, 2);
    }
}

export default ExoFormBuilderWorkspace;