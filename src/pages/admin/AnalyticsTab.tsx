import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface SessionStats {
  session_id: string;
  ip_address: string;
  country: string;
  source: string;
  device_type: string;
  page_views: number;
  clicks: number;
  related_searches: Array<{ search_text: string; count: number }>;
  blog_clicks: Array<{ blog_title: string; count: number }>;
  last_active: string;
}

export const AnalyticsTab = () => {
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  const { data: sessionStats, isLoading } = useQuery({
    queryKey: ['session-analytics'],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from('tracking_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group events by session
      const sessionMap = new Map<string, SessionStats>();

      events.forEach((event: any) => {
        if (!sessionMap.has(event.session_id)) {
          sessionMap.set(event.session_id, {
            session_id: event.session_id,
            ip_address: event.ip_address || 'Unknown',
            country: event.country || 'Unknown',
            source: event.source || 'direct',
            device_type: event.device_type || 'Unknown',
            page_views: 0,
            clicks: 0,
            related_searches: [],
            blog_clicks: [],
            last_active: event.created_at
          });
        }

        const session = sessionMap.get(event.session_id)!;

        // Update last active
        if (new Date(event.created_at) > new Date(session.last_active)) {
          session.last_active = event.created_at;
        }

        // Count page views
        if (event.event_type === 'blog_view' || event.event_type === 'search_page_view') {
          session.page_views++;
        }

        // Count clicks
        if (event.event_type.includes('click')) {
          session.clicks++;
        }

        // Track related searches
        if (event.event_type === 'related_search_click') {
          const searchText = (event.event_data as any)?.search_text || 'Unknown';
          const existing = session.related_searches.find(s => s.search_text === searchText);
          if (existing) {
            existing.count++;
          } else {
            session.related_searches.push({ search_text: searchText, count: 1 });
          }
        }

        // Track blog clicks
        if (event.event_type === 'blog_view') {
          const blogTitle = (event.event_data as any)?.blog_title || 'Unknown';
          const existing = session.blog_clicks.find(b => b.blog_title === blogTitle);
          if (existing) {
            existing.count++;
          } else {
            session.blog_clicks.push({ blog_title: blogTitle, count: 1 });
          }
        }
      });

      return Array.from(sessionMap.values()).sort(
        (a, b) => new Date(b.last_active).getTime() - new Date(a.last_active).getTime()
      );
    }
  });

  const toggleSession = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const totalRelatedSearches = (session: SessionStats) => 
    session.related_searches.reduce((sum, s) => sum + s.count, 0);

  const totalBlogClicks = (session: SessionStats) => 
    session.blog_clicks.reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      <Card>
        <CardHeader>
          <CardTitle>Session Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : sessionStats && sessionStats.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Session ID</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead className="text-center">Page Views</TableHead>
                    <TableHead className="text-center">Clicks</TableHead>
                    <TableHead>Related Searches</TableHead>
                    <TableHead>Blog Clicks</TableHead>
                    <TableHead>Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionStats.map((session) => {
                    const isExpanded = expandedSessions.has(session.session_id);
                    const relatedCount = totalRelatedSearches(session);
                    const blogCount = totalBlogClicks(session);

                    return (
                      <>
                        <TableRow key={session.session_id} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-xs">
                            {session.session_id.substring(0, 12)}...
                          </TableCell>
                          <TableCell className="text-sm">{session.ip_address}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{session.country}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{session.source}</Badge>
                          </TableCell>
                          <TableCell className="capitalize">{session.device_type}</TableCell>
                          <TableCell className="text-center font-semibold">
                            {session.page_views}
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {session.clicks}
                          </TableCell>
                          <TableCell>
                            {relatedCount > 0 ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1"
                                onClick={() => toggleSession(session.session_id)}
                              >
                                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                  Total: {relatedCount}
                                </Badge>
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                View breakdown
                              </Button>
                            ) : (
                              <Badge variant="secondary">Total: 0</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {blogCount > 0 ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1"
                                onClick={() => toggleSession(session.session_id)}
                              >
                                <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
                                  Total: {blogCount}
                                </Badge>
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                View breakdown
                              </Button>
                            ) : (
                              <Badge variant="secondary">Total: 0</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(session.last_active).toLocaleString()}
                          </TableCell>
                        </TableRow>
                        {isExpanded && (relatedCount > 0 || blogCount > 0) && (
                          <TableRow>
                            <TableCell colSpan={10} className="bg-muted/30 p-6">
                              <div className="grid grid-cols-2 gap-6">
                                {/* Related Searches Breakdown */}
                                {session.related_searches.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-3 text-sm">Related Searches Breakdown</h4>
                                    <div className="space-y-2">
                                      {session.related_searches.map((search, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-2 bg-card rounded border">
                                          <span className="text-sm">{search.search_text}</span>
                                          <div className="flex gap-2">
                                            <Badge variant="outline">Total: {search.count}</Badge>
                                            <Badge variant="secondary">Unique: 1</Badge>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Blog Clicks Breakdown */}
                                {session.blog_clicks.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-3 text-sm">Blog Clicks Breakdown</h4>
                                    <div className="space-y-2">
                                      {session.blog_clicks.map((blog, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-2 bg-card rounded border">
                                          <span className="text-sm font-medium">{blog.blog_title}</span>
                                          <div className="flex gap-2">
                                            <Badge variant="outline">Total: {blog.count}</Badge>
                                            <Badge variant="secondary">Unique: 1</Badge>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No analytics data yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
