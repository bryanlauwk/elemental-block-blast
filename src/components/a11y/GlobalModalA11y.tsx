import { useEffect } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const CUSTOM_MODAL_SELECTOR = '.fixed.inset-0.z-50:not(.pixar-modal-overlay)';

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
      const modals = Array.from(document.querySelectorAll<HTMLElement>(CUSTOM_MODAL_SELECTOR)).filter(
        (element) => element.offsetParent !== null,
      );
      activateModal(modals.at(-1) ?? null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!activeModal || event.key !== 'Tab') return;

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
