import { supabase } from "@/integrations/supabase/client";

// Generate a persistent session ID
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Get device type
export const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile";
  }
  return "desktop";
};

// Get IP and country (simplified - you'd need a service for real IP)
export const getIPInfo = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return { ip: data.ip };
  } catch {
    return { ip: 'unknown' };
  }
};

interface TrackEventParams {
  eventType: string;
  eventData?: Record<string, any>;
  blogId?: string;
  relatedSearchId?: string;
}

export const trackEvent = async ({
  eventType,
  eventData = {},
  blogId,
  relatedSearchId
}: TrackEventParams) => {
  const sessionId = getSessionId();
  const deviceType = getDeviceType();
  const { ip } = await getIPInfo();
  
  // Get source from URL params or referrer
  const urlParams = new URLSearchParams(window.location.search);
  const source = urlParams.get('source') || document.referrer || 'direct';
  
  const { error } = await supabase.from('tracking_events').insert({
    session_id: sessionId,
    event_type: eventType,
    event_data: eventData,
    ip_address: ip,
    user_agent: navigator.userAgent,
    device_type: deviceType,
    country: 'unknown', // Would need geolocation service
    source: source,
    blog_id: blogId,
    related_search_id: relatedSearchId
  });

  if (error) {
    console.error('Tracking error:', error);
  }
};
