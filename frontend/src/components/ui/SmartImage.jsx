import { useState } from "react";
import RoundLoader from "./RoundLoader.jsx";

export default function SmartImage({
  src,
  alt = "",
  className = "",
  wrapClassName = "",
  aspectClass = "aspect-[3/4]",
  fit = "contain",
  eager = false,
  natural = false,
}) {
  const [loaded, setLoaded] = useState(false);
  const objectFit = fit === "cover" ? "object-cover" : "object-contain";

  if (natural) {
    return (
      <span className={`relative block bg-white ${wrapClassName}`}>
        {!loaded && (
          <span className="absolute inset-0 z-10 flex min-h-40 items-center justify-center">
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
            className={`mx-auto block h-auto w-full object-contain ${className} ${
              loaded ? "opacity-100" : "opacity-0"
            } transition-opacity duration-300`}
          />
        ) : null}
      </span>
    );
  }

  return (
    <span className={`relative block overflow-hidden bg-white ${aspectClass} ${wrapClassName}`}>
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
          className={`absolute inset-0 h-full w-full ${objectFit} object-center ${className} ${
            loaded ? "opacity-100" : "opacity-0"
          } transition-opacity duration-300`}
        />
      ) : null}
    </span>
  );
}
