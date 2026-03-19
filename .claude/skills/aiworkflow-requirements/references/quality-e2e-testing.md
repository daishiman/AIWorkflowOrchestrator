# E2Eテスト仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [quality-requirements.md](./quality-requirements.md)

## 変更履歴

| Version | Date       | Changes                                                                                                             |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| 1.5.0   | 2026-02-02 | TASK-8C-D完了: Playwrightパターン・ダイアログパターンリファレンス追加、関連ドキュメントリンク拡充                    |
| 1.4.0   | 2026-02-02 | TASK-8C-C詳細追記: テストケース詳細表追加、architecture-implementation-patterns.mdへのリンク追加                     |
| 1.3.0   | 2026-02-02 | TASK-8C-C完了: E2Eテスト-インポート・実行フロー記録追加（9テストケース・フィクスチャ連携）                           |
| 1.2.0   | 2026-02-02 | TASK-8C-B完了: スキル選択フローE2Eテスト（8件テスト実装、ARIA属性ベースセレクタ、キーボード操作・アクセシビリティ検証） |
| 1.1.0   | 2026-02-01 | TASK-8C-G完了: skill-creatorフィクスチャ境界値テスト拡充記録追加（6フィクスチャ・96テストPASS・100%ギャップカバレッジ） |
| 1.0.0   | 2026-02-01 | TASK-8C-E完了: 初版作成（E2Eフィクスチャ仕様、テスト戦略、完了タスク記録）                                           |

---

## 概要

E2Eテストはスキルインポートエージェントシステム全体のユーザーフロー（スキル選択→インポート→実行→権限確認）を検証する。PlaywrightとVitest を使用し、共通フィクスチャに対してテストを実行する。

**テストファイル配置**:

| 種類             | パス                                                         |
| ---------------- | ------------------------------------------------------------ |
| E2Eテストコード  | `apps/desktop/src/__tests__/*.e2e.ts`                        |
| フィクスチャ     | `apps/desktop/src/__tests__/__fixtures__/skills/`            |
| フィクスチャ検証 | `apps/desktop/src/__tests__/fixtures/skills.fixture.test.ts` |

---

## テスト戦略

### テストピラミッド（スキル管理機能）

| レベル         | 対象                         | カバレッジ目標   | ツール              |
| -------------- | ---------------------------- | ---------------- | ------------------- |
| ユニットテスト | SkillScanner, SkillParser等  | 90%              | Vitest              |
| 統合テスト     | IPC通信、Store連携           | 80%              | Vitest + MSW        |
| E2Eテスト      | ユーザーフロー（選択〜権限） | クリティカルパス | Vitest + Playwright |

### E2Eテスト対象フロー

| フロー         | タスクID  | テストケース数 | 内容                             |
| -------------- | --------- | -------------- | -------------------------------- |
| スキル選択     | TASK-8C-B | 8              | ドロップダウン表示・選択・解除・キーボード操作・アクセシビリティ |
| インポート実行 | TASK-8C-C | 6              | インポートダイアログ・実行・中止 |
| 権限ダイアログ | TASK-8C-D | 5              | 許可・拒否・選択記憶             |

---

## E2Eテストフィクスチャ

### ディレクトリ構造

| パス                                                                  | 役割                             |
| --------------------------------------------------------------------- | -------------------------------- |
| `src/__tests__/__fixtures__/skills/`                                  | E2Eテストフィクスチャルート      |
| `src/__tests__/__fixtures__/skills/test-skill/`                       | 完全構成スキル                   |
| `src/__tests__/__fixtures__/skills/test-skill/SKILL.md`               | スキル定義（Frontmatter + body） |
| `src/__tests__/__fixtures__/skills/test-skill/agents/`                | エージェントサブリソース         |
| `src/__tests__/__fixtures__/skills/test-skill/agents/test-agent.md`   | テスト用エージェント             |
| `src/__tests__/__fixtures__/skills/test-skill/references/`            | 参照サブリソース                 |
| `src/__tests__/__fixtures__/skills/test-skill/references/test-ref.md` | テスト用参照資料                 |
| `src/__tests__/__fixtures__/skills/another-skill/`                    | 最小構成スキル                   |
| `src/__tests__/__fixtures__/skills/another-skill/SKILL.md`            | Frontmatter + body のみ          |
| `src/__tests__/__fixtures__/skills/invalid-skill/`                    | 無効スキル（ネガティブテスト用） |
| `src/__tests__/__fixtures__/skills/invalid-skill/README.md`           | 目的説明（SKILL.md なし）        |

