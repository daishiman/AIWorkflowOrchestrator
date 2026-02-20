# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| タスクID   | UT-FIX-SKILL-REMOVE-INTERFACE-001                           |
| Phase      | 9                                                           |
| Phase名    | 品質検証                                                    |
| 前提Phase  | Phase 8（リファクタリング完了）                             |
| 後続Phase  | Phase 10（最終レビュー）                                    |
| ステータス | 未実施                                                      |
| 作成日     | 2026-02-20                                                  |
| 機能名     | skill:remove IPCハンドラ・Preloadインターフェース不整合修正 |

---

## 目的

Lint・TypeScript型チェック・全テスト実行により、skill:removeハンドラ修正の品質を検証する。全項目がエラー0件・全件PASSであることを確認し、Phase 10（最終レビュー）への進行可否を判定する。

## 背景

Phase 8でリファクタリングが完了した状態で、静的解析と動的テストの両面から品質を検証する。エラーが1件でもある場合はPhase 5に戻り修正する。

---

## 参照資料

> 依存Phase成果物参照: Phase 5

| 参照資料             | パス                                                                                 | 内容                 |
| -------------------- | ------------------------------------------------------------------------------------ | -------------------- |
| 修正対象ハンドラ     | `apps/desktop/src/main/ipc/skillHandlers.ts`                                         | skill:removeハンドラ |
| テストファイル       | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                          | ハンドラテスト       |
| Preloadテスト        | `apps/desktop/src/preload/__tests__/skill-api.test.ts`                               | Preload APIテスト    |
| リファクタリング記録 | `docs/30-workflows/ut-fix-skill-remove-interface/outputs/phase-8/refactoring-log.md` | Phase 8の変更内容    |

---

## 実行タスク

- 参照仕様確認: aiworkflow-requirements と既存実装差分を確認する
- 実装/検証手順定義: 本Phaseで実施する作業を具体化する
- 成果物反映: outputs 配下に結果を記録する

### Task 1: ESLint実行

**目的**: コード品質の静的解析を行い、Lintエラーが0件であることを確認する。

**実行コマンド**:

```bash
cd apps/desktop && pnpm lint
```

**判定基準**:

- ESLintエラー: **0件** → PASS
- ESLintエラー: **1件以上** → FAIL（Phase 5に戻り修正）

**確認対象ファイル**:

- `apps/desktop/src/main/ipc/skillHandlers.ts`
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`

### Task 2: TypeScript型チェック

**目的**: 型安全性を検証し、TypeScriptコンパイルエラーが0件であることを確認する。

**実行コマンド**:

```bash
pnpm typecheck
```

**判定基準**:

- 型エラー: **0件** → PASS
- 型エラー: **1件以上** → FAIL（Phase 5に戻り修正）

**特に確認する観点**:

- skill:removeハンドラの引数型が `skillName: string` であること
- `any` 型が使用されていないこと
- P23準拠: Preload型定義（`apps/desktop/src/preload/types.ts`）とハンドラ引数が一致していること

### Task 3: skillHandlersテスト実行

**目的**: skill:removeハンドラの修正テストが全件PASSすることを確認する。

**実行コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers
```

**判定基準**:

- テスト: **全件PASS** → PASS
- テスト: **1件以上FAIL** → FAIL（Phase 5に戻り修正）

**確認対象テスト（skill:removeセクション）**:

- 正常系: 有効なスキル名でスキルを削除できること
- 異常系: 文字列以外の引数でバリデーションエラーになること
- 異常系: 空文字列でバリデーションエラーになること
- 異常系: スペースのみの文字列でバリデーションエラーになること（P42準拠）

### Task 4: Preloadテスト実行

**目的**: Preload側のskill API呼び出しテストが全件PASSすることを確認する。

