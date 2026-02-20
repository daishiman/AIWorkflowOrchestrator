# Phase 7: カバレッジ確認 — SkillEditor コンポーネント実装

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| タスク ID  | TASK-9A-C                              |
| Phase      | 7（カバレッジ確認）                    |
| 前提 Phase | Phase 6（テスト拡充）                  |
| 後続 Phase | Phase 8（リファクタリング）            |
| ステータス | 未着手                                 |
| 作成日     | 2026-02-19                             |
| 機能名     | SkillEditor コンポーネント             |
| 依存タスク | TASK-9A-B（ファイル編集 IPC ハンドラ） |

## 目的

Phase 6 で拡充したテスト（合計 62 ケース）のカバレッジを測定し、カバレッジ基準を満たしているか判定する。基準未達の場合は Phase 6 に戻ってテストを追加する。

## カバレッジ基準

### ユニットテストカバレッジ

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 統合テストゲート

| テストカテゴリ                 | 目標 |
| ------------------------------ | ---- |
| IPC 連携テスト（readFile）     | 100% |
| IPC 連携テスト（writeFile）    | 100% |
| E2E フロー（選択→読込→保存）   | 100% |
| エラーリカバリ                 | 100% |
| スキル切替（複数ファイル操作） | 100% |

## 実行タスク

### Task 1: カバレッジ計測

**目的**: 全テスト（Phase 4: 39 ケース + Phase 6: 23 ケース = 62 ケース）のカバレッジを計測する。

**実行手順**:

```bash
# apps/desktop ディレクトリから実行（P40 対策）
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/__tests__/
```

**確認項目**:

- [ ] テストが全て PASS している（62/62）
- [ ] カバレッジレポートが出力されている
- [ ] 各モジュールの Line / Branch / Function カバレッジ値を記録する

### Task 2: 各モジュールのカバレッジ判定

**目的**: 各モジュールのカバレッジが基準を満たしているか個別に判定する。

**判定テーブル**:

| モジュール          | Line    | Branch  | Function | 判定      |
| ------------------- | ------- | ------- | -------- | --------- |
| SkillEditor.tsx     | \_\_\_% | \_\_\_% | \_\_\_%  | PASS/FAIL |
| SkillCodeEditor.tsx | \_\_\_% | \_\_\_% | \_\_\_%  | PASS/FAIL |

**判定ロジック**:

- **PASS**: Line ≥ 80% かつ Branch ≥ 60% かつ Function ≥ 80%
- **FAIL**: 上記のいずれかを満たさない場合

**FAIL 時の対応**:

1. カバレッジレポートの未カバー行を確認する
2. 未カバー行の原因を分析する（分岐が未テスト、または関数が未呼び出し）
3. Phase 6 に戻り、該当箇所のテストを追加する
4. テスト追加後、再度 Phase 7 Task 1 からやり直す

### Task 3: 統合テスト実行

**目的**: Phase 6 で作成した統合テスト（4 ケース）が全て PASS していることを確認する。

**実行手順**:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillEditor.integration.test.tsx
```

**確認項目**:

- [ ] INT-01: ファイル選択→読込→編集→保存→未保存ラベル消去 — PASS
- [ ] INT-02: 読込エラー後に別ファイルを正常に読み込める — PASS
- [ ] INT-03: 保存エラー後に再度保存が成功する — PASS
- [ ] INT-04: 複数ファイルを順番に選択・編集・保存できる — PASS

### Task 4: カバレッジレポート作成

**目的**: カバレッジ計測結果を所定のフォーマットでレポートに記録する。

**レポートテンプレート**:

```markdown
## カバレッジ確認結果

**測定日**: 2026-02-XX
**判定**: [PASS / FAIL]

### テスト実行結果

| テストスイート                      | 合計   | PASS | FAIL | SKIP |
| ----------------------------------- | ------ | ---- | ---- | ---- |
| getLanguage.test.ts                 | 13     |      |      |      |
| buildFileTree.test.ts               | 7      |      |      |      |
| SkillCodeEditor.test.tsx            | 6      |      |      |      |
| SkillEditor.test.tsx                | 13     |      |      |      |
| SkillEditor.additional.test.tsx     | 14     |      |      |      |
| SkillCodeEditor.additional.test.tsx | 5      |      |      |      |
| SkillEditor.integration.test.tsx    | 4      |      |      |      |
| **合計**                            | **62** |      |      |      |

### カバレッジサマリー

| モジュール          | Line    | Branch  | Function | 判定 |
| ------------------- | ------- | ------- | -------- | ---- |
| SkillEditor.tsx     | \_\_\_% | \_\_\_% | \_\_\_%  |      |
| SkillCodeEditor.tsx | \_\_\_% | \_\_\_% | \_\_\_%  |      |

### 統合テスト結果

