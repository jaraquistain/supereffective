import { GetServerSidePropsContext } from 'next'

import { getSession } from '@pkg/auth/lib/serverside/getSession'
import { Membership } from '@pkg/database/lib/types'
import { getActivePatreonMembershipByUserId } from '@pkg/database/repositories/users/memberships'
import { serializeObject } from '@pkg/utils/lib/serialization/jsonSerializable'

import PageMeta from '#/features/pages/components/PageMeta'
import { ProfileView } from '#/features/users/views/ProfileView'
import { abs_url } from '#/primitives/legacy/Link/Links'

const Page = ({ membership }: { membership: any | undefined }) => {
  const membershipData = membership ? serializeObject<Membership>(membership) : undefined
  return (
    <div className={'page-container'}>
      <PageMeta
        metaTitle={'Profile - Supereffective'}
        metaDescription={''}
        robots={'noindex, nofollow'}
        canonicalUrl={abs_url('/profile')}
        lang={'en'}
      />
      <div className={'page-container bg-white bordered-container'}>
        <ProfileView membership={membershipData} />
      </div>
    </div>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getSession(ctx.req, ctx.res)
  if (!session?.currentUser?.uid) {
    return {
      props: {
        membership: undefined,
      },
    }
  }

  const membership = await getActivePatreonMembershipByUserId(session.currentUser.uid)

  return {
    props: {
      membership: membership ? serializeObject(membership) : undefined,
    },
  }
}

export default Page