**実行コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api
```

**判定基準**:

- テスト: **全件PASS** → PASS
- テスト: **1件以上FAIL** → FAIL（Phase 5に戻り修正）

### Task 5: デスクトップパッケージ全テスト実行

**目的**: 修正がデスクトップパッケージ全体に副作用を及ぼしていないことを確認する。

**実行コマンド**:

```bash
pnpm --filter @repo/desktop test
```

**判定基準**:

- テスト: **全件PASS** → PASS
- テスト: **1件以上FAIL** → FAIL（失敗テストの原因を調査し、本修正の副作用かを判定）

**注意**: P40準拠で、テスト実行は `apps/desktop` ディレクトリから行うか、`pnpm --filter` を使用すること。プロジェクトルートから直接 `pnpm vitest run apps/desktop/...` は実行しない。

### Task 6: 品質レポート作成

**目的**: Task 1-5の結果を品質レポートにまとめる。

**実行手順**:

1. `outputs/phase-9/quality-report.md` を作成する
2. 以下のテンプレートに結果を記入する:

```markdown
# Phase 9 品質検証レポート

## 検証日時

{{YYYY-MM-DD HH:mm}}

## 検証結果サマリ

| 検証項目             | 結果      | 詳細       |
| -------------------- | --------- | ---------- |
| ESLint               | PASS/FAIL | エラー0件  |
| TypeScript型チェック | PASS/FAIL | エラー0件  |
| skillHandlersテスト  | PASS/FAIL | N件中N件OK |
| skill-apiテスト      | PASS/FAIL | N件中N件OK |
| デスクトップ全テスト | PASS/FAIL | N件中N件OK |

## 総合判定

{{PASS / FAIL}}

## エラー詳細（FAILの場合）

{{エラー内容と対応方針}}
```

---

## 統合テスト連携

| 連携観点             | 本Phaseでの確認内容                                                          |
| -------------------- | ---------------------------------------------------------------------------- |
| Preload→Main IPC契約 | `skill-api.ts` の引数形式と `skillHandlers.ts` の受け口を照合する            |
| バリデーション連携   | sender検証・入力バリデーション・エラーコードの整合を確認する                 |
| テスト連携           | `skillHandlers.test.ts` / `skill-api.test.ts` の期待値と実装契約を一致させる |

## 多角的チェック観点（aiworkflow-requirements）

| 観点               | 参照仕様                                                                                    | 本タスクでの確認ポイント                   |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| API設計            | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | `skill:import/remove` チャンネル定義の整合 |
| インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill管理API契約（引数・戻り値）整合       |
| アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Main/Preload間の責務境界と引数契約         |
| セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | `validateIpcSender` と入力検証の必須要件   |
| Electron IPC       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | `safeInvoke` とホワイトリスト制約          |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P23/P42に基づく実装整合                    |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | `VALIDATION_ERROR` 等の扱い統一            |

## 成果物

| 成果物       | パス                                                                                | 内容         |
| ------------ | ----------------------------------------------------------------------------------- | ------------ |
| 品質レポート | `docs/30-workflows/ut-fix-skill-remove-interface/outputs/phase-9/quality-report.md` | 品質検証結果 |

---

## エラー発生時の対応

| 検証項目             | エラー時の対応                                                  |
| -------------------- | --------------------------------------------------------------- |
| ESLint               | Phase 5に戻り、Lintエラーを修正する                             |
| TypeScript型チェック | Phase 5に戻り、型エラーを修正する                               |
| テスト失敗           | 失敗テストの原因を調査し、本修正の副作用かを判定後Phase 5に戻る |

---

## 完了条件

- [ ] Task 1: ESLintエラー0件
- [ ] Task 2: TypeScript型チェックエラー0件
- [ ] Task 3: skillHandlersテスト全件PASS
- [ ] Task 4: skill-apiテスト全件PASS
- [ ] Task 5: デスクトップパッケージ全テストPASS
- [ ] Task 6: 品質レポート（`quality-report.md`）が作成済み
- [ ] 総合判定がPASSであること

---

## 依存関係

- **前提**: Phase 8（リファクタリング）が完了していること
- **後続**: Phase 10（最終レビュー）へ進む（総合判定PASSの場合）

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 9 実行記録

### 品質検証結果

- ESLintエラー: {{0件}}
- TypeScript型エラー: {{0件}}
- skillHandlersテスト: {{N件中N件PASS}}
- skill-apiテスト: {{N件中N件PASS}}
- デスクトップ全テスト: {{N件中N件PASS}}

### 総合判定

- {{PASS / FAIL}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-fix-skill-remove-interface/phase-10-final-review.md`
