"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { useAuthStore } from "@/store/auth.store";
import api from "@/lib/axios";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { Send, ChevronLeft } from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; name: string; avatar?: string };
  property?: { id: string; title: string };
}

interface Conversation {
  otherId: string;
  otherName: string;
  lastMessage: string;
  propertyTitle?: string;
}

export default function MessagesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }

    const socket = connectSocket();

    socket.on("message:receive", (msg: Message) => {
      if (msg.senderId === selected) {
        setMessages((prev) => [...prev, msg]);
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    });

    api.get("/messages/conversations").then((r) => {
      const convos: Conversation[] = r.data.data.map((m: any) => {
        const otherId = m.senderId === user.id ? m.receiverId : m.senderId;
        const otherName = m.senderId === user.id ? m.receiver.name : m.sender.name;
        return { otherId, otherName, lastMessage: m.content, propertyTitle: m.property?.title };
      });
      setConversations(convos);
    });

    return () => { disconnectSocket(); };
  }, [user, router, selected]);

  useEffect(() => {
    if (!selected) return;
    api.get(`/messages/${selected}`).then((r) => {
      setMessages(r.data.data);
      setTimeout(() => bottomRef.current?.scrollIntoView(), 100);
    });
    api.patch(`/messages/${selected}/read`).catch(() => {});
  }, [selected]);

  const sendMessage = () => {
    if (!input.trim() || !selected || !user) return;
    const socket = connectSocket();
    socket.emit("message:send", { receiverId: selected, content: input.trim() });
    setMessages((prev) => [...prev, {
      id: Date.now().toString(), senderId: user.id, receiverId: selected,
      content: input.trim(), isRead: false, createdAt: new Date().toISOString(),
      sender: { id: user.id, name: user.name },
    }]);
    setInput("");
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex overflow-hidden" style={{ height: "calc(100vh - 180px)", minHeight: 500 }}>
          {/* Conversations list - hidden on mobile when selected */}
          <div className={`border-r border-gray-100 overflow-y-auto transition-all ${selected ? "hidden sm:block sm:w-48 md:w-64" : "w-full sm:w-48 md:w-64"}`}>
            {conversations.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-10">No conversations yet</p>
            )}
            {conversations.map((c) => (
              <button key={c.otherId} onClick={() => setSelected(c.otherId)}
                className={`w-full text-left px-4 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selected === c.otherId ? "bg-red-50 border-l-2 border-l-red-500" : ""}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center shrink-0">
                    {c.otherName[0]}
                  </div>
                  <span className="font-medium text-sm text-gray-900 truncate">{c.otherName}</span>
                </div>
                {c.propertyTitle && <p className="text-xs text-gray-400 truncate mt-0.5 pl-9">{c.propertyTitle}</p>}
                <p className="text-xs text-gray-500 truncate mt-0.5 pl-9">{c.lastMessage}</p>
              </button>
            ))}
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col transition-all ${selected ? "block" : "hidden sm:flex"}`}>
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Select a conversation
              </div>
            ) : (
              <>
                {/* Mobile back button */}
                <div className="sm:hidden border-b border-gray-100 px-4 py-3 flex items-center">
                  <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm">
                    <ChevronLeft size={16} /> Back
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {messages.map((m) => {
                    const isMe = m.senderId === user.id;
                    return (
                      <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-red-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                          {m.content}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                <div className="border-t border-gray-100 px-4 py-3 flex gap-3 items-center">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-red-400"
                  />
                  <button onClick={sendMessage} className="bg-red-600 text-white rounded-xl p-2.5 hover:bg-red-700 transition-colors">
                    <Send size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
