import { Link, useLocation } from "react-router-dom";

const categories = [
  { name: "Home", path: "/" },
  { name: "Lifestyle", path: "/category/lifestyle" },
  { name: "Education", path: "/category/education" },
  { name: "Wellness", path: "/category/wellness" },
  { name: "Deals", path: "/category/deals" },
  { name: "Job Seeking", path: "/category/job-seeking" },
  { name: "Alternative Learning", path: "/category/alternative-learning" }
];

export const Header = () => {
  const location = useLocation();
  const isSearchPage = location.pathname.startsWith('/search');
  
  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-primary">
            tejastarin
          </Link>
          
          {!isSearchPage && (
            <nav className="hidden md:flex items-center gap-6">
              {categories.map((category) => (
                <Link
                  key={category.path}
                  to={category.path}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};
