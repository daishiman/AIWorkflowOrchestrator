# artifacts.json ファイルパス実在検証の自動化

## メタ情報

```yaml
issue_number: 1285
```

## メタ情報

| 項目         | 内容                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| タスクID     | UT-ARTIFACTS-JSON-FILEPATH-VALIDATION-001                                           |
| タスク名     | artifacts.json 参照ファイルパスの実在検証自動化                                     |
| 分類         | 改善                                                                                |
| 対象機能     | タスクワークフロー成果物管理（artifacts.json）                                      |
| 優先度       | 中                                                                                  |
| 見積もり規模 | 小規模                                                                              |
| ステータス   | 未実施                                                                              |
| 発見元       | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION 再監査（ファントムファイル15件検出） |
| 発見日       | 2026-03-16                                                                          |
| 関連タスク   | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION                                      |
| issue_number | 1277                                                                                |

## 1. なぜこのタスクが必要か（Why）

### 背景

TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION の再監査で、`artifacts.json` に記載された15件のファイルパスが実際にはディスク上に存在しないことが発覚した。具体的には、仕様書テンプレートから自動生成された `outputs/phase-*/` のデフォルトファイル名（例: `requirements-definition.md`）が、実際の Phase 実行で生成されたファイル名（例: `requirements-verification.md`）と異なっていた。

### 問題点・課題

- artifacts.json のファイルパスが実在しないため、後続ツール（validate-phase-output 等）がファイルを見つけられない
- テンプレート由来のデフォルトパスが実績と乖離し、成果物の追跡可能性が失われる
- ファイルパスの検証が手動であり、Phase 完了時にパスの整合性チェックが行われない

### 放置した場合の影響

| 影響領域   | 影響                                                               |
| ---------- | ------------------------------------------------------------------ |
| 監査追跡   | artifacts.json を信頼した検証が全て false positive/negative になる |
| Phase 12   | documentation-changelog が artifacts.json の誤情報を転記する連鎖   |
| 開発者体験 | 成果物を探す際に存在しないパスを参照してしまう                     |

## 2. 何を達成するか（What）

### 目的

artifacts.json に記載された全ファイルパスの実在を自動検証するスクリプトを作成し、Phase 完了時に必ず実行する。

### 最終ゴール

- artifacts.json 内の全 `outputs`、`codeArtifacts` パスがディスク上に実在することを検証
- 不在ファイルがあればエラーレポートを出力
- Phase 完了時の自動実行（validate-phase-output と連携）

### スコープ

**含むもの**:

- artifacts.json 内パス検証スクリプト（独立実行可能）
- validate-phase-output.js との統合
- 不在ファイルのエラーレポート出力

**含まないもの**:

- artifacts.json テンプレート自体の修正（別タスクで検討）
- Phase 実行時の artifacts.json 自動更新機構

### 成果物

| 種別 | 成果物                                    | 配置先                                                                          |
| ---- | ----------------------------------------- | ------------------------------------------------------------------------------- |
| 実装 | artifacts.json パス検証スクリプト（新規） | `.claude/skills/task-specification-creator/scripts/validate-artifacts-paths.js` |
| 実装 | validate-phase-output.js への統合（変更） | `.claude/skills/task-specification-creator/scripts/validate-phase-output.js`    |

## 3. どのように実行するか（How）

### 前提条件

なし（独立して実行可能）

### 推奨アプローチ

案 C（独立スクリプト + validate-phase-output からの呼び出し）を推奨する。

| 案  | 方法                                                  | メリット                   | デメリット                     |
| --- | ----------------------------------------------------- | -------------------------- | ------------------------------ |
| A   | Node.js スクリプト（独立）                            | scripts/ に配置可能        | 独立実行のみ                   |
| B   | validate-phase-output.js に統合                       | 既存ワークフローに自動統合 | validate-phase-output が肥大化 |
| C   | 独立スクリプト + validate-phase-output からの呼び出し | 責務分離 + 自動統合        | ファイル数が増える             |

### 実装課題と解決策（親タスクからの教訓）

| 課題                                 | 発見経緯                                                                                                           | 解決策                                                                      | 教訓                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------------- |
| ファントムファイル15件の残存         | 再監査で `jq` でパスを抽出し `ls` で確認したところ、Phase 1-3, 8 の outputs が全て不在                             | artifacts.json を手動で全面書き換え。根本対策として自動検証スクリプトが必要 | テンプレート生成時のデフォルトパスは Phase 実行後に乖離する |
| テンプレート由来パスと実績パスの乖離 | 仕様書テンプレートの `outputs` に想定ファイル名が事前記載されるが、実際の Phase 実行で生成されるファイル名が異なる | Phase 完了時に自動検証を実行し、不在パスを即座に検出する                    | P4/P37 パターン: 早期固定した情報は実績と乖離する           |

