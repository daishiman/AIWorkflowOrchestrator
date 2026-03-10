# Phase 1: 要件定義

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 1                      |
| 機能名 | agent-view-enhancement |
| 作成日 | 2026-03-10             |

## 目的

TASK-UI-03-AGENT-VIEW-ENHANCEMENT の機能要件・非機能要件・受け入れ基準を明文化する。既存 AgentView を「Tap & Discover」体験にリデザインし、Level 1（ツール選択 + 実行ボタン + 最近の実行）と Level 2（詳細設定パネル）の2階層で認知負荷を最小化する。

## 実行タスク

- 要件抽出: 元タスク仕様書（task-058a）から機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- FR/NFR 分類: 機能要件と非機能要件を分類し優先度を設定
- UX言語マッピング定義: 5D準拠のUI表記統一ルールを確定
- 詳細設定要件抽出: モデル選択・許可設定・実行状態表示の契約を正本仕様から抽出
- 既知の落とし穴対策整理: P31/P39/P40/P24 の対策を要件に組み込む

## 参照資料

| 資料名                         | パス                                                                                                         | 説明                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| 元タスク仕様書                 | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-058a-ui-03-agent-view-enhancement.md` | リデザイン全体仕様                |
| UI/UXコンポーネント仕様        | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                      | コンポーネント設計基準            |
| 機能コンポーネント仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                              | 機能コンポーネント定義            |
| デザイン原則                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                               | Apple HIG準拠デザイン原則         |
| デザインシステム               | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                                   | トークン・8px grid・配色          |
| UIコンポーネントアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                    | コンポーネント階層設計            |
| 状態管理アーキテクチャ         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                 | Zustand Store設計                 |
| ナビゲーション仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                      | GlobalNavStrip連携                |
| 実行UI仕様                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                                 | 実行状態・Permission導線          |
| モデル選択UI                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`                                    | モデル選択UIの基準                |
| 許可設定UI                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                        | Permission settings の基準        |
| スキル実行セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                              | allowed tools / remembered choice |
| 実装パターン                   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                  | P24/P31の再発防止                 |
| 既知の落とし穴                 | `.claude/rules/06-known-pitfalls.md`                                                                         | P31/P39/P40/P24対策               |
| 状態管理ルール                 | `.claude/rules/03-state-management.md`                                                                       | Zustand個別セレクタパターン       |

## 実行手順

### ステップ1: 機能要件の抽出

元タスク仕様書のセクション2-5（目的、Why、画面構成図、実行タスク）から以下の7つのTaskに対応する機能要件を抽出する。

### ステップ2: 非機能要件の抽出

アクセシビリティ（WCAG 2.1 AA）、パフォーマンス、Apple HIG準拠、既知の落とし穴対策を非機能要件として定義する。

### ステップ3: 受け入れ基準の定義

各機能要件に対して、検証可能な受け入れ基準をチェックリスト形式で定義する。

---

## 機能要件（FR）

### FR-1: SkillChip コンポーネント

**優先度**: 高

80x80px の丸アイコン + スキル名テキストのチップコンポーネントを新規作成する。

| 項目             | 仕様                                                                     |
| ---------------- | ------------------------------------------------------------------------ |
| サイズ           | 80x80px 丸アイコン + 下部スキル名テキスト（全体高さ約110px）             |
| アイコン         | スキルメタデータの `icon` フィールドを使用、未設定時はデフォルトアイコン |
| 選択状態         | アクセントカラーのリング + チェックマークオーバーレイ                    |
| アクセシビリティ | `role="radio"` + `aria-checked` + `aria-label={skillDisplayName}`        |

**受け入れ基準**:

- [ ] 未選択チップが `aria-checked="false"` かつ `border-transparent` で表示される
- [ ] 選択済みチップが `aria-checked="true"` かつ `border-[var(--status-primary)]` で表示される
- [ ] チップクリックで `onSelect` コールバックが発火する
- [ ] `isDisabled=true` 時にクリックしても `onSelect` が発火しない
- [ ] アイコン未設定時にデフォルトアイコンが表示される
- [ ] `role="radio"` と `aria-label` 属性が付与されている

### FR-2: ExecuteButton コンポーネント

**優先度**: 高

全幅の大きなプライマリ実行ボタンを新規作成する。

| 項目             | 仕様                                                         |
| ---------------- | ------------------------------------------------------------ |
| サイズ           | 全幅（`w-full`）、高さ 56px（`h-14`）、角丸 12px             |
| カラー           | `bg-[var(--status-primary)]`（Apple systemBlue）、テキスト白 |
| 未選択時テキスト | 「ツールを選んでください」（disabled状態、`opacity-50`）     |
| 選択時テキスト   | 「実行する」                                                 |
| クリック動作     | AgentExecutionView に遷移                                    |