### フィクスチャ設計原則

| 原則             | 説明                                                       |
| ---------------- | ---------------------------------------------------------- |
| 3パターン網羅    | 完全構成・最小構成・無効構成で正常系/境界値/異常系をカバー |
| SkillScanner互換 | `ScannedSkillMetadata` 型に完全対応するFrontmatter構造     |
| 独立性           | ユニットテストフィクスチャとは独立（相互非依存）           |
| 決定論的         | テスト結果が実行環境に依存しない固定コンテンツ             |

### ユニットテストフィクスチャとの違い

| 観点   | ユニットテスト用                                        | E2E用（本フィクスチャ）                  |
| ------ | ------------------------------------------------------- | ---------------------------------------- |
| 配置先 | `src/main/services/skill/__tests__/__fixtures__/`       | `src/__tests__/__fixtures__/skills/`     |
| 目的   | SkillScanner 単体テスト                                 | E2Eテスト（TASK-8C-B/C/D）共通利用       |
| 独立性 | SkillScanner テスト専用。変更はユニットテストのみに影響 | E2Eテスト共通。変更は複数E2Eテストに影響 |

---

## フィクスチャ詳細仕様

### test-skill（完全構成スキル）

SkillScanner パース期待値:

| フィールド   | 型                   | 値                                                              |
| ------------ | -------------------- | --------------------------------------------------------------- |
| name         | `string`             | `"test-skill"`                                                  |
| description  | `string`             | `"E2Eテスト用のスキル"`                                         |
| allowedTools | `string[]`           | `["Read", "Write", "Edit", "Bash"]`                             |
| readonly     | `boolean`            | `false`（aiworkflow側ディレクトリのため）                       |
| agents       | `SkillSubResource[]` | 1件: `{filename: "test-agent.md", description: "Test Agent"}`   |
| references   | `SkillSubResource[]` | 1件: `{filename: "test-ref.md", description: "Test Reference"}` |
| scripts      | `SkillSubResource[]` | `[]`                                                            |
| assets       | `SkillSubResource[]` | `[]`                                                            |
| schemas      | `SkillSubResource[]` | `[]`                                                            |
| indexes      | `SkillSubResource[]` | `[]`                                                            |

SKILL.md Frontmatter 構造:

| キー          | 値                          |
| ------------- | --------------------------- |
| name          | `test-skill`                |
| description   | `E2Eテスト用のスキル`       |
| allowed-tools | `[Read, Write, Edit, Bash]` |

### another-skill（最小構成スキル）

SkillScanner パース期待値:

| フィールド   | 型         | 値                     |
| ------------ | ---------- | ---------------------- |
| name         | `string`   | `"another-skill"`      |
| description  | `string`   | `"別のテスト用スキル"` |
| allowedTools | `string[]` | `["Read", "Glob"]`     |
| agents       | `[]`       | 空配列                 |
| references   | `[]`       | 空配列                 |

### invalid-skill（無効スキル）

| 項目             | 内容                                                |
| ---------------- | --------------------------------------------------- |
| SKILL.md         | **存在しない**（意図的）                            |
| README.md        | テスト目的の説明のみ                                |
| SkillScanner動作 | スキップされ、scanAll()結果に含まれない             |
| 期待ログ出力     | `[SkillScanner] Skipping skill at ...invalid-skill` |

---

## フィクスチャ検証テスト

### テストファイル

`apps/desktop/src/__tests__/fixtures/skills.fixture.test.ts`（29テストケース）

### テストケース一覧

