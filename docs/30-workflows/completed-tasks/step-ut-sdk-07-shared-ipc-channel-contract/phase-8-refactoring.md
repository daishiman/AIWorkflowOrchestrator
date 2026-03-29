# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 8                                          |
| Phase名    | リファクタリング                           |
| 前提Phase  | Phase 7                                    |
| 後続Phase  | Phase 9                                    |
| ステータス | 未実施                                     |
| 作成日     | 2026-03-29                                 |
| 機能名     | step-ut-sdk-07-shared-ipc-channel-contract |

---

## 目的

TDD Refactor フェーズとして、Phase 4-7 で追加した実装・テストコードの重複排除・命名改善を行い、保守性を向上させる。

## 背景

Phase 5（実装）と Phase 7（統合テスト）を経て機能は動作しているが、以下のリファクタリング対象が残っている可能性がある：

- desktop `preload/channels.ts` にリテラル文字列が残存していないか
- テストコードの setup 処理に重複がないか
- 新規追加した `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` の命名が既存の `*_CHANNELS` パターンと整合しているか

---

## 実行タスク

### タスク1: リテラル文字列の残存確認と排除

**目的**: desktop `preload/channels.ts` のチャネル定義が全て shared からの import に置換されていることを確認する

**実行手順**:

1. `apps/desktop/src/preload/channels.ts` を読み、`"approval:respond"` / `"approval:request"` / `"execution:get-disclosure-info"` のリテラル文字列がハードコードされていないか確認する
2. 他のファイル（handlers, hooks 等）に同じリテラル文字列が残っていないか grep で検索する
3. 残存している場合は shared からの import に置換する

**完了基準**:

- 対象3チャネルのリテラル文字列がコードベース内に直接ハードコードされていないこと（テストの期待値を除く）

---

### タスク2: テストコードの重複排除

**目的**: shared テストと governance テストの共通 setup 処理を整理する

**実行手順**:

1. `packages/shared/src/ipc/__tests__/` 配下のテストの setup 処理を確認する
2. `apps/desktop/src/preload/__tests__/skill-creator-api.governance.test.ts` の setup 処理を確認する
3. 共通化できる fixture / helper がある場合はテストユーティリティとして抽出する
4. 過度な共通化は避け、テストの可読性を優先する

**完了基準**:

- テスト間で同一の setup コードが3箇所以上コピーされていないこと
- 共通化した場合もテスト単体での可読性が維持されていること

---

### タスク3: 命名の一貫性確認

**目的**: 新規追加した `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` が既存の `*_CHANNELS` 命名パターンと整合していることを確認する

**実行手順**:

1. `packages/shared/src/ipc/channels.ts` の既存 `*_CHANNELS` 定義（`CHAT_EXPORT_CHANNELS`, `SKILL_CHANNELS` 等）の命名パターンを確認する
2. 新規追加した定義が同じ命名規約（大文字スネークケース + `_CHANNELS` サフィックス）に従っているか確認する
3. `as const` assertion の有無、export 方法（named export）が既存と一致しているか確認する
4. 不一致がある場合は既存パターンに合わせてリネームする

**完了基準**:

- 全 `*_CHANNELS` 定義が同一の命名規約・export パターンに従っていること

---

### タスク4: リファクタ後のテスト全 Green 確認

**目的**: リファクタリングによる regression がないことを確認する

**実行手順**:

1. `pnpm --filter @repo/shared test` を実行し、shared パッケージの全テストが green であることを確認する
2. `pnpm --filter @repo/desktop test` を実行し、desktop パッケージの全テストが green であることを確認する
3. 失敗がある場合はリファクタリングの問題を特定・修正する

**完了基準**:

- 全ユニットテスト・統合テストが green であること

---

## 参照資料

| 参照資料                 | パス                                                                      | 内容                   |
| ------------------------ | ------------------------------------------------------------------------- | ---------------------- |
| shared channels          | `packages/shared/src/ipc/channels.ts`                                     | shared 側チャネル定義  |
| desktop preload channels | `apps/desktop/src/preload/channels.ts`                                    | desktop 側チャネル定義 |
| governance test          | `apps/desktop/src/preload/__tests__/skill-creator-api.governance.test.ts` | allowlist governance   |
| Phase 5 実装結果         | `phase-5-implementation.md`                                               | 実装内容               |
| Phase 7 カバレッジ結果   | `phase-7-coverage-check.md`                                               | カバレッジ結果         |

---

## 統合テスト連携（Phase 8）

- リファクタ後の統合テスト継続成功を確認する
- Phase 7 で実施した cross-layer parity テストがリファクタ後も green であることを確認する
- import パスの変更がある場合、Electron バンドル解決に影響しないことを確認する

---

## 成果物

| 成果物               | パス                                             | 内容                       |
| -------------------- | ------------------------------------------------ | -------------------------- |
| リファクタリング結果 | `outputs/phase-8/refactoring-summary.md`         | 変更内容と理由の記録       |
| テスト実行結果       | `outputs/phase-8/test-results-after-refactor.md` | リファクタ後の全テスト結果 |

---

## 完了条件

- [ ] リテラル文字列の残存がないことを確認済み
- [ ] テストコードの重複が許容範囲内に整理されている
- [ ] 命名の一貫性が既存パターンと整合している
- [ ] リファクタ後の全テスト（shared + desktop）が green

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

Phase 9: 品質保証 → `phase-9-quality-assurance.md`
