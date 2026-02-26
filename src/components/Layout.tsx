import React, { useEffect } from "react";
// import React from "react";
import { Helmet } from "react-helmet-async";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  icon?: string; // Tambahkan '?' agar opsional dan tidak error di halaman lain
}

// Berikan default value di sini: icon = "/vite.svg"
const Layout = ({ children, title, icon = "/vite.svg" }: LayoutProps) => {
  useEffect(() => {
    document.body.classList.add(
      "bg-slate-200",
      "dark:bg-slate-900",
      "text-slate-900",
      "dark:text-slate-100",
    );
    return () => {
      document.body.classList.remove(
        "bg-slate-200",
        "dark:bg-slate-900",
        "text-slate-900",
        "dark:text-slate-100",
      );
    };
  }, []);
  return (
    <div className="flex justify-center min-h-screen bg-slate-200 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Helmet>
        <title>{title ? `${title} | InformaTalks` : "InformaTalks"}</title>
        <link rel="icon" type="image/svg+xml" href={icon} />
      </Helmet>
      {/* <main className="border bg-slate-100 dark:bg-slate-800"> */}
        {children}
      {/* </main> */}
    </div>
  );
};

export default Layout;
