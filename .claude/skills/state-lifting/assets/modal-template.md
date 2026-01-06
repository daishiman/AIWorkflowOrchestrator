# モーダルコンポーネントテンプレート

## 概要

モーダルコンポーネントは、オーバーレイ付きのダイアログを実装するUI。
Portal、ESCキー対応、背景スクロール防止を含む完全なモーダル機能を提供。

## 構造

```typescript
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';

// Context
interface ModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

// Root
interface ModalProps {
  children: ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

function Modal({ children, defaultOpen = false, onOpenChange }: ModalProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = () => {
    setIsOpen(true);
    onOpenChange?.(true);
  };

  const close = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  return (
    <ModalContext.Provider value={{ isOpen, open, close }}>
      {children}
    </ModalContext.Provider>
  );
}

// Trigger
function Trigger({ children }: { children: ReactNode }) {
  const context = useContext(ModalContext);
  if (!context) throw new Error('Modal.Trigger must be used within Modal');
  return (
    <button onClick={context.open} type="button">
      {children}
    </button>
  );
}

// Content（Portal + Overlay + 本体）
function Content({ children, className }: { children: ReactNode; className?: string }) {
  const context = useContext(ModalContext);
  if (!context) throw new Error('Modal.Content must be used within Modal');

  // ESCキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') context.close();
    };
    if (context.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [context.isOpen, context]);

  // 背景スクロール防止
  useEffect(() => {
    if (context.isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [context.isOpen]);

  if (!context.isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={context.close}>
      <div
        className={`modal-content ${className ?? ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

// Close Button
function Close({ children }: { children?: ReactNode }) {
  const context = useContext(ModalContext);
  if (!context) throw new Error('Modal.Close must be used within Modal');
  return (
    <button className="modal-close" onClick={context.close} aria-label="Close">
      {children ?? '×'}
    </button>
  );
}

// Header, Body, Footer
function Header({ children }: { children: ReactNode }) {
  return <div className="modal-header">{children}</div>;
}

function Body({ children }: { children: ReactNode }) {
  return <div className="modal-body">{children}</div>;
}

function Footer({ children }: { children: ReactNode }) {
  return <div className="modal-footer">{children}</div>;
}

// 紐付け
Modal.Trigger = Trigger;
Modal.Content = Content;
Modal.Close = Close;
Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;
```

## 使用例

```typescript
function App() {
  return (
    <Modal onOpenChange={(open) => console.log(`Modal ${open ? 'opened' : 'closed'}`)}>
      <Modal.Trigger>モーダルを開く</Modal.Trigger>

      <Modal.Content>
        <Modal.Header>
          <h2>確認</h2>
          <Modal.Close />
        </Modal.Header>

        <Modal.Body>
          <p>この操作を実行しますか？</p>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Close>
            <button>キャンセル</button>
          </Modal.Close>
          <button onClick={() => console.log('Confirmed')}>確認</button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
```

## 実装のポイント

- **createPortal**: body直下にレンダリングしてz-index問題を回避
- **ESCキー対応**: useEffectでキーボードイベントをリッスン
- **背景スクロール防止**: document.body.style.overflow制御
- **オーバーレイクリック**: stopPropagationで内部クリックを区別
- **ARIA対応**: role="dialog", aria-modal="true"
- **Header/Body/Footer分離**: 柔軟なレイアウト構成
