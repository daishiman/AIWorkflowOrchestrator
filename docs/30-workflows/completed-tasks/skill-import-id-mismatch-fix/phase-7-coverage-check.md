# Phase 7: カバレッジ確認 — UT-FIX-SKILL-IMPORT-ID-MISMATCH-001

## メタ情報

| 項目     | 内容                                |
| -------- | ----------------------------------- |
| Phase    | 7（カバレッジ確認）                 |
| タスクID | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 |
| 機能名   | skill-import-id-mismatch-fix        |
| 作成日   | 2026-02-22                          |
| 前Phase  | Phase 6（テスト拡充）               |

## 目的

Phase 6 で拡充したテストのカバレッジを計測し、プロジェクトのカバレッジ基準（Line 80%以上、Branch 60%以上、Function 80%以上）を満たしていることを確認する。基準未達の場合は Phase 6 に戻ってテストを追加する。

## 参照資料

| 参照資料                   | パス                                                                                                    | 内容                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| スキルインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                       | skill:import チャンネル契約                          |
| 状態管理仕様               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                            | agentSlice設計                                       |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                           | IPC引数の整合性確認手順                              |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                                    | P39, P40, P41, P44, P45                              |
| テストパターン             | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                       | コンポーネントテスト設計                             |
| コード品質ルール           | `.claude/rules/02-code-quality.md`                                                                      | カバレッジ基準（Line 80%, Branch 60%, Function 80%） |
| Phase 5 実装結果           | `docs/30-workflows/skill-import-id-mismatch-fix/phase-5-implementation.md`                              | 実装完了内容                                         |
| 前Phaseの成果物            | `docs/30-workflows/skill-import-id-mismatch-fix/outputs/phase-6/`                                       | テスト拡充結果                                       |
| テストファイル             | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx` | Phase 6 時点で61テスト                               |
| 対象コンポーネント         | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx`                            | 234行（修正後）                                      |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                                   |
| -------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| スキルインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | `skill:import(skillName: string)` 契約 |
| API IPC仕様                | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPCチャネル引数/戻り値の整合条件       |
| 実装パターン仕様           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P44/P45対策パターン                    |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 契約ドリフト回避手順                   |

## 実行タスク

- Task 1: カバレッジ計測コマンドを実行して結果を取得する
- Task 2: Line/Branch/Function の3指標を基準値で判定する
- Task 3: 未カバー行・未カバー分岐を分析する
- Task 4: 基準達成可否を判定し未達時はPhase 6へ戻す
- Task 5: カバレッジレポートを成果物として記録する

### Task 1: カバレッジ計測の実行

以下のコマンドでカバレッジを計測する:

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx
```

カバレッジレポートの出力先: `apps/desktop/coverage/` ディレクトリ

### Task 2: カバレッジ基準の確認

対象ファイル `SkillImportDialog/index.tsx` のカバレッジを以下の基準で確認する:

| 指標              | 最低基準 | 推奨基準 | 判定 |
| ----------------- | -------- | -------- | ---- |
| Line Coverage     | 80%      | 90%      |      |
| Branch Coverage   | 60%      | 70%      |      |
| Function Coverage | 80%      | 90%      |      |

### Task 3: カバレッジ分析

カバレッジレポート（`apps/desktop/coverage/index.html` をブラウザで確認、またはターミナル出力を確認）から以下を分析する:

#### 3-1: 全行の実行状況

SkillImportDialog/index.tsx の各行の実行状況を確認し、未カバー行を特定する。

期待される高カバレッジ行:

- Props 型定義（5-18行）: 型定義のためカバレッジ対象外
- コンポーネント関数本体（24-232行）: Phase 4-6 のテストで網羅
- `handleToggleSkill`（79-94行）: 選択/解除/インポート済みガードの3パスを検証済み
- `handleImport`（96-99行）: インポートテストで検証済み
- `filteredSkills`（69-77行）: 検索テストで検証済み
- レンダリング部分（103-231行）: 表示制御テストで検証済み

#### 3-2: 分岐の実行状況

以下の分岐が全てカバーされていることを確認する:

| 分岐箇所                                    | 行番号 | 条件                 | true パス                                                        | false パス                                         |
| ------------------------------------------- | ------ | -------------------- | ---------------------------------------------------------------- | -------------------------------------------------- |
| `if (!isOpen)`                              | 64     | ダイアログ非表示     | Phase 4 `閉じているときはレンダリングしない`                     | Phase 4 `開いているときはダイアログを表示する`     |
| `if (!searchQuery)`                         | 70     | 検索クエリなし       | Phase 4 `利用可能なスキルを表示する`                             | Phase 4 `検索機能がある`                           |
| `if (importedSkillIds.includes(skillName))` | 81     | インポート済みガード | Phase 6 `インポート済みスキルはtoggleしても選択状態が変わらない` | Phase 4 `スキルを選択できる`                       |
| `if (next.has(skillName))`                  | 87     | 選択済み判定         | Phase 4 `選択を解除できる`                                       | Phase 4 `スキルを選択できる`                       |
| `isImported` (三項演算子)                   | 163    | スタイル分岐         | Phase 4 `既にインポート済みのスキルをマークする`                 | Phase 4 `スキルを選択できる`                       |
| `isSelected` (三項演算子)                   | 166    | スタイル分岐         | Phase 4 `スキルを選択できる`                                     | Phase 4 `利用可能なスキルを表示する`               |
| `filteredSkills.length === 0`               | 198    | 0件メッセージ        | Phase 4 `検索結果が0件の場合にメッセージを表示する`              | Phase 4 `利用可能なスキルを表示する`               |
| `selectedCount > 0`                         | 208    | 選択数表示           | Phase 4 `選択数を表示する`                                       | Phase 4 `選択がない場合はインポートボタンを無効化` |
| `disabled={selectedCount === 0}`            | 221    | ボタン無効化         | Phase 4 `選択がない場合はインポートボタンを無効化`               | Phase 4 `選択があればインポートボタンを有効化`     |

#### 3-3: 関数の実行状況

以下の関数が全てカバーされていることを確認する:

| 関数名                           | 行番号 | テストでの呼び出し                         |
| -------------------------------- | ------ | ------------------------------------------ |
| `SkillImportDialog`              | 24     | 全テストでレンダリング                     |
| `handleToggleSkill`              | 79     | `スキルを選択できる`                       |
| `handleImport`                   | 96     | `選択したスキルのnameでonImportを呼び出す` |
| `handleKeyDown`                  | 49     | `Escapeキーでoncloseを呼び出す`            |
| `filteredSkills` filter callback | 69     | `検索機能がある`                           |
| `setSelectedIds` updater         | 85     | `スキルを選択できる`                       |

**P41 注意**: Vitest の v8 カバレッジプロバイダは、インライン arrow function を独立した関数としてカウントする。`filteredSkills` のフィルタコールバック（70-76行）やイベントハンドラ（`() => handleToggleSkill(skill.id)`）がカウントされるため、テストで明示的に呼び出す必要がある。

### Task 4: 基準判定

#### 全基準達成の場合

3つの指標全てが最低基準を満たしている場合:

1. カバレッジレポートのスクリーンショットまたはターミナル出力を保存する
2. `outputs/phase-7/coverage-report.md` に結果を記録する
3. Phase 8（リファクタリング）に進む

#### 基準未達の場合

いずれかの指標が最低基準に達していない場合:

1. 未カバー行・未カバー分岐を特定する
2. `outputs/phase-7/coverage-gap-analysis.md` にギャップ分析を記録する
3. Phase 6 に戻り、不足テストを追加する
4. 再度 Phase 7 を実行する

### Task 5: カバレッジレポートの記録

以下の形式で `outputs/phase-7/coverage-report.md` に結果を記録する:

```markdown
# カバレッジレポート — UT-FIX-SKILL-IMPORT-ID-MISMATCH-001

