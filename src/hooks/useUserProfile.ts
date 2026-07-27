import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserProfile() {
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUserProfile() {
      // 1. Get current authenticated user session
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 2. Fetch the 'plan' column for this user from 'profiles' table
        const { data, error } = await supabase
          .from("profiles")
          .select("plan" as any)
          .eq("id", user.id)
          .single();

        if (data && !error) {
            const profile = data as unknown as { plan? : string }
            setPlan(profile.plan || "free");
        }
      }
      setLoading(false);
    }

    fetchUserProfile();
  }, []);

  return { plan, loading };
}