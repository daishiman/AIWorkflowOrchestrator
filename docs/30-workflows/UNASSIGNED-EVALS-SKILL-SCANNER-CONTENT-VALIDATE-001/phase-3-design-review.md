# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 3                                                   |
| タスクID   | UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 |
| 機能名     | evals-skill-scanner-content-validate                |
| タスク名   | SkillScanner EVALS.json 内容バリデーション追加      |
| 前提Phase  | Phase 2                                             |
| 後続Phase  | Phase 4                                             |
| 作成日     | 2026-04-21                                          |
| ステータス | pending                                             |

## 目的

Phase 2 で設計した内容（`EvalsValidationResult` 型・`SkillOtherFile` 型拡張・`validateEvalsContent()` バリデーションフロー・テスト戦略）が Phase 4（テスト先行作成）・Phase 5（実装）へ進めるだけの品質を満たしているかを多角的にレビューし、進行可否を判定する。

## レビュー観点（4条件）

### 観点 1: 価値性（問題を正しく解決しているか）

| 確認項目                                           | 判定基準                                                                     |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| 空 `{}` の EVALS.json が invalid 判定されるか      | `reason: "empty-object"` で `valid: false` が返る設計になっているか          |
| 破損 JSON の EVALS.json が invalid 判定されるか    | `reason: "parse-error"` で `valid: false` が返る設計になっているか           |
| 必須キー欠落の EVALS.json が invalid 判定されるか  | `reason: "missing-required-keys"` で `valid: false` が返る設計になっているか |
| 正常な snake_case EVALS.json が valid 判定されるか | `{ valid: true, dialect: "snake_case" }` が返る設計になっているか            |
| 正常な camelCase EVALS.json が valid 判定されるか  | `{ valid: true, dialect: "camelCase" }` が返る設計になっているか             |

### 観点 2: 実現性（技術的に実装可能か）

| 確認項目                                                                | 判定基準                                                             |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `validateEvalsContent()` が `scanOtherFiles()` から呼び出せるか         | `private` メソッドとして同クラスに追加できる構造になっているか       |
| `EvalsValidationResult` 型を `packages/shared/` に追加できるか          | 既存の `SkillOtherFile` 型のある場所に追加できる設計になっているか   |
| `evalsValidation?` フィールドが optional であることで後方互換性があるか | `undefined` の場合の既存コードへの影響がないか確認されているか       |
| `fs.readFile()` の追加呼び出しによるパフォーマンス影響が許容範囲内か    | EVALS.json が存在するスキルのみ追加 I/O が発生する設計になっているか |

### 観点 3: 整合性（既存設計・テストと矛盾しないか）

| 確認項目                                                                             | 判定基準                                                                       |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `scanOtherFiles()` の既存インターフェース（戻り値型）が保たれるか                    | `SkillOtherFile[]` 型が維持されており、呼び出し元への影響が最小化されているか  |
| 既存3テスト（`with-evals`・`with-all-others`・`with-sized-evals`）の更新方針が明確か | テストの期待値のみを変更し、フィクスチャ内容は変更しない方針が維持されているか |
| `EvalsValidationResult` 型の union 型設計が TypeScript の型安全性を損なわないか      | discriminated union として正しく設計されているか（`valid` フィールドで判定）   |
| camelCase / snake_case 両許容ポリシーが将来の統一移行を妨げないか                    | コメント内に「方言統一は別タスク」と明記されているか                           |

### 観点 4: 運用性（保守・拡張しやすいか）

| 確認項目                                                            | 判定基準                                                                                |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| バリデーションエラー理由 (`reason`) が運用時のデバッグに役立つか    | `"parse-error"` / `"empty-object"` / `"missing-required-keys"` で原因特定できるか       |
| `missingKeys` フィールドでどのキーが欠落しているか追跡できるか      | `reason: "missing-required-keys"` 時に `missingKeys: string[]` が設計されているか       |
| `validateEvalsContent()` が単体テスト可能なシグネチャになっているか | `private` メソッドを `(obj as unknown as PrivateType)` キャストでテスト可能か           |
| EVALS.json の必須キーが将来変更された場合に局所的に修正できるか     | 必須キー定数 (`REQUIRED_KEYS_SNAKE`・`REQUIRED_KEYS_CAMEL`) が 1 箇所にまとまっているか |

## 矛盾チェック表

