import { RefObject, useEffect } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function useModalA11y(
  modalRef: RefObject<HTMLElement>,
  active: boolean,
  options: { onEscape?: () => void; lockScroll?: boolean } = {},
) {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return;

    const previousActive = document.activeElement as HTMLElement | null;
    const scrollY = window.scrollY;
    const previousBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      touchAction: document.body.style.touchAction,
    };

    if (options.lockScroll !== false) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.touchAction = 'none';
    }

    const focusFirstElement = () => {
      const modal = modalRef.current;
      if (!modal) return;
      const focusable = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter((element) => !element.hasAttribute('disabled') && element.offsetParent !== null);
      (focusable[0] ?? modal).focus({ preventScroll: true });
    };

    const raf = window.requestAnimationFrame(focusFirstElement);

    const handleKeyDown = (event: KeyboardEvent) => {
      const modal = modalRef.current;
      if (!modal) return;

      if (event.key === 'Escape' && options.onEscape) {
        event.preventDefault();
        options.onEscape();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        .filter((element) => !element.hasAttribute('disabled') && element.offsetParent !== null);

      if (focusable.length === 0) {
        event.preventDefault();
        modal.focus({ preventScroll: true });
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

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown);

      if (options.lockScroll !== false) {
        document.body.style.overflow = previousBodyStyles.overflow;
        document.body.style.position = previousBodyStyles.position;
        document.body.style.top = previousBodyStyles.top;
        document.body.style.width = previousBodyStyles.width;
        document.body.style.touchAction = previousBodyStyles.touchAction;
        window.scrollTo(0, scrollY);
      }

      previousActive?.focus?.({ preventScroll: true });
    };
  }, [active, modalRef, options]);
}
