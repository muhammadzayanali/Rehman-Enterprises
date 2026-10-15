import { useState } from "react";
import RoundLoader from "./RoundLoader.jsx";

export default function SmartImage({
  src,
  alt = "",
  className = "h-full w-full object-cover",
  wrapClassName = "",
  aspectClass = "aspect-[3/4]",
  eager = false,
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className={`relative block overflow-hidden bg-mist ${aspectClass} ${wrapClassName}`}>
      {!loaded && (
        <span className="absolute inset-0 z-10 flex items-center justify-center">
          <RoundLoader size="sm" />
        </span>
      )}
      {src ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "low"}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className={`${className} ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
        />
      ) : null}
    </span>
  );
}
