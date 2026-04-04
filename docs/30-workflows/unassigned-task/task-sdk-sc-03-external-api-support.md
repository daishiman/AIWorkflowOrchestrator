# UT-SDK-SC-03-001: External API Support 残課題（Phase 11 screenshot証跡）

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | UT-SDK-SC-03-001                                 |
| タスク名     | External API Support Phase 11 screenshot証跡取得 |
| 分類         | 証跡整備（evidence-gap）                         |
| 対象機能     | skill-creator / external-api-support             |
| 優先度       | 中                                               |
| 見積もり規模 | 中規模                                           |
| ステータス   | 未実施                                           |
| 発見元       | TASK-SDK-SC-03 Phase 12                          |
| 発見日       | 2026-04-03                                       |
| Issue番号    | #1853                                            |
| 依存タスク   | TASK-SDK-SC-01, TASK-SDK-SC-03                   |

```yaml
issue_number: 1853
task_id: UT-SDK-SC-03-001
task_name: External API Support screenshot evidence
category: evidence-gap
target_feature: skill-creator / external-api-support
priority: medium
scale: medium
status: open
source_phase: TASK-SDK-SC-03 Phase 12
created_date: 2026-04-03
dependencies: [TASK-SDK-SC-01, TASK-SDK-SC-03]
spec_path: docs/30-workflows/unassigned-task/task-sdk-sc-03-external-api-support.md
```

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-SDK-SC-03`（External API Support）は型定義・HTTPアダプター・フォーム・main/preload/renderer wiring までの実装が完了した。しかし Phase 11（手動テスト）において UI スクリーンショット証跡が取得できないまま Phase 12 へ進行した。UI タスクでは実動作の目視確認と証跡（スクリーンショット）が Phase 12 close-out の必須要件であり、これが欠如した状態では Phase 11 の完了を正式に宣言できない。

### 1.2 問題点・課題

- `docs/30-workflows/step-02-par-task-03-external-api-support/outputs/phase-11/` にスクリーンショットが存在しない
- `docs/30-workflows/step-02-par-task-03-external-api-support/outputs/phase-12/implementation-guide.md` から画像参照がまだ貼られていない
- 上記の状態のまま Phase 12 を完了扱いにすると false-green になる

### 1.3 放置した場合の影響

- Phase 11 が `in_progress` のまま残り、TASK-SDK-SC-03 の formal な完了宣言ができない
- 将来のレビュアーが UI 動作を証跡から確認できない
- Phase 12 close-out バリデーション（`validate-phase12-implementation-guide.js`）が FAIL する可能性がある

---

## 2. 何を達成するか（What）

### 2.1 目的

Electron アプリ上で `ExternalApiConfigForm` を実際に操作し、Phase 11 の UI スクリーンショット証跡を取得・整備する。

### 2.2 最終ゴール

- Phase 11 の screenshots が `outputs/phase-11/` に存在する
- `implementation-guide.md` から画像参照が貼られている
- `artifacts.json` の Phase 11 ステータスが `completed` になる

### 2.3 スコープ

#### 含むもの

- Phase 11 UI スクリーンショット取得（`ExternalApiConfigForm` 表示・入力・エラー各状態）
- `manual-test-result.md` の実測値更新
- `implementation-guide.md` への画像参照追記
- `artifacts.json` Phase 11 ステータス更新

#### 含まないもの

- commit / PR / push
- Keytar 永続化の導入（将来課題）
- 新規コード実装

### 2.4 成果物

- `outputs/phase-11/screenshots/` 配下のスクリーンショット PNG（主要状態ごと）
- 更新済み `outputs/phase-11/manual-test-result.md`
- 更新済み `outputs/phase-12/implementation-guide.md`（画像参照追記）
- 更新済み `artifacts.json`（Phase 11: completed）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- ローカル Electron アプリが起動できること
- `pnpm install` が完了していること（worktree作成後は必ず確認）
- macOS の「画面収録」権限がターミナル/Electron に付与されていること

### 3.2 依存タスク

- TASK-SDK-SC-03 Phase 1〜10 が完了済み（実装済み）
- TASK-SDK-SC-01 が完了済み

### 3.3 必要な知識

- Electron アプリの起動方法（`pnpm --filter @repo/desktop dev`）
- `ExternalApiConfigForm` の仕様と操作方法
- IPC フロー：`configureExternalApi` → preload → main → `SkillCreatorIpcBridge`

### 3.4 推奨アプローチ

Electron アプリを実際に起動し、`ExternalApiConfigForm` が表示される状態（`external-api-config-required` IPC イベントを受信した状態）を再現して各状態のスクリーンショットを取得する。

---

## 3.5 苦戦箇所と解決策

Phase 12 実装中に発生した苦戦箇所を記録する（次回実装者への引き継ぎ）。

| 苦戦箇所                                                            | 原因                                                                                                                                       | 解決策                                                                                                                                                                                                                         |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`SkillCreatorIpcBridge` と旧 `creatorHandlers.ts` の命名ズレ**    | 実体ファイルが `creatorHandlers.ts` から `SkillCreatorIpcBridge.ts` へ変更されていたが、仕様書・コメント内の参照が旧名称のまま残っていた   | `grep -r "creatorHandlers"` で全参照箇所を洗い出し、現行ファイル名 `SkillCreatorIpcBridge` へ一括置換する                                                                                                                      |
| **`ExternalApiConfig` と `ExternalApiConnectionConfig` の命名衝突** | 既存型 `ExternalApiConnectionConfig` と新規型 `ExternalApiConfig` が同一 namespace に混在し、import 解決時にどちらを参照すべきか曖昧だった | `ExternalApiConfig` を `SkillExternalApiConfig` へリネームするか、`packages/shared/src/types/skillCreatorExternalApi.ts` で re-export alias を明確化する。型名にプレフィックス（`Skill*`）を付けることで既存型との差別化を図る |
| **IPC `IpcResult` 戻り値契約の整合確認**                            | `SkillCreatorIpcBridge` のハンドラーが返す型（`IpcResult<T>`）と preload 側の `safeInvoke` が期待する型が一致しているかの確認に手間取った  | `packages/shared/src/ipc/channels.ts` と `apps/desktop/src/preload/` の型定義を並べて対照し、`IpcResult.success / IpcResult.error` の形状が preload 型パラメータと一致することを型チェック（`pnpm typecheck`）で確認する       |
| **CLI 環境での UI 証跡取得の不可**                                  | Electron のレンダラーは実際に起動しないと描画されず、CLI だけでは視覚的確認が不可能だった                                                  | `pnpm --filter @repo/desktop dev` でデスクトップアプリを起動し、実環境で手動操作して証跡を取得する                                                                                                                             |

---

## 4. 実行手順

### Phase構成

本タスクは単一作業（Phase 11 証跡取得・整備）のため、順次実行する。

### 手順

1. Electron アプリをローカルで起動する
   ```bash
   pnpm install  # worktree作成後は必ず実行
   pnpm --filter @repo/desktop dev
   ```
2. `external-api-config-required` イベントをトリガーする状態を再現する
   - スキル作成フローで外部 API 設定が必要なフェーズへ進む
   - または DevTools コンソールから IPC イベントを手動送信する
3. 以下の各状態のスクリーンショットを取得する
   - 初期表示（`ExternalApiConfigForm` が開いた状態）
   - フォーム入力中（API URL・APIキー入力済み）
   - バリデーションエラー状態（必須項目が空など）
   - 送信成功（`api-configured` を受信後の状態）
4. 取得した PNG を以下に保存する
   ```
   docs/30-workflows/step-02-par-task-03-external-api-support/outputs/phase-11/screenshots/
   ```
5. `manual-test-result.md` に各テストケースの pass/fail と証跡ファイル名を記録する
6. `implementation-guide.md` の該当箇所に画像参照を追記する
   ```markdown
   ![ExternalApiConfigForm 初期状態](../phase-11/screenshots/TC-01-initial.png)
   ```
7. `artifacts.json` の Phase 11 ステータスを `completed` に更新する

---

## 5. 完了条件チェックリスト

### 機能要件

- [x] `external-api-config-required` 受信時に `ExternalApiConfigForm` が表示される
- [x] `configureExternalApi` が preload 経由で main へ到達する
- [x] `SkillCreatorIpcBridge` で `configure-api` が受理され、`api-configured` を返せる
- [x] 必要に応じて `api-test-result` を renderer へ返せる
- [x] `SkillLifecyclePanel` で送信・キャンセル・エラー表示まで完了する
- [ ] Phase 11 スクリーンショット証跡を `outputs/phase-11/` に保存し、Phase 12 文書から参照できる

### 品質要件

- [ ] `outputs/phase-11/screenshots/` に主要状態の PNG が存在する（最低 3 件：初期表示・エラー状態・送信成功）
- [ ] `manual-test-result.md` に各 TC の実測結果と証跡ファイル名が記録されている
- [ ] `artifacts.json` の Phase 11 が `completed` に更新されている

### ドキュメント要件

- [ ] `implementation-guide.md` から Phase 11 スクリーンショットへの参照が貼られている
- [ ] Phase 11 close-out が正式に宣言されている

---

## 6. 検証方法

### テストケース

| TC ID | コンポーネント        | 状態       | ファイル名                 |
| ----- | --------------------- | ---------- | -------------------------- |
| TC-01 | ExternalApiConfigForm | 初期表示   | TC-01-initial.png          |
| TC-02 | ExternalApiConfigForm | 入力済み   | TC-02-filled.png           |
| TC-03 | ExternalApiConfigForm | エラー状態 | TC-03-validation-error.png |
| TC-04 | SkillLifecyclePanel   | 送信成功後 | TC-04-configured.png       |

### 検証手順

```bash
# artifacts.json 確認
cat docs/30-workflows/step-02-par-task-03-external-api-support/artifacts.json \
  | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['phases']['11'])"
