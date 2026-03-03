# Phase 8: リファクタリング

## メタ情報

| 項目           | 値                                                                                   |
| -------------- | ------------------------------------------------------------------------------------ |
| タスク ID      | TASK-10A-A                                                                           |
| タスク名       | SkillManagementPanel 実装                                                            |
| Phase          | 8                                                                                    |
| 作成日         | 2026-03-02                                                                           |
| 前 Phase       | Phase 7（カバレッジ確認）                                                            |
| 次 Phase       | Phase 9（品質検証）                                                                  |
| 対象ファイル   | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                |
| テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx` |
| 状態           | 未着手                                                                               |

## 目的

Phase 5-7 で実装したコードの品質を改善する。機能変更は行わない（リファクタリング前後で全テストが同一結果になること）。

---

## 実行タスク

- リファクタリング対象確認: Phase 5-7 の成果物と現行コードを突合し、対象ファイルを固定する
- チェックリスト適用: 6 項目（分離/最適化/CSS/命名/import/マジックナンバー）を順次適用する
- 前後比較テスト: リファクタリング前後で同一テスト結果を確認する
- レポート作成: 判定結果と差分を `outputs/phase-8/refactoring-report.md` に記録する

---

## 参照資料

| 参照資料               | パス                                                                                        | 内容                 |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------------------- |
| Phase 1 要件定義       | `phase-1-requirements.md`                                                                   | 受け入れ基準再確認   |
| Phase 2 設計           | `phase-2-design.md`                                                                         | 設計との差分確認     |
| Phase 5 実装           | `phase-5-implementation.md`                                                                 | 実装対象確認         |
| Phase 6 テスト拡充     | `phase-6-test-expansion.md`                                                                 | 拡充テスト観点確認   |
| Phase 7 カバレッジ確認 | `phase-7-coverage-check.md`                                                                 | カバレッジ結果確認   |
| UI コンポーネント仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | UI 仕様              |
| UI 機能仕様            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 機能境界の確認       |
| IPC API契約            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | 操作API契約確認      |
| コード品質             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質基準             |
| セキュリティ           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ     |
| スキルIPCセキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | スキル操作の防御観点 |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集       |
| 開発ガイドライン       | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | コーディング規約     |
| レビューゲート基準     | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`              | レビュー判定基準     |

---

## 実行手順

### Step 1: リファクタリング前のテスト状態を記録する

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx
```

テスト件数と全 PASS を確認し、結果を `outputs/phase-8/refactoring-report.md` に記録する。

### Step 2: チェックリスト 6 項目を順次確認・適用する

以下の 6 項目を 1 つずつ確認する。該当する場合は修正を適用し、該当しない場合は「該当なし」の理由を記録する。

#### 2-1: コンポーネント分離

- **判定基準**: SkillCard（スキル 1 件分の表示ブロック）が以下のいずれかに該当する場合、`SkillCard.tsx` として独立ファイルに分離する
  - SkillCard の JSX が 50 行を超える
  - SkillCard が `SkillManagementPanel.tsx` 以外のコンポーネントから参照される
- **確認方法**: `wc -l` で SkillCard 部分の行数を計測する。他コンポーネントからの参照は `grep -rn "SkillCard" apps/desktop/src/renderer/` で検索する
- **分離する場合**: `apps/desktop/src/renderer/components/skill/SkillCard.tsx` に切り出し、`SkillManagementPanel.tsx` から import する

#### 2-2: レンダリング最適化

- **確認内容**: `filteredImported`（検索クエリでフィルタされたスキル一覧）が `useMemo` でメモ化されていること
- **期待する依存配列**: `[importedSkills, searchQuery]`
- **確認方法**: `grep -n "useMemo" apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` で使用箇所を確認する
- **修正が必要な場合**: `useMemo(() => ..., [importedSkills, searchQuery])` に変更する

#### 2-3: CSS クラス整理

- **確認内容**: Tailwind CSS クラスに以下の問題がないこと
  - 同一要素に重複するクラスがない（例: `p-4 p-4` のような重複）
  - 3 箇所以上で繰り返される共通スタイルがある場合は、コンポーネント変数として抽出する
- **確認方法**: コンポーネントファイルを目視で確認する

#### 2-4: 命名規則

- **確認内容**:
  - boolean 変数: `is` / `has` / `can` / `should` プレフィックスが付いていること（例: `isLoading`, `hasSkills`）
  - イベントハンドラ: `handle` + 動詞の形式であること（例: `handleDelete`, `handleSearch`）
- **確認方法**: `grep -n "const \|function " SkillManagementPanel.tsx` で変数・関数名を一覧する
- **修正が必要な場合**: 規則に沿わない命名をリネームし、テストファイルの参照も同時に更新する

#### 2-5: 不要 import の除去

- **確認内容**: 使用されていない import 文が存在しないこと
- **確認方法**: `pnpm lint` の出力で `no-unused-vars` または `unused-imports` の警告を確認する
- **修正が必要な場合**: 該当する import 文を削除する

#### 2-6: マジックナンバー除去

- **確認内容**: JSX 内の数値リテラル（例: タイムアウト値、配列のインデックス、ピクセル値）が定数として名前付けされていること
- **確認方法**: ファイル内の数値リテラルを `grep -n "[0-9]" SkillManagementPanel.tsx` で検索する
- **除外対象**: Tailwind CSS のクラス内数値（`p-4`, `gap-2` 等）、0 と 1 は除外
- **修正が必要な場合**: `const MAX_RETRY = 3;` のように意味のある名前の定数に置き換える

### Step 3: リファクタリング後のテスト確認

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx
```

