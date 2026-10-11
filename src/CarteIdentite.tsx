export default function CarteIdentite() {
  return (
    <section className="identity-section" id="identite">
      <div className="identity-card">
        <div className="identity-header">
          <span>MANON FARGET®</span>
          <span className="identity-number">ID — MF2027</span>
        </div>

        <div className="identity-content">
          <div className="identity-photo">
            <img
              src="/images/portrait.png"
              alt="Portrait de Manon Farget"
            />
            <span className="photo-label">PHOTO OFFICIELLE</span>
          </div>

          <div className="identity-info">
            <p className="identity-overline">
              // CARTE D'IDENTITÉ CRÉATIVE
            </p>

            <h2>
              Manon
              <br />
              Farget<span>.</span>
            </h2>

            <p className="identity-job">
              Étudiante en création numérique
            </p>

            <div className="identity-fields">
              <div>
                <span>FORMATION</span>
                <strong>BUT MMI · 2e année</strong>
              </div>

              <div>
                <span>LOCALISATION</span>
                <strong>Le Puy-en-Velay</strong>
              </div>

              <div>
                <span>DOMAINES</span>
                <strong>Web · Graphisme · Vidéo</strong>
              </div>

              <div>
                <span>DISPONIBILITÉ</span>
                <strong>Stage · Avril 2027</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="identity-footer">
          <div className="identity-tags">
            <span>CRÉATIVE</span>
            <span>CURIEUSE</span>
            <span>MINUTIEUSE</span>
          </div>

          <div className="identity-stamp">
            MF<span>✳</span>
          </div>
        </div>
      </div>

      <p className="identity-caption">
        UN PEU DE MOI, BEAUCOUP DE CRÉATIVITÉ.
      </p>
    </section>
  );
}