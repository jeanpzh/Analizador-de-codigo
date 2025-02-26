"use client";
import Link from "next/link";
import { examples } from "@/lib/examples";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background text-foreground">
      <nav className="w-64 bg-background border-r border-border p-4">
        <h1 className="text-2xl font-bold mb-6 text-primary">
          Analizador de Código
        </h1>
        <ul className="space-y-2">
          {examples.map((example, index) => (
            <li key={index}>
              <Link
                href={`/example/${index}`}
                className={cn(
                  "block py-2 px-4 rounded-md transition-colors duration-200",
                  pathname === `/example/${index}`
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-primary/5"
                )}
              >
                {example.name}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/"
          className={cn(
            "block mt-6 py-2 px-4 rounded-md transition-colors duration-200",
            pathname === "/" ? "bg-primary/10 text-primary" : "hover:bg-primary/5"
          )}
        >
          Inicio
        </Link>
      </nav>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}