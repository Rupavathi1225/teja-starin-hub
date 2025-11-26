import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const RelatedSearchesTab = () => {
  const queryClient = useQueryClient();
  const [selectedBlogId, setSelectedBlogId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [wrParameter, setWrParameter] = useState(1);

  const { data: blogs } = useQuery({
    queryKey: ['blogs-for-searches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title')
        .order('title');
      if (error) throw error;
      return data;
    }
  });

  const { data: searches } = useQuery({
    queryKey: ['admin-searches', selectedBlogId],
    queryFn: async () => {
      if (!selectedBlogId) return [];
      const { data, error } = await supabase
        .from('related_searches')
        .select('*')
        .eq('blog_id', selectedBlogId)
        .order('search_order');
      if (error) throw error;
      return data;
    },
    enabled: !!selectedBlogId
  });

  const addSearch = useMutation({
    mutationFn: async () => {
      if (!selectedBlogId || !searchText) return;
      const { error } = await supabase.from('related_searches').insert({
        blog_id: selectedBlogId,
        search_text: searchText,
        wr_parameter: wrParameter,
        search_order: searches?.length || 0
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-searches'] });
      setSearchText("");
      setWrParameter(1);
      toast.success("Search added!");
    }
  });

  const deleteSearch = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('related_searches').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-searches'] });
      toast.success("Search deleted!");
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Related Searches</h2>

      <Card>
        <CardHeader>
          <CardTitle>Add Related Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Blog</Label>
            <Select value={selectedBlogId} onValueChange={setSelectedBlogId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a blog" />
              </SelectTrigger>
              <SelectContent>
                {blogs?.map((blog) => (
                  <SelectItem key={blog.id} value={blog.id}>
                    {blog.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBlogId && (
            <>
              <div>
                <Label>Search Text</Label>
                <Input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="e.g. Best Online Exercise Programs"
                />
              </div>

              <div>
                <Label>WR Parameter (1-4)</Label>
                <Select value={String(wrParameter)} onValueChange={(v) => setWrParameter(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">WR 1</SelectItem>
                    <SelectItem value="2">WR 2</SelectItem>
                    <SelectItem value="3">WR 3</SelectItem>
                    <SelectItem value="4">WR 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => addSearch.mutate()}>Add Search</Button>

              {searches && searches.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Searches</Label>
                  {searches.map((search) => (
                    <div key={search.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-medium">{search.search_text}</span>
                        <span className="text-xs text-muted-foreground ml-2">WR {search.wr_parameter || 1}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteSearch.mutate(search.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