| TC     | describe                         | it                                           | 優先度 |
| ------ | -------------------------------- | -------------------------------------------- | ------ |
| TC-001 | E2E Skill Fixtures               | test-skill/SKILL.md が存在する               | 高     |
| TC-002 | E2E Skill Fixtures               | test-skill/agents/test-agent.md が存在する   | 高     |
| TC-003 | E2E Skill Fixtures               | test-skill/references/test-ref.md が存在する | 高     |
| TC-004 | E2E Skill Fixtures               | another-skill/SKILL.md が存在する            | 高     |
| TC-005 | E2E Skill Fixtures               | invalid-skill/README.md が存在する           | 高     |
| TC-006 | E2E Skill Fixtures               | invalid-skill に SKILL.md がない             | 高     |
| TC-007 | E2E Skill Fixtures               | test-skill/SKILL.md が空でない               | 中     |
| TC-008 | E2E Skill Fixtures               | another-skill/SKILL.md が空でない            | 中     |
| TC-009 | SkillScanner Fixture Integration | scanAll()が2件のスキルを返す                 | 高     |
| TC-010 | SkillScanner Fixture Integration | test-skill のnameが正しい                    | 高     |
| TC-011 | SkillScanner Fixture Integration | test-skill のdescriptionが正しい             | 高     |
| TC-012 | SkillScanner Fixture Integration | another-skill のnameが正しい                 | 高     |
| TC-013 | SkillScanner Fixture Integration | another-skill のdescriptionが正しい          | 高     |
| TC-014 | SkillScanner Fixture Integration | invalid-skill が結果に含まれない             | 高     |
| TC-015 | SkillScanner Fixture Integration | test-skill のallowedToolsが4件               | 中     |
| TC-016 | SkillScanner Fixture Integration | allowedToolsにRead,Write,Edit,Bashを含む     | 中     |
| TC-017 | SkillScanner Fixture Integration | another-skill のallowedToolsが2件            | 中     |
| TC-018 | SkillScanner Fixture Integration | test-skill のagentsが1件                     | 中     |
| TC-019 | SkillScanner Fixture Integration | agent filenameがtest-agent.md                | 中     |
| TC-020 | SkillScanner Fixture Integration | agent descriptionがTest Agent                | 中     |
| TC-021 | SkillScanner Fixture Integration | test-skill のreferencesが1件                 | 中     |
| TC-022 | SkillScanner Fixture Integration | reference filenameがtest-ref.md              | 中     |
| TC-023 | SkillScanner Fixture Integration | reference descriptionがTest Reference        | 中     |
| TC-024 | SkillScanner Fixture Integration | another-skill のagentsが空                   | 中     |
| TC-025 | SkillScanner Fixture Integration | another-skill のreferencesが空               | 中     |
| TC-026 | Directory Structure Validation   | test-skill ディレクトリが存在する            | 中     |
| TC-027 | Directory Structure Validation   | agents サブディレクトリが存在する            | 中     |
| TC-028 | Directory Structure Validation   | references サブディレクトリが存在する        | 中     |
| TC-029 | Directory Structure Validation   | invalid-skill ディレクトリが存在する         | 中     |

### テスト実行方法

Vitest から直接実行: `npx vitest run src/__tests__/fixtures/skills.fixture.test.ts`

### テスト結果（TASK-8C-E Phase 9 時点）

| メトリクス   | 値     |
| ------------ | ------ |
| テスト数     | 29     |
| 全PASS       | 29/29  |
| 実行時間     | 約60ms |
| ESLintエラー | 0      |
| TODO/FIXME   | 0      |

---

## SkillScannerテスト統合パターン

E2Eテストで SkillScanner をフィクスチャに対して実行する際の標準パターン:

### Scanner初期化

| パラメータ          | 値                                                     | 説明                         |
| ------------------- | ------------------------------------------------------ | ---------------------------- |
| aiworkflowSkillsDir | `path.join(__dirname, '..', '__fixtures__', 'skills')` | フィクスチャディレクトリ     |
| claudeSkillsDir     | `/non-existent-path-for-test`                          | テスト不要のため無効パス指定 |

### ヘルパー関数

| 関数              | 戻り値         | 用途                     |
| ----------------- | -------------- | ------------------------ |
| `fixturePath()`   | `string`       | フィクスチャ内のパス解決 |
| `createScanner()` | `SkillScanner` | テスト用Scanner生成      |

---

## 完了タスク

| タスクID  | タスク名                                  | 完了日     | テスト結果 |
| --------- | ----------------------------------------- | ---------- | ---------- |
| TASK-8C-B | E2Eテスト - スキル選択フロー              | 2026-02-02 | 8/8 PASS   |
| TASK-8C-C | E2Eテスト - インポート・実行フロー        | 2026-02-02 | 9/9 PASS   |
| TASK-8C-D | E2Eテスト - 権限ダイアログフロー          | 2026-02-02 | 12/12 PASS |
| TASK-8C-E | E2Eテストフィクスチャ作成                 | 2026-02-01 | 29/29 PASS |
| TASK-8C-F | Skill-Creator テスト用フィクスチャ        | 2026-02-01 | 62/62 PASS |
| TASK-8C-G | skill-creatorフィクスチャ境界値テスト拡充 | 2026-02-01 | 96/96 PASS |

