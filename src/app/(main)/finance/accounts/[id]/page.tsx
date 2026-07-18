import { AccountStatement } from '@/components/expenses/AccountDetails/AccountStatement';

export default async function AccountDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
      <AccountStatement accountId={id} />
  );
}
