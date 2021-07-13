# Understanding ExoForm

Given ExoForm's declarative nature:

- It's easy to author quite complex forms, especially using [ExoForm Studio](./exoform-studio.md)
- Given that ExoForm schemas are just data, you can manipulate them easily at runtime, using JavaScript 
- ExoForm Schemas can be generated from data: once you get the basic document structure, you'll see that it's quite simple but extremely powerful.
- ExoForm supports [JSON-Schema references](./json-schema.md) and OpenAPI

## Data Manipulation

The simplest scenario being a form that simply submits the data it manages, like a contact form you have to fill in and send, ExoForm also supports full ```databinding``` to allow for manipulating data structures in memory, or attaching to REST APIs.

See [Data Binding](./data-binding.md)

