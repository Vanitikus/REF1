export default function TermeniPage() {
  return (
    <div className="py-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Termeni si conditii</h1>
      <p className="text-sm text-gray-400 mb-8">Ultima actualizare: 1 februarie 2026</p>

      <div className="prose prose-sm max-w-none space-y-6">
        <section>
          <h2 className="text-lg font-bold mb-2">1. Acceptarea termenilor</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Prin accesarea si utilizarea platformei REFiND, acceptati sa respectati acesti termeni si conditii.
            Daca nu sunteti de acord cu oricare dintre aceste prevederi, va rugam sa nu utilizati platforma.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">2. Descrierea serviciului</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            REFiND este o platforma civica online care faciliteaza conectarea persoanelor care au pierdut obiecte
            cu cele care le-au gasit. Platforma ofera instrumente de postare, cautare, matching automat prin AI
            si comunicare intre utilizatori.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">3. Contul de utilizator</h2>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>Trebuie sa aveti cel putin 16 ani pentru a crea un cont.</li>
            <li>Sunteti responsabili pentru securitatea contului si a parolei.</li>
            <li>Informatiile furnizate trebuie sa fie reale si exacte.</li>
            <li>Un singur cont per persoana este permis.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">4. Reguli de utilizare</h2>
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>Postarile trebuie sa fie reale si sa descrie obiecte efectiv pierdute sau gasite.</li>
            <li>Este interzisa postarea de continut fals, inselator sau fraudulos.</li>
            <li>Comunicarea abuziva, hartuirea sau amenintarile sunt strict interzise.</li>
            <li>Nu este permisa utilizarea platformei in scopuri comerciale fara acord.</li>
            <li>Recompensele sunt responsabilitatea exclusiva a utilizatorilor implicati.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">5. Continut generat de utilizatori</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Utilizatorii isi pastreaza drepturile de proprietate intelectuala asupra continutului postat.
            Prin postare, acordati REFiND o licenta non-exclusiva de a afisa continutul pe platforma.
            Ne rezervam dreptul de a sterge continut care incalca acesti termeni.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">6. Limitarea raspunderii</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            REFiND este un intermediar si nu garanteaza recuperarea obiectelor pierdute. Nu suntem
            responsabili pentru tranzactiile, intalnirile sau acordurile intre utilizatori. Va recomandam
            sa luati masuri de precautie la intalnirile in persoana.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">7. Modificari</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Ne rezervam dreptul de a modifica acesti termeni in orice moment. Modificarile vor fi
            publicate pe aceasta pagina. Continuarea utilizarii platformei dupa modificari constituie
            acceptarea noilor termeni.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">8. Contact</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Pentru intrebari despre acesti termeni, ne puteti contacta la: contact@refind.ro
          </p>
        </section>
      </div>
    </div>
  );
}
