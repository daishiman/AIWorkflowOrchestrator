# Phase 9: 品質保証

## メタ情報

| 項目       | 内容              |
| ---------- | ----------------- |
| Phase      | 9                 |
| Phase名    | 品質保証          |
| 前提Phase  | Phase 8           |
| 後続Phase  | Phase 10          |
| ステータス | 完了              |
| 作成日     | 2026-03-25        |
| 機能名     | UT-LLM-MOD-01-005 |

---

## 目的

Phase 8 までの実装・リファクタリング結果に対して、全品質ゲートをクリアすることを検証する。テスト、Lint、型チェック、IPC契約ドリフトの全項目で問題がないことを確認する。

---

## 背景

Phase 8 のリファクタリングが完了。全品質ゲート（テスト、Lint、型チェック、IPC契約ドリフト）をクリアし、Phase 10 の最終レビューに備える。

---

## 実行タスク

### Task 9-1: 全テスト成功の確認

全ユニットテストがPASSすることを確認する。

```bash
pnpm test
```

**確認事項**:

- provider-registry 関連のテストが全PASS
- 既存の provider.test.ts が全PASS
- 既存の llm.test.ts が全PASS
- SSoT 検証テストが全PASS
- テストカバレッジが低下していないこと

### Task 9-2: Lintエラーなしの確認

ESLint で警告・エラーがないことを確認する。

```bash
pnpm lint
```

**確認事項**:

- `provider-registry.ts` に Lint エラー/警告がないこと
- 変更した `provider.ts`、`llm.ts`、`index.ts` に Lint エラー/警告がないこと
- unused import が残っていないこと
- `any` 型の使用がないこと

### Task 9-3: 型エラーなしの確認

TypeScript の型チェックが全パッケージでPASSすることを確認する。

```bash
pnpm typecheck
```

**確認事項**:

- `packages/shared/` の型チェックがPASS
- `apps/desktop/` の型チェックがPASS
- `LLMProviderId` 型が全 import 元で正常に解決されること
- `PROVIDER_CONFIGS` の `as const satisfies` 型が正常であること
- `z.enum(PROVIDER_IDS)` の型推論が正常であること

### Task 9-4: IPC契約ドリフト検証

IPC契約にドリフトが発生していないことを確認する。

```bash
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only
```

**確認事項**:

- IPC契約の定義と実装が一致していること
- `LLMProviderId` を使用する IPC チャネルで型が正常であること
- 新たな契約ドリフトが発生していないこと

---

## 参照資料

| 参照資料           | パス                                          | 内容                        |
| ------------------ | --------------------------------------------- | --------------------------- |
| Phase 1 要件定義   | `phase-1-requirements.md`                     | 受け入れ基準 AC-005, AC-006 |
| Phase 8 リファクタ | `phase-8-refactoring.md`                      | リファクタリング結果        |
| IPC契約チェッカー  | `apps/desktop/scripts/check-ipc-contracts.ts` | IPC契約検証スクリプト       |

---

## 統合テスト連携

| 確認事項                              | 基準                                          | 判定 |
| ------------------------------------- | --------------------------------------------- | ---- |
| IPC契約にドリフトがないこと           | check-ipc-contracts.ts が PASS                | -    |
| 全パッケージの型チェックがPASS        | pnpm typecheck が全パッケージでエラー0        | -    |
| cross-package import が正常であること | shared → desktop の import 方向のみであること | -    |

---

## 成果物

| 成果物       | パス                                | 内容                   |
| ------------ | ----------------------------------- | ---------------------- |
| 品質保証結果 | `outputs/phase-9/quality-report.md` | 全品質ゲートの検証結果 |

---

## 品質ゲート

### 品質チェックリスト

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功
- [ ] 全E2Eテスト成功（該当する場合）

#### コード品質

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

#### テスト網羅性

- [ ] 総合カバレッジ指数180%+達成（Line + Branch + Function の合計）

#### セキュリティ

- [ ] 脆弱性スキャン完了（該当する場合）
- [ ] 重大な脆弱性なし

---

## 完了条件

- [ ] `pnpm test` が全PASS（失敗テスト 0）
- [ ] `pnpm lint` がエラー/警告 0
- [ ] `pnpm typecheck` が全パッケージでエラー 0
- [ ] IPC契約ドリフト検証がPASS（ドリフトなし）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005 --phase 9
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

## Phase 9 実行記録

### 実行タスク

| タスク | 結果 | 備考 |
| ------ | ---- | ---- |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

- ***

## 次のPhase

Phase 10: 最終レビューゲート

`docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/phase-10-*.md`
