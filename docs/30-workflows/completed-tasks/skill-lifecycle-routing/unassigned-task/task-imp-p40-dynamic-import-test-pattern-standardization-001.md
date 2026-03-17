# UT-IMP-P40-DYNAMIC-IMPORT-TEST-PATTERN-STANDARDIZATION-001: P40 dynamic import テストパターン標準化

## メタ情報

```yaml
issue_number: N/A
task_id: UT-IMP-P40-DYNAMIC-IMPORT-TEST-PATTERN-STANDARDIZATION-001
task_name: P40 dynamic import テストパターン標準化
category: 改善（テスト基盤）
target_feature: dynamic import テストの実行安定性とテストテンプレート標準化
priority: 中
scale: 中規模（4-8時間）
status: 未実施
source_phase: TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 Phase 4-6 苦戦箇所3
created_date: 2026-03-17
dependencies:
  - TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001
```

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | UT-IMP-P40-DYNAMIC-IMPORT-TEST-PATTERN-STANDARDIZATION-001                 |
| タスク名     | P40 dynamic import テストパターン標準化                                    |
| 分類         | 改善（テスト基盤）                                                         |
| 対象機能     | dynamic import を含むテストの実行安定性・テストテンプレート・CI 自動ガード |
| 優先度       | 中                                                                         |
| 見積もり規模 | 中規模（4-8時間）                                                          |
| ステータス   | 未実施                                                                     |
| 発見元       | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 Phase 4-6 苦戦箇所3            |
| 発見日       | 2026-03-17                                                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

P40（テスト実行ディレクトリ依存）は `.claude/rules/06-known-pitfalls.md` に記録済みの既知の落とし穴である。`TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001` の Phase 4-6 において、`await import("@/renderer/App")` のような dynamic import パターンで P40 が再発した。

モノレポ環境では `apps/desktop/vitest.config.ts` に定義されたパスエイリアス（`@/`, `@renderer`, `@main`）がプロジェクトルートからの実行時に解決されず、テストが全件失敗する。`vi.mock("@/renderer/App", ...)` はコンパイル時にモック変換されるため影響を受けにくいが、`await import("@/renderer/App")` はランタイムで Vite の alias 設定に依存するため、実行ディレクトリの違いが直接テスト失敗に繋がる。

### 1.2 問題点・課題

1. **P40 の知識が散在**: `06-known-pitfalls.md`、`lessons-learned-viewtype-electron-ui.md`、`lessons-learned-current.md` に分散しており、テスト作成時の参照先が一意でない
2. **テストテンプレート未対応**: 新規テスト作成時に dynamic import パターンの注意事項がテンプレートに組み込まれていない
3. **CI/スクリプトに自動ガードなし**: `cd apps/desktop` が必要という知識がドキュメントにしかなく、CI パイプラインやテスト実行スクリプトで実行ディレクトリを自動検証する仕組みがない
4. **vi.mock と dynamic import の挙動差が暗黙知**: `vi.mock` はコンパイル時変換、`await import()` はランタイム解決という差異が明文化されておらず、テスト作成時に混乱が生じる

### 1.3 放置した場合の影響

- P40 が新規テスト作成のたびに再発し、デバッグに余計な時間を消費する
- CI 環境でのテスト実行が不安定になるリスクが残存する
- エージェント中断後のリカバリで、テスト失敗原因の切り分けに時間がかかる
- dynamic import パターンを避けるための workaround が乱立し、テストコードの一貫性が低下する

---

## 2. 何を達成するか（What）

### 2.1 目的

P40 の再発を構造的に防止するため、dynamic import を含むテストの標準パターンを確立し、テストテンプレート・CI ガード・ドキュメントの3層で防御する。

### 2.2 最終ゴール

1. dynamic import テストの標準パターンがテストテンプレートに組み込まれている
2. CI パイプラインで実行ディレクトリの不一致を自動検出するガードが動作する
3. `vi.mock` と `await import()` の挙動差が `06-known-pitfalls.md` P40 に明文化されている
4. エージェント中断後のリカバリ手順（`git diff --stat HEAD` + `Glob`）が標準化されている

### 2.3 スコープ

#### 含むもの

