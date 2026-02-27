# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 9                              |
| Phase名    | 品質保証                       |
| タスクID   | TASK-9A                        |
| 前提Phase  | Phase 8（リファクタリング）    |
| 後続Phase  | Phase 10（最終レビューゲート） |
| ステータス | 未着手                         |
| 作成日     | 2026-02-26                     |
| 機能名     | TASK-9A-skill-editor           |

---

## 目的

静的解析、型チェック、セキュリティ検証、テスト実行の4観点からスキルエディター機能全体の品質を検証する。
プロジェクト品質基準（Line Coverage 80%+、Branch Coverage 60%+、Function Coverage 80%+）を満たしていることを確認する。

## 背景

スキルエディター機能はMain Process（SkillFileManager + IPCハンドラー）、Preload層、Renderer Process（SkillEditor UI）の3レイヤーにまたがるため、レイヤー横断の品質検証が必要である。
IPCハンドラーはセキュリティ境界に位置し、ファイルシステムへの読み書きを伴うため、パストラバーサル防止と送信元検証を重点検証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Lint 検証

**目的**: ESLint ルールへの準拠を全対象ファイルで確認する

**実行手順**:

1. ESLint を全対象ファイルに対して実行する
2. エラー・警告を確認する
3. 問題があれば修正する
4. 再度 Lint を実行してクリアを確認する

**コマンド**:

```bash
# Lint 実行（desktopパッケージ）
pnpm --filter @repo/desktop lint

# 自動修正
pnpm --filter @repo/desktop lint --fix
```

**検証対象ファイル**:

| ファイル                                                         | 確認項目                       |
| ---------------------------------------------------------------- | ------------------------------ |
| `apps/desktop/src/main/services/skill/SkillFileManager.ts`       | サービス層のLintクリア         |
| `apps/desktop/src/main/ipc/skillFileHandlers.ts`                 | IPCハンドラーのLintクリア      |
| `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`     | UIコンポーネントのLintクリア   |
| `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx` | コードエディターのLintクリア   |
| `apps/desktop/src/renderer/store/slices/skillSlice.ts`           | Store SliceのLintクリア        |
| `apps/desktop/src/preload/skill-api.ts`                          | Preload APIのLintクリア        |
| `apps/desktop/src/preload/channels.ts`                           | チャンネル定数のLintクリア     |
| `apps/desktop/src/preload/types.ts`                              | 型定義のLintクリア             |
| `packages/shared/src/ipc/channels.ts`                            | 共有チャンネル定数のLintクリア |

**期待される成果物**:

- `outputs/phase-9/lint-report.md`

---

### タスク2: 型チェック検証

**目的**: TypeScript の型エラーがないことを確認し、レイヤー間の型整合性を検証する

**実行手順**:

1. TypeScript コンパイラを desktopパッケージとsharedパッケージに対して実行する
2. `preload/types.ts` と `skillFileHandlers.ts` の型整合性を確認する
3. `packages/shared/src/ipc/channels.ts` と `apps/desktop/src/preload/channels.ts` のチャンネル定数整合性を確認する
4. P32チェック（型定義の二箇所同時更新）を実施する

**コマンド**:

```bash
# 型チェック実行
pnpm --filter @repo/desktop typecheck

# shared パッケージも確認
pnpm --filter @repo/shared typecheck
```

**型整合性チェックポイント**:

| チェック項目                 | 確認内容                                                        |
| ---------------------------- | --------------------------------------------------------------- |
| Preload型 ↔ Mainハンドラー型 | 6メソッド全ての引数型・戻り値型がハンドラーのレスポンス型と一致 |
| チャンネル定数整合           | `IPC_CHANNELS` に6チャンネルが定義されている                    |
| ホワイトリスト整合           | `ALLOWED_INVOKE_CHANNELS` に6チャンネルが追加されている         |
| SkillSlice型 ↔ Preload型     | Store型定義とPreload型定義に不一致がないか（P24対策）           |
| any型不使用                  | `any` 型が使用されていないか                                    |

**P32チェック（型定義の二箇所同時更新）**:

| ファイル                               | 確認内容                   |
| -------------------------------------- | -------------------------- |
| `packages/shared/src/ipc/channels.ts`  | 共有チャンネル定数が最新か |
| `apps/desktop/src/preload/types.ts`    | Preload型定義が最新か      |
| `apps/desktop/src/preload/channels.ts` | ホワイトリストが最新か     |

