import { useContext, useEffect, useRef } from 'react'
import { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/compat/router'

import { useSession } from '@pkg/auth/lib/hooks/useSession'
import { getSession } from '@pkg/auth/lib/serverside/getSession'
import { getGameSetByGameId } from '@pkg/database/repositories/game-sets'
import { GameSetId } from '@pkg/database/repositories/game-sets/ids'
import { GameId } from '@pkg/database/repositories/games/ids'
import { getLegacyLivingDexRepository } from '@pkg/database/repositories/living-dexes/legacy'
import { getPresets } from '@pkg/database/repositories/living-dexes/legacy/presets'
import { createDexFromPreset } from '@pkg/database/repositories/living-dexes/legacy/presets/createDexFromPreset'
import {
  LivingDexResolvedUserLimits,
  LoadedDex,
} from '@pkg/database/repositories/living-dexes/legacy/types'

import { Routes } from '#/config/routes'
import { LivingDexContext } from '#/features/livingdex/state/LivingDexContext'
import { useDexesContext } from '#/features/livingdex/state/LivingDexListContext'
import { GamePresetSelector } from '#/features/livingdex/views/GamePresetSelector'
import LivingDexApp from '#/features/livingdex/views/LivingDexApp'
import PageMeta from '#/features/pages/components/PageMeta'
import { LoadingBanner } from '#/layouts/LegacyLayout/LoadingBanner'
import { UnauthenticatedBanner } from '#/layouts/LegacyLayout/UnauthenticatedBanner'
import { ButtonInternalLink } from '#/primitives/legacy/Button/Button'
import { abs_url } from '#/primitives/legacy/Link/Links'
import PkSpriteStyles from '#/styles/legacy/PkSpriteStyles'
import { devLog } from '#/utils/logger'

interface PageProps {
  selectedGame: GameId | null
  selectedPreset: string | null
  limits: LivingDexResolvedUserLimits | null
}

const Page = ({ selectedGame, selectedPreset, limits }: PageProps) => {
  const auth = useSession()
  const livingdex = useContext(LivingDexContext)
  const { dexes, dexesLoading } = useDexesContext()
  const presetIsSelected = !(!selectedGame || !selectedPreset)
  const router = useRouter()
  const createdDexId = useRef<string | null>(null)
  const presets = getPresets()

  const onSaveHandler = (dex: LoadedDex): void => {
    if (!dex.id) {
      console.warn('Dex id is not set')
      return
    }
    createdDexId.current = dex.id
    router?.push(`/apps/livingdex/${dex.id}`)
  }

  useEffect(() => {
    if (livingdex.state && livingdex.state.id) {
      devLog('resetDex called')
      livingdex.actions.resetDex()
    }
  }, [livingdex.state])

  if (auth.isLoading() || dexesLoading) {
    return <LoadingBanner />
  }

  if (!auth.isAuthenticated() || !auth.isOperable() || !limits) {
    return <UnauthenticatedBanner />
  }

  if (createdDexId.current !== null) {
    return <LoadingBanner content={'Creating your dex...'} />
  }

  // console.log(limits)
  const _canCreateMoreDexes = limits.remainingDexes > 0

  if (!_canCreateMoreDexes && dexes != null) {
    return (
      <LoadingBanner
        content={
          <>
            Dex limit exceeded: {limits.maxDexes} <br />
            <br />
            You cannot create more dexes at this point.
            <br />
            Try deleting some of your existing dexes or consider becomign a Patron to...
            <br />
            <br />
            <ButtonInternalLink href={Routes.Donate}>
              Support us and unlock more features
            </ButtonInternalLink>
          </>
        }
      />
    )
  }

  let foundPreset = null
  let gameSet = undefined
  let gameSetId: GameSetId | '' = ''

  if (selectedGame) {
    gameSet = getGameSetByGameId(selectedGame)
    gameSetId = gameSet.id
  }

  if (presetIsSelected) {
    // find preset
    if (gameSetId === '' || presets[gameSetId] === undefined) {
      return <LoadingBanner content={'Game does not exist: ' + selectedGame} />
    }

    foundPreset = presets[gameSetId][selectedPreset]
    if (foundPreset === undefined) {
      return <LoadingBanner content={'Preset does not exist: ' + selectedPreset} />
    }
  }

  const boxSize = gameSet ? gameSet.storage?.boxCapacity : ''

  const containerClasses =
    `page-container dex-game full-main-height ` +
    `dex-gameset-${gameSetId} dex-game-${selectedGame} dex-preset-${selectedPreset} ` +
    `dex-boxsize-${boxSize}`

  return (
    <div style={{ maxWidth: 'none' }} className={containerClasses}>
      <PkSpriteStyles />
      <PageMeta
        metaTitle={'Living Dex - New'}
        metaDescription={''}
        robots={'noindex, nofollow'}
        canonicalUrl={abs_url('/apps/livingdex/new')}
        lang={'en'}
      />
      {!presetIsSelected && <GamePresetSelector resolvedLimits={limits} />}
      {presetIsSelected && foundPreset && (
        <LivingDexApp
          presets={presets}
          loadedDex={createDexFromPreset(
            selectedGame as GameId,
            foundPreset,
            auth.currentUser?.uid
          )}
          onSave={onSaveHandler}
        />
      )}
    </div>
  )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getSession(ctx.req, ctx.res)
  if (!session?.currentUser?.uid) {
    return {
      props: {
        selectedGame: ctx.query.game || null,
        selectedPreset: ctx.query.preset || null,
        limits: null,
      },
    }
  }

  try {
    const resolvedLimits = await getLegacyLivingDexRepository().getResolvedLimitsForUser(
      session.currentUser.uid
    )

    return {
      props: {
        selectedGame: ctx.query.game || null,
        selectedPreset: ctx.query.preset || null,
        limits: resolvedLimits,
      },
    }
  } catch (e) {
    console.error(e)
    return {
      notFound: true,
    }
  }
}

export default Page
