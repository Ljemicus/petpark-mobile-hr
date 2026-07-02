# Mobile error pattern (KIT-E E.2)

Odabrani obrazac za E.2: **zadržati postojeći potpis funkcija + module-level last error state**.

Razlog: mobile repo već ima mnogo ekrana koji očekuju `[]`, `null` ili `false`; prelazak svih funkcija na diskriminirani union rezultat odjednom bi bio širok refactor i lako bi slomio UI. Zato modul po modul:

1. DB helper u catch bloku zove `record<Module>Error(source, err)`.
2. Funkcija privremeno vraća postojeći fallback (`[]`, `null`, `false`) radi kompatibilnosti.
3. Ekran prije fetchanja čisti module-level error.
4. Nakon fetchanja ekran čita `get<Module>LastError()` i, ako postoji, prikazuje hrvatski error state:
   - "Ne možemo učitati podatke. Povuci za osvježavanje."
   - retry akcija gdje je dostupna.
5. Kad E.5 Sentry bude uveden, `record<Module>Error()` je jedno mjesto za `Sentry.captureException()`.

Ovo nije krajnji idealan API, ali je najniži rizik za KIT-E modul-po-modul hardening bez shema/migracija.
