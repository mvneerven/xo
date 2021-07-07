# ExoForm Controls

ExoForm comes with a range of standard (html5 form element based) and extended (complex) controls, and you can roll your own.

## Syntax

```json
{
    "type": "<exoform field type>",
    "name": "<name>",
    "caption": "<label caption>"
}
```

## Standard Controls

| HTML5                         | ExoForm          | 
| ----------------------------- | ---------------- | 
| button                        | [button](./controls/buttoncontrol.md)           |
| input[type=text]              | [text](./controls/textcontrol.md)             |
| input[type=email]             | email            |
| input[type=search]            | search           |
| input[type=password]          | password         |
| input[type=date]              | date             |
| input[type=datetime-local]    | datetime-local   |
| input[type=time]              | time             |
| input[type=range]             | range            |
| input[type=date]              | date             |
| input[type=week]              | week             |
| input[type=tel]               | tel              |
| input[type=color]             | color            |
| input[type=hidden]            | hidden           |
| input[type=url]               | url              |
| input[type=file]              | file             | 
| textarea                      | multiline        |
| input[type=checkbox]          | checkbox         | 
| Group of input[type=checkbox] | checkboxlist     | 
| Group of input[type=radio]    | radiobuttonlist  | 

## Extended Controls

| Name                          | Description                                                                                          | 
| ----------------------------- | --------------------------------------------------------------------------------------------------   | 
| filedrop                      | Rich file upload control with drag & drop support                                                    |
| switch                        | Checkbox replacement for boolean values                                                              |
| richtext                      | A CKEditor wysiwyg/html editor wrapper for ExoForm                                                   |
| tags                          | A control for adding multiple tags                                                                   |
| multiinput                    | Input container for collecting multiple values and display in a grid                                 |
| creditcard                    | Implementation of multiinput for credit card registration                                            |
| name                          | Person name control                                                                                  |
| nladdress                     | Implementation of multiinput for Dutch Address input                                                 |
| daterange                     | Implementation of multiiput for date ranges                                                          |
| embed                         | Control for embedding anything in an IFrame                                                          |
| video                         | Control for embedding video                                                                          |
| captcha                       | Google ReCaptcha wrapper                                                                             |
| dialog                        | A simple dialog (modal or modeless)                                                                  |
| info                          | An info panel control                                                                                |
| map                           | Leaflet interactive map wrapper                                                                      |
| listview                      | [Listview Control](./controls/listviewcontrol.md) for tables/grids, tile views and more              |

---

## More on ExoForm Controls

- See [Deeper into ExoForm controls](./controls-advanced.md)