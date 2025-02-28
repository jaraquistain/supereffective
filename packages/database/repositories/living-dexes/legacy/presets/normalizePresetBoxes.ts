import { getGameSetByGameId } from '../../../game-sets'
import { GameId } from '../../../games/ids'
import { NullablePresetDexPokemon, PresetDex, PresetDexBox } from './types'

export function normalizePresetBoxes(gameId: GameId, preset: PresetDex): PresetDexBox[] {
  const gameSet = getGameSetByGameId(gameId)
  const maxBoxes = gameSet.storage?.boxes || 0
  let boxes = preset.boxes
  if (maxBoxes <= 1) {
    // join all pokemon in a single box
    return [
      {
        pokemon: preset.boxes.reduce(
          (acc, box) => acc.concat(box.pokemon),
          [] as NullablePresetDexPokemon[]
        ),
      },
    ]
  }
  return boxes
}
