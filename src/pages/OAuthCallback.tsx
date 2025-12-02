import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../api/http"; // usar cliente axios centralizado

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sendCode = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        console.error("No se recibió el code de Google OAuth");
        navigate("/login");
        return;
      }

      try {
        const res = await http.get(`/auth/google/callback?code=${code}`, { withCredentials: true });

        if (res.data.success) {
          navigate("/dashboard");
        } else {
          console.error("Autenticación fallida en backend");
          navigate("/login");
        }
      } catch (err: any) {
        console.error("Error enviando code al backend:", err.response?.data || err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    sendCode();
  }, [navigate]);

  return <p>{loading ? "Procesando autenticación..." : "Redirigiendo..."}</p>;
}
