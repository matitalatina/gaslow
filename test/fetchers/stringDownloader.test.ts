import { StringDownloader } from '../../src/fetchers/stringDownloader'

describe('StringDownloader', () => {
  it('should download the README.md as string (https)', () => StringDownloader
    .download('https://raw.githubusercontent.com/matitalatina/gaslow/master/README.md')
    .then((file) => {
      expect(file).toContain('GasLow')
    }))
})
