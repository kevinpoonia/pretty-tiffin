import { SignIn } from '@clerk/nextjs';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function LoginPage() {
  return (
    <div className="bg-brand-50 min-h-screen flex flex-col font-sans">
      <Navbar alwaysSolid />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <SignIn
          routing="hash"
          fallbackRedirectUrl="/account"
          signUpUrl="/signup"
          appearance={{
            variables: {
              colorPrimary: '#434A31',
              colorBackground: '#ffffff',
              borderRadius: '0',
            },
            elements: {
              card: 'shadow-sm border border-brand-100 rounded-none',
              headerTitle: 'font-heading text-stone-900 uppercase tracking-tight',
              headerSubtitle: 'text-[10px] font-bold uppercase tracking-widest text-stone-400',
              formButtonPrimary: 'bg-brand-500 hover:bg-brand-600 rounded-none uppercase tracking-[0.2em] text-[10px] py-4',
              footerActionLink: 'text-brand-500 hover:text-brand-700 font-bold uppercase tracking-widest text-[10px]',
              socialButtonsBlockButton: 'rounded-none border-brand-100 uppercase tracking-widest text-[9px] font-bold',
              formFieldInput: 'rounded-none border-brand-100 focus:border-brand-500 focus:ring-0',
              formFieldLabel: 'uppercase tracking-widest text-[9px] font-bold text-stone-500',
            },
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