**期待される成果物**:

- `outputs/phase-9/typecheck-report.md`

---

### タスク3: セキュリティ検証

**目的**: 全6 IPCハンドラーがプロジェクトのセキュリティ要件を満たしていることを確認する

**実行手順**:

1. 全6ハンドラーで `validateIpcSender()` が実施されていることを確認する
2. パス引数を受け取るハンドラーでパストラバーサル防止が実施されていることを確認する
3. 全catchブロックで `sanitizeErrorMessage` が使用されていることを確認する
4. チャンネル名が `IPC_CHANNELS` 定数で参照されていることを確認する
5. P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が全ハンドラーで実施されていることを確認する
6. `~/.claude/skills/` に対する書き込み操作が拒否されることを確認する

**セキュリティチェックマトリクス**:

| チャンネル            | validateIpcSender | パス検証 | sanitizeErrorMessage | IPC_CHANNELS定数 | 3段バリデーション |
| --------------------- | ----------------- | -------- | -------------------- | ---------------- | ----------------- |
| `skill:readFile`      | -                 | -        | -                    | -                | -                 |
| `skill:writeFile`     | -                 | -        | -                    | -                | -                 |
| `skill:createFile`    | -                 | -        | -                    | -                | -                 |
| `skill:deleteFile`    | -                 | -        | -                    | -                | -                 |
| `skill:listBackups`   | -                 | -        | -                    | -                | -                 |
| `skill:restoreBackup` | -                 | -        | -                    | -                | -                 |

**パストラバーサル検証コマンド**:

```bash
# パストラバーサルテストの実行確認
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers --reporter=verbose --grep "path traversal"
```

**ハードコード文字列検出コマンド**:

```bash
# safeInvokeでハードコード文字列が使われていないか確認（P27対策）
grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/skill-api.ts | grep -v "IPC_CHANNELS"
```

**読み取り専用パス保護検証**:

```bash
# ~/.claude/skills/ への書き込み拒否テスト確認
cd apps/desktop && pnpm vitest run --reporter=verbose --grep "read.only\|readonly\|claude.*skills"
```

**期待される成果物**:

- `outputs/phase-9/security-report.md`

---

### タスク4: テスト実行・カバレッジ確認

**目的**: 全テストが成功し、カバレッジ基準を満たしていることを確認する

**実行手順**:

1. 全対象テストを実行する
2. カバレッジレポートを確認する
3. カバレッジ基準との照合を行う
4. 基準未達の場合はPhase 6に戻る

**コマンド**:

```bash
# IPCハンドラーテスト（カバレッジ付き）
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers --coverage --reporter=verbose

# SkillFileManagerテスト
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/ --coverage --reporter=verbose

# UIコンポーネントテスト
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/ --coverage --reporter=verbose
```

**カバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 | 実績 | 判定 |
| ----------------- | -------- | -------- | ---- | ---- |
| Line Coverage     | 80%      | 90%      | -    | -    |
| Branch Coverage   | 60%      | 70%      | -    | -    |
| Function Coverage | 80%      | 90%      | -    | -    |

**テスト対象範囲**:

| テスト対象                   | テストファイル                                                | 分類                   |
| ---------------------------- | ------------------------------------------------------------- | ---------------------- |
| IPCハンドラー（6チャンネル） | `src/main/ipc/__tests__/skillFileHandlers*.test.ts`           | 正常/異常/セキュリティ |
| SkillFileManager             | `src/main/services/skill/__tests__/SkillFileManager*.test.ts` | 正常/異常              |
| SkillEditor UIコンポーネント | `src/renderer/components/skill/__tests__/*.test.ts`           | レンダリング/操作      |

**期待される成果物**:

- `outputs/phase-9/test-coverage-report.md`

---

### タスク5: 品質ゲート総合判定

**目的**: 全ての品質基準を満たしているか総合判定する

**実行手順**:

1. タスク1〜4の結果を統合する
2. 品質基準との照合を行う
3. 判定結果を記録する

**品質ゲートテーブル**:

| 品質ゲート   | 確認内容                                    | コマンド                                                                    | 結果 |
| ------------ | ------------------------------------------- | --------------------------------------------------------------------------- | ---- |
| 機能検証     | 全自動テスト成功                            | `pnpm --filter @repo/desktop test`                                          | -    |
| コード品質   | Lint/型チェッククリア                       | `pnpm --filter @repo/desktop lint && pnpm --filter @repo/desktop typecheck` | -    |
| テスト網羅性 | カバレッジ基準達成                          | `pnpm --filter @repo/desktop test -- --coverage`                            | -    |
| セキュリティ | validateIpcSender適用、パストラバーサル防止 | 手動レビュー                                                                | -    |

