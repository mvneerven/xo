# New in 1.01

A big update to ExoForm, including a rewrite of navigation, progress indicating, validation and theming engines, all of which are now implemented as separate subclassable components, and activated using form schema settings (or using JavaScript code).

Also, a complete new theme has been added: material.

## Validation

Show inline validation messages to be shown instead of the default HTML5 validation popups.

```json
{
  "validation": "inline"
}
```


## Progress
Show the progress within a multi-page form.

```json
{
  "progress": "steps"
}
```

![Steps](img/md/progress-steps.png?raw=true "Adding step indicator using progress='steps'")

## Material Theme
A new theme, inspired by Material Design, was added.

```json
{
  "theme": "material"
}
```
![Material Theme](img/md/theme-material.png?raw=true "Setting theme to 'material'")

## Control Additions

### Multiline: autogrow (Boolean)
Let a textarea grow automatically when the user adds more lines.

```json
{
  "pages": [
    {
      "legend": "My Form",
      "intro": "My form description",
      "fields": [
        {
          "name": "testField",
          "caption": "Autogrowing Textarea",
          "type": "multiline",
          "autogrow": true
        }
      ]
    }
  ]
}
```

### Range: showoutput (Boolean)
Show the value of a range control 

```json
{
  "pages": [
    {
      "legend": "My Form",
      "intro": "My form description",
      "fields": [
        {
          "name": "range",
          "caption": "Range Indicator",
          "type": "range",
          "showoutput": true
        }
      ]
    }
  ]
}
```

## ExoForm Explorer 
[The ExoForm Explorer](https://www.xo-js.dev/#/explore) is loaded with new functionality to experiment with all the new features.

![Portal](img/md/portal.png "The new ExoForm Explorer")

## Distributable

To use ExoForm 1.01, use the new JS versions at:

```
https://xo-js.dev/v1.0/xo.js
https://xo-js.dev/v1.0/xo.min.js
```

... or get the latest NPM package

https://www.npmjs.com/package/@mvneerven/xo-js
