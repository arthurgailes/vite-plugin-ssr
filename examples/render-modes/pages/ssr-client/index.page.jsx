import React from 'react'
export { Page }

import './index.css'

const Loading = () => <div>Loading</div>
function Page() {
  return (
    <>
      <h1>SSR</h1>
      <p>This page is:</p>
      <ul>
        <li>Rendered to HTML and hydrated in the browser.</li>
        <li>
          Interactive. <ClientSideComponent />
        </li>
      </ul>
      <p className="colored ssr">Blue text.</p>
    </>
  )
}

function ClientSideComponent() {
  const isBrowser = typeof window !== 'undefined'
  const isNodejs = !isBrowser

  // We skip rendering the interactive map on the server-side (SSR'ing a map is mostly useless).
  if (isNodejs) {
    return <Loading />
  }

  // We lazily load `<SomeHeavyMapComponent>`
  const Counter = React.lazy(() => import('./Counter'))
  return (
    <React.Suspense fallback={<Loading />}>
      <Counter />
    </React.Suspense>
  )
}
