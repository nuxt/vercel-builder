jest.mock('esm', () => {
  const jiti = require('jiti')()
  return _module => id => jiti(id)
})
