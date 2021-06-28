const xo = require("../../dist/xo.cjs.js").default;

const observe = jest.fn();
const unobserve = jest.fn();
window.IntersectionObserver = jest.fn(() => ({ observe, unobserve }))

console.debug = e => { };
console.warn = e => { };
console.error = e => { };

describe("Controls Tests", () => {

    let controls = [];

    beforeAll(() => {
        xo.form.factory.build().then(x => {
            for(var i in x.library){
                controls.push(i);
            }
            console.log("COUNT:" + controls.length)
        });
    });

//TODO dynamic repeat over all controls 

    // test.each([
    //     controls,
    //     controls,
    //     controls,
    //   ])('.add(%i, %i)', (a, b, expected) => {
    //     //expect(a + b).toBe(expected);
    //     return form({ type: a, name: a }).then(x => expect(x.querySelector("[data-field-type]").getAttribute("data-field-type")).toBe(a));
    //   });

    it("Checkbox", () => {
        const a = "checkbox"
        return form({ type: a, name: a }).then(x => expect(x.querySelector("[data-field-type]").getAttribute("data-field-type")).toBe(a));
    });

    it("Listview", () => {
        const a = "listview"
        return form({ type: a, name: a }).then(x => expect(x.querySelector("[data-field-type]").getAttribute("data-field-type")).toBe(a));
    });

    it("name", () => {
        const a = "name"
        return form({ type: a, name: a }).then(x => expect(x.querySelector("[data-field-type]").getAttribute("data-field-type")).toBe(a));
    });

    it("image", () => {
        const a = "image"
        return form({ type: a, name: a }).then(x => expect(x.querySelector("[data-field-type]").getAttribute("data-field-type")).toBe(a));
    });
})



function form(fieldSchema) {
    const schema = { pages: [{ fields: [fieldSchema] }] }
    let elm = xo.form.run(schema);
    elm.then(x => {
        console.log(x)
    })
    return elm
}