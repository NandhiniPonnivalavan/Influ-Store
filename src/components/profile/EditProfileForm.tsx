"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, AlertCircle, User, AtSign, Globe, Image as ImageIcon, ExternalLink, Upload, Trash2, Camera, Loader2 } from "lucide-react";

export function EditProfileForm() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [displayName, setDisplayName] = useState(
    user?.profile?.displayName || user?.username || ""
  );
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.profile?.bio || "");
  const [website, setWebsite] = useState(user?.profile?.website || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.profile?.avatarUrl || "");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  React.useEffect(() => {
    if (user?.profile?.avatarUrl) {
      setAvatarUrl(user.profile.avatarUrl);
    }
  }, [user?.profile?.avatarUrl]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setAvatarUploadError("Image size must be 8MB or smaller.");
      return;
    }

    setAvatarUploadError("");
    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to upload image.");
      }

      setAvatarUrl(data.url);
      await refreshUser();
    } catch (err) {
      setAvatarUploadError(
        err instanceof Error ? err.message : "Failed to upload image from computer."
      );
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleRemoveAvatar() {
    setUploadingAvatar(true);
    setAvatarUploadError("");
    try {
      await fetch("/api/profile/avatar", { method: "DELETE" });
      setAvatarUrl("");
      await refreshUser();
    } catch {
      setAvatarUploadError("Failed to remove profile photo.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavedSuccess(false);
    setGeneralError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          username: username.trim(),
          bio: bio.trim() || null,
          website: website.trim() || null,
          avatarUrl: avatarUrl.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        setGeneralError(data.message || "Failed to update profile.");
        return;
      }

      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch {
      setGeneralError("An error occurred while updating your profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {savedSuccess && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-600 dark:text-green-300 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Your profile has been saved successfully.</span>
        </div>
      )}

      {generalError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400 animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* AVATAR PREVIEW & UPLOAD */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Profile Photo
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Upload a photo from your computer to personalize your profile.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with click-to-upload hover overlay */}
          <div
            className="relative group cursor-pointer shrink-0"
            onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
            title="Click to choose a photo from your computer"
          >
            <Avatar
              src={avatarUrl}
              name={displayName || username}
              size="2xl"
              className="ring-4 ring-neutral-100 dark:ring-neutral-800 shadow-md transition group-hover:opacity-90"
            />
            <div className="absolute inset-0 rounded-full bg-black/45 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-xs font-medium backdrop-blur-[1px]">
              <Camera className="h-5 w-5 mb-1" />
              <span>Change</span>
            </div>
            {uploadingAvatar && (
              <div className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center text-white text-xs font-medium backdrop-blur-sm">
                <Loader2 className="h-6 w-6 animate-spin mb-1 text-fuchsia-400" />
                <span>Uploading...</span>
              </div>
            )}
          </div>

          <div className="flex-1 w-full space-y-4 text-center sm:text-left">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="gap-2"
              >
                {uploadingAvatar ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Upload from computer</span>
                  </>
                )}
              </Button>

              {avatarUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  className="gap-2 text-red-500 hover:text-red-600 hover:border-red-500/30 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove photo</span>
                </Button>
              )}
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Supported formats: JPG, PNG, WebP, or GIF (max 8MB).
            </p>

            {avatarUploadError && (
              <div className="flex items-center gap-2 text-xs text-red-500 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{avatarUploadError}</span>
              </div>
            )}

            {/* Optional URL input toggle */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              {!showUrlInput ? (
                <button
                  type="button"
                  onClick={() => setShowUrlInput(true)}
                  className="text-xs text-neutral-500 hover:text-fuchsia-500 dark:text-neutral-400 dark:hover:text-fuchsia-400 transition underline underline-offset-4"
                >
                  Or enter an image web URL
                </button>
              ) : (
                <div className="space-y-2 pt-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Avatar Image URL
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(false)}
                      className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    >
                      Hide URL field
                    </button>
                  </div>
                  <Input
                    type="url"
                    placeholder="https://images.unsplash.com/... or https://..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    error={fieldErrors.avatarUrl?.[0]}
                    leftIcon={<ImageIcon className="h-4 w-4" />}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* BASIC DETAILS */}
      <Card className="p-6 sm:p-8 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            Basic Information
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Manage your public identity on Influ-Store.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* DISPLAY NAME */}
          <Input
            label="Display Name"
            type="text"
            placeholder="e.g. Priya Sharma"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            error={fieldErrors.displayName?.[0]}
            required
            leftIcon={<User className="h-4 w-4" />}
          />

          {/* USERNAME */}
          <Input
            label="Username"
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={fieldErrors.username?.[0]}
            required
            leftIcon={<AtSign className="h-4 w-4" />}
            helperText="Changing username will change your public profile URL."
          />
        </div>

        {/* BIO */}
        <Textarea
          label="Bio"
          placeholder="Tell the community about yourself, your style, and what inspires you..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          error={fieldErrors.bio?.[0]}
          charCount={bio.length}
          maxCharCount={160}
          rows={3}
        />

        {/* WEBSITE */}
        <Input
          label="Website"
          type="text"
          placeholder="https://yourwebsite.com or yourbrand.com"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          error={fieldErrors.website?.[0]}
          leftIcon={<Globe className="h-4 w-4" />}
        />
      </Card>

      {/* ACTIONS */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
        {user?.username && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/profile/${user.username}`)}
            className="gap-2 text-sm text-neutral-600 dark:text-neutral-400"
          >
            <span>View Public Profile</span>
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            isLoading={loading}
            className="min-w-[140px]"
          >
            Save changes
          </Button>
        </div>
      </div>
    </form>
  );
}
