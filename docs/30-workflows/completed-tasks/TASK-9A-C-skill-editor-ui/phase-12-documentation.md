# Phase 12: ドキュメント更新 — SkillEditor コンポーネント実装

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 12                                       |
| 機能名 | TASK-9A-C SkillEditor コンポーネント実装 |
| 作成日 | 2026-02-19                               |

## 目的

実装した SkillEditor コンポーネントの技術的理解を促進するドキュメントを作成し、システム要件ドキュメントに反映し、未完了タスクを検出・記録する。

## 実行タスク

- Task 1: 実装ガイド作成【必須】
- Task 2: システムドキュメント更新【必須】
- Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】
- Task 4: 未タスク検出【必須】
- Task 5: スキルフィードバックレポート【必須】

## 参照資料

### Phase成果物

| 資料名                 | パス                                                  | 説明            |
| ---------------------- | ----------------------------------------------------- | --------------- |
| 設計書                 | `phase-2-design.md`                                   | Phase 2 成果物  |
| 実装仕様               | `phase-5-implementation.md`                           | Phase 5 成果物  |
| テスト拡充             | `phase-6-test-expansion.md`                           | Phase 6 成果物  |
| カバレッジ             | `phase-7-coverage-verification.md`                    | Phase 7 成果物  |
| リファクタ             | `phase-8-refactoring.md`                              | Phase 8 成果物  |
| 品質保証               | `phase-9-quality-assurance.md`                        | Phase 9 成果物  |
| 手動テスト             | `outputs/phase-11/manual-test-result.md`              | Phase 11 成果物 |
| 最終レビュー           | `outputs/phase-10/final-review-result.md`             | Phase 10 成果物 |
| 既存コンポーネント分析 | `outputs/phase-1/existing-component-analysis.md`      | Phase 1 成果物  |
| UI要件定義             | `outputs/phase-1/skill-editor-requirements.md`        | Phase 1 成果物  |
| コンポーネント階層定義 | `outputs/phase-1/component-hierarchy-requirements.md` | Phase 1 成果物  |
| インタラクション仕様   | `outputs/phase-1/interaction-specifications.md`       | Phase 1 成果物  |

### システム仕様（aiworkflow-requirements）

| 資料名                 | パス                                                                                        | 説明                         |
| ---------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| アーキテクチャ概要     | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | 全体アーキテクチャ           |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集               |
| 状態管理               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | 状態管理設計                 |
| スキルインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキル関連インターフェース   |
| UIコンポーネント       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | コンポーネント設計指針       |
| セキュリティAPI        | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | Electron IPC セキュリティ    |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラー処理パターン           |
| テストパターン         | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | コンポーネントテストパターン |

### タスク仕様書スキル参照

| 資料名                 | パス                                                                           | 説明                  |
| ---------------------- | ------------------------------------------------------------------------------ | --------------------- |
| 仕様書更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Step 1-A〜Step 2 手順 |

## 実行手順

1. 事前チェックリスト（既知の落とし穴防止）を確認する
2. Task 1〜5 を順次実行する
3. 各 Task の成果物が正しく生成されていることを確認する
4. 完了条件をすべて満たしていることを検証する

---

## 事前チェック【必須】

Phase 12 実行前に以下の既知の落とし穴を確認:

- [ ] **P1**: LOGS.md は `aiworkflow-requirements` と `task-specification-creator` の **2ファイル両方** を更新する
- [ ] **P2**: 仕様書に変更があれば **topic-map.md を必ず再生成** する（セクション追加だけでなく削除・更新も対象）
- [ ] **P3**: 未タスク管理は **3ステップ全完了** する（①指示書 → ②残課題テーブル → ③関連仕様書リンク）
- [ ] **P4**: 全 Step 完了前に documentation-changelog に **「完了」と記載しない**
- [ ] **P25**: LOGS.md 2ファイル更新漏れ再発防止（P1と同じだが過去に再発あり）
- [ ] **P26**: システム仕様書更新を **PRマージ後まで遅延しない** — Phase 12完了時点で更新する
- [ ] **P27**: topic-map.md 再生成のトリガーは **セクション追加だけでなく更新・削除も含む**
- [ ] **P28**: スキルフィードバックレポートは **改善点なしでも出力必須**
- [ ] **P29**: SKILL.md の **変更履歴テーブル** も更新する（LOGS.md だけでは不十分）

