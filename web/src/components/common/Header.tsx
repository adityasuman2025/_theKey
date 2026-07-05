"use client";

import { memo, useCallback } from "react";
import { useUser } from "@/context/user";
import { useT } from "@/i18n/context";
import type { Locale } from "@/i18n/catalog";

const Header = function Header() {
  const { currentUser, setCurrentUser, users } = useUser();
  const { locale, setLocale, t } = useT();

  const handleUserChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const u = users.find((user) => user.id === e.target.value);
      if (u) setCurrentUser(u);
    },
    [users, setCurrentUser]
  );

  const handleLocaleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setLocale(e.target.value as Locale);
    },
    [setLocale]
  );

  return (
    <header className="app-header">
      <h1>Forum</h1>
      <div className="header-right">
        <div className="header-control">
          <label htmlFor="user-select">{t("header.user_simulator")}</label>
          <select
            id="user-select"
            value={currentUser?.id ?? ""}
            onChange={handleUserChange}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
        <div className="header-control">
          <label htmlFor="lang-select">{t("header.language")}</label>
          <select
            id="lang-select"
            value={locale}
            onChange={handleLocaleChange}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default memo(Header);