Step 1 と同一のテスト件数・結果であることを確認する。

### Step 4: 変更内容の確認

```bash
git diff --stat
```

変更ファイルがリファクタリング対象のみであることを確認する。

### Step 5: リファクタリングレポートの作成

`outputs/phase-8/refactoring-report.md` に以下を記録する:

```markdown
# Phase 8 リファクタリングレポート

## チェックリスト結果

| #   | 項目                 | 結果                 | 変更内容 / 該当なしの理由 |
| --- | -------------------- | -------------------- | ------------------------- |
| 1   | コンポーネント分離   | ✅適用 / N/A該当なし | （具体的な内容を記載）    |
| 2   | レンダリング最適化   | ✅適用 / N/A該当なし | （具体的な内容を記載）    |
| 3   | CSSクラス整理        | ✅適用 / N/A該当なし | （具体的な内容を記載）    |
| 4   | 命名規則             | ✅適用 / N/A該当なし | （具体的な内容を記載）    |
| 5   | 不要import除去       | ✅適用 / N/A該当なし | （具体的な内容を記載）    |
| 6   | マジックナンバー除去 | ✅適用 / N/A該当なし | （具体的な内容を記載）    |

## テスト結果比較

| 項目       | リファクタリング前 | リファクタリング後 |
| ---------- | ------------------ | ------------------ |
| テスト件数 | （件数）           | （件数）           |
| PASS       | （件数）           | （件数）           |
| FAIL       | 0                  | 0                  |

## 変更ファイル一覧

（git diff --stat の出力を貼り付け）
```

---

## 統合テスト連携

- 仕様契約確認: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` と `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` を参照し、一覧/検索/編集/分析/削除/新規作成の入力・戻り値契約を一致させる。
- セキュリティ観点: `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` と `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` の sender 検証・入力検証方針を適用する。
- テスト接続: Phase 4/6/7 のテスト成果物を Phase 10/11 の判定基準へ接続し、差分が出た場合は Phase 2（設計）または Phase 5（実装）へ戻して再検証する。

## 成果物

| 成果物                   | パス                                    | 説明                                 |
| ------------------------ | --------------------------------------- | ------------------------------------ |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md` | 6 項目のチェック結果とテスト比較結果 |

---

## 完了条件

- [ ] チェックリスト 6 項目の全てを確認した（該当なしの場合もその旨を記録した）
- [ ] リファクタリング後の全テストが PASS した
- [ ] リファクタリング前後でテスト件数と結果が同一である（機能変更なし）
- [ ] `git diff --stat` で変更ファイルがリファクタリング対象のみである
- [ ] `outputs/phase-8/refactoring-report.md` を作成した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 9: 品質検証
