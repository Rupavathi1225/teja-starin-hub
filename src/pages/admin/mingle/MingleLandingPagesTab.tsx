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

export const MingleLandingPagesTab = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: ""
  });

  const { data: pages } = useQuery({
    queryKey: ['mingle-landing-pages'],
    queryFn: async () => {
      const { data, error } = await mingleSupabase
        .from('landing_page')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await mingleSupabase
          .from('landing_page')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await mingleSupabase
          .from('landing_page')
          .insert(formData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mingle-landing-pages'] });
      toast.success(editingId ? "Updated!" : "Created!");
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await mingleSupabase
        .from('landing_page')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mingle-landing-pages'] });
      toast.success("Deleted!");
    }
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: ""
    });
  };

  const handleEdit = (page: any) => {
    setEditingId(page.id);
    setFormData({
      title: page.title || "",
      description: page.description || ""
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mingle - Landing Pages</h2>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit" : "Add"} Landing Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => saveMutation.mutate()}>
              {editingId ? "Update" : "Create"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Landing Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pages?.map((page) => (
              <div key={page.id} className="flex items-center justify-between p-4 border rounded">
                <div className="flex-1">
                  <div className="font-medium">{page.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">{page.description}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => handleEdit(page)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => deleteMutation.mutate(page.id)}>
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
