import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import { useNavigate } from "react-router-dom";

interface RelatedSearchesProps {
  blogId: string;
}

export const RelatedSearches = ({ blogId }: RelatedSearchesProps) => {
  const navigate = useNavigate();
  
  const { data: searches } = useQuery({
    queryKey: ['related-searches', blogId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('related_searches')
        .select('*')
        .eq('blog_id', blogId)
        .order('search_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const handleSearchClick = async (search: any) => {
    await trackEvent({
      eventType: 'related_search_click',
      eventData: { search_text: search.search_text },
      relatedSearchId: search.id,
      blogId
    });
    navigate(`/search/${search.id}`);
  };

  if (!searches || searches.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Related searches</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {searches.map((search) => (
          <Button
            key={search.id}
            variant="outline"
            className="w-full justify-between"
            onClick={() => handleSearchClick(search)}
          >
            <span>{search.search_text}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};
