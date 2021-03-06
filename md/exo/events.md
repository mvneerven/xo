# XO Form Events

During runtime, XO form triggers a number of events you can hook into.

## Hooking into events

In ```xo.form.run()```, the second paraneter is a generic object you can pass in, with an *on* property that you can use to listen to any of the events XO form triggers:


```js
xo.form.run(schema, {
    on: {
        post: this.handlePost.bind(this), // use event.detail.postData
        
        page: e => {
            // e.detail.from -> e.detail.page
        }
    }
})
```

## schemaParsed

XO form has parsed raw schema, no processing done.

## schemaLoading

Initial processing done, JSON schemas (if any) loaded.

## schemaLoaded

When loading the form schema is complete.

## jsonSchemasApplied

When all JSON Schemas have been applied to the form.

## renderStart

When form rendering starts

## getListItem

When one of the list controls.

## renderReady

When form rendering is complete.

## interactive

When the form is actually shown to user.

## reportValidity

When form control validity is reported.

- ```invalid``` list of invalid fields

## dataModelChange

When the underlying datamodel to which the form is bound changes.

- ```state``` - ready|change
- ```changed``` - binding that changed (when state is 'change')
- ```value``` - new value  (when state is 'change')
- ```model``` - the XO form model


## beforePage

Cancellable - called just before paging.

- ```from```
- ```page```
- ```pageCount```

## page

After moving to other page.

- ```from```
- ```page```
- ```pageCount```

## pageRelevancyChange

When a page's relevancy state changes (e.g. moves in/out of scope).

- ```index```
- ```relevant```

## post

On form post/submit.

- ```postData```

## error

When any error occurs during form runtime.