| テストケース               | 結果      |
| -------------------------- | --------- |
| INT-01: E2E フロー         | PASS/FAIL |
| INT-02: 読込エラーリカバリ | PASS/FAIL |
| INT-03: 保存エラーリカバリ | PASS/FAIL |
| INT-04: 複数ファイル操作   | PASS/FAIL |

### ゲート判定

| 判定項目                              | 基準 | 結果    | 判定      |
| ------------------------------------- | ---- | ------- | --------- |
| SkillEditor.tsx Line Coverage         | 80%+ | \_\_\_% | PASS/FAIL |
| SkillEditor.tsx Branch Coverage       | 60%+ | \_\_\_% | PASS/FAIL |
| SkillEditor.tsx Function Coverage     | 80%+ | \_\_\_% | PASS/FAIL |
| SkillCodeEditor.tsx Line Coverage     | 80%+ | \_\_\_% | PASS/FAIL |
| SkillCodeEditor.tsx Branch Coverage   | 60%+ | \_\_\_% | PASS/FAIL |
| SkillCodeEditor.tsx Function Coverage | 80%+ | \_\_\_% | PASS/FAIL |
| 統合テスト（IPC連携）                 | 100% |         | PASS/FAIL |
| 統合テスト（スキル切替）              | 100% |         | PASS/FAIL |

### 未カバー領域（FAIL の場合のみ記載）

| ファイル | 行番号 | 未カバーの理由 | 対応方針 |
| -------- | ------ | -------------- | -------- |
|          |        |                |          |
```

**出力先**: `docs/30-workflows/TASK-9A-C-skill-editor-ui/outputs/phase-7/coverage-report.md`

### Task 5: 完了条件の検証

**目的**: 全ての完了条件を逐一確認し、Phase 7 の完了を判定する。

**確認手順**:

1. カバレッジレポートの全ゲート判定が PASS であることを確認する
2. 統合テスト 4 ケースが全て PASS であることを確認する
3. カバレッジレポートが出力されていることを確認する
4. FAIL 項目がある場合は Phase 6 に戻る（Phase 7 は完了としない）

## Phase 6 への差し戻し判定

### 差し戻し条件

以下の**いずれか**に該当する場合、Phase 6 へ差し戻す:

| 条件                                           | 対応                          |
| ---------------------------------------------- | ----------------------------- |
| Line Coverage < 80% のモジュールが存在する     | 未カバー行のテストを追加      |
| Branch Coverage < 60% のモジュールが存在する   | 未テスト分岐のテストを追加    |
| Function Coverage < 80% のモジュールが存在する | 未呼び出し関数のテストを追加  |
| 統合テストに FAIL がある                       | FAIL テストの原因を特定し修正 |

### 差し戻し手順

1. カバレッジレポートの「未カバー領域」テーブルに不足箇所を記載する
2. Phase 6 に戻り、不足テストを追加する
3. Phase 6 の完了条件を再確認する
4. 再度 Phase 7 を実行する（Task 1 から再開）

## 参照資料

| ドキュメント       | パス                                                                    | 利用目的           |
| ------------------ | ----------------------------------------------------------------------- | ------------------ |
| Phase 4 テスト     | `docs/30-workflows/TASK-9A-C-skill-editor-ui/phase-4-test-creation.md`  | 基本テスト仕様     |
| Phase 5 実装       | `docs/30-workflows/TASK-9A-C-skill-editor-ui/phase-5-implementation.md` | 実装コード参照     |
| Phase 6 テスト拡充 | `docs/30-workflows/TASK-9A-C-skill-editor-ui/phase-6-test-expansion.md` | 追加テスト仕様     |
| カバレッジ基準     | `.claude/rules/02-code-quality.md`                                      | カバレッジ基準定義 |
| P39 注意事項       | `.claude/rules/06-known-pitfalls.md#P39`                                | happy-dom の制約   |
| P40 注意事項       | `.claude/rules/06-known-pitfalls.md#P40`                                | テスト実行方法     |

### システム仕様（aiworkflow-requirements）

| ドキュメント                     | パス                                                                                        | 利用目的                     |
| -------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| UIコンポーネント仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | コンポーネント構成の参照     |
| デザインシステム                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | カラーパレット・スタイル参照 |
| 機能コンポーネント仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 機能コンポーネント設計参照   |
| アーキテクチャ概要               | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | レイヤー構造の参照           |
| 実装パターン                     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターンの参照           |
| 状態管理                         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | 状態管理設計の参照           |
| Agent SDK Skill インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill 型定義の参照           |
| セキュリティ API                 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | Electron セキュリティ設計    |
| IPC セキュリティ                 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC 通信パターンの参照       |
| エラーハンドリング               | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラー処理パターンの参照     |
| テストコンポーネントパターン     | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | テスト設計パターンの参照     |

## 実行手順

### 1. カバレッジ計測

`cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/__tests__/` を実行し、全 62 テストの PASS とカバレッジレポート出力を確認する（Task 1）。

### 2. 各モジュールのカバレッジ判定

