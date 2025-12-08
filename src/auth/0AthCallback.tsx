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
  const hash = window.location.hash.replace("#", "");
  const params = new URLSearchParams(hash);

  const accessToken = params.get("access_token");

  if (!accessToken) {
    navigate("/login?error=no_token");
    return;
  }

  async function login() {
    try {
      await dispatch(exchangeTokenThunk({ accessToken })).unwrap();
      navigate("/login?oauth=success");
    } catch (err) {
      console.error(err);
      navigate("/login?error=exchange_failed");
    }
  }

  login();
}, []);

  return (
    <div className="content">
      <div className="container-fluid text-center">
        <p>Procesando login...</p>
      </div>
    </div>
  );
}

