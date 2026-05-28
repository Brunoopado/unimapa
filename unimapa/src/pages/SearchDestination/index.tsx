function SearchDestination() {
  return (
    <section className="page">
      <h1>Pesquisar Destino</h1>

      <div className="search-row">
        <input type="text" placeholder="Pesquisar destino..." />
        <button type="button">🔍</button>
      </div>

      <div className="placeholder-card">
        <h2>Prédio Principal</h2>
        <p>Térreo</p>
        <p>Biblioteca</p>
        <p>Cantina</p>
        <p>Elevador</p>
        <p>Escada</p>
      </div>
    </section>
  );
}

export default SearchDestination;