import React, { PropsWithChildren } from 'react'

const PageComponent = ({children}: PropsWithChildren) => {
  return (
    <section className="w-full max-w-6xl mx-auto p-6 animation-fade-in
    ">
        {children}
    </section>
  )
}

export default PageComponent