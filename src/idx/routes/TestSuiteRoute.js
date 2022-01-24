const Core = xo.core;
const DOM = xo.dom;
import uiTests from '../../../tests/ui/ui-tests.js';

class TestsRoute extends xo.route {
    menuTitle = "Tests"

    title = "XO Test Suite";

    menuIcon = "ti-check-box";

    constructor() {
        super(...arguments)

        this.tests = Object.entries(uiTests).map(entry => {
            let name = entry[0];
            let test = entry[1];
            return {
                name: name,
                ...test,
                value: name,
                description: `${Object.keys(test.tests).length} tests`,
                checked: true
            }
        })
    }

    async render(path) {
        const me = this;

        this.elm = await xo.form.run({
            submit: false,
            model: {
                instance: {
                    data: {
                        tests: this.tests.map(t => {
                            return t.name
                        })
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
                            items: this.tests.map(t => {

                                return {
                                    name: t.name,
                                    value: t.name,
                                    checked: t.checked,
                                    description: t.description
                                }
                            })
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
        this.side.add(this.elm)
        this.area.add(DOM.parseHTML(/*html*/`
            <div>
                <h3>XO Test Suite </h3>
                <p>
                    Select the tests on the right and press 'Run tests'
                </p>
            </div>
        `))
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
        let selected = exo.getInstance("data").tests;

        let ul = document.createElement("ul");
        ul.classList.add("ui-test-results")

        let promises = [];
        let accumulated = {
            passed: 0,
            failed: 0
        }

        const resultIcon = result => {
            return result ? '<span class="passed ti-check"></span>' : '<span class="failed ti-close"></span>';
        }

        const stringify = form => {
            return JSON.stringify(form, (key, value) => {
                if (key.startsWith("_")){
                    console.log(key, value)
                    return;
                }
                return value;

            }, 2);
        }

        const list = (ar, type, parent) => {
            ar.forEach(result => {
                let li = document.createElement("li");
                li.innerHTML = resultIcon(type === "passed") + " " + result.key;
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

        this.tests.filter(test => {
            return selected.includes(test.name);
        }).forEach(async test => {
            promises.push(me.runTest(test).then(result => {
                let li = document.createElement("li")
                li.innerHTML = `${resultIcon(result.failed.length === 0)} ${test.name} (${result.total} tests)`;
                li.title = stringify(test.form)
                accumulated.passed += result.passed.length;
                accumulated.failed += result.failed.length;

                let failedUl = document.createElement("ul");
                li.appendChild(failedUl);
                let passedUl = document.createElement("ul");
                li.appendChild(passedUl);

                list(result.failed, "failed", failedUl)

                list(result.passed, "passed", passedUl)


                ul.appendChild(li)
            }));

        })

        for (const task of promises) {
            await Promise.resolve(task);
        }

        me.area.clear();
        me.area.add("<h3>Results</h3>");
        me.area.add(`<div>Total: ${accumulated.passed + accumulated.failed}</div>`)
        me.area.add(`<div>Passed: ${accumulated.passed}</div>`)
        me.area.add(`<div>Failed: ${accumulated.failed}</div>`)
        me.area.add("<div><hr/></div>");
        me.area.add(ul);
    }

    runTest(test) {
        const me = this;

        let tests = Object.entries(test.tests);

        const runIndividualTest = async (test, context, exo) => {
            try {
                return test(context, exo)
            }
            catch (ex) {
                return ex;
            }
        }

        let results = {
            total: tests.length,
            passed: [],
            failed: []
        };
        return new Promise((resolve) => {
            this.form(test.form).then(async exo => {
                me.area.clear();
                me.area.add(exo.container);

                let i = 0;

                tests.forEach(entry => {
                    let key = entry[0]
                    let test = entry[1];

                    Promise.resolve(runIndividualTest(test, me, exo)).then(result => {
                        i++;
                        if (result instanceof Error) {
                            results.failed.push({
                                key: key,
                                test: test.toString(),
                                reason: result
                            })
                        }

                        else if (!result) {
                            results.failed.push({
                                test: test.toString(),
                                key: key
                            })
                        }
                        else {
                            results.passed.push({
                                test: test.toString(),
                                key: key
                            })
                        }

                        if (i === tests.length) {
                            resolve(results)
                        }
                    }).catch(ex => {
                        i++;
                        results.failed.push({
                            key: key
                        })
                    })
                });
            }).catch(ex => {

            })
        });
    }

    runAndWaitFor(runFunction, waitForFunction, timeout = 500) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(false);
            }, timeout);

            waitForFunction(resolve);

            try {
                setTimeout(() => {
                    runFunction();
                }, 0);
            }
            catch (err) {
                reject(err);
            }
        });
    }

    async form(schema) {
        const me = this;

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