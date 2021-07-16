import ExoInputControl from "./ExoInputControl";

class ExoFileUploadControl extends ExoInputControl{
    
    async render(){
        await super.render();
        this.container.classList.add("exf-std-lbl");
        return this.container
    }

}

export default ExoFileUploadControl;