### タスク: TASK-8C-B スキル選択フローE2Eテスト（2026-02-02完了）

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | TASK-8C-B                                                |
| 完了日       | 2026-02-02                                               |
| ステータス   | **完了**                                                 |
| テスト数     | 8件（自動テスト）+ 8件（手動テスト設計確認）             |
| 発見課題     | 0件                                                      |
| ドキュメント | `docs/30-workflows/TASK-8C-B/`                           |

#### テスト結果サマリー

| カテゴリ           | テスト数 | PASS | FAIL |
| ------------------ | -------- | ---- | ---- |
| 基本表示           | 2        | 2    | 0    |
| スキル選択         | 2        | 2    | 0    |
| キーボード操作     | 2        | 2    | 0    |
| アクセシビリティ   | 2        | 2    | 0    |

#### テストケース詳細

| No  | テストケース                                   | カテゴリ         |
| --- | ---------------------------------------------- | ---------------- |
| 1   | should display skill selector in chat panel    | 基本表示         |
| 2   | should open dropdown and show available skills | 基本表示         |
| 3   | should select a skill                          | スキル選択       |
| 4   | should deselect skill by clicking なし         | スキル選択       |
| 5   | should support keyboard navigation             | キーボード操作   |
| 6   | should close dropdown when clicking outside    | キーボード操作   |
| 7   | should have proper ARIA attributes             | アクセシビリティ |
| 8   | should close dropdown on Escape key            | アクセシビリティ |

#### 成果物

| 成果物             | パス                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| E2Eテストファイル  | `apps/desktop/src/__tests__/skillSelection.e2e.ts`                         |
| テスト結果レポート | `docs/30-workflows/TASK-8C-B/outputs/phase-11/manual-test-result.md`       |
| 実装ガイド         | `docs/30-workflows/TASK-8C-B/outputs/phase-12/implementation-guide.md`     |

#### TASK-8C-C: E2Eテスト - インポート・実行フロー (2026-02-02)

- テストファイル: `apps/desktop/src/__tests__/skillImportExecution.e2e.ts`
- 9テストケース (TC-1〜TC-9) 実装完了
- フロー: インポートフロー(3件) + 実行フロー(3件) + 再スキャン(1件) + エッジケース(2件)
- 依存: TASK-8C-E（フィクスチャ）、TASK-7D（ChatPanel統合）
- 成果物: `docs/30-workflows/TASK-8C-C/outputs/`

**テストケース詳細**:

| TC | フロー | 検証内容 |
|----|--------|----------|
| TC-1 | Import | 未インポートスキル選択時にインポートダイアログ表示 |
| TC-2 | Import | ダイアログ内で許可ツール・サブエージェント表示 |
| TC-3 | Import | インポート完了後、インポート済みセクションに追加 |
| TC-4 | Execution | スキル実行中にストリーミングビュー表示 |
| TC-5 | Execution | 実行中に停止ボタン表示 |
| TC-6 | Execution | 停止ボタン押下後、キャンセル状態に遷移 |
| TC-7 | Rescan | 再スキャン実行でスキル一覧更新 |
| TC-8 | Edge | 無効スキル（SKILL.mdなし）は一覧非表示 |
| TC-9 | Edge | インポート済みスキル再選択時はダイアログスキップ |

**実装パターン（詳細）**:
architecture-implementation-patterns.md の「E2Eテストパターン（TASK-8C-C）」セクション参照

#### TASK-8C-D: E2Eテスト - 権限ダイアログフロー (2026-02-02)

- テストファイル: `apps/desktop/e2e/skill-permission.spec.ts`
- テストフレームワーク: Playwright (@playwright/test)
- テストケース: 12件（有効）、1件（SKIP: タイムアウトテスト）

| カテゴリ       | テスト数 | 内容                                           |
| -------------- | -------- | ---------------------------------------------- |
| Basic Flow     | 5        | TC-1〜TC-5: ダイアログ表示・許可・拒否・選択記憶 |
| Edge Cases     | 2        | 連続権限処理・ダイアログキュー                 |
| Error Handling | 1 (skip) | タイムアウト処理                               |
| Accessibility  | 6        | ARIA属性・キーボードナビゲーション             |

