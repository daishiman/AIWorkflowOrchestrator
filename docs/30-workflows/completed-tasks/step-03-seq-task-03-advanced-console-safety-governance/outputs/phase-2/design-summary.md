# Phase 2 設計サマリー

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| タスクID  | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase     | 2                                               |
| 作成日    | 2026-03-24                                      |
| 依存Phase | Phase 1                                         |

## 設計結論

### アーキテクチャ概観

```
┌─────────────────────────────────────────────────────┐
│  Renderer (React)                                   │
│  ┌───────────────┐  ┌──────────────────────┐       │
│  │ Approval      │  │ Session Disclosure   │       │
│  │ Sheet         │  │ Banner               │       │
│  └──────┬────────┘  └──────────┬───────────┘       │
│         │                      │                    │
│  ┌──────┴──────────────────────┴───────────┐       │
│  │  ExecutionConsoleView                    │       │
│  │  ┌─────────────────────────────────┐    │       │
│  │  │ Session Dock (Task02 state)     │    │       │
│  │  └─────────────────────────────────┘    │       │
│  │  ┌─────────────────────────────────┐    │       │
│  │  │ Advanced Console Panel (opt-in) │    │       │
│  │  └─────────────────────────────────┘    │       │
│  └─────────────────────────────────────────┘       │
│                       │ IPC (safeInvoke)            │
├───────────────────────┼─────────────────────────────┤
│  Preload              │ contextBridge               │
├───────────────────────┼─────────────────────────────┤
│  Main Process         │                             │
│  ┌────────────────────┴────────────────────────┐   │
│  │ Approval Enforcement Gate                    │   │
│  │ (承認済みフラグなしでは実行拒否)             │   │
│  └──────────────┬──────────────────────────┬────┘   │
│  ┌──────────────┴───────┐ ┌────────────────┴────┐   │
│  │ RuntimePolicyResolver│ │TerminalHandlers     │   │
│  │ (lane authority)     │ │(external terminal)  │   │
│  └──────────────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 設計方針

| 方針                           | 決定                                         | 根拠                              |
| ------------------------------ | -------------------------------------------- | --------------------------------- |
| Approval の位置                | Renderer + Main の2層                        | 多層防御（DevTools バイパス対策） |
| Disclosure の表示タイミング    | Session State `ready` 遷移時                 | Task02 state machine 準拠         |
| Advanced Console の起動方式    | opt-in toggle（secondary CTA）               | design-audit-matrix 棄却案準拠    |
| Manual Boundary の enforcement | Main Process で IPC を提供しない方式         | 消極的 enforcement（最も安全）    |
| Consumer auth guard            | Main Process で claude.ai token 受け入れ拒否 | DENY-1 準拠                       |

### コンポーネント設計

#### 1. ApprovalSheet

```typescript
// 設計契約（型定義）
interface ApprovalSheetProps {
  /** 承認対象の操作種別 */
  operationType: "dangerous_operation" | "external_send";
  /** 操作の説明（ユーザー向け） */
  description: string;
  /** 外部送信の場合の送信先 */
  destination?: string;
  /** 承認コールバック */
  onApprove: () => void;
  /** 拒否コールバック */
  onReject: () => void;
  /** 詳細表示コールバック */
  onShowDetails?: () => void;
}
```

- 表示条件: `ready` state で「実行する」CTA 押下後、実行前に表示
- 表示条件: `handoff` state で「端末で続ける」CTA 押下後、handoff 前に表示
- 停止方法: 「中止」ボタンを常に表示

#### 2. SessionDisclosureBanner

```typescript
interface SessionDisclosureBannerProps {
  /** AI モデル/サービス名 */
  aiServiceName: string;
  /** 外部送信先の種別リスト */
  externalDestinations: string[];
  /** dismiss コールバック */
  onDismiss: () => void;
  /** 再表示導線の有無 */
  canReopen: boolean;
}
```

- 表示タイミング: Session State が `collapsed` → `ready` に遷移した時点
- dismiss: ユーザーが閉じ可能。Session Dock のヘッダーに再表示アイコンを配置
- 内容: AI 利用 + 外部送信可能性の2点を1つのバナーで開示

#### 3. AdvancedConsolePanel

```typescript
interface AdvancedConsolePanelProps {
  /** パネル表示状態 */
  isOpen: boolean;
  /** toggle コールバック */
  onToggle: () => void;
  /** raw terminal ログ */
  terminalOutput: string[];
  /** copy command */
  copyCommand?: string;
}
```

- 表示条件: ユーザーが「高度な表示」を明示的に選択した場合のみ
- 配置: ExecutionConsoleView 内の collapse 可能なパネル
- CTA レベル: secondary または tertiary（primary CTA にしない）

## Session State との統合マトリクス

| State         | Disclosure Banner | Approval Sheet     | Advanced Console | Primary CTA      |
| ------------- | ----------------- | ------------------ | ---------------- | ---------------- |
| collapsed     | 非表示            | 非表示             | 非表示           | 「開く」         |
| ready         | 初回表示          | 「実行する」押下時 | opt-in toggle    | 「実行する」     |
| handoff       | 表示維持          | 「端末で続ける」時 | opt-in toggle    | 「端末で続ける」 |
| running       | 表示維持          | 非表示             | opt-in toggle    | 「中止」         |
| done          | 表示維持          | 非表示             | opt-in toggle    | 「成果物を見る」 |
| aborted       | 表示維持          | 非表示             | opt-in toggle    | 「やり直す」     |
| unavailable   | 非表示            | 非表示             | 非表示           | 「設定を見る」   |
| guidance-only | guidance 開示     | 非表示             | 非表示           | 「案内を見る」   |
