const xo = require("../../dist/xo.cjs.js").default;


describe("XO form basic Tests", () => {
    let context = {};

    beforeAll(() => {
        console.debug = e => { };

        return form({

            pages: [
                {
                    fields: [
                        { type: "text", name: "text1", value: "hello" },
                    ]
                },
                {
                    fields: [
                        { type: "dropdown", name: "drop1", items: [{ name: "None", value: 0 }, "1", "2"], value: "2" },
                    ]
                }

            ]
        }).then(x => {
            context = x
        })
    });

    it("Form Running", () => {
        expect(context.exo).not.toBeNull();
    });

    it("Form has TWO pages", () => {
        expect(context.exo.schema.pages.length).toBe(2);
    });

    it("Form field with name text1 is found", () => {
        expect(context.exo.get("text1")).not.toBeNull();
    });

    it("Form field with name drop1 has dropdown control", () => {
        expect(context.exo.get("drop1").htmlElement.type).toBe("select-one");
    });


})

function form(schema) {
    return new Promise((resolve, reject) => {
        xo.form.run(schema, {
            on: {
                interactive: e => {
                    let context = {
                        exo: e.detail.host,
                        posted: e.detail.host.getFormValues()
                    }
                    resolve(context);
                }
            }
        })
    });
}