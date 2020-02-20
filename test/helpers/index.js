'use strict'

const fs = require('fs')
const path = require('path')

const PATHS = {
  engine: path.join(__dirname, '/../../index'),
  workspace: path.join(__dirname, '/../workspace')
}

const ADDITIONAL_TEMPLATES = {
  helpers: path.join(PATHS.workspace, 'helpers/helpers.njk')
}

const PAGES = {
  products: fs.readFileSync(path.join(PATHS.workspace, 'pages/products.njk'), 'utf8'),
  'products-with-helpers': fs.readFileSync(path.join(PATHS.workspace, 'pages/products-with-helpers.njk'), 'utf8')
}

module.exports.additionalTemplates = ADDITIONAL_TEMPLATES
module.exports.pages = PAGES
module.exports.paths = PATHS
