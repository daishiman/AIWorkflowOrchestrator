# アーキテクチャ設計: Custom Execution Environment UI

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | AGENT-006                       |
| タスク名 | Custom Execution Environment UI |
| Phase    | 2                               |
| 作成日   | 2026-01-13                      |

---

## システムアーキテクチャ概要

### 全体構成

```
┌─────────────────────────────────────────────────────────────┐
│                      Renderer Process                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Views Layer                           ││
│  │  ┌───────────────────────────────────────────────────┐  ││
│  │  │              AgentExecutionView                   │  ││
│  │  │  ┌─────────────────────────────────────────────┐  │  ││
│  │  │  │              SplitLayout                    │  │  ││
│  │  │  │   ┌───────────┬──┬───────────────────────┐  │  │  ││
│  │  │  │   │  Chat     │  │  ExecutionEnvironment │  │  │  ││
│  │  │  │   └───────────┴──┴───────────────────────┘  │  │  ││
│  │  │  └─────────────────────────────────────────────┘  │  ││
│  │  └───────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Components Layer                       ││
│  │  ┌───────────┐ ┌────────────────┐ ┌──────────────────┐  ││
│  │  │ Organisms │ │   Molecules    │ │      Atoms       │  ││
│  │  └───────────┘ └────────────────┘ └──────────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    State Layer (Zustand)                ││
│  │  ┌───────────────────────────────────────────────────┐  ││
│  │  │                   agentSlice                      │  ││
│  │  │  • previewContent  • selectedEnvironment          │  ││
│  │  │  • splitRatio      • executionStatus              │  ││
│  │  └───────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Utilities Layer                       ││
│  │  ┌───────────────┐ ┌──────────────────────────────────┐ ││
│  │  │  sanitizeHTML │ │       debounce utilities         │ ││
│  │  └───────────────┘ └──────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## レイヤー構成

### 1. Views Layer

| View               | 責務                                       |
| ------------------ | ------------------------------------------ |
| AgentExecutionView | エージェント実行画面のルートコンポーネント |

### 2. Components Layer (Atomic Design)

| 階層      | コンポーネント             | 責務                             |
| --------- | -------------------------- | -------------------------------- |
| Organisms | SplitLayout                | 分割レイアウト管理               |
| Organisms | ExecutionEnvironment       | 環境タイプに応じたプレビュー表示 |
| Organisms | HTMLPreviewEnvironment     | sandbox付きHTMLプレビュー        |
| Organisms | MarkdownPreviewEnvironment | Markdownレンダリング             |
| Molecules | EnvironmentSelector        | 環境タイプ選択UI                 |

### 3. State Layer (Zustand)

| Slice      | 管理する状態                               |
| ---------- | ------------------------------------------ |
| agentSlice | プレビューコンテンツ、環境タイプ、分割比率 |

### 4. Utilities Layer

| ユーティリティ | 責務                          |
| -------------- | ----------------------------- |
| sanitizeHTML   | DOMPurifyによるHTMLサニタイズ |
| debounce       | 更新頻度制御                  |

---

## データフロー

### プレビュー更新フロー

```
┌─────────────────┐
│ Agent Streaming │
└────────┬────────┘
         │ HTML Content
         ▼
┌─────────────────┐
│ Content Handler │ ← コンテンツ検出
└────────┬────────┘
         │ setPreviewContent()
         ▼
┌─────────────────┐
│   agentSlice    │ ← 状態更新（デバウンス）
└────────┬────────┘
         │ previewContent
         ▼
┌─────────────────┐
│   SplitLayout   │ ← レイアウト管理
└────────┬────────┘
         │ content prop
         ▼
┌─────────────────────────┐
│  ExecutionEnvironment   │ ← 環境タイプ判定
└────────┬────────────────┘
         │ type: "html"
         ▼
┌─────────────────────────┐
│ HTMLPreviewEnvironment  │ ← サニタイズ + sandbox表示
└─────────────────────────┘
```

### 環境切り替えフロー

```
┌───────────────────┐
│ EnvironmentSelector │
└─────────┬─────────┘
          │ onEnvironmentChange("markdown")
          ▼
┌─────────────────┐
│   agentSlice    │ ← setSelectedEnvironment()
└─────────┬───────┘
          │ selectedEnvironment
          ▼
