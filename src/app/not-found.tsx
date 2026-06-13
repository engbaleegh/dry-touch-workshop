import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="mb-4 rounded-full bg-slate-100 p-4">
        <FileQuestion className="h-8 w-8 text-slate-400" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">404</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/dashboard" className="mt-6">
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  );
}
