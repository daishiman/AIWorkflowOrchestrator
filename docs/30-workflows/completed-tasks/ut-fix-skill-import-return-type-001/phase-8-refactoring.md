# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 8                                          |
| Phase名    | リファクタリング（TDD: Refactor）          |
| タスクID   | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001        |
| 前提Phase  | Phase 7（カバレッジ確認）                  |
| 後続Phase  | Phase 9（品質検証）                        |
| ステータス | 完了                                       |
| 作成日     | 2026-02-21                                 |
| 機能名     | skill:import IPCハンドラ戻り値型不整合修正 |

---

## 目的

TDD の Refactor フェーズとして、テストを Green に維持しながら skill:import ハンドラの変換ロジック（importSkills → getSkillByName → ImportedSkill 返却）の可読性とコード品質を向上させる。

## 背景

Phase 5〜7 で skill:import ハンドラの戻り値型を ImportResult から ImportedSkill に変換するロジックを実装した。
2ステップ呼び出し（importSkills → getSkillByName）が導入されたため、コードの可読性・エラーメッセージの一貫性・不要コードの有無を確認し、品質を改善する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 変換ロジックの可読性確認

**目的**: skill:import ハンドラの2ステップ呼び出し（importSkills → getSkillByName）が明確で読みやすいことを確認する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` を読み込む
2. skill:import ハンドラの変換ロジックを分析する
3. 以下の観点で可読性を評価する

**分析観点**:

| 観点                       | 確認内容                                                          |
| -------------------------- | ----------------------------------------------------------------- |
| ステップの明確性           | importSkills → getSkillByName の2ステップが明確に分離されているか |
| 変数命名                   | 中間変数名（importResult, skill 等）が意図を正確に表現しているか  |
| null/undefinedハンドリング | getSkillByName が null を返した場合のハンドリングが明示的か       |
| コメントの適切性           | 過剰なコメントがないか（コードが自明な場合はコメント不要）        |
| ネストの深さ               | try/catch 内のネストが3段以上になっていないか                     |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/readability-analysis.md`

---

### タスク2: エラーメッセージの一貫性確認

**目的**: skill:import ハンドラのエラーメッセージが他のハンドラーと一貫したフォーマットであることを確認する

**実行手順**:

1. skill:import ハンドラのエラーレスポンスを確認する
2. 以下のエラーパターンが一貫した形式であることを確認する:
   - バリデーションエラー（VALIDATION_ERROR）
   - インポートエラー（IMPORT_ERROR）
   - スキル取得エラー（getSkillByName が null を返した場合）
3. 同ファイル内の他のハンドラー（skill:list, skill:remove）のエラーフォーマットと比較する
4. 不一致がある場合は修正する

**エラーフォーマットチェックリスト**:

| エラー種別     | エラーコード     | メッセージ形式           | 一貫性 |
| -------------- | ---------------- | ------------------------ | ------ |
| 型チェック     | VALIDATION_ERROR | `skillName must be...`   | -      |
| 空文字列       | VALIDATION_ERROR | `skillName must be...`   | -      |
| トリム空文字列 | VALIDATION_ERROR | `skillName must be...`   | -      |
| インポート失敗 | IMPORT_ERROR     | サニタイズ済みメッセージ | -      |
| スキル未取得   | IMPORT_ERROR     | 明確なメッセージ         | -      |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/error-message-consistency.md`

---

### タスク3: 不要なインポート・コードの削除確認

**目的**: Phase 5 の実装で不要になった import 文やコードが残っていないことを確認する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` のimport文を確認する
2. ImportResult 型が直接利用されていない場合、import が残っていないか確認する
3. 未使用の変数・関数がないことを確認する
4. テストファイルでも同様の確認を実施する

**確認対象**:

| ファイル                                                                                | 確認項目                   |
| --------------------------------------------------------------------------------------- | -------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                                            | 未使用import、未使用変数   |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                             | 未使用import、未使用モック |
| `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` | 未使用import、古い型参照   |

**確認コマンド**:

```bash
# ESLint の no-unused-vars で検出
pnpm --filter @repo/desktop lint
```

**期待される成果物**:

- `outputs/phase-8/unused-code-cleanup.md`

---

### タスク4: テストの継続的Green確認

**目的**: リファクタリング後も全テストがGreen状態であることを確認する

**実行手順**:

1. skillHandlers のユニットテストを実行する
2. agentSlice の統合テストを実行する
3. Lint と型チェックを実行する
4. 全てPASSであることを確認する

**確認コマンド**:

```bash
# ユニットテスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose

# 統合テスト
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice.skill-integration --reporter=verbose

# Lint
pnpm --filter @repo/desktop lint

# 型チェック
pnpm --filter @repo/desktop typecheck
```

**期待される成果物**:

- `outputs/phase-8/green-confirmation.md`

---

## 参照資料

| 参照資料              | パス                                                                                     | 内容                   |
| --------------------- | ---------------------------------------------------------------------------------------- | ---------------------- |
| IPCハンドラー実装     | `apps/desktop/src/main/ipc/skillHandlers.ts`                                             | Main Processハンドラー |
| ハンドラーテスト      | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                              | ユニットテスト         |
| 統合テスト            | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts`  | Store統合テスト        |
| Phase 1要件仕様       | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-1-requirements.md`          | 要件確認               |
| Phase 2設計           | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-2-design.md`                | 設計確認               |
| Phase 5実装仕様       | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-5-implementation.md`        | 実装仕様               |
| Phase 6テスト拡充     | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-6-test-expansion.md`        | テスト補強             |
| Phase 7カバレッジ結果 | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-7-coverage-verification.md` | カバレッジ結果         |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                        | 内容              |
| ---------------- | ------------------------------------------------------------------------------------------- | ----------------- |
| セキュリティ原則 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPCセキュリティ   |
| コード品質基準   | `.claude/rules/02-code-quality.md`                                                          | 品質ルール        |
| 実装パターン集   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン      |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`                                                        | P23, P42, P44参照 |

---

## 成果物

| 成果物                 | パス                                           | 内容                         |
| ---------------------- | ---------------------------------------------- | ---------------------------- |
| 可読性分析             | `outputs/phase-8/readability-analysis.md`      | 変換ロジックの可読性評価     |
| エラーメッセージ一貫性 | `outputs/phase-8/error-message-consistency.md` | エラーフォーマット確認結果   |
| 不要コード削除確認     | `outputs/phase-8/unused-code-cleanup.md`       | 未使用コード確認結果         |
| Green確認              | `outputs/phase-8/green-confirmation.md`        | テスト・Lint・型チェック結果 |

---

## 統合テスト連携

> リファクタ後の統合テスト継続成功を確認する

| 確認項目                    | 基準                   |
| --------------------------- | ---------------------- |
| skillHandlersユニットテスト | 全テストケースPASS     |
| agentSlice統合テスト        | 全テストケースPASS     |
| カバレッジ維持              | リファクタ前と同等以上 |

---

## TDD検証

### TDD サイクル確認

```bash
# リファクタリング中は継続的にテスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --watch
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 完了条件

- [ ] 変換ロジック（importSkills → getSkillByName）の可読性が確認されている
- [ ] エラーメッセージのフォーマットが他のハンドラーと一貫している
- [ ] 未使用のimport・変数・コードが除去されている
- [ ] 全てのテストがPASSしている
- [ ] Lint エラーがない
- [ ] 型エラーがない

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（4ファイル）が全て生成されていることを確認
- [ ] テストが継続してGreen状態であることを確認

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9（品質検証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-fix-skill-import-return-type-001/phase-9-quality-assurance.md`
