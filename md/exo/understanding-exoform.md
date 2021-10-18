# Understanding XO form

Since XO schemas are fully declarative, it might be hard at first to understand how it all translates into web forms.
Lets analyze what actually happens at runtime, and we'll start extremely simple. 

Take this little snippet:

```js
const schema = {
    pages: [{
        fields: [
            {
                type: "text",
                name: "name",
                caption: "Enter your name"
            },
            {
                type: "email",
                name: "email",
                caption: "Enter your email address"
            }
        ]
    }]
}

const frm = await xo.form.run(schema, {
    on: {
        post: e => {
            alert(JSON.stringify(e.detail.postData, null, 2))
        }
    }
});

document.getElementById("form").appendChild(frm);
```

Let's analyze what happens when you call ```xo.form.run()```:

1. the schema passed in is analyzed. It can be a URL, a JavaScript Object Literal, a JSON object or a string.
2. In the case of a URL, the data is fetched before passing it to the parser
3. The Schema Parser then takes control, and interprets the base instructions at the top level of the schema, such as ```navigation```, ```validation```, ```progress```, etc.
4. Each of these launch a dedicated addin, that then takes care of this aspect of the form. 
5. If an explicit ```model``` object structure exists, data binding is set up. See [Data Binding](./data-binding.md). An implicit model can also be created if the parser finds control definitions with the ```bind``` property set. For instance, ```bind: "instance.mydata.username"``` will create an instance named ```mydata``` and add a property ```username``` under it.
6. The form is rendered, starting with the ```pages``` array, which contains one or more ```page``` objects, each with a ```fields``` array.
7. For each page and each control, instances of the underlying control ES6 Classes are instantiated. For instance, looking at the ```text``` and ```email``` field types, instances of the ```ExoTextControl``` and ```ExoEmailControl``` are created respectively. Each of these controls inherit, directly or indirectly, from the ```ExoControlBase``` abstract base class.
8. For each of the controls created, property values from the field schema are applied to class properties
9. If the control is bound to a data model, (```bind```), the ```value``` property is set to the value of the corresponding property in the model instance.
10. The rendering process kicks off, starting outside in, starting at the first page's first field.
11. Each control's ```render()``` method returns a container ```div```.

## HTML rendered

The example schema above renders this HTML:

```html
<div class="exf-container [...]" >
    <form class="exf-form [...]" >
        <div class="exf-wrapper">
            <fieldset class="exf-page [...]" >
                <div data-id="<id>" class="exf-ctl-cnt [...]" data-field-type="text">
                    <div class="exf-ctl">
                        <label for="<id>" aria-hidden="true" class="exf-label" title="Enter your name">Enter
                            your name</label>

                        <input type="text" data-exf="1" id="<id>" name="name">

                    </div>
                    <div class="exf-fld-details">
                        <div class="exf-help-wrapper"></div>
                    </div>
                </div>
                <div data-id="<id>" class="exf-ctl-cnt [...]" data-field-type="email">
                    <div class="exf-ctl">
                        <label for="<id>" aria-hidden="true" class="exf-label"
                            title="Enter your email address">Enter your email address</label>

                        <input type="email" data-exf="1" id="<id>" name="email">

                    </div>
                    <div class="exf-fld-details">
                        <div class="exf-help-wrapper"></div>
                    </div>
                </div>
            </fieldset>
        </div>
        <fieldset class="exf-cnt exf-nav-cnt">
            [...]
        </fieldset>
    </form>
</div>
```

Looking at this resulting HTML, you can already see the consistency in the rendered output:

Each control is embedded in a ```div.exf-ctl-cnt``` with a nested ```div.exf-ctl```, in which both label and actual control specific elements are contained. This makes for an easy to understand, easy to style base structure.

---
See also: [Debugging XO Forms](./debugging-exoform.md)