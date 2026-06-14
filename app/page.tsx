import Hero from "../components/Hero";
import Features from "../components/Features";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen min-w-0 overflow-x-hidden bg-gray-50 text-gray-900">
      <Hero />

      <Features />

      <Footer />
    </main>
  );
}
