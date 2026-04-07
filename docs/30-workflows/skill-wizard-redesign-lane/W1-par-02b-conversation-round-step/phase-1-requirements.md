# Phase 1: 要件定義

## メタ情報

- Phase: 1
- タスクID: UT-SKILL-WIZARD-W1-par-02b
- 機能名: ConversationRoundStep コンポーネント実装（Step 1）
- 作成日: 2026-04-07

## 目的

スキルウィザードの Step 1 として機能する `ConversationRoundStep` コンポーネントの要件を明確化する。既存の `ConfigureStep.tsx` が担っていた役割を整理し、新しい設計方針に沿った要件を定義する。

## ゲート（Phase 1-3 共通・必須）

Phase 4（テスト作成）へ進む前提として、Phase 1-3 で以下の準拠を確認し、Phase 3 で結論を固定する。

| 対象 skill                   | 確認すること（この workflow での最小セット）                                                                                          | 記録先       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `task-specification-creator` | Phase 3 が「設計レビューゲート」として機能していること（4条件で進行可否判定、Phase 13 blocked 方針、並列レーン定義、解釈 drift 防止） | Phase 3 本文 |
| `aiworkflow-requirements`    | 既存 UI/UX・状態境界・命名・削除影響（旧 Step の残参照）が system spec と矛盾しないこと                                               | Phase 3 本文 |

`aiworkflow-requirements` の最小検索（例）:

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "SkillCreateWizard" -C 3
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "SkillLifecyclePanel" -C 3
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "wizard" -C 3
```

## SubAgent 分担（Phase 1）

| SubAgent   | 責務                                                                               | 実行形態          | 完了条件                   |
| ---------- | ---------------------------------------------------------------------------------- | ----------------- | -------------------------- |
| SubAgent-A | `ConfigureStep` / `WizardOptions` の現状調査、削除影響（参照箇所）洗い出し         | SubAgent-B と並列 | 参照箇所一覧が揃う         |
| SubAgent-B | 仕様検索（`aiworkflow-requirements`）と、要件の矛盾・不足・依存関係の初期監査      | SubAgent-A と並列 | 仕様整合の論点が揃う       |
| Lead       | 要件セットの確定（Q1-Q6 / ページング / Q3 / Q5 / サマリー）と Phase 2 への受け渡し | 直列              | Phase 2 の入力が固定される |

## 実行タスク

- [ ] （Gate準備）`task-specification-creator` / `aiworkflow-requirements` 準拠監査の観点を Phase 3 に持ち越せる形に整理する
- [ ] 既存の `ConfigureStep.tsx` の実装内容を調査・把握する
- [ ] `WizardOptions` 型の利用箇所を全て洗い出す
- [ ] 6問の内容・選択肢を確定する
- [ ] ページング（2ページ）の仕様を確定する
- [ ] 進捗バーの仕様を確定する
- [ ] スマートデフォルトの適用仕様を確定する
- [ ] Q3定期実行時のスケジュールUIの仕様を確定する
- [ ] Q5必須化条件を確定する
- [ ] 「今すぐ生成する」ボタンと適用サマリーカードの仕様を確定する

## 参照資料

| 資料名                     | パス                                                                       | 説明                 |
| -------------------------- | -------------------------------------------------------------------------- | -------------------- |
| 既存 ConfigureStep         | `apps/desktop/src/renderer/components/skill/wizard/ConfigureStep.tsx`      | 削除対象の現行実装   |
| 共有型定義                 | `packages/shared/src/types/skill-*.ts`                                     | 型定義参照           |
| ウィザード親コンポーネント | `apps/desktop/src/renderer/components/skill/wizard/`                       | ウィザード全体構成   |
| W0-seq-01仕様書            | `docs/30-workflows/skill-wizard-redesign-lane/W0-seq-01-*/`                | 依存タスクの完了仕様 |
| W1-par-02a仕様書           | `docs/30-workflows/skill-wizard-redesign-lane/W1-par-02a-skill-info-step/` | 連携先仕様           |

## 実行手順

### Step 0: 並列調査の開始（SubAgent-A / B）

- SubAgent-A: Step 1-2 を実施（コード・参照箇所の確定）
- SubAgent-B: `aiworkflow-requirements` を最小検索し、矛盾が起きそうな論点だけ抽出（詳細は Phase 3 で判定）

### Step 1: 既存コードの調査（SubAgent-A）

`ConfigureStep.tsx` の現行実装を確認し、以下の点を把握する。

- レンダリングする UI 要素の一覧（WizardOptions の3チェックボックス）
- `WizardOptions` 型の定義と利用箇所
- 親コンポーネントとの Props インターフェース

### Step 2: 削除対象の影響範囲調査（SubAgent-A）

```bash
rg -n "ConfigureStep|WizardOptions" apps packages -g '*.ts' -g '*.tsx'
```

### Step 3: 要件確定（Lead）

| 問  | ラベル                   | 選択肢（4択）                                       | 自由入力 |
| --- | ------------------------ | --------------------------------------------------- | -------- |
| Q1  | 利用者（誰が使うか）     | 自分のみ / チームメンバー / 社内全体 / 外部ユーザー | あり     |
| Q2  | 入力データ（何を渡すか） | テキスト / ファイル / URLリンク / 構造化データ      | あり     |
| Q3  | 実行タイミング           | 手動実行 / 定期実行 / イベント駆動 / 都度判断       | あり     |
| Q4  | 出力先（どこへ）         | チャット返信 / ファイル保存 / 外部ツール / 通知     | あり     |
| Q5  | 外部ツール連携           | なし / Slack / GitHub / その他                      | あり     |
| Q6  | 出力フォーマット         | Markdown / プレーンテキスト / JSON / 箇条書き       | あり     |

### Step 4: ConversationAnswers 型の確定

W0-seq-01 で定義された `QuestionAnswer` / `ConversationAnswers` / `SkillWizardScheduleConfig` をそのまま利用する。W1-par-02b では再定義しない。

### Step 5: SmartDefaultResult 型の確認

W0-seq-01 で定義された `SmartDefaultResult` の型を確認し、各問への事前入力マッピングを確定する。

### Step 6: 適用サマリーカード仕様確定

- 表示トリガー: 「今すぐ生成する」ボタンクリック時
- 表示内容: 未回答問（残問）のスマートデフォルト値一覧
- dismissible: 「×」ボタンで閉じられる
- Q5 未設定警告: `category === "external-integration"` かつ Q5 未回答時に警告表示
- 確認後: 「生成する」ボタンで `onGenerate("skip")` を呼ぶ

## 成果物

- 要件定義書（本ファイル）
- `ConversationAnswers` 型定義の確定仕様
- `QuestionAnswer` / `ConversationAnswers` / `SkillWizardScheduleConfig` の利用仕様
- 6問の内容・選択肢の確定仕様
- 適用サマリーカードの仕様
- 削除対象ファイル・型の影響範囲リスト

## 完了条件

- [ ] 既存 `ConfigureStep.tsx` の実装内容が把握されている
- [ ] `WizardOptions` 型の全利用箇所が洗い出されている
- [ ] 6問の内容・選択肢が確定している
- [ ] `ConversationAnswers` / `SkillWizardScheduleConfig` 型定義が確定している
- [ ] ページング（2ページ）の仕様が確定している
- [ ] Q3スケジュールUI展開の仕様が確定している
- [ ] Q5必須化条件が確定している
- [ ] 適用サマリーカードの仕様が確定している