**受け入れ基準**:

- [ ] `selectedSkillName=null` のとき `disabled` 属性が付与されテキストが「ツールを選んでください」になる
- [ ] `selectedSkillName` 指定時にテキストが「実行する」になる
- [ ] 有効状態でクリック時に `onExecute` コールバックが発火する
- [ ] 無効状態でクリックしても `onExecute` が発火しない

### FR-3: FloatingExecutionBar コンポーネント

**優先度**: 高

実行中のみ画面下部に表示されるフローティングプログレスバーを新規作成する。

| 表示条件                 | 動作                                        |
| ------------------------ | ------------------------------------------- |
| `status === 'executing'` | プログレス表示 + 停止ボタン                 |
| `status === 'completed'` | success-bounce アニメーション → 1.5秒後消去 |
| `status === 'failed'`    | shake アニメーション + 赤色表示 → 3秒後消去 |
| `status === 'idle'`      | 非表示                                      |

**受け入れ基準**:

- [ ] `status="executing"` でコンポーネントが表示される
- [ ] 停止ボタンクリックで `onStop` コールバックが発火する
- [ ] `startedAt` から `mm:ss` 形式で経過時間が表示される
- [ ] `progress` 値に応じてプログレスバーが表示される
- [ ] `status="completed"` で「完了!」テキストが表示される
- [ ] 非実行時（idle）にコンポーネントが非表示になる

### FR-4: AdvancedSettingsPanel コンポーネント

**優先度**: 中

歯車アイコンタップで展開するスライドインパネルを新規作成する。

| 項目       | 仕様                                                                |
| ---------- | ------------------------------------------------------------------- |
| トリガー   | ヘッダー右端の歯車アイコンボタン（24x24px）                         |
| パネル幅   | 360px（`max-width: 90vw`）                                          |
| AIの種類   | カード型ラジオ選択（`role="radiogroup"` + `aria-label="AIの種類"`） |
| 許可設定   | PermissionMode セレクタ + 記憶済み件数表示 + リセットボタン         |
| 閉じる操作 | 閉じるボタン / 背景タップ / ESCキー                                 |

**受け入れ基準**:

- [ ] `isOpen=true` でパネルが DOM に表示される
- [ ] `isOpen=false` でパネルが DOM に不在になる
- [ ] 閉じるボタンクリックで `onClose` コールバックが発火する
- [ ] モデル選択変更で `onSelectModel` コールバックが発火する
- [ ] 許可モード変更で `onModeChange` コールバックが発火する
- [ ] リセットボタンクリックで `onResetRemembered` コールバックが発火する
- [ ] ESCキー押下で `onClose` コールバックが発火する
- [ ] 背景オーバーレイタップで `onClose` コールバックが発火する

### FR-5: RecentExecutionList コンポーネント

**優先度**: 中

最近のツール実行履歴を最大3件表示するリストを新規作成する。

| 項目               | 仕様                                                              |
| ------------------ | ----------------------------------------------------------------- |
| 最大表示件数       | 3件                                                               |
| エントリ内容       | スキル表示名 + ステータスアイコン（check/x/spinner）+ 相対時間    |
| クリック動作       | AgentExecutionView に遷移                                         |
| 空の場合           | 「まだ実行履歴がありません」メッセージ（`var(--text-secondary)`） |
| セクションヘッダー | 「最近の実行」                                                    |

**受け入れ基準**:

- [ ] 5件入力しても最大3件のみ表示される
- [ ] 0件の場合「まだ実行履歴がありません」メッセージが表示される
- [ ] エントリクリックで `onSelectExecution` コールバックが発火する
- [ ] ステータスに応じたアイコンが表示される（completed→check, failed→x, executing→spinner）
- [ ] 相対時間が「2分前」「1時間前」形式で表示される

### FR-6: AgentView レイアウト統合

**優先度**: 高

Task 1〜5 のコンポーネントをシングルカラムレイアウトに統合する。

| 項目               | 仕様                                                         |
| ------------------ | ------------------------------------------------------------ |
| レイアウト         | シングルカラム、中央寄せ、`max-width: 600px`                 |
| Level 1 要素       | ツールチップ群 + 実行ボタン + 最近の実行 = 3セクション       |
| 画面タイトル       | 「AIアシスタント」                                           |
| セクションヘッダー | 「できること」                                               |
| ツール0件          | SkillCenter への導線（「Skill Centerでツールをインポート」） |
| ツール10個以下     | 検索バー非表示                                               |
| ツール11個以上     | 上部にインライン検索バー出現                                 |

