"use client";

import { useEffect, useRef } from "react";

export default function BooksyWidget() {
  const widgetContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !widgetContainerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://booksy.com/widget/code.js?id=290619&country=pl&lang=pl";
    script.type = "text/javascript";
    script.async = true;
    widgetContainerRef.current.appendChild(script);

    return () => {
      widgetContainerRef.current?.removeChild(script);
    };
  }, []);

  return (
  <div>
    <div ref={widgetContainerRef}></div>
  </div>
  );
}
