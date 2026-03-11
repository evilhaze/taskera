"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ScrollToCreateProject() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("create") !== "project") return;
    const el = document.getElementById("create-project");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchParams]);

  return null;
}
