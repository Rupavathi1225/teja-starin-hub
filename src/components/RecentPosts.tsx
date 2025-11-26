import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const RecentPosts = () => {
  const { data: recentBlogs } = useQuery({
    queryKey: ['recent-blogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, slug, featured_image, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data;
    }
  });

  if (!recentBlogs || recentBlogs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent posts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentBlogs.map((blog) => (
          <Link key={blog.id} to={`/blog/${blog.slug}`} className="flex gap-3 group">
            {blog.featured_image && (
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-16 h-16 object-cover rounded flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                {blog.title}
              </h4>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};
