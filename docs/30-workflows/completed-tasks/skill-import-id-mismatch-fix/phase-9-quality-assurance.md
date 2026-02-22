# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 9                                   |
| Phase名    | 品質保証                            |
| タスクID   | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 |
| 前提Phase  | Phase 8（リファクタリング）         |
| 後続Phase  | Phase 10（最終レビューゲート）      |
| ステータス | 未実施                              |
| 作成日     | 2026-02-22                          |
| 機能名     | skill-import-id-mismatch-fix        |

---

## 目的

静的解析（Lint・型チェック）、テスト全件実行、IPC 契約整合性の4観点からコード品質を検証し、Phase 10（最終レビューゲート）に入力できる状態であることを保証する。

## 背景

本タスクは Renderer 層（SkillImportDialog → AgentView）のバグ修正であるが、修正値が IPC 経由で Main Process の `getSkillByName()` に到達するため、データフロー全体の整合性を品質保証で確認する必要がある。P44/P45 パターンの再発がないことも検証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

- タスク1: Lint を実行して静的解析違反の有無を確認する
- タスク2: TypeScript 型チェックを実行して型整合性を確認する
- タスク3: テストを全件実行して回帰がないことを確認する
- タスク4: IPC 契約整合性をエンドツーエンドで検証する
- タスク5: 品質ゲートを総合判定して次Phase可否を確定する

### タスク1: Lint 検証

**目的**: ESLint ルールへの準拠を確認する

**実行手順**:

1. desktop パッケージで ESLint を実行する
2. 修正対象3ファイルに Lint エラー・警告がないことを確認する
3. エラーがある場合は修正し、再度 Lint を実行する

**コマンド**:

```bash
# Lint 実行（desktop パッケージ）
cd apps/desktop && pnpm lint
```

**検証対象ファイル**:

| ファイル          | パス                                                                                                    | 確認項目                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| SkillImportDialog | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx`                            | 未使用 import がないこと、ESLint エラーがないこと |
| AgentView         | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                                   | 未使用 import がないこと、ESLint エラーがないこと |
| テスト            | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx` | テストファイル固有のルール違反がないこと          |

**期待される成果物**:

- `outputs/phase-9/lint-report.md`

---

### タスク2: TypeScript 型チェック検証

**目的**: TypeScript の型エラーがないことを確認する

**実行手順**:

1. desktop パッケージで TypeScript コンパイラを実行する
2. 修正対象3ファイルに型エラーがないことを確認する
3. SkillImportDialogProps の型定義と AgentView での使用箇所の型整合性を確認する

**コマンド**:

```bash
# 型チェック実行
cd apps/desktop && pnpm typecheck
```

**型整合性チェックポイント**:

| チェック項目                            | 確認内容                                                                           |
| --------------------------------------- | ---------------------------------------------------------------------------------- |
| SkillImportDialogProps.onImport         | `(skillIds: string[]) => void` の型が AgentView の `handleImport` と一致しているか |
| SkillImportDialogProps.importedSkillIds | `string[]` の型が AgentView から渡される値の型と一致しているか                     |
| SkillImportDialogProps.availableSkills  | `Skill[]` の型が AgentView の `availableSkills` 変数の型と一致しているか           |
| agentSlice の importSkill 引数          | `string`（skillName）が期待されていることを確認                                    |

**期待される成果物**:

- `outputs/phase-9/typecheck-report.md`

---

### タスク3: テスト全件実行

**目的**: 修正対象テストと desktop パッケージ全体のテストが全件 PASS であることを確認する

**実行手順**:

1. SkillImportDialog の個別テストを実行する
2. desktop パッケージ全体のテストを実行する
3. テスト結果を記録する

**コマンド**:

```bash
# SkillImportDialog 個別テスト
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/SkillImportDialog/__tests__/ --reporter=verbose

# desktop 全体テスト
cd apps/desktop && pnpm vitest run --reporter=verbose
```

**注意（P39/P40）**:

- テストは `cd apps/desktop` してから実行すること（P40: テスト実行ディレクトリ依存）
- happy-dom 環境では `userEvent` ではなく `fireEvent` を使用すること（P39: happy-dom 環境での userEvent 非互換）

**確認項目**:

| 確認項目                 | 基準          |
| ------------------------ | ------------- |
| SkillImportDialog テスト | 全件 PASS     |
| desktop 全体テスト       | 全件 PASS     |
| テスト failure           | 0件であること |

**期待される成果物**:

- `outputs/phase-9/test-report.md`

---

### タスク4: IPC 契約整合性確認（P44/P45 再発防止）

**目的**: SkillImportDialog → AgentView → agentSlice → IPC → Main Process のデータフロー全体で、引数名と値のセマンティクスが一致していることを確認する

**実行手順**:

1. SkillImportDialog の `onImport` コールバックで渡される値を確認する
2. AgentView の `handleImport` で受け取る引数名と型を確認する
3. agentSlice の `importSkill` アクションに渡される値を確認する
4. Preload API（`skill-api.ts`）の `importSkill` メソッドに渡される値を確認する
5. Main Process の skill:import ハンドラーが受け取る値を確認する
6. 全レイヤーで「スキル名（`skill.name`）」が渡されていることを確認する

**データフロー確認マトリクス**:

