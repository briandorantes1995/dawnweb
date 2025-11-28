// src/auth/OAuthCallback.tsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../store/store";
import { exchangeTokenThunk } from "../store/auththunks";

export default function OAuthCallback() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.hash.startsWith("#")
        ? window.location.hash.replace("#", "?")
        : window.location.search
    );

    const code = params.get("code");
    const state = params.get("state");

    if (!code || !state) {
      navigate("/login?error=missing_params");
      return;
    }

    async function processLogin() {
      try {
        await dispatch(exchangeTokenThunk({ code, state }));
        navigate("/admin/dashboard");
      } catch (err) {
        console.error("OAuth Error:", err);
        navigate("/login?error=oauth_failed");
      }
    }

    processLogin();
  }, [dispatch, navigate]);

  return (
    <div className="content">
      <div className="container-fluid text-center">
        <p>Procesando login...</p>
      </div>
    </div>
  );
}

