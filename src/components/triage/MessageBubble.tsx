import type { Message } from "@/lib/triage/schema";

export function MessageBubble({ message }: Readonly<{ message: Message }>) {
  const isUser = message.role === "user";
  return (
    <div className={`flex animate-slide-up ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] px-4 py-3 text-[15px] leading-[1.55] ${
          isUser
            ? "rounded-xl rounded-br-[4px] bg-primary text-white"
            : "rounded-xl rounded-bl-[4px] border border-border bg-surface text-text-1 shadow-sm"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