# → "completed" であること

# screenshots ディレクトリ確認
ls docs/30-workflows/step-02-par-task-03-external-api-support/outputs/phase-11/screenshots/
# → TC-01〜TC-04 の PNG が存在すること
```

---

## 7. リスクと対策

| リスク                                                                              | 影響度 | 発生確率 | 対策                                                                                            |
| ----------------------------------------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------------------- |
| Electron アプリのビルドが壊れていて UI が起動できない                               | 高     | 低       | `pnpm --filter @repo/desktop build` を先に実行してエラーを確認する                              |
| macOS の「画面収録」権限エラーでスクリーンショットが取得できない                    | 中     | 低       | システム環境設定 > プライバシーとセキュリティ > 画面収録 でターミナル/Electron に権限を付与する |
| `external-api-config-required` 状態の再現が困難                                     | 中     | 中       | `SkillCreatorIpcBridge` のテストハーネスを使って IPC イベントを直接送信する                     |
| esbuild host/binary version drift による Vitest 起動失敗                            | 中     | 低       | worktree作成後は必ず `pnpm install` を実行してバイナリの整合を確保する                          |
| `ExternalApiConfig` と `ExternalApiConnectionConfig` の型衝突による型チェックエラー | 高     | 中       | 型名に `Skill*` プレフィックスを付けて既存型と差別化する（3.5 苦戦箇所参照）                    |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/step-02-par-task-03-external-api-support/outputs/phase-11/`（Phase 11 成果物ディレクトリ）
- `docs/30-workflows/step-02-par-task-03-external-api-support/outputs/phase-12/implementation-guide.md`
- `docs/30-workflows/step-02-par-task-03-external-api-support/artifacts.json`

