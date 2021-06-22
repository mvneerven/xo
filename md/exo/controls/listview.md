# ListView Control

A versatile listview for grid and tile views.

```js
{
  type: "listview",
  name: "lv1",
  columns: [
    name: {
      autoWidth: true,
        type: "main"
      },
      imageUri: {
        autoWidth: true,
        type: "img"
      },
      description: {
        width: "2fr",
        class: "hide-sm"
      },
      type: {
        autoWidth: true,
        class: "hide-xs"
      },

      size: {
        autoWidth: true,
        class: "hide-xs"
      },
      tags: {
        autoWidth: true
      }
  ],
  items: [...]
}
```

Default ListView

![ListView in Grid Mode](https://xo-js.dev/assets/img/listview-grid.png "ListView in Grid Mode")

![ListView in Grid Mode](https://xo-js.dev/assets/img/listview-tiles.png "ListView in Grid Mode")

ContextMenu

![Context Menu](https://xo-js.dev/assets/img/listview-contextmenu.png "ListView with context menu")

```js
{
  type: "listview",
  name: "lv1",
  view: "tiles",
  columns: [
      ...
  ],
  items: [
      ...
  ],
  contextMenu: [
      {
          tooltip: "Edit",
          icon: "ti-pencil",
          action: "edit",
      },  
      {
          tooltip: "Delete",
          icon: "ti-close",
          action: "delete"
      }
  ]

}
```

