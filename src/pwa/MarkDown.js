import Core from './Core';
import DOM from './DOM';
import MarkDownCMS from './MarkDownCMS';

class MarkDown {

    static CMS = MarkDownCMS;

    static async read(urlOrMd) {
        return new Promise((resolve, reject) => {

            DOM.addStyleSheet("//cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.0.1/build/styles/default.min.css");

            DOM.require("https://cdnjs.cloudflare.com/ajax/libs/markdown-it/12.0.6/markdown-it.min.js", e => {
                DOM.require("//cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.0.1/build/highlight.min.js", e => {
                    MarkDown.ready = true
                });
            });

            Core.waitFor(() => {
                return MarkDown.ready;
            }).then(async () => {

                let md = await MarkDown.readData(urlOrMd);
                let html = '<div class="md-converted-html">' + window.markdownit({
                    highlight: function (str, lang) {
                        if (lang && hljs.getLanguage(lang)) {
                          try {
                            return hljs.highlight(str, { language: lang }).value;
                          } catch (__) {}
                        }
                    
                        return ''; // use external default escaping
                      }
                }).render(md) + '</div>';
                resolve(html);

            }, 2000)
        });
    }

    static async readData(urlOrMd) {
        return new Promise((resolve, reject) => {
            if (Core.isUrl(urlOrMd)) {
                fetch(urlOrMd).then(x => x.text()).then(md => {
                    resolve(md)
                })
            }
            else {
                resolve(urlOrMd);
            }
        });
    }
}

export default MarkDown;
