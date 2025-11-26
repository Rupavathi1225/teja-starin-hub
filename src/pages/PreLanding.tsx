import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { trackEvent, getSessionId, getIPInfo } from "@/lib/tracking";

const PreLanding = () => {
  const { searchId } = useParams();
  const [email, setEmail] = useState("");

  const { data: config } = useQuery({
    queryKey: ['pre-landing-config', searchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pre_landing_config')
        .select('*')
        .eq('related_search_id', searchId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const submitEmail = useMutation({
    mutationFn: async (email: string) => {
      const sessionId = getSessionId();
      const { ip } = await getIPInfo();
      
      const { error } = await supabase.from('email_submissions').insert({
        email,
        related_search_id: searchId,
        session_id: sessionId,
        ip_address: ip,
        country: 'unknown',
        source: new URLSearchParams(window.location.search).get('source') || 'direct'
      });
      
      if (error) throw error;
      
      await trackEvent({
        eventType: 'email_submission',
        eventData: { email },
        relatedSearchId: searchId
      });
    },
    onSuccess: () => {
      toast.success("Thank you! Your email has been submitted.");
      setEmail("");
    },
    onError: () => {
      toast.error("Failed to submit email. Please try again.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      submitEmail.mutate(email);
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: config.background_color }}
    >
      <div className="max-w-2xl w-full text-center space-y-8">
        {config.logo_url && (
          <img src={config.logo_url} alt="Logo" className="h-12 mx-auto" />
        )}
        
        {config.main_image_url && (
          <img 
            src={config.main_image_url} 
            alt="Main visual"
            className="w-full max-w-xl mx-auto rounded-lg shadow-lg"
          />
        )}
        
        {config.headline && (
          <h1 className="text-4xl md:text-5xl font-bold">{config.headline}</h1>
        )}
        
        {config.description && (
          <p className="text-lg text-muted-foreground">{config.description}</p>
        )}
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-center h-12 text-lg bg-white"
          />
          <Button 
            type="submit"
            className="w-full h-12 text-lg"
            style={{
              backgroundColor: config.button_color,
              color: config.button_text_color
            }}
          >
            Get Access
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PreLanding;
