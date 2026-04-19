# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 3                                           |
| 機能名     | TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION     |
| タスク名   | SkillDocGenerator の LLM プロバイダ連携実装 |
| 前提Phase  | Phase 1・Phase 2 完了                       |
| 後続Phase  | Phase 4（PASS の場合）                      |
| 作成日     | 2026-04-17                                  |
| ステータス | completed                                   |

## 目的

Phase 1〜2 の設計成果物を審査し、Phase 4 以降の実装に進めるかを判定する。

## 実行タスク

1. Phase 1 要件定義の完全性を確認する
2. Phase 2 設計の矛盾・漏れを検査する
3. UT-9I-001 との整合性を確認する
4. 既知の落とし穴（P23/P32/P42/P44）への対策を確認する
5. PASS / MINOR / MAJOR の判定を行う

## 参照資料

| 資料名             | パス                                                                                                              | 用途         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------ |
| Phase 1 要件定義   | `docs/30-workflows/TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION/phase-1-requirements.md`                               | 受け入れ基準 |
| Phase 2 設計       | `docs/30-workflows/TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION/phase-2-design.md`                                     | 設計書       |
| UT-9I-001 未タスク | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` | 整合性確認   |
| 調査レポート       | `docs/30-workflows/unassigned-task/task-05-phase-1-3-source-investigation-report.md`                              | ギャップ分析 |

## 実行手順

1. Phase 1・Phase 2 の完了条件チェックリストを全て確認する
2. 設計矛盾チェックを実施する
3. 既知の落とし穴チェックを実施する
4. UT-9I-001 との依存関係・整合性を検証する
5. 総合判定を記録する

## 設計矛盾チェックリスト

### Phase 1 完全性

- [ ] プロバイダ（Anthropic）が確定している
- [ ] エラー分類コード 7 種類が定義されている
- [ ] IPC 契約拡張要件（errorCode / retryable）が固定されている
- [ ] 受け入れ基準 AC-1〜AC-7 が定義されている

### Phase 2 設計整合性

- [ ] `LLMClient.ts` の インターフェース設計が AC-1〜AC-6 を充足できるか
- [ ] `LLMDocQueryAdapter` の stub 置換箇所（`Generated content for:` を返す実装）が正確に特定されているか
- [ ] エラー正規化ロジックが全 7 種類のエラーコードをカバーしているか
- [ ] DI 注入パターンが既存 `SkillDocGenerator` の `LLMQueryFn` 型契約を破壊しないか

## 既知の落とし穴対策チェック（調査レポート P23/P32/P42/P44/P48 準拠）

| ポイント | チェック内容                                                                        | 確認 |
| -------- | ----------------------------------------------------------------------------------- | ---- |
| P23      | `LLMQueryFn` 型が `SkillDocGenerator.ts` と `@repo/shared` で重複定義されていないか | [ ]  |
| P32      | `DocErrorCode` 型を追加する場合、全参照箇所を同時更新する計画があるか               | [ ]  |
| P42      | `prompt` 引数の `.trim()` バリデーションが Phase 2 設計に含まれているか             | [ ]  |
| P44      | `skill:docs:generate` ハンドラと Preload 呼び出し形式が一致しているか               | [ ]  |
| P48      | Renderer 側でキャッシュロジックがある場合 `useShallow` 適用が設計されているか       | [ ]  |

## UT-9I-001 との整合性確認

| チェック項目                                                        | 確認 |
| ------------------------------------------------------------------- | ---- |
| 設計が UT-9I-001 の「推奨アプローチ」に沿っているか                 | [ ]  |
| `LLMQueryFn` の DI 契約（関数型注入）が維持されているか             | [ ]  |
| エラー正規化が UT-9I-001 の「エラーサニタイズ規約」を満たしているか | [ ]  |
| `LLMDocQueryAdapter` の stub が本番経路から完全排除される設計か     | [ ]  |

## MINOR 追跡テーブル

| MINOR ID         | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| ---------------- | -------- | ------------- | ------------- | ---- |
| （判定時に記入） |          |               |               |      |

## 判定基準

| 判定  | 条件                                                   |
| ----- | ------------------------------------------------------ |
| PASS  | 全チェックリストが ✅、MAJOR指摘なし                   |
| MINOR | 軽微な改善点あり（実装で解決可能）、Phase 4 進行を承認 |
| MAJOR | 設計の根本的な問題あり、Phase 2 へ戻り再設計が必要     |

## 総合判定

```
判定結果: [ PASS / MINOR / MAJOR ]
判定日: YYYY-MM-DD
判定者: （実行エージェント）
判定理由: （詳細記述）
```

## Phase 4 開始条件

以下を全て満たした場合のみ Phase 4 へ進む：

- [ ] 判定が PASS または MINOR であること
- [ ] MAJOR 指摘がゼロであること
- [ ] Phase 1・Phase 2 の成果物が `outputs/phase-1/` と `outputs/phase-2/` に出力済み

## Phase 13 blocked 条件

- Phase 10 最終レビューが PASS でない場合
- CI が失敗している場合
- ユーザーの明示的な承認がない場合

## 統合テスト連携

- SubAgent-D（統合監査）が全チェックリストを最終確認する
- MINOR 指摘はトラッキングテーブルに記録し Phase 5〜9 で解決する

## 成果物

- `outputs/phase-3/gate-decision.md`: ゲート判定結果（判定結果・MINOR追跡テーブル含む）

## 完了条件

- [ ] 全設計矛盾チェックが完了している
- [ ] 既知の落とし穴（P23/P32/P42/P44）への対策が確認されている
- [ ] UT-9I-001 との整合性が確認されている
- [ ] PASS / MINOR / MAJOR 判定が記録されている

## タスク100%実行確認【必須】

- [ ] Phase 1 完全性チェック完了
- [ ] Phase 2 設計整合性チェック完了
- [ ] 既知の落とし穴チェック完了
- [ ] UT-9I-001 整合性確認完了
- [ ] 総合判定記録完了
- [ ] gate-decision.md 出力完了

## 次Phase

PASS / MINOR → Phase 4（テスト作成）へ進む。
MAJOR → Phase 2（設計）へ戻り再設計する。
