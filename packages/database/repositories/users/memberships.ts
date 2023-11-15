import patreon from '@pkg/patreon/lib/patreonClient'
import {
  PATREON_CAMPAIGN_ID,
  PATREON_NO_TIER,
  PATREON_TIERS,
  PATREON_TIERS_BY_ID,
} from '@pkg/patreon/lib/types/campaign'

import { Membership } from '../../lib/types'
import { getPrismaClient } from '../../prisma/getPrismaClient'

export async function getActivePatreonMembershipByUserId(
  userId: string
): Promise<Membership | null> {
  const membership = await getPatreonMembershipByUserId(userId)

  if (!membership) {
    return null
  }

  if (membership.expiresAt && membership.expiresAt < new Date()) {
    // membership expired
    return null
  }

  return membership
}

async function getPatreonMembershipByUserId(userId: string): Promise<Membership | null> {
  const client = getPrismaClient()

  const record = await client.membership.findFirst({
    where: {
      userId,
    },
  })

  return record || null
}

export async function getPatreonMembershipByMemberId(
  patreonMemberId: string
): Promise<Membership | null> {
  const client = getPrismaClient()

  const record = await client.membership.findFirst({
    where: {
      patreonMemberId,
    },
  })

  return record || null
}

export async function linkPatreonAccount(
  userId: string,
  accessToken: string,
  creatorAccessToken: string
): Promise<Membership | undefined> {
  const patron = await patreon.getIdentity(accessToken)

  if (!patron) {
    throw new Error('linkPatreonAccount: patreon.getIdentity call failed')
  }

  const memberData = await patreon.findMembership(creatorAccessToken, patron)

  if (!memberData) {
    console.warn(`linkPatreonAccount: could not find membership for user ${userId}`)
    return
  }

  const tier = Object.values(PATREON_TIERS).find(
    tier => tier.name === memberData.tier.attributes.title
  )

  if (!tier) {
    throw new Error(`linkPatreonAccount: invalid tier: "${memberData.tier.attributes.title}"`)
  }

  const record = await addPatreonMembership(userId, {
    currentTier: tier.id,
    patreonMemberId: memberData.membership.id,
    patreonUserId: memberData.user.id,
    provider: 'patreon',
    patronStatus: memberData.membership.attributes.patron_status,
    totalContributed: memberData.membership.attributes.lifetime_support_cents,
  })

  if (!record) {
    console.error(
      `linkPatreonAccount: could not add membership for user ${userId}. Patron data: ${JSON.stringify(
        memberData,
        null,
        2
      )}`
    )

    throw new Error(`linkPatreonAccount: could not add membership for user ${userId}`)
  }

  return record
}

export async function addPatreonMembership(
  userId: string,
  data: {
    currentTier: string
    patreonUserId: string
    patreonMemberId: string
    patronStatus: string
    provider: string
    totalContributed: number
  }
): Promise<Membership | null> {
  const client = getPrismaClient()
  const tier = PATREON_TIERS_BY_ID[data.currentTier]
  if (!tier) {
    throw new Error(`Invalid tier ${data.currentTier}`)
  }

  const record = await client.membership.create({
    data: {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      currentTier: tier.id,
      highestTier: tier.id,
      rewardMaxDexes: tier.rewards.maxDexes,
      rewardFeaturedStreamer: tier.rewards.featuredStreamer,
      patreonCampaignId: PATREON_CAMPAIGN_ID,
      userId,
    },
  })

  return record
}

export async function updatePatreonMembership(
  userId: string,
  patreonMemberId: string,
  data: {
    currentTier: string
    patronStatus: string
    totalContributed: number
  }
): Promise<number> {
  const client = getPrismaClient()
  const tier = PATREON_TIERS_BY_ID[data.currentTier]
  if (!tier) {
    throw new Error(`Invalid tier ${data.currentTier}`)
  }

  const record = await client.membership.updateMany({
    where: {
      userId,
      patreonMemberId,
    },
    data: {
      ...data,
      updatedAt: new Date(),
      currentTier: tier.id,
      rewardMaxDexes: tier.rewards.maxDexes,
      rewardFeaturedStreamer: tier.rewards.featuredStreamer,
    },
  })

  return record.count
}

export async function removePatreonMembership(
  userId: string,
  patreonMemberId: string | null
): Promise<number> {
  const client = getPrismaClient()

  const result = await client.membership.deleteMany({
    where: {
      userId,
      patreonMemberId,
    },
  })

  return result.count
}

export function createMembershipPlaceholder(userId: string): Membership {
  return {
    id: '0',
    currentTier: PATREON_NO_TIER.id,
    highestTier: PATREON_NO_TIER.id,
    rewardMaxDexes: PATREON_NO_TIER.rewards.maxDexes,
    rewardFeaturedStreamer: PATREON_NO_TIER.rewards.featuredStreamer,
    patreonMemberId: null,
    patreonCampaignId: PATREON_CAMPAIGN_ID,
    patreonUserId: null,
    patronStatus: null,
    provider: 'patreon',
    expiresAt: null,
    totalContributed: 0,
    overridenRewards: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId,
  }
}
