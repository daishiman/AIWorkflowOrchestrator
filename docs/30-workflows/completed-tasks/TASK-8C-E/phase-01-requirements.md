# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 1                                    |
| Phase名    | 要件定義                             |
| 前提Phase  | なし                                 |
| 後続Phase  | Phase 2（設計）                      |
| ステータス | 未実施                               |
| 作成日     | 2026-01-31                           |
| 機能名     | TASK-8C-E: E2Eテストフィクスチャ作成 |

---

## 目的

E2Eテスト用スキルフィクスチャの要件を明確にし、フィクスチャが満たすべき構造・内容・検証基準を定義する。

## 背景

TASK-8C-B（スキル選択E2E）、TASK-8C-C（インポート実行E2E）、TASK-8C-D（パーミッションE2E）の3つのE2Eテストで共通利用するスキルフィクスチャが必要。TASK-2A で実装済みの SkillScanner が正しくパースできるフィクスチャを `apps/desktop/src/__tests__/__fixtures__/skills/` に用意する。

既存のユニットテストフィクスチャ（`apps/desktop/src/main/services/skill/__tests__/__fixtures__/`）は SkillScanner のユニットテスト専用であり、E2Eテストでは独立したフィクスチャセットが必要となる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: フィクスチャ要件の整理

**目的**: E2Eテストが必要とするフィクスチャの種類・構造を明確化する

**実行手順**:

1. 元タスク定義（`docs/30-workflows/skill-import-agent-system/tasks/task-8c-e-fixtures.md`）を読み、必要なフィクスチャ一覧を確認する
2. TASK-8C-B/C/D の定義を読み、各E2Eテストが前提とするフィクスチャの使い方を確認する
3. 以下の3種類のフィクスチャ要件を文書化する：

| フィクスチャ名 | 種別       | 目的                                                   |
| -------------- | ---------- | ------------------------------------------------------ |
| test-skill     | 有効スキル | SKILL.md + agents/ + references/ を持つ完全なスキル    |
| another-skill  | 有効スキル | SKILL.md のみの最小構成スキル                          |
| invalid-skill  | 無効スキル | SKILL.md が存在せず、SkillScanner がスキップするケース |

4. `outputs/phase-01/requirements-definition.md` に要件をまとめる

**期待される成果物**:

- `outputs/phase-01/requirements-definition.md`

---

### タスク2: SkillScanner との整合性確認

**目的**: フィクスチャが SkillScanner のパース仕様に準拠していることを確認する

**実行手順**:

1. SkillScanner の実装（`apps/desktop/src/main/services/skill/SkillScanner.ts`）を読む
2. 以下の仕様との整合性を確認する：
   - SKILL.md の YAML Frontmatter フォーマット（name, description, allowed-tools）
   - サブディレクトリスキャン対象（agents/, references/, scripts/, assets/, schemas/, indexes/）
   - 説明抽出ロジック（最初の見出しまたは段落）
   - 無効スキルのスキップ条件（SKILL.md が存在しない場合）
3. 既存ユニットテストフィクスチャ（`apps/desktop/src/main/services/skill/__tests__/__fixtures__/`）の構造を参考にする
4. 整合性チェック結果を `outputs/phase-01/requirements-definition.md` に追記する

**期待される成果物**:

- 整合性チェック結果（`outputs/phase-01/requirements-definition.md` に含む）

---

### タスク3: 受け入れ基準の定義

**目的**: フィクスチャ完成時の検証可能な基準を定義する

**実行手順**:

1. 以下の受け入れ基準を定義する：

| 基準ID | 基準                                                                   | 検証方法                         |
| ------ | ---------------------------------------------------------------------- | -------------------------------- |
| AC-001 | test-skill/SKILL.md が SkillScanner でパース可能                       | SkillScanner.scanAll() 実行      |
| AC-002 | test-skill/agents/test-agent.md が agents サブリソースとして検出される | scanAll() 結果の agents 配列確認 |
| AC-003 | test-skill/references/test-ref.md が references として検出される       | scanAll() 結果確認               |
| AC-004 | another-skill/SKILL.md が正しくパースされる                            | scanAll() 結果確認               |
| AC-005 | invalid-skill/ が SkillScanner にスキップされる                        | scanAll() 結果に含まれないこと   |
| AC-006 | E2Eテスト（TASK-8C-B/C/D）からフィクスチャが参照可能                   | パスインポートテスト             |

2. `outputs/phase-01/acceptance-criteria.md` に基準をまとめる

**期待される成果物**:

- `outputs/phase-01/acceptance-criteria.md`

---

## 参照資料

| 参照資料                       | パス                                                                                | 内容                            |
| ------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------- |
| 元タスク定義                   | `docs/30-workflows/skill-import-agent-system/tasks/task-8c-e-fixtures.md`           | フィクスチャ要件                |
| SkillScanner 実装              | `apps/desktop/src/main/services/skill/SkillScanner.ts`                              | スキャンロジック                |
| 既存ユニットテストフィクスチャ | `apps/desktop/src/main/services/skill/__tests__/__fixtures__/`                      | 参考フィクスチャ構造            |
| スキル構造仕様                 | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` | SKILL.md仕様                    |
| TASK-8C-B 定義                 | `docs/30-workflows/skill-import-agent-system/tasks/task-8c-b-e2e-selection.md`      | E2Eテスト要件（スキル選択）     |
| TASK-8C-C 定義                 | `docs/30-workflows/skill-import-agent-system/tasks/task-8c-c-e2e-import-execute.md` | E2Eテスト要件（インポート）     |
| TASK-8C-D 定義                 | `docs/30-workflows/skill-import-agent-system/tasks/task-8c-d-e2e-permission.md`     | E2Eテスト要件（パーミッション） |

---

## 成果物

| 成果物       | パス                                          | 内容             |
| ------------ | --------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-01/requirements-definition.md` | フィクスチャ要件 |
| 受け入れ基準 | `outputs/phase-01/acceptance-criteria.md`     | 検証可能な基準   |

---

## 統合テスト連携

**Phase 1 では統合テストの対象外**

要件定義フェーズのため、統合テストは後続の Phase 4 以降で実施する。

---

## 多角的チェック観点

| 観点           | 確認内容                                                       |
| -------------- | -------------------------------------------------------------- |
| テスタビリティ | フィクスチャが各E2Eテストシナリオを十分にカバーしているか      |
| 保守性         | フィクスチャ構造が SkillScanner 仕様変更時に追従しやすいか     |
| セキュリティ   | フィクスチャに機密情報やパストラバーサルパターンが含まれないか |

---

## 完了条件

- [ ] 3種類のフィクスチャ要件（test-skill, another-skill, invalid-skill）が文書化されている
- [ ] SkillScanner パース仕様との整合性が確認されている
- [ ] 受け入れ基準（AC-001〜AC-006）が定義されている
- [ ] 既存ユニットテストフィクスチャとの差異が明確になっている
- [ ] 全成果物が outputs/phase-01/ に配置されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-02-design.md`
