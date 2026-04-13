# vitest.config.ts resolve.alias 自動解決対応 - タスク指示書

## メタ情報

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-VITEST-ALIAS-AUTO-RESOLVE-001                     |
| issue_number | 2088                                                              |
| タスク名     | vitest.config.ts resolve.alias 自動解決対応                       |
| 分類         | 改善                                                              |
| 対象機能     | テスト基盤 / ビルド設定                                           |
| 優先度       | 低                                                                |
| 見積もり規模 | 小規模                                                            |
| ステータス   | 未実施                                                            |
| 発見元       | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001 Phase 10 MINOR |
| 発見日       | 2026-04-11                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`apps/desktop/vitest.config.ts` では `vite-tsconfig-paths` plugin を使用して `tsconfig.json` のパスエイリアスをテスト環境に反映させている。しかし `@repo/shared/types/skillWizard` のような subpath エクスポートに対して value import（`import { SEMANTIC_LABEL_MAP } from "@repo/shared/types/skillWizard"` など）を使用する場合、`vite-tsconfig-paths` がこれを解決できず、`vitest.config.ts` の `resolve.alias` に手動でエントリを追加する必要がある。

### 1.2 問題点・課題

- **手動追加の繰り返し**: 新しい subpath（例: `@repo/shared/types/newFeature`）を追加するたびに、`vitest.config.ts` の `resolve.alias` に手動エントリを追加しなければならない
- **設定の二重管理**: `tsconfig.json` の `paths` と `vitest.config.ts` の `resolve.alias` が同一の情報を重複管理しており、追加・削除時に両方の更新が必要
- **ミス誘発リスク**: `tsconfig.json` を更新して `vitest.config.ts` の更新を忘れると、テストが解決エラーで失敗する

### 1.3 放置した場合の影響

- `@repo/shared` に新しい subpath を追加するたびに手動対応が必要で、開発体験が低下する
- 設定の更新漏れによってテストが CI で突然失敗するリスクがある
- 新規メンバーが `vitest.config.ts` に手動 alias が必要な理由を把握できず、同様の問題で詰まる可能性がある

---

## 2. 何を達成するか（What）

### 2.1 目的

`vitest.config.ts` の `resolve.alias` を `tsconfig.json` から自動生成することで、subpath を追加しても手動エントリが不要になる仕組みを構築する。

### 2.2 最終ゴール

- `@repo/shared/types/*` の subpath を追加した際、`vitest.config.ts` を変更しなくてもテストが通る
- `tsconfig.json` の `paths` が単一の信頼できる情報源（SSOT）となる

### 2.3 スコープ

#### 含むもの

- `apps/desktop/vitest.config.ts` の `resolve.alias` 自動化調査・実装
- `vite-tsconfig-paths` の value import 対応可否の検証
- 代替アプローチ（`tsconfig.json` を読み込んで alias を動的生成）の検討と実装

#### 含まないもの

- `packages/shared/tsup.config.ts` のビルド設定変更
- `apps/web` や他パッケージのテスト設定変更
- Node.js モジュール解決の根本的な変更

### 2.4 成果物

- 改善された `apps/desktop/vitest.config.ts`（手動 alias エントリ不要）
- アプローチの選定根拠ドキュメント（任意）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `pnpm --filter @repo/desktop test` が全件 PASS の状態であること
- `apps/desktop/tsconfig.json` の `paths` に `@repo/shared/types/skillWizard` が定義されていること

### 3.2 依存タスク

- なし（独立して実施可能）

### 3.3 必要な知識

- Vite / Vitest の `resolve.alias` 設定
- `vite-tsconfig-paths` の動作原理（type import vs value import の違い）
- TypeScript `tsconfig.json` の `paths` 設定

### 3.4 推奨アプローチ

**アプローチA（推奨）**: `tsconfig.json` を読み込んで `resolve.alias` を動的生成

```typescript
// vitest.config.ts の例
import tsconfigPaths from "vite-tsconfig-paths";
import { readFileSync } from "fs";
import { resolve } from "path";

const tsconfig = JSON.parse(readFileSync("./tsconfig.json", "utf-8"));
const paths = tsconfig.compilerOptions?.paths ?? {};
const alias = Object.fromEntries(
  Object.entries(paths).map(([key, [value]]) => [
    key.replace("/*", ""),
    resolve(__dirname, value.replace("/*", "")),
  ]),
);
```

**アプローチB**: `vite-tsconfig-paths` の設定オプションで value import を強制解決

調査の結果、アプローチA が実用的であればそれを採用し、困難であればアプローチBを検討する。

---

## 4. 実行手順

### Phase構成

Phase 1（調査）→ Phase 2（実装）→ Phase 3（検証）

### Phase 1: 調査

#### 目的

`vite-tsconfig-paths` が value import を解決できない根本原因を特定し、最適な修正アプローチを決定する。

#### 手順

