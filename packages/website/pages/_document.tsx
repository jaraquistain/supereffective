import Document, { Head, Html, Main, NextScript } from 'next/document'

import mdxRefresh from '@pkg/mdx/lib/next-plugin/withMDXPageRefresh.meta'
import { isDevelopmentEnv } from '@pkg/utils/lib/env'

import DocumentHeadContent from '#/layouts/LegacyLayout/DocumentHeadContent'

class RootDocument extends Document {
  render() {
    return (
      <Html lang={'en'}>
        <Head>
          <DocumentHeadContent />
          {isDevelopmentEnv() && (
            // Forces a page refresh when a new MDX file is changed
            <meta name="x-mdx-refresh-timestamp" content={mdxRefresh.timestamp} />
          )}
          <script
            dangerouslySetInnerHTML={{
              __html: `
            // fix brave browser bug
            window.ethereum = {
              selectedAddress: undefined,
              ...(window.ethereum || {})
            }
          `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default RootDocument
