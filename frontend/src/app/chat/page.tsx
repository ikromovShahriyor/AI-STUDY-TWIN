"use client";

import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { ConversationDto, MessageDto, SubjectDto } from "@/lib/types";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Zap,
  HelpCircle
} from "lucide-react";
import { MessageContent } from "@/components/chat/MessageContent";

export default function ChatPage() {
  const { t, language } = useTranslation();
  const { profile } = useAuth();

  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [inputContent, setInputContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Streaming / typing animation state
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [displayedStreamingText, setDisplayedStreamingText] = useState("");

  // Voice AI states
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, displayedStreamingText, isSending]);

  // Suggested multi-turn prompts
  const suggestedPrompts = [
    { label: "Matematikada integral nima?", query: "Matematikada integral nima?" },
    { label: "Oddiyroq tushuntir", query: "Oddiyroq tushuntir." },
    { label: "Endi amaliy misol ber", query: "Endi bitta aniq amaliy misol ber." },
    { label: "Qisqaroq xulosa qil", query: "Qisqaroq xulosa qil." },
    { label: "Dasturlashda OOP nima?", query: "Dasturlashda OOP nima va uning tamoyillari?" },
  ];

  // Load subjects
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const subs = await apiFetch<SubjectDto[]>("/subject");
        setSubjects(subs);
      } catch {
        setSubjects([
          { id: "1", nameUz: "Dasturlash & IT", nameEn: "Programming", nameRu: "IT", code: "CS", description: "", icon: "Code", gradientColor: "", orderIndex: 1, totalTopicsCount: 4, totalTestsCount: 1 },
          { id: "2", nameUz: "Matematika", nameEn: "Math", nameRu: "Математика", code: "MATH", description: "", icon: "Calculator", gradientColor: "", orderIndex: 2, totalTopicsCount: 4, totalTestsCount: 1 },
          { id: "3", nameUz: "Ingliz tili", nameEn: "English", nameRu: "Английский", code: "ENG", description: "", icon: "Globe", gradientColor: "", orderIndex: 3, totalTopicsCount: 3, totalTestsCount: 0 },
        ]);
      }
    };
    loadSubjects();
  }, []);

  // Load conversations
  const loadConversations = async () => {
    try {
      const convs = await apiFetch<ConversationDto[]>("/chat/conversations");
      setConversations(convs);
      if (convs.length > 0 && !activeConversationId) {
        setActiveConversationId(convs[0].id);
        loadMessages(convs[0].id);
      } else if (convs.length === 0) {
        setMessages([
          {
            id: "m_welcome",
            conversationId: "c_new",
            sender: 2,
            content: `Salom, **${profile?.fullName || "O'quvchi"}**! 👋\n\nMen sizning shaxsiy **AI STUDY TWIN** repetitoringizman. Istalgan fan, dars, formula yoki dasturlash savolini so'rashingiz mumkin.\n\n💡 *Siz xohlagan payt 'Oddiyroq tushuntir', 'Misol ber' yoki 'Qisqaroq xulosa qil' deb buyruq berishingiz mumkin, men suhbat kontekstini doim eslab qolaman!*`,
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } catch {
      setMessages([
        {
          id: "m_welcome",
          conversationId: "c_new",
          sender: 2,
          content: `Salom! Men sizning **AI STUDY TWIN** repetitoringizman. Istalgan savolingizni yozing yoki mikrofon orqali ayting!`,
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [profile]);

  const loadMessages = async (convId: string) => {
    try {
      const msgs = await apiFetch<MessageDto[]>(`/chat/conversations/${convId}/messages`);
      setMessages(msgs);
    } catch {}
  };

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    loadMessages(convId);
  };

  const handleNewConversation = async () => {
    try {
      const newConv = await apiFetch<ConversationDto>("/chat/conversations", {
        method: "POST",
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          title: "Yangi suhbat"
        })
      });
      setConversations([newConv, ...conversations]);
      setActiveConversationId(newConv.id);
      setMessages([
        {
          id: "m_welcome",
          conversationId: newConv.id,
          sender: 2,
          content: `Yangi suhbat boshlandi! Qaysi mavzu yoki masalani tahlil qilamiz?`,
          createdAt: new Date().toISOString()
        }
      ]);
    } catch {
      setActiveConversationId(null);
      setMessages([]);
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    try {
      await apiFetch(`/chat/conversations/${convId}`, { method: "DELETE" });
      const updated = conversations.filter(c => c.id !== convId);
      setConversations(updated);
      if (activeConversationId === convId) {
        if (updated.length > 0) {
          setActiveConversationId(updated[0].id);
          loadMessages(updated[0].id);
        } else {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    } catch {}
  };

  // Typewriter streaming effect for newly arrived AI messages
  const triggerTypewriterStream = (fullMessage: MessageDto) => {
    setStreamingMessageId(fullMessage.id);
    setDisplayedStreamingText("");

    const text = fullMessage.content;
    let currentIdx = 0;
    const chunkSize = Math.max(2, Math.floor(text.length / 40)); // Dynamic speed based on length

    const interval = setInterval(() => {
      currentIdx += chunkSize;
      if (currentIdx >= text.length) {
        setDisplayedStreamingText(text);
        setStreamingMessageId(null);
        clearInterval(interval);
      } else {
        setDisplayedStreamingText(text.slice(0, currentIdx));
      }
    }, 15);
  };

  // Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputContent;
    if (!text.trim() || isSending) return;

    const userMessage: MessageDto = {
      id: `m_${Date.now()}`,
      conversationId: activeConversationId || "temp",
      sender: 1,
      content: text.trim(),
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputContent("");
    setIsSending(true);

    try {
      const response = await apiFetch<MessageDto>("/chat/send", {
        method: "POST",
        body: JSON.stringify({
          conversationId: activeConversationId,
          subjectId: selectedSubjectId,
          content: text.trim(),
          language: language
        })
      });

      setMessages(prev => [...prev, response]);
      if (!activeConversationId) {
        setActiveConversationId(response.conversationId);
      }
      triggerTypewriterStream(response);
      loadConversations();
    } catch (err: any) {
      const errDetail = err?.message || "AI xizmatida muammo yuz berdi. Iltimos qayta urinib ko'ring.";
      const errorMessage: MessageDto = {
        id: `m_err_${Date.now()}`,
        conversationId: activeConversationId || "temp",
        sender: 2,
        content: `⚠️ **AI xizmati xabari:**\n\n${errDetail}`,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // Web Speech API Recording
  const startVoiceRecording = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Brauzeringizda ovoz tanish (SpeechRecognition) qo'llab-quvvatlanmaydi. Google Chrome yoki Safari tavsiya etiladi.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === "ru" ? "ru-RU" : language === "en" ? "en-US" : "uz-UZ";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputContent(transcript);
          handleSendMessage(transcript);
        }
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        setIsRecording(false);
        console.warn("Speech recognition error", event.error);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  // Text-To-Speech Playback
  const playAiVoice = (msgId: string, text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isPlayingAudio && playingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setPlayingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[#*`_$\\]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === "ru" ? "ru-RU" : language === "en" ? "en-US" : "uz-UZ";
    utterance.rate = 1.0;

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setPlayingMessageId(null);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setPlayingMessageId(null);
    };

    setPlayingMessageId(msgId);
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  return (
    <div style={{ height: "calc(100vh - 70px)", display: "flex", overflow: "hidden" }}>
      {/* Sidebar: Conversations & Subject Filter */}
      <div
        className="glass-panel md:flex"
        style={{
          width: "280px",
          borderRight: "1px solid var(--border-glass)",
          borderRadius: 0,
          borderTop: "none",
          borderBottom: "none",
          borderLeft: "none",
          display: "none",
          flexDirection: "column",
          padding: "16px",
        }}
      >
        <button
          onClick={handleNewConversation}
          className="btn-primary"
          style={{ width: "100%", padding: "10px", fontSize: "13px", marginBottom: "16px" }}
        >
          <Plus size={16} />
          <span>{t.chat.newChat}</span>
        </button>

        {/* Subject Filter Dropdown */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
            {t.chat.selectSubject}
          </label>
          <select
            value={selectedSubjectId || ""}
            onChange={(e) => setSelectedSubjectId(e.target.value || null)}
            className="input-field"
            style={{ fontSize: "13px", padding: "8px 12px" }}
          >
            <option value="">{t.chat.allSubjects}</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.nameUz}</option>
            ))}
          </select>
        </div>

        {/* Conversations History List */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", padding: "4px 8px" }}>
            Suhbatlar Tarixi
          </span>
          {conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  background: isActive ? "var(--bg-tertiary)" : "transparent",
                  border: isActive ? "1px solid var(--accent-purple)" : "1px solid transparent",
                  cursor: "pointer",
                  fontSize: "13px",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: isActive ? "700" : "500"
                }}
              >
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: "8px" }}>
                  {conv.title}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conv.id);
                  }}
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                  title="Suhbatni o'chirish"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Stream Container */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Chat Header */}
        <div style={{
          padding: "12px 24px",
          borderBottom: "1px solid var(--border-glass)",
          backgroundColor: "var(--bg-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "var(--gradient-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff"
            }}>
              <Bot size={20} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700" }}>{t.chat.title}</div>
              <div style={{ fontSize: "11px", color: "var(--accent-cyan)", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                <span>Conversational AI • Kontekst & Tarix Faol</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleNewConversation} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
              <Plus size={14} />
              <span>Yangi suhbat</span>
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {messages.map((msg) => {
            const isUser = msg.sender === 1;
            const isCurrentlyStreaming = msg.id === streamingMessageId;
            const textContent = isCurrentlyStreaming ? displayedStreamingText : msg.content;

            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  gap: "12px",
                  maxWidth: "88%",
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  flexDirection: isUser ? "row-reverse" : "row"
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: isUser ? "var(--accent-purple)" : "var(--bg-tertiary)",
                  border: "1px solid var(--border-glass)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  flexShrink: 0
                }}>
                  {isUser ? <User size={18} /> : <Bot size={18} color="var(--accent-cyan)" />}
                </div>

                {/* Bubble */}
                <div
                  className="glass-panel"
                  style={{
                    padding: "16px 18px",
                    borderRadius: "var(--radius-lg)",
                    background: isUser ? "linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)" : "var(--bg-card)",
                    border: isUser ? "1px solid rgba(139, 92, 246, 0.4)" : "1px solid var(--border-glass)",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    color: "var(--text-primary)",
                    wordBreak: "break-word"
                  }}
                >
                  <MessageContent content={textContent} isStreaming={isCurrentlyStreaming} />

                  {/* Sources if present */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--border-glass)" }}>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--accent-cyan)", marginBottom: "6px" }}>
                        🔗 {t.chat.sources}:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {msg.sources.map((s, sIdx) => (
                          <a
                            key={sIdx}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "12px",
                              color: "var(--text-secondary)",
                              textDecoration: "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <ExternalLink size={12} color="var(--accent-purple)" />
                            <span>{s.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assistant Message Actions (Play Voice & Copy Text) */}
                  {!isUser && (
                    <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        onClick={() => playAiVoice(msg.id, msg.content)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "var(--bg-tertiary)",
                          border: "1px solid var(--border-glass)",
                          borderRadius: "var(--radius-sm)",
                          padding: "4px 8px",
                          fontSize: "11px",
                          color: isPlayingAudio && playingMessageId === msg.id ? "var(--accent-cyan)" : "var(--text-muted)",
                          cursor: "pointer"
                        }}
                      >
                        {isPlayingAudio && playingMessageId === msg.id ? (
                          <>
                            <VolumeX size={13} />
                            <span>To'xtatish</span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={13} />
                            <span>Ovozli eshitish</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopyText(msg.id, msg.content)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "var(--bg-tertiary)",
                          border: "1px solid var(--border-glass)",
                          borderRadius: "var(--radius-sm)",
                          padding: "4px 8px",
                          fontSize: "11px",
                          color: "var(--text-muted)",
                          cursor: "pointer"
                        }}
                        title="Matndan nusxa olish"
                      >
                        {copiedMsgId === msg.id ? (
                          <>
                            <Check size={13} color="var(--accent-emerald)" />
                            <span style={{ color: "var(--accent-emerald)" }}>Nusxa olindi</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Nusxa olish</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isSending && (
            <div style={{ display: "flex", gap: "12px", alignSelf: "flex-start", alignItems: "center" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={18} color="var(--accent-cyan)" />
              </div>
              <div className="glass-panel" style={{ padding: "12px 18px", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={16} className="animate-spin" color="var(--accent-purple)" />
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>AI repetitor javob tayyorlamoqda...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompt Pills */}
        <div style={{
          padding: "8px 20px 0 20px",
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          backgroundColor: "var(--bg-secondary)",
          scrollbarWidth: "none"
        }}>
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.query)}
              disabled={isSending}
              style={{
                fontSize: "12px",
                padding: "6px 12px",
                borderRadius: "var(--radius-full)",
                background: "var(--bg-card)",
                border: "1px solid var(--border-glass)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-purple)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-glass)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <Zap size={11} color="var(--accent-cyan)" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Input Bar & Large Glowing Microphone */}
        <div style={{
          padding: "12px 20px 16px 20px",
          borderTop: "1px solid var(--border-glass)",
          backgroundColor: "var(--bg-secondary)"
        }}>
          {isRecording ? (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px",
              borderRadius: "var(--radius-md)",
              background: "rgba(244, 63, 94, 0.15)",
              border: "1px solid var(--accent-rose)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "var(--accent-rose)", boxShadow: "0 0 10px var(--accent-rose)" }} className="animate-ping" />
                <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--accent-rose)" }}>
                  {t.chat.listening}
                </span>
                <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
                  <div className="audio-bar" />
                  <div className="audio-bar" style={{ animationDelay: "0.2s" }} />
                  <div className="audio-bar" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={stopVoiceRecording}
                  className="btn-primary"
                  style={{ background: "var(--accent-rose)", padding: "6px 14px", fontSize: "12px" }}
                >
                  <MicOff size={14} />
                  <span>{t.chat.stopRecording}</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* Big Pulsing Mic Button */}
              <button
                onClick={startVoiceRecording}
                className="btn-icon mic-recording-pulse"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "var(--gradient-brand)",
                  color: "#ffffff",
                  boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)",
                  flexShrink: 0
                }}
                title="Ovozli savol berish"
              >
                <Mic size={22} />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={t.chat.typePlaceholder}
                className="input-field"
                style={{ height: "48px", borderRadius: "var(--radius-md)" }}
              />

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputContent.trim() || isSending}
                className="btn-primary"
                style={{ width: "48px", height: "48px", padding: 0, borderRadius: "14px", flexShrink: 0 }}
              >
                <Send size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
