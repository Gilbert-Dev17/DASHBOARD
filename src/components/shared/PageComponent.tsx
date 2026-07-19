import React, { PropsWithChildren } from 'react'

const PageComponent = ({children}: PropsWithChildren) => {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 animation-fade-in py-6
    ">
        {children}
    </section>
  )
}

export default PageComponent