---

## Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                          |
| ------ | ---------------- | --------------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）            |
| Part 2 | 開発者・技術者   | 技術的な詳細（コンポーネント・API・状態管理） |

### Part 1: 概念説明（中学生レベル）

**必須要件**:

- 日常生活での例え話を**必ず**含める
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**例え話のヒント**:

- SkillEditor → 「本の目次と本文」。左側の目次（ファイルツリー）から読みたいページを選ぶと、右側に本文（ファイル内容）が表示される
- ファイルツリー → 「本棚の目次」。フォルダが章、ファイルが各ページ
- 未保存表示 → 「ノートに鉛筆で書いている最中」。消しゴムで消せる状態。保存すると「ペンで清書した」状態になる
- IPC通信 → 「店員さんに本を取ってもらう」。自分で奥の倉庫には行けないので、窓口（IPC）を通じてやり取りする

### Part 2: 技術的詳細

**必須要件**:

- コンポーネント構成図（SkillEditor → SkillCodeEditor の親子関係）
- Props定義（TypeScript インターフェース）を記載
- IPC呼び出しパターン（readFile / writeFile チャネルの使用方法）
- 状態管理フロー（useState による selectedFile, content, isDirty の管理）
- エラーハンドリングの仕組み（IPC エラー → ユーザー通知フロー）

**コンポーネント構成**:

```
SkillEditor (親コンポーネント)
├── FileTree (左カラム)
│   ├── フォルダノード (展開/折畳)
│   └── ファイルノード (クリックで選択)
└── SkillCodeEditor (右カラム)
    ├── エディタ領域 (テキスト編集)
    ├── 未保存インジケーター
    └── アクションバー (保存ボタン, 閉じるボタン)
```

### API ドキュメント

**component-documentation.md** として以下を記載:

| セクション   | 内容                                       |
| ------------ | ------------------------------------------ |
| Props一覧    | SkillEditor, SkillCodeEditor の全Props     |
| イベント一覧 | onSave, onClose, onFileSelect コールバック |
| IPC チャネル | skill:readFile, skill:writeFile            |
| 使用例       | 基本的な使い方のコードサンプル             |

---

## Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照

### Step 1-A: タスク完了記録【必須・全タスク】

- [ ] 該当する仕様書（`ui-ux-feature-components.md`）に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴を更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴を更新

**P1防止**: LOGS.md は以下の **2ファイル両方** を更新すること:

| ファイル                                            | 目的                         |
| --------------------------------------------------- | ---------------------------- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`    | システム仕様書更新の記録     |
| `.claude/skills/task-specification-creator/LOGS.md` | タスク仕様書スキルの使用記録 |

**P29防止**: SKILL.md の変更履歴テーブルも更新すること:

| ファイル                                             | 目的                         |
| ---------------------------------------------------- | ---------------------------- |
| `.claude/skills/aiworkflow-requirements/SKILL.md`    | 仕様管理スキルの変更履歴     |
| `.claude/skills/task-specification-creator/SKILL.md` | タスク仕様書スキルの変更履歴 |

**完了記録テンプレート**:

```markdown
## 完了タスク

### タスク: TASK-9A-C SkillEditor コンポーネント実装（2026-02-XX完了）

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| タスクID   | TASK-9A-C                            |
| 完了日     | 2026-02-XX                           |
| ステータス | **完了**                             |
| テスト数   | XX（自動）+ 30（手動）               |
| 成果物     | SkillEditor.tsx, SkillCodeEditor.tsx |

> **注意**: テスト数は `pnpm test` 実行結果の実測値のみを記載すること。推定値・概算値は使用不可。

#### テスト結果サマリー

