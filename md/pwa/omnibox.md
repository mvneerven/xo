# OmniBox


OmniBox is a multi-faceted global contextual search autocomplete mechanism that is a great addition to any Progressive Web App/Single Page Application.

![OmniBox](https://xo-js.dev/assets/img/omnibox.png "An OmniBox")

The OmniBox 'knows' the app routes, but also provides a flexible way for any component within the app to hook into the listings and provide custom search results with custom selection actions, using OmniBox categories.

In the case portrayed in the image, the OmniBox shows results in 4 categories, with both deep links to state inside the app, and external actions to be triggered.

The Google and Image categories simply link through to external applications, but the Help category has real understanding of a help system attached to the app (like ZenDesk for instance), and the Settings category is fed by using the settings XO form schema (which essentially is metadata that is to be translated into a web form), so it can deep link into a form field highlighted in a form.

However intuitive your app's UI is, for novice users of your app, OmniBox will help discover functionality. For power users, it will shorten the path to functionality hidden a few clicks away in the UI.


```js
 this.omniBox = new PWA.OmniBox({
      useRoutes: true,
      placeholder: "The start of everything...",
      tooltip: "Navigate through this app by clicking & typing here..",

      categories: {
          Google: {
              sortIndex: 500,
              trigger: options => { return options.search.length >= 2 },
              text: "Search on Google for '%search%'",
              getItems: options => {
                  return [{
                      text: "Search on Google for '%search%'"
                  }]
              },
              icon: "ti-search",
              action: options => {
                  options.url = `https://www.google.com/search?q=${options.search}`;
              },
              newTab: true
          },

          Images: {
              sortIndex: 600,
              trigger: options => { return options.search.length >= 2 },
              getItems: options => {
                  return [{
                      text: "Search images on Pexels for '%search%'"
                  }]
              },
              action: options => {
                  options.url = `https://www.pexels.com/search/${options.search}`;
              },
              newTab: true,
              text: "Search for '%search%' images",
              icon: "ti-image"
          },

          Products: {
              sortIndex: 100,
              trigger: options => { return options.search.length >= 2 },
              getItems: options => {
                  return [{
                      text: "Search products with term/tag '%search%'"
                  }]
              },
              text: "Search for '%search%' products",
              icon: "ti-package",
              action: options => {
                  document.location.hash = `/products/${options.search}`;
              }
          }
      }
  });

```
 

- Each OmniBox category can have a *sortIndex* property, which specifies where the results within that category are shown in the list of results.

- OmniBox now fires an 'omnibox-init' event on the pwa object. This gives any component the chance to hook into the creation and add categories.

Add a 'Products' category:

```js
 pwa.on("omnibox-init", e => {
    e.detail.options.categories["Products"] = {
        sortIndex: 1,
        trigger: options => { return options.search.length >= 2 },
        getItems: async options => {
            return this.client.productApi.find(options.search, {max: 3}).map(i => {
              return {
                text: i.name,
                description: i.description
              }
            })
        },
        icon: "ti-package",
        action: options => {
            document.location.hash = '/products/' + options.text
        }

    }
});
```

- OmniBox categories can now be triggered depending on other results. Using the *sortIndex* property, you can specify that your category is only activated when other categories have already had the chance of adding their results, so that your data can be skipped if other results are already showm. This can be handy for 'catch all' categories such as delegating to an external help system.

In the case below, we're showing the option to search in ZenDesk, but only if there were no other results:

```js
pwa.on("omnibox-init", e => {
    e.detail.options.categories["Help"] = {
          sortIndex: 400,
          trigger: (options) => {
            return options.results.length === 0 && options.search.length >= 2;
          },
          getItems: (options) => {
            return [
              {
                text: `Search for help on '${options.search}'`,
              },
            ];
          },
          icon: "ti-help",
          action: (options) => {
            options.url = `https://help.mydomain.com/hc/nl/search?utf8=%E2%9C%93&query=${options.search}`;
          },
          newTab: true,
        }
    }
});
```
