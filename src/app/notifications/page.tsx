"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/features/auth/auth-context";
import { useToast } from "@/features/toast/toast-context";
import { Bell, Heart, MessageCircle, UserPlus, ShoppingBag, Sparkles, Check, CheckCheck, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface NotificationItem {
  id: string;
  type: "like" | "comment" | "follow" | "purchase" | "system";
  user: string;
  message: string;
  time: string;
  read: boolean;
  image?: string;
  linkUrl?: string;
}

const TABS = [
  { key: "All", label: "All" },
  { key: "Likes", label: "Likes" },
  { key: "Comments", label: "Comments" },
  { key: "Follows", label: "Follows" },
  { key: "Orders", label: "Orders" },
];

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifications(data.notifications || []);
      }
    } catch {
      // silent catch
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "All") return true;
    if (activeTab === "Likes") return notification.type === "like";
    if (activeTab === "Comments") return notification.type === "comment";
    if (activeTab === "Follows") return notification.type === "follow";
    if (activeTab === "Orders") return notification.type === "purchase";
    return true;
  });

  const markAsRead = async (id: string) => {
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    } catch {
      // silent
    }
  };

  const markAllAsRead = async () => {
    setNotifications((current) => current.map((n) => ({ ...n, read: true })));
    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (res.ok) {
        showToast("All notifications marked as read");
      }
    } catch {
      // silent
    }
  };

  const removeNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((current) => current.filter((n) => n.id !== id));
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    } catch {
      // silent
    }
  };

  const getTypeIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-pink-500 fill-pink-500" />;
      case "comment":
        return <MessageCircle className="h-4 w-4 text-fuchsia-400" />;
      case "follow":
        return <UserPlus className="h-4 w-4 text-indigo-400" />;
      case "purchase":
        return <ShoppingBag className="h-4 w-4 text-emerald-400" />;
      case "system":
      default:
        return <Sparkles className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <section className="flex-1 px-6 py-12 pt-28 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-4xl">
          {/* HEADER */}
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-500">
                Activity & Alerts
              </p>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 px-2.5 text-xs font-bold text-white shadow-lg shadow-fuchsia-500/25">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                Stay updated with interactions, orders, and activity around your account.
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-fuchsia-600 dark:text-fuchsia-400 transition hover:text-fuchsia-500"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* TABS */}
          <div className="mt-8 flex gap-2 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800 pb-px">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "shrink-0 border-b-2 px-5 py-3 text-sm font-semibold transition",
                  activeTab === tab.key
                    ? "border-fuchsia-500 text-neutral-900 dark:text-white"
                    : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* NOTIFICATION FEED */}
          <div className="mt-6 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/40 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => {
                const inner = (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={cn(
                      "group relative flex cursor-pointer items-center gap-4 rounded-3xl border p-4 sm:p-5 transition backdrop-blur-xl",
                      notification.read
                        ? "border-neutral-200 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/40 hover:bg-neutral-100 dark:hover:bg-neutral-900/80 text-neutral-800 dark:text-neutral-200"
                        : "border-fuchsia-500/30 bg-fuchsia-500/[0.04] dark:bg-fuchsia-500/[0.08] hover:bg-fuchsia-500/[0.07] dark:hover:bg-fuchsia-500/[0.12] text-neutral-900 dark:text-white shadow-sm"
                    )}
                  >
                    {/* UNREAD DOT */}
                    {!notification.read && (
                      <div className="absolute left-2.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-fuchsia-500 shadow-sm shadow-fuchsia-500" />
                    )}

                    {/* AVATAR / ICON */}
                    <div className="relative shrink-0">
                      {notification.image ? (
                        <img
                          src={notification.image}
                          alt=""
                          className="h-12 w-12 rounded-2xl object-cover ring-2 ring-neutral-200 dark:ring-neutral-800"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-base">
                          {getTypeIcon(notification.type)}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-neutral-900 shadow-md">
                        {getTypeIcon(notification.type)}
                      </span>
                    </div>

                    {/* MESSAGE CONTENT */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug">
                        <span className="font-semibold text-neutral-900 dark:text-white mr-1">
                          {notification.user}
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-300">
                          {notification.message}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-neutral-400">
                        {notification.time}
                      </p>
                    </div>

                    {/* ACTION / DISMISS */}
                    <div className="flex items-center gap-2">
                      {notification.linkUrl && (
                        <ArrowRight className="h-4 w-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => removeNotification(notification.id, e)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-neutral-400 opacity-0 transition hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-red-500 group-hover:opacity-100"
                        aria-label="Remove notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );

                if (notification.linkUrl) {
                  return (
                    <Link key={notification.id} href={notification.linkUrl} className="block">
                      {inner}
                    </Link>
                  );
                }

                return inner;
              })
            ) : (
              /* EMPTY STATE */
              <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800/80 py-20 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-400">
                  <Bell className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-neutral-900 dark:text-white">
                  No notifications yet
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
                  When someone interacts with your posts, follows you, or places an order, you will see it here.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}