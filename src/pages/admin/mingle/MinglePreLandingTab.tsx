import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mingleSupabase } from "@/integrations/mingle/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const MinglePreLandingTab = () => {
  const queryClient = useQueryClient();
  const [selectedKey, setSelectedKey] = useState("");
  const [formData, setFormData] = useState({
    key: "",
    logo_url: "",
    main_image_url: "",
    headline: "",
    subtitle: "",
    description: "",
    redirect_description: "",
    countdown_seconds: 3,
    background_color: "#ffffff",
    button_color: "#000000",
    button_text_color: "#ffffff"
  });

  const { data: configs } = useQuery({
    queryKey: ['mingle-prelanding-configs'],
    queryFn: async () => {
      const { data, error } = await mingleSupabase
        .from('prelander_configs')
        .select('*')
        .order('key');
      if (error) throw error;
      return data;
    }
  });

  const { data: config } = useQuery({
    queryKey: ['mingle-prelanding-config', selectedKey],
    queryFn: async () => {
      if (!selectedKey) return null;
      const { data, error } = await mingleSupabase
        .from('prelander_configs')
        .select('*')
        .eq('key', selectedKey)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setFormData({
          key: data.key || "",
          logo_url: data.logo_url || "",
          main_image_url: data.main_image_url || "",
          headline: data.headline || "",
          subtitle: data.subtitle || "",
          description: data.description || "",
          redirect_description: data.redirect_description || "",
          countdown_seconds: data.countdown_seconds || 3,
          background_color: data.background_color || "#ffffff",
          button_color: data.button_color || "#000000",
          button_text_color: data.button_text_color || "#ffffff"
        });
      }
      return data;
    },
    enabled: !!selectedKey
  });

  const saveConfig = useMutation({
    mutationFn: async () => {
      if (!formData.key) {
        throw new Error("Key is required");
      }
      
      if (config) {
        const { error } = await mingleSupabase
          .from('prelander_configs')
          .update(formData)
          .eq('key', selectedKey);
        if (error) throw error;
      } else {
        const { error } = await mingleSupabase
          .from('prelander_configs')
          .insert(formData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mingle-prelanding-configs'] });
      toast.success("Configuration saved!");
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mingle - Pre-Landing Page Builder</h2>

      <Card>
        <CardHeader>
          <CardTitle>Configure Pre-Landing Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select or Create Key</Label>
            <Select value={selectedKey} onValueChange={setSelectedKey}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a key or create new" />
              </SelectTrigger>
              <SelectContent>
                {configs?.map((cfg) => (
                  <SelectItem key={cfg.key} value={cfg.key}>
                    {cfg.key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Key (for new config)</Label>
            <Input
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              placeholder="Enter unique key"
            />
          </div>

          <div>
            <Label>Logo URL</Label>
            <Input
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <Label>Main Image URL</Label>
            <Input
              value={formData.main_image_url}
              onChange={(e) => setFormData({ ...formData, main_image_url: e.target.value })}
              placeholder="https://example.com/hero.jpg"
            />
          </div>

          <div>
            <Label>Headline</Label>
            <Input
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="Enter your compelling headline"
            />
          </div>

          <div>
            <Label>Subtitle</Label>
            <Input
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Enter your subtitle"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter your description"
              rows={3}
            />
          </div>

          <div>
            <Label>Redirect Description (shown during countdown)</Label>
            <Textarea
              value={formData.redirect_description}
              onChange={(e) => setFormData({ ...formData, redirect_description: e.target.value })}
              placeholder="You will be redirected to..."
              rows={2}
            />
          </div>

          <div>
            <Label>Countdown Seconds (2-10)</Label>
            <Input
              type="number"
              min="2"
              max="10"
              value={formData.countdown_seconds}
              onChange={(e) => setFormData({ ...formData, countdown_seconds: parseInt(e.target.value) || 3 })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Background Color</Label>
              <Input
                type="color"
                value={formData.background_color}
                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
              />
            </div>

            <div>
              <Label>Button Color</Label>
              <Input
                type="color"
                value={formData.button_color}
                onChange={(e) => setFormData({ ...formData, button_color: e.target.value })}
              />
            </div>

            <div>
              <Label>Button Text Color</Label>
              <Input
                type="color"
                value={formData.button_text_color}
                onChange={(e) => setFormData({ ...formData, button_text_color: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={() => saveConfig.mutate()}>
            Save Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
