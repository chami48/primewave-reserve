import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f3ed] text-[#12212b]">
      <div className="mx-auto flex min-h-screen max-w-[1480px] flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-[#12212b]/12 pb-5">
          <Link href="/" className="flex items-center gap-3" aria-label="PrimeWave home">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#12212b] p-1.5">
              <Image src="/primewave-lab-icon.png" alt="PrimeWave Lab" width={28} height={28} className="size-full object-contain" />
            </span>
            <span className="text-sm font-bold tracking-[0.18em] uppercase">
              PrimeWave <span className="font-normal tracking-normal lowercase text-[#12212b]/55">reserve</span>
            </span>
          </Link>
          <Link href="/login" className="text-sm font-semibold text-[#12212b]/70 hover:text-[#12212b]">
            Sign in
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-7 inline-flex rounded-full border border-[#2a9d8f]/30 bg-[#2a9d8f]/10 px-3 py-1.5 text-xs font-bold tracking-[0.14em] text-[#14776e] uppercase">
              Calm, capable scheduling
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] text-[#12212b] sm:text-7xl lg:text-[5.7rem]">
              Make space for the work that matters.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#12212b]/62 sm:text-xl">
              PrimeWave gives your team one clear place to find, reserve, and manage the spaces and equipment that keep work moving.
            </p>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-[#12212b]/62">
              <span>Conflict-aware booking</span>
              <span>Fast approvals</span>
            </div>
          </div>

          <div className="relative lg:pl-10">
            <div className="absolute -right-24 -top-20 size-72 rounded-full bg-[#e5a85b]/25 blur-3xl" />
            <div className="relative border border-[#12212b]/12 bg-[#fffdfa] p-5 shadow-[0_24px_70px_rgba(18,33,43,0.10)] sm:p-7">
              <div className="flex items-start justify-between border-b border-[#12212b]/10 pb-5">
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-[#12212b]/45 uppercase">Workspace access</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">Where are you heading?</h2>
                </div>
                <span className="text-xs font-bold tracking-[0.16em] text-[#2a9d8f] uppercase">01 / 02</span>
              </div>
              <div className="mt-5 grid gap-3">
                <Link href="/login?role=employee" className="group flex items-center gap-4 border border-[#12212b]/10 bg-[#f5f3ed] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#2a9d8f]/55 hover:bg-[#edf8f6]">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#2a9d8f]/12 text-xs font-bold text-[#14776e]">01</span>
                  <span className="min-w-0 flex-1"><span className="block font-semibold">Employee workspace</span><span className="mt-0.5 block text-sm text-[#12212b]/52">Find a room or book equipment</span></span>
                </Link>
                <Link href="/login?role=admin" className="group flex items-center gap-4 border border-[#12212b]/10 bg-[#12212b] p-4 text-left text-[#f5f3ed] transition hover:-translate-y-0.5 hover:bg-[#1d3543]">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e5a85b]/20 text-xs font-bold text-[#f0bd76]">02</span>
                  <span className="min-w-0 flex-1"><span className="block font-semibold">Admin console</span><span className="mt-0.5 block text-sm text-[#f5f3ed]/58">Oversee resources and approvals</span></span>
                </Link>
              </div>
              <p className="mt-5 text-center text-xs text-[#12212b]/42">Secure access for every PrimeWave team</p>
            </div>
            <div className="absolute -bottom-8 -left-8 hidden size-24 rounded-full border border-[#e5a85b]/35 sm:block" />
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-[#12212b]/12 pt-5 text-xs text-[#12212b]/45 sm:flex-row sm:items-center sm:justify-between">
          <span>PrimeWave Reserve / Resource operations, made clear.</span>
          <span>© 2026 PrimeWave</span>
        </footer>
      </div>
    </main>
  );
}
