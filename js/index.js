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
  }).on(factory.events.post, e => {
    alert(JSON.stringify(e.detail.postData, null, 2))

    // this.upload(e.detail.postData.files).then(x => {
    //   debugger;
    // })
  });
}

function upload(files) {
  

  // https://func-assetrepo-dev.azurewebsites.net/api/func-uploadasset-dev?code=/4fQtcDY04JhBn45RGJaJPbScM2faA/Esxsn6B6yO0JZLbr/Uka6zA==
  return fetch("https://func-assetrepo-dev.azurewebsites.net/api/func-uploadasset-dev?code=XaFrCC0F2oKxt5yUIheIkSNC6FpifMTNxWNHEHy5WC7fWoK0M1VhYw==&clientId=apim-apim-asf-poc", {
    method: "POST",
    body: JSON.stringify({
      path: "testfolder/images",
      files: files
    })
  }).then(x => {
    if (x.status === 200) {
      return x.json()
    }
    throw `HTTP Status ${x.status}: ${x.statusText} (type: ${x.type})`;
  });
}

factory.build({
  defaults: {
    validation: "inline"
  }
}).then((context) => {
  run(context);
});
