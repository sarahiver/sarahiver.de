'use client';

import { useState, useTransition, type ReactNode, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { bereichLabel } from '@/lib/dashboard-nav';
import type { BereichKey } from '@/types/supabase';
import { reorderBereiche, setBereichVariant, toggleBereichActive } from './actions';
import DashboardIcon from '@/components/dashboard/DashboardIcon';

/**
 * Bereiche-Verwaltungsliste mit Drag-Drop, Varianten-Switch und An/Aus-Toggle.
 *
 * Layout:
 *  - Hero oben fixiert (nicht verschiebbar, kein Toggle)
 *  - Variable Bereiche dazwischen (sortable, mit Drop-Indikator)
 *  - Footer kommt später unten fixiert
 *
 * Speichert sofort bei jeder Aktion (optimistic UI). Bei Fehler wird der
 * State zurückgerollt und eine Fehler-Notiz gezeigt. Custom Event triggert
 * iframe-Reload in der Live-Vorschau rechts.
 */

interface BereichItem {
  id: string; // wedding_bereiche.id (für stabile Keys bei Reordering)
  bereich_key: BereichKey;
  variant: 'a' | 'b' | 'c';
  is_active: boolean;
  display_order: number;
}

interface Props {
  slug: string;
  initialBereiche: BereichItem[];
}

const FIXED_KEYS: BereichKey[] = ['hero']; // Footer später

export default function BereicheListe({ slug, initialBereiche }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [items, setItems] = useState<BereichItem[]>(initialBereiche);

  // Fixierte oben/unten separieren
  const fixedTop = items.filter((b) => FIXED_KEYS.includes(b.bereich_key));
  const sortable = items.filter((b) => !FIXED_KEYS.includes(b.bereich_key));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const notify = (type: 'ok' | 'err', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 2400);
  };

  const fireSavedEvent = () => {
    window.dispatchEvent(new Event('dashboard:editor-saved'));
  };

  // === DRAG END
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIdx = sortable.findIndex((b) => b.id === active.id);
    const newIdx = sortable.findIndex((b) => b.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    const reordered = arrayMove(sortable, oldIdx, newIdx);
    const newItems = [...fixedTop, ...reordered];
    const previous = items;
    setItems(newItems); // optimistic

    startTransition(async () => {
      const res = await reorderBereiche({
        slug,
        orderedKeys: reordered.map((b) => b.bereich_key),
      });
      if (res.ok) {
        notify('ok', 'Reihenfolge gespeichert.');
        fireSavedEvent();
        router.refresh();
      } else {
        setItems(previous); // rollback
        notify('err', res.error || 'Konnte nicht gespeichert werden.');
      }
    });
  };

  // === VARIANTE
  const onVariantChange = (bereichKey: BereichKey, variant: 'a' | 'b' | 'c') => {
    const previous = items;
    setItems((curr) =>
      curr.map((b) => (b.bereich_key === bereichKey ? { ...b, variant } : b)),
    );
    startTransition(async () => {
      const res = await setBereichVariant({ slug, bereich_key: bereichKey, variant });
      if (res.ok) {
        notify('ok', `Variante geändert: ${bereichLabel(bereichKey)} → ${variant.toUpperCase()}`);
        fireSavedEvent();
        router.refresh();
      } else {
        setItems(previous);
        notify('err', res.error || 'Konnte nicht gespeichert werden.');
      }
    });
  };

  // === TOGGLE
  const onToggleActive = (bereichKey: BereichKey, is_active: boolean) => {
    const previous = items;
    setItems((curr) =>
      curr.map((b) => (b.bereich_key === bereichKey ? { ...b, is_active } : b)),
    );
    startTransition(async () => {
      const res = await toggleBereichActive({ slug, bereich_key: bereichKey, is_active });
      if (res.ok) {
        notify('ok', `${bereichLabel(bereichKey)} ${is_active ? 'aktiviert' : 'deaktiviert'}`);
        fireSavedEvent();
        router.refresh();
      } else {
        setItems(previous);
        notify('err', res.error || 'Konnte nicht gespeichert werden.');
      }
    });
  };

  return (
    <div className="dash-bereiche-list">
      <p className="dash-help-text">
        Zieht die Bereiche per Drag-and-Drop in die gewünschte Reihenfolge. Hero bleibt oben,
        weitere Pflicht-Bereiche kommen später hinzu. Änderungen werden sofort gespeichert.
      </p>

      {/* Hero (fixiert oben) */}
      {fixedTop.map((b) => (
        <BereichRow
          key={b.id}
          item={b}
          locked
          pending={pending}
          onVariantChange={onVariantChange}
          onToggleActive={onToggleActive}
          slug={slug}
        />
      ))}

      {/* Sortable Bereiche */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={sortable.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {sortable.map((b) => (
            <SortableBereichRow
              key={b.id}
              item={b}
              pending={pending}
              onVariantChange={onVariantChange}
              onToggleActive={onToggleActive}
              slug={slug}
            />
          ))}
        </SortableContext>
      </DndContext>

      {msg && (
        <div className={`dash-toast ${msg.type === 'ok' ? 'is-ok' : 'is-err'}`}>{msg.text}</div>
      )}
    </div>
  );
}

// ====================================================================
// Row (mit und ohne Sortable-Wrapper)
// ====================================================================

interface RowProps {
  item: BereichItem;
  pending: boolean;
  locked?: boolean;
  onVariantChange: (key: BereichKey, variant: 'a' | 'b' | 'c') => void;
  onToggleActive: (key: BereichKey, is_active: boolean) => void;
  slug: string;
}

function BereichRow({
  item,
  pending,
  locked,
  onVariantChange,
  onToggleActive,
  slug,
  dragHandle,
  setRef,
  style,
  isDragging,
}: RowProps & {
  dragHandle?: ReactNode;
  setRef?: (el: HTMLElement | null) => void;
  style?: CSSProperties;
  isDragging?: boolean;
}) {
  const label = bereichLabel(item.bereich_key);
  return (
    <div
      ref={setRef}
      style={style}
      className={`dash-bereich-row ${item.is_active ? '' : 'is-inactive'} ${isDragging ? 'is-dragging' : ''}`}
    >
      <div className="dash-bereich-row-grab">
        {locked ? (
          <span className="dash-bereich-row-lock" aria-label="Fixiert">
            <DashboardIcon name="layers" size={14} />
          </span>
        ) : (
          dragHandle
        )}
      </div>

      <div className="dash-bereich-row-body">
        <span className="dash-bereich-row-name">{label}</span>
        {locked && <span className="dash-bereich-row-meta">Pflicht-Bereich</span>}
      </div>

      <div className="dash-bereich-row-controls">
        {/* Variante */}
        <label className="dash-bereich-variant-select">
          <span className="dash-bereich-variant-label">Variante</span>
          <select
            value={item.variant}
            onChange={(e) => onVariantChange(item.bereich_key, e.target.value as 'a' | 'b' | 'c')}
            disabled={pending || !item.is_active}
          >
            <option value="a">A</option>
            <option value="b">B</option>
            <option value="c">C</option>
          </select>
        </label>

        {/* Editor-Link */}
        <a
          href={`/dashboard/${slug}/bereiche/${item.bereich_key}`}
          className="dash-bereich-row-edit"
          title="Inhalte bearbeiten"
        >
          <DashboardIcon name="pencil" size={14} />
        </a>

        {/* An/Aus */}
        {!locked && (
          <button
            type="button"
            className={`dash-toggle ${item.is_active ? 'is-on' : ''}`}
            onClick={() => onToggleActive(item.bereich_key, !item.is_active)}
            disabled={pending}
            aria-label={item.is_active ? 'Deaktivieren' : 'Aktivieren'}
          >
            <span className="dash-toggle-knob" />
          </button>
        )}
      </div>
    </div>
  );
}

function SortableBereichRow(props: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.item.id,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragHandle = (
    <button
      type="button"
      className="dash-bereich-row-handle"
      aria-label="Bereich verschieben"
      {...attributes}
      {...listeners}
    >
      <DragHandleIcon />
    </button>
  );

  return (
    <BereichRow
      {...props}
      dragHandle={dragHandle}
      setRef={setNodeRef}
      style={style}
      isDragging={isDragging}
    />
  );
}

function DragHandleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <circle cx="4" cy="3" r="1.3" />
      <circle cx="10" cy="3" r="1.3" />
      <circle cx="4" cy="7" r="1.3" />
      <circle cx="10" cy="7" r="1.3" />
      <circle cx="4" cy="11" r="1.3" />
      <circle cx="10" cy="11" r="1.3" />
    </svg>
  );
}
