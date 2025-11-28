import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

export const MingleWebResultsTab = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSearchId, setSelectedSearchId] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    logoUrl: "",
    isSponsored: false,
    wrParameter: 1,
    displayOrder: 0
  });

  const { data: searches } = useQuery({
    queryKey: ['searches-for-mingle-results'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('related_searches')
        .select('id, search_text, wr_parameter, blog:blogs(title)')
        .order('search_text');
      if (error) throw error;
      return data;
    }
  });

  const { data: results } = useQuery({
    queryKey: ['mingle-web-results', selectedSearchId],
    queryFn: async () => {
      if (!selectedSearchId) return [];
      const { data, error } = await supabase
        .from('web_results')
        .select('*')
        .eq('related_search_id', selectedSearchId)
        .order('is_sponsored', { ascending: false })
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSearchId
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSearchId || !formData.title || !formData.url) {
        throw new Error("Please fill in all required fields");
      }
      if (editingId) {
        const { error } = await supabase
          .from('web_results')
          .update({
            title: formData.title,
            description: formData.description,
            url: formData.url,
            logo_url: formData.logoUrl || null,
            is_sponsored: formData.isSponsored,
            wr_parameter: formData.wrParameter,
            display_order: formData.displayOrder
          })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('web_results')
          .insert({
            related_search_id: selectedSearchId,
            title: formData.title,
            description: formData.description,
            url: formData.url,
            logo_url: formData.logoUrl || null,
            is_sponsored: formData.isSponsored,
            wr_parameter: formData.wrParameter,
            display_order: formData.displayOrder
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mingle-web-results'] });
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
        .from('web_results')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mingle-web-results'] });
      toast.success("Deleted!");
    }
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      url: "",
      logoUrl: "",
      isSponsored: false,
      wrParameter: 1,
      displayOrder: 0
    });
  };

  const handleEdit = (result: any) => {
    setEditingId(result.id);
    setFormData({
      title: result.title || "",
      description: result.description || "",
      url: result.url || "",
      logoUrl: result.logo_url || "",
      isSponsored: result.is_sponsored ?? false,
      wrParameter: result.wr_parameter || 1,
      displayOrder: result.display_order || 0
    });
  };

  return (
    <div className="space-y-6 mingle-moody-theme">
      <h2 className="text-2xl font-bold text-mingle-cyan">Mingle - Web Results</h2>

      <Card className="bg-mingle-dark border-mingle-border">
        <CardHeader>
          <CardTitle className="text-mingle-cyan">{editingId ? "Edit" : "Add"} Web Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-mingle-text">Select Related Search</Label>
            <Select value={selectedSearchId} onValueChange={setSelectedSearchId}>
              <SelectTrigger className="bg-mingle-darker border-mingle-border text-mingle-text">
                <SelectValue placeholder="Choose a search term" />
              </SelectTrigger>
              <SelectContent className="bg-mingle-darker border-mingle-border">
                {searches?.map((search) => (
                  <SelectItem key={search.id} value={search.id} className="text-mingle-text hover:bg-mingle-dark">
                    {search.blog?.title} - {search.search_text} (WR={search.wr_parameter || 1})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSearchId && (
            <>
              <div>
                <Label className="text-mingle-text">Title *</Label>
                <Input
                  className="bg-mingle-darker border-mingle-border text-mingle-text placeholder:text-mingle-text/50"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Best Flight Deals"
                />
              </div>

              <div>
                <Label className="text-mingle-text">URL *</Label>
                <Input
                  className="bg-mingle-darker border-mingle-border text-mingle-text placeholder:text-mingle-text/50"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label className="text-mingle-text">Description *</Label>
                <Textarea
                  className="bg-mingle-darker border-mingle-border text-mingle-text placeholder:text-mingle-text/50"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description..."
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-mingle-text">Logo URL (Optional)</Label>
                <Input
                  className="bg-mingle-darker border-mingle-border text-mingle-text placeholder:text-mingle-text/50"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-mingle-text">WR Parameter</Label>
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
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sponsored"
                  checked={formData.isSponsored}
                  onCheckedChange={(checked) => setFormData({ ...formData, isSponsored: checked as boolean })}
                  className="border-mingle-border"
                />
                <label htmlFor="sponsored" className="text-sm text-mingle-text">Mark as Sponsored</label>
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

      {selectedSearchId && results && results.length > 0 && (
        <Card className="bg-mingle-dark border-mingle-border">
          <CardHeader>
            <CardTitle className="text-mingle-cyan">Existing Web Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result) => (
                <div key={result.id} className="flex items-start justify-between p-4 border border-mingle-border rounded bg-mingle-darker gap-4">
                  <div className="flex-1">
                    <div className="font-medium text-mingle-text flex items-center gap-2">
                      {result.title}
                      {result.is_sponsored && (
                        <span className="text-xs bg-mingle-cyan text-mingle-darker px-2 py-0.5 rounded">Sponsored</span>
                      )}
                      <span className="text-xs bg-mingle-dark text-mingle-text px-2 py-0.5 rounded">
                        WR {result.wr_parameter || 1}
                      </span>
                    </div>
                    <div className="text-sm text-mingle-text/60 mt-1">{result.url}</div>
                    <div className="text-sm text-mingle-text/80 mt-1">{result.description}</div>
                    <div className="text-xs text-mingle-text/50 mt-2">Display Order: {result.display_order || 0}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="border-mingle-border text-mingle-cyan hover:bg-mingle-dark" onClick={() => handleEdit(result)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => deleteMutation.mutate(result.id)}>
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