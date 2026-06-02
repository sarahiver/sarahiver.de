# Design System v2 — Foundation Migration

**Was hier drin ist:** DB-Migration + Token-System + Filter-Library für den Refactor von 5 auf 8 Stile.

**Was hier NICHT drin ist:** Die Bereich-Komponenten selbst (Hero, Lovestory, etc.). Die kommen in den nächsten Sessions bereich-für-bereich dran.

## Reihenfolge der Anwendung

### 1. SQL-Migration ausführen (Supabase SQL Editor)

```
migrations/v2-design-system-8-styles.sql
```

Was sie macht:
- **INSERT** 8 neue Einträge in `palette_presets` (eine Default-Palette pro Stil)
- **INSERT** 8 neue Einträge in `font_presets`
- **INSERT** 8 neue Einträge in `start_styles` (editorial, brutalist, organic, mono, opulent, liquefy, kinetic, bauhaus)
- **UPDATE** `wedding_sites.start_style_id` — alte IDs auf neue mappen (klassisch_warm → editorial, modern_klar → mono, verspielt_floral → organic, minimal_ruhig → mono, bold_festlich → opulent)
- **UPDATE** alte Presets auf `display_order = -1` (sie bleiben in der DB für Audit, werden aber im Picker ausgefiltert)

Idempotent: kann mehrmals laufen.

**Nach der Migration verifizieren:**
```sql
SELECT id, name, display_order FROM start_styles ORDER BY display_order;
SELECT start_style_id, COUNT(*) FROM wedding_sites GROUP BY start_style_id;
```

### 2. Code-Files einspielen (ZIP entpacken ins Repo)

**Ersetzen:**
- `src/lib/tokens.ts` — neue IMAGE_FILTERS-Map (8 Stile) + `buildCloudinaryVariants()` Helper + `--img-base/portrait/square/wide/tall` CSS-Vars
- `src/app/[slug]/page.tsx` — Default-Style auf `'editorial'` geändert, `<DecorationFilters />` eingebunden

**Neu:**
- `src/components/decoration/DecorationFilters.tsx` — globale SVG-Filter-Library (#br-distort, #brutal-melt, #org-goo, #org-goo-soft, #noise-grain)

**An bestehende globals.css anhängen** (nicht ersetzen!):
- `src/app/globals-append.css` — Inhalt ans Ende deiner `src/app/globals.css` kopieren

### 3. StilTab.tsx prüfen

Der bestehende `src/app/dashboard/[slug]/settings/StilTab.tsx` lädt seine Stil-Liste dynamisch aus DB (`loadAllPresets()`). Nach der Migration zeigt er automatisch die 8 neuen Stile — kein Code-Patch nötig. Eventuelle Cleanup-Aufgabe: prüfen ob `display_order < 0` ausgefiltert wird (sollte schon der Fall sein durch ORDER BY).

## Was du nach diesem Schritt hast

- DB enthält 8 neue Stile + Default-Paletten + Default-Fonts
- Bestehende Brautpaare wurden auf den nächstgelegenen neuen Stil gemappt — bleiben funktional
- Token-System weiß über alle 8 Stile Bescheid, hat CSS-Variables-Blocks pro Stil
- Cloudinary-Bilder werden in 5 Aspect-Ratios als CSS-Vars bereitgestellt
- SVG-Filter sind global verfügbar

## Was noch fehlt (kommende Sessions)

- Bereich-Komponenten refactoren — pro Bereich 8 Stile × 3 Variants = 24 Render-Pfade
- Decoration-Sub-Komponenten bauen (Goo-Blobs, Stars-Pattern, Marquees, Aurora-Layer)
- StilTab-UI testen mit den 8 neuen Stilen

## Wichtig

Nach der Migration sehen alle existierenden Hochzeitsseiten erst mal **schlechter** aus als vorher, weil die neuen CSS-Variables-Blocks zwar definiert sind, die Bereich-Komponenten aber noch die alten CSS-Klassen nutzen. Das ist erwartet — wir refactoren bereich-für-bereich.

Tipp: Falls du erst weiter testen willst, bevor wir die Bereiche umbauen, kannst du temporär einen Branch nutzen.
