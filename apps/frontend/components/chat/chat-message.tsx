import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ChatMessageProps {
  message: {
    role: "user" | "assistant"
    content: string
  }
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 p-4",
        message.role === "assistant" ? "bg-muted/50" : ""
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback>
          {message.role === "user" ? "U" : "AI"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "")
                const code = String(children).replace(/\n$/, "")

                if (!inline && match) {
                  return (
                    <div className="relative group">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCopy(code)}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {code}
                      </SyntaxHighlighter>
                    </div>
                  )
                }

                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
