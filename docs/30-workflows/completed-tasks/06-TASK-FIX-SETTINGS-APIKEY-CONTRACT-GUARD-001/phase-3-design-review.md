# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 3                                                |
| 機能名     | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001   |
| タスク名   | 設定画面 apiKey.list 契約防御と providers 正規化 |
| 作成日     | 2026-03-06                                       |
| 更新日     | 2026-03-07                                       |
| ステータス | 未実施                                           |

## 目的

Phase 2 の設計（3層設計・正規化関数・Main 側バリデーション・profileHandlers パターン統一）が要件（AC-01〜07）を満たし、既知の落とし穴（P42/P44/P45/P48）を回避しているかを検証する。

## 背景

PR #1036/#1038 で基本防御は実装済み。本レビューでは追加設計（GAP-01〜06 対応）が既実装部分と整合し、ipc-contract-checklist の6段チェックリストに準拠しているかを確認する。

## Agent Team 編成

| SubAgent                | 関心ごと                         | 実行モード | Phase 3 の責務                            |
| ----------------------- | -------------------------------- | ---------- | ----------------------------------------- |
| SubAgent-Renderer-Guard | Renderer defensive normalization | 並列       | Renderer 層設計の防御漏れを検証する       |
| SubAgent-Contract-IPC   | Main / Preload / Shared contract | 並列       | IPC 契約チェックリストの6段検証を実施する |
| SubAgent-Test-Fallback  | 異常系テスト / fallback UX       | 並列       | テスト設計の網羅性を検証する              |
| SubAgent-Lead-Sync      | 仕様統合 / aiworkflow 同期       | 直列統合   | レビュー結果を統合しゲート判定を出す      |

## 実行タスク

- Task 1: レビュー観点の固定
- Task 2: ゲート判定基準の確定

### Task 1: レビュー観点の固定

#### 観点 A: 防御境界レビュー

| チェック項目 | 確認内容                                                                   | 判定基準                                                            |
| ------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| A-1          | `normalizeProviders` が唯一の正規化ポイントか                              | render 関数内で直接 `providers` 配列を操作していないこと            |
| A-2          | `result.data` の nullish チェックが設計に含まれているか（GAP-01）          | optional chaining (`?.`) で `data` アクセスしていること             |
| A-3          | 要素フィルタが `ProviderStatus` の必須フィールドを検証しているか（GAP-03） | `provider` と `status` の型チェックが type predicate に含まれること |
| A-4          | `apiKey.list()` rejection のハンドリングが設計に含まれているか（GAP-04）   | try-catch でラップされ、エラー state に遷移すること                 |

#### 観点 B: IPC 契約チェックリスト（ipc-contract-checklist.md 6段準拠）

| Phase             | チェック内容                                                               | 本タスクでの確認事項                           |
| ----------------- | -------------------------------------------------------------------------- | ---------------------------------------------- |
| CC-1 型定義       | `ProviderListResult` の型と Main ハンドラの戻り値が一致するか              | `apiKeyHandlers.ts` の return 文と型定義の照合 |
| CC-2 ハンドラ     | Main ハンドラの引数バリデーションが P42 準拠か                             | 文字列引数があれば `.trim() === ""` チェック   |
| CC-3 Preload      | Preload 側の `safeInvoke` 呼び出しとチャネル名が `IPC_CHANNELS` 定数経由か | ハードコード文字列がないこと                   |
| CC-4 Renderer     | Renderer 側のレスポンス処理が P48 準拠か                                   | non-null assertion (`!`) を使っていないこと    |
| CC-5 テスト       | 異常系テストが GAP-01〜04 をカバーしているか                               | テストケース ID との対応確認                   |
| CC-6 ドキュメント | 設計判断（DD-01〜04）が記録されているか                                    | Phase 2 成果物の確認                           |

#### 観点 C: Pitfall 再発防止チェック

| Pitfall | チェック内容                                        | 判定基準                                    |
| ------- | --------------------------------------------------- | ------------------------------------------- |
| P42     | 文字列引数に `.trim() === ""` チェックがあるか      | 3段バリデーション準拠                       |
| P44     | IPC ハンドラとPreloadのインターフェースが一致するか | 引数形式の照合                              |
| P45     | 引数命名がセマンティクスと一致するか                | `skillId` vs `skillName` 的な乖離がないこと |
| P48     | non-null assertion を使わず実行時検証しているか     | `Array.isArray()` / optional chaining 使用  |

#### 観点 D: UX / 回帰耐性レビュー

| チェック項目 | 確認内容                                               | 判定基準                                    |
| ------------ | ------------------------------------------------------ | ------------------------------------------- |
| D-1          | 空配列時のフィードバックがユーザーに伝わるか（GAP-02） | メッセージテキストが ui-ux-settings.md 準拠 |
| D-2          | エラー時の表示が silent failure でないか（GAP-04）     | エラーメッセージが表示されること            |
| D-3          | 既存 RED-01〜RED-03b テストとの互換性                  | 新設計が既存テストを破壊しないこと          |
| D-4          | task-04 の linkedProviders 防御と責務重複がないか      | 別コンポーネント・別防御箇所であること      |