### 関連実装ファイル

- `packages/shared/src/types/skillCreatorExternalApi.ts`
- `packages/shared/src/ipc/channels.ts`（外部APIチャネル定数）
- `apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts`
- `apps/desktop/src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts`
- `apps/desktop/src/renderer/components/skill/ExternalApiConfigForm.tsx`
- `apps/desktop/src/main/ipc/SkillCreatorIpcBridge.ts`（旧 `creatorHandlers.ts`）

### 参考資料

- `docs/30-workflows/unassigned-task/UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001.md`（類似タスクの証跡取得例）
- `.claude/skills/task-specification-creator/references/phase-11-screenshot-guide.md`

---

## 9. 備考

### 現在の実装状況（2026-04-03）

**実装済み:**

- `packages/shared/src/types/skillCreatorExternalApi.ts`
- `packages/shared/src/ipc/channels.ts`（外部APIチャネル定数）
- `apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts`
- `apps/desktop/src/main/services/runtime/adapters/__tests__/HttpExternalApiAdapter.test.ts`
- `apps/desktop/src/renderer/components/skill/ExternalApiConfigForm.tsx`

**未完了:**

1. Phase 11 UI証跡: `docs/30-workflows/step-02-par-task-03-external-api-support/outputs/phase-11/` にスクリーンショットがない
2. Phase 12 参照: `implementation-guide.md` から画像参照がまだ貼られていない

### 補足事項

本タスクは UI の目視確認系（中優先度）。representative screenshots が揃うまで TASK-SDK-SC-03 の Phase 11 close-out は達成不可。Phase 12 ドキュメントは先行して完了しているが、Phase 11 が `in_progress` のままでは formal な完了宣言ができない。

3.5 節の苦戦箇所（`SkillCreatorIpcBridge` 命名ズレ・`ExternalApiConfig` 命名衝突・`IpcResult` 戻り値契約）は次回の類似タスク実装者が同じ落とし穴にはまらないよう記録している。
