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
      
      const visitNowClicks = events.filter(e => e.event_type === 'visit_now_click');
      const uniqueVisitNowClicks = new Set(
        visitNowClicks.map(e => `${e.session_id}-${e.related_search_id}`)
      ).size;

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
        visitNowClicks: visitNowClicks.length,
        uniqueVisitNowClicks,
        recentEvents: events.slice(0, 10)
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

      return {
        total: data.length,
        unique: new Set(data.map(e => e.email)).size,
        recent: data.slice(0, 10)
      };
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <CardTitle>Related Search Clicks</CardTitle>
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
            <CardTitle>Visit Now Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.visitNowClicks || 0}</div>
            <div className="text-sm text-muted-foreground">
              {stats?.uniqueVisitNowClicks || 0} unique
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-2">{emailStats?.total || 0}</div>
          <div className="text-sm text-muted-foreground mb-4">
            {emailStats?.unique || 0} unique emails
          </div>
          {emailStats?.recent && emailStats.recent.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Recent Submissions:</div>
              {emailStats.recent.map((sub) => (
                <div key={sub.id} className="text-sm p-2 border rounded">
                  {sub.email} - {new Date(sub.created_at).toLocaleDateString()}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentEvents && stats.recentEvents.length > 0 ? (
            <div className="space-y-2">
              {stats.recentEvents.map((event) => (
                <div key={event.id} className="text-sm p-2 border rounded">
                  <div className="font-medium">{event.event_type}</div>
                  <div className="text-muted-foreground text-xs">
                    {new Date(event.created_at).toLocaleString()} - {event.device_type} - {event.ip_address}
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
