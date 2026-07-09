import { useEffect } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

// Match any fixed/z-50 overlay that isn't the Radix/pixar overlay (which
// handles its own a11y). We deliberately do NOT require `.inset-0` because
// most modals in this app render the backdrop as `.fixed.inset-0.z-50` and
// the actual content panel as a *sibling* `.fixed.z-50` with `.inset-x-2`
// / `.top-1/2` etc. — the panel is what we need to trap focus inside.
// Exclude the pixar overlay (handles its own a11y) AND transient
// non-modal notifications (achievement popups, phase-up banners) which
// should not trap focus or lock scroll.
const CUSTOM_MODAL_SELECTOR =
  '.fixed.z-50:not(.pixar-modal-overlay):not([data-non-modal])';
// Backdrops (used to dispatch a click on Escape, since each backdrop already
// wires an `onClose` handler in JSX).
const BACKDROP_SELECTOR =
  '.fixed.inset-0.z-50:not(.pixar-modal-overlay), .fixed.inset-0.z-40:not(.pixar-modal-overlay)';

const getFocusable = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute('disabled') && element.offsetParent !== null,
  );

export function GlobalModalA11y() {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    let activeModal: HTMLElement | null = null;
    let previousActive: HTMLElement | null = null;
    let previousBodyStyles: Partial<CSSStyleDeclaration> | null = null;
    let scrollY = 0;

    const lockScroll = () => {
      if (previousBodyStyles) return;
      scrollY = window.scrollY;
      previousBodyStyles = {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width,
        touchAction: document.body.style.touchAction,
      };
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.touchAction = 'none';
    };

    const unlockScroll = () => {
      if (!previousBodyStyles) return;
      document.body.style.overflow = previousBodyStyles.overflow ?? '';
      document.body.style.position = previousBodyStyles.position ?? '';
      document.body.style.top = previousBodyStyles.top ?? '';
      document.body.style.width = previousBodyStyles.width ?? '';
      document.body.style.touchAction = previousBodyStyles.touchAction ?? '';
      window.scrollTo(0, scrollY);
      previousBodyStyles = null;
    };

    const activateModal = (modal: HTMLElement | null) => {
      if (modal === activeModal) return;

      if (!modal) {
        unlockScroll();
        previousActive?.focus?.({ preventScroll: true });
        previousActive = null;
        activeModal = null;
        return;
      }

      previousActive = document.activeElement as HTMLElement | null;
      activeModal = modal;
      activeModal.setAttribute('role', activeModal.getAttribute('role') || 'dialog');
      activeModal.setAttribute('aria-modal', 'true');
      activeModal.tabIndex = activeModal.tabIndex >= 0 ? activeModal.tabIndex : -1;
      lockScroll();

      window.requestAnimationFrame(() => {
        const focusable = getFocusable(activeModal!);
        (focusable[0] ?? activeModal!).focus({ preventScroll: true });
      });
    };

    const scan = () => {
      const candidates = Array.from(document.querySelectorAll<HTMLElement>(CUSTOM_MODAL_SELECTOR)).filter(
        (element) => element.offsetParent !== null,
      );
      // Prefer the topmost panel that actually contains focusable controls —
      // this skips empty backdrops and picks the real modal content.
      const withFocusables = candidates.filter((el) => getFocusable(el).length > 0);
      activateModal((withFocusables.at(-1) ?? candidates.at(-1)) ?? null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!activeModal) return;

      if (event.key === 'Escape') {
        // Trigger the modal's own close handler by dispatching a click on
        // its backdrop — every modal's backdrop already binds `onClose`.
        const backdrops = Array.from(
          document.querySelectorAll<HTMLElement>(BACKDROP_SELECTOR),
        ).filter((el) => el.offsetParent !== null);
        const backdrop = backdrops.at(-1);
        if (backdrop) {
          event.preventDefault();
          backdrop.click();
        }
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusable(activeModal);
      if (focusable.length === 0) {
        event.preventDefault();
        activeModal.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleKeyDown);
      activateModal(null);
    };
  }, []);

  return null;
}
