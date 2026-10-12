import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center px-4 bg-bg">
      <div className="text-center">
        <p className="font-display font-semibold text-[clamp(6rem,22vw,14rem)] leading-none tracking-tight">404</p>
        <p className="mt-2 text-lg">This page has been retired from the collection.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn btn-dark">Go home</Link>
          <Link href="/shop" className="btn btn-light">Shop</Link>
        </div>
      </div>
    </div>
  );
}
