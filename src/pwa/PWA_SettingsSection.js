import Core from "./Core";

class PWA_SettingsSection{
    
    title = "";
    
    model = {}

    constructor(){
        
        this.events = new Core.Events(this);

    }

    
}

export default PWA_SettingsSection;