import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const EmailCapturesTab = () => {
  const { data: emails, isLoading } = useQuery({
    queryKey: ['email-captures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_submissions')
        .select(`
          *,
          related_searches:related_search_id (
            search_text
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Email Captures</h2>

      <Card>
        <CardHeader>
          <CardTitle>All Email Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : emails && emails.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Related Search</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Submitted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emails.map((email: any) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">{email.email}</TableCell>
                      <TableCell>{email.source || '-'}</TableCell>
                      <TableCell>
                        {email.related_searches?.search_text || '-'}
                      </TableCell>
                      <TableCell>{email.country || '-'}</TableCell>
                      <TableCell className="text-xs">{email.ip_address || '-'}</TableCell>
                      <TableCell className="text-xs">{email.session_id?.substring(0, 12) || '-'}...</TableCell>
                      <TableCell className="text-sm">
                        {new Date(email.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No email submissions yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
