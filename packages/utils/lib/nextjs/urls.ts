import { isDevelopmentEnv, isServerSide } from '../env'

export function getBaseUrl(): string {
  // get absolute url in client/browser
  if (!isServerSide()) {
    return location.origin
  }
  // get absolute url in server.
  return _getVercelUrl()
}

export function getFullUrl(path?: string): string {
  if (!path) return getBaseUrl()

  const sanitizedPath = path.replace(/^\/|\/$/g, '')
  return `${getBaseUrl()}${sanitizedPath ? '/' + sanitizedPath : '/'}`
}

function _getHttpProtocol() {
  if (isDevelopmentEnv()) return 'http://'
  return 'https://'
}

function _getVercelUrl(): string {
  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl && !vercelUrl.startsWith('http')) {
    return `${_getHttpProtocol()}${process.env.VERCEL_URL}`
  } else if (vercelUrl) {
    return vercelUrl
  }

  return ''
}
