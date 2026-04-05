import { useState, useEffect, useRef } from "react";

const SAMPLE_RESUME = `Results-driven Software Engineer with 5+ years of experience building scalable web applications. Proficient in React, Node.js, Python, and cloud infrastructure (AWS, GCP). Led teams of 4–6 engineers delivering products to 500k+ users. Strong background in system design, CI/CD pipelines, and agile workflows. M.S. Computer Science, Stanford University.`;

const SAMPLE_JD = `We're looking for a Senior Software Engineer to join our platform team. You'll architect and ship features used by millions, mentor junior engineers, and collaborate cross-functionally. Requirements: 4+ years of software engineering experience, proficiency in Python or Node.js, experience with cloud platforms (AWS preferred), strong communication skills. Nice to have: React, distributed systems experience.`;

const VERDICTS = {
  good: {
    label: "Good Fit",
    tagline: "Strong match detected",
    color: "#00E5A0",
    bg: "rgba(0,229,160,0.08)",
    border: "rgba(0,229,160,0.3)",
    icon: "✦",
    bars: [92, 88, 95, 79],
  },
  potential: {
    label: "Potential Fit",
    tagline: "Partial alignment found",
    color: "#FFB830",
    bg: "rgba(255,184,48,0.08)",
    border: "rgba(255,184,48,0.3)",
    icon: "◈",
    bars: [61, 74, 55, 68],
  },
  no: {
    label: "No Fit",
    tagline: "Significant gaps detected",
    color: "#FF4D6A",
    bg: "rgba(255,77,106,0.08)",
    border: "rgba(255,77,106,0.3)",
    icon: "✕",
    bars: [22, 31, 18, 40],
  },
};

const BAR_LABELS = ["Skills Match", "Experience Level", "Domain Alignment", "Keywords"];

function AnimatedBar({ pct, color, delay }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 6, overflow: "hidden" }}>
      <div style={{
        width: `${width}%`, height: "100%", borderRadius: 4,
        background: color, transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: `0 0 12px ${color}88`
      }} />
    </div>
  );
}

function Spinner({ color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "32px 0" }}>
      <div style={{
        width: 48, height: 48, border: `2px solid rgba(255,255,255,0.1)`,
        borderTop: `2px solid ${color}`, borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      }} />
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, letterSpacing: "0.12em", fontFamily: "'Space Mono', monospace" }}>
        ANALYZING MATCH...
      </p>
    </div>
  );
}

