import React from 'react'
import { getWallets } from './action'
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import { ViewAllAccountsClient } from './client'

const ViewAllAccountsPage = async () => {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const wallets = await getWallets(user.id)

  return (
    <ViewAllAccountsClient wallets={wallets} />
  )
}

export default ViewAllAccountsPage