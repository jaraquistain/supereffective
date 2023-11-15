import { NextApiRequest, NextApiResponse } from 'next'

import { apiGuard } from '@pkg/auth/lib/serverside/apiGuard'
import { getSession } from '@pkg/auth/lib/serverside/getSession'
import { removePatreonMembership } from '@pkg/database/repositories/users/memberships'
import { apiErrors } from '@pkg/utils/lib/types'

import { Routes } from '#/config/routes'

const unlinkPatreonAccount = async (
  res: NextApiResponse,
  userId: string,
  patreonMemberId: string | null
): Promise<boolean> => {
  const changedRecords = await removePatreonMembership(userId, patreonMemberId)

  return changedRecords > 0
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const httpMethod = req.method || 'GET'

  if (!['POST'].includes(httpMethod)) {
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

  const memberId = req.body.patreonMemberId || null
  if (!memberId) {
    console.error('body.patreonMemberId is null in unlink call')
    res.redirect(Routes.Profile + '?status=error&provider=patreon&action=unlink')
    return
  }

  const successful = await unlinkPatreonAccount(res, guard.user.uid, memberId)

  switch (httpMethod) {
    case 'POST': {
      if (successful) {
        res.redirect(Routes.Profile + '?status=ok&provider=patreon&action=unlink')
        return
      }
      console.error('unlinkPatreonAccount failed')
      res.redirect(Routes.Profile + '?status=error&provider=patreon&action=unlink')
      return
      break
    }
  }
}

export default handler