- P40 エントリの拡充（dynamic import 具体例の追加）
- テストテンプレートへの P40 ガード項目追加
- CI/テストスクリプトでの実行ディレクトリ自動検証ガード
- `vi.mock` vs `await import()` の挙動差ドキュメント
- エージェント中断リカバリ手順の標準化

#### 含まないもの

- `vitest.config.ts` の alias 設定変更
- Vite/Vitest 本体のバグ修正
- モノレポ構成の変更（ルート vitest.config.ts の追加等）
- 既存テストの一括リファクタリング

### 2.4 成果物

- 更新済み `06-known-pitfalls.md` P40 エントリ（dynamic import 具体例追加）
- テストテンプレートファイル（dynamic import ガード付き）
- CI ガードスクリプト（実行ディレクトリ検証）
- 更新済み `architecture-implementation-patterns.md` または `architecture-implementation-patterns-details.md`（テストパターン追加）
- 更新済み `lessons-learned` 系ファイル（導線統合）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001` が完了していること
- `apps/desktop/vitest.config.ts` の alias 設定（`@/`, `@renderer`, `@main`）が現行のまま利用可能であること
- `pnpm --filter @repo/desktop exec vitest run` が正常動作すること

### 3.2 依存タスク

- `TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001`（P40 再発の発見元）

### 3.3 必要な知識

- Vite のパスエイリアス解決メカニズム（`resolve.alias`）
- Vitest の `vi.mock` コンパイル時変換（hoisting）と `await import()` のランタイム解決の差異
- モノレポ環境での vitest.config.ts の読み込み優先順位
- CI/CD パイプラインのディレクトリコンテキスト

### 3.4 推奨アプローチ

1. **P40 ドキュメント統合**: 散在する P40 関連の教訓を `06-known-pitfalls.md` P40 エントリに集約し、dynamic import 固有の注意事項を追記する
2. **テストテンプレート更新**: テスト作成時のボイラープレートに P40 ガードコメントとディレクトリ検証を含める
3. **CI ガードスクリプト**: テスト実行前に `process.cwd()` がパッケージルートであることを検証する pre-test スクリプトを作成する
4. **実装パターン文書化**: `vi.mock` と `await import()` の使い分けガイドラインを architecture-implementation-patterns に追加する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                               | 発見経緯                                                            | 解決策                                                              | 教訓                                                          |
| ------------------------------------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------- |
| `vi.mock` はコンパイル時解決だが `await import()` はランタイム解決 | Phase 4 で `await import("@/renderer/App")` が alias 未解決で失敗   | テストテンプレートに dynamic import 使用時の必須条件を明記する      | `vi.mock` で問題なくても `await import()` で P40 が顕在化する |
| `cd apps/desktop` の暗黙知                                         | P40 の知識がドキュメントにしかなく、CI/スクリプトに自動ガードがない | pre-test スクリプトで `package.json` の `name` フィールドを検証する | ドキュメントだけでなくコードで防御する                        |
| エージェント中断後の状態復元                                       | コンテキスト圧縮後に成果物の完了状態が不明だった                    | `git diff --stat HEAD` + `Glob` パターンを標準手順化する            | ファイルシステム上で確認可能な成果物にしておく                |
| P40 の知識が3箇所に散在                                            | 再発時に参照先が分からず対応が遅れた                                | `06-known-pitfalls.md` P40 を正本とし、他は参照リンクに統一する     | 1つの正本に集約し、他はポインタのみにする                     |

---

## 4. 実行手順

### Phase構成

- Phase 1-3: 要件定義・設計・設計レビュー
- Phase 4: テスト作成（CI ガードスクリプトのテスト）
- Phase 5: 実装（ドキュメント更新・テンプレート作成・CI ガード実装）
- Phase 6-7: テスト拡充・カバレッジ確認
- Phase 8-10: リファクタリング・品質検証・最終レビュー
- Phase 11: 手動テスト（ルートディレクトリからのテスト実行で自動ガードが機能することを確認）
- Phase 12-13: ドキュメント・完了

### Phase A: ドキュメント統合と設計

#### 目的

P40 関連の散在情報を集約し、実装の設計方針を確定する。

#### 手順

1. `06-known-pitfalls.md` P40 エントリの現状を確認する
2. `lessons-learned-viewtype-electron-ui.md` 苦戦箇所3 の内容を P40 エントリに統合する
3. `vi.mock` vs `await import()` の挙動差を明文化する
4. CI ガードスクリプトの設計（検証ロジック・エラーメッセージ）を決定する

#### 成果物

- 設計ドキュメント（P40 拡充案、CI ガード設計、テストテンプレート設計）

#### 完了条件

- dynamic import 固有の P40 再発メカニズムが設計ドキュメントに記載されている
- CI ガードの検証ロジックが確定している

### Phase B: テストテンプレートと CI ガード実装

#### 目的

テスト作成時の標準パターンと CI 自動防御を実装する。

#### 手順

1. `06-known-pitfalls.md` P40 エントリに dynamic import 具体例を追加する
2. テストテンプレートに P40 ガードコメントと推奨パターンを追加する
3. CI ガードスクリプトを作成する（`package.json` の `name` フィールドで実行ディレクトリを検証）
4. `architecture-implementation-patterns` にテストパターンを追加する
5. エージェント中断リカバリ手順を標準化する

#### 成果物

- 更新済み `06-known-pitfalls.md`
- テストテンプレート
- CI ガードスクリプト
- 更新済み architecture-implementation-patterns

#### 完了条件

- プロジェクトルートからのテスト実行時に CI ガードが警告を出力する
- テストテンプレートに P40 ガードが含まれている

### Phase C: 検証と台帳同期

#### 目的

実装した防御が機能することを確認し、台帳を同期する。

#### 手順

1. プロジェクトルートから `pnpm vitest run` を実行し、CI ガードが機能することを確認する
2. `cd apps/desktop && pnpm vitest run` で正常実行を確認する
3. `task-workflow-backlog.md` に未タスク行を追加する
4. `lessons-learned` 系ファイルの導線を統合する
5. `documentation-changelog.md` に変更内容を記録する

#### 成果物

- 検証ログ
- 更新済み task-workflow / lessons-learned / documentation-changelog

#### 完了条件

- CI ガードが不正なディレクトリからの実行を検出している
- 正しいディレクトリからのテスト実行が全 PASS している
- 台帳が同期されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `06-known-pitfalls.md` P40 に dynamic import 具体例（`vi.mock` vs `await import()` の挙動差）が追記されている
- [ ] テストテンプレートに P40 ガード（実行ディレクトリ注意事項）が組み込まれている
- [ ] CI ガードスクリプトがプロジェクトルートからの不正実行を検出する
- [ ] `architecture-implementation-patterns` に dynamic import テストパターンが追加されている
- [ ] エージェント中断リカバリ手順（`git diff --stat HEAD` + `Glob`）が標準化されている

### 品質要件

- [ ] CI ガードスクリプトのテストが PASS
- [ ] `cd apps/desktop && pnpm vitest run` で既存テストが全 PASS
- [ ] `pnpm lint` が PASS
- [ ] `pnpm typecheck` が PASS

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] `task-workflow-backlog.md` に登録されている
- [ ] `lessons-learned` 系ファイルから P40 正本への導線が統合されている
- [ ] `documentation-changelog.md` に変更内容が記録されている

---

## 6. 検証方法

### テストケース

| Case   | 説明                                                                              | 期待結果                                   |
| ------ | --------------------------------------------------------------------------------- | ------------------------------------------ |
| Case 1 | プロジェクトルートから `pnpm vitest run apps/desktop/src/...` を実行              | CI ガードがエラーまたは警告を出力する      |
| Case 2 | `cd apps/desktop && pnpm vitest run src/...` を実行                               | テストが正常に PASS する                   |
| Case 3 | `pnpm --filter @repo/desktop exec vitest run src/...` を実行                      | テストが正常に PASS する                   |
| Case 4 | dynamic import (`await import("@/...")`) を含むテストを正しいディレクトリから実行 | alias が正常に解決されテストが PASS する   |
| Case 5 | `vi.mock("@/...", ...)` を含むテストを正しいディレクトリから実行                  | モック変換が正常に動作しテストが PASS する |

### 検証コマンド

```bash
# Case 1: ルートからの実行でガードが機能することを確認
cd /path/to/project-root
pnpm vitest run apps/desktop/src/renderer/__tests__/App.renderView.viewtype.test.tsx 2>&1 | grep -i "directory\|alias\|P40"

