import { useContext, useState } from 'react'
import Link from 'next/link'

import pokemonEntries from '@app/data/builds/pokemon/pokemon-entries-minimal.min.json'
import { GameListItem, getGame, getGameSet } from '@app/src/domains/legacy/livingdex/games'
import { PokemonEntryMinimal } from '@app/src/domains/legacy/livingdex/pokemon'
import { GameLogo } from '@app/src/domains/legacy/livingdex/views/GameLogo'
import { Pokedex } from '@app/src/domains/legacy/pokedex/views/Pokedex'
import { useUserDexes } from '@app/src/domains/legacy/users/hooks/useUserDexes'
import { UserContext } from '@app/src/domains/legacy/users/state/UserContext'
import { useScrollToLocation } from '@app/src/hooks/legacy/useScrollToLocation'
import { LoadingBanner } from '@app/src/layouts/LegacyLayout/LoadingBanner'
import PageMeta from '@app/src/layouts/LegacyLayout/PageMeta'
import { abs_url } from '@app/src/primitives/legacy/Link/Links'
import { DexPokemon, NullableDexPokemon } from '@app/src/services/legacy/datastore/Entities'
import PkSpriteStyles from '@app/src/styles/legacy/PkSpriteStyles'
import styles from './missing.module.css'

export async function getServerSideProps() {
  return {
    props: {
      allPokemon: pokemonEntries,
    },
  }
}

type MissingPokemon = {
  game: GameListItem
  pokemon: PokemonEntryMinimal[]
  countSpecies: number
  countForms: number
}

const Page = ({ allPokemon }: { allPokemon: PokemonEntryMinimal[] }) => {
  useScrollToLocation()
  const [dexes, loadingDexes] = useUserDexes(useContext(UserContext))
  const [showShiny, setShowShiny] = useState(false)

  if (loadingDexes) {
    return <LoadingBanner />
  }

  if (dexes === null) {
    return <LoadingBanner content={<p>You need to be logged in to access this page.</p>} />
  }

  if (dexes.length === 0) {
    return (
      <LoadingBanner
        content={
          <div>
            You currently don't have any Pokédex to track. Try{' '}
            <Link href={'/apps/livingdex/new'}>creating one</Link> first.
            <div></div>
          </div>
        }
      />
    )
  }

  const shinyAnchor = (
    <span
      onClick={() => {
        setShowShiny(true)
      }}
      className={styles.nonShinyAnchor}
    >
      <i className={'icon-pkg-shiny'} /> View Shiny Mode
    </span>
  )

  const nonShinyAnchor = (
    <span
      onClick={() => {
        setShowShiny(false)
      }}
      className={styles.shinyAnchor}
    >
      <i className={'icon-pkg-pokedex'} /> View Normal Mode
    </span>
  )

  const missingPokemonByGame: MissingPokemon[] = []

  for (const dex of dexes) {
    let countSpecies = 0
    let countForms = 0

    const missingPokemon: PokemonEntryMinimal[] = []
    const boxesPokemon: DexPokemon[] = dex.boxes
      .reduce((acc, box) => acc.concat(box.pokemon), [] as NullableDexPokemon[])
      .filter(p => p !== null) as DexPokemon[]

    for (const pokemon of allPokemon) {
      if (showShiny && !pokemon.shinyReleased) {
        continue
      }
      if (showShiny && pokemon.shinyBase !== null) {
        continue
      }
      // if (pokemon.isForm) {
      //   continue
      // }
      if (boxesPokemon.some(p => p.pid === pokemon.id)) {
        if (!boxesPokemon.some(p => p.pid === pokemon.id && p.caught && p.shiny === showShiny)) {
          if (pokemon.isForm) {
            countForms++
          } else {
            countSpecies++
          }
          missingPokemon.push(pokemon)
        }
      }
    }

    if (missingPokemon.length > 0) {
      missingPokemonByGame.push({
        game: getGame(dex.gameId),
        pokemon: missingPokemon,
        countSpecies,
        countForms,
      })
    }
  }

  return (
    <div className={'page-container'} style={{ maxWidth: 'none' }}>
      <PkSpriteStyles />
      <PageMeta
        metaTitle={'Missing Pokémon - Living Pokédex Tracker - Supereffective.gg'}
        metaDescription={''}
        robots={'noindex,nofollow'}
        canonicalUrl={abs_url('/apps/livingdex/missing')}
        lang={'en'}
      />
      <div className={styles.topRightCallout}>
        {showShiny && nonShinyAnchor}
        {!showShiny && shinyAnchor}
      </div>
      <div className={'page-content'}>
        <div className={'text-center'}>
          <h2 className="main-title-outlined">
            <i className="icon-pkg-pokeball" /> Missing Pokémon
          </h2>
          <p className={styles.heroContent}>
            List of Pokémon that are not yet stored in each of your Living Pokédexes.
          </p>
        </div>
        {missingPokemonByGame.map(missingPokemon => {
          if (!missingPokemon.game.setId) {
            throw new Error('Missing game set id for ' + missingPokemon.game.id)
          }
          const gameSet = getGameSet(missingPokemon.game.id)
          if (showShiny && !gameSet.hasShinies) {
            return null
          }
          return (
            missingPokemon.pokemon.length > 0 && (
              <div className={styles.gameBlock} key={missingPokemon.game.id}>
                <Pokedex
                  pokemon={missingPokemon.pokemon}
                  useSearch={missingPokemon.pokemon.length >= 50}
                  showForms={true}
                  showCounts={true}
                  showShiny={showShiny}
                  className={styles.dex}
                >
                  <h3
                    style={{ fontSize: '1.6rem' }}
                    className="text-center"
                    title={'Pokémon ' + missingPokemon.game.name}
                  >
                    <div id={'g-' + missingPokemon.game.id} className="offset-anchor" />
                    <a href={'#g-' + missingPokemon.game.id}>
                      <GameLogo
                        game={missingPokemon.game.id}
                        ext=".png"
                        size={200}
                        asSwitchIcon={false}
                      />
                    </a>
                  </h3>
                  <p className={'text-center ' + styles.missingCount}>
                    Missing: {missingPokemon.countSpecies} species, {missingPokemon.countForms}{' '}
                    forms
                  </p>
                </Pokedex>
              </div>
            )
          )
        })}
      </div>
    </div>
  )
}

export default Page
