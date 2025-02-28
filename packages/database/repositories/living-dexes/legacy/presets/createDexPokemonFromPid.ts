import { getPokemonEntry, isShinyLocked } from '../../../pokemon'
import { PokemonId } from '../../../pokemon/ids'
import { DexPokemon } from '../types'
import { PresetDexPokemon } from './types'

export function createDexPokemonFromPid(
  boxTitle: string,
  pid: PresetDexPokemon,
  shiny: boolean = false
): DexPokemon {
  if (typeof pid === 'string') {
    const pkmEntry = getPokemonEntry(pid)
    return {
      pid: pid as PokemonId,
      nid: pkmEntry.nid,
      caught: false,
      shiny: shiny,
      shinyLocked: isShinyLocked(pid),
      shinyBase: pkmEntry.shiny.base,
      gmax: false,
      alpha: false,
    }
  }

  const pkmEntry = getPokemonEntry(pid.pid)
  return {
    pid: pid.pid,
    nid: pkmEntry.nid,
    caught: pid.caught === true,
    shiny: shiny || pid.shiny === true,
    shinyLocked: isShinyLocked(pid.pid) || pid.shinyLocked === true,
    shinyBase: pkmEntry.shiny.base,
    gmax: pid.gmax === true,
    alpha: pid.alpha === true,
  }
}
