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