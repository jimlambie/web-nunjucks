'use strict'

const fs = require('fs')
const htmlLooksLike = require('html-looks-like')
const path = require('path')
const should = require('should')
const helpers = require(path.join(__dirname, '/helpers/index'))

const config = require(path.join(__dirname, '/helpers/config'))
let engine
let factory

describe('Nunjucks interface', function () {
  // Get a fresh instance of the engine
  beforeEach(done => {
    config.reset()

    factory = require(helpers.paths.engine)

    engine = {
      extensions: factory.metadata.extensions,
      handle: factory.metadata.handle,
      factory: factory,
      started: false
    }

    done()
  })

  // Get rid of the current instance of the engine
  afterEach(done => {
    delete require.cache[helpers.paths.engine]

    done()
  })

  it('should contain a metadata block with handle and extensions', done => {
    factory.metadata.should.be.Object
    factory.metadata.handle.should.be.String
    factory.metadata.extensions.should.be.Array

    done()
  })

  it('should declare .njk as a supported extension', done => {
    factory.metadata.extensions.indexOf('.njk').should.not.equal(-1)

    done()
  })

  it('should load pages', done => {
    const Engine = factory()
    const instance = new Engine({
      additionalTemplates: Object.keys(helpers.additionalTemplates).map(name => helpers.additionalTemplates[name]),
      config: config,
      pagesPath: path.join(helpers.paths.workspace, 'pages')
    })

    Promise.resolve(instance.initialise()).then(() => {
      return instance.register('products', helpers.pages.products)
    }).then(() => {
      (typeof instance.templates.products).should.eql('object')

      done()
    })
  })

  it('should render pages with locals', done => {
    const Engine = factory()
    const instance = new Engine({
      additionalTemplates: Object.keys(helpers.additionalTemplates).map(name => helpers.additionalTemplates[name]),
      config: config,
      pagesPath: path.join(helpers.paths.workspace, 'pages')
    })

    const locals = {
      products: [
        {
          name: 'Super Thing 3000',
          price: 5000
        },
        {
          name: 'Mega Thang XL',
          price: 8000
        }
      ]
    }

    const expected = `
      <header>My online store</header>

      <h1>Products:</h1>

      <ul>
        ${locals.products.map(product => {
          return `<li>${product.name} - £${product.price}</li>`
        }).join('\n')}
      </ul>

      <footer>Made by JIM</footer>
    `

    Promise.resolve(instance.initialise()).then(() => {
      return instance.register('products', helpers.pages.products)
    }).then(() => {
      return instance.render('products', helpers.pages.products, locals)
    }).then(output => {
      htmlLooksLike(output, expected)

      done()
    })
  })

  it('should render pages with helpers', done => {
    const Engine = factory()
    const instance = new Engine({
      additionalTemplates: Object.keys(helpers.additionalTemplates).map(name => helpers.additionalTemplates[name]),
      config: config,
      helpers: path.join(helpers.paths.workspace, 'helpers'),
      pagesPath: path.join(helpers.paths.workspace, 'pages')
    })

    const locals = {
      products: [
        {
          name: 'Super Thing 3000',
          price: 5000
        },
        {
          name: 'Mega Thang XL',
          price: 8000
        }
      ]
    }

    const expected = `
      <header>My online store</header>

      <h1>Products:</h1>

      <ul>
        ${locals.products.map(product => {
          return `<li>helper: ${product.name} - £${product.price}</li>`
        }).join('\n')}
      </ul>

      <footer>Made by JIM</footer>
    `

    Promise.resolve(instance.initialise()).then(() => {
      return instance.register('products-with-helpers', helpers.pages['products-with-helpers'])
    }).then(() => {
      return instance.render('products-with-helpers', helpers.pages['products-with-helpers'], locals)
    }).then(output => {
      htmlLooksLike(output, expected)

      done()
    })
  })

  it('should render pages with filters', done => {
    const Engine = factory()
    const instance = new Engine({
      additionalTemplates: Object.keys(helpers.additionalTemplates).map(name => helpers.additionalTemplates[name]),
      config: config,
      helpers: path.join(helpers.paths.workspace, 'helpers'),
      filters: path.join(helpers.paths.workspace, 'filters'),
      pagesPath: path.join(helpers.paths.workspace, 'pages')
    })

    const locals = {
      products: [
        {
          name: 'Super Thing 3000',
          price: 5000
        },
        {
          name: 'Mega Thang XL',
          price: 8000
        }
      ]
    }

    const expected = `
      <header>My online store</header>

      <h1>Products:</h1>

      <ul>
        ${locals.products.map(product => {
          return `<li>filter: ${product.name.toUpperCase()} - £${product.price}</li>`
        }).join('\n')}
      </ul>

      <footer>Made by JIM</footer>
    `

    Promise.resolve(instance.initialise()).then(() => {
      return instance.register('products-with-filters', helpers.pages['products-with-filters'])
    }).then(() => {
      return instance.render('products-with-filters', helpers.pages['products-with-filters'], locals)
    }).then(output => {
      htmlLooksLike(output, expected)

      done()
    })
  })
})