# Case 2: 正しいディレクトリからの実行
cd apps/desktop
pnpm vitest run src/renderer/__tests__/App.renderView.viewtype.test.tsx

# Case 3: --filter 経由の実行
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/__tests__/App.renderView.viewtype.test.tsx

# Case 4: CI ガードスクリプト単体テスト
cd apps/desktop
pnpm vitest run src/test/guards/verify-test-directory.test.ts

# 台帳整合確認
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/unassigned-task/task-imp-p40-dynamic-import-test-pattern-standardization-001.md
```

---

## 7. リスクと対策

| リスク                                                                   | 影響度 | 発生確率 | 対策                                                                                                          |
| ------------------------------------------------------------------------ | ------ | -------- | ------------------------------------------------------------------------------------------------------------- |
| CI ガードが既存の CI パイプラインと干渉する                              | 高     | 低       | ガードは警告出力のみにし、既存パイプラインの `pnpm --filter` 実行パターンは正常パスとして扱う                 |
| テストテンプレートの更新が開発者に周知されない                           | 中     | 中       | `06-known-pitfalls.md` P40 からテンプレートへのリンクを張り、Phase 4 開始時の参照先を一意にする               |
| `vitest.config.ts` の alias 設定が将来変更された場合にガードが陳腐化する | 中     | 低       | ガードは alias 固有の値ではなく `package.json` の `name` フィールドで検証し、alias 変更に依存しない設計にする |
| エージェント中断リカバリ手順が形骸化する                                 | 低     | 中       | 5分解決カードとして簡潔な手順を維持し、定期的に教訓テーブルで参照される導線を確保する                         |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/rules/06-known-pitfalls.md` P40 エントリ
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-viewtype-electron-ui.md` 苦戦箇所3
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-details.md` S32
- `apps/desktop/vitest.config.ts` alias 設定（L116-126）