| チェック項目                                                             | Phase 2 設計の内容                                                         | 矛盾の有無 |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ---------- |
| `SkillOtherFile.evalsValidation` は `type: "evals"` 以外でも設定されるか | `validateEvalsContent()` は `type === "evals"` の場合のみ呼ばれる          | 矛盾なし   |
| 破損 JSON の場合に `size` は正しく記録されるか                           | `fs.stat()` は `fs.readFile()` より先に実行され独立している                | 矛盾なし   |
| `evalsValidation` が `undefined` の場合に upstream が壊れないか          | `optional` フィールドであり既存コードは `evalsValidation` を参照していない | 要確認     |
| camelCase 方言で `metrics` のみが共通キーだが設計に反映されているか      | `REQUIRED_KEYS_SNAKE` と `REQUIRED_KEYS_CAMEL` の `metrics` が共通         | 矛盾なし   |
| 既存3テストのフィクスチャ内容変更なし方針と期待値更新方針が一致するか    | Phase 2 テスト戦略はフィクスチャ内容を変えず assertion のみ変更            | 矛盾なし   |

## ゲート判定基準

| Gate | 条件                                                                           | 判定方法                                                 | 結果   |
| ---- | ------------------------------------------------------------------------------ | -------------------------------------------------------- | ------ |
| G-01 | 4つの異常系（空・破損・必須キー欠落）が全て invalid 判定される設計になっている | 観点 1 の全項目が「基準を満たす」                        | 未判定 |
| G-02 | `EvalsValidationResult` 型が discriminated union として設計されている          | 観点 2・3 の型安全性確認                                 | 未判定 |
| G-03 | `SkillOtherFile` 拡張が後方互換性を保っている                                  | 観点 2 の後方互換性確認                                  | 未判定 |
| G-04 | 既存3テストの更新方針が明確（期待値変更・フィクスチャ変更なし）                | 観点 3 のテスト整合性確認                                | 未判定 |
| G-05 | camelCase / snake_case ポリシーがコメントとして明示されている                  | Phase 2 設計書の `validateEvalsContent()` 内コメント確認 | 未判定 |

**全 Gate が「承認」の場合のみ Phase 4 へ進む。**

| 判定結果          | 対応                                                                 |
| ----------------- | -------------------------------------------------------------------- |
| 全 Gate 承認      | Phase 4（テスト先行作成）へ進む                                      |
| G-01 不承認       | Phase 2 のバリデーションフロー設計（`validation-flow.md`）へ差し戻し |
| G-02・G-03 不承認 | Phase 2 の型設計（`type-design.md`）へ差し戻し                       |
| G-04 不承認       | Phase 2 のテスト戦略（`test-strategy.md`）へ差し戻し                 |
| G-05 不承認       | Phase 2 の `validateEvalsContent()` コメント設計へ差し戻し           |

## 参照資料

| 資料名                       | パス                                   | 用途                      |
| ---------------------------- | -------------------------------------- | ------------------------- |
| Phase 2 型設計書             | `outputs/phase-2/type-design.md`       | G-02・G-03 確認の入力     |
| Phase 2 バリデーションフロー | `outputs/phase-2/validation-flow.md`   | G-01・G-05 確認の入力     |
| Phase 2 テスト戦略書         | `outputs/phase-2/test-strategy.md`     | G-04 確認の入力           |
| Phase 2 依存整合マトリクス   | `outputs/phase-2/dependency-matrix.md` | G-03 後方互換性確認の入力 |

## 成果物

| 成果物           | パス                                      | 説明                                                   |
| ---------------- | ----------------------------------------- | ------------------------------------------------------ |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | 4観点のチェック結果・矛盾チェック表の記録              |
| ゲート判定書     | `outputs/phase-3/gate-decision.md`        | G-01〜G-05 の判定結果・PASS/FAIL の根拠                |
| 差し戻し記録     | `outputs/phase-3/rollback-record.md`      | 差し戻しが発生した場合の差し戻し先・理由（不要なら空） |

## 完了条件

- [ ] 観点 1（価値性）の全確認項目をチェックした
- [ ] 観点 2（実現性）の全確認項目をチェックした
- [ ] 観点 3（整合性）の全確認項目をチェックした
- [ ] 観点 4（運用性）の全確認項目をチェックした
- [ ] 矛盾チェック表の全項目を評価した
- [ ] Gate G-01〜G-05 の判定結果を記録した
- [ ] Phase 4 への進行可否が明確に判定されている
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] Gate G-01〜G-05 全ての判定が記録されていること
- [ ] Phase 4 への進行可否が明文化されていること
- [ ] 差し戻しが発生した場合、差し戻し先と理由が記録されていること

## 次のPhase

Phase 4: テスト作成（ゲート PASS の場合）
