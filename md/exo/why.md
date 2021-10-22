# # Declarative Forms: A bit of History

The idea of using declarative syntax for complex web forms is not new. In 2003, the original specification of the [XForms](https://en.wikipedia.org/wiki/XForms) standard was published. XForms was a standard that was developed to tackle complex web form challenges in a structured way, and although it was obviously based on XML/XSLT/XPath technologies, its principles are still very valid, and easily translated to other file formats, such as JSON.

Some of the main drivers for XForms development were:

- Ease of authoring
- Ease of changing
- Accessibility
- International
- Separation of Model (Data) and UI

All these aspects are taken care of in XO, but there's much more:

# Declarative Forms: Advantages

## 1. It's Data, Baby!
Declarative Forms are just data - and can be generated from other data, both server and client-side.

## 2. Runtime Generated Forms
XO Form Schemas can be generated from data: once you get the basic document structure, you'll see that it's quite simple but extremely powerful.

## 3. Shorter Development Cycles
Forms are there to manipulate data. With defined data models and schemas being provided, it's ridiculously easy to distill an XO form from this. Basically, the only consideration left has to do with making the UI more beautiful.

## 4. Shorter Test Cycles
Every aspect of the XO Form Runtime has been thorougly tested. Your form, being just declarative data, is read and parsed by this engine. This means that the time spent on testing and debugging your form is drastically less than on a bespoke (HTML, JavaScript, CSS) form.

## 5. Better Predictability
Since you don't write code and can't run into the debugging nightmares of scripting, developing large scale complex web forms is a much more linar experience.

## 6. Robustness
The XO form runtime has been thoroughly optimized for optimal performance, robustness, error handling, validations, state management and much more. 

Each bespoke webform you build generates a ton of work in all these categories that need to be tested.

## 7. Better Reusability
Since form fields are just JSON or JS Object structure literals, it's easy to define blocks for reuse, or generate XO form schema from a library that is carefully crafted to do things exactly as you like them.

