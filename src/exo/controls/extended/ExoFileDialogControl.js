import ExoDialogControl from './ExoDialogControl';

class ExoFileDialogControl extends ExoDialogControl {
    constructor() {
        super(...arguments);

        this.acceptProperties(

            { name: "fileTypes", type: String | Array, description: 'Array of strings - example: ["image/"]' }

        )
    }

    async render() {
        const me = this;

        await super.render();

        const schema = {
            navigation: "none",
            pages: [
                {
                    fields: [
                        {
                            type: "filedrop",
                            name: "drop",
                            fileTypes: me.fileTypes
                        }
                    ]
                }
            ]
        }

        this.body = await xo.form.run(schema, {
            context: this.context.context,
            on: {
                created: e => {
                    me.exo = e.detail.host;
                }
            }
        });

        return this.container;
    }
}

export default ExoFileDialogControl;