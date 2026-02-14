export default function ConfidentialitatePage() {
  return (
    <div className="py-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Politica de confidentialitate</h1>
      <p className="text-sm text-gray-400 mb-8">Ultima actualizare: 1 februarie 2026</p>

      <div className="prose prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-bold mb-2">1. Date colectate</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">Colectam urmatoarele categorii de date:</p>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li><strong>Date de cont:</strong> nume, adresa de email, parola (criptata).</li>
            <li><strong>Date de postare:</strong> titlu, descriere, imagini, locatie, categorie.</li>
            <li><strong>Date de localizare:</strong> coordonate GPS (doar cu acordul explicit).</li>
            <li><strong>Date de utilizare:</strong> paginile vizitate, actiunile efectuate, timestamp-uri.</li>
            <li><strong>Mesaje:</strong> continutul conversatiilor intre utilizatori.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">2. Scopul prelucrarii</h2>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>Furnizarea si imbunatatirea serviciului de matching.</li>
            <li>Trimiterea de notificari relevante (match-uri, mesaje, alerte de zona).</li>
            <li>Calcularea scorului de comunitate si verificarea utilizatorilor.</li>
            <li>Analiza si optimizarea platformei.</li>
            <li>Prevenirea fraudelor si asigurarea securitatii.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">3. Partajarea datelor</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Nu vindem datele personale catre terti. Partajam date limitate doar in urmatoarele situatii:
          </p>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5 mt-2">
            <li>Cu alti utilizatori: doar informatiile publice ale postarii si numele de afisare.</li>
            <li>Cu furnizori de servicii: pentru hosting, analiza si comunicare (sub NDA).</li>
            <li>Cu autoritatile: daca suntem obligati legal.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">4. Securitatea datelor</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Folosim masuri tehnice si organizatorice adecvate pentru protejarea datelor:
            criptare in tranzit (TLS), criptare la stocare, acces restrictionat pe baza de roluri,
            si audit-uri periodice de securitate.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">5. Drepturile dumneavoastra (GDPR)</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            In conformitate cu GDPR, aveti urmatoarele drepturi:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { right: 'Dreptul de acces', desc: 'Puteti solicita o copie a datelor personale.' },
              { right: 'Dreptul la rectificare', desc: 'Puteti corecta datele inexacte.' },
              { right: 'Dreptul la stergere', desc: 'Puteti solicita stergerea datelor.' },
              { right: 'Dreptul la portabilitate', desc: 'Puteti exporta datele intr-un format standard.' },
              { right: 'Dreptul la opozitie', desc: 'Puteti refuza prelucrarea in scopuri de marketing.' },
              { right: 'Dreptul la restrictionare', desc: 'Puteti limita prelucrarea datelor.' },
            ].map((item) => (
              <div key={item.right} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-800">{item.right}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">6. Cookie-uri</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Folosim cookie-uri esentiale pentru functionarea platformei (autentificare, preferinte).
            Nu folosim cookie-uri de tracking de la terti fara consimtamantul dumneavoastra.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">7. Retentia datelor</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Pastram datele contului cat timp contul este activ. Postarile expirate sunt arhivate dupa 90 de zile.
            La stergerea contului, datele personale sunt eliminate in termen de 30 de zile.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">8. Contact DPO</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Pentru exercitarea drepturilor sau intrebari despre confidentialitate:
            <br />Email: privacy@refind.ro
            <br />Adresa: Bucuresti, Romania
          </p>
        </section>
      </div>
    </div>
  );
}