export default function App() {
  const [resume, setResume] = useState("");
  const [jd, setJd] = useState("");
  const [stage, setStage] = useState("idle"); // idle | loading | result
  const [verdict, setVerdict] = useState(null);
  const [activeTab, setActiveTab] = useState("resume");
  const resultRef = useRef(null);

  const canAnalyze = resume.trim().length > 30 && jd.trim().length > 30;

  const handleAnalyze = () => {
    if (!canAnalyze) return;
    setStage("loading");
    setTimeout(() => {
      // mock: randomly pick a verdict for demo
      const keys = ["good", "potential", "no"];
      setVerdict(keys[Math.floor(Math.random() * keys.length)]);
      setStage("result");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }, 2200);
  };

  const handleReset = () => {
    setStage("idle");
    setVerdict(null);
    setResume("");
    setJd("");
    setActiveTab("resume");
  };

  const v = verdict ? VERDICTS[verdict] : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      fontFamily: "'DM Sans', sans-serif",
      color: "#fff",
      overflowX: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea { resize: none; outline: none; border: none; }
        textarea::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        .glow-btn:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .glow-btn:active { transform: translateY(0); }
        .tab-btn { transition: all 0.2s; cursor: pointer; border: none; background: none; }
        .tab-btn:hover { opacity: 1 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px"
      }} />

      {/* Ambient glow top */}
      <div style={{
        position: "fixed", top: -200, left: "50%", transform: "translateX(-50%)",
        width: 800, height: 400, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 880, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Header */}
        <header style={{ paddingTop: 64, paddingBottom: 56, textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 100, padding: "6px 16px", marginBottom: 32,
            fontSize: 11, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)",
            fontFamily: "'Space Mono', monospace"
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00E5A0", animation: "pulse 2s infinite" }} />
            MODEL READY · DATATHON 2026
          </div>

          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(52px, 10vw, 96px)",
            lineHeight: 0.95,
            letterSpacing: "0.02em",
            marginBottom: 20,
            background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.5) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            Resume<br />
            <span style={{
              background: "linear-gradient(135deg, #6366F1, #A78BFA)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>Fit Analyzer</span>
          </h1>

          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, lineHeight: 1.6, maxWidth: 440, margin: "0 auto", fontWeight: 300 }}>
            Paste a resume and job description. Our trained model scores the match across skills, experience, and domain alignment.
          </p>
        </header>

        {/* Input card */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, overflow: "hidden",
          animation: "fadeUp 0.5s ease both",
          boxShadow: "0 24px 80px rgba(0,0,0,0.4)"
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { key: "resume", label: "Resume", num: "01" },
              { key: "jd", label: "Job Description", num: "02" }
            ].map(tab => (
              <button key={tab.key} className="tab-btn"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1, padding: "18px 24px",
                  display: "flex", alignItems: "center", gap: 12,
                  opacity: activeTab === tab.key ? 1 : 0.4,
                  borderBottom: activeTab === tab.key ? "2px solid #6366F1" : "2px solid transparent",
                  transition: "all 0.2s"
                }}
              >
                <span style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 10,
                  color: activeTab === tab.key ? "#6366F1" : "rgba(255,255,255,0.3)",
                  letterSpacing: "0.1em"
                }}>{tab.num}</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{tab.label}</span>
                {((tab.key === "resume" && resume.length > 30) || (tab.key === "jd" && jd.length > 30)) && (
                  <span style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: "50%", background: "#00E5A0" }} />
                )}
              </button>
            ))}
          </div>

          {/* Textarea area */}
          <div style={{ position: "relative" }}>
            {activeTab === "resume" ? (
              <textarea
                value={resume}
                onChange={e => setResume(e.target.value)}
                placeholder="Paste your resume text here…"
                rows={10}
                style={{
                  width: "100%", padding: "28px 32px",
                  background: "transparent", color: "#fff",
                  fontSize: 14, lineHeight: 1.8, fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 300
                }}
              />
            ) : (
              <textarea
                value={jd}
                onChange={e => setJd(e.target.value)}
                placeholder="Paste the job description here…"
                rows={10}
                style={{
                  width: "100%", padding: "28px 32px",
                  background: "transparent", color: "#fff",
                  fontSize: 14, lineHeight: 1.8, fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 300
                }}
              />
            )}

            {/* Sample text button */}
            <button
              onClick={() => {
                if (activeTab === "resume") setResume(SAMPLE_RESUME);
                else setJd(SAMPLE_JD);
              }}
              style={{
                position: "absolute", bottom: 16, right: 20,
                background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
                color: "#A78BFA", borderRadius: 8, padding: "6px 14px",
                fontSize: 12, cursor: "pointer", fontFamily: "'Space Mono', monospace",
                letterSpacing: "0.06em", transition: "all 0.2s"
              }}
            >
              USE SAMPLE
            </button>
          </div>

          {/* Footer row */}
          <div style={{
            padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.05)"
          }}>
            <div style={{ display: "flex", gap: 24 }}>
              {[
                { label: "Resume", filled: resume.length > 30 },
                { label: "Job Description", filled: jd.length > 30 }
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: 4, border: `1px solid ${item.filled ? "#00E5A0" : "rgba(255,255,255,0.15)"}`,
                    background: item.filled ? "rgba(0,229,160,0.15)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {item.filled && <span style={{ color: "#00E5A0", fontSize: 9 }}>✓</span>}
                  </div>
                  {item.label}
                </div>
              ))}
            </div>

            <button
              className="glow-btn"
              onClick={handleAnalyze}
              disabled={!canAnalyze || stage === "loading"}
              style={{
                padding: "12px 32px", borderRadius: 10,
                background: canAnalyze ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : "rgba(255,255,255,0.06)",
                border: "none", color: canAnalyze ? "#fff" : "rgba(255,255,255,0.2)",
                fontSize: 14, fontWeight: 600, cursor: canAnalyze ? "pointer" : "not-allowed",
                fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em",
                transition: "all 0.2s", boxShadow: canAnalyze ? "0 8px 32px rgba(99,102,241,0.35)" : "none"
              }}
            >
              {stage === "loading" ? "Analyzing…" : "Analyze Fit →"}
            </button>
          </div>
        </div>

        {/* Loading state */}
        {stage === "loading" && (
          <div style={{ marginTop: 40, animation: "fadeUp 0.4s ease" }}>
            <Spinner color="#6366F1" />
          </div>
        )}

        {/* Result card */}
        {stage === "result" && v && (
          <div ref={resultRef} style={{
            marginTop: 40,
            animation: "fadeUp 0.6s ease both",
          }}>
            {/* Verdict banner */}
            <div style={{
              background: v.bg,
              border: `1px solid ${v.border}`,
              borderRadius: 20, padding: "36px 40px",
              position: "relative", overflow: "hidden",
              boxShadow: `0 24px 80px ${v.color}18`
            }}>
              {/* Scanline effect */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: `linear-gradient(transparent 0%, ${v.color}06 50%, transparent 100%)`,
                height: "25%", animation: "scanline 3s linear infinite", opacity: 0.6
              }} />

              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
                <div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 11,
                    color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", marginBottom: 12
                  }}>PREDICTION RESULT</div>

                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                    <span style={{ fontSize: 32, color: v.color }}>{v.icon}</span>
                    <h2 style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 52, letterSpacing: "0.04em", color: v.color,
                      lineHeight: 1, textShadow: `0 0 40px ${v.color}66`
                    }}>{v.label}</h2>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>{v.tagline}</p>
                </div>

                {/* Score circle */}
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 88, height: 88, borderRadius: "50%",
                    border: `2px solid ${v.border}`,
                    background: v.bg,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 0 32px ${v.color}33`
                  }}>
                    <span style={{ fontSize: 24, fontWeight: 700, color: v.color, fontFamily: "'Space Mono', monospace" }}>
                      {v.bars[0]}%
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 8, letterSpacing: "0.1em", fontFamily: "'Space Mono', monospace" }}>
                    OVERALL
                  </div>
                </div>
              </div>

              {/* Metric bars */}
              <div style={{ marginTop: 36, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 40px" }}>
                {BAR_LABELS.map((label, i) => (
                  <div key={label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{label}</span>
                      <span style={{ fontSize: 12, fontFamily: "'Space Mono', monospace", color: v.color }}>{v.bars[i]}%</span>
                    </div>
                    <AnimatedBar pct={v.bars[i]} color={v.color} delay={i * 120 + 200} />
                  </div>
                ))}
              </div>
            </div>

            {/* Note */}
            <div style={{
              marginTop: 16, padding: "16px 24px",
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, display: "flex", alignItems: "flex-start", gap: 12
            }}>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16, marginTop: 1 }}>ⓘ</span>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
                This is a <strong style={{ color: "rgba(255,255,255,0.5)" }}>UI preview</strong> — scores above are simulated. Once the trained model is connected via API, real predictions will replace this demo output.
              </p>
            </div>

            {/* Try another */}
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <button
                className="glow-btn"
                onClick={handleReset}
                style={{
                  padding: "12px 36px", borderRadius: 10,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)", fontSize: 14, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s"
                }}
              >
                ← Try Another
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer style={{
          marginTop: 80, textAlign: "center",
          fontFamily: "'Space Mono', monospace", fontSize: 11,
          color: "rgba(255,255,255,0.15)", letterSpacing: "0.1em"
        }}>
          DATATHON 2026 · RESUME-JOB FIT MODEL · BUILT WITH PYTORCH
        </footer>
      </div>
    </div>
  );
}