SkillEditor.tsx と SkillCodeEditor.tsx の Line / Branch / Function カバレッジを基準値（80% / 60% / 80%）と比較し、PASS / FAIL を判定する（Task 2）。

### 3. 統合テスト実行

統合テスト 4 ケース（INT-01〜INT-04）を個別に実行し、全 PASS を確認する（Task 3）。

### 4. カバレッジレポート作成と完了条件検証

カバレッジ計測結果を `outputs/phase-7/coverage-report.md` に記録し、全ゲート判定が PASS であることを確認する（Task 4, 5）。FAIL 項目がある場合は Phase 6 に差し戻す。

## 統合テスト連携【必須】

統合テストの再実行とゲート判定:

| 判定項目                              | 基準 | 結果 |
| ------------------------------------- | ---- | ---- |
| SkillEditor.tsx Line Coverage         | 80%+ |      |
| SkillEditor.tsx Branch Coverage       | 60%+ |      |
| SkillEditor.tsx Function Coverage     | 80%+ |      |
| SkillCodeEditor.tsx Line Coverage     | 80%+ |      |
| SkillCodeEditor.tsx Branch Coverage   | 60%+ |      |
| SkillCodeEditor.tsx Function Coverage | 80%+ |      |
| 統合テスト（IPC 連携）                | 100% |      |
| 統合テスト（エラーリカバリ）          | 100% |      |
| 統合テスト（複数ファイル操作）        | 100% |      |

## 多角的チェック観点

### 一般観点

| 観点               | 適用判断 | 仕様参照先                                                                         |
| ------------------ | -------- | ---------------------------------------------------------------------------------- |
| カバレッジ基準充足 | 適用     | `02-code-quality.md` — Line 80%+, Branch 60%+, Function 80%+ を全モジュールで達成  |
| テストケース網羅性 | 適用     | `testing-component-patterns.md` — 正常系・異常系・境界値・a11y が Phase 4+6 で網羅 |
| 統合テスト         | 適用     | `phase-6-test-expansion.md` — IPC 連携の E2E フローが全て PASS                     |
| テスト品質         | 適用     | `06-known-pitfalls.md#P9` — テスト間で状態を共有していない                         |
| テスト環境         | 適用     | `06-known-pitfalls.md#P39` — happy-dom + fireEvent で全テスト実行                  |
| テスト実行方法     | 適用     | `06-known-pitfalls.md#P40` — `apps/desktop/` ディレクトリから実行                  |
| 差し戻しループ     | 適用     | Phase 7 仕様 — FAIL 時に Phase 6 へ戻りテスト追加→Phase 7 再実行のループが定義済み |
| レポート完全性     | 適用     | Phase 7 完了基準 — カバレッジレポートに全モジュールの結果が記録されている          |

### Electron デスクトップアプリ観点

| 層       | 適用判断                                    | 仕様参照先                      |
| -------- | ------------------------------------------- | ------------------------------- |
| Renderer | 適用 — カバレッジ計測対象                   | `ui-ux-components.md`           |
| Main     | 対象外 — 本タスクは Renderer 層のみ         | —                               |
| IPC      | 適用 — 統合テストカバレッジ判定             | `security-electron-ipc.md`      |
| Preload  | 対象外 — TASK-9A-B で実装済み               | —                               |
| Shared   | 適用 — ImportedSkill 型関連のカバレッジ確認 | `interfaces-agent-sdk-skill.md` |

## 成果物

| 成果物             | パス                                                                                     | 説明               |
| ------------------ | ---------------------------------------------------------------------------------------- | ------------------ |
| カバレッジレポート | `docs/30-workflows/TASK-9A-C-skill-editor-ui/outputs/phase-7/coverage-report.md`         | カバレッジ計測結果 |
| 統合テスト結果     | `docs/30-workflows/TASK-9A-C-skill-editor-ui/outputs/phase-7/integration-test-result.md` | 統合テスト実行結果 |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（SkillEditor.tsx: Line 80%+, Branch 60%+, Function 80%+）
- [ ] ユニットテストカバレッジ基準を達成（SkillCodeEditor.tsx: Line 80%+, Branch 60%+, Function 80%+）
- [ ] 統合テスト 4 ケースが全て PASS
- [ ] カバレッジレポートが `outputs/phase-7/coverage-report.md` に出力されている
- [ ] 統合テスト結果が `outputs/phase-7/integration-test-result.md` に出力されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. カバレッジ計測（Task 1）
2. 各モジュールのカバレッジ判定（Task 2）
3. 統合テスト実行（Task 3）
4. カバレッジレポート作成（Task 4）
5. 完了条件の検証（Task 5）

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

---

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] カバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 統合テスト 4 ケースが全て PASS
- [ ] カバレッジレポートが出力されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9A-C-skill-editor-ui --phase 7
```

---

## 次の Phase

Phase 8: リファクタリング（TDD: Refactor）
