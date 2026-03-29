# TASK-RT-04: api-key-management-ui

## 概要

本タスクは、既存契約（`auth-key:*` / `apiKey:*`）を再利用しつつ、Runtime lane の API キー導線を最小追加で整合させるタスクである。`SettingsView`、`ApiKeysSection`、`AuthKeySection` の既存責務を壊さず、`SkillLifecyclePanel` 側に不足していた導線を補完する。

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| タスクID   | TASK-RT-04               |
| タスク種別 | spec sync / UI alignment |
| 優先度     | RT (Runtime)             |
| ステータス | in_progress              |
| 作成日     | 2026-03-29               |
| 更新日     | 2026-03-29               |
| 上流ゲート | なし                     |
| 依存タスク | なし                     |
| 後続タスク | TASK-P0-05, TASK-P0-06   |

## 現行コード事実

| ファイル                                                                  | 現状の役割                                | TASK-RT-04 で固定する事実                                                                        |
| ------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`                  | 設定画面の構成                            | `AuthKeySection` は `authMode === "api-key"` のときのみ表示、`ApiKeysSection` は常時表示         |
| `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx` | 4 provider API キー管理 UI                | `window.electronAPI.apiKey.list/save/validate/delete` を使用する                                 |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`  | Claude Agent SDK 用 Anthropic API キー UI | `window.electronAPI.authKey.exists/set/delete` を使用し、`saved/env-fallback/not-set` を表示する |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`      | Runtime lane の操作面                     | `ApiKeySettingsPanel` を補助導線として表示し、auth key 設定を直接実行できる                      |
| `apps/desktop/src/preload/types.ts`                                       | Renderer 契約の型正本                     | `AIProvider`、`ProviderStatus`、`ApiKeyValidateResponse`、`AuthKeyExistsResponse` を定義する     |
| `apps/desktop/src/preload/authKeyApi.ts`                                  | `auth-key:*` の preload API               | Anthropic 専用 auth key 境界を提供する                                                           |
| `apps/desktop/src/preload/channels.ts`                                    | IPC チャンネル名の正本                    | `API_KEY_*` と `AUTH_KEY_*` は別契約として共存する                                               |
| `apps/desktop/src/main/ipc/authKeyHandlers.ts`                            | `auth-key:*` Main handler                 | `exists.source = saved/env-fallback/not-set` を返す                                              |

## 受入基準

| ID   | 基準                                                                                        |
| ---- | ------------------------------------------------------------------------------------------- |
| AC-1 | 仕様書が `SettingsView`（主導線）と `SkillLifecyclePanel`（補助導線）の責務境界に矛盾しない |
| AC-2 | `apiKey:*` と `auth-key:*` の契約差を混同せず、用途別に整理できている                       |
| AC-3 | Phase 1〜13 の各文書が `task-specification-creator` テンプレート必須節を満たす              |
| AC-4 | Phase 11 が UI task として `テストケース` と `画面カバレッジマトリクス` を持つ              |
| AC-5 | Phase 12 が実装差分あり task として close-out ルールを踏まえた成果物計画を持つ              |
| AC-6 | `artifacts.json` の workflow metadata と成果物計画が現行ディレクトリに整合する              |

## スコープ

**含む**:

- API キー管理 UI task spec の現行コード同期
- `apiKey:*` と `auth-key:*` の責務分離明文化
- Phase 1〜13 のテンプレート準拠化
- Phase 11/12 の UI evidence と docs-only close-out 計画の整備

**含まない**:

- 新規 provider 追加
- SecureStorage / `api-keys` 保存基盤の再設計
- コミット、PR 作成、push
- 既存実装の破棄を伴うコード変更

## 依存関係

| 種別      | 参照先                                                                                                 | 役割                                         |
| --------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| canonical | `.agents/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | API キー導線全体の正本仕様                   |
| canonical | `.agents/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                  | Settings 導線の期待値                        |
| canonical | `.agents/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | `apiKey:*` / `auth-key:*` 契約確認           |
| canonical | `.agents/skills/aiworkflow-requirements/references/interfaces-auth.md`                                 | auth mode / auth key 境界確認                |
| canonical | `.agents/skills/aiworkflow-requirements/references/llm-ipc-types.md`                                   | provider / model / availability の型整合確認 |
| canonical | `.agents/skills/aiworkflow-requirements/references/security-electron-ipc.md`                           | preload / IPC セキュリティ要件               |

