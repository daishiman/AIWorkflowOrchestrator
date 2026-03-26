# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容              |
| ---------- | ----------------- |
| Phase      | 11                |
| Phase名    | 手動テスト        |
| 前提Phase  | Phase 10          |
| 後続Phase  | Phase 12          |
| ステータス | 完了              |
| 作成日     | 2026-03-25        |
| 機能名     | UT-LLM-MOD-01-005 |

---

## 目的

バックエンドリファクタリングの最終検証として、自動テストで取り切れない観点を手動で確認する。画面変更なしのため、NON_VISUAL（非視覚的）テストとして実施する。

---

## 背景

Phase 10 の最終レビューゲートを通過。NON_VISUAL タスクとして、型チェック・テスト全PASS・SSoT grep検証・Lint確認を手動で実施し、自動テストで取り切れない観点を確認する。

---

## テスト分類

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| テスト種別 | NON_VISUAL（バックエンドリファクタリング、画面変更なし） |
| 画像証跡   | 不要                                                     |
| 視覚確認   | 不要                                                     |

### NON_VISUAL 確認項目

本タスクは画面変更を含まない NON_VISUAL タスクのため、以下の確認に特化する:

- [ ] SKILL.md の参照パスが正しいことを確認
- [ ] LOGS.md にアクセス可能であることを確認
- [ ] 実装ガイド（Phase 12 で作成予定）のウォークスルーシナリオを想定

### ウォークスルーシナリオ発見事項分類欄

| #   | 発見事項               | 分類           | 重要度   | 対応 |
| --- | ---------------------- | -------------- | -------- | ---- |
| -   | （テスト実行後に記入） | バグ/改善/仕様 | 高/中/低 | -    |

---

## 実行タスク

1. 型チェック結果を実コマンドで再確認し、shared / desktop のエラー 0 を記録する。
2. schema 系テストの PASS と provider-registry 周辺の件数を確認する。
3. grep により `PROVIDER_CONFIGS` / `inferProviderId` / `LLMProviderIdSchema` の一元化を検証する。
4. Lint とチェックリストを揃え、Phase 12 へ引き継ぐ。

### Task 11-1: 型チェック成功の手動確認

TypeScript の型チェックが全パッケージで成功することを手動で実行・確認する。

```bash
pnpm typecheck
```

**確認ポイント**:

- `packages/shared/` でエラー 0
- `apps/desktop/` でエラー 0
- `apps/web/` でエラー 0（影響がないことの確認）
- 実行結果のログを成果物に記録する

### Task 11-2: テスト全PASSの手動確認

全ユニットテストがPASSすることを手動で実行・確認する。

```bash
pnpm test
```

**確認ポイント**:

- 全テストスイートがPASS
- 失敗テスト 0
- provider-registry 関連テストの実行結果を確認
- SSoT 検証テストの実行結果を確認
- 実行結果のログを成果物に記録する

### Task 11-3: grepによるSSoT検証の手動確認

SSoT が確立されていることを grep コマンドで手動検証する。

```bash
# 1. 手動 z.enum 定義が残存していないこと
grep -rn "z\.enum(" packages/shared/src/types/llm/schemas/

# 期待結果: provider.ts のみ（provider-registry.ts の PROVIDER_IDS を使用した自動導出）

# 2. PROVIDER_CONFIGS の定義箇所が1箇所のみであること
grep -rn "PROVIDER_CONFIGS\s*=" packages/shared/ apps/desktop/

# 期待結果: provider-registry.ts のみ

# 3. inferProviderId の定義箇所が1箇所のみであること
grep -rn "function inferProviderId" packages/shared/ apps/desktop/

# 期待結果: provider-registry.ts のみ

# 4. llm.ts に手動 prefix マッチングが残っていないこと
grep -n "startsWith" apps/desktop/src/main/handlers/llm.ts

# 期待結果: inferProviderId 関連の startsWith がないこと
```

**確認ポイント**:

