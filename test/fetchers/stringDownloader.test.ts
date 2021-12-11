import { StringDownloader } from '../../src/fetchers/stringDownloader'

describe('StringDownloader', () => {
  it('should download the README.md as string (https)', async () => {
    const file = await StringDownloader
      .download('https://raw.githubusercontent.com/matitalatina/gaslow/master/README.md')
    expect(file).toContain('GasLow')
  })
})