| カテゴリ               | テスト数 | PASS | FAIL |
| ---------------------- | -------- | ---- | ---- |
| SkillEditor 単体テスト | X        | X    | 0    |
| SkillCodeEditor テスト | X        | X    | 0    |
| 統合テスト             | X        | X    | 0    |

#### 成果物

| 成果物             | パス                                                             |
| ------------------ | ---------------------------------------------------------------- |
| テスト結果レポート | `docs/30-workflows/.../outputs/phase-11/manual-test-result.md`   |
| 実装ガイド         | `docs/30-workflows/.../outputs/phase-12/implementation-guide.md` |
```

### Step 1-B: 実装状況テーブル更新【必須】

以下のファイルの実装状況を「完了」に更新:

- `ui-ux-feature-components.md`: SkillEditor コンポーネントの実装ステータス

**注意**: 「既存コンポーネントを拡張しただけなので更新不要」は誤判断。実装状況テーブルの更新は必須。

### Step 1-C: 関連タスクテーブル更新【必須】

該当する仕様書の「関連タスク」「未タスク候補」テーブルでTASK-9A-Cのステータスを更新。

**確認すべきファイル**: Grep で全箇所を確認すること:

```bash
grep -rn "TASK-9A-C" .claude/skills/aiworkflow-requirements/references/
```

**検索対象候補**:

| 確認対象ファイル              | テーブル名 |
| ----------------------------- | ---------- |
| `ui-ux-feature-components.md` | 関連タスク |
| `ui-ux-components.md`         | 関連タスク |
| `arch-state-management.md`    | 関連タスク |
| `security-electron-ipc.md`    | 関連タスク |

### Step 1-D: topic-map.md再生成【P2/P27防止】

仕様書にセクション追加・更新・削除・行数変更があった場合、以下を実行:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

**重要（P2/P27防止）**: セクションの追加だけでなく、更新・削除も再生成トリガーとする。仕様書に変更があれば**必ず**再生成を実行。

### Step 2: システム仕様更新【条件付き】

**P26防止**: PRマージ後ではなく、Phase 12完了時点でシステム仕様書を更新すること。

**更新が必要な場合**:

- 新規UIコンポーネント（SkillEditor, SkillCodeEditor）がシステムに追加
- コンポーネント仕様への追加が必要

**更新対象ファイル**:

| ファイル                      | 更新内容                           |
| ----------------------------- | ---------------------------------- |
| `ui-ux-feature-components.md` | SkillEditor コンポーネント仕様追加 |
| `ui-ux-components.md`         | コンポーネント一覧に追加           |

**更新不要の場合**: `documentation-changelog.md` に「更新なし」と理由を明記する

---

## Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

**P4防止**: 全 Step の完了結果を記録してから「完了」と記載すること。

### documentation-changelog.md 作成

以下の内容を記録:

| セクション        | 記載内容                                 |
| ----------------- | ---------------------------------------- |
| Step 1-A 完了結果 | 更新したファイルの一覧と変更内容         |
| Step 1-B 完了結果 | 更新した実装状況テーブルの詳細           |
| Step 1-C 完了結果 | grep 実行結果と更新した仕様書の一覧      |
| Step 1-D 完了結果 | topic-map.md 再生成の実行結果            |
| Step 2 完了結果   | システム仕様更新の要否判断理由と更新内容 |

### artifacts.json 更新

Phase 12 のステータスを `completed` に更新し、成果物パスを追加する。

**artifacts.json必須項目**:

- Phase 12のステータスが`completed`に更新されていること
- 全Phase（1-12）の成果物パスが登録されていること
- `qualityMetrics`セクションに品質指標が記録されていること

---

## Task 4: 未タスク検出【必須】

**P3防止**: 検出された未タスクは以下の **3ステップ全て** を完了すること。

| ステップ | 内容                                              |
| -------- | ------------------------------------------------- |
| ①        | `docs/30-workflows/unassigned-task/` に指示書作成 |
| ②        | `task-workflow.md` 残課題テーブルに登録           |
| ③        | 関連仕様書に参照リンク追加                        |

### 検出ソース

| #   | ソース                  | 確認項目                     |
| --- | ----------------------- | ---------------------------- |
| 1   | Phase 3 レビュー結果    | MINOR判定の指摘事項          |
| 2   | Phase 10 レビュー結果   | MINOR判定の指摘事項          |
| 3   | Phase 11 手動テスト結果 | スコープ外の発見事項         |
| 4   | 元タスク仕様書          | 「スコープ外」項目           |
| 5   | コードベース            | TODO/FIXME/HACK/XXX コメント |

### スコープ外候補

- シンタックスハイライト機能
- ファイル差分表示機能
- 複数ファイルのタブ表示
- ドラッグ&ドロップによるファイル移動
- ファイル名変更・新規作成・削除機能

---

## Task 5: スキルフィードバックレポート【必須】

**P28防止**: 改善点がなくても「改善点なし」としてレポートを出力する。

| 確認項目           | 記載内容                                             |
| ------------------ | ---------------------------------------------------- |
| ワークフロー改善点 | Phase 1-13 の実行で気づいた改善点                    |
| 技術的教訓         | 実装中に得られた技術的な知見・注意点                 |
| スキル改善提案     | task-specification-creator/skill-creatorへの改善提案 |
| 新規Pitfall候補    | 06-known-pitfalls.mdに追加すべき新規Pitfall          |

---

## IPC機能開発時の追加更新対象ファイル（該当する場合）

IPC チャンネルの追加・変更を伴うタスクの場合、Task 2 Step 2 で以下のファイルの更新要否を確認する:

| #   | 更新対象ファイル                          | 更新内容                                               | 必須/任意 |
| --- | ----------------------------------------- | ------------------------------------------------------ | --------- |
| 1   | `api-ipc-agent.md`                        | 新規チャンネル一覧、型定義、完了タスク記録             | 必須      |
| 2   | `security-electron-ipc.md`                | セキュリティ検証パターン（sender検証、ホワイトリスト） | 必須      |
| 3   | `architecture-overview.md`                | IPCハンドラー登録一覧（registerAllIpcHandlers）        | 必須      |
| 4   | `interfaces-agent-sdk-skill.md`           | インターフェース定義、完了タスク記録                   | 必須      |
| 5   | `task-workflow.md`                        | 残課題テーブル更新、完了タスクセクション追加           | 必須      |
| 6   | `lessons-learned.md`                      | 実装教訓（新規パターン・落とし穴がある場合）           | 任意      |
| 7   | `architecture-implementation-patterns.md` | 実装パターン（新規パターンがある場合）                 | 任意      |

---

## アーキテクチャ層別ドキュメント（AIが判断）

実装ガイドPart 2（技術的詳細）では、タスクの性質に応じて以下の層別にドキュメントを作成する:

| 層                 | ドキュメント対象                                         | 更新対象                        |
| ------------------ | -------------------------------------------------------- | ------------------------------- |
| Renderer Process   | SkillEditor / SkillCodeEditor コンポーネント構成・Props  | `ui-ux-*.md`, `interfaces-*.md` |
| Main Process       | IPC ハンドラ（readFile / writeFile）の実装詳細           | `architecture-*.md`, `api-*.md` |
| IPC通信            | チャネル名定数・引数バリデーション・エラーサニタイズ     | `interfaces-*.md`, `api-*.md`   |
| Preload            | contextBridge 経由 API の型定義・公開メソッド            | `security-api-electron.md`      |
| データ層           | ファイルシステムアクセス・パスバリデーション             | `database-*.md`                 |
| エラーハンドリング | IPC エラー → Renderer 通知のフロー・ユーザー表示パターン | `error-handling.md`             |

## 多角的チェック観点

### 一般品質観点（8観点）

| 観点               | 適用判断                                               | 仕様参照先                                            |
| ------------------ | ------------------------------------------------------ | ----------------------------------------------------- |
| セキュリティ       | IPC チャネルのホワイトリスト管理・パストラバーサル防止 | `aiworkflow-requirements: security-api-electron.md`   |
| UI/UX              | SkillEditor コンポーネントのデザインシステム準拠       | `aiworkflow-requirements: ui-ux-components.md`        |
| アーキテクチャ     | Renderer→Preload→Main の一方向依存準拠                 | `aiworkflow-requirements: architecture-overview.md`   |
| API設計            | IPC チャネル定義・型安全性の確認                       | `aiworkflow-requirements: api-ipc-agent.md`           |
| データ整合性       | ファイル保存・読込のデータ整合性                       | `aiworkflow-requirements: database-*.md`              |
| エラーハンドリング | IPC エラーのサニタイズとユーザー通知フロー             | `aiworkflow-requirements: error-handling.md`          |
| パフォーマンス     | ドキュメント生成・仕様書更新の効率性                   | `aiworkflow-requirements: architecture-overview.md`   |
| アクセシビリティ   | ドキュメントの可読性・構造の明確性                     | `aiworkflow-requirements: ui-ux-design-principles.md` |

### Electronデスクトップアプリ観点（5層）

| 層                         | 適用判断                                                 | 仕様参照先                                                                   |
| -------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| フロントエンド（Renderer） | コンポーネントドキュメントの正確性・Props定義の網羅性    | `aiworkflow-requirements: ui-ux-components.md`                               |
| バックエンド（Main）       | IPC ハンドラドキュメントの正確性・セキュリティ考慮事項   | `aiworkflow-requirements: architecture-overview.md`                          |
| IPC通信                    | チャネル定義ドキュメントの型定義・引数バリデーション記載 | `aiworkflow-requirements: api-ipc-agent.md`, `interfaces-agent-sdk-skill.md` |
| Preload/セキュリティ       | contextBridge API ドキュメントのセキュリティ記載         | `aiworkflow-requirements: security-api-electron.md`                          |
| ローカルストレージ         | ファイルアクセスパターンのドキュメント化                 | `aiworkflow-requirements: database-*.md`                                     |

---

## 苦戦箇所の記録【推奨】

Phase 12 実行中に苦戦した箇所を記録する（今後のタスクへの知見として）:

### 記録テンプレート

```markdown
## 苦戦箇所

