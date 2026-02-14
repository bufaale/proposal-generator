"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X, MessageSquare, Loader2 } from "lucide-react";
import type { Proposal } from "@/types/database";

interface ActionButtonsProps {
  token: string;
  status: Proposal["status"];
}

export function ActionButtons({ token, status }: ActionButtonsProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [confirmAction, setConfirmAction] = useState<
    "accepted" | "declined" | null
  >(null);
  const [loading, setLoading] = useState(false);

  const isFinalized = currentStatus === "accepted" || currentStatus === "declined";

  async function handleAction(eventType: "accepted" | "declined") {
    setLoading(true);
    try {
      const res = await fetch(`/api/public/proposals/${token}/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: eventType }),
      });
      if (res.ok) {
        setCurrentStatus(eventType);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
      setConfirmAction(null);
    }
  }

  function handleRequestChanges() {
    const commentSection = document.getElementById("comments");
    if (commentSection) {
      commentSection.scrollIntoView({ behavior: "smooth" });
      const textarea = commentSection.querySelector("textarea");
      if (textarea) {
        setTimeout(() => textarea.focus(), 500);
      }
    }
  }

  if (isFinalized) {
    return (
      <div className="mx-auto max-w-3xl">
        <div
          className={`rounded-xl p-6 text-center ${
            currentStatus === "accepted"
              ? "bg-green-50 dark:bg-green-950"
              : "bg-red-50 dark:bg-red-950"
          }`}
        >
          <div className="mb-2 flex items-center justify-center gap-2">
            {currentStatus === "accepted" ? (
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <span
              className={`text-lg font-semibold ${
                currentStatus === "accepted"
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              {currentStatus === "accepted"
                ? "This proposal has been accepted"
                : "This proposal has been declined"}
            </span>
          </div>
          <p
            className={`text-sm ${
              currentStatus === "accepted"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            You can still leave comments below.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
          <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Ready to move forward? Let us know your decision.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={() => setConfirmAction("accepted")}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <Check className="mr-2 h-4 w-4" />
              Accept Proposal
            </Button>
            <Button
              variant="outline"
              onClick={handleRequestChanges}
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-500 dark:text-yellow-400 dark:hover:bg-yellow-950"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Request Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmAction("declined")}
              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
            >
              <X className="mr-2 h-4 w-4" />
              Decline
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "accepted"
                ? "Accept Proposal"
                : "Decline Proposal"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "accepted"
                ? "Are you sure you want to accept this proposal? The sender will be notified."
                : "Are you sure you want to decline this proposal? The sender will be notified."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => confirmAction && handleAction(confirmAction)}
              disabled={loading}
              className={
                confirmAction === "accepted"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {confirmAction === "accepted" ? "Yes, Accept" : "Yes, Decline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
