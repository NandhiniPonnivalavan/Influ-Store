"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle2, XCircle, FileEdit, Store, Package, Check, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/auth-context";
import { SellerApplicationItem } from "@/types/seller";

interface SellerApplicationStatusProps {
  application: SellerApplicationItem;
  onEditRequested?: () => void;
}

export function SellerApplicationStatus({ application, onEditRequested }: SellerApplicationStatusProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [approving, setApproving] = useState(false);

  async function handleAutoApprove() {
    setApproving(true);
    try {
      const res = await fetch("/api/seller/application/auto-approve", { method: "POST" });
      if (res.ok) {
        await refreshUser();
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setApproving(false);
    }
  }

  if (application.status === "PENDING") {
    return (
      <Card className="flex flex-col items-center gap-4 p-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
          <Clock className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Application under review</h2>
          <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
            Your seller application is under review. We&apos;ll let you know as soon as a decision has been made.
          </p>
        </div>
        {application.submittedAt && (
          <p className="text-xs text-neutral-400">
            Submitted {new Date(application.submittedAt).toLocaleDateString()}
          </p>
        )}

        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 w-full flex flex-col items-center gap-2">
          <p className="text-xs text-neutral-400">Testing this locally?</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoApprove}
            disabled={approving}
            className="gap-2 text-xs"
          >
            {approving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5 text-green-500" />
            )}
            <span>Approve Application (Dev/Testing)</span>
          </Button>
        </div>
      </Card>
    );
  }

  if (application.status === "APPROVED") {
    return (
      <Card className="flex flex-col items-center gap-5 border-green-500/20 bg-green-500/[0.03] p-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Your seller account has been verified!
          </h2>
          <p className="mt-1 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
            Congratulations! Your seller application is approved. You can now set up your storefront and begin listing products for shoppers.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/seller/store">
            <Button variant="primary" className="gap-2">
              <Store className="h-4 w-4" />
              <span>Set Up My Store</span>
            </Button>
          </Link>
          <Link href="/seller/products">
            <Button variant="outline" className="gap-2">
              <Package className="h-4 w-4" />
              <span>Manage Products</span>
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (application.status === "REJECTED") {
    return (
      <Card className="flex flex-col items-center gap-4 border-red-500/20 bg-red-500/[0.03] p-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <XCircle className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Your application was not approved
          </h2>
          {application.rejectionReason && (
            <p className="mx-auto mt-3 max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-3.5 text-sm text-red-600 dark:text-red-400">
              {application.rejectionReason}
            </p>
          )}
        </div>
        {onEditRequested && (
          <Button type="button" onClick={onEditRequested} className="gap-2">
            <FileEdit className="h-4 w-4" />
            Revise &amp; Resubmit
          </Button>
        )}
      </Card>
    );
  }

  return null;
}
