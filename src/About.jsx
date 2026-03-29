import { Link } from 'react-router-dom';
import SiteFooter from './SiteFooter';

const BIO_PARAGRAPHS = [
  "Droplift is a Texas-based post-grunge rock band forged in 2017 with a sound that hits hard and lingers long. Built around the rare dynamic of dual lead vocalists — Tony Zamora and Angus Barrs, who also holds down the low end on bass — Droplift brings a layered intensity to the genre with lyrics that are immediately relatable.",
  "Tony and Angus are the songwriting core of the band; equal parts creative tension and genuine emotional depth create a lyrical territory that is dark and brooding - introspective, heavy, and shot through with the kind of raw emotion that defined a generation of hard rock.",
  "Fans of Nickelback's arena-sized emotional wallop, Crossfade's brooding aggression, and the hypnotic grunge-steeped atmosphere of Bush will find themselves immediately at home. Two distinct voices lock in melodic harmony reminiscent of Alice in Chains countervailing melodies and give Droplift a distinct sound.",
  "Guitarist Marshall Benson provides driving rhythm and heater guitar solos over Jonathan Renner's relentless and powerful drumming.",
  "Rooted in the gritty tradition of post-grunge while pushing into modern alternative territory, Droplift's driving rhythmic approach combines with rich vocal harmonies to elevate the genre to a unique level.",
];

function About() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav bar */}
      <header className="border-b border-gray-800 px-6 py-4 grid grid-cols-3 items-center bg-gradient-to-r from-red-700 to-brand-orange">
        <Link to="/" className="text-white font-black text-2xl tracking-widest uppercase">
          Droplift
        </Link>
        <nav className="flex items-center justify-center gap-6">
          <Link to="/about" className="text-white text-sm uppercase tracking-wider">
            About
          </Link>
          <Link to="/shows" className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors">
            Shows
          </Link>
          <Link to="/store" className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors">
            Store
          </Link>
          <Link to="/contact" className="text-white/80 hover:text-white text-sm uppercase tracking-wider transition-colors">
            Contact
          </Link>
        </nav>
        <div />
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl text-brand-orange tracking-wider mb-8" style={{ fontFamily: "'Special Elite', cursine" }}>
          About
        </h1>

        {/* Band photo */}
        <img
          src="https://squarespacemusic.blob.core.windows.net/$web/Droplift%20(5%20of%207).jpg"
          alt="Droplift band photo"
          className="w-full rounded-xl object-cover mb-10 shadow-2xl"
        />

        {/* Bio */}
        <div className="space-y-5">
          {BIO_PARAGRAPHS.map((para, i) => (
            <p key={i} className="text-gray-300 leading-relaxed text-base md:text-lg">
              {para}
            </p>
          ))}
        </div>
      </main>      <SiteFooter />    </div>
  );
}

export default About;
