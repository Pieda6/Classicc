export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-x pt-6 md:pt-12">
      <div className="grid lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
        <div className="hidden lg:block relative card overflow-hidden min-h-[560px] bg-stone">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/about-2.svg" alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/40 to-transparent text-paper">
            <p className="font-display text-3xl font-semibold">Members get more.</p>
            <p className="mt-2 text-sm text-paper/85">Faster checkout, saved addresses and live order tracking.</p>
          </div>
        </div>
        <div className="card p-6 md:p-12 flex flex-col justify-center">{children}</div>
      </div>
    </div>
  );
}
