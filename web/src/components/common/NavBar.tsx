"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/context";

const NavBar = function NavBar() {
  const { t } = useT();
  const pathname = usePathname();
  const isFeed = pathname === "/" || pathname.startsWith("/feed");
  const isSaved = pathname === "/saved";

  return (
    <aside className="sidebar">
      <nav>
        <div className="sidebar-section">
          <Link href="/" className={`sidebar-btn ${isFeed ? "active" : ""}`} style={{ textDecoration: "none" }}>
            {t("nav.feed")}
          </Link>
          <Link href="/saved" className={`sidebar-btn ${isSaved ? "active" : ""}`} style={{ textDecoration: "none" }}>
            {t("nav.saved")}
          </Link>
        </div>
      </nav>
    </aside>
  );
};

export default memo(NavBar);
