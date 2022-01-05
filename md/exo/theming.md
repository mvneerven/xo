# Themes & Styling (CSS/SCSS)

XO Forms is completely themable, and comes with a few built in themes that are ready for use in light and dark modes.

If you need to adjust styling, add your customizations on top of an existing theme, or completely roll your own themes. 

The XO base styling handles every aspect you could call 'functional', so writing your own themes doesn't need to take much time.

## Available themes:

### Material (default)

![Material Theme](https://xo-js.dev/assets/img/material.png "Material Theme")

### Fluent

![Fluent Theme](https://xo-js.dev/assets/img/fluent.png "Fluent Theme")

### Thin (added in 1.6)

![Thin Theme](https://xo-js.dev/assets/img/thin.png "Thin Theme")

## Using a theme

```js
const schema = {
  theme: "thin",
  pages: [
    {
      fields: [
        {
          type: "text"
        },
      ],
    },
  ],
};
```

# Customizing styling 

XO generates HTML from your JSON/JS schema, following the following pattern:

```pug
div.exf-container
    form.exf-form
        div.exf-wrapper
            fieldset.exf-page
                field1
                field2
            fieldset.exf-page
                field3
                field4
    
    fieldset.exf-nav-cnt
        control1
        control2

```

... where each field uses the following template:

```pug
div.exf-ctl-cnt
    div.exf-ctl
        label
        element
    
    div.exf-fld-details
        div.exf-help-wrapper
    
```

Here's a full snippet of the rendered HTML of a (very simple) form, with just a ```text``` and a ```multiline``` field:

```html
<div class="exf-container exf-navigation-default exf-validation-default exf-progress-default exf-theme-material exf-rules-default exf-single-page"
    data-id="frmd118a3519a88">
    <form method="post" class="exf-form standard" novalidate="true" data-current-page="1" data-page-count="1">
        <div class="exf-wrapper">
            <fieldset class="exf-cnt exf-page exf-ctl-cnt exf-base-default active" data-exf="1" id="exf1140c71964fc"
                data-page="1">
                <div data-id="exf3d290adf6e6d" class="exf-ctl-cnt exf-base-text" data-field-type="text">
                    <div class="exf-ctl">
                        <label for="exf3d290adf6e6d" aria-hidden="true" class="exf-label" title="Enter your name">Enter
                            your name</label>

                        <input type="text" data-exf="1" id="exf3d290adf6e6d" name="name" aria-label="Enter your name">

                    </div>
                    <div class="exf-fld-details">
                        <div class="exf-help-wrapper"></div>
                    </div>
                </div>
                <div data-id="exfcc7d04c8b5bb" class="exf-ctl-cnt exf-base-text" data-field-type="multiline">
                    <div class="exf-ctl">
                        <label for="exfcc7d04c8b5bb" aria-hidden="true" class="exf-label"
                            title="Enter your message">Enter your message</label>

                        <textarea data-exf="1" id="exfcc7d04c8b5bb" data-_index="1" name="msg"
                            aria-label="Enter your message"></textarea>

                    </div>
                    <div class="exf-fld-details">
                        <div class="exf-help-wrapper"></div>
                    </div>
                </div>
            </fieldset>
        </div>
        <fieldset class="exf-cnt exf-nav-cnt">
            <div data-id="exf28a1c6499c30" class="exf-ctl-cnt exf-ctl-bare exf-base-default exf-btn-cnt"><button
                    type="button" class="exf-btn form-post" data-exf="1" id="exf28a1c6499c30" name="send"
                    aria-label="Submit"><span class="exf-caption">Submit</span></button></div>
        </fieldset>
    </form>
</div>
```

