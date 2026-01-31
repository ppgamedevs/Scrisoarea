# Specificații Tehnice: Fluxul de Donație și Plăți (MVP)

Acest document detaliază arhitectura tranzacțională pentru platforma "Scrisoarea mea". Obiectivul este asigurarea integrității financiare (fără overfunding) și o experiență de utilizare fluidă.

## 1. Flux Donator (Frontend UI & Logic)

### Modulul de Donație (Pagina Scrisorii)
Logica de input este restrictivă ("Smart Capping") pentru a preveni erorile utilizatorului.

1.  **Afișare Progres:**
    *   Bară vizuală: "150 RON strânși din 500 RON".
    *   Text ajutător: "Mai sunt necesari 350 RON".
2.  **Selecție Sumă:**
    *   Butoane presetate: [50 RON] [100 RON].
    *   Buton dinamic: [Rest integral (350 RON)].
    *   Input manual: Câmp numeric liber.
3.  **Reguli de Validare Input (Client-Side):**
    *   **Minim:** 10 RON.
    *   **Maxim:** Egal cu `suma_target - suma_colectata_invclusiv_pending`.
    *   **Auto-corecție:** Dacă un donator introduce "500" dar necesarul este "350", inputul se rescrie automat la "350" și apare un mesaj informativ discret: *"Suma a fost ajustată la necesarul maxim rămas."*
4.  **Checkout:**
    *   Pas 1: Introducere Adresă de Email (obligatoriu pentru chitanță).
    *   Pas 2: Redirecționare către procesator (Stripe/Netopia) SAU formular card inline (Stripe Elements).
5.  **Ecran Succes:**
    *   Mesaj simplu: "Donație înregistrată."
    *   Sumar: "Ai acoperit X% din scrisoarea pentru [Prenume]."
    *   Link descărcare dovadă plată/chitanță.
6.  **Ecran Eșec:**
    *   Motiv clar (ex: "Fonduri insuficiente", "Eroare bancară").
    *   Buton: "Încearcă din nou" (păstrează suma selectată).

## 2. Flux Backend (Data & Procesare)

### Structura Datelor (Tabel `donations`)
*   `id`: UUID
*   `letter_id`: FK
*   `amount`: Decimal
*   `status`: ENUM (PENDING, PAID, FAILED, REFUNDED)
*   `processor_id`: String (ex: `pi_3Nz...`)
*   `donor_email`: String
*   `created_at`: Timestamp

### Logica Tranzacțională
Pentru a evita "Race Conditions" (doi donatori plătesc simultan ultimii 50 RON):

1.  **Inițiere (Intent Creation):**
    *   Clientul cere inițierea plății pentru suma X.
    *   Backend-ul execută o tranzacție DB:
        *   Citește `suma_colectata` + `suma_in_pending` pentru scrisoarea respectivă.
        *   Verifică: `(total_existent + X) <= suma_target`.
        *   **Dacă DA:** Creează înregistrarea în `donations` cu status `PENDING` și generează Intent-ul la procesator. Suma X este acum "rezervată" temporar.
        *   **Dacă NU:** Returnează eroare "Suma a fost deja acoperită de altcineva între timp".
2.  **Expirare (Cleanup):**
    *   Orice donație `PENDING` mai veche de 30 minute fără confirmare trece automat la `FAILED` și "eliberează" suma rezervată.
3.  **Webhook Handler:**
    *   Ascultă evenimentul `payment_succeeded`.
    *   Caută donația după `processor_id`.
    *   Actualizează statusul donației în `PAID`.
    *   Recalculează totalul scrisorii și actualizează cache-ul `scrisoare.suma_colectata`.
    *   Declanșează verificarea de `FINANTAT` (vezi pct 3).

## 3. Tranziții de Status (Ciclu de Viață)

Tranzițiile sunt un mix automat/manual.

1.  **PUBLICAT** -> **IN_FINANTARE**
    *   *Trigger:* Automat, la momentul publicării de către Admin.
2.  **IN_FINANTARE** -> **FINANTAT**
    *   *Trigger:* Automat, 100% Backend.
    *   *Condiție:* Când Webhook-ul confirmă o plată care duce `suma_colectata` == `suma_target`.
    *   *Acțiune:* Se ascunde butonul de donație. Se trimite notificare la Logistică.
3.  **FINANTAT** -> **IN_FULFILLMENT**
    *   *Trigger:* Manual (Operator Logistică).
    *   *Semnificație:* Comanda a fost plasată la furnizor.
4.  **IN_FULFILLMENT** -> **LIVRAT_CONFIRMAT**
    *   *Trigger:* Manual (Instituție).
    *   *Acțiune:* Instituția încarcă media (foto/video) în platformă.
5.  **LIVRAT_CONFIRMAT** -> **INCHIS**
    *   *Trigger:* Manual (Admin).
    *   *Acțiune:* Validarea finală a dovezii. Scrisoarea intră în arhivă.

## 4. Edge Cases (Situații Limită)

1.  **Concurență (Race Condition):**
    *   Doi useri apasă "Plătește" în aceeași milisecundă pentru ultimii bani.
    *   *Soluție:* Mecanismul de "Rezervare" (PENDING state) descris la pct 2. Primul request care intră blochează suma. Al doilea primește eroare prietenoasă înainte de a introduce cardul.
2.  **Chargeback / Refund:**
    *   Dacă o donație e contestată sau returnată, webhook-ul de `refund` scade suma din scrisoare.
    *   Dacă scrisoarea era `FINANTAT`, ea revine automat la `IN_FINANTARE` dacă suma scade sub 100%.
3.  **Plăți Parțiale în progres:**
    *   Scrisoarea arată progresul incluzând donațiile `PENDING` (cele în curs de plată) pentru a descuraja alți useri să doneze peste limită în timp ce cineva completează datele cardului.
4.  **Eroare de procesare:**
    *   Dacă plata eșuează, starea `PENDING` trece în `FAILED` imediat (via webhook failure) sau la timeout. Suma devine disponibilă din nou.

## 5. Unelte Admin (MVP)

Pentru contabilitate și reconciliere simplă:

1.  **Raport Tranzacții (Export CSV):**
    *   Coloane: `Data`, `ID Tranzacție` (Processor), `Email Donator`, `Suma`, `ID Scrisoare`, `Status`.
    *   Acest export este sursa de adevăr pentru departamentul financiar.
2.  **Dashboard Reconciliere:**
    *   Vizualizare simplă:
        *   Total Colectat (Confirmate)
        *   Total În Curs (Pending)
        *   Total Returnat
    *   Alerte: Scrisori blocate în "Pending" neobișnuit de mult timp (bug protection).
3.  **Ajustări Manuale (Logs required):**
    *   Buton de "Anulare Donație" pentru admini (trigger refund la procesator + update DB).
    *   Orice ajustare manuală necesită o notă explicativă obligatorie ("Motiv").