### Task 2: ゲート判定基準

| 判定          | 条件                                                             | 対応                                    |
| ------------- | ---------------------------------------------------------------- | --------------------------------------- |
| PASS          | 全観点（A/B/C/D）で問題なし                                      | Phase 4 へ進行                          |
| MINOR         | 観点 D のみに軽微な指摘あり（UX 文言調整等）                     | 指摘対応後 Phase 4 へ（未タスク化不要） |
| MAJOR（設計） | 観点 A/B で防御漏れ or IPC 契約不整合が発見                      | Phase 2 へ差戻し                        |
| MAJOR（要件） | 観点 C で Pitfall 再発パターンが発見され、要件レベルの修正が必要 | Phase 1 へ差戻し                        |

## 参照資料

### 実装・証跡

| 資料名             | パス                                                                                              | 用途                   |
| ------------------ | ------------------------------------------------------------------------------------------------- | ---------------------- |
| Renderer Component | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                         | 設計の実装対象確認     |
| Renderer Tests     | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx` | 既存テスト互換性確認   |
| Main IPC           | `apps/desktop/src/main/ipc/apiKeyHandlers.ts`                                                     | Main 側設計の対象確認  |
| Main IPC           | `apps/desktop/src/main/ipc/profileHandlers.ts`                                                    | パターン統一の対象確認 |

### システム仕様

| 資料名                 | パス                                                                          | 用途                                  |
| ---------------------- | ----------------------------------------------------------------------------- | ------------------------------------- |
| ipc-contract-checklist | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | 6段チェックリスト（CC-1〜CC-6）の根拠 |
| security-electron-ipc  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`  | 4層防御パターン準拠確認               |
| ui-ux-settings         | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`         | 異常系表示仕様準拠確認                |
| interfaces-auth        | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`        | `IPCResponse<T>` envelope 準拠確認    |
| known-pitfalls         | `.claude/rules/06-known-pitfalls.md`                                          | P42/P44/P45/P48 再発防止チェック根拠  |

### 前提Phase成果物

| 資料名         | パス               | 用途                                    |
| -------------- | ------------------ | --------------------------------------- |
| Phase 1 成果物 | `outputs/phase-1/` | AC-01〜07、GAP-01〜06 を参照            |
| Phase 2 成果物 | `outputs/phase-2/` | 設計方針（DD-01〜04）、責務分担表を入力 |

## 実行手順

1. Phase 2 の設計方針（DD-01〜04）、責務分担表、実行計画を観点 A〜D に沿ってレビューする。
2. ipc-contract-checklist の6段チェック（CC-1〜CC-6）を順に実施する。
3. P42/P44/P45/P48 の再発防止チェックを実施する。
4. 既実装テスト（RED-01〜RED-03b）との互換性を確認する。
5. ゲート判定（PASS/MINOR/MAJOR）を出し、差戻し先を明記する。

## 統合テスト連携

- レビュー時に、Phase 4 で作成予定のテストケース（GAP-01〜04）が設計の各防御ポイントに対応していることを確認する
- `apiKeyHandlers` の Main 側バリデーションテストが独立して実行可能であることを確認する
- 既存 RED-01〜RED-03b テストと新規テストの fixture 共有方針を検証する

## 多角的チェック観点

| 観点                  | 確認内容                                         |
| --------------------- | ------------------------------------------------ |
| 防御境界（A）         | `normalizeProviders` が唯一の正規化ポイントか    |
| IPC 契約（B）         | ipc-contract-checklist 6段チェック全項目 PASS か |
| Pitfall 再発防止（C） | P42/P44/P45/P48 の該当パターンが回避されているか |
| UX / 回帰（D）        | fallback 表示が仕様準拠かつ既存テスト互換か      |

## 成果物

| 成果物           | パス                                      | 説明                                              |
| ---------------- | ----------------------------------------- | ------------------------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | 観点 A〜D、CC-1〜CC-6、P42/P44/P45/P48 の判定結果 |
| ゲート判定       | `outputs/phase-3/gate-decision.md`        | PASS / MINOR / MAJOR の判断と差戻し先             |

## 完了条件

- [ ] レビュー結果が PASS / MINOR / MAJOR のいずれかで記録されている
- [ ] ipc-contract-checklist 6段チェック（CC-1〜CC-6）が全項目判定済み
- [ ] P42/P44/P45/P48 の再発防止チェックが全項目判定済み
- [ ] 差戻し先が MAJOR の場合に1つ以上定義されている
- [ ] open issue が次Phaseに引き継げる粒度で記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 2 成果物の確認
2. 観点 A（防御境界）レビュー実施
3. 観点 B（IPC 契約 CC-1〜CC-6）レビュー実施
4. 観点 C（Pitfall P42/P44/P45/P48）レビュー実施
5. 観点 D（UX / 回帰耐性）レビュー実施
6. ゲート判定の決定
7. 成果物の作成・配置
8. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了内容を実行記録へ残している

## 次のPhase

Phase 4: テスト作成
