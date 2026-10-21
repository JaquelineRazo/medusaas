import { Mavi } from "./Jellyfish";

export function Bubble({ from, text }: { from: "bot" | "client"; text: string }) {
  const bot = from === "bot";
  return (
    <div className={`flex gap-3 ${bot ? "" : "justify-end"}`}>
      {bot && <Mavi size={32} className="shrink-0" />}
      <p
        className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm ${
          bot ? "bg-cream" : "bg-soft-gold"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

export function ChatHeader({ action }: { action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-line px-5 py-4">
      <Mavi size={36} />
      <div>
        <p className="font-semibold">Mavi</p>
        <p className="flex items-center gap-1.5 text-xs text-success">
          <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" /> Your ally at every step
        </p>
      </div>
      {action && <div className="ml-auto">{action}</div>}
    </div>
  );
}

export function Card({
  title,
  meta,
  children,
}: {
  title: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-md rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="font-semibold">{title}</p>
        {meta && <p className="text-xs text-muted">{meta}</p>}
      </div>
      {children}
    </div>
  );
}

export function Primary({ type = "button", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      {...props}
      className="rounded-full bg-sunshine px-5 py-2 text-sm font-semibold text-ink hover:brightness-95"
    />
  );
}

export function Secondary(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium hover:bg-cream"
    />
  );
}

export function Composer({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
}) {
  return (
    <form
      className="flex items-center gap-2 border-t border-line p-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSend();
      }}
    >
      <button
        type="button"
        aria-label="Attach a file"
        className="grid h-10 w-10 place-items-center rounded-full border border-line text-lg"
      >
        +
      </button>
      <label htmlFor="msg" className="sr-only">
        Message
      </label>
      <input
        id="msg"
        value={value}
        maxLength={1000}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your message…"
        disabled={disabled}
        className="h-10 min-w-0 flex-1 rounded-full bg-cream px-4 text-sm outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        aria-label="Send"
        className="grid h-10 w-10 place-items-center rounded-full bg-sunshine font-bold text-ink"
      >
        ➤
      </button>
    </form>
  );
}
