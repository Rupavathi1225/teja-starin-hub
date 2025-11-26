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
import { Trash2, Edit2, Save, X } from "lucide-react";

interface WebResultForm {
  title: string;
  url: string;
  description: string;
  logo_url: string;
  is_sponsored: boolean;
  wr_parameter: number;
}

export const WebResultsTab = () => {
  const queryClient = useQueryClient();
  const [selectedSearchId, setSelectedSearchId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<WebResultForm>({
    title: "",
    url: "",
    description: "",
    logo_url: "",
    is_sponsored: false,
    wr_parameter: 1
  });

  const { data: searches } = useQuery({
    queryKey: ['searches-for-results'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('related_searches')
        .select('id, search_text, wr_parameter, blog_id')
        .order('search_text');
      if (error) throw error;
      return data;
    }
  });

  const { data: results } = useQuery({
    queryKey: ['admin-web-results', selectedSearchId],
    queryFn: async () => {
      if (!selectedSearchId) return [];
      const { data, error } = await supabase
        .from('web_results')
        .select('*')
        .eq('related_search_id', selectedSearchId)
        .order('is_sponsored', { ascending: false })
        .order('display_order');
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSearchId
  });

  const addResult = useMutation({
    mutationFn: async () => {
      if (!selectedSearchId || !formData.title || !formData.url) {
        throw new Error("Please fill in all required fields");
      }
      const { error } = await supabase.from('web_results').insert({
        related_search_id: selectedSearchId,
        title: formData.title,
        url: formData.url,
        description: formData.description,
        logo_url: formData.logo_url || null,
        is_sponsored: formData.is_sponsored,
        wr_parameter: formData.wr_parameter,
        display_order: results?.length || 0
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-web-results'] });
      setFormData({
        title: "",
        url: "",
        description: "",
        logo_url: "",
        is_sponsored: false,
        wr_parameter: 1
      });
      toast.success("Web result added!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add result");
    }
  });

  const updateResult = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('web_results')
        .update({
          title: formData.title,
          url: formData.url,
          description: formData.description,
          logo_url: formData.logo_url || null,
          is_sponsored: formData.is_sponsored,
          wr_parameter: formData.wr_parameter
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-web-results'] });
      setEditingId(null);
      setFormData({
        title: "",
        url: "",
        description: "",
        logo_url: "",
        is_sponsored: false,
        wr_parameter: 1
      });
      toast.success("Web result updated!");
    }
  });

  const deleteResult = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('web_results').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-web-results'] });
      toast.success("Web result deleted!");
    }
  });

  const handleEdit = (result: any) => {
    setEditingId(result.id);
    setFormData({
      title: result.title,
      url: result.url,
      description: result.description,
      logo_url: result.logo_url || "",
      is_sponsored: result.is_sponsored,
      wr_parameter: result.wr_parameter || 1
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      title: "",
      url: "",
      description: "",
      logo_url: "",
      is_sponsored: false,
      wr_parameter: 1
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Web Results</h2>

      <Card>
        <CardHeader>
          <CardTitle>Manage Web Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Related Search</Label>
            <Select value={selectedSearchId} onValueChange={setSelectedSearchId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a search term" />
              </SelectTrigger>
              <SelectContent>
                {searches?.map((search) => (
                  <SelectItem key={search.id} value={search.id}>
                    {search.search_text} (WR {search.wr_parameter || 1})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSearchId && (
            <>
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold">
                  {editingId ? "Edit Web Result" : "Add Web Result"}
                </h3>
                
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Best Flight Deals"
                  />
                </div>

                <div>
                  <Label>URL *</Label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label>Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the website..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Logo URL (optional)</Label>
                  <Input
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <Label>WR Parameter (must match search)</Label>
                  <Select value={String(formData.wr_parameter)} onValueChange={(v) => setFormData({ ...formData, wr_parameter: parseInt(v) })}>
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

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sponsored"
                    checked={formData.is_sponsored}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, is_sponsored: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="sponsored"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Mark as Sponsored
                  </label>
                </div>

                <div className="flex gap-2">
                  {editingId ? (
                    <>
                      <Button onClick={() => updateResult.mutate(editingId)}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => addResult.mutate()}>
                      Add Result
                    </Button>
                  )}
                </div>
              </div>

              {results && results.length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <Label>Current Results</Label>
                  {results.map((result) => (
                    <div key={result.id} className="flex items-start justify-between p-4 border rounded gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{result.title}</h4>
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">
                            WR {result.wr_parameter || 1}
                          </span>
                          {result.is_sponsored && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                              Sponsored
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{result.url}</p>
                        <p className="text-sm">{result.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(result)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteResult.mutate(result.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
