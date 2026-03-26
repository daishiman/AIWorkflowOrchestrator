# Phase 2 Advanced Console Boundary 定義

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| タスクID  | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase     | 2                                               |
| 作成日    | 2026-03-24                                      |
| 依存Phase | Phase 1                                         |

## 1. Advanced Console の位置づけ

### 1.1 層構造

```
┌───────────────────────────────────────────┐
│  Layer 1: Primary Surface                 │  ← ユーザーが最初に触れる面
│  「実行コンソール」                       │     Task01 で定義済み
│  - Action Card                            │
│  - Runtime Banner                         │
│  - Session Dock                           │
│  - Artifact Summary                       │
├───────────────────────────────────────────┤
│  Layer 2: Safety Surface                  │  ← 安全性を担保する面
│  - Approval Sheet (FR-1)                  │     本 Task03 で定義
│  - Session Disclosure Banner (FR-2, FR-3) │
│  - Manual Share Rail (Task02)             │
├───────────────────────────────────────────┤
│  Layer 3: Detail Surface (opt-in)         │  ← 上級者向けの詳細面
│  「高度な表示」                           │     本 Task03 で定義
│  - Advanced Console Panel (FR-4)          │
│  - Raw Terminal Output                    │
│  - Copy Command                           │
│  - Low-level Operation Log                │
└───────────────────────────────────────────┘
```

### 1.2 Design Audit Matrix との整合

| 棄却案                           | 採用しない理由                           |
| -------------------------------- | ---------------------------------------- |
| raw terminal を初期画面にする    | 一般ユーザーの理解コストが高い           |
| terminal CTA を primary にする   | front 主導線のラベルを terminal にしない |
| advanced console を default 表示 | opt-in でなければ UX 過負荷              |

## 2. 露出条件（Gate Rules）

### 2.1 表示条件

| Gate ID | 条件                                       | 判定タイミング        |
| ------- | ------------------------------------------ | --------------------- |
| GATE-1  | ユーザーが「高度な表示」を明示的に選択する | toggle CTA クリック時 |
| GATE-2  | Session State が操作可能な状態である       | state 遷移時          |
| GATE-3  | ExecutionConsoleView がアクティブである    | ViewType チェック     |

### 2.2 非表示条件

| 条件                              | 動作                 |
| --------------------------------- | -------------------- |
| Session State が collapsed        | パネルを非表示にする |
| Session State が unavailable      | パネルを非表示にする |
| Session State が guidance-only    | パネルを非表示にする |
| ユーザーが toggle を閉じた        | パネルを非表示にする |
| ViewType が executionConsole 以外 | パネルを非表示にする |

### 2.3 State Machine 連携

```
Session State       Advanced Console Gate
──────────────      ──────────────────────
collapsed       →   非表示（Gate 不適用）
ready           →   opt-in toggle 有効
handoff         →   opt-in toggle 有効
running         →   opt-in toggle 有効（read-only モード）
done            →   opt-in toggle 有効（read-only モード）
aborted         →   opt-in toggle 有効（read-only モード）
unavailable     →   非表示（Gate 不適用）
guidance-only   →   非表示（Gate 不適用）
```

## 3. CTA 配置契約

### 3.1 CTA 階層

| Level     | CTA                | 配置位置                              |
| --------- | ------------------ | ------------------------------------- |
| Primary   | state 依存の主CTA  | Session Dock ヘッダー右端             |
| Secondary | 「高度な表示」     | Session Dock フッターまたはメニュー内 |
| Tertiary  | 「ログをコピー」等 | Advanced Console Panel 内             |

### 3.2 CTA 表示規則

| 規則 ID | 規則                                                        |
| ------- | ----------------------------------------------------------- |
| CTA-R1  | Primary CTA は常に1個。state に応じて変化する               |
| CTA-R2  | 「高度な表示」は Primary CTA と並列しない（下位に配置）     |
| CTA-R3  | 「端末で続ける」は handoff state でのみ Primary に昇格する  |
| CTA-R4  | 「高度な表示」のラベルは固定（「terminal を開く」にしない） |
| CTA-R5  | advanced console 内の CTA は Panel 内に閉じる               |

## 4. Advanced Console Panel 設計

### 4.1 パネル構成

```
┌─────────────────────────────────────────┐
│ 高度な表示                    [閉じる]  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Raw Terminal Output             │    │
│  │ $ claude --resume               │    │
│  │ > Analyzing files...            │    │
│  │ > Writing output to /tmp/...    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Copy Command       [コピー]    │    │
│  │ claude --resume --session abc   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Operation Log                   │    │
│  │ 14:32:01 API call to Claude     │    │
│  │ 14:32:05 File write: /tmp/out   │    │
│  │ 14:32:08 Session complete       │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### 4.2 パネル内の許可操作

| 操作               | 説明                                     | secret 非露出  |
| ------------------ | ---------------------------------------- | -------------- |
| Raw log 閲覧       | terminal output のリアルタイム表示       | API key 非含有 |
| Copy command       | handoff 用コマンドのクリップボードコピー | API key 非含有 |
| Operation log 閲覧 | タイムスタンプ付き操作ログ               | パス sanitize  |
| Scroll / Search    | ログ内のスクロールと検索                 | -              |

### 4.3 パネル内の禁止操作

| 操作             | 理由                                    |
| ---------------- | --------------------------------------- |
| 直接コマンド入力 | front surface からの直接実行は scope 外 |
| 自動実行トリガー | no auto-send / manual boundary 違反     |
| 外部送信ボタン   | Approval Sheet 経由でのみ許可           |

## 5. IPC Boundary

### 5.1 Advanced Console 関連 IPC

| Channel                      | 方向          | 目的                       |
| ---------------------------- | ------------- | -------------------------- |
| `execution:get-terminal-log` | Renderer→Main | raw terminal output の取得 |
| `execution:get-copy-command` | Renderer→Main | handoff 用 command の取得  |

### 5.2 IPC 設計原則

- 既存の `terminal:open` は外部 terminal 起動用。advanced console panel は**別 channel**で raw output を取得
- copy command に API key を含めない（secret 非中継: DENY-6 準拠）
- 新規 channel は `ALLOWED_INVOKE_CHANNELS` に追加必須
- P42 準拠 3段バリデーション適用必須

## 6. Front Default Surface からの分離保証

### 6.1 分離チェックリスト

- [ ] `ExecutionConsoleView` の初期レンダリングに advanced console が含まれない
- [ ] advanced console panel は `isOpen === false` がデフォルト
- [ ] toggle CTA は secondary 以下に配置されている
- [ ] primary CTA のラベルに「terminal」「端末」が含まれない（handoff state 除く）
- [ ] advanced console panel 内の操作が front surface に波及しない