1. `vite-tsconfig-paths` の GitHub Issue / changelog を確認し、value import の解決に関する既知の制限や PR を調査する
2. `vitest.config.ts` に value import のテストケースを追加し、現状の挙動を確認する
3. アプローチA（動的生成）の実現可能性を検証する（小さな PoC を作成）

#### 成果物

アプローチ選定メモ（内部メモで可）

#### 完了条件

採用アプローチが決定している。

### Phase 2: 実装

#### 目的

選定したアプローチで `vitest.config.ts` を改善する。

#### 手順

1. `vitest.config.ts` の `resolve.alias` 手動エントリを自動生成ロジックに置き換える
2. 既存の手動エントリ（`@repo/shared/types/skillWizard`）が自動生成でカバーされることを確認する
3. `pnpm --filter @repo/desktop test` を実行してリグレッションがないことを確認する

#### 成果物

- 改善された `apps/desktop/vitest.config.ts`

#### 完了条件

- 手動 alias エントリなしで全テストが PASS する
- `@repo/shared/types/skillWizard` の value import がテスト環境で解決できる

### Phase 3: 検証

#### 目的

新しい subpath を追加しても手動設定不要であることを確認する。

#### 手順

1. `packages/shared/src/types/test-subpath.ts` などダミーファイルを作成し、`tsconfig.json` の `paths` に追加する
2. テストファイルからダミー subpath を value import し、テストが通ることを確認する
3. ダミーファイルとテストを削除する

#### 成果物

検証結果の確認（手動確認で可）

#### 完了条件

ダミー subpath がテスト環境で自動的に解決される。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `vitest.config.ts` の `resolve.alias` に手動エントリなしで `@repo/shared/types/skillWizard` が解決できる
- [ ] 新しい subpath を `tsconfig.json` の `paths` に追加するだけでテスト環境で解決される

### 品質要件

- [ ] `pnpm --filter @repo/desktop test` が全件 PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が通る
- [ ] 既存テスト（72件以上）がリグレッションしない

### ドキュメント要件

- [ ] `vitest.config.ts` に採用アプローチの理由をコメントで記載する

---

## 6. 検証方法

### テストケース

| TC    | 入力                                                   | 期待結果                      |
| ----- | ------------------------------------------------------ | ----------------------------- |
| TC-01 | 既存テスト全件実行                                     | 全 PASS（リグレッションなし） |
| TC-02 | ダミー subpath を追加してテスト実行                    | 手動 alias 追加なしで PASS    |
| TC-03 | `vitest.config.ts` の手動 alias エントリを削除して実行 | PASS（自動解決される）        |

### 検証手順

```bash
pnpm --filter @repo/desktop test --run
pnpm --filter @repo/desktop typecheck
```

---

## 7. リスクと対策

| リスク                                                              | 影響度 | 発生確率 | 対策                                                                                         |
| ------------------------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------------------------- |
| `tsconfig.json` の動的読み込みが Vite の SSR や特定ビルドと競合する | 中     | 低       | vitest 専用の設定ファイルで分離し、本番ビルドには影響させない                                |
| `vite-tsconfig-paths` のアップデートで動作が変わる                  | 低     | 低       | `package.json` でバージョンを固定し、アップデート時に動作確認を実施する                      |
| PoC が想定通り動かず調査に時間がかかる                              | 中     | 中       | 1日以上詰まった場合は手動 alias エントリを維持するアプローチに切り替え、別タスクで再挑戦する |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/vitest.config.ts` - 現状の設定ファイル
- `apps/desktop/tsconfig.json` - パスエイリアス定義
- `docs/30-workflows/ut-skill-wizard-semantic-default-extensibility-001/outputs/phase-12/unassigned-task-detection.md` - 未タスク検出元

### 参考資料

- [vite-tsconfig-paths GitHub](https://github.com/aleclarson/vite-tsconfig-paths) - value import 対応状況の確認先

---

## 9. 備考

### 苦戦箇所【記入必須】

| 項目     | 内容                                                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 症状     | `@repo/shared/types/skillWizard` からの value import（`SEMANTIC_LABEL_MAP`）がテスト環境で解決できなかった                   |
| 原因     | `vite-tsconfig-paths` が type import は解決できるが、value import は解決できないケースがある（subpath exports の解釈の違い） |
| 対応     | `vitest.config.ts` の `resolve.alias` に `"@repo/shared/types/skillWizard"` を手動で追加して暫定対処                         |
| 再発防止 | 本タスクで自動解決の仕組みを整備し、subpath 追加のたびの手動対応を不要にする                                                 |

### レビュー指摘の原文（該当する場合）

```
Phase 12 unassigned-task-detection.md No.2:
「vitest.config.ts の resolve.alias 手動追加が将来の subpath 追加時も必要。
vite-tsconfig-paths の value import 対応を調査。」
```

### 補足事項

このタスクは `UT-SKILL-WIZARD-INFER-SMART-DEFAULTS-IMPROVE-001` や `UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001` と独立して実施できる。ただし、それらのタスクで新しい subpath が追加される前に完了させると、手動作業を防ぐ効果が高い。
