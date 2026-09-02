"use client";

import React, { useState, useEffect } from "react";
import { useTranslation, Language } from "@/lib/i18n";
import { useTheme } from "@/lib/theme-context";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import {
  User,
  Mail,
  Lock,
  Globe,
  Sun,
  Moon,
  Target,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Save,
  Flame,
  Zap
} from "lucide-react";

export default function ProfilePage() {
  const { t, language, setLanguage } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { profile, updateProfile, logout } = useAuth();

  const [fullName, setFullName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [targetExam, setTargetExam] = useState("");
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(45);
  const [bio, setBio] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setGradeLevel(profile.gradeLevel || "10-sinf");
      setTargetExam(profile.targetExam || "IT & Dasturlash");
      setDailyGoalMinutes(profile.dailyStudyGoalMinutes || 45);
      setBio(profile.bio || "");
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await updateProfile({
        fullName,
        gradeLevel,
        targetExam,
        dailyStudyGoalMinutes: dailyGoalMinutes,
        bio,
        preferredLanguage: language
      });
      setSuccessMessage("Profil ma'lumotlari muvaffaqiyatli saqlandi! 🎉");
    } catch (err: any) {
      setErrorMessage(err.message || "Profilni yangilashda xatolik yuz berdi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await apiFetch("/profile/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setSuccessMessage("Parol muvaffaqiyatli o'zgartirildi!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setErrorMessage(err.message || "Parolni o'zgartirishda xatolik yuz berdi.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: "30px 20px" }}>
      <div className="container-custom" style={{ maxWidth: "800px" }}>
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-purple)", fontSize: "14px", fontWeight: "700", marginBottom: "4px" }}>
            <User size={18} />
            <span>TALABA PROFILI & SOZLAMALAR</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
            {t.nav.profile}
          </h1>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 16px",
            borderRadius: "var(--radius-md)",
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "var(--accent-emerald)",
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "24px"
          }}>
            <CheckCircle2 size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 16px",
            borderRadius: "var(--radius-md)",
            background: "rgba(244, 63, 94, 0.15)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            color: "var(--accent-rose)",
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "24px"
          }}>
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Profile Card Header */}
        <div
          className="glass-panel"
          style={{
            padding: "28px",
            marginBottom: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "var(--gradient-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "24px",
              fontWeight: "800",
              boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)"
            }}>
              {profile?.fullName ? profile.fullName[0].toUpperCase() : "A"}
            </div>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "4px" }}>
                {profile?.fullName || "O'quvchi"}
              </h2>
              <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
                {profile?.email}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span className="badge badge-purple">Daraja {profile?.level || 1}</span>
                <span className="badge badge-amber" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Flame size={12} fill="#f59e0b" />
                  <span>{profile?.currentStreak || 1} kun</span>
                </span>
                <span className="badge badge-cyan">{profile?.totalXp || 100} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="glass-panel" style={{ padding: "30px", marginBottom: "30px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>
            Shaxsiy Ma'lumotlar va O'quv Maqsadlari
          </h3>

          <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
                {t.auth.fullName}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
                  {t.auth.gradeLevel}
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="input-field"
                >
                  <option value="9-sinf">9-sinf</option>
                  <option value="10-sinf">10-sinf</option>
                  <option value="11-sinf">11-sinf</option>
                  <option value="1-kurs Talaba">1-kurs Talaba</option>
                  <option value="2-kurs Talaba">2-kurs Talaba</option>
                  <option value="Mustaqil o'rganuvchi">Mustaqil o'rganuvchi</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
                  {t.auth.targetExam}
                </label>
                <input
                  type="text"
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  placeholder="IELTS, DTM, SAT, IT..."
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
                Kunlik o'qish vaqti maqsadi (daqiqa)
              </label>
              <select
                value={dailyGoalMinutes}
                onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                className="input-field"
              >
                <option value={30}>30 daqiqa</option>
                <option value={45}>45 daqiqa (Tavsiya etiladi)</option>
                <option value={60}>60 daqiqa</option>
                <option value={90}>90 daqiqa (Intensiv)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
                Talaba haqida qisqacha (Bio)
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="O'quv qiziqishlaringiz haqida yozing..."
                className="input-field"
                style={{ resize: "none" }}
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary"
              style={{ alignSelf: "flex-start", padding: "12px 24px" }}
            >
              <Save size={16} />
              <span>{t.common.save}</span>
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="glass-panel" style={{ padding: "30px", marginBottom: "30px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>
            Xavfsizlik & Parol
          </h3>

          <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
                Hozirgi Parol
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-secondary)" }}>
                Yangi Parol
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kamida 6 ta belgi"
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="btn-secondary"
              style={{ alignSelf: "flex-start", padding: "10px 20px" }}
            >
              <Lock size={16} />
              <span>Parolni Yangilash</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