## 30思考法の適用結果

| 思考法               | 本タスクでの結論                                                                   |
| -------------------- | ---------------------------------------------------------------------------------- |
| 批判的思考           | 旧仕様は「新規単一 Anthropic UI」前提で現行実装とズレていた                        |
| 演繹思考             | 実装事実を前提にすると `SettingsView` 起点へ寄せるのが必然                         |
| 帰納的思考           | 実コードの複数ファイルが Settings 導線中心で収束している                           |
| アブダクション       | 旧 lane 移設時に task spec だけ古い想定が残存したと推定できる                      |
| 垂直思考             | まず契約境界の矛盾除去を優先する                                                   |
| 要素分解             | View、section、preload、IPC、型、evidence に分解した                               |
| MECE                 | provider UI と auth key UI を別責務として再整理した                                |
| 2軸思考              | 「UI surface / IPC contract」と「current fact / future work」で整理した            |
| プロセス思考         | Phase 1〜13 の各フェーズで何を確定するかを再定義した                               |
| メタ思考             | この task は実装依頼ではなく spec sync 依頼だと再認識した                          |
| 抽象化思考           | 本質は API キー導線の責務境界明文化である                                          |
| ダブル・ループ思考   | 「新規UIを作る前提」自体を疑い、前提を修正した                                     |
| ブレインストーミング | `SkillLifecyclePanel` 維持案より `SettingsView` 正本化案が優勢だった               |
| 水平思考             | AuthKeySection と ApiKeysSection の共存を競合ではなく役割分担と見なした            |
| 逆説思考             | 追加実装を減らすほど仕様は正確になった                                             |
| 類推思考             | 既存の `api-key-chat-tool-integration-alignment` 完了タスクを参照した              |
| if思考               | 将来コード変更が必要でも current fact を崩さない計画にした                         |
| 素人思考             | ユーザー目線では「どこで何のキーを設定するか」が最重要と整理した                   |
| システム思考         | auth mode、auth key、provider key、chat runtime の相互作用を見た                   |
| 因果関係分析         | 誤った UI 前提が phase 全体の参照 drift を連鎖させていた                           |
| 因果ループ           | 仕様 drift が再利用を招き、再利用がさらに drift を強める構造を確認した             |
| トレードオン思考     | テンプレート網羅性を上げつつ冗長説明は削った                                       |
| プラスサム思考       | spec 精度向上で将来の実装着手もしやすくなる形にした                                |
| 価値提案思考         | 実装者が迷わない task spec を最優先価値に置いた                                    |
| 戦略的思考           | 変更を最小のコード差分 + docs 同期に限定し downstream 実装の事故を減らす設計にした |
| why思考              | なぜ直すかは「実装と仕様の断絶を止めるため」である                                 |
| 改善思考             | 欠落節を埋めるだけでなく参照正本も差し替えた                                       |
| 仮説思考             | validator FAIL と code path drift が主因という仮説を検証した                       |
| 論点思考             | 真の論点は UI 新規作成ではなく task 定義の現実不一致だった                         |
| KJ法                 | 問題を「構造欠落」「参照 drift」「責務誤認」の3群に集約した                        |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------ |
| 真の論点             | API キー管理 UI の task spec が現行の Settings 導線とズレている                            |
| 依存関係・責務境界   | `ApiKeysSection` は provider key、`AuthKeySection` は Claude Agent SDK auth key を担当する |
| 価値とコストの不均衡 | 最小コード変更で導線不足を解消し、仕様を current fact に戻すのが最小コスト最大効果         |
| 改善優先順位         | 1. 参照 drift 是正 2. Phase 構造準拠 3. artifacts metadata 是正 4. Phase 11/12 計画整備    |
| 4条件評価            | 価値性: 高 / 実現性: 高 / 整合性: 修正前は低、修正後に回復 / 運用性: validator 実行可能    |

## ディレクトリ構成

```text
step-08-par-task-rt-04-api-key-management-ui/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
```

## 実装者向けクイックガイド

- provider API キー UI の主対象は `ApiKeysSection`
- Claude Agent SDK 認証キー UI の主対象は `AuthKeySection`
- 主導線は `SettingsView`、`SkillLifecyclePanel` は補助導線として同一 `auth-key:*` 契約を再利用する
- `apiKey:*` と `auth-key:*` は別契約なので統合しない
- 将来コード変更時も `preload/types.ts` を Renderer 契約の起点にする

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)
