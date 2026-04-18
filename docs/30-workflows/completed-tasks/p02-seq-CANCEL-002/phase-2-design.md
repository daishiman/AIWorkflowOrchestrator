# Phase 2: 設計

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 2                                |
| タスクID   | TASK-SW-CANCEL-002               |
| 機能名     | skill-creator-cancel-preload-api |
| 前提Phase  | Phase 1                          |
| 後続Phase  | Phase 3                          |
| 作成日     | 2026-04-15                       |
| ステータス | completed                        |

## 目的

`cancelGeneration` の API 契約、`safeInvoke` 経由の呼び出し、allowlist 登録の3点を
最小複雑性で閉じる設計として確定する。

## 実行タスク

- API 設計: `cancelGeneration(): Promise<IpcResult<void>>`
- 実装設計: `safeInvoke<IpcResult<void>>(IPC_CHANNELS.SKILL_CREATOR_CANCEL)`
- セキュリティ設計: `ALLOWED_INVOKE_CHANNELS` へ明示登録
- 依存設計: shared channel constant を正本とし、文字列リテラル直書きを禁止

## 参照資料

| 資料                   | パス                                                                                              | 用途                  |
| ---------------------- | ------------------------------------------------------------------------------------------------- | --------------------- |
| design                 | `outputs/phase-2/design.md`                                                                       | 詳細設計              |
| skill creator IPC spec | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-skill-creator.md`               | current contract 照合 |
| cancel chain lessons   | `.agents/skills/aiworkflow-requirements/references/lessons-learned-skill-creator-cancel-chain.md` | テスト責務分離の参照  |

## 実行手順

1. 戻り値を `IpcResult<void>` に統一して consumer contract を固定する
2. `safeInvoke` を唯一の preload invoke 経路として採用する
3. `channels.ts` で security gate を通すため allowlist を更新する
4. Main/Renderer との完全接続は follow-up task に引き継ぐ

## 統合テスト連携

- shared / main / renderer の downstream テストで cancel chain が壊れていないことを、Phase 4〜7 で参照する前提を固定する

## 成果物

| 成果物 | パス                        |
| ------ | --------------------------- |
| 設計書 | `outputs/phase-2/design.md` |

## 完了条件

- [x] API 契約を固定した
- [x] invoke 経路を `safeInvoke` に一本化した
- [x] allowlist 登録を設計へ組み込んだ
- [x] 本 Phase 内の全タスクを100%実行完了
