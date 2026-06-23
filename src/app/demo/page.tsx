import React from "react";
import MotionExample from "../../components/ui/MotionExample";

export default function DemoPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl w-full">
        <h2 className="text-2xl font-semibold mb-4">Demo: GraphQL + React Query + Motion</h2>
        <ClientDemo />
      </div>
    </main>
  );
}

function ClientDemo() {
  "use client";

  // dynamic import to keep module scope correct for client
  const { useExampleQuery } = require("../../hooks/useExampleQuery");
  const { default: Motion } = require("../../components/ui/MotionExample");

  const { data, isLoading, error } = useExampleQuery();

  return (
    <div className="space-y-4">
      <div>
        <strong>Status:</strong>{" "}
        {isLoading ? "Loading..." : error ? "Error" : "Success"}
      </div>
      <div>
        <strong>Data:</strong> <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
      </div>
      <div>
        <Motion />
      </div>
    </div>
  );
}
