'use client';

import { useCallback, useEffect, useRef, useState, useTransition, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { updateHeroImage, updateBereichContent } from './actions';
import ImageUploader from '@/components/dashboard/ImageUploader';
import SaveStatusIndicator, { type SaveStatus } from '@/components/dashboard/SaveStatusIndicator';

/**
 * Hero-Editor:
 *  - Hero-Bild (Cloudinary-Upload, schreibt wedding_sites.hero_image_url)
 *  - Eyebrow-Text ("Save the date", "Wir heiraten", …) → wedding_bereiche.content.eyebrow
 *  - Bei Variante C: zweites Bild → wedding_bereiche.content.image_2
 *
 * Auto-Save: Bild-Upload sofort (Cloudinary-Upload ist schon nicht-trivial,
 * nach Abschluss direkt persistieren). Text-Felder debounced 1500ms.
 */

interface Props {
  slug: string;
  variant: 'a' | 'b' | 'c';
  initial: {
    hero_image_url: string | null;
    eyebrow: string;
    image_2: string | null;
  };
}

export default function HeroEditor({ slug, variant, initial }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errText, setErrText] = useState<string | null>(null);

  const [heroImage, setHeroImage] = useState<string | null>(initial.hero_image_url);
  const [eyebrow, setEyebrow] = useState(initial.eyebrow);
  const [image2, setImage2] = useState<string | null>(initial.image_2);

  useEffect(() => {
    if (status === 'ok') {
      const t = setTimeout(() => setStatus('idle'), 1800);
      return () => clearTimeout(t);
    }
  }, [status]);

  // Folder pro Hochzeit, damit Cloudinary übersichtlich bleibt
  const heroFolder = `weddings/${slug}/hero`;

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
  // Image-2 (Variante C) — sofortiger Save nach Cloudinary-Upload
  // ====================================================================
  const handleImage2Upload = (url: string | null) => {
    const previousImage2 = image2;
    setImage2(url);
    setStatus('saving');
    setErrText(null);
    startTransition(async () => {
      const res = await updateBereichContent({
        slug,
        bereich_key: 'hero',
        contentPatch: { image_2: url },
        cleanupUrls: previousImage2 && previousImage2 !== url ? [previousImage2] : [],
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
  };

  // ====================================================================
  // Eyebrow — debounced 1500ms
  // ====================================================================
  const latestRef = useRef({ eyebrow });
  latestRef.current = { eyebrow };

  const doSaveEyebrow = useCallback(() => {
    setStatus('saving');
    setErrText(null);
    startTransition(async () => {
      const res = await updateBereichContent({
        slug,
        bereich_key: 'hero',
        contentPatch: { eyebrow: latestRef.current.eyebrow },
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
  }, [slug, router]);

  const debounceRef = useRef<number | null>(null);
  const handleEyebrowChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEyebrow(e.target.value);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(doSaveEyebrow, 1500);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="dash-form">
      <SaveStatusIndicator status={status} errText={errText} />

      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Hauptbild</h3>
        <p className="dash-form-section-desc">
          Das große Foto eurer Startseite. Empfohlen: hochauflösendes Querformat, mindestens
          2000px breit, gut belichtet.
        </p>
        <ImageUploader
          image={heroImage}
          folder={heroFolder}
          ratio="16/9"
          label="Hero-Bild"
          onUpload={handleHeroUpload}
        />
      </section>

      {variant === 'c' && (
        <section className="dash-form-section">
          <h3 className="dash-form-section-title">Zweites Bild</h3>
          <p className="dash-form-section-desc">
            Variante C zeigt zwei Bilder nebeneinander. Lasst dieses Feld leer, dann wird das
            Hauptbild verdoppelt.
          </p>
          <ImageUploader
            image={image2}
            folder={heroFolder}
            ratio="4/5"
            label="Zweites Bild"
            maxHeight={280}
            onUpload={handleImage2Upload}
          />
        </section>
      )}

      <section className="dash-form-section">
        <h3 className="dash-form-section-title">Text</h3>
        <div className="dash-form-field">
          <label className="dash-form-label" htmlFor="hero-eyebrow">
            Eyebrow (Text über den Namen)
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
                : 'Save the date — sarahiver.de'
            }
          />
          <p className="dash-form-hint">
            Kurzer Text in Großbuchstaben über euren Namen — z.B. „Save the date" oder „Wir
            heiraten".
          </p>
        </div>
      </section>
    </div>
  );
}
