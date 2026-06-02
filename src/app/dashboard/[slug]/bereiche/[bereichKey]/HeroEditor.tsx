'use client';

import { useCallback, useEffect, useRef, useState, useTransition, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { updateHeroImage, updateBereichContent } from './actions';
import ImageUploader from '@/components/dashboard/ImageUploader';
import SaveStatusIndicator, { type SaveStatus } from '@/components/dashboard/SaveStatusIndicator';

/**
 * Hero-Editor (Design System v2):
 *
 * Pro Variante andere Felder, denn die 3 Variants haben unterschiedliche Anforderungen:
 *
 *   Variante A (Centered / Bento / Marquee):
 *     - Hero-Bild (1×)
 *     - Eyebrow
 *
 *   Variante B (Split Editorial / Documentary):
 *     - Hero-Bild (1×)
 *     - Eyebrow
 *     - Intro-Text (optional, im Text-Block sichtbar)
 *     - Caption (optional, nur bei Mono+Editorial — Photo-Caption "fig. 01 · ...")
 *
 *   Variante C (Full Bleed / Cinematic):
 *     - Hero-Bild (1×)
 *     - Eyebrow
 *     - Volume (Untertitel oben rechts, Default "Vol. I · MMXXVI")
 *
 * Für alle Stile reicht ein einziges Bild — Cloudinary erzeugt 5 Aspect-Ratios
 * automatisch (--img-base, --img-portrait, --img-square, --img-wide, --img-tall),
 * je nach Stil wird die passende Variante eingesetzt.
 *
 * Auto-Save: Bild sofort nach Upload, Text-Felder debounced 1500ms.
 */

interface Props {
  slug: string;
  variant: 'a' | 'b' | 'c';
  initial: {
    hero_image_url: string | null;
    eyebrow: string;
    intro: string;
    volume: string;
    caption: string;
  };
}

export default function HeroEditor({ slug, variant, initial }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);

  const [heroImage, setHeroImage] = useState<string | null>(initial.hero_image_url);
  const [eyebrow, setEyebrow] = useState(initial.eyebrow);
  const [intro, setIntro] = useState(initial.intro);
  const [volume, setVolume] = useState(initial.volume);
  const [caption, setCaption] = useState(initial.caption);

  useEffect(() => {
    if (status === 'ok') {
      const t = setTimeout(() => setStatus('idle'), 1800);
      return () => clearTimeout(t);
    }
  }, [status]);

  // Folder pro Hochzeit, damit Cloudinary übersichtlich bleibt.
  const heroFolder = `sarahiver.de/${slug}/hero`;

  // ====================================================================
  // Hero-Bild — sofortiger Save nach Cloudinary-Upload
  // ====================================================================
  const handleHeroUpload = (url: string | null) => {
    setHeroImage(url);
    setStatus('saving');
    setErrText(null);
    startTransition(async () => {
      const res = await updateHeroImage({ slug, imageUrl: url });
      if (res.ok) {
        setStatus('ok');
        window.dispatchEvent(new Event('dashboard:editor-saved'));
        router.refresh();
      } else {
        setStatus('err');
        setErrText(res.error || 'Konnte nicht gespeichert werden.');
      }
    });
  };

  // ====================================================================
  // Text-Felder — debounced 1500ms
  // ====================================================================
  const latestRef = useRef({ eyebrow, intro, volume, caption });
  latestRef.current = { eyebrow, intro, volume, caption };

  const doSaveContent = useCallback(
    (override: Partial<typeof latestRef.current>) => {
      setStatus('saving');
      setErrText(null);
      const ref = latestRef.current;
      const patch: Record<string, string> = {
        eyebrow: override.eyebrow ?? ref.eyebrow,
        intro: override.intro ?? ref.intro,
        volume: override.volume ?? ref.volume,
        caption: override.caption ?? ref.caption,
      };
      startTransition(async () => {
        const res = await updateBereichContent({
          slug,
          bereich_key: 'hero',
          contentPatch: patch,
        });
        if (res.ok) {
          setStatus('ok');
          window.dispatchEvent(new Event('dashboard:editor-saved'));
          router.refresh();
        } else {
          setStatus('err');
          setErrText(res.error || 'Konnte nicht gespeichert werden.');
        }
      });
    },
    [slug, router],
  );

  const debounceRef = useRef<number | null>(null);
  const scheduleSave = (override: Partial<typeof latestRef.current>) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => doSaveContent(override), 1500);
  };

  const handleEyebrowChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setEyebrow(v);
    scheduleSave({ eyebrow: v });
  };
  const handleIntroChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setIntro(v);
    scheduleSave({ intro: v });
  };
  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setVolume(v);
    scheduleSave({ volume: v });
  };
  const handleCaptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setCaption(v);
    scheduleSave({ caption: v });
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="dash-form">
      <SaveStatusIndicator status={status} errText={errText} />

      {/* ==================================================================
          BILD — bei allen 3 Variants 1× Hero-Bild
          ================================================================== */}
      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Hauptbild</h3>
        <p className="dash-form-section-desc">
          Das große Foto eurer Startseite. Tipp: Ein Bild mit zentralem Motiv reicht — je nach
          Stil wird automatisch das Hoch-, Quer- oder Quadrat-Crop genutzt. Empfohlen:
          hochauflösend (mindestens 2000px), gut belichtet, Motiv mittig.
        </p>
        <ImageUploader
          image={heroImage}
          folder={heroFolder}
          ratio="16/9"
          label="Hero-Bild"
          onUpload={handleHeroUpload}
        />
      </section>

      {/* ==================================================================
          EYEBROW — bei allen 3 Variants
          ================================================================== */}
      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Text</h3>
        <div className="dash-form-field">
          <label className="dash-form-label" htmlFor="hero-eyebrow">
            Eyebrow
          </label>
          <input
            id="hero-eyebrow"
            type="text"
            className="dash-input"
            value={eyebrow}
            onChange={handleEyebrowChange}
            placeholder={
              variant === 'a'
                ? 'Save the date'
                : variant === 'b'
                ? 'Wir heiraten'
                : 'Save the Date'
            }
            maxLength={60}
          />
          <p className="dash-form-hint">
            Kurzer Text über euren Namen — z.B. „Save the date" oder „Wir heiraten".
          </p>
        </div>

        {/* ==================================================================
            VARIANT B — Intro + optionale Foto-Caption
            ================================================================== */}
        {variant === 'b' && (
          <>
            <div className="dash-form-field">
              <label className="dash-form-label" htmlFor="hero-intro">
                Intro-Text (optional)
              </label>
              <textarea
                id="hero-intro"
                className="dash-input"
                value={intro}
                onChange={handleIntroChange}
                placeholder="Wir freuen uns, mit euch zu feiern. Hier findet ihr alle Infos…"
                rows={3}
                maxLength={300}
              />
              <p className="dash-form-hint">
                Kurzer Begrüßungstext unter euren Namen — wird im Text-Block angezeigt.
                Maximal 1–2 Sätze. Leer lassen für minimalen Look.
              </p>
            </div>

            <div className="dash-form-field">
              <label className="dash-form-label" htmlFor="hero-caption">
                Foto-Caption (optional)
              </label>
              <input
                id="hero-caption"
                type="text"
                className="dash-input"
                value={caption}
                onChange={handleCaptionChange}
                placeholder="z.B. Sommer 2025, Hamburg"
                maxLength={80}
              />
              <p className="dash-form-hint">
                Kleine Caption neben dem Foto — wird nur bei den Stilen <strong>Editorial</strong>
                {' '}und <strong>Mono</strong> angezeigt (Magazine-Style). Leer = automatischer
                Default aus euren Namen.
              </p>
            </div>
          </>
        )}

        {/* ==================================================================
            VARIANT C — Volume (Untertitel oben rechts)
            ================================================================== */}
        {variant === 'c' && (
          <div className="dash-form-field">
            <label className="dash-form-label" htmlFor="hero-volume">
              Volume (Untertitel rechts oben)
            </label>
            <input
              id="hero-volume"
              type="text"
              className="dash-input"
              value={volume}
              onChange={handleVolumeChange}
              placeholder="Vol. I · MMXXVI"
              maxLength={40}
            />
            <p className="dash-form-hint">
              Kleiner Magazin-Untertitel rechts oben — Default ist „Vol. I · MMXXVI". Hier
              kannst du eine eigene Variante setzen, z.B. „N° 01 · 2026" oder „Hamburg ’26".
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
