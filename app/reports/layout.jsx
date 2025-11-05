"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ALLOWED_ROLES = new Set(["admin", "professor"]);

function decodeJwtPayload(token) {
  try {
    const [, payloadSegment] = token.split(".");
    if (!payloadSegment) {
      return null;
    }

    const base64 = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decodedString = atob(padded);

    return JSON.parse(decodedString);
  } catch (error) {
    console.error("No se pudo decodificar el token JWT:", error);
    return null;
  }
}

function resolveUserRole() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = window.localStorage.getItem("user_data");

  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?.role) {
        return String(parsedUser.role).toLowerCase();
      }
    } catch (error) {
      console.warn("No se pudo parsear la información del usuario almacenada:", error);
    }
  }

  const token = window.localStorage.getItem("jwt_token") || window.localStorage.getItem("auth_token");
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  const role = payload?.role || payload?.userRole;
  return role ? String(role).toLowerCase() : null;
}

export default function ReportsLayout({ children }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("jwt_token") || window.localStorage.getItem("auth_token");

    if (!token) {
      router.replace("/manager/login");
      return;
    }

    const role = resolveUserRole();

    if (role && ALLOWED_ROLES.has(role)) {
      setIsAuthorized(true);
      setIsChecking(false);
      return;
    }

    router.replace("/manager/login");
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-600">
        <span>Comprobando permisos...</span>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}