### 1. {{問題の概要}}

- **症状**: {{発生した問題の具体的な症状}}
- **原因**: {{問題の根本原因}}
- **解決策**: {{採用した解決策}}
- **学び**: {{将来のタスクへの教訓}}
- **関連Pitfall**: {{該当する場合はPitfall ID（例: P31）}}
```

### 記録が有用なケース

| ケース                       | 記録すべき内容                   |
| ---------------------------- | -------------------------------- |
| 予期しないエラー             | エラーメッセージ、原因、解決策   |
| 仕様理解の齟齬               | 誤解の内容、正しい理解、確認方法 |
| 設計変更                     | 変更前後の設計、変更理由         |
| 時間のかかった調査           | 調査内容、発見方法、参考資料     |
| 06-known-pitfalls.md追加候補 | Pitfall ID候補、パターン、対策   |

**記録タイミング**: Phase 12 実行中に随時記録。完了後にまとめて `documentation-changelog.md` に転記。

---

## 漏れやすいポイント（06-known-pitfalls.md参照）

| #   | Pitfall | 内容                                  | 確認方法                                                            |
| --- | ------- | ------------------------------------- | ------------------------------------------------------------------- |
| 1   | P1      | LOGS.md 2ファイル更新漏れ             | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| 2   | P2      | topic-map.md 再生成忘れ               | セクション変更時は `generate-index.js` を実行                       |
| 3   | P27     | topic-map.md 再生成トリガーの判断ミス | 追加だけでなく削除・更新も再生成トリガー                            |
| 4   | P29     | SKILL.md 変更履歴の更新漏れ           | LOGS.md とは別に SKILL.md の変更履歴テーブルも更新                  |
| 5   | P3      | 未タスク管理の3ステップ不完全         | ①指示書 → ②task-workflow.md登録 → ③関連仕様書リンク                 |

---

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| `generate-documentation-changelog.js` | 手動で `outputs/phase-12/documentation-changelog.md` を作成                          |
| `complete-phase.js`                   | 手動で `artifacts.json` を更新（Phase 12成果物を追加）                               |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、`unassigned-task-detection.md` を作成 |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                                   |

---

## 成果物

| 成果物                     | パス                                            | 必須 | 説明                    |
| -------------------------- | ----------------------------------------------- | ---- | ----------------------- |
| 実装ガイド                 | `outputs/phase-12/implementation-guide.md`      | ✅   | Part 1 + Part 2         |
| コンポーネントドキュメント | `outputs/phase-12/component-documentation.md`   | ✅   | Props・イベント・使用例 |
| ドキュメント更新履歴       | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                |
| 未タスク検出レポート       | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（0件でも出力） |
| スキルフィードバック       | `outputs/phase-12/skill-feedback-report.md`     | ✅   | 改善点なしでも出力      |
| 未完了タスク指示書         | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成          |

---

## 完了条件

### Task 1: 実装ガイド作成

- [ ] 実装ガイド（Part 1: 概念的説明 - 中学生レベル）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] コンポーネントドキュメント（component-documentation.md）が作成されている

### Task 2: システムドキュメント更新

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書の「完了タスク」テーブルにタスクIDと完了日を追加した
- [ ] **詳細テンプレート**で完了記録を追加した（テスト結果サマリー表・成果物テーブル含む）
- [ ] 「関連ドキュメント」セクションに実装ガイドリンクを追加した
- [ ] 「変更履歴」にバージョン番号を追記した
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加した
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加した
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴を更新した
- [ ] `task-specification-creator/SKILL.md` 変更履歴を更新した

#### Step 1-B: 実装状況テーブル更新

- [ ] 該当仕様書の「実装状況」テーブルがある場合、該当行を「完了」に更新した

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "TASK-9A-C"` で全仕様書を検索した
- [ ] 該当タスクのステータスを「**完了**」に更新した

