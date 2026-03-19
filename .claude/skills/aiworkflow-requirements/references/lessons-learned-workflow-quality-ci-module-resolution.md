# Lessons Learned（教訓集） / workflow / quality lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: workflow / quality lessons

## TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001: @repo/shared 4設定ファイル整合CIガード

### タスク概要

| 項目        | 内容                                                                                                                             |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------- |
| タスクID    | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001                                                                                          |
| 目的        | @repo/shared パッケージの4設定ファイル（exports, paths, alias, typesVersions）間の整合性をCIで自動検証するガードスクリプトの実装 |
| 完了日      | 2026-02-22                                                                                                                       |
| ステータス  | **完了**                                                                                                                         |
| 関連Pitfall | P3, P4, P43                                                                                                                      |
| テスト      | `scripts/__tests__/check-shared-module-sync.test.ts` 43件PASS                                                                    |

### 実装内容

| 変更内容           | ファイル                                             | 説明                                                                                                               |
| ------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| CIガードスクリプト | `scripts/check-shared-module-sync.ts`                | 4パーサー + 5チェッカー + 3ヘルパー + 2レポーター = 14関数                                                         |
| テストスイート     | `scripts/__tests__/check-shared-module-sync.test.ts` | 43テスト（8セクション: パーサー/チェッカー/レポーター/統合/ロバスト性/複合不整合/エッジケース/エラーハンドリング） |
| CI設定             | `.github/workflows/ci.yml`                           | `check-module-sync` ジョブ追加（buildの前提条件の1つ）                                                             |

### 苦戦箇所と解決策

#### 1. Phase 10 MINORの残置（レポート仕様ドリフト）

