import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RecentPosts } from "@/components/RecentPosts";
import { RelatedSearches } from "@/components/RelatedSearches";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useEffect } from "react";
import { trackEvent } from "@/lib/tracking";

const BlogDetail = () => {
  const { slug } = useParams();

  const { data: blog, isLoading } = useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          category:categories(name)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (blog) {
      trackEvent({
        eventType: 'blog_view',
        eventData: { title: blog.title },
        blogId: blog.id
      });
    }
  }, [blog]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">Loading...</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          Article not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            {blog.category && (
              <Badge variant="secondary">{blog.category.name}</Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {format(new Date(blog.published_at), "MMM dd, yyyy")}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{blog.title}</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Author sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              <div className="flex lg:flex-col items-center lg:items-start gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarFallback>{blog.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{blog.author}</p>
                  <p className="text-sm text-muted-foreground">Author</p>
                </div>
              </div>
              
              <RecentPosts />
            </aside>
            
            {/* Main content */}
            <div className="lg:col-span-3 space-y-6">
              {blog.featured_image && (
                <img
                  src={blog.featured_image}
                  alt={blog.title}
                  className="w-full aspect-video object-cover rounded-lg"
                />
              )}
              
              <div className="prose prose-lg max-w-none">
                {blog.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
              
              <RelatedSearches blogId={blog.id} />
            </div>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogDetail;
