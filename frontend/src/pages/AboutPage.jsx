export default function AboutPage() {
  return (
    <div>
      <section className="relative h-[240px] overflow-hidden sm:h-[360px] md:h-[430px]">
        <img src="/Our_Story_img.webp" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <h1 className="text-3xl font-medium sm:text-4xl md:text-5xl">About Us</h1>
          <p className="mt-3 text-sm text-white/80">Home / About Us</p>
        </div>
      </section>

      <section className="container-wide grid items-center gap-8 py-12 sm:gap-12 sm:py-20 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-medium sm:text-4xl">Our Story</h2>
          <span className="mt-4 inline-block h-[2px] w-12 bg-brand-500" />
          <p className="mt-3 text-xs uppercase tracking-[0.22em] text-black/45">
            About Rehman Enterprises
          </p>
          <p className="mt-6 max-w-xl text-[15px] leading-7 text-black/75">
            While the family business flourished in Lahore, Abdul Ghaffar decided to move beyond
            rugs & carpets trading to handmade rugs manufacturer. As the popularity of handmade
            rugs & carpets produced with vegetable dyes grew in the Europe, Rehman Enterprises
            began exporting over 3 million dollars worth of rugs & carpets every year since 2000
            to the Turkey, Europe and US.
          </p>
        </div>
        <img src="/Our_Story_img.webp" alt="Artisan painting a rug cartoon" className="w-full object-cover" />
      </section>

      <section className="container-wide grid items-center gap-8 pb-10 sm:gap-12 lg:grid-cols-2">
        <img src="/who_we_are_img.jpg" alt="Rug cartoon and yarns" className="w-full object-cover" />
        <div>
          <h2 className="text-3xl font-medium sm:text-4xl">Who We Are ?</h2>
          <span className="mt-4 inline-block h-[2px] w-12 bg-brand-500" />
          <p className="mt-3 text-xs uppercase tracking-[0.22em] text-black/45">
            The high stress favourite
          </p>
          <div className="mt-6 space-y-4 text-[15px] leading-7 text-black/75">
            <p>
              International buyers and customers have always been attracted to fine quality, hand
              knotted wool rugs & carpets as they are representative of the inherent style and
              traditions corresponding to various places across the globe and we become a top rugs
              suppliers in USA. Additionally, these rugs, produced by our expert designers and
              weavers, are known for their unmatched durability, quality and finish. Carpet
              connoisseurs in US, Europe and Turkey are more than satisfied with our wool and the
              authentic approach of the methods utilized by our artisans.
            </p>
            <p>
              Our use of vegetable dyes made from walnuts, pomegranates, flowers, and onions
              reflect the ethnic diversity of the country, therefore, creating a distinctive upgrade
              to the appearance of any place or setting. The superior quality of the materials and
              complexity of the design process affects the time required to create these special
              rugs increasing their value as collectibles of the future. This unique art in luxury
              handmade rugs in USA has been passed down through generations producing the finest
              quality carpets at the best prices. Our strong point is utilizing our exclusive
              washing process creating an antique appearance to each rug of more than 100 years old.
            </p>
          </div>
        </div>
      </section>

      <section className="container-wide grid items-center gap-8 py-12 sm:gap-12 sm:py-16 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-medium sm:text-4xl">Who We Are ?</h2>
          <span className="mt-4 inline-block h-[2px] w-12 bg-brand-500" />
          <p className="mt-3 text-xs uppercase tracking-[0.22em] text-black/45">
            The high stress favourite
          </p>
          <p className="mt-6 text-[15px] leading-7 text-black/75">
            From the Lahore ateliers to homes across Turkey, Europe and the United States, every
            carpet is finished under our own roof. That is why Heritage Home Decore can hold the
            line on quality without giving up the irregular, human beauty of a handmade rug.
          </p>
        </div>
        <img src="/how_are_img.webp" alt="Finished rug in a living room" className="w-full object-cover" />
      </section>
    </div>
  );
}
