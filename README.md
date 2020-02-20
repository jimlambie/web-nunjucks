<img src="https://edge.network/assets/products/dadi-web-full.png" alt="DADI Web" height="65"/>

## Nunjucks engine interface

[![npm (scoped)](https://img.shields.io/npm/v/web-nunjucks.svg?maxAge=10800&style=flat-square)](https://www.npmjs.com/package/web-nunjucks)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

This module allows [Nunjucks](https://mozilla.github.io/nunjucks/) templates to be used with [DADI Web](https://github.com/dadi/web).

## Installation

- Add this module as a dependency:

   ```
   npm install web-nunjucks
   ```

- Include it in the `engines` array passed to Web:

   ```js
   require('@dadi/web')({
     engines: [
       require('web-nunjucks')
     ]
   })
   ```

## Configuration

The following configuration parameters can be added to the global Web config file, under `engines.nunjucks`.

### `paths`

Paths required by Nunjucks.

- Format: `Object`
- Default:
   ```
   {
     {
       helpers: 'workspace/utils/helpers'
     }
   }
   ```

## Partials


## Filters

To use filters supply the path to your filters in the main Web configuration file:

```json
"engines": {
  "nunjucks": {
    "paths": {
      "filters": "workspace/filters"
    }
  }
}
```

Filters are individual JavaScript files within the specifed directory:

*Example: workspace/filters/uppercase.js*

```js
module.exports = input => {
  return input.toUpperCase()
}
```

## Helpers

To use helpers supply the path to your helpers in the main Web configuration file:

```json
"engines": {
  "nunjucks": {
    "paths": {
      "helpers": "workspace/helpers"
    }
  }
}
```

Helpers are Nunjucks macros stored in individual files within the specifed directory, or all in a single file.

*Example:*

```js
{#
 Returns the full name and price of the supplied product
 Usage: {{ renderProduct product }}
#}

{% macro renderProduct(product) %}
  helper: {{ product.name }} - £{{ product.price }}
{% endmacro %}
```
