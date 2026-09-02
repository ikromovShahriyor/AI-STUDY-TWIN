"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthResponse, StudentProfileDto, UserDto } from "./types";
import { apiFetch, clearAuthTokens, getAccessToken, setAuthTokens } from "./api";

interface AuthContextType {
  user: UserDto | null;
  profile: StudentProfileDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (fullName: string, email: string, pass: string, grade?: string, target?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<StudentProfileDto>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
  updateProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [profile, setProfile] = useState<StudentProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const userRes = await apiFetch<UserDto>("/auth/me");
      setUser(userRes);
      localStorage.setItem("ai_study_twin_user", JSON.stringify(userRes));

      const profileRes = await apiFetch<StudentProfileDto>("/profile");
      setProfile(profileRes);
      localStorage.setItem("ai_study_twin_profile", JSON.stringify(profileRes));
    } catch {
      // Fallback from localStorage if offline
      const cachedUser = localStorage.getItem("ai_study_twin_user");
      const cachedProfile = localStorage.getItem("ai_study_twin_profile");
      if (cachedUser && cachedProfile) {
        setUser(JSON.parse(cachedUser));
        setProfile(JSON.parse(cachedProfile));
      } else {
        clearAuthTokens();
        setUser(null);
        setProfile(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password: pass }),
      });

      setAuthTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
      await refreshProfile();
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const register = async (fullName: string, email: string, pass: string, grade?: string, target?: string) => {
    setIsLoading(true);
    try {
      const res = await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName,
          email,
          password: pass,
          gradeLevel: grade,
          targetExam: target,
          preferredLanguage: "uz",
        }),
      });

      setAuthTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
      await refreshProfile();
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const logout = () => {
    clearAuthTokens();
    setUser(null);
    setProfile(null);
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  };

  const updateProfile = async (data: Partial<StudentProfileDto>) => {
    if (!profile) return;
    try {
      const updated = await apiFetch<StudentProfileDto>("/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName: data.fullName || profile.fullName,
          gradeLevel: data.gradeLevel || profile.gradeLevel,
          targetExam: data.targetExam || profile.targetExam,
          dailyStudyGoalMinutes: data.dailyStudyGoalMinutes || profile.dailyStudyGoalMinutes,
          bio: data.bio || profile.bio,
          avatarUrl: data.avatarUrl || profile.avatarUrl,
          preferredLanguage: data.preferredLanguage || profile.preferredLanguage,
        }),
      });
      setProfile(updated);
      localStorage.setItem("ai_study_twin_profile", JSON.stringify(updated));
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