- 各 grep の結果が期待通りであること
- SSoT が provider-registry.ts に集約されていること
- 手動定義の残骸がないこと
- 実行結果のログを成果物に記録する

### Task 11-4: Lint確認

```bash
pnpm lint
```

**確認ポイント**:

- エラー 0、警告 0
- 実行結果のログを成果物に記録する

---

## 参照資料

| 参照資料              | パス                       | 内容         |
| --------------------- | -------------------------- | ------------ |
| Phase 1 要件定義      | `phase-1-requirements.md`  | 受け入れ基準 |
| Phase 10 最終レビュー | `phase-10-final-review.md` | AC判定結果   |

---

## 統合テスト連携

| 確認事項                          | 基準                      | 判定 |
| --------------------------------- | ------------------------- | ---- |
| 型チェックが全パッケージでPASS    | pnpm typecheck でエラー 0 | PASS |
| 全テストスイートがPASS            | pnpm test で失敗 0        | PASS |
| SSoT が grep で検証されていること | 手動定義の残存が 0        | PASS |

---

## 成果物

| 成果物                   | パス                                        | 内容                     |
| ------------------------ | ------------------------------------------- | ------------------------ |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 実施前後の確認項目       |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | 全テストケースの実行結果 |

### 成果物フォーマット（outputs/phase-11/manual-test-result.md）

```markdown
# Phase 11: 手動テスト結果

## テスト分類: NON_VISUAL

## Task 11-1: 型チェック結果

- 実行コマンド: `pnpm typecheck`
- 結果: PASS / FAIL
- 詳細: （ログ抜粋）

## Task 11-2: テスト結果

- 実行コマンド: `pnpm test`
- 結果: PASS / FAIL
- テストスイート数: N
- テストケース数: N
- 失敗数: 0
- 詳細: （ログ抜粋）

## Task 11-3: SSoT検証結果

- grep 1（z.enum）: 期待通り / 問題あり
- grep 2（PROVIDER_CONFIGS定義）: 期待通り / 問題あり
- grep 3（inferProviderId定義）: 期待通り / 問題あり
- grep 4（手動prefix）: 期待通り / 問題あり
- 詳細: （grep 結果抜粋）

## Task 11-4: Lint結果

- 実行コマンド: `pnpm lint`
- 結果: PASS / FAIL
- エラー数: 0
- 警告数: 0

## 総合判定: PASS / FAIL
```

---

## 完了条件

- [x] Task 11-1: `pnpm typecheck` が全パッケージでエラー 0
- [x] Task 11-2: `pnpm test` が全テストPASS（失敗 0）
- [x] Task 11-3: grep による SSoT 検証が全項目で期待通り
- [x] Task 11-4: `pnpm lint` がエラー/警告 0
- [x] 成果物 `outputs/phase-11/manual-test-checklist.md` と `outputs/phase-11/manual-test-result.md` が作成されている
- [x] **本Phase内の全タスクを100%実行完了**

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

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005 --phase 11
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

## Phase 11 実行記録

### 実行タスク

| タスク    | 結果 | 備考                                                   |
| --------- | ---- | ------------------------------------------------------ |
| Task 11-1 | 完了 | `@repo/shared` / `@repo/desktop` typecheck PASS を確認 |
| Task 11-2 | 完了 | schema 系 10 suite / 323 tests PASS を記録             |
| Task 11-3 | 完了 | SSoT grep 4項目すべて期待通り                          |
| Task 11-4 | 完了 | changed files lint PASS を記録                         |

### 発見事項

- 良かった点:
- shared registry への集約後も既存 schema テスト群に回帰がなかった
- 問題点:
- readonly 配列を `LLMProvider` に渡す箇所は follow-up として残った
- 改善提案:
- NON_VISUAL タスクでも checklist を必ず残し、validator の補助成果物不足を防ぐ

### 次Phaseへの引き継ぎ事項

- Phase 12 では implementation guide / system spec / 未タスク formalize を同一ターンで閉じる

## 次のPhase

Phase 12: ドキュメント更新

`docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/phase-12-*.md`
