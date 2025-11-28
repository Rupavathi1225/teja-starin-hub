import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mingleSupabase } from "@/integrations/mingle/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const MingleWebResultsTab = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_url: "",
    logo_url: "",
    page_number: 1,
    position: 1,
    is_active: true,
    is_sponsored: false,
    pre_landing_page_key: ""
  });

  const { data: results } = useQuery({
    queryKey: ['mingle-web-results'],
    queryFn: async () => {
      const { data, error } = await mingleSupabase
        .from('web_results')
        .select('*')
        .order('page_number')
        .order('position');
      if (error) throw error;
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await mingleSupabase
          .from('web_results')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await mingleSupabase
          .from('web_results')
          .insert(formData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mingle-web-results'] });
      toast.success(editingId ? "Updated!" : "Created!");
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await mingleSupabase
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
      target_url: "",
      logo_url: "",
      page_number: 1,
      position: 1,
      is_active: true,
      is_sponsored: false,
      pre_landing_page_key: ""
    });
  };

  const handleEdit = (result: any) => {
    setEditingId(result.id);
    setFormData({
      title: result.title || "",
      description: result.description || "",
      target_url: result.target_url || "",
      logo_url: result.logo_url || "",
      page_number: result.page_number || 1,
      position: result.position || 1,
      is_active: result.is_active ?? true,
      is_sponsored: result.is_sponsored ?? false,
      pre_landing_page_key: result.pre_landing_page_key || ""
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
            <Label className="text-mingle-text">Title</Label>
            <Input
              className="bg-mingle-darker border-mingle-border text-mingle-text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-mingle-text">Description</Label>
            <Textarea
              className="bg-mingle-darker border-mingle-border text-mingle-text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label className="text-mingle-text">Target URL</Label>
            <Input
              className="bg-mingle-darker border-mingle-border text-mingle-text"
              value={formData.target_url}
              onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <Label className="text-mingle-text">Logo URL</Label>
            <Input
              className="bg-mingle-darker border-mingle-border text-mingle-text"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-mingle-text">Page Number</Label>
              <Input
                className="bg-mingle-darker border-mingle-border text-mingle-text"
                type="number"
                value={formData.page_number}
                onChange={(e) => setFormData({ ...formData, page_number: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div>
              <Label className="text-mingle-text">Position</Label>
              <Input
                className="bg-mingle-darker border-mingle-border text-mingle-text"
                type="number"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div>
            <Label className="text-mingle-text">Pre-Landing Page Key</Label>
            <Input
              className="bg-mingle-darker border-mingle-border text-mingle-text"
              value={formData.pre_landing_page_key}
              onChange={(e) => setFormData({ ...formData, pre_landing_page_key: e.target.value })}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label className="text-mingle-text">Active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_sponsored}
                onCheckedChange={(checked) => setFormData({ ...formData, is_sponsored: checked })}
              />
              <Label className="text-mingle-text">Sponsored</Label>
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
        </CardContent>
      </Card>

      <Card className="bg-mingle-dark border-mingle-border">
        <CardHeader>
          <CardTitle className="text-mingle-cyan">Existing Web Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {results?.map((result) => (
              <div key={result.id} className="flex items-center justify-between p-4 border border-mingle-border rounded bg-mingle-darker">
                <div>
                  <div className="font-medium text-mingle-text">{result.title}</div>
                  <div className="text-sm text-mingle-text/60">
                    Page: {result.page_number} | Pos: {result.position}
                    {result.is_sponsored && " | Sponsored"}
                    {!result.is_active && " | Inactive"}
                  </div>
                  <div className="text-xs text-mingle-text/40 truncate max-w-md">{result.target_url}</div>
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
    </div>
  );
};
