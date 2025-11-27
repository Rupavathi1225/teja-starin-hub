import { useQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { trackEvent } from "@/lib/tracking";
import { useEffect } from "react";
import { ExternalLink } from "lucide-react";

const SearchPage = () => {
  const { searchId } = useParams();
  const [searchParams] = useSearchParams();
  const wrParam = searchParams.get('wr') || '1';

  const { data: search } = useQuery({
    queryKey: ['search', searchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('related_searches')
        .select(`
          *,
          blogs (
            title
          )
        `)
        .eq('id', searchId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: webResults } = useQuery({
    queryKey: ['web-results', searchId, wrParam],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('web_results')
        .select('*')
        .eq('related_search_id', searchId)
        .eq('wr_parameter', parseInt(wrParam))
        .order('is_sponsored', { ascending: false })
        .order('display_order', { ascending: true });
      
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

  const handleResultClick = async (result: any) => {
    await trackEvent({
      eventType: 'web_result_click',
      eventData: { 
        search_text: search?.search_text,
        result_url: result.url,
        result_title: result.title,
        wr_parameter: wrParam,
        is_sponsored: result.is_sponsored
      },
      relatedSearchId: searchId
    });
    
    // Redirect to pre-landing page with target URL
    const targetUrl = encodeURIComponent(result.url);
    window.location.href = `/prelanding/${searchId}?targetUrl=${targetUrl}&wr=${wrParam}`;
  };

  if (!search) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">Loading...</div>
      </div>
    );
  }

  const sponsoredResults = webResults?.filter(r => r.is_sponsored) || [];
  const organicResults = webResults?.filter(r => !r.is_sponsored) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Breadcrumb Navigation */}
          {search.blogs && (
            <div className="text-sm text-muted-foreground mb-4">
              <span className="font-medium">{search.blogs.title}</span>
              <span className="mx-2">›››› </span>
              <span className="font-medium">{search.search_text}</span>
              <span className="mx-2">›››› </span>
              <span>Web Results (WR={wrParam})</span>
            </div>
          )}
          
          <h1 className="text-3xl font-bold">{search.search_text}</h1>

          {/* Sponsored Results */}
          {sponsoredResults.length > 0 && (
            <div className="space-y-4">
              {sponsoredResults.map((result) => (
                <div 
                  key={result.id}
                  className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-muted-foreground font-medium">Sponsored</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {result.logo_url && (
                        <img src={result.logo_url} alt="" className="w-5 h-5 rounded" />
                      )}
                      <span className="text-sm text-primary hover:underline">{result.url}</span>
                    </div>
                    <h2 className="text-xl font-semibold text-primary hover:underline">
                      {result.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">{result.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Web Results Label */}
          {organicResults.length > 0 && (
            <div className="pt-4">
              <h2 className="text-sm font-medium text-muted-foreground mb-4">Web Results</h2>
            </div>
          )}

          {/* Organic Results */}
          <div className="space-y-6">
            {organicResults.map((result) => (
              <div 
                key={result.id}
                className="cursor-pointer group"
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-center gap-2 mb-1">
                  {result.logo_url && (
                    <img src={result.logo_url} alt="" className="w-6 h-6 rounded" />
                  )}
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-foreground">{new URL(result.url).hostname}</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-medium text-primary group-hover:underline mb-2">
                  {result.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {result.description}
                </p>
              </div>
            ))}
          </div>

          {webResults?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No results found for this search.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
