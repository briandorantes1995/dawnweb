import React, { useEffect, useState } from "react";
import { useDispatch} from "react-redux";
import { clearSession } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

const NoPermission = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [seconds, setSeconds] = useState(10);

    useEffect(() => {

        // limpiar sesión después de imprimir
        dispatch(clearSession());

        // contador regresivo
        const interval = setInterval(() => {
            setSeconds((s) => s - 1);
        }, 1000);

        // redirigir después de 10s
        const timeout = setTimeout(() => {
            navigate("/login", { replace: true });
        }, 10000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [dispatch, navigate]);

    return (
        <div className="content text-center mt-5">
            <h2>Usuario sin permiso</h2>
            <p className="mt-3">Serás redirigido al inicio de sesión en {seconds} segundos…</p>
            <div className="spinner-border text-danger mt-3" role="status"></div>
        </div>
    );
};

export default NoPermission;


