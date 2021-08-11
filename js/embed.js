const Core = xo.core;
const DOM = xo.dom;

const schema = {
 
  pages: [
    {
      fields: [
        {
          type: "nladdress",
          name: "show",
          
        }
      ]
    }
  ]
}

let fr = await xo.form.sandbox(schema);
document.querySelector("[data-pwa-area='main']").appendChild(fr)


