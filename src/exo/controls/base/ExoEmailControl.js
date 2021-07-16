import ExoTextControl from './ExoTextControl';

class ExoEmailControl extends ExoTextControl {

    constructor() {
        super(...arguments);

        this.acceptProperties({
            name: "autolookup", type: Boolean, description: ""
        })

    }

    async render() {
        await super.render();


        if (this.autolookup) {
            this.createEmailLookup()
        }

        return this.container;
    }

    createEmailLookup() {
        const _ = this;

        _.htmlElement.addEventListener("input", e => {
            //if (e.key !== "Enter") {
                let data = [];

                ["@gmail.com", "@outlook.com", "@live.nl", "@yahoo.com", "@hotmail.com"].forEach(a => {
                    data.push(e.target.value.split('@')[0] + a);
                });

                if (data.length > 1) {
                    _.createDataList(_.context.field, data);
                }
                else {
                    _.destroyDataList()
                }
            //}
            // else {
            //     let dl = _.container.querySelector("datalist");
            //     if (dl) {
            //         dl.remove();
            //     }
            //     e.preventDefault();
            // }
        })
    }
}

export default ExoEmailControl;