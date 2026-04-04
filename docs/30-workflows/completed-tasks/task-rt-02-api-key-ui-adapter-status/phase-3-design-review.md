# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 値                                   |
| ---------- | ------------------------------------ |
| Phase      | 3                                    |
| Phase名    | 設計レビューゲート                   |
| 前提Phase  | Phase 2                              |
| 後続Phase  | Phase 4                              |
| ステータス | spec_created                         |
| 作成日     | 2026-03-29                           |
| 機能名     | task-rt-02-api-key-ui-adapter-status |

## 目的

Phase 2 の設計が、skill 準拠と aiworkflow 正本仕様の両面で過不足なく成立しているかを判定する。

## 実行タスク

- 要件カバレッジ確認: FR/NFR/AC の網羅を確認する
- 境界監査: public/private、global/local、Main/Preload/Renderer の境界を確認する
- 成果物監査: outputs / phase 本文 / artifacts の整合を確認する

## レビュー観点

### 1. 要件カバレッジ

| 観点                                                 | 判定 |
| ---------------------------------------------------- | ---- |
| 登録済み provider の health 表示が要件を満たす       | [ ]  |
| retry UX が対象行だけを更新する                      | [ ]  |
| API key 未登録 provider を誤って health check しない | [ ]  |
| a11y 要件が明示されている                            | [ ]  |
| 既存フロー非破壊が担保されている                     | [ ]  |

### 2. 境界監査

| 観点                                               | 判定 |
| -------------------------------------------------- | ---- |
| 新規 public IPC を追加していない                   | [ ]  |
| 新規 shared 型を追加していない                     | [ ]  |
| global store 増設を回避している                    | [ ]  |
| Runtime Skill Creator private 状態へ依存していない | [ ]  |

### 3. 実装容易性

| 観点                                           | 判定 |
| ---------------------------------------------- | ---- |
| `ApiKeysSection` の既存局所 state に自然に載る | [ ]  |
| テストが UI 中心に閉じる                       | [ ]  |
| Phase 12 で Step 2 を no-op 判定しやすい       | [ ]  |

## 統合テスト連携【必須】

| 統合ポイント                      | テスト可能性       | 判定 |
| --------------------------------- | ------------------ | ---- |
| `apiKey.list` 正常/異常系         | automated          | [ ]  |
| `llm.checkHealth` 正常/失敗系     | automated          | [ ]  |
| save/delete/retry 後の再描画      | automated          | [ ]  |
| keyboard / theme / failure reason | automated + manual | [ ]  |

## 参照資料

| 参照資料           | パス                                                                              | 内容              |
| ------------------ | --------------------------------------------------------------------------------- | ----------------- |
| Phase テンプレート | `.claude/skills/task-specification-creator/references/phase-templates.md`         | 必須構造          |
| IPC 正本           | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`        | public surface    |
| preload / security | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` | 公開境界          |
| state 方針         | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | local/global 原則 |

## 成果物

| 成果物         | パス                               | 説明               |
| -------------- | ---------------------------------- | ------------------ |
| レビュー結果書 | `outputs/phase-3/review-result.md` | 設計判定と指摘事項 |

## 完了条件

- [ ] 要件カバレッジ確認が完了している
- [ ] 境界監査が完了している
- [ ] 統合テスト観点が確定している
- [ ] レビュー結果判定が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 4: テスト作成
