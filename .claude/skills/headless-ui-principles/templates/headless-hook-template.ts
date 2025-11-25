/**
 * ヘッドレスフック テンプレート
 *
 * 使用方法:
 * 1. {{HookName}} を実際のフック名に置換（例: useDialog）
 * 2. 状態とロジックをカスタマイズ
 * 3. 返却するpropsを調整
 */

import {
  useState,
  useCallback,
  useId,
  useRef,
  useEffect,
  KeyboardEvent,
  RefObject,
} from 'react';

// =============================================================================
// 型定義
// =============================================================================

export interface Use{{HookName}}Options {
  /** 初期状態 */
  defaultOpen?: boolean;
  /** 制御モード用の状態 */
  open?: boolean;
  /** 状態変更コールバック */
  onOpenChange?: (open: boolean) => void;
  /** Escapeキーでクローズするか */
  closeOnEscape?: boolean;
  /** 外部クリックでクローズするか */
  closeOnOutsideClick?: boolean;
}

export interface Use{{HookName}}Return {
  /** 現在の開閉状態 */
  isOpen: boolean;
  /** 開く */
  open: () => void;
  /** 閉じる */
  close: () => void;
  /** トグル */
  toggle: () => void;
  /** トリガー要素のprops */
  triggerProps: {
    'aria-haspopup': 'dialog';
    'aria-expanded': boolean;
    'aria-controls': string;
    onClick: () => void;
  };
  /** コンテンツ要素のprops */
  contentProps: {
    id: string;
    role: 'dialog';
    'aria-modal': boolean;
    'aria-labelledby': string;
    ref: RefObject<HTMLDivElement>;
  };
  /** タイトル要素のprops */
  titleProps: {
    id: string;
  };
  /** 説明要素のprops */
  descriptionProps: {
    id: string;
  };
}

// =============================================================================
// ユーティリティフック
// =============================================================================

/**
 * 制御/非制御ステート管理
 */
function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, (value: T) => void] {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: T) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [isControlled, onChange]
  );

  return [currentValue, setValue];
}

/**
 * クリック外検出
 */
function useClickOutside(
  ref: RefObject<HTMLElement>,
  handler: () => void,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}

/**
 * Escapeキー検出
 */
function useEscapeKey(handler: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handler();
      }
    };

    document.addEventListener('keydown', listener as any);
    return () => document.removeEventListener('keydown', listener as any);
  }, [handler, enabled]);
}

// =============================================================================
// メインフック
// =============================================================================

export function use{{HookName}}(
  options: Use{{HookName}}Options = {}
): Use{{HookName}}Return {
  const {
    defaultOpen = false,
    open: controlledOpen,
    onOpenChange,
    closeOnEscape = true,
    closeOnOutsideClick = true,
  } = options;

  // ID生成
  const id = useId();
  const contentId = `{{hookName}}-content-${id}`;
  const titleId = `{{hookName}}-title-${id}`;
  const descriptionId = `{{hookName}}-description-${id}`;

  // 状態管理
  const [isOpen, setIsOpen] = useControllableState({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  // Ref
  const contentRef = useRef<HTMLDivElement>(null);

  // 操作
  const open = useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);
  const toggle = useCallback(() => setIsOpen(!isOpen), [isOpen, setIsOpen]);

  // イベントハンドラ
  useEscapeKey(close, isOpen && closeOnEscape);
  useClickOutside(contentRef, close, isOpen && closeOnOutsideClick);

  // フォーカス管理
  useEffect(() => {
    if (isOpen) {
      // オープン時にコンテンツにフォーカス
      const focusableElement = contentRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusableElement?.focus();
    }
  }, [isOpen]);

  return {
    isOpen,
    open,
    close,
    toggle,
    triggerProps: {
      'aria-haspopup': 'dialog',
      'aria-expanded': isOpen,
      'aria-controls': contentId,
      onClick: toggle,
    },
    contentProps: {
      id: contentId,
      role: 'dialog',
      'aria-modal': true,
      'aria-labelledby': titleId,
      ref: contentRef,
    },
    titleProps: {
      id: titleId,
    },
    descriptionProps: {
      id: descriptionId,
    },
  };
}

// =============================================================================
// 使用例
// =============================================================================

/*
import { use{{HookName}} } from './use{{HookName}}';

function {{HookName}}Example() {
  const {
    isOpen,
    triggerProps,
    contentProps,
    titleProps,
    descriptionProps,
    close,
  } = use{{HookName}}({
    defaultOpen: false,
    closeOnEscape: true,
    closeOnOutsideClick: true,
  });

  return (
    <>
      <button {...triggerProps} className="btn">
        Open {{HookName}}
      </button>

      {isOpen && (
        <div className="overlay">
          <div {...contentProps} className="content">
            <h2 {...titleProps}>タイトル</h2>
            <p {...descriptionProps}>説明テキスト</p>
            <button onClick={close}>閉じる</button>
          </div>
        </div>
      )}
    </>
  );
}
*/

// =============================================================================
// 制御モード使用例
// =============================================================================

/*
function Controlled{{HookName}}Example() {
  const [open, setOpen] = useState(false);

  const { triggerProps, contentProps, titleProps } = use{{HookName}}({
    open,
    onOpenChange: setOpen,
  });

  return (
    <>
      <button {...triggerProps}>Open</button>
      {open && (
        <div {...contentProps}>
          <h2 {...titleProps}>制御モード</h2>
          <button onClick={() => setOpen(false)}>閉じる</button>
        </div>
      )}
    </>
  );
}
*/
