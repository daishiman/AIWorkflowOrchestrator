# Phase 8: リファクタリング（TDD: Refactor） - タスク仕様書

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001              |
| Phase        | 8                                                        |
| Phase名      | リファクタリング（TDD: Refactor）                        |
| 前提Phase    | Phase 7（カバレッジ確認）                                |
| 後続Phase    | Phase 9（品質保証）                                      |
| ステータス   | 完了（2026-02-27）                                       |
| 作成日       | 2026-02-27                                               |
| 機能名       | ut-imp-quick-validate-empty-field-guard-001              |
| Issue        | #913                                                     |
| 対象ファイル | `.claude/skills/skill-creator/scripts/quick_validate.js` |

---

## 目的

TDD の Refactor フェーズとして、Phase 5 で追加した P42 準拠 3 段バリデーションのコード品質を改善する。
テストを維持しながら、重複パターンの解消・可読性・保守性の向上を行う。

## 背景

Phase 5 で `name`/`description` フィールドに P42 準拠の 3 段バリデーション（typeof チェック → 空文字列チェック → trim 空文字列チェック）を追加した。
`name` 検証（140 行目付近）と `description` 検証（158 行目付近）に同じバリデーションパターンが重複している可能性がある。
ただし本タスクは小規模バグ修正であるため、YAGNI 原則に従い過度な抽象化は行わない。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク 8-1: コードスメル分析

**目的**: Phase 5 で追加したバリデーションコードの品質を分析し、改善ポイントを特定する

**実行手順**:

1. `.claude/skills/skill-creator/scripts/quick_validate.js` を読み込む
2. 以下の観点でコードスメルを特定する
3. 改善が必要な箇所と優先度を記録する

**分析観点**:

| 観点           | 確認内容                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| 重複コード     | `name` と `description` の 3 段バリデーション（typeof → 空文字列 → trim 空文字列）が重複していないか |
| 命名一貫性     | エラーメッセージのフォーマット（日本語/英語の混在、フィールド名の表記揺れ）が一貫しているか          |
| 条件分岐の深さ | if/else のネストが 3 段以上になっていないか                                                          |
| 早期リターン   | ガード節で早期に処理を打ち切れる箇所がないか                                                         |

**判定基準**:

- 重複コードが 3 行以上かつ 2 箇所以上 → ヘルパー関数抽出を検討
- 重複コードが 3 行未満 → インライン維持（YAGNI）

**期待される成果物**:

- `outputs/phase-8/code-smell-analysis.md`

---

### タスク 8-2: バリデーションパターンの整理

**目的**: name/description の 3 段バリデーションが共通化可能か判断し、必要な場合のみヘルパー関数を抽出する

**実行手順**:

1. `name` フィールドの 3 段バリデーションコードを抽出する
2. `description` フィールドの 3 段バリデーションコードを抽出する
3. 両者の共通部分と差異を比較する
4. 以下の判断基準に基づき対応を決定する

**判断基準**:

| 条件                                                                        | 対応                                         |
| --------------------------------------------------------------------------- | -------------------------------------------- |
| 3 段バリデーションが完全に同一パターン                                      | `isNonEmptyString(value)` ヘルパー関数を抽出 |
| 3 段バリデーション後の処理が異なる（name は正規表現、description は文字数） | 3 段チェック部分のみ共通化                   |
| 重複が 3 行未満                                                             | インライン維持（変更しない）                 |

**ヘルパー関数を抽出する場合の実装例**:

```javascript
/**
 * 文字列フィールドの P42 準拠 3 段バリデーション
 * @param {unknown} value - 検証対象の値
 * @returns {boolean} 有効な非空文字列であれば true
 */
function isNonEmptyString(value) {
  return typeof value === "string" && value !== "" && value.trim() !== "";
}
```

**制約**:

- ヘルパー関数を追加する場合は `quick_validate.js` 内のモジュールスコープに配置する（`utils.js` への移動は本タスクのスコープ外）
- 既存テストが全て PASS することを確認してから次に進む

**期待される成果物**:

- `outputs/phase-8/validation-pattern-review.md`

---

### タスク 8-3: エラーメッセージ一貫性の確認

**目的**: Phase 5 で追加したエラーメッセージが既存メッセージと一貫したフォーマットであることを確認する

**実行手順**:

1. `quick_validate.js` 内の全 `addError()` 呼び出しのメッセージを一覧化する
2. 以下の一貫性基準を確認する
3. 不一致があれば修正する

**一貫性基準**:

| 基準               | ルール                                                    | 例                                              |
| ------------------ | --------------------------------------------------------- | ----------------------------------------------- |
| 言語               | 日本語で統一                                              | `"name フィールドが存在しません"`               |
| フィールド名の表記 | YAML キー名をそのまま使用（`name`, `description`）        | `"name が..."` / `"description が..."`          |
| 型エラーメッセージ | `"{{field}} フィールドは文字列である必要があります"` 形式 | `"name フィールドは文字列である必要があります"` |
| 空文字列メッセージ | `"{{field}} フィールドが空です"` 形式                     | `"name フィールドが空です"`                     |

