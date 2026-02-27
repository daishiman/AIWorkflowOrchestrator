# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 9                                         |
| Phase名    | 品質保証                                  |
| タスクID   | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 |
| 前提Phase  | Phase 8（リファクタリング）               |
| 後続Phase  | Phase 10（最終レビューゲート）            |
| ステータス | 未着手                                    |
| 作成日     | 2026-02-27                                |
| 機能名     | skill-ipc-response-consistency            |

---

## 目的

静的解析、型チェック、セキュリティ検証、テスト実行の4観点からコード品質を検証する。プロジェクト品質基準（Line Coverage 80%+、Branch Coverage 60%+、Function Coverage 80%+）を満たしていることを確認する。

## 背景

Phase 8 までの契約統一とリファクタリングが品質基準を満たしていることを検証する。IPCハンドラーはセキュリティ境界に位置するため、通常の品質検証に加えて OWASP Top 10 のセキュリティ観点、および AR-3/AR-4 のセキュリティ要件の充足を重点的に確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Lint チェック

**目的**: ESLint ルールへの準拠を確認する

**実行手順**:

1. ESLint を実行する
2. エラー・警告を確認する
3. 問題があれば修正する
4. 未使用 import のクリーンアップを実施する

**コマンド**:

```bash
# Lint 実行
pnpm lint

# 自動修正（必要な場合）
pnpm --filter @repo/desktop lint --fix
```

**検証対象ファイル**:

| ファイル                                     | 確認項目                           |
| -------------------------------------------- | ---------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | 全14ハンドラーのLintクリア         |
| `apps/desktop/src/preload/skill-api.ts`      | 全メソッドのLintクリア             |
| `apps/desktop/src/preload/channels.ts`       | チャンネル定数追加部分のLintクリア |
| `apps/desktop/src/preload/types.ts`          | 型定義追加部分のLintクリア         |
| `packages/shared/src/ipc/channels.ts`        | 共有チャンネル定数のLintクリア     |

**期待される成果物**:

- `outputs/phase-9/lint-report.md`

---

### タスク2: TypeScript 型チェック

**目的**: TypeScript の型エラーがないことを確認する

**実行手順**:

1. TypeScript コンパイラを実行する
2. 型エラーを確認する
3. `preload/types.ts` と `skillHandlers.ts` の型整合性を確認する
4. any 型の使用がないことを確認する

**コマンド**:

```bash
# 型チェック実行
pnpm typecheck
```

**型整合性チェックポイント**:

| チェック項目                 | 確認内容                                                       |
| ---------------------------- | -------------------------------------------------------------- |
| preload/types.ts の引数型    | 全メソッドの引数型が `skillHandlers.ts` のハンドラー引数と一致 |
| preload/types.ts の戻り値型  | 全メソッドの戻り値型がハンドラーのレスポンス型と一致           |
| channels.ts のチャンネル定数 | `IPC_CHANNELS` に全チャンネルが定義されている                  |
| any型の不使用                | `grep -rn ": any" apps/desktop/src/main/ipc/skillHandlers.ts`  |

**期待される成果物**:

- `outputs/phase-9/typecheck-report.md`

---

### タスク3: 全テスト実行

**目的**: 回帰テスト含む全テストの成功確認

**実行手順**:

1. デスクトップパッケージの全テストを実行する
2. 全テストがパスすることを確認する
3. 失敗テストがある場合は原因を調査・修正する

**コマンド**:

```bash
# 全テスト実行
cd apps/desktop && pnpm vitest run

# IPC関連テストのみ（詳細出力）
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers*.test.ts --reporter=verbose

# Preload関連テストのみ
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api*.test.ts --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-9/test-execution-report.md`

---

### タスク4: セキュリティ確認

**目的**: IPC セキュリティ要件（AR-3/AR-4）の充足確認

**実行手順**:

1. 全 `skill:` ハンドラで `validateIpcSender` が呼ばれていることを確認する
2. 全文字列引数で P42準拠3段バリデーションが実装されていることを確認する
3. エラーレスポンスに内部情報が漏洩していないことを確認する
4. チャンネル名がハードコード文字列ではなく `IPC_CHANNELS` 定数で参照されていることを確認する

**セキュリティチェックリスト**:

| チェック項目                 | 確認コマンド/手順                                                                               | 結果 |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ---- |
| validateIpcSender 全呼び出し | `grep -c "validateIpcSender" apps/desktop/src/main/ipc/skillHandlers.ts`                        | -    |
| P42準拠3段バリデーション     | `.trim() === ""` チェックが全文字列引数にあるか確認                                             | -    |
| エラーサニタイズ             | `sanitizeErrorMessage` が全 catch ブロックで使用されているか確認                                | -    |
| ハードコード文字列なし       | `grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/skill-api.ts \| grep -v "IPC_CHANNELS"` | -    |

**期待される成果物**:

- `outputs/phase-9/security-report.md`

---

### タスク5: 品質ゲート判定

**目的**: 品質基準の充足を総合判定する