### 関連タスク

- `TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001`（P40 再発の発見元）
- `UT-IMP-SKILL-LIFECYCLE-ROUTING-DIRECT-RENDERVIEW-CAPTURE-GUARD-001`（同タスクの別苦戦箇所から派生）

### 参考資料

- `apps/desktop/src/renderer/__tests__/App.renderView.viewtype.test.tsx`（dynamic import 使用テストの実例）
- Vite ドキュメント: [resolve.alias](https://vitejs.dev/config/shared-options.html#resolve-alias)
- Vitest ドキュメント: [vi.mock hoisting](https://vitest.dev/api/vi.html#vi-mock)

---

## 9. 備考

### 親タスクからの教訓原文

```
苦戦箇所3: P40 テスト実行ディレクトリ依存（再発）-- dynamic import で顕在化

プロジェクトルートから pnpm vitest run を実行すると、@/renderer/App エイリアスが
解決できず全9テストが失敗した。Vite のパスエイリアスが apps/desktop/vitest.config.ts
に定義されており、ルートの vitest.config.ts では解決されない。特に
await import("@/renderer/App") のような dynamic import は vi.mock でモック化
されないため、ランタイムでエイリアス解決が必須。
```

### vi.mock と await import() の挙動差（実装時の参考）

```typescript
// vi.mock はコンパイル時に hoisting される -> alias 解決の影響を受けにくい
vi.mock("@/renderer/App", () => ({
  default: () => <div>Mock App</div>,
}));

// await import() はランタイムで解決される -> vitest.config.ts の alias 必須
const { default: App } = await import("@/renderer/App");
// プロジェクトルートから実行すると @/ が解決できずエラー:
// Error: Failed to resolve import "@/renderer/App"
```

### 補足事項

- 本タスクは「P40 の再発を構造的に防止する」ための改善タスクであり、既存テストの不具合修正ではない
- CI ガードは既存の `pnpm --filter @repo/desktop exec vitest run` パターンには影響しない設計とする
- エージェント中断リカバリ手順の標準化は、P43（サブエージェント中断）の防御と併せて効果を発揮する
