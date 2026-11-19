// Reading FormData in server actions: trimmed, length-capped, never null where text is required.

/** A trimmed text field, cut to `max` characters ("" when missing). */
export const str = (f: FormData, key: string, max = 200) => String(f.get(key) ?? "").trim().slice(0, max);

/** Like `str`, but null when empty (for optional columns). */
export const opt = (f: FormData, key: string, max = 200) => str(f, key, max) || null;

/** A plausible email address. */
export const isEmail = (email: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
