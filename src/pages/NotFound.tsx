import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: rută inexistentă:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div>
        <p className="micro-label">ideo ideis #21</p>
        <h1 className="mt-3 text-5xl font-bold text-primary">404</h1>
        <p className="mt-4 text-lg">Pagina asta nu există.</p>
        <Link to="/" className="mt-6 inline-block font-semibold text-primary">
          ‹ înapoi la formular
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
