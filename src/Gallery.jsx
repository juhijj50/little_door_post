/*  The owner's gallery: photographs and nothing else — two rows of five, ten at
 *  a time, sliding sideways a column at a time — and any one of them full
 *  screen with arrows of its own.
 *
 *  The photos are the site's own files (content/images.js), uploaded and
 *  deleted from the admin panel, so this renders whatever list it is handed.
 *  Styling for the grid and the full-screen view is in site.css, which can hold
 *  the media queries.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { css } from "./css.js";

const Arrow = ({ dir }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
    <path
      d={dir === "left" ? "M12.5 4 6.5 10l6 6" : "M7.5 4l6 6-6 6"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function Lightbox({ photos, index, onClose, onGo }) {
  const photo = photos[index];
  const closeRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onGo(-1);
      if (e.key === "ArrowRight") onGo(1);
    };
    document.addEventListener("keydown", onKey);
    /* The page underneath stays put while a photo is open. */
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, onGo]);

  /* A swipe on a phone, left or right. */
  const touch = useRef(null);
  const onTouchStart = (e) => {
    touch.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touch.current === null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    if (Math.abs(dx) > 50) onGo(dx < 0 ? 1 : -1);
    touch.current = null;
  };

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Photograph"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button ref={closeRef} type="button" className="round-arrow lightbox__close" onClick={onClose} aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <path d="M4 4l10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      <button type="button" className="round-arrow lightbox__prev" onClick={() => onGo(-1)} aria-label="Previous photo">
        <Arrow dir="left" />
      </button>
      <figure className="lightbox__figure" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <img src={photo.src} alt={photo.caption || "A photograph from the owner's gallery"} />
      </figure>
      <button type="button" className="round-arrow lightbox__next" onClick={() => onGo(1)} aria-label="Next photo">
        <Arrow dir="right" />
      </button>
    </div>
  );
}

export default function Gallery({ photos, pending }) {
  const track = useRef(null);
  const [open, setOpen] = useState(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  /* Which arrows are worth showing as live. */
  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 2,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
    });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, photos.length]);

  const page = (dir) => {
    const el = track.current;
    /* A screenful: five columns, ten photographs. */
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  const go = useCallback(
    (by) => setOpen((i) => (i === null ? i : (i + by + photos.length) % photos.length)),
    [photos.length]
  );
  const close = useCallback(() => setOpen(null), []);

  if (pending) {
    return (
      <div className="gallery__track" aria-busy="true">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div key={i} className="gallery__tile" style={css(`opacity:${0.9 - (i >> 1) * 0.15};cursor:default`)} />
        ))}
      </div>
    );
  }

  if (!photos.length) return null;

  return (
    <div className="gallery">
      <div className="gallery__arrows">
        <button type="button" className="round-arrow" onClick={() => page(-1)} disabled={edges.start} aria-label="Earlier photos">
          <Arrow dir="left" />
        </button>
        <button type="button" className="round-arrow" onClick={() => page(1)} disabled={edges.end} aria-label="More photos">
          <Arrow dir="right" />
        </button>
      </div>

      <div className="gallery__track" ref={track} onScroll={measure}>
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            className="gallery__tile"
            onClick={() => setOpen(i)}
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
          >
            <img src={p.src} alt={p.caption || ""} loading={i < 10 ? "eager" : "lazy"} />
          </button>
        ))}
      </div>

      {open !== null && <Lightbox photos={photos} index={open} onClose={close} onGo={go} />}
    </div>
  );
}
