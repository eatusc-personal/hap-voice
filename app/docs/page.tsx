export const dynamic = "force-dynamic"

// A visual, plain-language explainer of how hap-voice handles a call. Meant to
// be walked through with non-technical people, so it is intentionally light on
// jargon. The one idea it has to land: every call starts and ends the same way,
// and in the middle one of two pipelines does the talking.

type Tag = "local" | "paid" | "free"

const TAG_STYLE: Record<Tag, string> = {
  local: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  paid: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  free: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
}

function Chip({ children, tag }: { children: React.ReactNode; tag?: Tag }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${
        tag ? TAG_STYLE[tag] : "border-neutral-700 bg-neutral-800 text-neutral-300"
      }`}
    >
      {children}
    </span>
  )
}

type Step = { icon: string; title: string; body: string; chips?: { label: string; tag?: Tag }[] }

// Everything before the two pipelines diverge.
const SHARED_IN: Step[] = [
  {
    icon: "📞",
    title: "A call comes in",
    body: "Someone dials your business number. Your phone provider picks up and hands the call to your system.",
    chips: [{ label: "Twilio · phone number", tag: "paid" }],
  },
  {
    icon: "🔒",
    title: "Routed to your Mac",
    body: "The call is passed through a secure tunnel to the app running on your own Mac Studio. No server to rent.",
    chips: [{ label: "Cloudflare Tunnel", tag: "free" }, { label: "runs on your Mac", tag: "local" }],
  },
  {
    icon: "🚫",
    title: "Blocked numbers are hung up on",
    body: "Anyone on your blocked list is rejected here, before either pipeline sees the call.",
  },
]

// Everything after they converge again.
const SHARED_OUT: Step[] = [
  {
    icon: "📇",
    title: "It lands in your dashboard",
    body: "Whichever pipeline answered, the call, full transcript, and extracted details are saved and searchable, alongside texts, spam flags, and blocked numbers. Retell calls also get a recording player and a \"via Retell\" tag.",
    chips: [{ label: "PostgreSQL · your database", tag: "local" }],
  },
]

const FLOWS: {
  key: string
  name: string
  badge: string
  accent: string
  tagline: string
  steps: Step[]
}[] = [
  {
    key: "local",
    name: "Self-hosted pipeline",
    badge: "Default",
    accent: "sky",
    tagline: "Your Mac does the listening, thinking and speaking.",
    steps: [
      {
        icon: "👂",
        title: "It listens",
        body: "Twilio streams the caller's audio to the Mac. The app detects when they stop talking and turns their words into text on-device, nothing sent to the cloud for this part.",
        chips: [{ label: "Whisper · speech-to-text", tag: "local" }],
      },
      {
        icon: "🧠",
        title: "It decides what to say",
        body: "The assistant writes a reply using only the facts in your Knowledge Base. If it does not know, it takes a message instead of guessing.",
        chips: [{ label: "OpenRouter · your chosen model", tag: "paid" }, { label: "your Knowledge Base" }],
      },
      {
        icon: "🗣️",
        title: "It speaks back",
        body: "The reply is spoken in a natural voice and sent down the line. The caller can interrupt mid-sentence and the assistant stops and listens, just like a person.",
        chips: [{ label: "ElevenLabs", tag: "paid" }, { label: "or Kokoro / Piper", tag: "free" }],
      },
      {
        icon: "📝",
        title: "It wraps up",
        body: "After the hang-up, a second pass reads the transcript and pulls out who called, their company, why, a callback number, an email, plus a spam score.",
        chips: [{ label: "OpenRouter extraction", tag: "paid" }],
      },
    ],
  },
  {
    key: "retell",
    name: "Retell AI",
    badge: "Hosted",
    accent: "violet",
    tagline: "A hosted agent runs the conversation, your app keeps the records.",
    steps: [
      {
        icon: "🤝",
        title: "The call is handed to Retell",
        body: "The app registers the call with Retell and bridges the audio over to it. If that handoff fails for any reason, the call drops back to the self-hosted pipeline mid-ring, so the caller never hears dead air.",
        chips: [{ label: "SIP bridge", tag: "paid" }, { label: "auto-fallback", tag: "free" }],
      },
      {
        icon: "🤖",
        title: "The agent talks to the caller",
        body: "Retell handles listening, thinking and speaking in its own cloud, using the same greeting, receptionist prompt and Knowledge Base as your local setup.",
        chips: [{ label: "Retell agent", tag: "paid" }, { label: "your Knowledge Base" }],
      },
      {
        icon: "📨",
        title: "Retell reports back",
        body: "As the call starts, ends and gets analysed, Retell notifies your app with the transcript, duration, recording link and the same extracted fields the local pipeline produces.",
        chips: [{ label: "signed webhooks", tag: "free" }],
      },
      {
        icon: "🎛️",
        title: "Set up once, from Settings",
        body: "Add a Retell API key, click Create Retell agent, and pick Retell AI as the provider. Change the greeting or Knowledge Base later and click Re-sync.",
        chips: [{ label: "Settings · Call routing" }],
      },
    ],
  },
]

const COMPARE: { label: string; local: string; retell: string }[] = [
  { label: "Runs the conversation", local: "Your Mac Studio", retell: "Retell's cloud" },
  { label: "Caller audio leaves your network", local: "No", retell: "Yes" },
  { label: "Voice & model choice", local: "Here, in Settings", retell: "In the Retell dashboard" },
  { label: "Call recordings", local: "Not kept", retell: "Kept by Retell, linked here" },
  { label: "Running cost", local: "Twilio + a few cents of AI", retell: "The above + Retell per minute" },
]

const SERVICES: { icon: string; name: string; role: string; tag: Tag; tagLabel: string; used: string }[] = [
  { icon: "☎️", name: "Twilio", role: "The phone line. Receives calls and texts on your number.", tag: "paid", tagLabel: "Paid per use", used: "both" },
  { icon: "🔒", name: "Cloudflare Tunnel", role: "A secure public doorway to the app on your Mac.", tag: "free", tagLabel: "Free", used: "both" },
  { icon: "🖥️", name: "Mac Studio", role: "The app, the database and the dashboard run here, always on.", tag: "local", tagLabel: "Your hardware", used: "both" },
  { icon: "🗄️", name: "PostgreSQL", role: "The memory. Stores every call, transcript, and text.", tag: "local", tagLabel: "Local · free", used: "both" },
  { icon: "📚", name: "Knowledge Base", role: "The only facts the assistant is allowed to say. You edit it.", tag: "free", tagLabel: "You control it", used: "both" },
  { icon: "👂", name: "Whisper", role: "Turns the caller's speech into text, on-device.", tag: "local", tagLabel: "Local · free", used: "self-hosted" },
  { icon: "🧠", name: "OpenRouter", role: "The brain. Writes replies and extracts call details.", tag: "paid", tagLabel: "Paid · tiny cost", used: "self-hosted" },
  { icon: "🗣️", name: "ElevenLabs / Kokoro", role: "The voice. ElevenLabs is premium, Kokoro is free and local.", tag: "paid", tagLabel: "Premium / free", used: "self-hosted" },
  { icon: "🤖", name: "Retell AI", role: "A hosted agent that runs the whole conversation for you.", tag: "paid", tagLabel: "Paid per minute", used: "Retell" },
]

const HIGHLIGHTS = [
  { icon: "🎯", title: "Never makes things up", body: "Both pipelines answer only from your Knowledge Base and take a message for anything else." },
  { icon: "🛡️", title: "Screens spam", body: "Every call is scored, and robocalls and sales pitches are flagged automatically." },
  { icon: "🔁", title: "Switch without downtime", body: "Flip providers in Settings and it applies on the next call. No redeploy, no Twilio changes." },
  { icon: "🔐", title: "Private by default", body: "Your transcripts, database and dashboard live on your own Mac either way." },
]

function StepCard({ step, n }: { step: Step; n?: number }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xl">{step.icon}</span>
        <h3 className="font-medium text-sm">
          {n != null && <span className="text-neutral-500 mr-1.5">{n}.</span>}
          {step.title}
        </h3>
      </div>
      <p className="text-sm text-neutral-300">{step.body}</p>
      {step.chips && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {step.chips.map((c) => (
            <Chip key={c.label} tag={c.tag}>
              {c.label}
            </Chip>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DocsPage() {
  return (
    <div className="space-y-10">
      {/* Intro */}
      <div>
        <h1 className="text-2xl font-semibold">How it works</h1>
        <p className="text-neutral-400 mt-2 max-w-2xl">
          Your AI receptionist answers calls and texts, has a real conversation, takes a message, and
          flags spam. Two pipelines can do the talking: the <span className="text-sky-300">self-hosted</span>{" "}
          one on your Mac, or a hosted <span className="text-violet-300">Retell AI</span> agent. Everything
          before and after is identical, and both log to this dashboard.
        </p>
      </div>

      {/* At a glance: shared → fork → shared */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
        <div className="text-neutral-500 text-[11px] uppercase tracking-wide mb-4">At a glance</div>

        <div className="flex flex-wrap items-center gap-2">
          {["📞 Call comes in", "🔒 Into your Mac", "🚫 Blocked check"].map((l, i, a) => (
            <div key={l} className="flex items-center gap-2">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300">
                {l}
              </div>
              {i < a.length - 1 && <span className="text-neutral-600">→</span>}
            </div>
          ))}
        </div>

        <div className="text-neutral-600 text-lg leading-none my-2 pl-6">↓</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/[0.07] px-4 py-3">
            <div className="text-sm font-medium text-sky-300">Self-hosted pipeline</div>
            <div className="text-xs text-neutral-400 mt-1">
              Whisper hears it · your model replies · ElevenLabs or Kokoro speaks
            </div>
          </div>
          <div className="rounded-xl border border-violet-500/30 bg-violet-500/[0.07] px-4 py-3">
            <div className="text-sm font-medium text-violet-300">Retell AI agent</div>
            <div className="text-xs text-neutral-400 mt-1">
              Call bridged to Retell · agent handles it · webhooks report back
            </div>
          </div>
        </div>

        <div className="text-neutral-600 text-lg leading-none my-2 pl-6">↓</div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300 inline-block">
          📇 Transcript, details and spam score in your dashboard
        </div>

        <p className="text-xs text-neutral-500 mt-4">
          Which one answers is a single dropdown in <span className="text-neutral-400">Settings → Call routing</span>,
          applied on the very next call.
        </p>
      </div>

      {/* Shared: before */}
      <div>
        <h2 className="text-lg font-semibold mb-1">Every call starts the same way</h2>
        <p className="text-sm text-neutral-400 mb-4">Steps 1 to 3 are identical for both pipelines.</p>
        <div className="space-y-3">
          {SHARED_IN.map((s, i) => (
            <StepCard key={s.title} step={s} n={i + 1} />
          ))}
        </div>
      </div>

      {/* The two flows, side by side */}
      <div>
        <h2 className="text-lg font-semibold mb-1">Then one of two pipelines answers</h2>
        <p className="text-sm text-neutral-400 mb-4">
          Same greeting, same Knowledge Base, same rules. Different machinery.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {FLOWS.map((f) => (
            <div
              key={f.key}
              className={`rounded-2xl border p-4 ${
                f.accent === "sky"
                  ? "border-sky-500/30 bg-sky-500/[0.04]"
                  : "border-violet-500/30 bg-violet-500/[0.04]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={`font-semibold ${f.accent === "sky" ? "text-sky-300" : "text-violet-300"}`}
                >
                  {f.name}
                </h3>
                <Chip>{f.badge}</Chip>
              </div>
              <p className="text-sm text-neutral-400 mb-4">{f.tagline}</p>
              <div className="space-y-3">
                {f.steps.map((s) => (
                  <StepCard key={s.title} step={s} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Which should you use?</h2>
        <div className="overflow-x-auto rounded-2xl border border-neutral-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/60">
                <th className="text-left font-medium text-neutral-500 px-4 py-2.5 w-1/3"> </th>
                <th className="text-left font-medium text-sky-300 px-4 py-2.5">Self-hosted</th>
                <th className="text-left font-medium text-violet-300 px-4 py-2.5">Retell AI</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((r) => (
                <tr key={r.label} className="border-b border-neutral-800 last:border-0">
                  <td className="px-4 py-2.5 text-neutral-400">{r.label}</td>
                  <td className="px-4 py-2.5 text-neutral-300">{r.local}</td>
                  <td className="px-4 py-2.5 text-neutral-300">{r.retell}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-neutral-400 mt-3 max-w-2xl">
          Self-hosted keeps everything on your hardware and costs the least. Retell trades that for a
          more polished voice, recordings, and nothing to babysit on your Mac. If Retell is picked but
          not fully set up, calls quietly use the self-hosted pipeline instead.
        </p>
      </div>

      {/* Shared: after */}
      <div>
        <h2 className="text-lg font-semibold mb-4">And every call ends the same way</h2>
        <div className="space-y-3">
          {SHARED_OUT.map((s) => (
            <StepCard key={s.title} step={s} />
          ))}
        </div>
      </div>

      {/* Texts */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xl">💌</span>
          <h2 className="text-lg font-semibold">Texts work the same either way</h2>
        </div>
        <p className="text-sm text-neutral-300 max-w-2xl">
          Incoming SMS and picture messages never touch the voice pipelines. They are saved to the
          dashboard and scanned for one-time verification codes, so you never lose a login code.
        </p>
      </div>

      {/* The pieces */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">The pieces</h2>
          <div className="flex gap-2">
            <Chip tag="local">on your Mac</Chip>
            <Chip tag="free">free</Chip>
            <Chip tag="paid">paid</Chip>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SERVICES.map((sv) => (
            <div key={sv.name} className="flex gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-xl">
                {sv.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{sv.name}</span>
                  <Chip tag={sv.tag}>{sv.tagLabel}</Chip>
                </div>
                <p className="text-sm text-neutral-400 mt-0.5">{sv.role}</p>
                <p className="text-[11px] text-neutral-500 mt-1">Used by: {sv.used}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why it's good */}
      <div>
        <h2 className="text-lg font-semibold mb-4">What makes it good</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{h.icon}</span>
                <h3 className="font-medium text-sm">{h.title}</h3>
              </div>
              <p className="text-sm text-neutral-400">{h.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
