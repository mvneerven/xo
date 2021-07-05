# Controls: Text

## Basic usage

```js
{
    type: "text",
    name: "txt1",
    caption: "The caption",
    placeholder: "Lorem ipsum..."
}
```

## Validation

A required control:

```js
{
    type: "text",
    name: "txt1",
    caption: "The caption",
    placeholder: "Lorem ipsum...",
    required: true
}
```

## Patterns/specialized controls

```js
{
    type: "password",
    name: "pwd1",
    caption: "Enter your password",
    required: true,
    pattern: "(?=.*d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
}
```

Complete password field example

```js
{
    type: "password",
    name: "pwd1",
    caption: "Enter your password",
    required: true,
    pattern: "(?=.*d)(?=.*[a-z])(?=.*[A-Z]).{8,}",
    info: "Please enter a strong password",
    prefix: {
        icon: "ti-key"
    },
    invalidmessage: "Password must be at least 8 characters long, and must contain at least one number and uppercase and lowercase letters"
}
```

## Prefix/Suffix

The ```prefix``` and ```suffix``` properties an be used to enrich your input with cues or even add functionality.

Example: using character prefix

```js
{
    type: "number",
    name: "price",
    caption: "Enter the price",
    required: true,
    prefix: "€",
    step: 0.01,
    min: 0
}
```

The  ```prefix: <char>``` notation is a shortcut to the full notation:

```js
{
    type: "number",
    name: "price",
    caption: "Enter the price",
    required: true,
    prefix: {
        char: "€"
    },
    step: 0.01,
    min: 0
}
```

Example: using icons

```json
{
    "type": "search",
    "name": "srch",
    "caption": "Find",
    "prefix": {
        "icon": "ti-search"
    }
}
```

```json
{
    "type": "search",
    "caption": "time",
    "prefix": {
        "char": "◷",
        "font": "Segoe UI"
    }
}
```

Rendering controls in prefix/suffix:

```json
{
    "type": "search",
    "caption": "time",
    "prefix": {
        "field": {
            [any exoform control]
        }
    }
}
```

## Autocomplete

All textbox controls, including derived ones such as email, tel, url, have a property *autocomplete*, which accepts an object with *items* and *categories*.

```js
{
    name: "autocomplete",
    type: "text",
    caption: "Favorite pet",
    placeholder: "Start typing...",
    autocomplete: {
        items: ["Cat", "Dog", "Bunny", "Bird", "Hamster", "Snake"]
    }
}
```

The ```items``` property can also be a URL or a (Promise) function.
You can also use ```%search%``` and ```map``` in your autosuggest settings on textbox controls, for more control over API connected autosuggestions.

In the example below, a country input is shown with autocompletion provided by a REST API.

The ```minlength``` parameter tells the autocomplete mechanism to kick in when the user has entered at least that number of characters in the textbox.

```js
const schema = {
  pages: [
    {
      fields: [
        {
          name: "country",
          caption: "Country",
          type: "search",
          placeholder: "France",
          autocomplete: {
            items: "https://restcountries.eu/rest/v2/name/%search%",
            map: "name",
            minlength: 2
          }
        }
      ]
    }
  ]
}
```
