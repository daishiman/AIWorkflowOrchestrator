/**
 * ヘッドレスコンポーネント テンプレート
 *
 * 使用方法:
 * 1. {{ComponentName}} を実際のコンポーネント名に置換
 * 2. 必要なサブコンポーネントを追加/削除
 * 3. ロジックをカスタマイズ
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useId,
  useRef,
  useEffect,
  forwardRef,
  ReactNode,
  ComponentPropsWithoutRef,
  ElementType,
  ForwardedRef,
} from 'react';

// =============================================================================
// 型定義
// =============================================================================

interface {{ComponentName}}ContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  contentId: string;
  titleId: string;
  descriptionId: string;
}

interface {{ComponentName}}RootProps {
  /** 初期状態 */
  defaultOpen?: boolean;
  /** 制御モード用の状態 */
  open?: boolean;
  /** 状態変更コールバック */
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

interface {{ComponentName}}TriggerProps extends ComponentPropsWithoutRef<'button'> {
  /** カスタム要素として使用 */
  asChild?: boolean;
  children: ReactNode;
}

interface {{ComponentName}}ContentProps extends ComponentPropsWithoutRef<'div'> {
  /** ポータルを使用するか */
  portal?: boolean;
  children: ReactNode;
}

interface {{ComponentName}}TitleProps extends ComponentPropsWithoutRef<'h2'> {
  children: ReactNode;
}

interface {{ComponentName}}DescriptionProps extends ComponentPropsWithoutRef<'p'> {
  children: ReactNode;
}

interface {{ComponentName}}CloseProps extends ComponentPropsWithoutRef<'button'> {
  children: ReactNode;
}

// =============================================================================
// Context
// =============================================================================

const {{ComponentName}}Context = createContext<{{ComponentName}}ContextType | null>(null);

function use{{ComponentName}}Context() {
  const context = useContext({{ComponentName}}Context);
  if (!context) {
    throw new Error(
      '{{ComponentName}} compound components must be used within {{ComponentName}}.Root'
    );
  }
  return context;
}

// =============================================================================
// Slot コンポーネント（asChildパターン用）
// =============================================================================

interface SlotProps {
  children: ReactNode;
  [key: string]: any;
}

function Slot({ children, ...props }: SlotProps) {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ...children.props,
    });
  }
  return <>{children}</>;
}

// =============================================================================
// Root コンポーネント
// =============================================================================

