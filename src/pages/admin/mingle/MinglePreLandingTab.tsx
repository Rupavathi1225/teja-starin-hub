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

  // Fetch all prelander configs from MINGLE database
  const { data: prelanderConfigs } = useQuery({
    queryKey: ['mingle-prelander-configs'],
    queryFn: async () => {
      const { data, error } = await mingleSupabase
        .from('prelander_configs')
        .select('*')
        .order('key');
      if (error) throw error;
      return data;
    }
  });

  // Fetch config from MINGLE database
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
        throw new Error("Config key is required");
      }
      
      // Save ONLY to MINGLE database
      const { error } = await mingleSupabase
        .from('prelander_configs')
        .upsert(formData, {
          onConflict: 'key'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mingle-prelanding-config'] });
      queryClient.invalidateQueries({ queryKey: ['mingle-prelander-configs'] });
      toast.success("Pre-landing saved to Mingle!");
    }
  });

  return (
    <div className="space-y-6 mingle-moody-theme">
      <h2 className="text-2xl font-bold text-mingle-cyan">Mingle - Pre-Landing Page Builder</h2>

      <Card className="bg-mingle-dark border-mingle-border">
        <CardHeader>
          <CardTitle className="text-mingle-cyan">Configure Pre-Landing Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-mingle-text">Config Key</Label>
            <Select 
              value={selectedKey} 
              onValueChange={(value) => {
                setSelectedKey(value);
                setFormData({ ...formData, key: value });
              }}
            >
              <SelectTrigger className="bg-mingle-darker border-mingle-border text-mingle-text">
                <SelectValue placeholder="Choose a config key" />
              </SelectTrigger>
              <SelectContent className="bg-mingle-darker border-mingle-border">
                {prelanderConfigs?.map((config) => (
                  <SelectItem key={config.key} value={config.key} className="text-mingle-text hover:bg-mingle-dark focus:bg-mingle-dark focus:text-mingle-cyan">
                    {config.key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div>
            <Label className="text-mingle-text">Main Image URL</Label>
            <Input
              className="bg-mingle-darker border-mingle-border text-mingle-text"
              value={formData.main_image_url}
              onChange={(e) => setFormData({ ...formData, main_image_url: e.target.value })}
              placeholder="https://example.com/hero.jpg"
            />
          </div>

          <div>
            <Label className="text-mingle-text">Headline</Label>
            <Input
              className="bg-mingle-darker border-mingle-border text-mingle-text"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="Enter your compelling headline"
            />
          </div>

          <div>
            <Label className="text-mingle-text">Subtitle</Label>
            <Input
              className="bg-mingle-darker border-mingle-border text-mingle-text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Enter your subtitle"
            />
          </div>

          <div>
            <Label className="text-mingle-text">Description</Label>
            <Textarea
              className="bg-mingle-darker border-mingle-border text-mingle-text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter your description"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-mingle-text">Redirect Description (shown during countdown)</Label>
            <Textarea
              className="bg-mingle-darker border-mingle-border text-mingle-text"
              value={formData.redirect_description}
              onChange={(e) => setFormData({ ...formData, redirect_description: e.target.value })}
              placeholder="You will be redirected to..."
              rows={2}
            />
          </div>

          <div>
            <Label className="text-mingle-text">Countdown Seconds (2-10)</Label>
            <Input
              className="bg-mingle-darker border-mingle-border text-mingle-text"
              type="number"
              min="2"
              max="10"
              value={formData.countdown_seconds}
              onChange={(e) => setFormData({ ...formData, countdown_seconds: parseInt(e.target.value) || 3 })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-mingle-text">Background Color</Label>
              <Input
                className="bg-mingle-darker border-mingle-border text-mingle-text"
                type="color"
                value={formData.background_color}
                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-mingle-text">Button Color</Label>
              <Input
                className="bg-mingle-darker border-mingle-border text-mingle-text"
                type="color"
                value={formData.button_color}
                onChange={(e) => setFormData({ ...formData, button_color: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-mingle-text">Button Text Color</Label>
              <Input
                className="bg-mingle-darker border-mingle-border text-mingle-text"
                type="color"
                value={formData.button_text_color}
                onChange={(e) => setFormData({ ...formData, button_text_color: e.target.value })}
              />
            </div>
          </div>

          <Button className="bg-mingle-cyan text-mingle-darker hover:bg-mingle-cyan/90" onClick={() => saveConfig.mutate()}>
            Save Configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
