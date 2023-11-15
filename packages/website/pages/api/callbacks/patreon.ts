import { NextApiRequest, NextApiResponse } from 'next'

import { apiGuard } from '@pkg/auth/lib/serverside/apiGuard'
import { getSession } from '@pkg/auth/lib/serverside/getSession'
import { envVars } from '@pkg/config/default/env'
import { Membership } from '@pkg/database/lib/types'
import { linkPatreonAccount } from '@pkg/database/repositories/users/memberships'
import patreon from '@pkg/patreon/lib/patreonClient'
import { apiErrors } from '@pkg/utils/lib/types'

import config from '#/config'
import { Routes } from '#/config/routes'

const _linkPatreonAccount = async (
  userId: string,
  accessToken: string
): Promise<Membership | undefined> => {
  const record = await linkPatreonAccount(
    userId,
    accessToken,
    envVars.PATREON_CREATOR_ACCESS_TOKEN
  ).catch(e => {
    console.error(e)
  })

  return record || undefined
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const httpMethod = req.method || 'GET'

  if (!['GET'].includes(httpMethod)) {
    res.status(apiErrors.notAllowed.statusCode).json(apiErrors.notAllowed.data)
    return
  }

  const session = await getSession(req, res)

  const guard = apiGuard(session)
  if (!guard.allowed) {
    res.redirect(Routes.Login)
    res.status(guard.statusCode).json(guard.data)
    return
  }

  const { code } = req.query
  if (!code || typeof code !== 'string') {
    // code is empty or not a string
    res.status(apiErrors.invalidRequest.statusCode).json(apiErrors.invalidRequest.data)
    return
  }

  const oauthTokenData = await patreon.createAccessToken(
    code,
    envVars.PATREON_CLIENT_ID,
    envVars.PATREON_CLIENT_SECRET,
    config.patreon.oauthRedirectUrl
  )

  if (!oauthTokenData) {
    // code is invalid or something went wrong when using Patreon OAuth API
    res.status(apiErrors.notAuthorized.statusCode).json(apiErrors.notAuthorized.data)
    return
  }

  const membership = await _linkPatreonAccount(guard.user.uid, oauthTokenData.access_token)

  console.log('----------------------------------')

  switch (httpMethod) {
    case 'GET': {
      if (membership) {
        console.log(`membership linked: ${JSON.stringify(membership, null, 2)}`)
        res.redirect(Routes.Profile + '?status=ok&provider=patreon&action=link')
        return
      }
      console.log(`membership could not be linked: ${JSON.stringify(membership, null, 2)}`)
      res.redirect(
        Routes.Profile + '?status=error&provider=patreon&action=link&error=no_membership'
      )
      return
    }
  }
}

export default handler