**実行手順**:

1. タスク1〜4の結果を統合する
2. 品質基準との照合を行う
3. 判定結果を記録する

**品質チェックリスト**:

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功

#### コード品質

- [ ] Lint エラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

#### テスト網羅性

- [ ] Phase 7 のカバレッジ基準を維持

#### セキュリティ

- [ ] validateIpcSender が全ハンドラで呼ばれている
- [ ] P42準拠3段バリデーションが全文字列引数で実装されている
- [ ] エラーレスポンスに内部情報が漏洩していない

#### 判定結果

| 品質項目      | 結果 |
| ------------- | ---- |
| Lint          | -    |
| TypeCheck     | -    |
| Security      | -    |
| Test/Coverage | -    |
| **総合判定**  | -    |

**期待される成果物**:

- `outputs/phase-9/quality-report.md`

---

## SubAgent 分担

| SubAgent   | 担当 |
| ---------- | ---- |
| SubAgent-A | タスク1（Lint）+ タスク2（TypeScript 型チェック） |
| SubAgent-B | タスク3（全テスト実行）+ タスク4（セキュリティ確認） |
| SubAgent-C | タスク5（品質ゲート判定）+ 品質レポート最終化 |

## 参照資料

| 参照資料          | パス                                                         | 内容                   |
| ----------------- | ------------------------------------------------------------ | ---------------------- |
| Phase 5 実装成果物 | `apps/desktop/src/main/ipc/skillHandlers.ts`                 | 品質検証の主要対象     |
| Phase 5 実装成果物 | `apps/desktop/src/preload/skill-api.ts`                      | 品質検証の主要対象     |
| IPCハンドラー実装 | `apps/desktop/src/main/ipc/skillHandlers.ts`                 | Main Processハンドラー |
| Preload API       | `apps/desktop/src/preload/skill-api.ts`                      | Preload API実装        |
| テストファイル    | `apps/desktop/src/main/ipc/__tests__/skillHandlers*.test.ts` | テストコード           |
| ESLint設定        | `.eslintrc.*` / `eslint.config.*`                            | Lintルール             |
| TypeScript設定    | `tsconfig.json`                                              | 型チェック設定         |

### システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                        | 内容             |
| ---------------------- | --------------------------------------------------------------------------- | ---------------- |
| 品質基準               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質ゲート       |
| セキュリティ原則       | `.claude/skills/aiworkflow-requirements/references/security-principles.md`  | セキュリティ要件 |
| Skill IPC セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`   | IPC検証テーブル  |

---

## 成果物

| 成果物               | パス                                       | 内容               |
| -------------------- | ------------------------------------------ | ------------------ |
| Lintレポート         | `outputs/phase-9/lint-report.md`           | Lint結果           |
| 型チェックレポート   | `outputs/phase-9/typecheck-report.md`      | 型チェック結果     |
| テスト実行レポート   | `outputs/phase-9/test-execution-report.md` | テスト実行結果     |
| セキュリティレポート | `outputs/phase-9/security-report.md`       | セキュリティ確認   |
| 品質レポート         | `outputs/phase-9/quality-report.md`        | 品質ゲート判定結果 |

---

## 統合テスト連携

> 品質保証で統合テスト結果を確認する

| 確認項目                 | 基準                               |
| ------------------------ | ---------------------------------- |
| 全テスト                 | 100% パス                          |
| セキュリティテスト       | sender検証・バリデーション全件PASS |
| エラーハンドリングテスト | エラーサニタイズ確認済み           |

---

## 完了条件

- [ ] `pnpm lint` 成功
- [ ] `pnpm typecheck` 成功
- [ ] 全テスト成功
- [ ] セキュリティ要件（AR-3/AR-4）充足
- [ ] 品質レポートが作成されている

---

## サブタスク管理

| #   | タスク名              | ステータス | 備考 |
| --- | --------------------- | ---------- | ---- |
| 1   | Lint チェック         | 未着手     |      |
| 2   | TypeScript 型チェック | 未着手     |      |
| 3   | 全テスト実行          | 未着手     |      |
| 4   | セキュリティ確認      | 未着手     |      |
| 5   | 品質ゲート判定        | 未着手     |      |

---

## タスク100%実行確認【必須】チェックリスト

- [ ] タスク1: Lint チェック — Lint エラーなし確認
- [ ] タスク2: TypeScript 型チェック — 型エラーなし確認
- [ ] タスク3: 全テスト実行 — 全テストPASS確認
- [ ] タスク4: セキュリティ確認 — AR-3/AR-4充足確認
- [ ] タスク5: 品質ゲート判定 — 総合判定記録完了

---

## Phase実行記録

| 項目         | 内容 |
| ------------ | ---- |
| 実行開始日時 |      |
| 実行完了日時 |      |
| 実行者       |      |
| 特記事項     |      |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] 品質ゲート全項目PASSを確認

---

## 依存関係

- **前提**: Phase 8 が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-ipc-response-consistency/phase-10-final-review.md`