**受け入れ基準**:

- [ ] `max-width: 600px` の中央寄せコンテナが確認できる
- [ ] Level 1 に3セクション（ツールチップ群 + 実行ボタン + 最近の実行）が表示される
- [ ] 画面タイトルが「AIアシスタント」である
- [ ] セクションヘッダーが「できること」である
- [ ] ツール0件で EmptyState（SkillCenter導線）が表示される
- [ ] ツール10個以下で検索バーが非表示である
- [ ] ツール11個以上で検索バーが出現する
- [ ] UIテキストが UX言語マッピング（5D準拠）に従っている

### FR-7: agentSlice 拡張（最小限）

**優先度**: 高

新UIに必要な状態のみ agentSlice に追加する。既存の agentSlice 基本構造は維持する。

| 追加フィールド            | 型                   | 用途                     |
| ------------------------- | -------------------- | ------------------------ |
| `recentExecutions`        | `ExecutionSummary[]` | RecentExecutionList 用   |
| `isAdvancedSettingsOpen`  | `boolean`            | 詳細設定パネルの開閉状態 |
| `addExecutionToHistory`   | アクション           | 実行履歴の先頭追加       |
| `clearExecutionHistory`   | アクション           | 全履歴クリア             |
| `setAdvancedSettingsOpen` | アクション           | パネル開閉状態切り替え   |

**追加セレクタ（P31対策: 個別セレクタパターン）**:

- `useRecentExecutions()`
- `useAddExecutionToHistory()`
- `useIsAdvancedSettingsOpen()`
- `useSetAdvancedSettingsOpen()`

**受け入れ基準**:

- [ ] `addExecutionToHistory` で実行履歴が先頭に追加される
- [ ] 10件を超えた場合に古いエントリが削除される
- [ ] `clearExecutionHistory` で全履歴がクリアされる
- [ ] `setAdvancedSettingsOpen` でパネル開閉状態が切り替わる
- [ ] 全新規セレクタが個別セレクタパターン（P31対策）で実装されている
- [ ] 既存の agentSlice セレクタ（`useSelectedSkillName`, `useImportedSkills` 等）が正常動作する

---

## 非機能要件（NFR）

### NFR-1: アクセシビリティ（WCAG 2.1 AA 準拠）

| 項目               | 基準                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| コントラスト比     | 通常テキスト 4.5:1 以上、大テキスト/UI部品 3:1 以上                         |
| キーボード操作     | 全要素が Tab / Enter / Space で操作可能                                     |
| ARIA属性           | SkillChip群: `role="radiogroup"` + 各チップ `role="radio"` + `aria-checked` |
| スクリーンリーダー | 全操作要素に意味のある `aria-label` が付与されている                        |

### NFR-2: Apple HIG 準拠デザイン

| 項目         | 基準                                                          |
| ------------ | ------------------------------------------------------------- |
| カラー       | CSS変数名が 00-design-foundation のトークンと一致する         |
| スペーシング | 8px グリッド準拠（gap-6=24px, gap-4=16px, p-6=24px）          |
| 角丸         | 8px〜12px でコンポーネント間を統一                            |
| フォント     | システムフォント（`-apple-system`, `BlinkMacSystemFont`）優先 |

### NFR-3: マイクロインタラクション一貫性

| アニメーション種別 | タイミング        |
| ------------------ | ----------------- |
| ホバー             | 200ms ease        |
| タップ             | 100-150ms ease-in |
| スライドイン       | 300ms ease-out    |
| スライドアウト     | 200ms ease-in     |
| success-bounce     | 300ms ease        |

### NFR-4: 既知の落とし穴対策

| Pitfall ID | 対策内容                                                             |
| ---------- | -------------------------------------------------------------------- |
| P31        | 全状態アクセスは個別セレクタ経由。`useAppStore()` の一括分割代入禁止 |
| P39        | happy-dom環境では `userEvent` 使用禁止。`fireEvent` を使用           |
| P40        | テスト実行は `cd apps/desktop && pnpm vitest run src/...` で実行     |
| P24        | `ImportedSkill` 型と `Skill` 型の不一致に注意。型アサーション回避    |

### NFR-5: パフォーマンス

| 項目             | 基準                                               |
| ---------------- | -------------------------------------------------- |
| 初期レンダリング | Level 1 の3セクションが100ms以内に表示される       |
| アニメーション   | 全アニメーションが60fps以上で動作する              |
| 再レンダリング   | 個別セレクタにより不要な再レンダリングが発生しない |

---

## UX言語マッピング（5D準拠）

UIテキスト上の表記を以下の通り統一する。コード識別子（変数名・型名・ファイル名）は既存のまま維持する。

