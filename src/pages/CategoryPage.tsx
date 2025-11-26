import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogCard } from "@/components/BlogCard";

const CategoryPage = () => {
  const { category } = useParams();
  const categoryName = category?.replace(/-/g, ' ') || '';

  const { data: blogs, isLoading } = useQuery({
    queryKey: ['category-blogs', categoryName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          category:categories!inner(name)
        `)
        .eq('status', 'published')
        .ilike('category.name', categoryName)
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 capitalize">{categoryName}</h1>
        
        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : blogs && blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, index) => (
              <BlogCard key={blog.id} blog={blog} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No articles found in this category.
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoryPage;
