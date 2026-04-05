import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-surface-container-low border-t border-outline/10 text-on-surface py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link href="/" className="text-xl font-black tracking-tighter text-primary font-headline block">
            DeskWeave
          </Link>
          <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">
            © 2024 DESKWEAVE. THE DIGITAL ARCHITECT'S WORKSPACE.
          </p>
        </div>
        
        <div>
          <h4 className="font-headline font-bold text-sm tracking-widest text-on-surface-variant uppercase mb-4">Platform</h4>
          <ul className="space-y-3 text-sm text-on-surface font-medium">
            <li><Link href="#" className="hover:text-secondary transition-colors">About</Link></li>
            <li><Link href="#" className="hover:text-secondary transition-colors">Help Center</Link></li>
            <li><Link href="#" className="hover:text-secondary transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-headline font-bold text-sm tracking-widest text-on-surface-variant uppercase mb-4">Legal</h4>
          <ul className="space-y-3 text-sm text-on-surface font-medium">
            <li><Link href="#" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-secondary transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-headline font-bold text-sm tracking-widest text-on-surface-variant uppercase mb-4">Connect</h4>
          <div className="flex gap-4">
            <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe text-on-surface-variant"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            </button>
            <button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail text-on-surface-variant"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
