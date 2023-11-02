import fs from 'node:fs/promises'
import path from 'node:path'

// For supereffective-sdk, Github Pages root folder is ./packages/dataset/dist/*
const upstreamUrlSdk = 'https://itsjavi.com/supereffective-sdk/data'

const dataFiles = [
  // format: [base-url, remote-file, local-file]
  [upstreamUrlSdk, 'abilities.min.json', 'abilities.json'],
  [upstreamUrlSdk, 'colors.min.json', 'colors.json'],
  [upstreamUrlSdk, 'items.min.json', 'items.json'],
  [upstreamUrlSdk, 'languages.min.json', 'languages.json'],
  [upstreamUrlSdk, 'locations.min.json', 'locations.json'],
  [upstreamUrlSdk, 'marks.min.json', 'marks.json'],
  [upstreamUrlSdk, 'moves.min.json', 'moves.json'],
  [upstreamUrlSdk, 'natures.min.json', 'natures.json'],
  [upstreamUrlSdk, 'originmarks.min.json', 'originmarks.json'],
  [upstreamUrlSdk, 'pokedexes.min.json', 'pokedexes.json'],
  [upstreamUrlSdk, 'pokemon.min.json', 'pokemon.json'],
  [upstreamUrlSdk, 'regions.min.json', 'regions.json'],
  [upstreamUrlSdk, 'ribbons.min.json', 'ribbons.json'],
  [upstreamUrlSdk, 'types.min.json', 'types.json'],
  // -- Legacy assets (website v3.x):
  [upstreamUrlSdk, 'legacy-boxpresets.min.json', 'legacy/box-presets.json'],
  [upstreamUrlSdk, 'legacy-pokemon.min.json', 'legacy/pokemon.json'],
  [upstreamUrlSdk, 'legacy-games.min.json', 'legacy/games.json'],
  [upstreamUrlSdk, 'legacy-gamesets.min.json', 'legacy/gamesets.json'],
  [upstreamUrlSdk, 'legacy-gamesets.min.json', 'gamesets.json'],
  [upstreamUrlSdk, 'legacy-gamesupersets.min.json', 'gamesupersets.json'],
]

const dataDir = path.resolve(path.join(__dirname, '../data'))

async function download(url: string, dest: string) {
  return fetch(url).then(async res => {
    if (!res.body) {
      throw new Error('No body')
    }
    const rawBody = await res.text()
    return fs.writeFile(dest, rawBody)
  })
}

const main = async () => {
  await fs.mkdir(dataDir + '/legacy', { recursive: true })
  await Promise.all(
    dataFiles.map(async mapping => {
      const [upstreamUrl, remoteFile, localFile] = mapping
      const url = `${upstreamUrl}/${remoteFile}`
      const filePath = path.join(dataDir, localFile)
      return download(url, filePath)
    })
  )
}

main()
