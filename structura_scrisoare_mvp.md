# Arhitectura MVP: Entitatea "Scrisoare"

Acest document definește structura tehnică și funcțională a unității centrale a platformei ("Scrisoarea"), tratată ca un obiect tranzacțional, nu editorial.

## 1. Model de Date (Data Model)

### A. Identificare și Meta (Public)
Aceste date sunt vizibile oricărui vizitator al site-ului.
*   `public_id`: String (Cod unic scurt, ex: SCR-24-XT9)
*   `prenume`: String (Doar prenumele copilului)
*   `varsta`: Integer (Ani împliniți)
*   `judet`: String (Ex: "Iași", fără localitate specifică)
*   `obiect_solicitat`: String (Titlu concis, ex: "Ghiozdan echipat")
*   `categorie_id`: Enum (Ex: Educație, Îmbrăcăminte, Jucării, Sport)
*   `data_publicarii`: Timestamp

### B. Conținut și Media (Public)
*   `imagine_scrisoare_url`: String (Imaginea scanată/poza scrisorii)
*   `text_transcris`: String (Textul curățat de erori majore, fără date sensibile)
*   `suma_target`: Decimal (Maxim 500.00 RON)
*   `suma_colectata`: Decimal (Actualizat în timp real)
*   `procent_finantare`: Integer (Calculat automat 0-100%)

### C. Date Interne și Sensibile (Privat - Doar Admin/Instituție)
Aceste campuri NU sunt niciodată expuse prin API către frontend-ul public.
*   `nume_familie`: String
*   `cnp_hash`: String (Pentru unicitate și prevenirea duplicatelor)
*   `institutie_id`: Foreign Key (Link către entitatea Instituție)
*   `asistent_social_id`: Foreign Key (Persoana responsabilă de caz)
*   `imagine_originala_url`: String (Versiunea needitată, dacă e cazul)
*   `cost_real_achizitie`: Decimal (Completat post-finanțare)
*   `dovada_livrare_raw_url`: String (Upload inițial instituție)

### D. Status (Enum & Transitions)
1.  `NOU`: Creat de instituție, draft.
2.  `MODERARE`: Trimis către admini pentru validare etică și de buget.
3.  `ACTIV`: Aprobat, vizibil public, deschis pentru donații.
4.  `FINANTAT`: 100% fonduri atinse. Donațiile sunt blocate automat.
5.  `IN_ACHIZITIE`: Începe procesul de cumpărare/logistică.
6.  `LIVRAT`: Instituția a marcat primirea și a încărcat dovada.
7.  `FINALIZAT`: Adminul a validat dovada livrării. Ciclul este închis.
8.  `ANULAT`: Scrisoare retrasă sau invalidată.

---

## 2. Cardul Scrisorii (List View)

Componenta standard de afișare în liste (browse page).

### Vizibil (Always)
*   **Imagine:** Thumbnail (crop focusat pe desen sau scris, nu pe margini).
*   **Titlu:** Obiectul solicitat ("O bicicletă", "Cărți de colorat").
*   **Context:** Prenume, Vârstă, Județ.
*   **Indicator Financiar:** Bară de progres vizuală.
*   **Text:** "X RON strânși din Y RON".
*   **CTA:** Buton "Donează" (dacă status = ACTIV) sau "Finalizat" (dacă status >= FINANTAT).

### EXCLUS (Never visible)
*   Numele de familie al copilului.
*   Fotografia copilului.
*   Numele specific al centrului de plasament (pentru a evita localizarea fizică a minorului).
*   Suma rămasă de strâns (se afișează pozitivul - cât s-a strâns, nu negativul - "lipsesc bani").

---

## 3. Pagina de Detaliu (Letter Detail Page)

Layout în două coloane pe Desktop, stivă pe Mobile.

### Header
*   Breadcrumb: Acasă > Județ > Prenume
*   Titlu Mare: Obiectul Solicitat.
*   Status Badge: (Ex: "În curs de strângere fonduri" sau "Livrat").

### Coloana Stângă (Conținutul)
1.  **Viewer Scrisoare:** Imagine zoomable de înaltă rezoluție a scrisorii.
2.  **Transcriere:** Textul scrisorii redactat clar sub imagine (pentru accesibilitate).
    *   *Notă:* Dacă scrisoarea conține elemente dramatice excesive, transcrierea va fi rezumată factual.

### Coloana Dreaptă (Acțiunea)
1.  **Card Sumar:**
    *   Prenume, Vârstă.
    *   Progres bar mare.
2.  **Modul Donație (Dacă status = ACTIV):**
    *   Selector sumă (Preseturi: 50, 100, Total Rămas).
    *   Input custom ("Altă sumă").
    *   Calcul automat: "Acoperi X% din dorința lui [Prenume]".
    *   Buton Principal: "Donează [Suma] RON".
3.  **Timeline (Vizibil post-donare sau public?):**
    *   Afișează pașii: Publicat -> Finanțat -> Achiziționat -> Livrat.
    *   *La statusul FINALIZAT:* Aici apare dovada livrării (video/foto blurat).

---

## 4. Reguli și Validări (Constraints)

### Limite Valori (Hard Validations)
*   **Plafon Maxim:** `suma_target` <= 500 RON. Sistemul respinge automat valori mai mari la creare.
*   **Minim Donabil:** 10 RON (pentru eficiență procesator plăți).
*   **Overfunding:** Imposibil. Dacă mai sunt necesari 20 RON, sistemul nu acceptă o donație de 50 RON. UI-ul ajustează automat suma maximă donabilă la restul rămas ("Cap the donation").

### Fluxul 100%
*   În secunda în care `suma_colectata` == `suma_target`:
    1.  Statusul devine automat `FINANTAT`.
    2.  Butonul "Donează" dispare și este înlocuit de un mesaj de succes ("Această dorință a fost îndeplinită").
    3.  Se trimite notificare automată către echipa de Logistică.

### Finanțare Parțială
*   Scrisoarea rămâne `ACTIV` pe o perioadă nedeterminată (în MVP) până la completarea sumei.
*   *Regulă de expirare (Post-MVP):* După X luni, fondurile se redistribuie (pooling), dar în MVP presupunem campanii active până la succes.

---

## 5. Excluderi Explicite (Ce NU facem în MVP)

1.  **Wishlist-uri cu link:** Nu permitem instituțiilor să pună link-uri de eMAG. Noi validăm prețul mediu al pieței, nu un produs specific de la un vendor.
2.  **Coș de cumpărături:** Donatorul donează pentru o scrisoare odată. Nu există "Add to cart" pentru 5 copii diferiți (simplificare flux plată).
3.  **Mesagerie:** Niciun fel de comentarii, wall de mesaje sau chat între donator și copil/instituție.
4.  **Conturi de utilizator pentru copii:** Copiii nu au acces la platformă.
5.  **Abonamente recurente:** Accentul este pe donația unică, per "proiect" (scrisoare).