#### Step 1-D: topic-map.md再生成

- [ ] `generate-index.js` を実行して topic-map.md を再生成した

#### Step 2: システム仕様更新

- [ ] システム仕様更新の要否を判断した
- [ ] 更新実施/更新不要の理由を `documentation-changelog.md` に記録した

### Task 3: ドキュメント更新履歴

- [ ] `documentation-changelog.md` が作成されている
- [ ] 各 Step の完了結果が**全て**記録されている（P4防止）
- [ ] `artifacts.json` が更新されている
- [ ] `artifacts.json`の全完了Phase（1-12）のステータスがcompletedであること

### Task 4: 未タスク検出

- [ ] **未タスク検出レポートが出力されている**【0件でも必須】
- [ ] 検出された未タスクに対して **3ステップ全て** が完了している（P3防止）
- [ ] 未タスク指示書の物理ファイル存在を確認した（`ls docs/30-workflows/unassigned-task/` で検証）

### Task 5: スキルフィードバックレポート

- [ ] **スキルフィードバックレポートが出力されている**【改善点なしでも必須（P28防止）】

### 苦戦箇所記録

- [ ] 苦戦箇所の記録が `documentation-changelog.md` に転記されている

### Phase完了確認

- [ ] **本Phase内の全タスク（Task 1〜5）を100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Task 1: 実装ガイド作成（Part 1 + Part 2 + コンポーネントドキュメント）
2. Task 2 Step 1-A: タスク完了記録（LOGS.md x2, SKILL.md x2）
3. Task 2 Step 1-B: 実装状況テーブル更新
4. Task 2 Step 1-C: 関連タスクテーブル更新
5. Task 2 Step 1-D: topic-map.md再生成
6. Task 2 Step 2: システム仕様更新判断
7. Task 3: documentation-changelog.md & artifacts.json更新
8. Task 4: 未タスク検出レポート作成
9. Task 5: スキルフィードバックレポート作成
10. 苦戦箇所の記録
11. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1〜5）を100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] 苦戦箇所が記録されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9A-C-skill-editor-ui --phase 12
```

---

## 次のPhase

Phase 13: PR作成
