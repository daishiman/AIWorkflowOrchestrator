# Phase 13: PR作成

## メタ情報

| 項目       | 値                                                                           |
| ---------- | ---------------------------------------------------------------------------- |
| Phase番号  | 13                                                                           |
| Phase名    | PR作成                                                                       |
| 対象タスク | TASK-P0-01: verify 実行エンジン（Layer 1/2 コア + Layer 3/4 互換）の仕様整合 |
| 関連Issue  | #1886                                                                        |
| タスク種別 | バックエンド Main Process 実装（UI変更なし、IPC変更なし）                    |
| 実施者     | Claude Code（ユーザー許可後）                                                |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てから PR を作成する。  
本 Phase はユーザーとのインタラクションを含むため、各ステップでユーザーの確認・承認を必ず得ること。

## 実行タスク

### Task 13-1: ユーザーにローカル動作確認を依頼

Claude Code はユーザーに対して以下を依頼する。

```
ローカルでの動作確認をお願いします。

確認項目:
1. pnpm --filter @repo/desktop test — 全テスト PASS
2. pnpm --filter @repo/desktop typecheck — エラーなし
3. pnpm lint — エラーなし
4. 実際のスキルディレクトリで verify が正常動作すること

確認完了後、PR 作成の許可をお知らせください。
```

ユーザーの確認完了報告を受けるまで Task 13-2 以降に進まない。

---

### Task 13-2: 変更サマリー提示と PR 作成許可確認

ユーザーに以下の変更サマリーを提示し、PR 作成の明示的な許可を得る。

**変更サマリー**:

| 項目         | 内容                                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 新規ファイル | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                                                                         |
| 新規ファイル | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts`                                                          |
| 更新ファイル | `packages/shared/src/types/skillCreator.ts`（`RuntimeSkillCreatorVerifyCheck` / `RuntimeSkillCreatorVerifyCheckSeverity` 型の current facts sync） |
| 更新ファイル | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（Facade 統合）                                                               |
| IPC 変更     | なし                                                                                                                                               |
| UI 変更      | なし                                                                                                                                               |

ユーザーから「PR 作成を許可します」または同等の明示的な承認を受けてから Task 13-3 に進む。

---

### Task 13-3: `/ai:diff-to-pr` を実行（ユーザー許可後のみ）

```
/ai:diff-to-pr
```

**注意**: ユーザーの明示的な許可なしに本コマンドを実行してはならない。

`/ai:diff-to-pr` は以下を自動実行する。

1. リモート main との同期・コンフリクト解消
2. 品質検証（typecheck, lint, test）
3. 差分分析・ブランチ作成・コミット
4. タスク仕様書 → Issue 同期（未同期チェック）
5. PR 本文生成・PR 作成
6. 補足コメント投稿
7. CI/CD 完了確認

---

### Task 13-4: PR 本文に含める情報

`/ai:diff-to-pr` の PR 本文生成時に以下の情報を含めること。

#### 実装概要

- `SkillCreatorVerificationEngine` クラスを新規実装
- Layer 1 / Layer 2 コアチェック: スキルディレクトリ構造・必須ファイルの存在確認と `SKILL.md` のセクション構造検証
- Layer 3 / Layer 4 互換: current facts の 4-layer verify 契約を壊さないことを確認
- Phase 12 root evidence: `outputs/phase-12/phase12-task-spec-compliance-check.md`

#### 設計原則

- **独立モジュール設計**: `SkillCreatorVerificationEngine` は他サービスに依存せず、`RuntimeSkillCreatorFacade` 経由で統合
- **graceful degradation**: `verificationEngine` 未注入時もクラッシュせず安全に動作
- **型安全**: `RuntimeSkillCreatorVerifyCheck` 型と public export を `packages/shared` に同期し、後続タスクとの型契約を確立
- **互換性**: `RuntimeSkillCreatorVerifyCheck.layer` が `layer1`〜`layer4` と互換であることを維持

#### テストケース件数

- ユニットテスト: `SkillCreatorVerificationEngine.test.ts` 内のテストケース件数を記載
- カバレッジ: Phase 9 の品質レポートから数値を引用

#### 後続タスクへの影響

| 後続タスク             | 影響内容                                                            |
| ---------------------- | ------------------------------------------------------------------- |
| TASK-P0-02（閉ループ） | `RuntimeSkillCreatorVerifyCheck` 型を消費。本 PR の型定義が前提条件 |
| TASK-RT-03（UIパネル） | 本 PR の verify 結果を UI に表示する。IPC 設計は TASK-RT-03 で行う  |

#### 関連 Issue

- Closes #1886

---

### Task 13-5: CI 通過確認

PR 作成後、CI の全チェックが通過したことを確認する。

- 確認コマンド: `gh run view --repo <owner>/<repo> --branch <branch>`
- CI が失敗した場合は原因を調査し修正する
- 修正後は新たなコミットを作成する（`--no-verify` は使用禁止）

---

### Task 13-6: タスクディレクトリ移動

PR が MERGED または APPROVED になった後、タスクディレクトリを以下に移動する。

- 移動元: `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/`
- 移動先: `docs/30-workflows/completed-tasks/`

移動後、`outputs/phase-13/pr-info.md` に移動完了を記録する。

---

## 参照資料

- `outputs/phase-12/implementation-guide.md`（PR 本文の実装説明に引用）
- `outputs/phase-12/phase12-task-spec-compliance-check.md`（Phase 12 root evidence）
- `outputs/phase-9/quality-report.md`（テストカバレッジ数値の引用元）
- `outputs/phase-10/final-review-result.md`（レビュー判定の引用元）
- `phase-2-design.md`（設計の前提）
- `phase-5-implementation.md`（実装の前提）
- `phase-6-test-expansion.md`（テスト拡充の前提）
- `phase-7-coverage.md`（カバレッジ確認の前提）
- `phase-8-refactoring.md`（リファクタリングの前提）
- `phase-11-manual-test.md`（手動テストの前提）
- `.claude/rules/06-known-pitfalls.md`（コミット・PR 操作の注意事項）

## 統合テスト連携

- Phase 12（ドキュメント更新）の完了を前提とする
- CI の全チェック（typecheck / lint / test）が本 Phase で最終確認される

## 成果物

| 成果物  | パス                          | 必須 |
| ------- | ----------------------------- | ---- |
| PR 情報 | `outputs/phase-13/pr-info.md` | 必須 |

### `pr-info.md` 記載項目

- PR URL
- PR 番号
- ブランチ名
- コミットハッシュ
- CI ステータス
- タスクディレクトリ移動完了有無
- 作成日時

## 完了条件

- [ ] 本 Phase 内の全タスク（Task 13-1 〜 13-6）を 100% 実行完了
- [ ] ユーザーのローカル動作確認が完了している
- [ ] ユーザーから PR 作成の明示的な許可を得ている
- [ ] `/ai:diff-to-pr` を実行し PR が作成されている
- [ ] CI の全チェックが PASS している
- [ ] タスクディレクトリが `completed-tasks/` に移動されている
- [ ] `outputs/phase-13/pr-info.md` が出力されている

## 次の Phase

本 Phase が最終 Phase です。TASK-P0-01 はこれで完了となります。

後続タスク:

- TASK-P0-02: 閉ループ実装（本 PR の型定義を前提とする）
- TASK-RT-03: UI パネル実装（本 PR の verify 結果表示）
