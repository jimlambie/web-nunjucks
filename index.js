const fs = require('fs')
const path = require('path')

const ENGINE = {
  config: {
    paths: {
      doc: 'Paths required by Nunjucks',
      format: Object,
      default: {
        helpers: 'workspace/utils/helpers',
        filters: 'workspace/utils/filters',
        partials: 'workspace/pages/partials'
      }
    }
  },
  extensions: ['.njk'],
  handle: 'nunjucks'
}

module.exports = () => {
  const debug = require('debug')('web:templates:njk')
  const nunjucks = require('nunjucks')
  const libHelpers = require(path.join(__dirname, 'lib/helpers'))

  const EngineNunjucks = function (options) {
    debug('Starting Nunjucks engine...')

    // additionalTemplates is passed by DADI Web: it is an array of absolute
    // paths to any templates found with an extension supported by this engine
    // that haven't already been loaded due to not having a JSON schema
    // file (i.e. they are not pages)
    this.additionalTemplates = options.additionalTemplates
    this.config = options.config
    this.helpers = options.helpers
    this.pagesPath = options.pagesPath
    this.templates = {}
  }

  /**
   * Returns the engine core module.
   *
   * @return {function} The engine core module.
   */
  EngineNunjucks.prototype.getCore = function () {
    return nunjucks
  }

  /**
    * Returns information about the engine.
    *
    * @return {object} An object containing the engine name and version.
    */
  EngineNunjucks.prototype.getInfo = function () {
    return {
      engine: ENGINE.handle,
      version: undefined
    }
  }

  /**
    * Initialises the engine.
    *
    * @return {Promise} A Promise that resolves when the engine is fully loaded.
    */
  EngineNunjucks.prototype.initialise = function () {
    const paths = this.config.get('engines.nunjucks.paths')
    const helpersPath = path.resolve(paths.helpers)
    const filtersPath = path.resolve(paths.filters)
    const partialsPath = path.resolve(paths.partials)

    const templateSearchPaths = [this.pagesPath, partialsPath, helpersPath]

    this.env = nunjucks.configure(templateSearchPaths, { watch: true })

    return this._requireDirectory(partialsPath, ENGINE.extensions)
      .then(partials => {
        partials.forEach(partial => {
          this.register(path.basename(partial).replace('.njk', ''))
        })

        debug('partials loaded %o', partials)

        return this._requireDirectory(this.pagesPath, ENGINE.extensions)
          .then(templates => {
            templates.forEach(template => {
              this.register(path.basename(template).replace('.njk', ''))
            })

            debug('templates loaded %o', templates)

            return this._requireDirectory(helpersPath, ENGINE.extensions)
              .then(helpers => {
                helpers.forEach(helper => {
                  this.register(path.basename(helper).replace('.njk', ''))
                })

                return this._requireDirectory(filtersPath, ['.js'])
                  .then(filters => {
                    filters.forEach(filter => {
                      this.env.addFilter(path.basename(filter).replace('.js', ''), require(filter))
                    })

                    debug('Nunjucks initialised')
                  })
              })
          })
      })
  }

  /**
   * Registers the template with markup.
   *
   * @return {Promise} A Promise that resolves with the loaded data.
   */
  EngineNunjucks.prototype.register = function (name, data, path) {
    this.templates[name] = this.env.getTemplate(`${name}.njk`, true)
  }

  /**
    * Renders a template.
    *
    * @param {string} name The name of the template.
    * @param {string} data The template content.
    * @param {object} locals The variables to add to the context.
    * @param {object} options Additional render options.
    *
    * @return {Promise} A Promise that resolves with the render result.
    */
  EngineNunjucks.prototype.render = function (name, data, locals, options) {
    return Promise.resolve(nunjucks.render(`${name}.njk`, locals))
  }

  /**
  * Loads any additional templates.
  *
  * @return {Promise} The names of the partials loaded.
  */
  EngineNunjucks.prototype._loadPartials = function () {
    return libHelpers.readFiles(this.additionalTemplates, {
      callback: file => {
        return new Promise((resolve, reject) => {
          fs.readFile(file, 'utf8', (err, data) => {
            if (err) return reject(err)

            const extension = path.extname(file)
            const templateName = path.relative(this.pagesPath, file)
              .slice(0, -extension.length)

            this.registerPartial(templateName, data)

            resolve(templateName)
          })
        })
      }
    })
  }

  /**
    * Requires all files of a type within a directory.
    *
    * @param {string} directory The full path to the directory.
    */
  EngineNunjucks.prototype._requireDirectory = function (directory, extensions) {
    if (!directory) {
      return Promise.resolve([])
    }

    return libHelpers.readDirectory(directory, {
      extensions,
      recursive: true
    })
  }

  return EngineNunjucks
}

module.exports.metadata = ENGINE
