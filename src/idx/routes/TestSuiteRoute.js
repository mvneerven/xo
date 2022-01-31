const DOM = xo.dom;
import uiTests from '../../../tests/ui/ui-tests.js';

const stringify = form => {
    return JSON.stringify(form, (key, value) => {
        if (key.startsWith("_")) {
            return;
        }
        return value;

    }, 2);
}

class TestsRoute extends xo.route {
    menuTitle = "Tests"

    title = "XO Test Suite";

    menuIcon = "ti-check-box";

    constructor() {
        super(...arguments)

        this.testDiv = document.createElement("div")
        this.testDiv.classList.add("ui-tests-panel")
        document.body.appendChild(this.testDiv);

        this.testGroups = Object.entries(uiTests).map(entry => {
            let name = entry[0];
            let group = entry[1];
            return {
                name: name,
                ...group,
                value: name,
                description: `${Object.keys(group.tests).length} tests`,
                checked: true
            }
        })
    }

    async render(path) {
        this.showTestGroupsAndTests()
        await this.showSideForm();
    }

    showTestGroupsAndTests() {
        const me = this;
        let groups = this.testGroups;
        let ul = document.createElement("ul");
        ul.classList.add("ui-test-results")

        for (let group of groups) {
            let li = document.createElement("li");
            li.setAttribute("data-id", group.name);
            li.innerHTML = `${group.name}`;
            li.title = stringify(group.form)

            let groupUl = document.createElement("ul");
            li.appendChild(groupUl);

            Object.entries(group.tests).forEach(entry => {
                let key = entry[0]
                let li = document.createElement("li");
                li.setAttribute("data-id", key);
                li.innerHTML = `<span data-test="${key}" class="ti-info test-item"></span>&nbsp;` + key;
                groupUl.appendChild(li)
            });
            ul.appendChild(li)
        }

        me.area.add(ul)
    }


    async showSideForm() {
        const me = this;
        me.side.clear();

        let count = 0;
        me.testGroups.map(a => {
            count += Object.keys(a.tests).length;
        })

        let sideForm = await xo.form.run({

            submit: false,
            model: {
                instance: {
                    data: {
                        groups: this.testGroups.map(t => {
                            return t.name
                        }),
                        tests: this.testGroups.map(g => { return g.value })
                    }
                }
            },
            pages: [
                {
                    legend: "Test Groups",
                    fields: [
                        {
                            type: "info",
                            title: "Statistics",
                            body: `${count} tests`

                        },
                        {
                            type: "group",
                            fields: [
                                {
                                    type: "button",
                                    caption: "Run tests",
                                    icon: "ti-arrow-right",
                                    class: "cta",
                                    actions: [
                                        {
                                            do: {
                                                trigger: ["run"]
                                            }
                                        }
                                    ]
                                },
                                {
                                    type: "button",
                                    caption: "Reset",
                                    icon: "ti-close",
                                    class: "cta",
                                    actions: [
                                        {
                                            do: {
                                                trigger: ["reset"]
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                        
                    ]
                }
            ]
        }, {
            on: {
                schemaParsed: e => {
                    this.exo = e.detail.host
                },
                run: e => {
                    me.run(e.detail.host)
                },
                reset: e=>{
                    me.reset();
                }
            }
        });

        sideForm.classList.add("pad");
        this.side.add(sideForm)
    }

    clear() {
        this.area.clear()
        this.side.clear();
        this.testDiv.innerHTML = ""
    }

    get area() {
        return pwa.UI.areas.main
    }

    get side() {
        return pwa.UI.areas.panel
    }

    async run() {
        const me = this;      

        me.reset();

        for (let group of me.testGroups) {

            let result = await me.runTestGroup(group);
            // let failedCount = result.filter(r => {
            //     return r.passed === false
            // }).length;

            let groupLi = me.getListItem(group.name)

            groupLi.title = stringify(group.form)

            for (let item of result) {
                let span = me.getListItem(item.key).querySelector(".test-item");
                span.classList.remove("ti-close", "ti-check", "ti-info");

                span.classList.add(item.passed ? "ti-check" : "ti-close")
            }
        }
    }

    reset(){
        this.area.element.querySelectorAll(".test-item").forEach(i => {
            i.classList.remove("ti-check", "ti-close");
            i.classList.add("ti-info")
        })
    }

    getListItem(key) {
        return this.area.element.querySelector(`[data-id="${key}"]`);
    }

    async runTestGroup(testGroup) {
        const me = this;

        let tests = Object.entries(testGroup.tests);

        const runIndividualTest = async (test, context, exo) => {
            try {
                return await test(context, exo)
            }
            catch (ex) {
                return ex;
            }
        }

        let results = [];
        let i = 0;
        me.testDiv.innerHTML = ""

        this.currentForm = await this.form(testGroup.form);
        this.currentForm.container.style.opacity = "0";
        me.testDiv.appendChild(this.currentForm.container);

        for (const task of tests) {
            let key = task[0];
            let test = task[1]
            let result = await runIndividualTest(test, me, this.currentForm)

            i++;
            if (result instanceof Error) {
                results.push({
                    passed: false,
                    error: result,
                    test: test.toString(),
                    reason: result,
                    key: key
                })
            }

            else if (!result) {
                results.push({
                    passed: false,
                    test: test.toString(),
                    key: key
                })
            }
            else {
                results.push({
                    passed: true,
                    test: test.toString(),
                    key: key
                })
            }
        }
        return results
    }

    wait(ms) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, ms);
        })
    }

    async waitFor(selector, limit = 1000) {
        const me = this;
        let elm;

        return new Promise(async resolve => {
            await xo.core.waitFor(() => {
                elm = me.currentForm.container.querySelector(selector)
                return elm
            }, limit);
            resolve(elm)
        })
    }

    get(selector) {
        return this.currentForm.container.querySelector(selector)
    }

    async form(schema) {
        return new Promise(async (resolve, reject) => {
            let exo;
            await xo.form.run(schema, {
                on: {
                    renderReady: e => {
                        exo = e.detail.host
                    }
                }
            })
            resolve(exo);
        });
    }
}

export default TestsRoute;