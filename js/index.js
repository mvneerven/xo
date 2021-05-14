const Core = xo.core;

const factory = window.xo.form.factory,
  DOM = window.xo.dom,
  log = (ex) => {
    const elm = DOM.parseHTML(`<div>Error: ${ex.toString()}</div>`);
    document.querySelector("footer").appendChild(elm);
    elm.scrollIntoView();
  };


async function run(context) {
  const x = context.createForm();
  listen(x);
  await x.load("/data/forms/form.js");
  let result = await x.renderForm();
  document.body.querySelector("main").appendChild(result.container);
}

function listen(x) {
  x.on(factory.events.error, e => {
    log(e.detail.error);
  }).on(factory.events.post, e=>{
    alert(JSON.stringify(e.detail.postData, null, 2))
  });
}

factory.build({
  defaults: {
    validation: "inline"
  }
}).then((context) => {
  run(context);
});