## 計測日時

YYYY-MM-DD HH:MM

## 対象ファイル

- `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx`

## カバレッジ結果

| 指標              | 計測値 | 最低基準 | 推奨基準 | 判定      |
| ----------------- | ------ | -------- | -------- | --------- |
| Line Coverage     | XX%    | 80%      | 90%      | PASS/FAIL |
| Branch Coverage   | XX%    | 60%      | 70%      | PASS/FAIL |
| Function Coverage | XX%    | 80%      | 90%      | PASS/FAIL |

## 未カバー行（該当する場合）

- 行XX: 理由

## 総合判定

PASS / FAIL（Phase 6 へ戻る）
```

## 統合テスト連携

カバレッジ計測の対象は SkillImportDialog/index.tsx 単体のカバレッジである。AgentView/index.tsx のカバレッジは本Phaseのスコープ外とする。

AgentView のカバレッジ確認が必要な場合は、以下のコマンドで個別に計測できる:

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/views/AgentView/__tests__/
```

## アーキテクチャ層別観点

| 層                   | カバレッジ確認対象          | 備考                 |
| -------------------- | --------------------------- | -------------------- |
| Renderer (Component) | SkillImportDialog/index.tsx | 本Phaseの主対象      |
| Renderer (View)      | AgentView/index.tsx         | 本Phaseのスコープ外  |
| Renderer (Store)     | agentSlice.ts               | 変更なし、スコープ外 |
| Preload              | 変更なし                    | スコープ外           |
| Main                 | 変更なし                    | スコープ外           |

## 成果物

| 成果物                     | パス                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| カバレッジレポート         | `docs/30-workflows/skill-import-id-mismatch-fix/outputs/phase-7/coverage-report.md`       |
| ギャップ分析（未達時のみ） | `docs/30-workflows/skill-import-id-mismatch-fix/outputs/phase-7/coverage-gap-analysis.md` |

## 完了条件

- [ ] `cd apps/desktop && pnpm vitest run --coverage ...` でカバレッジを計測した
- [ ] SkillImportDialog/index.tsx の Line Coverage が 80% 以上である
- [ ] SkillImportDialog/index.tsx の Branch Coverage が 60% 以上である
- [ ] SkillImportDialog/index.tsx の Function Coverage が 80% 以上である
- [ ] 未カバー行・未カバー分岐を分析し、意図的な除外か確認した
- [ ] P41 準拠: インライン arrow function のカバレッジ低下がないことを確認した
- [ ] カバレッジレポートを `outputs/phase-7/coverage-report.md` に保存した
- [ ] 基準未達の場合は Phase 6 に戻り、テスト追加後に再計測した

## 次のPhase

Phase 8: リファクタリング — `phase-8-refactoring.md`

（基準未達の場合は Phase 6 に戻る）