| 技術用語           | UIテキスト表記      |
| ------------------ | ------------------- |
| エージェントビュー | AIアシスタント      |
| スキル             | ツール / できること |
| パーミッション     | 許可                |
| モデル選択         | AIの種類            |
| プロバイダ         | AI                  |

---

## 情報階層設計

### Level 1（最初に見える画面）

ユーザーが最初に見る画面は「何ができるか」と「実行する」のみに絞る。

| 要素               | コンポーネント      | 用途                 |
| ------------------ | ------------------- | -------------------- |
| ツール選択チップ群 | SkillChip           | 利用可能ツールの選択 |
| 実行ボタン         | ExecuteButton       | 選択ツールの実行開始 |
| 最近の実行         | RecentExecutionList | 直近3件の実行履歴    |

### Level 2（タップで展開）

デフォルト自動選択により、多くのユーザーはこのパネルを開く必要がない。

| 要素     | 内容                                     |
| -------- | ---------------------------------------- |
| AIの種類 | モデル選択（カード型ラジオ）             |
| 許可設定 | PermissionMode + 記憶済み件数 + リセット |

---

## 7つのTask一覧

| Task | コンポーネント名         | 種別 | ファイルパス                                                                         |
| ---- | ------------------------ | ---- | ------------------------------------------------------------------------------------ |
| 1    | SkillChip                | 新規 | `apps/desktop/src/renderer/components/organisms/AgentView/SkillChip.tsx`             |
| 2    | ExecuteButton            | 新規 | `apps/desktop/src/renderer/components/organisms/AgentView/ExecuteButton.tsx`         |
| 3    | FloatingExecutionBar     | 新規 | `apps/desktop/src/renderer/components/organisms/AgentView/FloatingExecutionBar.tsx`  |
| 4    | AdvancedSettingsPanel    | 新規 | `apps/desktop/src/renderer/components/organisms/AgentView/AdvancedSettingsPanel.tsx` |
| 5    | RecentExecutionList      | 新規 | `apps/desktop/src/renderer/components/organisms/AgentView/RecentExecutionList.tsx`   |
| 6    | AgentView レイアウト統合 | 修正 | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                |
| 7    | agentSlice 拡張          | 修正 | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                               |

---

## 統合テスト連携

接続要件を以下の通り定義する:

| 接続要件カテゴリ | 記載内容                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| IPC接続          | `skill:execute`, `skill:abort`, `skill:list`, `llm:getProviders`, `llm:health`（全て既存・変更なし） |
| 状態管理フロー   | agentSlice → SkillChip/ExecuteButton/FloatingExecutionBar/RecentExecutionList                        |
| ナビゲーション   | GlobalNavStrip → AgentView（ViewType.Agent）→ AgentExecutionView                                     |

## 多角的チェック観点

| 観点             | 適用判断                 | 仕様参照先                                                                 |
| ---------------- | ------------------------ | -------------------------------------------------------------------------- |
| UI/UX            | フロントエンド実装のため | `aiworkflow-requirements: ui-ux-components.md, ui-ux-design-principles.md` |
| アクセシビリティ | UI実装のため             | `aiworkflow-requirements: ui-ux-components.md`（WCAG 2.1 AA）              |
| 状態管理         | Zustand Store拡張のため  | `aiworkflow-requirements: arch-state-management.md`                        |
| パフォーマンス   | アニメーション要件のため | `aiworkflow-requirements: arch-ui-components.md`                           |

**Electronデスクトップアプリ観点**:

| 層                         | 確認観点                                      |
| -------------------------- | --------------------------------------------- |
| フロントエンド（Renderer） | React UIコンポーネント設計、Atomic Design準拠 |
| IPC通信                    | 既存IPCチャンネル（skill:_, llm:_）の利用確認 |

## 成果物

| 成果物     | パス                                                                                          | 説明                               |
| ---------- | --------------------------------------------------------------------------------------------- | ---------------------------------- |
| 要件定義書 | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/phase-1-requirements.md` | 本ドキュメント（機能・非機能要件） |

## 完了条件

- [ ] 7つのTask全ての機能要件が FR-1〜FR-7 として定義されている
- [ ] 各機能要件に検証可能な受け入れ基準がチェックリスト形式で記載されている
- [ ] 非機能要件（アクセシビリティ、Apple HIG、マイクロインタラクション、落とし穴対策、パフォーマンス）が NFR-1〜NFR-5 として定義されている
- [ ] UX言語マッピング（5D準拠）が定義されている
- [ ] Level 1 / Level 2 の情報階層設計が明記されている
- [ ] P31/P39/P40/P24 の対策が要件に組み込まれている
- [ ] 統合テスト連携の接続要件が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計
