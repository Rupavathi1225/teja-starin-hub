import { useQuery } from "@tanstack/react-query";
import { mingleSupabase } from "@/integrations/mingle/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const MingleAnalyticsTab = () => {
  const { data: analytics } = useQuery({
    queryKey: ['mingle-analytics'],
    queryFn: async () => {
      const { data, error } = await mingleSupabase
        .from('analytics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    }
  });

  const { data: events } = useQuery({
    queryKey: ['mingle-analytics-events'],
    queryFn: async () => {
      const { data, error } = await mingleSupabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    }
  });

  const { data: clicks } = useQuery({
    queryKey: ['mingle-click-events'],
    queryFn: async () => {
      const { data, error } = await mingleSupabase
        .from('click_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mingle - Analytics & Events</h2>

      <Tabs defaultValue="analytics">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="clicks">Click Events</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session ID</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Page Views</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Time Spent</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.session_id.slice(0, 8)}...</TableCell>
                        <TableCell>{item.ip_address}</TableCell>
                        <TableCell>{item.country}</TableCell>
                        <TableCell>{item.device}</TableCell>
                        <TableCell>{item.page_views}</TableCell>
                        <TableCell>{item.clicks}</TableCell>
                        <TableCell>{item.time_spent}s</TableCell>
                        <TableCell className="text-xs">{new Date(item.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Event Label</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events?.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono text-xs">{event.session_id.slice(0, 8)}...</TableCell>
                        <TableCell>{event.event_type}</TableCell>
                        <TableCell>{event.event_label}</TableCell>
                        <TableCell>{event.ip_address}</TableCell>
                        <TableCell>{event.country}</TableCell>
                        <TableCell>{event.device}</TableCell>
                        <TableCell className="text-xs">{new Date(event.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clicks">
          <Card>
            <CardHeader>
              <CardTitle>Click Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Search Term</TableHead>
                      <TableHead>Target URL</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clicks?.map((click) => (
                      <TableRow key={click.id}>
                        <TableCell className="font-mono text-xs">{click.session_id.slice(0, 8)}...</TableCell>
                        <TableCell>{click.event_type}</TableCell>
                        <TableCell>{click.search_term}</TableCell>
                        <TableCell className="text-xs truncate max-w-xs">{click.target_url}</TableCell>
                        <TableCell>{click.country}</TableCell>
                        <TableCell>{click.device}</TableCell>
                        <TableCell className="text-xs">{new Date(click.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