**品質ゲートチェックリスト**:

#### 機能検証

- [ ] 全ユニットテスト成功
- [ ] IPCハンドラー6チャンネル全テストPASS
- [ ] SkillFileManager全テストPASS
- [ ] SkillEditor UI全テストPASS

#### コード品質

- [ ] Lint エラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み
- [ ] any型不使用

#### テスト網羅性

- [ ] Line Coverage 80%+ 達成
- [ ] Branch Coverage 60%+ 達成
- [ ] Function Coverage 80%+ 達成

#### セキュリティ

- [ ] 全ハンドラーで validateIpcSender 実施確認済み
- [ ] パス引数のバリデーション（パストラバーサル防止）実施確認済み
- [ ] エラーサニタイズ実施確認済み
- [ ] ハードコード文字列なし確認済み（P27対策）
- [ ] P42準拠3段バリデーション全ハンドラー実施確認済み
- [ ] 読み取り専用パス保護確認済み

**判定結果テーブル**:

| 品質項目      | 結果 |
| ------------- | ---- |
| Lint          | -    |
| TypeCheck     | -    |
| Security      | -    |
| Test/Coverage | -    |
| **総合判定**  | -    |

**期待される成果物**:

- `outputs/phase-9/quality-gate-result.md`

---

## 参照資料

| 参照資料           | パス                                                             | 内容                   |
| ------------------ | ---------------------------------------------------------------- | ---------------------- |
| SkillFileManager   | `apps/desktop/src/main/services/skill/SkillFileManager.ts`       | サービス層実装         |
| IPCハンドラー      | `apps/desktop/src/main/ipc/skillFileHandlers.ts`                 | Main Processハンドラー |
| SkillEditor UI     | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`     | UIコンポーネント       |
| Preload API        | `apps/desktop/src/preload/skill-api.ts`                          | Preload API実装        |
| テストファイル     | `apps/desktop/src/main/ipc/__tests__/skillFileHandlers*.test.ts` | テストコード           |
| Phase 5 実装成果物 | `outputs/phase-5/`                                               | 実装結果               |
| ESLint設定         | `.eslintrc.*`                                                    | Lintルール             |
| TypeScript設定     | `tsconfig.json`                                                  | 型チェック設定         |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                        | 内容             |
| ------------------ | ------------------------------------------------------------------------------------------- | ---------------- |
| セキュリティ原則   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリ   |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | レイヤー構成     |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DIパターン       |

---

## 成果物

| 成果物               | パス                                      | 内容             |
| -------------------- | ----------------------------------------- | ---------------- |
| Lintレポート         | `outputs/phase-9/lint-report.md`          | Lint結果         |
| 型チェックレポート   | `outputs/phase-9/typecheck-report.md`     | 型チェック結果   |
| セキュリティレポート | `outputs/phase-9/security-report.md`      | セキュリティ確認 |
| テスト・カバレッジ   | `outputs/phase-9/test-coverage-report.md` | テスト結果       |
| 品質ゲート結果       | `outputs/phase-9/quality-gate-result.md`  | 総合判定         |

---

## 統合テスト連携

> 品質保証で統合テスト結果を確認する

| 確認項目                 | 基準                                                |
| ------------------------ | --------------------------------------------------- |
| 全テスト                 | 100% パス                                           |
| IPCハンドラーテスト      | 6チャンネル全て正常動作、セキュリティテスト全件PASS |
| SkillFileManagerテスト   | ファイル操作・バックアップ操作テスト全件PASS        |
| UIコンポーネントテスト   | レンダリング・ユーザー操作テスト全件PASS            |
| エラーハンドリングテスト | エラーサニタイズ確認済み                            |

---

## 完了条件

- [ ] Lint エラーがない
- [ ] 型エラーがない
- [ ] セキュリティレビューが完了している（全6ハンドラーで6項目確認済み）
- [ ] 全テストが成功している
- [ ] カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を達成している
- [ ] 品質ゲートの全項目をパスしている

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

`docs/30-workflows/TASK-9A-skill-editor/phase-10-final-review.md`
