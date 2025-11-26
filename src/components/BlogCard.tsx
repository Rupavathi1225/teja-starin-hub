import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface BlogCardProps {
  blog: {
    id: string;
    title: string;
    slug: string;
    featured_image: string | null;
    published_at: string;
    author: string;
    category?: {
      name: string;
    };
  };
  index?: number;
}

export const BlogCard = ({ blog, index }: BlogCardProps) => {
  return (
    <Link to={`/blog/${blog.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {blog.featured_image && (
          <div className="aspect-video overflow-hidden">
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            {blog.category && (
              <Badge variant="secondary" className="text-xs">
                {blog.category.name}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {format(new Date(blog.published_at), "MMM dd, yyyy")}
            </span>
            {index !== undefined && (
              <span className="ml-auto text-xs font-medium text-muted-foreground">
                #{index + 1}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold mb-2 line-clamp-2">{blog.title}</h3>
          <p className="text-sm text-muted-foreground">By {blog.author}</p>
        </CardContent>
      </Card>
    </Link>
  );
};
