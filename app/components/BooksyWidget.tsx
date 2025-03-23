"use client";

import { useEffect, useRef, useState } from "react";

export default function BooksyWidget() {
  const widgetContainerRef = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !widgetContainerRef.current) return;

    const scriptId = "booksy-widget-script";
    if(!document.getElementById(scriptId)){

      const script = document.createElement("script");
      script.id = scriptId
      script.src = "https://booksy.com/widget/code.js?id=290619&country=pl&lang=pl";
      script.type = "text/javascript";
      script.async = true;
      widgetContainerRef.current.appendChild(script);

    } else {
      setIsLoaded(true);
    }

  }, [isLoaded]);

  return (
  <div>
    <div ref={widgetContainerRef}></div>
  </div>
  );
}
