import Link from "next/link";

export default function Home() {
  return (
   <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Link href={'/logIn'}>Go here for Login</Link>
      </div>
    </div>
  );
}
