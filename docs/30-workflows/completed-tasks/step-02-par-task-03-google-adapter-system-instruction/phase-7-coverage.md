# Phase 7: カバレッジ確認 - GoogleAdapter system_instruction 対応

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 7                                 |
| 機能名   | google-adapter-system-instruction |
| 作成日   | 2026-03-23                        |
| タスクID | TASK-LLM-MOD-03                   |
| 依存     | phase-6-test-expansion.md         |

## 目的

Phase 6 で追加したテストを含め、`GoogleAdapter.ts` のカバレッジが基準を充足しているかを確認する。基準未達の場合は Phase 6 に戻る。

## 実行タスク

### Task 7-1: カバレッジ計測の実行

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/main/adapters/llm/__tests__/GoogleAdapter.test.ts
```

カバレッジレポートから `GoogleAdapter.ts` の数値を抽出する。

### Task 7-2: カバレッジ基準の判定

| 指標              | 最低基準 | 推奨基準 | 実測値（Phase 7 実行時に記入） |
| ----------------- | -------- | -------- | ------------------------------ |
| Line Coverage     | 80%      | 90%      | \_\_\_%                        |
| Branch Coverage   | 60%      | 70%      | \_\_\_%                        |
| Function Coverage | 80%      | 90%      | \_\_\_%                        |

### Task 7-3: 対象関数のカバレッジ確認

| 関数名             | カバー済み | 備考                                                         |
| ------------------ | ---------- | ------------------------------------------------------------ |
| `constructor`      | 要確認     | `baseUrl` 設定の両パス（デフォルト・カスタム）のカバーが必要 |
| `sendChat`         | 要確認     | 正常系・エラー系のカバーが必要                               |
| `streamChat`       | 要確認     | 正常系・不正JSONスキップ・AbortSignal のカバーが必要         |
| `checkHealth`      | 要確認     | 正常系・エラー系のカバーが必要                               |
| `formatContents`   | 要確認     | `assistant` → `model` 変換のカバーが必要                     |
| `buildRequestBody` | 要確認     | `system_instruction` あり・なし両方のカバーが必要            |

### Task 7-4: 判定

| 判定条件                                               | 対応                      |
| ------------------------------------------------------ | ------------------------- |
| Line 80%以上 かつ Branch 60%以上 かつ Function 80%以上 | **PASS** → Phase 8 へ     |
| いずれか1つでも基準未達                                | **未達** → Phase 6 に戻る |

**判定結果** (Phase 7 実行時に記入): **\_**

### Task 7-5: 全テスト PASS 確認

カバレッジだけでなく、全テストが PASS していることも確認する。

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/GoogleAdapter.test.ts
```

**期待する結果**: 失敗テストが 0 件。

## 参照資料

| 資料名           | パス                               | 内容                             |
| ---------------- | ---------------------------------- | -------------------------------- |
| テスト拡充       | `phase-6-test-expansion.md`        | 追加テストケース・カバレッジ基準 |
| コード品質ルール | `.claude/rules/02-code-quality.md` | カバレッジ基準値                 |

## 統合テスト連携

カバレッジ基準未達の場合は Phase 6 に戻り、不足テストを追加する。PASS の場合は Phase 8（リファクタリング）に進む。

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |

## 成果物

| 成果物             | パス                                                    | 説明             |
| ------------------ | ------------------------------------------------------- | ---------------- |
| カバレッジ確認記録 | `phase-7-coverage.md`（本ファイル）の Task 7-2 テーブル | 実測値と判定結果 |

## 完了条件

- [ ] カバレッジ計測を実行し実測値を Task 7-2 テーブルに記入している
- [ ] Line Coverage 80% 以上を達成している
- [ ] Branch Coverage 60% 以上を達成している
- [ ] Function Coverage 80% 以上を達成している
- [ ] 全テストが PASS している（失敗テスト 0 件）
- [ ] 判定結果が「PASS」と記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）
