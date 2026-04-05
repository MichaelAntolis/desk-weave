import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface flex flex-col relative">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="absolute top-4 left-4 z-50 md:hidden">
        <Link href="/" className="text-xl font-black tracking-tighter text-primary font-headline">
          DeskWeave
        </Link>
      </div>
      {children}
    </div>
  );
}
