import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mingleSupabase } from "@/integrations/mingle/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const MingleRelatedSearchesTab = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    search_text: "",
    title: "",
    web_result_page: 1,
    position: 1,
    display_order: 0,
    is_active: true,
    pre_landing_page_key: ""
  });

  const { data: searches } = useQuery({
    queryKey: ['mingle-related-searches'],
    queryFn: async () => {
      const { data, error } = await mingleSupabase
        .from('related_searches')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await mingleSupabase
          .from('related_searches')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await mingleSupabase
          .from('related_searches')
          .insert(formData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mingle-related-searches'] });
      toast.success(editingId ? "Updated!" : "Created!");
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await mingleSupabase
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
      search_text: "",
      title: "",
      web_result_page: 1,
      position: 1,
      display_order: 0,
      is_active: true,
      pre_landing_page_key: ""
    });
  };

  const handleEdit = (search: any) => {
    setEditingId(search.id);
    setFormData({
      search_text: search.search_text || "",
      title: search.title || "",
      web_result_page: search.web_result_page || 1,
      position: search.position || 1,
      display_order: search.display_order || 0,
      is_active: search.is_active ?? true,
      pre_landing_page_key: search.pre_landing_page_key || ""
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
            <Label className="text-mingle-text">Search Text</Label>
            <Input
              className="bg-mingle-darker border-mingle-border text-mingle-text"
              value={formData.search_text}
              onChange={(e) => setFormData({ ...formData, search_text: e.target.value })}
            />
          </div>

          <div>
            <Label className="text-mingle-text">Title</Label>
            <Input
              className="bg-mingle-darker border-mingle-border text-mingle-text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-mingle-text">Web Result Page</Label>
              <Input
                className="bg-mingle-darker border-mingle-border text-mingle-text"
                type="number"
                value={formData.web_result_page}
                onChange={(e) => setFormData({ ...formData, web_result_page: parseInt(e.target.value) || 1 })}
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

            <div>
              <Label className="text-mingle-text">Display Order</Label>
              <Input
                className="bg-mingle-darker border-mingle-border text-mingle-text"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
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

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label className="text-mingle-text">Active</Label>
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
          <CardTitle className="text-mingle-cyan">Existing Related Searches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {searches?.map((search) => (
              <div key={search.id} className="flex items-center justify-between p-4 border border-mingle-border rounded bg-mingle-darker">
                <div>
                  <div className="font-medium text-mingle-text">{search.search_text}</div>
                  <div className="text-sm text-mingle-text/60">
                    Page: {search.web_result_page} | Pos: {search.position} | Order: {search.display_order}
                    {!search.is_active && " | Inactive"}
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
    </div>
  );
};
