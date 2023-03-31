import React, { useContext } from 'react'
import Link from 'next/link'

import { getGameSet } from '@app/src/domains/legacy/livingdex/games'
import { canCreateMoreDexes, getRealBoxesCount } from '@app/src/domains/legacy/livingdex/livingdex'
import { GameLogo } from '@app/src/domains/legacy/livingdex/views/GameLogo'
import { WelcomeContent } from '@app/src/domains/legacy/livingdex/views/WelcomeContent'
import { useUserDexes } from '@app/src/domains/legacy/users/hooks/useUserDexes'
import { UserContext } from '@app/src/domains/legacy/users/state/UserContext'
import { LoadingBanner } from '@app/src/layouts/LegacyLayout/LoadingBanner'
import { ButtonInternalLink } from '@app/src/primitives/legacy/Button/Button'
import { Dex } from '@app/src/services/legacy/datastore/Entities'
import { classNameIf, classNames } from '@app/src/utils/legacyUtils'
import styles from './Dashboard.module.css'

const GameCard = ({ dex }: { dex: Dex }) => {
  const dexLink = `/apps/livingdex/${dex.id}`
  //const socialLinks = dex.id ? <DexSocialLinks shareAsOwner={true} dexId={dex.id}/> : null
  const gameSetId = getGameSet(dex.gameId).id
  return (
    <Link href={dexLink}>
      <div
        className={[
          styles.gameCard,
          `bg-gr-teal dex-game-card`,
          `dex-gameset-card-${gameSetId} dex-game-card-${dex.gameId}`,
        ].join(' ')}
      >
        <div className={styles.gameCardBody}>
          <div className={styles.gameCardImage}>
            <GameLogo game={dex.gameId} size={180} asSwitchIcon={true} />
          </div>
          <div className={styles.gameCardStatsWrapper}>
            <div className={styles.gameCardStats}>
              {dex.boxes.length > 2 && (
                <span>
                  <i className="icon-pkg-box" /> {dex.boxes.length / 2}*
                </span>
              )}
              <span>
                <i className="icon-pkg-pokeball-outlined" /> {dex.caughtRegular} /{' '}
                {dex.totalRegular}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export const Dashboard = () => {
  const [dexes, loadingDexes] = useUserDexes(useContext(UserContext))

  if (loadingDexes) {
    return <LoadingBanner />
  }

  if (dexes === null || dexes.length === 0) {
    return (
      <div className={'page-container dex-count-0'}>
        <WelcomeContent />
      </div>
    )
  }

  return (
    <div className={'page-container dex-count-' + dexes.length}>
      <h2 className={'text-center main-title-outlined'}>
        <i className="icon-pkg-box-home" style={{ textShadow: 'none' }} /> Pokédex Tracker
      </h2>
      <div
        className="text-center"
        style={{ margin: '0 0 2rem 0', opacity: 1, fontSize: '1.5rem' }}
      ></div>
      <div
        className={classNames(
          styles.gameCardList,
          classNameIf(dexes.length === 1, styles.singleDex)
        )}
      >
        {dexes.map(dex => (
          <GameCard dex={dex} key={dex.id} />
        ))}
      </div>
      <p className="text-center" style={{ maxWidth: '500px', margin: '-1rem auto 2rem auto' }}>
        <br />
        <small>
          <i>
            <sup>(*) </sup> boxes required for each mode (regular or shiny).
          </i>
        </small>
      </p>
      <div className="text-center" style={{ margin: '0 0 4rem 0', opacity: 1, fontSize: '1.5rem' }}>
        {canCreateMoreDexes(dexes) && (
          <ButtonInternalLink href={'/apps/livingdex/new'} inverted={false}>
            + Add Game
          </ButtonInternalLink>
        )}
        <ButtonInternalLink href={'/apps/livingdex/missing'} inverted={true}>
          <i className="icon-pkg-pokeball-outlined" /> View Missing Pokémon
        </ButtonInternalLink>
      </div>
      <WelcomeContent />
    </div>
  )
}
