import { useState } from "react";

type FormState = "idle" | "sending" | "success" | "error";

interface FormFields {
  name: string;
  email: string;
  message: string;
}

/**
 * Contact API endpoint (Lambda Function URL from the Amplify Gen 2 backend).
 * Injected at build time via PUBLIC_CONTACT_API_URL — see amplify.yml,
 * which extracts it from amplify_outputs.json after backend deploy.
 */
const API_URL: string | undefined = import.meta.env.PUBLIC_CONTACT_API_URL;

const FALLBACK_EMAIL = "christopher@246labs.cloud";

export default function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fields, setFields] = useState<FormFields>({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "sending") return;

    if (!API_URL) {
      // Backend not deployed yet — fall back to a pre-filled mailto.
      const subject = encodeURIComponent(`Portfolio contact from ${fields.name}`);
      const body = encodeURIComponent(`${fields.message}\n\n— ${fields.name} (${fields.email})`);
      window.location.href = `mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${body}`;
      return;
    }

    setState("sending");
    setErrorMessage("");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }

      setState("success");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong"
      );
      setState("error");
    }
  };

  const handleReset = () => {
    setFields({ name: "", email: "", message: "" });
    setState("idle");
    setErrorMessage("");
  };

  if (state === "success") {
    return (
      <div className="cf-notice" role="status" aria-live="polite">
        <div className="cf-notice-icon" aria-hidden="true">✓</div>
        <p className="cf-notice-text">
          Thanks for reaching out — your message has been sent. I'll get back
          to you soon.
        </p>
        <button type="button" className="cf-reset" onClick={handleReset}>
          Send another message
        </button>
        <style>{noticeStyles}</style>
      </div>
    );
  }

  return (
    <form
      className="cf-form"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Contact form"
    >
      <div className="cf-field">
        <label htmlFor="cf-name" className="cf-label">
          Your Name
        </label>
        <input
          id="cf-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          value={fields.name}
          onChange={handleChange}
          className="cf-input"
          placeholder="Your Name"
          aria-required="true"
          disabled={state === "sending"}
        />
      </div>

      <div className="cf-field">
        <label htmlFor="cf-email" className="cf-label">
          Your Email
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={fields.email}
          onChange={handleChange}
          className="cf-input"
          placeholder="you@example.com"
          aria-required="true"
          disabled={state === "sending"}
        />
      </div>

      <div className="cf-field">
        <label htmlFor="cf-message" className="cf-label">
          Your Message
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={5}
          value={fields.message}
          onChange={handleChange}
          className="cf-input cf-textarea"
          placeholder="Your Message"
          aria-required="true"
          disabled={state === "sending"}
        />
      </div>

      {state === "error" && (
        <p className="cf-error" role="alert">
          Couldn't send your message ({errorMessage}). Please try again, or
          email me directly at{" "}
          <a href={`mailto:${FALLBACK_EMAIL}`}>{FALLBACK_EMAIL}</a>.
        </p>
      )}

      <button type="submit" className="cf-submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send Message"}
      </button>

      <style>{`
        .cf-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .cf-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cf-label {
          font-family: var(--font-mono, monospace);
          font-size: 12px;
          color: #76838f;
        }

        .cf-label::before {
          content: "$ ";
          color: #3fb950;
        }

        .cf-input {
          width: 100%;
          padding: 11px 14px;
          border: 1px solid #2a3542;
          border-radius: 8px;
          font-family: var(--font-mono, monospace);
          font-size: 14px;
          color: #f4f7fa;
          background: #0a0d11;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          appearance: none;
          -webkit-appearance: none;
        }

        .cf-input::placeholder {
          color: #76838f;
        }

        .cf-input:focus {
          border-color: #ff9900;
          box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.12);
        }

        .cf-input:focus-visible {
          outline: 2px solid #ff9900;
          outline-offset: 2px;
        }

        .cf-input:disabled {
          opacity: 0.6;
        }

        .cf-textarea {
          resize: vertical;
          min-height: 120px;
          line-height: 1.6;
        }

        .cf-error {
          font-size: 0.875rem;
          color: #ff5f56;
          line-height: 1.5;
          margin: 0;
        }

        .cf-error a {
          color: #ff9900;
          text-decoration: underline;
        }

        .cf-submit {
          align-self: flex-start;
          font-family: var(--font-mono, monospace);
          font-size: 14px;
          font-weight: 700;
          color: #0a0d11;
          background: #ff9900;
          padding: 13px 22px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .cf-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 26px rgba(255, 153, 0, 0.32);
        }

        .cf-submit:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        .cf-submit:focus-visible {
          outline: 2px solid #ff9900;
          outline-offset: 3px;
        }
      `}</style>
    </form>
  );
}

const noticeStyles = `
  .cf-notice {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem 0;
  }

  .cf-notice-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    border: 1px solid #3fb950;
    color: #3fb950;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    font-weight: 700;
    font-family: var(--font-mono, monospace);
  }

  .cf-notice-text {
    font-size: 0.9375rem;
    font-weight: 400;
    color: #9aa6b2;
    line-height: 1.6;
  }

  .cf-reset {
    font-family: var(--font-mono, monospace);
    font-size: 0.8125rem;
    font-weight: 600;
    color: #ff9900;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: opacity 0.2s;
  }

  .cf-reset:hover {
    opacity: 0.7;
  }
`;