**実装済みヘルパー関数**:
- `selectSkill()` - スキル選択
- `triggerPermissionDialog()` - ダイアログトリガー
- `waitForPermissionDialog()` - ダイアログ待機
- `approvePermission()` - 許可操作
- `denyPermission()` - 拒否操作
- `checkRememberChoice()` - 選択記憶

---

#### TASK-8C-F: Skill-Creator テスト用フィクスチャ (2026-02-01)

- フィクスチャパス: `apps/desktop/src/__tests__/__fixtures__/skill-creator/`
- テストファイル: `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`
- 62テストケース (TC-001〜TC-062) 全件PASS
- 検証スキル: `.claude/skills/skill-fixture-runner/`

---

## skill-creatorフィクスチャ検証テスト（TASK-8C-G）

### テストファイル

`apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`（96テストケース）

### 新規フィクスチャ（6種類）

| フィクスチャ           | 検証対象スクリプト          | 期待結果     | テスト区分             |
| ---------------------- | --------------------------- | ------------ | ---------------------- |
| boundary-skill/        | 全5スクリプト               | valid: true  | 境界値（B1~B9, A7-A8） |
| missing-fields-skill/  | validate-skill-md.js        | valid: false | エラーパターン（A2）   |
| forbidden-files-skill/ | validate-skill-structure.js | valid: false | エラーパターン（A1）   |
| invalid-name-skill/    | validate-skill-md.js        | valid: false | エラーパターン（A3）   |
| empty-agents-skill/    | validate-agents.js          | valid: false | エラーパターン（A4）   |
| invalid-schema-skill/  | validate-schemas.js         | valid: false | エラーパターン（A5）   |

### テストカテゴリ

| カテゴリ                     | テストケース | 範囲       |
| ---------------------------- | ------------ | ---------- |
| Boundary Value Fixtures      | 12件         | TC-063~074 |
| Error Pattern Fixtures       | 8件          | TC-075~082 |
| Validation Script Edge Cases | 8件          | TC-083~090 |
| Test Quality Improvements    | 6件          | TC-091~096 |

### テスト結果（TASK-8C-G Phase 9 時点）

| メトリクス         | 値                          |
| ------------------ | --------------------------- |
| テスト数           | 96（既存62 + 新規34）       |
| 全PASS             | 96/96                       |
| 実行時間           | ~8秒                        |
| ESLintエラー       | 0                           |
| TODO/FIXME         | 0                           |
| ギャップカバレッジ | 100%（A:10, B:9, C:1, D:3） |

---

## 残課題（未タスク）

以下のタスクはTASK-8C-D実施中に検出された未タスクです。

| タスクID                               | タスク名                        | 優先度 | 発見元          | タスク仕様書                                                                          |
| -------------------------------------- | ------------------------------- | ------ | --------------- | ------------------------------------------------------------------------------------- |
| task-e2e-permission-waitfortimeout-001 | E2E権限テスト waitForTimeout改善 | 低     | Phase 10 TQ-M1 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-e2e-permission-waitfortimeout-refactoring.md` |
| task-e2e-test-readme-documentation-001 | READMEへのE2Eテスト実行方法追加  | 低     | Phase 9 DOC-M1 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-e2e-test-readme-documentation.md`             |

---

## 関連ドキュメント

| ドキュメント                                                                        | 内容                             |
| ----------------------------------------------------------------------------------- | -------------------------------- |
| [quality-requirements.md](./quality-requirements.md)                                | 品質要件（テスト戦略全体）       |
| [testing-playwright-e2e.md](./testing-playwright-e2e.md)                            | Playwright E2Eテスト実装パターン |
| [testing-dialog-patterns.md](./testing-dialog-patterns.md)                          | ダイアログテストパターン         |
| [testing-accessibility.md](./testing-accessibility.md)                              | アクセシビリティテスト仕様       |
| [arch-electron-services.md](./arch-electron-services.md)                            | SkillScanner仕様                 |
| [interfaces-agent-sdk-skill.md](./interfaces-agent-sdk-skill.md)                    | ScannedSkillMetadata型定義       |
| [directory-structure.md](./directory-structure.md)                                  | プロジェクトディレクトリ構造     |
| [TASK-8C-B実装ガイド](../../../docs/30-workflows/TASK-8C-B/outputs/phase-12/implementation-guide.md) | スキル選択E2Eテスト実装ガイド |
