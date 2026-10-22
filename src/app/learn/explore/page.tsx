"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Bot, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ConceptExplorerRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tutor");
  }, [router]);

  return (
    <AppShell>
      <div className="py-24 text-center max-w-lg mx-auto space-y-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-100 flex items-center justify-center text-brand-purple shadow-sm">
          <Bot className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Redirecting to Monday AI Tutor...</h2>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Concept exploration, algorithm analysis, and worked examples are now natively handled by Monday AI Tutor with multi-file RAG document grounding.
          </p>
        </div>
        <div>
          <Link href="/tutor">
            <Button variant="primary" className="font-bold shadow-md">
              Go to Monday AI Tutor <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
