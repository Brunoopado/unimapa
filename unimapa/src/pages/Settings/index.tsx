function Settings() {
  return (
    <section className="page">
      <h1>Definições</h1>

      <div className="placeholder-card">
        <h2>Elemento de rota preferido</h2>

        <label>
          <input type="radio" name="routePreference" defaultChecked />
          Escadas
        </label>

        <label>
          <input type="radio" name="routePreference" />
          Rampas
        </label>

        <label>
          <input type="radio" name="routePreference" />
          Elevadores
        </label>
      </div>

      <div className="placeholder-card">
        <h2>Cookies</h2>
        <button type="button" className="danger-button">
          Limpar Cookies
        </button>
      </div>
    </section>
  );
}

export default Settings;