| レイヤー          | ファイル                                | 変数名/引数名                       | 渡される値 | 整合 |
| ----------------- | --------------------------------------- | ----------------------------------- | ---------- | ---- |
| SkillImportDialog | `organisms/SkillImportDialog/index.tsx` | `onImport(Array.from(selectedIds))` | -          | -    |
| AgentView         | `views/AgentView/index.tsx`             | `handleImport(skillNames)`          | -          | -    |
| agentSlice        | Store の importSkill アクション         | `importSkill(skillName)`            | -          | -    |
| Preload API       | `preload/skill-api.ts`                  | `importSkill(skillName)`            | -          | -    |
| Main Process      | `main/ipc/skillHandlers.ts`             | `skill:import` ハンドラー           | -          | -    |
| SkillService      | `main/services/SkillService.ts`         | `importSkills([skillName])`         | -          | -    |

**P44/P45 パターン再発チェック**:

| チェック項目                | 確認内容                                                                                               | 結果 |
| --------------------------- | ------------------------------------------------------------------------------------------------------ | ---- |
| P44: インターフェース不整合 | ハンドラーの引数形式と Preload 側の呼び出し形式が一致しているか                                        | -    |
| P45: 引数命名ドリフト       | 引数名が実際の値のセマンティクスと一致しているか                                                       | -    |
| P42: .trim() バリデーション | Main Process ハンドラーで3段バリデーション（型チェック → 空文字列 → トリム空文字列）が実装されているか | -    |

**期待される成果物**:

- `outputs/phase-9/ipc-contract-report.md`

---

### タスク5: 品質ゲート総合判定

**目的**: 全ての品質基準を満たしているか総合判定する

**実行手順**:

1. タスク1〜4の結果を統合する
2. 品質基準との照合を行う
3. 判定結果を記録する

**品質ゲートチェックリスト**:

#### 機能検証

- [ ] SkillImportDialog テスト全件 PASS
- [ ] desktop 全体テスト全件 PASS

#### コード品質

- [ ] Lint エラーなし
- [ ] 型エラーなし
- [ ] 未使用 import なし

#### IPC 契約整合性

- [ ] データフロー全体で引数名と値のセマンティクスが一致
- [ ] P44 パターン（インターフェース不整合）の再発なし
- [ ] P45 パターン（引数命名ドリフト）の再発なし

#### 判定結果

| 品質項目       | 結果 |
| -------------- | ---- |
| Lint           | -    |
| TypeCheck      | -    |
| テスト         | -    |
| IPC 契約整合性 | -    |
| **総合判定**   | -    |

**期待される成果物**:

- `outputs/phase-9/quality-gate-result.md`

---

## 参照資料

| 参照資料               | パス                                                                                                    | 内容                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------- |
| SkillImportDialog 実装 | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx`                            | 修正対象コンポーネント  |
| AgentView 実装         | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                                   | 修正対象ビュー          |
| テストファイル         | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx` | テストコード            |
| Preload API            | `apps/desktop/src/preload/skill-api.ts`                                                                 | Preload API 実装        |
| IPC ハンドラー         | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                            | Main Process ハンドラー |
| Phase 5 実装結果       | `phase-5-implementation.md`                                                                             | 実装完了内容            |
| Phase 8 成果物         | `outputs/phase-8/`                                                                                      | リファクタリング結果    |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                        |
| -------------------------- | --------------------------------------------------------------------------------- | --------------------------- |
| スキルインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | skill:import チャンネル契約 |
| 状態管理仕様               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | agentSlice 設計             |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | IPC引数の整合性確認手順     |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                              | P39, P40, P44, P45          |
| 開発ガイドライン           | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`     | コーディング規約            |
| 品質要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 品質基準                    |

---

## 成果物

| 成果物             | パス                                     | 内容                   |
| ------------------ | ---------------------------------------- | ---------------------- |
| Lint レポート      | `outputs/phase-9/lint-report.md`         | Lint 結果              |
| 型チェックレポート | `outputs/phase-9/typecheck-report.md`    | 型チェック結果         |
| テストレポート     | `outputs/phase-9/test-report.md`         | テスト実行結果         |
| IPC 契約レポート   | `outputs/phase-9/ipc-contract-report.md` | IPC 契約整合性確認結果 |
| 品質ゲート結果     | `outputs/phase-9/quality-gate-result.md` | 総合判定               |

---

## 統合テスト連携【必須】

| 確認項目     | 基準                                                                  |
| ------------ | --------------------------------------------------------------------- |
| Phase 5 接続 | 実装変更が機能要件を満たしていること                                  |
| Phase 8 接続 | リファクタリング後のテストが全件 PASS であること                      |
| IPC 連携     | SkillImportDialog → IPC → Main Process のデータフローが正常であること |
| 回帰         | 既存機能への影響がないこと                                            |

---

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | 永続化やDB操作がある場合           | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理がある場合                 | `aiworkflow-requirements: error-handling.md` |

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React 実装の場合         | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer 連携の場合    | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | 永続化がある場合            | `aiworkflow-requirements: database-*.md`               |

---

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施（タスク1〜5）
3. 統合テスト連携の確認
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json 更新方針が明記されている
- [ ] Phase 末端で完了を明記している

---

## 完了条件

- [ ] Lint エラーがないこと
- [ ] 型エラーがないこと
- [ ] 修正対象3ファイルに未使用 import がないこと
- [ ] SkillImportDialog テストが全件 PASS であること
- [ ] desktop 全体テストが全件 PASS であること
- [ ] IPC 契約整合性確認が完了し、P44/P45 パターンの再発がないこと
- [ ] 品質ゲートの全項目を PASS していること
- [ ] **本 Phase 内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] 品質ゲート全項目 PASS を確認

---

## 依存関係

- **前提**: Phase 8 が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-id-mismatch-fix/phase-10-final-review.md`