**期待される成果物**:

- `outputs/phase-8/error-message-consistency.md`

---

### タスク 8-4: テスト継続成功の確認

**目的**: リファクタリング後のコードが全テストに PASS することを確認する

**実行手順**:

1. リファクタリング変更をすべて適用する
2. 以下のコマンドでテストを実行する
3. 全テスト PASS を確認する

**コマンド**:

```bash
cd .claude/skills/skill-creator && pnpm test -- quick_validate
```

**確認項目**:

- [ ] 既存テスト（TC-N-_, TC-E-_, TC-B-_, TC-OP-_, TC-WC-_, TC-RG-_, TC-EC-_, TC-IT-_）が全て PASS
- [ ] Phase 5/6 で追加したテスト（空フィールドガード関連）が全て PASS
- [ ] テスト数がリファクタリング前と同一（テストの追加・削除がないこと）

**期待される成果物**:

- `outputs/phase-8/test-continuity-report.md`（テスト実行ログのスナップショット）

---

## 参照資料

| 参照資料               | パス                                                                                                      | 内容               |
| ---------------------- | --------------------------------------------------------------------------------------------------------- | ------------------ |
| 対象ファイル           | `.claude/skills/skill-creator/scripts/quick_validate.js`                                                  | 実装コード         |
| テストファイル         | `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js`                                   | テストコード       |
| ユーティリティ         | `.claude/skills/skill-creator/scripts/utils.js`                                                           | 共有ユーティリティ |
| Phase 1 要件定義       | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/phase-1-requirements.md`   | 要件確認           |
| Phase 2 設計仕様       | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/phase-2-design.md`         | 設計確認           |
| Phase 5 実装仕様       | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/phase-5-implementation.md` | 実装内容           |
| Phase 6 テスト拡充     | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/phase-6-test-expansion.md` | テスト補強内容     |
| Phase 7 カバレッジ結果 | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/phase-7-coverage-check.md` | カバレッジ確認結果 |

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容                             |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------------- |
| P42 準拠ルール                       | `.claude/rules/06-known-pitfalls.md#P42`                                                    | 3段バリデーション規約            |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装/リファクタリングパターン    |
| quality-requirements                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質基準・カバレッジ基準         |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラー分類・Validation Error運用 |
| development-guidelines               | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | 開発規約                         |

---

## 多角的チェック観点

| 観点               | 該当/非該当 | 判断理由                                                           |
| ------------------ | ----------- | ------------------------------------------------------------------ |
| セキュリティ       | 非該当      | Node.js CLI スクリプトの内部検証ロジックであり、外部入力攻撃面なし |
| UI/UX              | 非該当      | CLI 出力のみ。Renderer/コンポーネント変更なし                      |
| アーキテクチャ     | 非該当      | 単一ファイル内のリファクタリング。レイヤー変更なし                 |
| API 設計           | 非該当      | IPC/REST API 変更なし                                              |
| データ整合性       | 非該当      | DB/ストア変更なし                                                  |
| エラーハンドリング | **該当**    | エラーメッセージの一貫性確認が対象                                 |
| パフォーマンス     | 非該当      | 小規模修正のため計測不要                                           |
| アクセシビリティ   | 非該当      | UI 実装なし                                                        |
| テスタビリティ     | **該当**    | リファクタリング後のテスト継続成功が必須                           |

---

## 成果物

| 成果物                 | パス                                           | 内容                       |
| ---------------------- | ---------------------------------------------- | -------------------------- |
| コードスメル分析       | `outputs/phase-8/code-smell-analysis.md`       | 分析結果と改善優先度       |
| バリデーションパターン | `outputs/phase-8/validation-pattern-review.md` | 共通化判断と実施内容       |
| エラーメッセージ一貫性 | `outputs/phase-8/error-message-consistency.md` | メッセージフォーマット確認 |
| テスト継続成功レポート | `outputs/phase-8/test-continuity-report.md`    | テスト実行ログ             |

---

## 統合テスト連携【必須】

> リファクタ後の統合テスト継続成功を確認する

| 確認項目                      | 基準                                 |
| ----------------------------- | ------------------------------------ |
| 全ユニットテスト              | 100% PASS                            |
| リグレッションテスト（TC-RG） | 実スキル検証が全て PASS              |
| 統合テスト（TC-IT）           | 複数スキル順次検証が PASS            |
| テスト数維持                  | リファクタリング前後でテスト数が同一 |

---

## TDD 検証

```bash
# リファクタリング中は継続的にテスト実行
cd .claude/skills/skill-creator && pnpm test -- quick_validate --watch
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 完了条件

- [ ] コードスメル分析が完了し、改善ポイントが特定されている
- [ ] name/description バリデーションパターンの共通化判断が記録されている
- [ ] エラーメッセージが一貫したフォーマットに統一されている
- [ ] 全てのテストが PASS している
- [ ] テスト数がリファクタリング前と同一である

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全タスク（4 タスク）を 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物（4 ファイル）が全て生成されていることを確認
- [ ] テストが継続して Green 状態であることを確認

---

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了状態を明記している

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次の Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/phase-9-quality-assurance.md`
