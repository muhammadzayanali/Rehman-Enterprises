import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts } from "../api/catalog";
import ProductGrid from "../components/products/ProductGrid.jsx";
import RoundLoader from "../components/ui/RoundLoader.jsx";

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({ featured: true })
      .then((data) => setFeatured(data.results))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="relative h-[62vh] min-h-[340px] overflow-hidden bg-black sm:h-[78vh] sm:min-h-[520px]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/main_page_vedio.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/25" />
        <div className="relative z-10 flex h-full items-end">
          <div className="container-wide pb-10 text-white sm:pb-16">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/80 sm:text-xs sm:tracking-[0.35em]">
              Heritage Home Decore
            </p>
            <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
              Handmade rugs from our own ateliers
            </h1>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2">
        <div className="flex items-center bg-mist px-5 py-14 sm:px-8 sm:py-20 lg:px-16">
          <div className="max-w-xl">
            <h2 className="text-3xl font-medium tracking-[0.06em] sm:text-4xl md:text-5xl md:tracking-[0.08em]">
              EXPERTS OF UNIQUE ART
            </h2>
            <p className="mt-6 text-[15px] leading-7 text-black/75 sm:mt-8">
              Rehman Enterprises creates award-winning, high quality hand knotted rugs & carpets
              in its own factories in Pakistan. Production in our own facilities allows us to create
              magnificent custom rugs under strict quality control. Elevate your space with luxury
              wool and designer rugs, crafted with precision and artistry.
            </p>
            <Link to="/collections" className="btn-light mt-8 sm:mt-10">
              Shop now
            </Link>
          </div>
        </div>
        <div className="min-h-[280px] sm:min-h-[420px]">
          <img
            src="/expert_of_unique_img.webp"
            alt="Luxury handmade rug in a living room"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="container-wide py-14 sm:py-20">
        <div className="mb-8 text-center sm:mb-12">
          <h2 className="section-title">New Arrivals</h2>
          <span className="mx-auto mt-3 block h-[2px] w-12 bg-brand-500" />
        </div>
        {loading ? (
          <RoundLoader className="py-16" />
        ) : (
          <ProductGrid products={featured} empty="Featured rugs will appear here once marked in admin." />
        )}
        <div className="mt-10 text-center sm:mt-14">
          <Link to="/collections" className="btn-dark">
            All collections
          </Link>
        </div>
      </section>

      <section className="relative min-h-[380px] overflow-hidden sm:min-h-[520px]">
        <img src="/Your_home_imag.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 flex min-h-[380px] items-center justify-center px-5 text-center text-white sm:min-h-[520px] sm:px-6">
          <div>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl">Your Home, Our Masterpiece</h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/90">
              Rehman Enterprises offers luxury designer area rugs in diverse styles. Splendid
              artistry, unmatched elegance.
            </p>
            <Link to="/collections" className="btn-light mt-8">
              Shop now
            </Link>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2">
        <div className="min-h-[280px] sm:min-h-[460px]">
          <img src="/Decor_&_Furniture_img.webp" alt="Decor and furniture" className="h-full w-full object-cover" />
        </div>
        <div className="flex items-center bg-mist px-5 py-14 sm:px-8 sm:py-16 lg:px-16">
          <div className="max-w-xl">
            <h2 className="text-3xl font-medium sm:text-4xl md:text-5xl">Decor & Furniture</h2>
            <p className="mt-6 text-[15px] leading-7 text-black/75 sm:mt-8">
              Timeless and evolving, we build spaces around the lives we lead. Handcrafted furniture,
              artisanal rugs, and carefully considered objects of good design.
            </p>
            <Link to="/collections" className="btn-dark mt-8 sm:mt-10">
              Shop now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
