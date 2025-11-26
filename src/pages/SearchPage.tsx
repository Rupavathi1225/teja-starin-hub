import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/tracking";
import { useEffect } from "react";

const SearchPage = () => {
  const { searchId } = useParams();
  const navigate = useNavigate();

  const { data: search } = useQuery({
    queryKey: ['search', searchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('related_searches')
        .select('*')
        .eq('id', searchId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: config } = useQuery({
    queryKey: ['search-pre-landing', searchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pre_landing_config')
        .select('*')
        .eq('related_search_id', searchId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (search) {
      trackEvent({
        eventType: 'search_page_view',
        eventData: { search_text: search.search_text },
        relatedSearchId: searchId
      });
    }
  }, [search, searchId]);

  const handleVisitNow = async () => {
    await trackEvent({
      eventType: 'visit_now_click',
      eventData: { search_text: search?.search_text },
      relatedSearchId: searchId
    });

    if (config) {
      navigate(`/prelanding/${searchId}`);
    } else {
      // Default to Google search if no pre-landing page configured
      window.open(`https://www.google.com/search?q=${encodeURIComponent(search?.search_text || '')}`, '_blank');
    }
  };

  if (!search) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h1 className="text-4xl font-bold">{search.search_text}</h1>
          <p className="text-lg text-muted-foreground">
            Click the button below to learn more about this topic.
          </p>
          <Button size="lg" onClick={handleVisitNow}>
            Visit Now
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SearchPage;
