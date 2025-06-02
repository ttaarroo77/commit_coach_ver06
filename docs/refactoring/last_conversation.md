# Chat Input Component Specification

> **Purpose**
> Provide a universally familiar “chat‑style” text input area that avoids premature submissions during Japanese IME composition and supports multiline messages via *Shift + Enter*.

---

## 1. Functional Requirements

1. **Input Field**

   * Use a `<textarea>` (or `contentEditable`) that auto‑grows with content.
   * Cap height at \~40–50 % of the viewport to prevent the input from covering messages.
2. **Send Trigger**

   * **Enter** → send message.
   * **Shift + Enter** (or **Alt + Enter**) → newline.
3. **IME Composition Guard**

   * Track `isComposing` flag (`compositionstart` / `compositionend`).
   * Only treat **Enter** as “send” when *not* composing.
4. **Empty‑Message Guard**

   * Trim whitespace before send; ignore/disable when empty.
5. **Send Button**

   * Clickable alternative to **Enter**.
   * `aria-label="送信"`; use same disable logic as #4.
6. **Placeholder & Inline Help**

   * e.g. `placeholder="メッセージを入力（Shift+Enter で改行）"`.
7. **Post‑Send Behaviour**

   * Clear input and keep focus after successful send.
   * Auto‑scroll chat view so the newest message appears at the bottom edge.

---

## 2. React (TypeScript) Reference Implementation

```tsx
import { useState } from "react";

export default function ChatInput({ onSend }: { onSend: (msg: string) => void }) {
  const [value, setValue] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  const send = () => {
    const msg = value.trim();
    if (!msg) return;
    onSend(msg);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !isComposing) {
      if (e.shiftKey || e.altKey) return; // newline
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <textarea
        className="flex-1 resize-none rounded-xl p-3 shadow"
        rows={1}
        value={value}
        placeholder="メッセージを入力（Shift+Enter で改行）"
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
      />
      <button
        onClick={send}
        disabled={!value.trim()}
        className="rounded-xl px-4 py-2 shadow disabled:opacity-40"
        aria-label="送信"
      >送信</button>
    </div>
  );
}
```

---

## 3. Optional Enhancements (Icebox)

| Category       | Examples                                                      |
| -------------- | ------------------------------------------------------------- |
| **Input Aids** | Emoji picker, file upload button, Markdown preview            |
| **Usability**  | “*User is typing…*” indicator, edit/delete sent messages      |
| **Settings**   | Toggle for “Ctrl + Enter to send”, confirm‑before‑send dialog |

---

## 4. QA Checklist

* [ ] IME中に **Enter** を連打しても送信されない。
* [ ] **Shift + Enter** で確実に改行できる。
* [ ] 空送信ができない。
* [ ] 送信後にフォーカスが残り、チャットが自動スクロール。
* [ ] モバイルでボタンタップ送信が機能する。

---

## 5. Changelog

| Date       | Author        | Note    |
| ---------- | ------------- | ------- |
| 2025‑06‑02 | initial draft | created |
