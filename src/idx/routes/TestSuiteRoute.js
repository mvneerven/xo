const DOM = xo.dom;
import uiTests from '../../../tests/ui/ui-tests.js';

class TestsRoute extends xo.route {
    menuTitle = "Tests"

    title = "XO Test Suite";

    menuIcon = "ti-check-box";

    constructor() {
        super(...arguments)

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

        document.data = null;

        this.showSideForm();
        this.showMessage({
            title: 'XO Test Suite',
            body: "Select the tests on the right and press 'Run tests'"
        })
    }

    showMessage(data) {
        this.area.add(DOM.parseHTML(/*html*/`
            <div>
                <h3>${data.title}</h3>
                <p>
                    ${data.body}
                </p>
            </div>
        `))
    }

    async showSideForm() {
        const me = this;
        me.side.clear();

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
                    fields: [
                        {
                            type: "checkboxlist",
                            view: "block",
                            bind: "#/data/tests",

                            items: this.testGroups.map(t => {
                                return {
                                    name: t.name,
                                    value: t.name,
                                    description: t.description
                                }
                            }),

                        },
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
                        }
                    ]
                }
            ]
        }, {
            on: {
                run: e => {
                    me.run(e.detail.host)
                }
            }
        });
        this.side.add(sideForm)
    }

    clear() {
        this.area.clear()
        this.side.clear()
    }

    get area() {
        return pwa.UI.areas.main
    }

    get side() {
        return pwa.UI.areas.panel
    }

    async run(exo) {
        const me = this;
        me.area.clear();
        let selectedGroups = exo.getInstance("data").groups;

        let ul = document.createElement("ul");
        ul.classList.add("ui-test-results")

        let accumulated = {
            passed: 0,
            failed: 0
        }

        const resultIcon = result => {
            return result ? '<span class="passed ti-check"></span>' : '<span class="failed ti-close"></span>';
        }

        const stringify = form => {
            return JSON.stringify(form, (key, value) => {
                if (key.startsWith("_")) {
                    return;
                }
                return value;

            }, 2);
        }

        const list = (ar, parent) => {
            ar.forEach(result => {
                let li = document.createElement("li");
                li.innerHTML = resultIcon(result.passed) + " " + result.key;
                li.title = result.test;
                if (result.reason) {
                    let reason = document.createElement('small');
                    reason.classList.add("reason");
                    reason.textContent = result.reason;
                    li.appendChild(reason)
                }

                parent.appendChild(li)
            });
        }

        let groups = this.testGroups.filter(test => {
            return selectedGroups.includes(test.name);
        });

        for (let group of groups) {
            let result = await me.runTestGroup(group);
            let li = document.createElement("li");
            let failedCount = result.filter(r => {
                return r.passed === false
            }).length;
            li.innerHTML = `${resultIcon(failedCount === 0)} ${group.name} (${result.length} tests)`;
            li.title = stringify(group.form)
            accumulated.passed += result.length - failedCount;
            accumulated.failed += failedCount;

            let groupUl = document.createElement("ul");
            li.appendChild(groupUl);

            list(result, groupUl)

            ul.appendChild(li)
        }

        me.area.clear();

        me.area.add("<h3>Results</h3>");
        me.area.add(`<div>Total: ${accumulated.passed + accumulated.failed}</div>`)
        me.area.add(`<div>Passed: ${accumulated.passed}</div>`)
        me.area.add(`<div>Failed: ${accumulated.failed}</div>`)
        me.area.add("<div><hr/></div>");
        me.area.add(ul);

  
    }

    async runTestGroup(testGroup) {
        const me = this;

        let tests = Object.entries(testGroup.tests);

        const runIndividualTest = async (test, context, exo) => {
            try {
                return test(context, exo)
            }
            catch (ex) {
                return ex;
            }
        }

        let results = [];
        let i = 0;
        let oldContainer;

        for (const task of tests) {
            if(oldContainer)
                oldContainer.remove();

            me.area.clear();
            let exo = await this.form(testGroup.form);
            me.area.add(exo.container);
            oldContainer = exo.container;

            let key = task[0];

            let test = task[1]
            let result = await runIndividualTest(test, me, exo)

            i++;
            if (result instanceof Error) {
                results.push({
                    passed: false,
                    error: result,
                    test: test.toString(),
                    reason: result
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

    runAndWaitFor(runFunction, waitForFunction, timeout = 500) {
        return new Promise((resolve, reject) => {
            let tmr;
            const resolver = result => {
                clearTimeout(tmr);
                resolve(result)
            }
            tmr = setTimeout(() => {
                resolver(false);
            }, timeout);

            try {
                waitForFunction(resolver);

                setTimeout(() => {
                    runFunction();
                }, 0);
            }
            catch (err) {
                resolver(err);
            }
        });
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