┌─────────────────────────┐
│  ExecutionEnvironment   │ ← 再レンダリング
└─────────────────────────┘
```

---

## 状態管理設計

### agentSlice拡張

```typescript
interface AgentState {
  // 既存状態
  status: AgentExecutionStatus;
  currentSkill: Skill | null;
  messages: AgentMessage[];

  // 新規状態（プレビュー機能）
  previewContent: PreviewContent | null;
  selectedEnvironment: EnvironmentType;
  splitRatio: number; // 0-100
}

interface AgentActions {
  // 既存アクション
  // ...

  // 新規アクション
  setPreviewContent: (content: PreviewContent | null) => void;
  setSelectedEnvironment: (type: EnvironmentType) => void;
  setSplitRatio: (ratio: number) => void;
  clearPreview: () => void;
}
```

### 状態の永続化

| 状態                | 永続化 | 保存先       |
| ------------------- | ------ | ------------ |
| splitRatio          | 永続化 | localStorage |
| previewContent      | 非永続 | -            |
| selectedEnvironment | 非永続 | -            |

---

## セキュリティアーキテクチャ

### 多層防御

```
┌──────────────────────────────────────────┐
│            Layer 1: DOMPurify            │ ← HTMLサニタイズ
├──────────────────────────────────────────┤
│            Layer 2: CSP                  │ ← script-src 'none'
├──────────────────────────────────────────┤
│            Layer 3: iframe sandbox       │ ← allow-same-origin only
└──────────────────────────────────────────┘
```

### 攻撃対策マトリクス

| 攻撃タイプ            | 対策                              |
| --------------------- | --------------------------------- |
| XSS (script tag)      | DOMPurify + CSP script-src 'none' |
| XSS (event handler)   | DOMPurify FORBID_ATTR             |
| XSS (javascript: URL) | DOMPurify sanitize                |
| Clickjacking          | frame-ancestors 'none'            |
| Data exfiltration     | connect-src 'none'                |
| Form hijacking        | form-action 'none'                |

---

## パフォーマンス設計

### デバウンス戦略

| 操作           | デバウンス時間 | 理由                           |
| -------------- | -------------- | ------------------------------ |
| プレビュー更新 | 500ms          | ストリーミング中の連続更新対策 |
| 分割比率変更   | 16ms           | 60fpsでのスムーズな操作        |
| 永続化         | 1000ms         | localStorage書き込み削減       |

### メモ化戦略

| コンポーネント         | メモ化対象             |
| ---------------------- | ---------------------- |
| SplitLayout            | レイアウト計算結果     |
| ExecutionEnvironment   | 環境コンポーネント選択 |
| HTMLPreviewEnvironment | サニタイズ済みHTML     |

---

## 拡張性設計

### 新環境タイプ追加手順

1. `EnvironmentType`に新タイプを追加
2. `ExecutionEnvironment`にcaseを追加
3. 新しい`*PreviewEnvironment`コンポーネントを作成
4. `EnvironmentSelector`の選択肢に追加

### プラグインポイント

| ポイント             | 用途                           |
| -------------------- | ------------------------------ |
| EnvironmentType      | 新環境タイプの定義             |
| ExecutionEnvironment | 環境ごとのレンダリング切り替え |
| SKILL.md Environment | スキルごとの環境設定           |

---

## 統合ポイント

### コンポーネント間契約

| 統合ポイント                         | 契約                                 |
| ------------------------------------ | ------------------------------------ |
| AgentExecutionView → SplitLayout     | showRightPanel: boolean              |
| SplitLayout → ExecutionEnvironment   | content: PreviewContent              |
| ExecutionEnvironment → HTML/Markdown | content: string                      |
| EnvironmentSelector ↔ agentSlice     | selectedEnvironment: EnvironmentType |

### 依存タスク連携

| タスク    | 連携内容                           |
| --------- | ---------------------------------- |
| AGENT-004 | Skill.environment フィールド       |
| AGENT-005 | agentSlice基盤、ストリーミング機能 |

---

## 完了確認

- [x] 全体アーキテクチャが定義されている
- [x] レイヤー構成が明確化されている
- [x] データフローが設計されている
- [x] 状態管理設計が完成している
- [x] セキュリティアーキテクチャが定義されている
- [x] パフォーマンス設計が含まれている
- [x] 拡張性設計が含まれている
- [x] 統合ポイントが明記されている
