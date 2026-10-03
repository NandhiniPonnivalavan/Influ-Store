"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, ImagePlus, Clapperboard, ExternalLink } from "lucide-react";
import { CreatePostForm } from "@/components/posts/CreatePostForm";
import { CreateReelForm } from "@/components/reels/CreateReelForm";
import { cn } from "@/lib/utils/cn";

export interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "post" | "reel";
  onSuccess?: () => void;
}

export function CreateContentModal({
  isOpen,
  onClose,
  initialTab = "post",
  onSuccess,
}: CreateContentModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"post" | "reel">(initialTab);

  // Sync tab with initialTab whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleSuccess() {
    onClose();
    if (onSuccess) {
      onSuccess();
    } else {
      router.refresh();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* MODAL DIALOG */}
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur px-5 py-3.5">
          {/* TAB SWITCHER */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => setTab("post")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition",
                tab === "post"
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              <ImagePlus className={cn("h-4 w-4", tab === "post" ? "text-fuchsia-500" : "text-neutral-400")} />
              <span>Create Post</span>
            </button>

            <button
              type="button"
              onClick={() => setTab("reel")}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition",
                tab === "reel"
                  ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              <Clapperboard className={cn("h-4 w-4", tab === "reel" ? "text-fuchsia-500" : "text-neutral-400")} />
              <span>Upload Reel</span>
            </button>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2">
            <Link
              href={tab === "post" ? "/create-post" : "/create-reel"}
              onClick={onClose}
              className="hidden sm:inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-fuchsia-500 dark:hover:text-fuchsia-400 transition mr-2"
              title="Open full screen creator studio"
            >
              <span>Full Studio</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {tab === "post" ? (
            <CreatePostForm onSuccess={handleSuccess} onCancel={onClose} />
          ) : (
            <CreateReelForm onSuccess={handleSuccess} onCancel={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}
