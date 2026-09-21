import { useState } from "react";

import {
  getRoutePreference,
  saveRoutePreference,
  clearUserCookies,
} from "../../services/cookieService";

import type { RoutePreference } from "../../types/location";

function Settings() {
  const [preferenciaRota, setPreferenciaRota] =
    useState<RoutePreference>(() =>
      getRoutePreference()
    );

  function alterarPreferencia(
    preferencia: RoutePreference
  ) {
    setPreferenciaRota(preferencia);
    saveRoutePreference(preferencia);
  }

  function limparCookies() {
  clearUserCookies();

  // Volta visualmente para o padrão
  setPreferenciaRota("stairs");
}

  return (
    <section className="page">
      <h1>Definições</h1>

      <div className="placeholder-card">
        <h2>Elemento de rota preferido</h2>

        <label>
          <input
            type="radio"
            name="routePreference"
            value="stairs"
            checked={
              preferenciaRota === "stairs"
            }
            onChange={() =>
              alterarPreferencia("stairs")
            }
          />
          Escadas
        </label>

        <label>
          <input
            type="radio"
            name="routePreference"
            value="ramps"
            checked={
              preferenciaRota === "ramps"
            }
            onChange={() =>
              alterarPreferencia("ramps")
            }
          />
          Rampas
        </label>

        <label>
          <input
            type="radio"
            name="routePreference"
            value="elevators"
            checked={
              preferenciaRota === "elevators"
            }
            onChange={() =>
              alterarPreferencia("elevators")
            }
          />
          Elevadores
        </label>
      </div>

      <div className="placeholder-card">
        <h2>Cookies</h2>

        <button
          type="button"
          className="danger-button"
          onClick={limparCookies}
        >
          Limpar Cookies
        </button>
      </div>
    </section>
  );
}

export default Settings;