function {{ComponentName}}Root({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  children,
}: {{ComponentName}}RootProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const id = useId();
  const contentId = `{{componentName}}-content-${id}`;
  const titleId = `{{componentName}}-title-${id}`;
  const descriptionId = `{{componentName}}-description-${id}`;

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  const open = useCallback(() => setOpen(true), [setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(() => setOpen(!isOpen), [isOpen, setOpen]);

  return (
    <{{ComponentName}}Context.Provider
      value={{
        isOpen,
        open,
        close,
        toggle,
        contentId,
        titleId,
        descriptionId,
      }}
    >
      {children}
    </{{ComponentName}}Context.Provider>
  );
}

// =============================================================================
// Trigger コンポーネント
// =============================================================================

const {{ComponentName}}Trigger = forwardRef<HTMLButtonElement, {{ComponentName}}TriggerProps>(
  function {{ComponentName}}Trigger(
    { asChild, children, onClick, ...props },
    ref
  ) {
    const { isOpen, toggle, contentId } = use{{ComponentName}}Context();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      toggle();
      onClick?.(e);
    };

    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : 'button'}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

// =============================================================================
// Content コンポーネント
// =============================================================================

const {{ComponentName}}Content = forwardRef<HTMLDivElement, {{ComponentName}}ContentProps>(
  function {{ComponentName}}Content(
    { portal = false, children, ...props },
    ref
  ) {
    const { isOpen, close, contentId, titleId, descriptionId } =
      use{{ComponentName}}Context();
    const internalRef = useRef<HTMLDivElement>(null);

    // Escapeキーでクローズ
    useEffect(() => {
      if (!isOpen) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') close();
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, close]);

    // クリック外でクローズ
    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (
          internalRef.current &&
          !internalRef.current.contains(e.target as Node)
        ) {
          close();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, close]);

    if (!isOpen) return null;

    const content = (
      <div
        ref={(node) => {
          (internalRef as any).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        id={contentId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        {...props}
      >
        {children}
      </div>
    );

    if (portal && typeof document !== 'undefined') {
      return ReactDOM.createPortal(content, document.body);
    }

    return content;
  }
);

// =============================================================================
// Title コンポーネント
// =============================================================================

const {{ComponentName}}Title = forwardRef<HTMLHeadingElement, {{ComponentName}}TitleProps>(
  function {{ComponentName}}Title({ children, ...props }, ref) {
    const { titleId } = use{{ComponentName}}Context();

    return (
      <h2 ref={ref} id={titleId} {...props}>
        {children}
      </h2>
    );
  }
);

// =============================================================================
// Description コンポーネント
// =============================================================================

const {{ComponentName}}Description = forwardRef<HTMLParagraphElement, {{ComponentName}}DescriptionProps>(
  function {{ComponentName}}Description({ children, ...props }, ref) {
    const { descriptionId } = use{{ComponentName}}Context();

    return (
      <p ref={ref} id={descriptionId} {...props}>
        {children}
      </p>
    );
  }
);

// =============================================================================
// Close コンポーネント
// =============================================================================

const {{ComponentName}}Close = forwardRef<HTMLButtonElement, {{ComponentName}}CloseProps>(
  function {{ComponentName}}Close({ children, onClick, ...props }, ref) {
    const { close } = use{{ComponentName}}Context();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      close();
      onClick?.(e);
    };

    return (
      <button ref={ref} type="button" onClick={handleClick} {...props}>
        {children}
      </button>
    );
  }
);

// =============================================================================
// Compound Component Export
// =============================================================================

export const {{ComponentName}} = Object.assign({{ComponentName}}Root, {
  Trigger: {{ComponentName}}Trigger,
  Content: {{ComponentName}}Content,
  Title: {{ComponentName}}Title,
  Description: {{ComponentName}}Description,
  Close: {{ComponentName}}Close,
});

export { use{{ComponentName}}Context };

// =============================================================================
// 使用例
// =============================================================================

/*
import { {{ComponentName}} } from './{{ComponentName}}';

// 基本使用
function Example() {
  return (
    <{{ComponentName}}.Root>
      <{{ComponentName}}.Trigger className="btn">
        Open {{ComponentName}}
      </{{ComponentName}}.Trigger>

      <{{ComponentName}}.Content className="content">
        <{{ComponentName}}.Title className="title">
          タイトル
        </{{ComponentName}}.Title>
        <{{ComponentName}}.Description className="description">
          説明テキスト
        </{{ComponentName}}.Description>
        <{{ComponentName}}.Close className="close-btn">
          閉じる
        </{{ComponentName}}.Close>
      </{{ComponentName}}.Content>
    </{{ComponentName}}.Root>
  );
}

// asChildパターン
function AsChildExample() {
  return (
    <{{ComponentName}}.Root>
      <{{ComponentName}}.Trigger asChild>
        <CustomButton variant="primary">
          Open
        </CustomButton>
      </{{ComponentName}}.Trigger>
      <{{ComponentName}}.Content>
        // ...
      </{{ComponentName}}.Content>
    </{{ComponentName}}.Root>
  );
}

// 制御モード
function ControlledExample() {
  const [open, setOpen] = useState(false);

  return (
    <{{ComponentName}}.Root open={open} onOpenChange={setOpen}>
      <button onClick={() => setOpen(true)}>External Open</button>
      <{{ComponentName}}.Content>
        // ...
      </{{ComponentName}}.Content>
    </{{ComponentName}}.Root>
  );
}
*/
