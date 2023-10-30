import { PkFilter, PkFilterAttribute } from '@pkg/database/repositories/living-dexes/legacy/types'
import { hasDevFeaturesEnabled } from '@pkg/utils/lib/env'

import { TextInput } from '#/primitives/legacy/Input/TextInput'

import { debounceCallback } from '../utils'
import { PkBoxGroupFilterProps } from './pkBoxTypes'

/**
 * @experimental This component is not yet ready for production use and will only be rendered
 * on development environments.
 */
export function PkBoxGroupFilter(props: PkBoxGroupFilterProps) {
  if (!hasDevFeaturesEnabled()) {
    return null
  }
  const FILTER_DEBOUNCE = 300 //milliseconds
  const FILTER_ATTRIBUTE: PkFilterAttribute = 'pid' // hard coding this for now but could be dynamic later
  const ATTRIBUTE_MAP = {
    pid: 'name',
    nid: 'number',
  }
  const { onChange } = props

  // Debounce our callback that was passed in so we don't call it more than we have to
  const debouncedFilter = debounceCallback(onChange, FILTER_DEBOUNCE)

  // wrap our debounced callback in a function that extracts the actual useful value out of the event
  // and turns it into a filter object
  const handleFilterInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value

    const filter: PkFilter | null = !query
      ? null
      : {
          query: e.target.value,
          attribute: FILTER_ATTRIBUTE,
        }

    debouncedFilter(filter)
  }

  return (
    <div className={'pkBoxGroupFilter'}>
      <form>
        <TextInput
          type="text"
          name="filter"
          placeholder={`Type in a Pokémon's ${ATTRIBUTE_MAP[FILTER_ATTRIBUTE]}`}
          onChange={handleFilterInput}
        />
      </form>
    </div>
  )
}
