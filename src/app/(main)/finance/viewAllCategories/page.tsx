import React from 'react'
import { getCategoriesWithTotals } from './action'
import { getUser } from '@/lib/auth/get-user'
import { redirect } from 'next/navigation'
import { ViewAllCategoriesClient } from './client'

const ViewAllCategoriesPage = async () => {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const categories = await getCategoriesWithTotals(user.id)

  return (
    <ViewAllCategoriesClient categories={categories} />
  )
}

export default ViewAllCategoriesPage