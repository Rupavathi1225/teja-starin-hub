import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AnalyticsTab = () => {
  const { data: stats } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from('tracking_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const uniqueSessions = new Set(events.map(e => e.session_id)).size;
      const uniqueIPs = new Set(events.map(e => e.ip_address)).size;
      
      const blogViews = events.filter(e => e.event_type === 'blog_view');
      const uniqueBlogViews = new Set(blogViews.map(e => `${e.session_id}-${e.blog_id}`)).size;
      
      const relatedSearchClicks = events.filter(e => e.event_type === 'related_search_click');
      const uniqueSearchClicks = new Set(
        relatedSearchClicks.map(e => `${e.session_id}-${e.related_search_id}`)
      ).size;
      
      const webResultClicks = events.filter(e => e.event_type === 'web_result_click');
      const uniqueWebResultClicks = new Set(
        webResultClicks.map(e => `${e.session_id}-${e.related_search_id}`)
      ).size;

      // Device split
      const deviceCounts = events.reduce((acc: any, e) => {
        acc[e.device_type || 'unknown'] = (acc[e.device_type || 'unknown'] || 0) + 1;
        return acc;
      }, {});

      // Top performing web results by clicks
      const webResultStats = webResultClicks.reduce((acc: any, e) => {
        const title = (e.event_data as any)?.result_title || 'Unknown';
        const url = (e.event_data as any)?.result_url || '';
        const key = `${title}::${url}`;
        if (!acc[key]) {
          acc[key] = { title, url, clicks: 0, sponsored: 0, organic: 0 };
        }
        acc[key].clicks += 1;
        if ((e.event_data as any)?.is_sponsored) {
          acc[key].sponsored += 1;
        } else {
          acc[key].organic += 1;
        }
        return acc;
      }, {});

      const topWebResults = Object.values(webResultStats)
        .sort((a: any, b: any) => b.clicks - a.clicks)
        .slice(0, 10);

      // CTR calculation (click-through rate from searches to web results)
      const ctr = relatedSearchClicks.length > 0 
        ? ((webResultClicks.length / relatedSearchClicks.length) * 100).toFixed(2)
        : '0';

      // Top related searches
      const searchStats = relatedSearchClicks.reduce((acc: any, e) => {
        const searchText = (e.event_data as any)?.search_text || 'Unknown';
        const wrParam = (e.event_data as any)?.wr_parameter || 1;
        const key = `${searchText}::${wrParam}`;
        if (!acc[key]) {
          acc[key] = { searchText, wrParam, clicks: 0 };
        }
        acc[key].clicks += 1;
        return acc;
      }, {});

      const topSearches = Object.values(searchStats)
        .sort((a: any, b: any) => b.clicks - a.clicks)
        .slice(0, 10);

      return {
        totalSessions: uniqueSessions,
        totalPageViews: events.length,
        uniquePageViews: uniqueIPs,
        totalClicks: events.filter(e => e.event_type.includes('click')).length,
        uniqueClicks: new Set(
          events.filter(e => e.event_type.includes('click')).map(e => e.session_id)
        ).size,
        blogViews: blogViews.length,
        uniqueBlogViews,
        relatedSearchClicks: relatedSearchClicks.length,
        uniqueSearchClicks,
        webResultClicks: webResultClicks.length,
        uniqueWebResultClicks,
        ctr,
        deviceCounts,
        topWebResults,
        topSearches,
        recentEvents: events.slice(0, 20)
      };
    }
  });

  const { data: emailStats } = useQuery({
    queryKey: ['email-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const uniqueEmails = new Set(data.map(e => e.email)).size;
      
      // Group by source
      const bySour = data.reduce((acc: any, e) => {
        acc[e.source || 'unknown'] = (acc[e.source || 'unknown'] || 0) + 1;
        return acc;
      }, {});

      return {
        total: data.length,
        unique: uniqueEmails,
        bySource: bySour,
        recent: data.slice(0, 10)
      };
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalSessions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalPageViews || 0}</div>
            <div className="text-sm text-muted-foreground">
              {stats?.uniquePageViews || 0} unique
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalClicks || 0}</div>
            <div className="text-sm text-muted-foreground">
              {stats?.uniqueClicks || 0} unique
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.ctr || 0}%</div>
            <div className="text-sm text-muted-foreground">
              Search to Result
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Blog Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.blogViews || 0}</div>
            <div className="text-sm text-muted-foreground">
              {stats?.uniqueBlogViews || 0} unique
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search Button Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.relatedSearchClicks || 0}</div>
            <div className="text-sm text-muted-foreground">
              {stats?.uniqueSearchClicks || 0} unique
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Web Result Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.webResultClicks || 0}</div>
            <div className="text-sm text-muted-foreground">
              {stats?.uniqueWebResultClicks || 0} unique
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Device Split</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.deviceCounts && Object.entries(stats.deviceCounts).map(([device, count]: [string, any]) => (
                <div key={device} className="flex justify-between items-center">
                  <span className="capitalize">{device}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{emailStats?.total || 0}</div>
            <div className="text-sm text-muted-foreground mb-4">
              {emailStats?.unique || 0} unique emails
            </div>
            {emailStats?.bySource && (
              <div className="space-y-1 text-sm">
                <div className="font-medium">By Source:</div>
                {Object.entries(emailStats.bySource).map(([source, count]: [string, any]) => (
                  <div key={source} className="flex justify-between">
                    <span>{source}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Web Results</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.topWebResults && stats.topWebResults.length > 0 ? (
            <div className="space-y-3">
              {stats.topWebResults.map((result: any, index: number) => (
                <div key={index} className="p-3 border rounded space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{result.title}</h4>
                    <span className="text-lg font-bold">{result.clicks}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{result.url}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600">Organic: {result.organic}</span>
                    <span className="text-blue-600">Sponsored: {result.sponsored}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No data yet</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Related Searches</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.topSearches && stats.topSearches.length > 0 ? (
            <div className="space-y-2">
              {stats.topSearches.map((search: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <span className="font-medium">{search.searchText}</span>
                    <span className="text-xs text-muted-foreground ml-2">WR {search.wrParam}</span>
                  </div>
                  <span className="font-bold">{search.clicks}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No data yet</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Email Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {emailStats?.recent && emailStats.recent.length > 0 ? (
            <div className="space-y-2">
              {emailStats.recent.map((sub: any) => (
                <div key={sub.id} className="text-sm p-2 border rounded flex justify-between">
                  <span className="font-medium">{sub.email}</span>
                  <span className="text-muted-foreground">{new Date(sub.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No submissions yet</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity (Last 20 Events)</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentEvents && stats.recentEvents.length > 0 ? (
            <div className="space-y-2">
              {stats.recentEvents.map((event: any) => (
                <div key={event.id} className="text-sm p-2 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium capitalize">{event.event_type.replace(/_/g, ' ')}</span>
                      <div className="text-xs text-muted-foreground mt-1">
                        {event.device_type} • {event.ip_address}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No activity yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
