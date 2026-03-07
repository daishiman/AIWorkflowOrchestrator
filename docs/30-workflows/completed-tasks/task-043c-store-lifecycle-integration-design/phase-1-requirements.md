# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 1                                  |
| 機能名   | store-lifecycle-integration-design |
| タスクID | TASK-10A-E-C                       |
| 作成日   | 2026-03-06                         |

## 目的

SkillManagementPanel における import 操作後の一覧即時再計算を実現する selector/action 責務分離を定義し、`TASK-10A-F`（create/analyze 経路）と衝突しない store 境界を確立する。

## 実行タスク

- import ライフサイクルの機能要件を定義する
- selector/action の責務分離要件を定義する
- P31 対策の非機能要件を定義する
- `TASK-10A-F` との境界要件を定義する
- 受け入れ基準をチェックリスト形式で明確化する

## 参照資料

| 参照資料                  | パス                                                                                                                         | 使用目的                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 状態管理仕様              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                 | selector/action 分離と P31 対策 |
| Skill API                 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                            | store action の戻り値契約       |
| 実装パターン              | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                                  | React + store の責務分離        |
| エラー仕様                | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                        | UI 表示に渡すエラー分類         |
| 品質要件                  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                  | 状態遷移回帰を防ぐ品質ゲート    |
| タスク指示書              | `../skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-043c-store-lifecycle-integration-design.md` | スコープと完了条件の正本        |
| リソースマップ            | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                                             | 必要仕様の抽出起点              |
| クイックリファレンス      | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                                                          | IPC/Store/品質基準の即時確認    |
| UI機能仕様                | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                              | SkillManagementPanelの責務境界  |
| IPC仕様                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                         | import/remove関連IPC契約確認    |
| Electron API セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                 | preload公開とIPC安全境界        |
| コンポーネントテスト指針  | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                                            | selector/action回帰テスト観点   |

## 実行手順

### Step 1: スコープ定義

本タスクは**仕様策定のみ**を行い、実装・コミット・PR は後続タスク（TASK-10A-E-D 以降）で実施する。

対象コンポーネント:

| コンポーネント       | 責務                           |
| -------------------- | ------------------------------ |
| SkillManagementPanel | import 操作の UI トリガー      |
| SkillImportDialog    | import 対象選択と実行          |
| agentSlice           | import 状態管理（既存拡張）    |
| store/index.ts       | 個別セレクタの定義（既存拡張） |

### Step 2: 機能要件（FR）

#### FR-1: Import ライフサイクル状態管理

agentSlice に以下の import ライフサイクル状態を定義する（既存実装を正本として確認済み）:

| 状態                      | 型                  | 初期値  | 説明                        |
| ------------------------- | ------------------- | ------- | --------------------------- |
| `isImporting`             | `boolean`           | `false` | import 実行中フラグ         |
| `importingSkillName`      | `SkillName \| null` | `null`  | import 中のスキル名         |
| `skillError`              | `string \| null`    | `null`  | 最後のエラーメッセージ      |
| `importedSkills`          | `ImportedSkill[]`   | `[]`    | import 済みスキル一覧       |
| `availableSkillsMetadata` | `SkillMetadata[]`   | `[]`    | import 可能なスキルメタ一覧 |

#### FR-2: Selector 算出責務

以下の 3 カテゴリの selector を定義する:

| Selector カテゴリ | 算出ロジック                                    | 依存状態                                    |
| ----------------- | ----------------------------------------------- | ------------------------------------------- |
| imported          | `importedSkills` をそのまま返す                 | `importedSkills`                            |
| available         | `availableSkillsMetadata` から imported を除外  | `availableSkillsMetadata`, `importedSkills` |
| filtered          | available に `skillFilter` テキストマッチを適用 | available 算出結果, `skillFilter`           |

#### FR-3: Action 責務分離

| Action             | 責務                                       | 状態遷移                                     |
| ------------------ | ------------------------------------------ | -------------------------------------------- |
| `importSkill`      | IPC 経由で import 実行、成功後に一覧再計算 | idle -> importing -> success/error           |
| `refreshSkillList` | IPC 経由で一覧再取得                       | 既存 `fetchAvailableSkillsMetadata` を再利用 |
| `clearSkillError`  | エラー状態をクリア                         | error -> idle                                |
| `removeSkill`      | IPC 経由で remove 実行、成功後に一覧再計算 | idle -> removing -> success/error            |

#### FR-4: Import 成功後の一覧即時再計算

