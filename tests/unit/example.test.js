import xo from "../../dist/xo.min";

describe("XO General Tests", () => {
    let context = {};

    beforeAll(() => {
        console.debug = e => { };

        return form({
            model: {
                instance: {
                    data: {
                        tags: ["beer", "pong"]
                    }
                }
            },
            pages: [{
                fields: [
                    { type: "text", name: "text1" },
                    { type: "tags", name: "tags1", value: ["dead", "can", "dance"] },
                    { type: "tags", name: "tags2", bind: "instance.data.tags" },
                    { type: "radiobuttonlist", name: "radio1", items: ["one", "two", "three"] }
                ]
            }]
        }).then(x => {
            context = x
        })
    });

    it("Form Running", () => {
        expect(context.exo).not.toBeNull();
    });

    it("Form has ONE page", () => {
        expect(context.exo.schema.pages.length).toBe(1);
    });

    it("Form field with name test1 is found", () => {
        expect(context.exo.get("text1")).not.toBeNull();
    });

    it("Form field with name test1 has textbox control", () => {
        expect(context.exo.get("text1")._control.htmlElement.type).toBe("text");
    });

    it("Tags are rendered", () => {
        expect(context.exo.get("tags1")._control.value.join(", ")).toBe("dead, can, dance");
    });

    it("Tags are bound", () => {
        expect(context.exo.get("tags2")._control.value.join(", ")).toBe("beer, pong");
    });

    it("Radio renders options", () => {
        expect(context.exo.get("radio1")._control.container.querySelectorAll("input[name]").length).toBe(3);
    });

    it("Form posts correct data", () => {
        
        expect(context.posted.tags2.length).toBe(2);
    });


})

function form(schema) {
    return new Promise((resolve, reject) => {
        xo.form.run(schema, {
            on: {
                renderReady: e => {
                    let context = {
                        exo: e.detail.host,
                        posted: e.detail.host.getFormValues()
                    }
                    console.log(context.posted);

                    resolve(context);
                }
            }
        })
    });
}