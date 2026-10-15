import ProductCard from "./ProductCard.jsx";

export default function ProductGrid({ products, empty = "No rugs in this collection yet." }) {
  if (!products?.length) {
    return <p className="py-16 text-center text-black/50">{empty}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} eager={index < 4} />
      ))}
    </div>
  );
}