import 成功時に以下の更新を**単一の `set()` 呼び出し**で実行する:

1. `importedSkills` に新規スキルを追加（重複チェック付き）
2. `availableSkillsMetadata` から import 済みスキルを除外
3. `isImporting` を `false` に戻す
4. `importingSkillName` を `null` に戻す

#### FR-5: Import 失敗時のエラー保持

import 失敗時に以下の更新を実行する:

1. `skillError` にエラーメッセージを設定
2. `isImporting` を `false` に戻す
3. `importingSkillName` を `null` に戻す
4. `importedSkills` と `availableSkillsMetadata` は変更しない

### Step 3: 非機能要件（NFR）

#### NFR-1: P31 無限ループ回避

- 全ての selector は個別セレクタ Hook として定義する
- 合成 Hook（`useSkillStore()` 等）は使用禁止
- アクション関数の参照は Zustand が保証する安定参照を利用する
- `useEffect` 依存配列には個別セレクタ経由のアクション関数のみ許可する

#### NFR-2: 連打防止

- `isImporting === true` の間は `importSkill` の再実行をガードする
- UI 側でボタン disabled 制御を行う

#### NFR-3: Idempotency Guard

- 既に import 済みのスキルに対する `importSkill` 呼び出しは IPC をスキップする
- `importedSkills.some(s => s.name === skillName)` で事前チェック

#### NFR-4: 再レンダー最適化

- selector は必要最小限のフィールドのみ返す
- オブジェクト生成を伴う派生 selector は `useMemo` または Zustand の shallow 比較を検討する

### Step 4: TASK-10A-F 境界定義

| 責務                    | TASK-10A-E-C（本タスク）     | TASK-10A-F                          |
| ----------------------- | ---------------------------- | ----------------------------------- |
| Import 操作             | importSkill, removeSkill     | -                                   |
| Create 操作             | -                            | createSkill                         |
| Analyze/Improve 操作    | -                            | analyzeSkill, autoImproveSkill      |
| 一覧取得                | fetchAvailableSkillsMetadata | -                                   |
| 一覧再計算（import 後） | imported/available/filtered  | -                                   |
| 一覧再計算（create 後） | -                            | create 成功後に一覧再取得を呼び出し |
| エラー状態              | skillError（import 系）      | skillError（create/analyze 系）     |
| isImporting フラグ      | import 操作で制御            | -                                   |
| isAnalyzing フラグ      | -                            | analyze 操作で制御                  |
| isImproving フラグ      | -                            | improve 操作で制御                  |

**共有境界**: `skillError` は単一フィールドを共有する。import 系と create/analyze 系のエラーは同一フィールドに書き込まれるため、後勝ちとなる。これはユーザーに最新のエラーを表示する方針として許容する。

### Step 5: 受け入れ基準

## 統合テスト連携

Phase 4（テスト作成）で以下の観点を引き渡す:

- import 成功/失敗時の状態遷移テスト
- 連打防止（`isImporting` ガード）テスト
- Idempotency guard テスト
- P31 回避テスト（個別セレクタの安定参照確認）
- TASK-10A-F 境界テスト（import 操作が create/analyze 状態に影響しないこと）

## 多角的チェック観点

| 観点       | 確認内容                                             |
| ---------- | ---------------------------------------------------- |
| 機能完全性 | FR-1 ~ FR-5 が全て定義されているか                   |
| P31 対策   | NFR-1 の条件が arch-state-management.md と整合するか |
| 境界明確性 | TASK-10A-F との責務分離が曖昧でないか                |
| 既存互換性 | 既存の agentSlice 状態/アクションと矛盾しないか      |
| エラー分類 | error-handling.md のカテゴリ体系と整合するか         |

## 成果物

| 成果物     | パス                      | 説明           |
| ---------- | ------------------------- | -------------- |
| 要件定義書 | `phase-1-requirements.md` | 本ドキュメント |

## 完了条件

- [x] import ライフサイクルの機能要件（FR-1 ~ FR-5）が定義されている
- [x] selector/action の責務分離が明確に定義されている
- [x] P31 対策を含む非機能要件（NFR-1 ~ NFR-4）が定義されている
- [x] TASK-10A-F との境界が表形式で明確に定義されている
- [x] 受け入れ基準がチェックリスト形式で記載されている
- [x] 本タスクは仕様策定のみで実装を行わないことが明記されている

## 次の Phase

Phase 2: 設計 (`phase-2-design.md`)
