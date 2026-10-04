import Link from "next/link";

export default function Nav() {
  return (
    <header className="border-b border-line bg-paper sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl tracking-tight text-ink">
          Base clients <span className="text-moss">CA-GIP</span>
        </Link>
        <nav className="flex gap-6 text-sm text-ink/80">
          <Link href="/" className="hover:text-moss transition-colors">
            Contacts
          </Link>
          <Link href="/events" className="hover:text-moss transition-colors">
            Événements
          </Link>
        </nav>
      </div>
    </header>
  );
}
