// ?error=errorString

import { useRouter } from 'next/router'

import { Routes } from '#/config/routes'
import PageMeta from '#/features/pages/components/PageMeta'
import { ButtonInternalLink } from '#/primitives/legacy/Button/Button'
import { abs_url } from '#/primitives/legacy/Link/Links'

export default function Page() {
  const router = useRouter()
  const { error } = router.query
  let errorMessage: React.ReactNode = 'Unexpected sign in error'
  switch (String(error).toLowerCase()) {
    case 'verification':
      errorMessage = 'Sign In link is expired or has been already used'
      break
    case 'emailsignin':
      errorMessage =
        'Cannot send the Sign In link at this time due to an internal error. Please try again later.'
      break
    default:
      errorMessage = <>Unexpected sign up error{error ? <i>{`: ${error}`}</i> : ''}</>
  }
  return (
    <>
      <div className={'page-container'}>
        <PageMeta
          metaTitle={'Sign In error - Supereffective.gg'}
          metaDescription={''}
          robots={'noindex, nofollow'}
          canonicalUrl={abs_url('/auth/error')}
          lang={'en'}
        />
        <article className={'page-authored-content'}>
          <div className={'page-container text-center bordered-container bg-white'}>
            <h2>Sign In Error</h2>
            <p>❌ {errorMessage}</p>
            <ButtonInternalLink href={Routes.Login}>Login</ButtonInternalLink>
          </div>
        </article>
      </div>
    </>
  )
}
