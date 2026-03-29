# UT-SDK-07-VITE-ALIAS-CONFIG-001: vite エイリアス設定の調査

## メタ情報

```yaml
issue_number: 1715
task_id: UT-SDK-07-VITE-ALIAS-CONFIG-001
task_name: vite エイリアス設定の調査（@repo/shared 値インポートの alias 解決）
category: DX改善
target_feature: vitest / vite alias 設定
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001 Phase 12 unassigned-task-detection（2026-03-29）
created_date: 2026-03-29
dependencies: [TASK-UT-SDK-07]
```

| 項目         | 内容                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------- |
| タスクID     | UT-SDK-07-VITE-ALIAS-CONFIG-001                                                           |
| タスク名     | vite エイリアス設定の調査（`@repo/shared` 値インポートの alias 解決）                     |
| 分類         | DX改善                                                                                    |
| 対象機能     | `vitest.config.ts` / `vite.config.ts` の alias 設定                                       |
| 優先度       | 低                                                                                        |
| 見積もり規模 | 小規模                                                                                    |
| ステータス   | 未実施                                                                                    |
| 発見元       | TASK-UT-SDK-07 Phase 12 unassigned-task-detection（相対パスワークアラウンドの存在を確認） |
| 発見日       | 2026-03-29                                                                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UT-SDK-07（shared IPC channel contract）のテスト実装時、`apps/desktop/src/preload/channels.test.ts` では `@repo/shared` から値（定数）をインポートする際に alias が解決できなかったため、相対パスによるワークアラウンドを採用した。

具体的には以下のような import が必要な箇所で、パッケージ名指定ではなくファイルパスで直接参照する形になっている。

```ts
// ワークアラウンド（現状）
import { EXECUTION_CHANNELS } from "../../packages/shared/src/ipc/channels";

// 理想形
import { EXECUTION_CHANNELS } from "@repo/shared";
```

### 1.2 問題点・課題

- テストコードに相対パスが混在し、ディレクトリ移動時にパスが壊れるリスクがある
- `@repo/shared` alias が vitest 環境で有効かどうか未確認の状態が続いている
- 他のテストファイルでも同様のワークアラウンドが散在する可能性がある

### 1.3 放置した場合の影響

- テストファイルのメンテナンスコストが高止まりする
- 将来の monorepo 構成変更（ディレクトリ移動等）時に一括パス修正が必要になる
- DX（開発体験）の低下につながる

---

## 2. 何を達成するか（What）

### 2.1 目的

`apps/desktop` の vitest / vite 設定で `@repo/shared` alias が有効かを調査し、有効にできる場合は相対パスワークアラウンドを alias ベースに置き換える。

### 2.2 最終ゴール

- `apps/desktop/vitest.config.ts`（または `vite.config.ts`）における alias 設定の現状を把握する
- `@repo/shared` を値インポートに使用できるか確認する
- 可能であれば `channels.test.ts` 等のワークアラウンドを alias 形式に置き換える
- 不可能な場合は理由をドキュメント化し、ワークアラウンドに TODO コメントを付与する

### 2.3 スコープ

#### 含むもの

- `apps/desktop/vitest.config.ts` の alias 設定調査
- `packages/shared/src/ipc/channels.ts` の export 構成確認
- alias が使用可能な場合の `channels.test.ts` 修正
- 調査結果のコメントまたは簡易ドキュメント記録

#### 含まないもの

- alias 設定の大規模リファクタリング
- `apps/desktop` 以外のパッケージへの適用
- `@repo/shared` の package.json exports 変更

---

## 3. 実行手順

1. `apps/desktop/vitest.config.ts` を確認し、既存の alias 設定を把握する
2. `packages/shared/package.json` の `exports` フィールドを確認する
3. 試験的に `@repo/shared/ipc/channels` または `@repo/shared` からの値インポートを test ファイルで試す
4. alias が機能する場合:
   - `apps/desktop/src/preload/channels.test.ts` の相対パス import を alias に変更する
   - 同様のワークアラウンドが他のテストファイルにないか `grep` で確認する
5. alias が機能しない場合:
   - `channels.test.ts` の import に `// TODO: @repo/shared alias が解決されたら置き換える` コメントを付与する
   - 調査結果を本タスク仕様書に追記する

---

## 4. 完了条件チェックリスト

- [ ] `apps/desktop/vitest.config.ts` の alias 設定を確認し、現状を把握した
- [ ] `@repo/shared` 値インポートが解決できるか動作確認した
- [ ] alias が使用可能な場合、`channels.test.ts` の相対パスを alias に置き換えた
- [ ] alias が使用不可の場合、ワークアラウンド箇所に TODO コメントを付与した
- [ ] 調査結果（成否・理由）がコードまたはドキュメントに記録されている

---

## 5. 参照情報

- `apps/desktop/src/preload/channels.test.ts`（相対パスワークアラウンドが存在するファイル）
- `apps/desktop/vitest.config.ts`（alias 設定の確認対象）
- `packages/shared/src/ipc/channels.ts`（インポート対象のモジュール）
- `packages/shared/package.json`（exports 設定の確認対象）
- `docs/30-workflows/step-ut-sdk-07-shared-ipc-channel-contract/outputs/phase-12/unassigned-task-detection.md`（発見元）
