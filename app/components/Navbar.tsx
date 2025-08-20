import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleWipe = async () => {
    if (
      confirm("⚠️ Are you sure you want to wipe all app data? This cannot be undone.")
    ) {
      await kv.flush();
      alert("All app data has been cleared.");
      location.reload();
    }
  };

  // Close sidebar with ESC key (accessibility)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <nav className="navbar flex justify-between items-center px-6 py-4 relative border-b border-gray-200">
      {/* Left: Logo */}
      <Link to="/">
        <p className="text-2xl font-bold text-gradient">RESUME METRICS</p>
      </Link>

      {/* Desktop Actions */}
      <div className="hidden md:flex items-center gap-3">
        <Link
          to="/upload"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Upload Resume
        </Link>

        {auth.isAuthenticated ? (
          <button
            onClick={() => auth.signOut()}
            className="border border-gray-500 text-gray-700 hover:bg-gray-100 cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Sign Out
          </button>
        ) : (
          <button
            onClick={() => navigate("/auth?next=/")}
            className="border border-blue-500 text-blue-600 hover:bg-blue-50 cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Sign In
          </button>
        )}

        <button
          onClick={handleWipe}
          className="border border-red-500 text-red-500 cursor-pointer hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Wipe App Data
        </button>
      </div>

      {/* Mobile Hamburger */}
      <button
        className="md:hidden p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
        onClick={() => setMobileOpen(true)}
      >
        {/* Hamburger Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 transition-opacity ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {/* Background overlay */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />

        {/* Sidebar */}
        <div
          className={`absolute right-0 top-0 h-full w-64 bg-white shadow-xl p-6 flex flex-col gap-4 transform transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Close Button */}
          <button
            className="self-end mb-4"
            onClick={() => setMobileOpen(false)}
          >
            {/* X Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Upload Resume */}
          <Link
            to="/upload"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            onClick={() => setMobileOpen(false)}
          >
            Upload Resume
          </Link>

          {/* Auth */}
          {auth.isAuthenticated ? (
            <button
              onClick={() => {
                auth.signOut();
                setMobileOpen(false);
              }}
              className="border border-gray-500 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => {
                navigate("/auth?next=/");
                setMobileOpen(false);
              }}
              className="border border-blue-500 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Sign In
            </button>
          )}

          {/* Wipe */}
          <button
            onClick={() => {
              handleWipe();
              setMobileOpen(false);
            }}
            className="border border-red-500 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Wipe App Data
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
