import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { trackEvent, getSessionId, getIPInfo } from "@/lib/tracking";

const PreLanding = () => {
  const { searchId } = useParams();
  const [searchParams] = useSearchParams();
  const targetUrl = searchParams.get('targetUrl');
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [showRedirect, setShowRedirect] = useState(false);

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
      toast.success("Thank you! Redirecting...");
      setEmail("");
      setShowRedirect(true);
      
      // Start countdown
      const countdownSeconds = config?.countdown_seconds || 3;
      setCountdown(countdownSeconds);
    },
    onError: () => {
      toast.error("Failed to submit email. Please try again.");
    }
  });

  // Countdown timer
  useEffect(() => {
    if (showRedirect && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showRedirect && countdown === 0 && targetUrl) {
      window.location.href = decodeURIComponent(targetUrl);
    }
  }, [showRedirect, countdown, targetUrl]);

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
        
        {config.subtitle && (
          <h2 className="text-2xl md:text-3xl font-medium text-muted-foreground">
            {config.subtitle}
          </h2>
        )}
        
        {config.description && (
          <p className="text-lg text-muted-foreground">{config.description}</p>
        )}
        
        {!showRedirect ? (
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
        ) : (
          <div className="space-y-4">
            <div className="text-6xl font-bold animate-pulse">{countdown}</div>
            {config.redirect_description && (
              <p className="text-xl text-muted-foreground">
                {config.redirect_description}
              </p>
            )}
            <p className="text-lg text-muted-foreground">
              Redirecting you to your destination...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreLanding;
