"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "../../supabaseClient";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/login");
      }
    };
    checkSession();
  }, [router]);

  return <div>Welcome to the Home Page</div>;
}
