import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

export const MingleRelatedSearchesTab = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedBlogId, setSelectedBlogId] = useState("");
  const [formData, setFormData] = useState({
    searchText: "",
    wrParameter: 1,
    searchOrder: 0
  });

  const { data: blogs } = useQuery({
    queryKey: ['blogs-for-mingle'],
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
    queryKey: ['mingle-related-searches', selectedBlogId],
    queryFn: async () => {
      if (!selectedBlogId) return [];
      const { data, error } = await supabase
        .from('related_searches')
        .select('*, blog:blogs(title)')
        .eq('blog_id', selectedBlogId)
        .order('search_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedBlogId
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBlogId || !formData.searchText) {
        throw new Error("Please select a blog and enter search text");
      }
      if (editingId) {
        const { error } = await supabase
          .from('related_searches')
          .update({
            search_text: formData.searchText,
            wr_parameter: formData.wrParameter,
            search_order: formData.searchOrder
          })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('related_searches')
          .insert({
            blog_id: selectedBlogId,
            search_text: formData.searchText,
            wr_parameter: formData.wrParameter,
            search_order: formData.searchOrder
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mingle-related-searches'] });
      toast.success(editingId ? "Updated!" : "Created!");
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Operation failed");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('related_searches')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mingle-related-searches'] });
      toast.success("Deleted!");
    }
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      searchText: "",
      wrParameter: 1,
      searchOrder: 0
    });
  };

  const handleEdit = (search: any) => {
    setEditingId(search.id);
    setFormData({
      searchText: search.search_text || "",
      wrParameter: search.wr_parameter || 1,
      searchOrder: search.search_order || 0
    });
  };

  return (
    <div className="space-y-6 mingle-moody-theme">
      <h2 className="text-2xl font-bold text-mingle-cyan">Mingle - Related Searches</h2>

      <Card className="bg-mingle-dark border-mingle-border">
        <CardHeader>
          <CardTitle className="text-mingle-cyan">{editingId ? "Edit" : "Add"} Related Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-mingle-text">Select Blog</Label>
            <Select value={selectedBlogId} onValueChange={setSelectedBlogId}>
              <SelectTrigger className="bg-mingle-darker border-mingle-border text-mingle-text">
                <SelectValue placeholder="Choose a blog" />
              </SelectTrigger>
              <SelectContent className="bg-mingle-darker border-mingle-border">
                {blogs?.map((blog) => (
                  <SelectItem key={blog.id} value={blog.id} className="text-mingle-text hover:bg-mingle-dark focus:bg-mingle-dark focus:text-mingle-cyan">
                    {blog.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBlogId && (
            <>
              <div>
                <Label className="text-mingle-text">Search Text</Label>
                <Input
                  className="bg-mingle-darker border-mingle-border text-mingle-text placeholder:text-mingle-text/50"
                  value={formData.searchText}
                  onChange={(e) => setFormData({ ...formData, searchText: e.target.value })}
                  placeholder="e.g. Best Online Exercise Programs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-mingle-text">WR Parameter (1-4)</Label>
                  <Select value={String(formData.wrParameter)} onValueChange={(v) => setFormData({ ...formData, wrParameter: parseInt(v) })}>
                    <SelectTrigger className="bg-mingle-darker border-mingle-border text-mingle-text">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-mingle-darker border-mingle-border">
                      <SelectItem value="1" className="text-mingle-text">WR 1</SelectItem>
                      <SelectItem value="2" className="text-mingle-text">WR 2</SelectItem>
                      <SelectItem value="3" className="text-mingle-text">WR 3</SelectItem>
                      <SelectItem value="4" className="text-mingle-text">WR 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-mingle-text">Display Order</Label>
                  <Input
                    className="bg-mingle-darker border-mingle-border text-mingle-text"
                    type="number"
                    value={formData.searchOrder}
                    onChange={(e) => setFormData({ ...formData, searchOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="bg-mingle-cyan text-mingle-darker hover:bg-mingle-cyan/90" onClick={() => saveMutation.mutate()}>
                  {editingId ? "Update" : "Create"}
                </Button>
                {editingId && (
                  <Button variant="outline" className="border-mingle-border text-mingle-text hover:bg-mingle-darker" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {selectedBlogId && searches && searches.length > 0 && (
        <Card className="bg-mingle-dark border-mingle-border">
          <CardHeader>
            <CardTitle className="text-mingle-cyan">Existing Related Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {searches.map((search) => (
                <div key={search.id} className="flex items-center justify-between p-4 border border-mingle-border rounded bg-mingle-darker">
                  <div className="flex-1">
                    <div className="font-medium text-mingle-text">{search.search_text}</div>
                    <div className="text-sm text-mingle-text/60">
                      Blog: {search.blog?.title} | WR: {search.wr_parameter || 1} | Order: {search.search_order || 0}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="border-mingle-border text-mingle-cyan hover:bg-mingle-dark" onClick={() => handleEdit(search)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => deleteMutation.mutate(search.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};