| 項目       | 内容                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | コア検証は完了していたが、レポート仕様（修正ガイダンス/件数サマリー/`printSummary`シグネチャ）がPhase 2設計と一致しなかった               |
| **原因**   | 検出ロジックとCI統合を優先し、出力フォーマット整備を後段に回した                                                                          |
| **解決策** | MINOR 3件を `TASK-IMP-MODULE-SYNC-REPORT-ENHANCEMENT-001` に統合し、`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に起票してP3 3ステップを完了した |
| **教訓**   | Phase 10のMINORは「次回対応メモ」ではなく、同日中に未タスク化して追跡可能な状態にする                                                     |

#### 2. Phase 12証跡と仕様書本体状態の同期漏れリスク

| 項目       | 内容                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| **課題**   | 成果物が存在しても `phase-12-documentation.md` や関連台帳の状態同期が漏れるリスクがあった               |
| **原因**   | 成果物作成と仕様更新が別工程で進み、最終同期チェックが弱かった                                          |
| **解決策** | `verify-all-specs` / `validate-phase-output` を同時実行し、成果物・仕様書本体・台帳の整合を機械検証した |
| **教訓**   | Phase 12は「成果物がある」だけでは不十分で、状態同期までを完了条件に含める必要がある                    |

#### 3. 未タスク監査結果のベースライン混同

| 項目       | 内容                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| **課題**   | `audit-unassigned-tasks.js` で全体違反（既存68件）が出るため、今回対象の未タスク品質判定と混同しやすかった        |
| **原因**   | 全件監査結果をそのまま「今回不備」と解釈しやすい出力形式だった                                                    |
| **解決策** | 全体監査と対象ファイル個別確認を分離し、`task-imp-module-sync-report-enhancement.md` のテンプレ準拠を個別確認した |
| **教訓**   | 監査は「全体健全性」と「今回差分」を分けて報告しないと、是正優先順位が崩れる                                      |

#### 4. vitest.config.ts の正規表現パース

| 項目       | 内容                                                                                                                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | vitest.config.ts はTypeScriptファイルであり、JSON.parse()できない。alias定義を正規表現で抽出する必要がある                                                                                             |
| **原因**   | `resolve(__dirname, "../../packages/shared/src/utils/index.ts")` のような関数呼び出しが値に含まれ、構造化パースが困難                                                                                  |
| **解決策** | `/"(@repo\/shared[^"]*)":\s*resolve\(\s*__dirname,\s*"([^"]+)"\s*\)/g` の正規表現で「キー: resolve(\_\_dirname, "パス")」パターンのみ抽出。タブ/スペース混在、マルチライン、コメント挿入をテストで検証 |
| **教訓**   | TypeScript設定ファイルのパースでは、完全なAST解析ではなく正規表現による部分マッチが現実的。ただしダブルクォート前提・コメント非対応など制約を明文化し、テスト（#29-32）で境界条件を網羅する            |

**コード例**:

```typescript
const ALIAS_PATTERN =
  /"(@repo\/shared[^"]*)":\s*resolve\(\s*__dirname,\s*"([^"]+)"\s*\)/g;

export function parseAliases(filePath: string): Map<string, string> {
  const content = readFileSync(filePath, "utf-8");
  const aliases = new Map<string, string>();
  let match: RegExpExecArray | null;
  while ((match = ALIAS_PATTERN.exec(content)) !== null) {
    aliases.set(match[1], match[2]);
  }
  // 0件パース警告（alias キーワード存在時のみ）
  if (aliases.size === 0 && content.includes("alias")) {
    console.warn(
      `Warning: ${filePath} contains alias but no @repo/shared aliases were parsed`,
    );
  }
  return aliases;
}
```

#### 5. キー形式の相互変換設計

| 項目       | 内容                                                                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | 4設定ファイル間でキー形式が異なる: exports(`./utils`), paths(`@repo/shared/utils`), aliases(`@repo/shared/utils`), typesVersions(`utils`)                                                                         |
| **原因**   | npm (exports), TypeScript (paths), Vitest (alias), npm typesVersions がそれぞれ独自のキー命名規則を採用                                                                                                           |
| **解決策** | 3つのヘルパー関数を作成: `toModuleKey`(exports→paths/alias形式), `toSubpath`(paths/alias→exports形式), `toTypesVersionsKey`(exports→typesVersions形式)。変換ロジックはプレフィックス付加/除去のみでシンプルに保つ |
| **教訓**   | 異なるシステム間のキー変換は、双方向変換関数を対で定義し、チェッカー関数はこれらを通して比較する設計が拡張性を維持しやすい                                                                                        |

**コード例**:

```typescript
// exports "./utils" → paths/alias "@repo/shared/utils"
function toModuleKey(subpath: string): string {
  return subpath === "." ? "@repo/shared" : `@repo/shared/${subpath.slice(2)}`;
}

// paths "@repo/shared/utils" → exports "./utils"
function toSubpath(moduleKey: string): string {
  return moduleKey === "@repo/shared"
    ? "."
    : `./${moduleKey.replace("@repo/shared/", "")}`;
}

// exports "./utils" → typesVersions "utils"（"." はスキップ対象）
function toTypesVersionsKey(subpath: string): string {
  return subpath.slice(2); // "./utils" → "utils"
}
```

#### 6. typesVersions の "." エントリスキップロジック

| 項目       | 内容                                                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | exports のメインエントリ（"."）は typesVersions に登録不要だが、サブパス（"./utils", "./errors" 等）は必須。この判定ロジックの正確な実装                                              |
| **原因**   | package.json の typesVersions はサブパス用の型解決にのみ使用され、メインエントリの型は `types` フィールドで指定するため                                                               |
| **解決策** | `checkExportsVsTypesVersions` 内で `if (subpath === ".") continue;` でメインエントリをスキップ。テスト（#22-23）で「.」スキップ動作を明示的に検証                                     |
| **教訓**   | npm パッケージ設定には「暗黙のルール」（メインエントリの型は types フィールドが担当）が存在する。チェッカー設計時にこれらの例外規則を先にリストアップし、テストで固定化することが重要 |

#### 7. process.exitCode vs process.exit() のテスタビリティ

| 項目       | 内容                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `process.exit(1)` を使うとテストプロセス自体が終了してしまい、テスト不可能                                                                                                |
| **原因**   | `process.exit()` はプロセスを即座に終了させるため、Vitest のテストランナーごと終了する                                                                                    |
| **解決策** | `process.exitCode = 1` を使用し、プロセスは正常終了させる。テストでは `expect(process.exitCode).toBe(1)` で検証。`afterEach` で `process.exitCode = undefined` にリセット |
| **教訓**   | CIスクリプトの終了コードテストでは、`process.exit()` ではなく `process.exitCode` プロパティを使用する。これによりmain関数の呼び出し後も制御がテストに戻る                 |

**コード例**:

```typescript
// ❌ テスト不可能
if (hasFailures) process.exit(1);

// ✅ テスト可能
if (hasFailures) process.exitCode = 1;

// テストでの検証
it("不整合がある場合 process.exitCode は 1", () => {
  main();
  expect(process.exitCode).toBe(1);
});
afterEach(() => {
  process.exitCode = undefined;
});
```

### 同種課題の簡潔解決手順（5ステップ・CIガード版）

1. Phase 10レビュー直後にMINORを分類し、同一責務なら1つの未タスクへ統合する。
2. 未タスクは `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に作成し、`task-workflow.md` と関連仕様書への参照を同時更新する。
3. Phase 12では成果物作成後に `verify-all-specs` と `validate-phase-output` を連続実行して、仕様書本体状態まで同期確認する。
4. 未タスク監査は「全体ベースライン（既存違反）」と「今回対象ファイル」の2段で記録する。
5. `lessons-learned.md` と完了タスク仕様書に苦戦箇所を即日反映し、再発防止手順を固定化する。

### 成果物

| 成果物             | パス                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| CIガードスクリプト | `scripts/check-shared-module-sync.ts`                                                                |
| テスト（43件）     | `scripts/__tests__/check-shared-module-sync.test.ts`                                                 |
| CI設定             | `.github/workflows/ci.yml`                                                                           |
| 実装ガイド         | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/outputs/phase-12/implementation-guide.md` |
| 未タスク指示書     | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-module-sync-report-enhancement.md`                       |

### 関連ドキュメント更新

| ドキュメント             | 更新内容                                                                         |
| ------------------------ | -------------------------------------------------------------------------------- |
| quality-requirements.md  | 完了タスクセクション追加、派生未タスク参照リンク追加 (v1.9.0)                    |
| architecture-monorepo.md | 完了タスクセクション追加、ステータス列追加 (v1.3.0)                              |
| technology-devops.md     | CIジョブテーブルに check-module-sync 追加                                        |
| task-workflow.md         | 残課題テーブル完了化、TASK-IMP-MODULE-SYNC-REPORT-ENHANCEMENT-001 登録 (v1.52.0) |
| LOGS.md (x2)             | 完了ログ追加                                                                     |
| SKILL.md (x2)            | 変更履歴追加 (v8.59.0 / v9.81.0)                                                 |
| topic-map.md             | 再生成 (148ファイル, 1233キーワード)                                             |

---

## TASK-FIX-10-1: Vitest未処理Promise拒否検知の復元

### タスク概要

| 項目       | 内容                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-FIX-10-1-VITEST-ERROR-HANDLING                                                                  |
| 目的       | `dangerouslyIgnoreUnhandledErrors` を廃止し、未処理Promise拒否をテスト失敗として検知できる状態に戻す |
| 完了日     | 2026-02-19                                                                                           |
| ステータス | **完了**                                                                                             |

### 苦戦箇所と解決策

#### 1. Step 2要否判定の誤り

| 項目       | 内容                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------- |
| **課題**   | 「設定削除のみ」と見なしてシステム仕様更新不要と誤判定しやすかった                              |
| **原因**   | インターフェース変更の有無だけで判断し、テスト戦略変更を仕様変更として扱っていなかった          |
| **解決策** | 未処理Promise拒否の検知ルール変更を「品質仕様の変更」と定義し、`quality-requirements.md` を更新 |
| **教訓**   | プロダクトコード変更がなくても、テスト戦略変更は Step 2 更新対象になる                          |

#### 2. 未タスク検出範囲の不足

| 項目       | 内容                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| **課題**   | 変更ファイル中心の確認では、Phase成果物に書かれた将来課題を見落としやすい                 |
| **原因**   | Task 4で `outputs/phase-*` まで横断確認する運用が徹底されていなかった                     |
| **解決策** | Phase成果物まで含めて再監査し、`task-imp-vitest-alias-sync-automation-001` を未タスク登録 |
| **教訓**   | 未タスク検出は「コード差分 + 成果物記述」の両輪で実施する                                 |

#### 3. alias運用の継続性不足

| 項目       | 内容                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| **課題**   | `@repo/shared` alias は手動追従で、export更新時に再発リスクが残る                         |
| **原因**   | alias整合の機械検証がなく、発覚がテスト実行時に後ろ倒しになる                             |
| **解決策** | 未タスク `task-imp-vitest-alias-sync-automation-001` を起票し、CIで差分検知する方針を定義 |
| **教訓**   | 設定修正完了時点で「再発防止の自動検証」まで分離タスク化して残す                          |

### 同種課題の簡潔解決手順（5ステップ）

1. `dangerouslyIgnoreUnhandledErrors` を未設定に戻し、対象テストを最小実行して失敗原因を観測する。
2. 失敗が未処理Promise拒否であることを確認し、設定で隠蔽せずテスト/実装側を修正する。
3. `@repo/shared` の解決エラーが出る場合は、具体サブパスを先にしたalias順序で補正する。
4. Phase 12では `task-workflow.md` と `quality-requirements.md` を同時更新し、苦戦箇所を記録する。
5. 将来再発要因は未タスク化し、`verify-unassigned-links.js` で参照整合を確認する。

### 関連仕様書

| 仕様書                     | 反映内容                                     |
| -------------------------- | -------------------------------------------- |
| task-workflow.md           | 完了タスク・苦戦箇所・未タスク登録           |
| quality-requirements.md    | 未処理Promise拒否検知ルール、alias管理ルール |
| lessons-learned.md（本書） | 同種課題向けの再利用手順                     |

---

## TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001: `@repo/shared` モジュール解決エラー修正

### タスク概要

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| タスクID   | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001                       |
| 目的       | `@repo/shared` サブパス解決を TypeScript / Vitest で一貫させる |
| 完了日     | 2026-02-20                                                     |
| ステータス | **完了**                                                       |

### 苦戦箇所と解決策

#### 1. exports/paths/alias 三層整合の同期漏れ

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| **課題**   | `package.json exports` だけ更新しても `tsc`/`vitest` の解決が一致しない |
| **原因**   | 正本と実行系設定が分離しており、手動同期漏れが起きやすい                |
| **解決策** | `exports`/`paths`/`alias` を同一変更で更新し、3テストで整合を固定化     |
| **教訓**   | サブパス追加は「3層同時更新 + テスト更新」を1セットで扱う               |

**三層設定の対応例**（`@repo/shared/types/rag` を追加する場合）:

```jsonc
// 1. package.json exports（正本）
"./types/rag": {
  "types": "./dist/src/types/rag/index.d.ts",
  "import": "./dist/src/types/rag/index.js"
}

// 2. tsconfig.json paths（tsc 解決用）
"@repo/shared/types/rag": ["../../packages/shared/src/types/rag/index.ts"]

// 3. vitest.config.ts alias（テスト実行用）
"@repo/shared/types/rag": resolve(__dirname, "../../packages/shared/src/types/rag/index.ts")
```

**注意**: `exports` は `dist/` 配下を指すが、`paths` と `alias` は **ソースファイル直接参照**（`src/`）を指す。この「参照先の二重性」が同期漏れの原因となる。

#### 2. source直接参照時の補助型宣言取り込み漏れ

| 項目       | 内容                                                                                   |
| ---------- | -------------------------------------------------------------------------------------- |
| **課題**   | `apps/desktop` から shared ソースを直接参照すると、一部型宣言が欠落する                |
| **原因**   | shared 側補助宣言ファイルが `tsconfig` の `include` 対象外だった                       |
| **解決策** | `apps/desktop/tsconfig.json` `include` に `@anthropic-ai-claude-agent-sdk.d.ts` を追加 |
| **教訓**   | workspace source 直参照時は、コードだけでなく補助宣言ファイルの取り込み確認が必要      |

```jsonc
// ❌ Before: 補助型宣言が include 対象外
// apps/desktop/tsconfig.json
{
  "include": ["src/**/*"]
}
// → shared 内の @anthropic-ai-claude-agent-sdk.d.ts が認識されず TS2307

// ✅ After: 補助型宣言を明示的に include
{
  "include": [
    "src/**/*",
    "../../packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts"
  ]
}
```

#### 3. 未タスクリンク整合の既存崩れ

| 項目       | 内容                                                                               |
| ---------- | ---------------------------------------------------------------------------------- |
| **課題**   | 本タスクの検証中に、既存未タスク参照4件のリンク切れが発覚                          |
| **原因**   | `task-workflow.md` 登録済みタスクの指示書ファイルが未作成のまま残存                |
| **解決策** | 欠落4ファイルを `unassigned-task/` に作成し、`verify-unassigned-links.js` を再実行 |
| **教訓**   | 新規未タスク登録時は、自タスク分だけでなく既存台帳全体のリンク健全性も確認する     |

```bash
# リンク切れ検証コマンド
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

# 手動で未タスク参照を一括確認する場合
grep -rn "unassigned-task/" docs/30-workflows/ .claude/skills/ | \
  sed 's/.*(\(.*\)).*/\1/' | sort -u | \
  while read f; do [ ! -f "$f" ] && echo "MISSING: $f"; done
```

#### 4. TypeScript paths 定義順序の重要性

| 項目       | 内容                                                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `@repo/shared/types` が `@repo/shared/types/llm/schemas` より先に定義されると、後者のパスが解決されない                                                                    |
| **原因**   | TypeScript は paths マッピングを上から順に評価し、最初にマッチしたパスを使用する。`@repo/shared/types` が先にマッチすると、`@repo/shared/types/llm/schemas` は評価されない |
| **解決策** | paths 定義順序を「具体的（長いパス）→ 汎用的（短いパス）」に並べる。vitest alias も同じ順序で定義する                                                                      |
| **教訓**   | TypeScript paths のマッチングは「最長一致」ではなく「先行一致」。定義順序がパス解決の正否を直接決定する                                                                    |

```jsonc
// ❌ 誤った順序: 汎用パスが先にマッチし、具体パスが無効化
{
  "paths": {
    "@repo/shared/types": ["../../packages/shared/src/types/index.ts"],
    "@repo/shared/types/llm/schemas": ["../../packages/shared/src/types/llm/schemas/index.ts"],
    "@repo/shared/types/rag": ["../../packages/shared/src/types/rag/index.ts"]
  }
}
// → "@repo/shared/types/llm/schemas" は "@repo/shared/types" にマッチして解決失敗

// ✅ 正しい順序: 具体パスを先に定義
{
  "paths": {
    "@repo/shared/types/llm/schemas": ["../../packages/shared/src/types/llm/schemas/index.ts"],
    "@repo/shared/types/rag": ["../../packages/shared/src/types/rag/index.ts"],
    "@repo/shared/types": ["../../packages/shared/src/types/index.ts"]
  }
}
```

#### 5. 4ファイル同期の必要性（package.json / tsconfig / vitest.config / typesVersions）

| 項目       | 内容                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `package.json exports` のみ更新しても、tsc と vitest が異なるパスに解決し整合しない                                  |
| **原因**   | モノレポの「ソース直接参照」方式では、正本（exports）と実行系設定（paths, alias, typesVersions）が完全に分離している |
| **解決策** | サブパス追加時は以下4ファイルを同一コミットで更新する                                                                |
| **教訓**   | 設定変更の影響範囲を事前にチェックリストで固定化し、1ファイルでも漏れたらテストが落ちる構造にする                    |

**4ファイル同期チェックリスト**:

| #   | ファイル                                     | 更新内容                                      | 用途                      |
| --- | -------------------------------------------- | --------------------------------------------- | ------------------------- |
| 1   | `packages/shared/package.json` exports       | サブパスと `dist/` 参照先を追加               | ランタイム（Node.js解決） |
| 2   | `apps/desktop/tsconfig.json` paths           | サブパスとソース直参照先を追加                | tsc 型チェック            |
| 3   | `apps/desktop/vitest.config.ts` alias        | サブパスとソース直参照先を追加（具体→汎用順） | Vitest テスト実行         |
| 4   | `packages/shared/package.json` typesVersions | `*` 条件で型解決パスを追加                    | 型解決フォールバック      |

### 同種課題の簡潔解決手順（5ステップ）

1. **エラー分析**: `pnpm typecheck 2>&1 | grep "TS2307" | sort -u` でモジュール未検出パスを特定する
2. **exports 確認**: `package.json` の `exports` エントリと実ファイルパスの 1:1 対応を確認する
3. **paths 追加**: `tsconfig.json` に paths マッピングを追加する（具体的→汎用の順序で定義）
4. **alias 同期**: `vitest.config.ts` の `resolve.alias` に同じエントリを追加する（同じく具体→汎用順）
5. **テスト実行**: `pnpm typecheck && cd apps/desktop && pnpm vitest run src/__tests__/*module-resolution*` で整合性を検証する

---

