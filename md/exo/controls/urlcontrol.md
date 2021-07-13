# Controls: URL

The ```url``` control wraps around a standard ```input[type=url]``` HTML input.
It validates 

## Basic usage

```js
{
    type: "url",
    name: "url1",
    caption: "Your URL",
    placeholder: "https://your.domain.com/"
}
```

## Using ```dialog```

The ```dialog``` property can be used to upload and create a data url:

```js
const schema = {
  pages: [
    {
      fields: [
        {
          name: "jsonUrl",
          caption: "Select JSON Url",
          type: "url",
          dialog: {
              title: "Test",
              fileTypes: ["application/json"],
              maxSize: 1024000
          }
        }
      ]
    }
  ]
}
```

