# Phase 2: 設計

## メタ情報

| 項目      | 内容                          |
| --------- | ----------------------------- |
| Phase     | 2                             |
| 名称      | 設計                          |
| タスクID  | TASK-3-2-A                    |
| Issue番号 | #520                          |
| 前提Phase | Phase 1（要件定義）           |
| 次Phase   | Phase 3（設計レビューゲート） |

---

## 1. 目的

Phase 1で定義した要件に基づき、SkillStreamDisplayコンポーネントの改善設計を行う。

---

## 2. タスク

### Task 2-1: コンポーネント構造設計

**目的**: 改善に必要なコンポーネント構造を設計

**設計内容**:

| コンポーネント     | 責務                       | 新規/既存 |
| ------------------ | -------------------------- | --------- |
| SkillStreamDisplay | メインコンテナ、状態管理   | 既存      |
| MessageItem        | 個別メッセージ表示         | 既存      |
| LoadingSpinner     | ローディングアニメーション | 新規      |
| MessageTimestamp   | 相対時刻表示               | 新規      |
| CopyButton         | クリップボードコピーボタン | 新規      |
| CopyFeedback       | コピー成功フィードバック   | 新規      |

**コンポーネント階層**:

```
SkillStreamDisplay
├── stream-header
│   ├── status-badge
│   ├── LoadingSpinner (R1) ← 新規
│   └── abort-button / reset-button
└── stream-content
    └── MessageItem (複数)
        ├── message-content
        ├── MessageTimestamp (R2) ← 新規
        └── CopyButton (R3) ← 新規
            └── CopyFeedback ← 新規
```

---

### Task 2-2: R1 ローディングスピナー設計

**設計仕様**:

| 項目             | 仕様                                  |
| ---------------- | ------------------------------------- |
| コンポーネント名 | LoadingSpinner                        |
| 配置場所         | stream-header内、status-badgeの右隣   |
| 表示条件         | status === "running"                  |
| サイズ           | 16x16px (h-4 w-4)                     |
| アニメーション   | Tailwind animate-spin                 |
| 色               | border-blue-500、border-t-transparent |
| アクセシビリティ | role="status" aria-label="実行中"     |

**スタイル定義**:

| クラス               | 用途                     |
| -------------------- | ------------------------ |
| animate-spin         | 回転アニメーション       |
| h-4 w-4              | サイズ指定               |
| border-2             | ボーダー幅               |
| border-blue-500      | ボーダー色               |
| rounded-full         | 円形                     |
| border-t-transparent | 上部透明（スピナー効果） |

---

### Task 2-3: R2 タイムスタンプ設計

**ユーティリティ関数設計**:

| 関数名             | 入力              | 出力   | 説明                 |
| ------------------ | ----------------- | ------ | -------------------- |
| formatRelativeTime | timestamp: number | string | 相対時刻文字列を返す |

**formatRelativeTime ロジック**:

| 条件           | 出力形式        | 例        |
| -------------- | --------------- | --------- |
| diff < 60秒    | `${秒}秒前`     | "30秒前"  |
| diff < 60分    | `${分}分前`     | "5分前"   |
| diff < 24時間  | `${時間}時間前` | "2時間前" |
| diff >= 24時間 | `${日}日前`     | "3日前"   |

**配置場所**: `apps/desktop/src/renderer/utils/formatTime.ts`

**MessageTimestampコンポーネント設計**:

| 項目       | 仕様                                 |
| ---------- | ------------------------------------ |
| 配置場所   | MessageItem内、message-contentの右側 |
| スタイル   | text-xs text-gray-400                |
| レイアウト | flex-shrink-0                        |

---

### Task 2-4: R3 クリップボードコピー設計

**CopyButtonコンポーネント設計**:

| 項目             | 仕様                            |
| ---------------- | ------------------------------- |
| 配置場所         | MessageItem内、hover時に表示    |
| 表示条件         | ホバー時 (group-hover)          |
| アイコン         | SVGクリップボードアイコン       |
| サイズ           | 16x16px (h-4 w-4)               |
| アクセシビリティ | aria-label="メッセージをコピー" |

**コピー処理フロー**:

| Step | 処理                                           |
| ---- | ---------------------------------------------- |
| 1    | ボタンクリック検知                             |
| 2    | navigator.clipboard.writeText(content)呼び出し |
| 3    | 成功: setCopied(true)、2000ms後にfalseに戻す   |
| 4    | 失敗: console.error出力                        |

**CopyFeedbackコンポーネント設計**:

| 項目             | 仕様                             |
| ---------------- | -------------------------------- |
| 表示条件         | copied === true                  |
| 表示テキスト     | "コピーしました"                 |
| 表示時間         | 2000ms                           |
| スタイル         | text-xs text-green-500           |
| アクセシビリティ | role="status" aria-live="polite" |

---

### Task 2-5: 状態管理設計

**新規State**:

| State名         | 型     | 初期値 | 用途 |
| --------------- | ------ | ------ | ---- | ---------------------- |
| copiedMessageId | string | null   | null | コピー成功メッセージID |

**State配置**:

| コンポーネント | State           | 理由                             |
| -------------- | --------------- | -------------------------------- |
| MessageItem    | copiedMessageId | 各メッセージの独立したコピー状態 |

---

### Task 2-6: アクセシビリティ設計

**WCAG 2.1 AA対応チェックリスト**:

| 要件               | 対応方法                                  |
| ------------------ | ----------------------------------------- |
| キーボード操作     | CopyButtonにtabindex="0"、Enter/Space対応 |
| スクリーンリーダー | 適切なaria-label、role設定                |
| 色コントラスト     | text-gray-400は背景との4.5:1以上確保      |
| フォーカス表示     | focus:ring-2 focus:ring-blue-500          |

---

## 3. 完了条件

| ID  | 条件                                          | 確認方法       |
| --- | --------------------------------------------- | -------------- |
| 1   | 全コンポーネントの設計が完了している          | 設計書レビュー |
| 2   | 状態管理の設計が完了している                  | 設計書レビュー |
| 3   | アクセシビリティ設計がWCAG 2.1 AA準拠している | チェックリスト |
| 4   | 既存コンポーネントとの整合性が取れている      | 設計書レビュー |

---

## 4. 成果物

| 成果物               | パス                                     |
| -------------------- | ---------------------------------------- |
| 設計書               | outputs/phase-02/design-specification.md |
| コンポーネント階層図 | outputs/phase-02/component-hierarchy.md  |

---

## 5. システム観点チェック

### フロントエンド（Renderer）観点

| 観点               | 確認事項                        | 関連仕様                   |
| ------------------ | ------------------------------- | -------------------------- |
| コンポーネント設計 | Atomic Design原則に従っているか | ui-ux-design-principles.md |
| 状態管理           | 適切なスコープでstateを管理     | architecture-patterns.md   |
| パフォーマンス     | React.memoの適切な使用          | architecture-patterns.md   |
| スタイリング       | Tailwind CSSの一貫した使用      | ui-ux-components.md        |

### ファイル配置

| カテゴリ       | 配置場所                                                  |
| -------------- | --------------------------------------------------------- |
| コンポーネント | apps/desktop/src/renderer/components/AgentView/           |
| ユーティリティ | apps/desktop/src/renderer/utils/                          |
| テスト         | apps/desktop/src/renderer/components/AgentView/**tests**/ |

---

## 6. 参考資料

| 資料           | パス/URL                                                                     |
| -------------- | ---------------------------------------------------------------------------- |
| デザイン原則   | .claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md |
| アーキテクチャ | .claude/skills/aiworkflow-requirements/references/architecture-patterns.md   |
| 既存実装       | apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx        |
