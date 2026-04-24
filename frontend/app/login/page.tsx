import { SignIn } from '@clerk/nextjs';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function LoginPage() {
  return (
    <div className="bg-[#faf8f4] min-h-screen flex flex-col">
      <Navbar alwaysSolid />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <SignIn
          routing="hash"
          fallbackRedirectUrl="/account"
          appearance={{
            variables: {
              colorPrimary: '#4a7c59',
              colorBackground: '#ffffff',
              borderRadius: '0.75rem',
            },
            elements: {
              card: 'shadow-sm border border-gray-100',
              headerTitle: 'font-heading text-stone-800',
              formButtonPrimary: 'bg-brand-500 hover:bg-brand-600',
              footerActionLink: 'text-brand-600 hover:text-brand-700',
            },
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
