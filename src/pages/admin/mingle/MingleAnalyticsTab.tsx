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
    <div className="space-y-6 mingle-moody-theme">
      <h2 className="text-2xl font-bold text-mingle-cyan">Mingle - Analytics & Events</h2>

      <Tabs defaultValue="analytics">
        <TabsList className="grid w-full grid-cols-3 bg-mingle-darker border-mingle-border">
          <TabsTrigger value="analytics" className="data-[state=active]:bg-mingle-dark data-[state=active]:text-mingle-cyan">Analytics</TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-mingle-dark data-[state=active]:text-mingle-cyan">Events</TabsTrigger>
          <TabsTrigger value="clicks" className="data-[state=active]:bg-mingle-dark data-[state=active]:text-mingle-cyan">Click Events</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <Card className="bg-mingle-dark border-mingle-border">
            <CardHeader>
              <CardTitle className="text-mingle-cyan">Analytics Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-mingle-border hover:bg-mingle-darker">
                      <TableHead className="text-mingle-text">Session ID</TableHead>
                      <TableHead className="text-mingle-text">IP Address</TableHead>
                      <TableHead className="text-mingle-text">Country</TableHead>
                      <TableHead className="text-mingle-text">Device</TableHead>
                      <TableHead className="text-mingle-text">Page Views</TableHead>
                      <TableHead className="text-mingle-text">Clicks</TableHead>
                      <TableHead className="text-mingle-text">Time Spent</TableHead>
                      <TableHead className="text-mingle-text">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics?.map((item) => (
                      <TableRow key={item.id} className="border-mingle-border hover:bg-mingle-darker">
                        <TableCell className="font-mono text-xs text-mingle-text">{item.session_id.slice(0, 8)}...</TableCell>
                        <TableCell className="text-mingle-text">{item.ip_address}</TableCell>
                        <TableCell className="text-mingle-text">{item.country}</TableCell>
                        <TableCell className="text-mingle-text">{item.device}</TableCell>
                        <TableCell className="text-mingle-text">{item.page_views}</TableCell>
                        <TableCell className="text-mingle-text">{item.clicks}</TableCell>
                        <TableCell className="text-mingle-text">{item.time_spent}s</TableCell>
                        <TableCell className="text-xs text-mingle-text">{new Date(item.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card className="bg-mingle-dark border-mingle-border">
            <CardHeader>
              <CardTitle className="text-mingle-cyan">Analytics Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-mingle-border hover:bg-mingle-darker">
                      <TableHead className="text-mingle-text">Session ID</TableHead>
                      <TableHead className="text-mingle-text">Event Type</TableHead>
                      <TableHead className="text-mingle-text">Event Label</TableHead>
                      <TableHead className="text-mingle-text">IP Address</TableHead>
                      <TableHead className="text-mingle-text">Country</TableHead>
                      <TableHead className="text-mingle-text">Device</TableHead>
                      <TableHead className="text-mingle-text">Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events?.map((event) => (
                      <TableRow key={event.id} className="border-mingle-border hover:bg-mingle-darker">
                        <TableCell className="font-mono text-xs text-mingle-text">{event.session_id.slice(0, 8)}...</TableCell>
                        <TableCell className="text-mingle-text">{event.event_type}</TableCell>
                        <TableCell className="text-mingle-text">{event.event_label}</TableCell>
                        <TableCell className="text-mingle-text">{event.ip_address}</TableCell>
                        <TableCell className="text-mingle-text">{event.country}</TableCell>
                        <TableCell className="text-mingle-text">{event.device}</TableCell>
                        <TableCell className="text-xs text-mingle-text">{new Date(event.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clicks">
          <Card className="bg-mingle-dark border-mingle-border">
            <CardHeader>
              <CardTitle className="text-mingle-cyan">Click Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-mingle-border hover:bg-mingle-darker">
                      <TableHead className="text-mingle-text">Session ID</TableHead>
                      <TableHead className="text-mingle-text">Event Type</TableHead>
                      <TableHead className="text-mingle-text">Search Term</TableHead>
                      <TableHead className="text-mingle-text">Target URL</TableHead>
                      <TableHead className="text-mingle-text">Country</TableHead>
                      <TableHead className="text-mingle-text">Device</TableHead>
                      <TableHead className="text-mingle-text">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clicks?.map((click) => (
                      <TableRow key={click.id} className="border-mingle-border hover:bg-mingle-darker">
                        <TableCell className="font-mono text-xs text-mingle-text">{click.session_id.slice(0, 8)}...</TableCell>
                        <TableCell className="text-mingle-text">{click.event_type}</TableCell>
                        <TableCell className="text-mingle-text">{click.search_term}</TableCell>
                        <TableCell className="text-xs truncate max-w-xs text-mingle-text">{click.target_url}</TableCell>
                        <TableCell className="text-mingle-text">{click.country}</TableCell>
                        <TableCell className="text-mingle-text">{click.device}</TableCell>
                        <TableCell className="text-xs text-mingle-text">{new Date(click.timestamp).toLocaleString()}</TableCell>
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
