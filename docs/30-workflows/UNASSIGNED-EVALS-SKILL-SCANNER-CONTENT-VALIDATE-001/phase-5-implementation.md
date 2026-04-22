# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 5                                                   |
| タスクID   | UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 |
| 機能名     | evals-skill-scanner-content-validate                |
| 前提Phase  | Phase 4                                             |
| 後続Phase  | Phase 6                                             |
| 作成日     | 2026-04-21                                          |
| ステータス | pending                                             |

## 目的

Phase 4 で作成したテスト（TDD Red）を GREEN にする最小限の実装を行う。
`SkillScanner.ts` に EVALS.json の内容バリデーションフックを追加し、空オブジェクト・破損JSON・必須キー欠落を検出できるようにする。

## 実装計画

### 変更対象ファイル一覧

| ファイル                                                              | 変更種別 | 変更概要                                                                                                |
| --------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillScanner.ts`                | 修正     | EVALS.json パース＋内容バリデーションロジックの追加、戻り値型の拡張                                     |
| `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` | 修正     | 既存3テストの契約更新（「中身を期待しない」→「内容バリデーション結果を期待する」）、壊れEVALSケース追加 |

## 実装ステップ（TDD Green）

1. `SkillScanner.ts` の戻り値型に `evalsValidation?: EvalsValidationResult` フィールドを追加する
2. EVALS.json を読み込む既存パスに `JSON.parse` 処理を追加し、構文エラーをキャッチする
3. パース成功時に必須キーの存在確認（`cases` フィールド等）を行うバリデーション関数を同ファイル内に追加する
4. 空オブジェクト `{}` を無効として検出するチェックを追加する
5. camelCase/snake_case 両許容ポリシーをコードコメントとして明記する（後述）
6. バリデーション結果を既存の戻り値に付加して返却する
7. `SkillScanner.test.ts` の既存3テストのアサーションを新型に合わせて更新する
8. 壊れ EVALS.json フィクスチャを作成し、新規テストを RED → GREEN にする
9. `pnpm --filter @repo/desktop test -- SkillScanner` で全テスト GREEN を確認する

## 実装の注意事項

### EVALS.json パース処理追加箇所

- 既存の「ファイルサイズチェック」直後にパース処理を挿入する
- `fs.readFileSync` または既存の読み込みユーティリティを流用し、追加の I/O を最小限に抑える
- パースエラー（`SyntaxError`）は `evalsValidation.error` として記録し、スキャン全体を中断しないこと

### camelCase/snake_case 両許容ポリシーのコメント化

```typescript
// [POLICY] EVALS.json のキー命名規則について:
// camelCase (例: testCases) と snake_case (例: test_cases) の両方を受け入れる。
// これは既存フィクスチャ (skill-creator/complete-skill/EVALS.json) が snake_case を
// 使用しているためであり、camelCase への一括移行は別タスク (EVALS-MIGRATION) で対応する。
// バリデーション時は両方の表記を OR 条件で確認すること。
```

### 既存戻り値構造への型変更影響

- `EvalsValidationResult` 型は Optional（`?`）として追加し、既存呼び出し箇所を破壊しない
- `evalsValidation` が `undefined` の場合は「バリデーション非実施」（例: EVALS.json 不在）を意味する
- `evalsValidation.valid === false` の場合もスキルリストには載せる（警告扱い）。スキャン失敗との混同を避けること

### 同期処理の性能トレードオフ注意

- EVALS.json のパースは同期処理（`JSON.parse`）で行う。スキャン対象スキル数が数十件を超える場合は合計処理時間が増加する
- 重い検証（スキーマ全検証、外部ライブラリ呼び出し）は避ける。必須キー確認程度に留める
- 大容量 EVALS.json（1MB 超）の場合はパースをスキップし `evalsValidation.skipped = true` を返す安全弁を設ける

## .claude 正本更新と mirror への同期手順

1. `.claude/skills/` 配下の関連スキル仕様を更新する（SkillScanner の API 変更を反映）
2. `.agents/skills/` への mirror 同期を行う（parity 確認は Phase 9 で実施）
3. 変更内容を `outputs/phase-5/changed-files.md` に記録する

## テストコマンド

```bash
# SkillScanner 単体テストのみ実行
pnpm --filter @repo/desktop test -- SkillScanner

# 詳細ログ付き実行
pnpm --filter @repo/desktop test -- --reporter=verbose SkillScanner

# 型チェック（実装後に必ず実行）
pnpm --filter @repo/desktop typecheck
```

## 成果物

| 成果物           | パス                                        | 説明                                                           |
| ---------------- | ------------------------------------------- | -------------------------------------------------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 追加したバリデーションロジック・型変更・コメントの内容サマリー |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更したファイルパスと変更種別の一覧                           |
| 契約差分         | `outputs/phase-5/contract-diff.md`          | 既存3テストの「中身を期待しない」契約から新契約への差分記録    |

## 完了条件

- [ ] `SkillScanner.ts` に EVALS.json パース処理が追加されている
- [ ] `SkillScanner.ts` に必須キーバリデーション関数が追加されている
- [ ] 空オブジェクト `{}` を無効として検出できる
- [ ] camelCase/snake_case 両許容ポリシーのコメントが追加されている
- [ ] `EvalsValidationResult` 型が追加されており、Optional フィールドとして戻り値に付加されている
- [ ] 既存3テスト（with-evals / with-all-others / with-sized-evals）のアサーションが新型に合わせて更新されている
- [ ] 壊れ EVALS.json の新規テストが GREEN である
- [ ] `pnpm --filter @repo/desktop test -- SkillScanner` で全テスト GREEN
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 全テスト GREEN 確認
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 6: テスト拡充
