export enum PatreonTier {
  None = 'None',
  Free = 'Free', // Former patron
  Basic = 'Basic',
  Advanced = 'Advanced',
  Pro = 'Pro',
}

export type PatreonTierData = {
  id: string
  name: `${PatreonTier}`
  level: number
  rewards: {
    maxDexes: number
    featuredStreamer: boolean
  }
}

export const PATREON_CREATOR_ID = '79731045'
export const PATREON_CREATOR_HANDLE = 'supereffective'
export const PATREON_CAMPAIGN_ID = '9272063'

export const PATRON_STATUS_ACTIVE = 'active_patron'

export const PATREON_TIERS: {
  [key in PatreonTier]: PatreonTierData
} = {
  [PatreonTier.None]: {
    id: '0',
    name: 'None',
    level: 0,
    rewards: {
      maxDexes: 5,
      featuredStreamer: false,
    },
  },
  [PatreonTier.Free]: {
    id: '10635626',
    name: 'Free',
    level: 0,
    rewards: {
      maxDexes: 10,
      featuredStreamer: false,
    },
  },
  [PatreonTier.Basic]: {
    id: '9094266',
    name: 'Basic',
    level: 1,
    rewards: {
      maxDexes: 25,
      featuredStreamer: false,
    },
  },
  [PatreonTier.Advanced]: {
    id: '9094285',
    name: 'Advanced',
    level: 2,
    rewards: {
      maxDexes: 50,
      featuredStreamer: false,
    },
  },
  [PatreonTier.Pro]: {
    id: '9094357',
    name: 'Pro',
    level: 3,
    rewards: {
      maxDexes: 100,
      featuredStreamer: true,
    },
  },
}

export const PATREON_NO_TIER: PatreonTierData = PATREON_TIERS[PatreonTier.None]
export const PATREON_TIERS_BY_ID = {
  [PATREON_TIERS[PatreonTier.None].id]: PATREON_TIERS[PatreonTier.None],
  [PATREON_TIERS[PatreonTier.Basic].id]: PATREON_TIERS[PatreonTier.Basic],
  [PATREON_TIERS[PatreonTier.Advanced].id]: PATREON_TIERS[PatreonTier.Advanced],
  [PATREON_TIERS[PatreonTier.Pro].id]: PATREON_TIERS[PatreonTier.Pro],
}

export const PATREON_TIER_IDS = Object.values(PATREON_TIERS).map(tier => tier.id)