## 4. 実行手順

### 概要ステップ

1. `validate-artifacts-paths.js` を独立スクリプトとして作成
2. artifacts.json 内の全 `outputs` と `codeArtifacts` パスを再帰的に抽出
3. 各パスに対してファイル実在を検証し、不在ファイルをエラーレポートとして出力
4. `validate-phase-output.js` から `validate-artifacts-paths.js` を呼び出す統合を実装
5. テストケースを作成して検証

### Phase 構成

| Phase | 名称                           | 内容                                                   |
| ----- | ------------------------------ | ------------------------------------------------------ |
| 1-3   | 要件定義・設計・レビュー       | 検証ロジック設計、validate-phase-output 統合方式の決定 |
| 4     | テスト作成                     | パス検証・不在検出・正常系のテストケース               |
| 5     | 実装                           | 検証スクリプト + validate-phase-output 統合            |
| 6-7   | テスト拡充・カバレッジ         | エッジケース（空 artifacts.json、パス未定義 Phase 等） |
| 8-10  | リファクタリング〜最終レビュー | 品質検証                                               |
| 11-13 | 手動テスト〜完了               | 文書更新・PR                                           |

## 5. 完了条件チェックリスト

- [ ] `validate-artifacts-paths.js` がローカルで独立実行できる
- [ ] artifacts.json 内の全 `outputs` パスの実在を検証する
- [ ] artifacts.json 内の全 `codeArtifacts` パスの実在を検証する
- [ ] 不在ファイルがある場合にエラーレポートを出力する
- [ ] `validate-phase-output.js` から自動呼び出しされる
- [ ] 全パスが実在する場合に正常終了する（exit code 0）

## 6. 検証方法

### 実行コマンド

```bash
# 独立実行
node .claude/skills/task-specification-creator/scripts/validate-artifacts-paths.js <artifacts.json パス>

# 検出コマンド（手動確認用）
jq -r '.. | .outputs? // empty | .[]' artifacts.json | while read f; do [ -f "$f" ] || echo "MISSING: $f"; done
```

### テストケース

| #   | テストケース                        | 入力条件                                    | 期待結果                              |
| --- | ----------------------------------- | ------------------------------------------- | ------------------------------------- |
| 1   | 全パスが実在する場合                | 正常な artifacts.json（全パスが実在）       | exit code 0、エラーなし               |
| 2   | 不在ファイルを検出できること        | 意図的に1パスを誤記した artifacts.json      | 不在パスがエラーレポートに出力される  |
| 3   | outputs と codeArtifacts を両方検証 | 両セクションにパスが存在する artifacts.json | 両セクションのパスが検証される        |
| 4   | 空の artifacts.json で正常終了      | パス定義なしの artifacts.json               | exit code 0、検証対象なしのメッセージ |

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                                      |
| ------------------------------------ | ------ | -------- | --------------------------------------------------------- |
| artifacts.json の構造変更            | 中     | 低       | JSON パス抽出ロジックを柔軟に設計                         |
| 相対パスと絶対パスの混在             | 中     | 中       | artifacts.json の基底ディレクトリからの相対パス解決を実装 |
| validate-phase-output との統合不整合 | 低     | 低       | 独立実行可能な設計により、統合失敗時も単独で使用可能      |

## 8. 参照情報

### ソースコード

- `.claude/skills/task-specification-creator/scripts/validate-phase-output.js` -- 既存の Phase 出力検証スクリプト

### 仕様書・ルール

- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` -- Phase 12 ドキュメントガイド
- `.claude/rules/06-known-pitfalls.md` -- P4（早期完了記載）、P37（ドキュメント数値の早期固定）

### 苦戦箇所（5分解決カード）

1. `jq -r '.. | .outputs? // empty | .[]' artifacts.json` で全出力パスを抽出
2. `jq -r '.. | .codeArtifacts? // empty | .[]' artifacts.json` で全コード成果物パスを抽出
3. 各パスに対して `[ -f "$path" ] || echo "MISSING: $path"` で実在を確認
4. 不在パスを実際のファイルパスに修正
5. `git diff artifacts.json` で修正内容を確認

## 9. 備考

### 補足事項

- 本タスクは TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION 再監査で発見された「ファントムファイル15件」問題の根本対策。
- テンプレートから自動生成される artifacts.json は Phase 実行後にファイル名が変わるため、検証の自動化が不可欠。
- 関連 Pitfall: P4（documentation-changelog への早期「完了」記載）-- ファントムパスが changelog にも転記されていた。
- 関連 Pitfall: P37（ドキュメント数値の早期固定）-- テンプレート由来の情報が実績と乖離するパターン。
- 関連教訓: `lessons-learned-auth-ipc-fallback-registration-settings.md`（苦戦箇所1: 仕様と outputs の FR がずれる連鎖）。
