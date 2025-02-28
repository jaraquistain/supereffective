import { isDevelopmentEnv } from '@pkg/utils/lib/env'

import { getDefaultEmailProvider } from './getDefaultEmailProvider'
import { EmailMessage, EmailSenderResult } from './types'

if (isDevelopmentEnv()) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
}

export function sendMail(message: EmailMessage): Promise<EmailSenderResult> {
  return getDefaultEmailProvider().sendMail(message)
}
