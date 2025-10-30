"use client";
import * as Toast from "@radix-ui/react-toast";
import { useState, useEffect } from "react";

export default function ToastProvider() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.showToast = (msg: string) => {
        setMessage(msg);
        setOpen(true);
        setTimeout(() => setOpen(false), 3000);
      };
    }
  }, []);

  return (
    <Toast.Provider swipeDirection="right">
      <Toast.Root
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 rounded-xl shadow-xl backdrop-blur-md border border-white/10"
        open={open}
        onOpenChange={setOpen}
      >
        <Toast.Title className="font-semibold">{message}</Toast.Title>
      </Toast.Root>
      <Toast.Viewport className="fixed bottom-6 right-6 z-50" />
    </Toast.Provider>
  );
}
