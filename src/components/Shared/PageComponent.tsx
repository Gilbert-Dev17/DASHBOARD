import React, { PropsWithChildren } from 'react'

const PageComponent = ({children}: PropsWithChildren) => {
  return (
    <section className={`w-full max-w-6xl mx-auto p-6 animation-fade-in flex flex-col min-h-[calc(100vh-5rem)]`}>
        {children}
    </section>
  )
}

export default PageComponent