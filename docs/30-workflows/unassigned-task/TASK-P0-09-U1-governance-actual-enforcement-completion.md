# TASK-P0-09-U1: governance-actual-enforcement-completion

```yaml
task_id: TASK-P0-09-U1
task_name: governance-actual-enforcement-completion
category: 改善
target_feature: SkillCreatorPermissionPolicy / RuntimeSkillCreatorFacade
priority: 高
scale: 中規模
status: 未実施
source_phase: Phase 12
created_date: 2026-03-31
parent_task: TASK-P0-09
dependencies:
  - TASK-P0-09
```

| 項目     | 値                                                  |
| -------- | --------------------------------------------------- |
| タスクID | TASK-P0-09-U1                                       |
| 優先度   | 高                                                  |
| 元タスク | TASK-P0-09 (claude-sdk-permission-hooks-governance) |
| 検出日   | 2026-03-31                                          |
| 由来     | Phase 12 unassigned-task-detection                  |

---

## 概要

`execute` / `improve` phase において、SDK callback から `targetPath` と `allowedSkillRoot` を抽出し、`canUseTool()` の context 引数として接続することで、path-scoped deny を runtime で実効化する。

現在は `SkillCreatorPermissionPolicy.evaluateContextPolicy()` に判定ロジックが実装済みで単体テストも存在するが、`RuntimeSkillCreatorFacade.createExecuteGovernanceCanUseTool()` が `context` を渡さない状態であるため、path 制約は runtime で機能していない。

---

## 背景・苦戦箇所

### 現状の gap

TASK-P0-09 で実装した governance module において、以下の状態が `current facts` として確定している：

- **完了**: phase 別 tool policy 定義、tool-level enforcement、session audit 記録、renderer 向け governance state 公開
- **未完了**: `execute` / `improve` 実行経路での `targetPath`・`allowedSkillRoot` の SDK callback への接続

`SkillCreatorPermissionPolicy.ts` 内の `evaluateContextPolicy()` は `targetPath` が `allowedSkillRoot` 配下かを検証するロジックを持つが、呼び出し元の `createExecuteGovernanceCanUseTool()` では context を渡していないため、実際の path 制約は無効化されている。

```typescript
// 現在の実装（apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts）
private createExecuteGovernanceCanUseTool() {
  return async (
    toolName: string,
    _input: Record<string, unknown>,  // ← input を使っていない
    options: { toolUseID: string },
  ) => {
    const decision = evaluateGovernanceToolUse(toolName, "execute");
    // ↑ context 引数なし → path-scoped 判定が発動しない
    ...
  };
}
```

### 苦戦箇所・知見セクション

#### 苦戦箇所 1: `evaluateContextPolicy()` と SDK callback の配線

`SkillCreatorPermissionPolicy.ts` の `canUseTool()` が受け付ける `CanUseToolContext` は次の形：

```typescript
export interface CanUseToolContext {
  targetPath?: string;
  allowedSkillRoot?: string;
}
```

一方、SDK callback の `input: Record<string, unknown>` から `targetPath` に相当するキーを抽出するには、SDK のツール入力スキーマを把握する必要がある。`Write` / `Edit` ツールの入力には `file_path` または `path` キーが含まれるが、SDK バージョンにより名称が揺れる可能性がある。

**知見**: `_input` 引数から `file_path` → `path` の順で fallback しつつ抽出し、存在しない場合は context なし（tool-level 判定のみ）として扱うことで後方互換を保てる。

#### 苦戦箇所 2: 「判定ロジック層」と「配線層」の責任分離

現在の設計は次のように分離されている：

- **判定ロジック層**: `SkillCreatorPermissionPolicy.canUseTool()` / `evaluateContextPolicy()`
- **配線層**: `RuntimeSkillCreatorFacade.createExecuteGovernanceCanUseTool()`

判定ロジック層は単体テスト済みのため改変してはならない。配線層のみを修正して context を渡すことが原則。後続 phase（例: `plan` への将来の制限追加）を追加する際も、このパターンを維持すること。

**知見**: `createExecuteGovernanceCanUseTool()` と同様のメソッド `createImproveGovernanceCanUseTool()` を追加し、`improve()` 内でも `canUseTool` に context を渡すようにする。将来の phase 追加でも同パターンを踏襲する。

#### 苦戦箇所 3: governance hooks の wrap pattern と phase 追加時の統一

現在の governance hooks 生成は `createGovernanceHooks(phase)` で統一されているが、`canUseTool` の context 抽出ロジックはそれとは別のメソッドで管理されている。後続 phase が追加された際、hooks 生成と context 抽出の両方を同期して更新しなければ、片方だけ対応漏れが生じる。

**知見**: 「phase 追加チェックリスト」として、新 phase 追加時に確認すべき箇所を実装ガイドまたはコードコメントとして明示しておくことで、将来の実装者が見落としを防げる。

---

## 1. なぜこのタスクが必要か (Why)

### 1.1 背景

TASK-P0-09 では skill-creator lane の governance 基盤を整備した。phase 別 tool policy・hooks・audit sink・IPC 統合が完成し、tool-level の enforcement は `execute` phase で機能している。

一方、`SkillCreatorPermissionPolicy.evaluateContextPolicy()` が実装・テスト済みにもかかわらず、SDK 実行経路への `targetPath` / `allowedSkillRoot` 接続が意図的に carry-forward されたため、path-scoped deny は現時点では機能していない。

### 1.2 問題点・課題

- `execute` phase で Write/Edit ツールが呼ばれても、**対象パスが skill ルート外でも deny されない**。
- SDK callback の `input` 引数から `targetPath` を抽出する配線コードが存在しない。
- `improve` phase でも同様の未配線状態が存在する（現在は `canUseTool` 未設定）。
- AC-2（allowedTools / disallowedTools / canUseTool 実装）が PARTIAL 判定のまま残っている。

### 1.3 放置した場合の影響

- skill-creator が意図せずスキルルート外のファイルを書き換えるリスクが残る。
- AC-2 PARTIAL 表記が将来の仕様参照者に誤解を与える（「path 制約は動いている」という誤認）。
- 将来の phase 追加時に同様の配線漏れが再発するパターンが固定化される。

---

## 2. 何を達成するか (What)

### 2.1 目的

`execute` と `improve` の SDK callback を `canUseTool(toolName, phase, context)` に接続し、path-scoped deny を runtime で実効化する。

### 2.2 最終ゴール

1. `execute` phase での Write/Edit ツール呼び出し時に、`input.file_path`（または `input.path`）を `targetPath` として抽出し、`allowedSkillRoot` 外であれば `deny` を返すこと。
2. `improve` phase でも同等の接続を行うこと（`improve` 現在は `canUseTool` 引数自体が未設定）。
3. AC-2 を PARTIAL → PASS に昇格させ、`implementation-guide.md` の AC compliance matrix を更新すること。
4. 既存テスト 64 件 + 新規テスト（path-scoped enforcement）が全 PASS すること。

### 2.3 スコープ

#### 含むもの

- `RuntimeSkillCreatorFacade.createExecuteGovernanceCanUseTool()` への `targetPath` 抽出と context 接続
- `improve` phase の `canUseTool` callback 追加（`createImproveGovernanceCanUseTool()` 相当）
- `SkillCreatorPermissionPolicy` / `SkillCreatorHooksFactory` の変更は不要（判定ロジック層は維持）
- path-scoped enforcement に関するユニットテスト追加
- `implementation-guide.md` / `unassigned-task-detection.md` の AC-2 表記更新

#### 含まないもの

- `SkillCreatorPermissionPolicy.evaluateContextPolicy()` の改変
- renderer 側 governance 表示 UI（将来スコープ）
- audit 永続化（将来スコープ）
- `plan` / `verify` phase への path 制約追加（これらは read-only で不要）
- `allowedSkillRoot` の動的取得ロジック以外のリソース解決変更

### 2.4 成果物

| 成果物                               | パス                                                                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 修正: `RuntimeSkillCreatorFacade.ts` | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                                                                   |
| 追加テスト                           | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.governance-path.test.ts`                                                    |
| 更新: `implementation-guide.md`      | `docs/30-workflows/skill-creator-agent-sdk-lane/step-10-seq-task-p0-09-claude-sdk-permission-hooks-governance/outputs/phase-12/implementation-guide.md` |

---

## 3. どのように実行するか (How)

### 3.1 前提条件

- TASK-P0-09 が完了していること（governance module 実装済み）
- `SkillCreatorPermissionPolicy.canUseTool()` の context-aware 判定が単体テスト済みであること
- `SkillExecutor` が `canUseTool` callback を SDK に渡していること

### 3.2 依存タスク

- TASK-P0-09（claude-sdk-permission-hooks-governance）: 完了済み

### 3.3 必要な知識

- Claude Agent SDK の `canUseTool` callback シグネチャ: `(toolName, input, options) => Promise<{ behavior: "allow" | "deny", ... }>`
- `CanUseToolContext` インターface（`SkillCreatorPermissionPolicy.ts` 定義済み）
- `allowedSkillRoot` の取得方法: `this.getExplicitSkillCreatorRoot()` を使用
- `evaluateGovernanceToolUse` は `canUseTool` の alias（`governance/index.ts` からエクスポート）

### 3.4 推奨アプローチ

`createExecuteGovernanceCanUseTool()` に `allowedSkillRoot` を渡し、SDK callback 内で `input` から `targetPath` を抽出して context を構築する。

```typescript
// 変更後のイメージ
private createExecuteGovernanceCanUseTool(allowedSkillRoot?: string) {
  return async (
    toolName: string,
    input: Record<string, unknown>,
    options: { toolUseID: string },
  ) => {
    const targetPath =
      (typeof input.file_path === "string" ? input.file_path : undefined) ??
      (typeof input.path === "string" ? input.path : undefined);

    const context =
      targetPath !== undefined ? { targetPath, allowedSkillRoot } : undefined;

    const decision = evaluateGovernanceToolUse(toolName, "execute", context);
    if (decision.allowed) {
      return { behavior: "allow" as const, toolUseID: options.toolUseID };
    }
    return {
      behavior: "deny" as const,
      message: decision.reason,
      toolUseID: options.toolUseID,
    };
  };
}
```

`allowedSkillRoot` は `execute()` 呼び出し時に `this.getExplicitSkillCreatorRoot()` で取得する。

---

## 4. 実行手順

### Phase構成

Phase 1〜5 で実装、Phase 6〜9 で品質検証、Phase 10〜13 で完了処理を行う。

---

### Phase 1: 要件定義

#### 目的

配線すべき SDK callback と `canUseTool` の接続仕様を確定する。

#### 手順

1. `RuntimeSkillCreatorFacade.ts` の `createExecuteGovernanceCanUseTool()` を確認し、`_input` が未使用であることを再確認する。
2. `SkillCreatorPermissionPolicy.ts` の `CanUseToolContext` と `evaluateContextPolicy()` の仕様を確認する。
3. SDK の Write / Edit ツール入力における `file_path` / `path` キーのスキーマを確認する。
4. `improve` phase での `canUseTool` 未設定箇所（`SkillExecutionRequest` 構築部）を特定する。
5. 変更対象ファイルと変更箇所のリストを作成する。

#### 成果物

- 変更対象ファイルリストと変更箇所メモ

#### 完了条件

- [ ] `createExecuteGovernanceCanUseTool()` の問題箇所が特定されている
- [ ] `improve()` での `canUseTool` 未設定箇所が特定されている
- [ ] `CanUseToolContext` の接続に必要な情報が揃っている

---

### Phase 2: 設計

#### 目的

`targetPath` 抽出ロジックと context 接続の設計を確定する。

#### 手順

1. `createExecuteGovernanceCanUseTool(allowedSkillRoot?)` のシグネチャ変更を設計する。
2. `input` から `targetPath` を抽出する fallback 順序を確定する（`file_path` → `path`）。
3. `createImproveGovernanceCanUseTool(allowedSkillRoot?)` の追加を設計する（`improve` phase 用）。
4. `execute()` と `improve()` での `allowedSkillRoot` 取得タイミングを確定する。
5. 既存の `governance-bundle.test.ts` / `SkillCreatorPermissionPolicy.test.ts` への影響を確認する。

#### 成果物

- 設計メモ（変更前/変更後のコードスニペット比較）

#### 完了条件

- [ ] `createExecuteGovernanceCanUseTool()` の変更仕様が確定している
- [ ] `improve()` での `canUseTool` 追加仕様が確定している
- [ ] 既存テストへの影響がないことが確認されている

---

### Phase 3: 設計レビュー

#### 目的

設計の妥当性を確認し、Phase 4 以降への進行を判定する。

#### 手順

1. 判定ロジック層（`SkillCreatorPermissionPolicy`）を変更しないことを確認する。
2. 配線層のみの変更であることを確認する。
3. `allowedSkillRoot` が未設定の場合（`undefined`）、path 制約なしで動作することを確認する。
4. `improve` phase での `canUseTool` 追加が既存テストを破壊しないことを確認する。

#### 成果物

- 設計レビュー結果（PASS / MINOR / MAJOR / CRITICAL）

#### 完了条件

- [ ] 設計レビュー判定が PASS または MINOR である
- [ ] 進行可否が確定している

---

### Phase 4: テスト作成（TDD: Red）

#### 目的

path-scoped enforcement の失敗テスト（Red）を先に作成する。

#### 手順

1. `RuntimeSkillCreatorFacade.governance-path.test.ts` を新規作成する。
2. `execute` phase で Write ツールが `allowedSkillRoot` 外のパスを指定した場合に deny されることを確認するテストを追加する。
3. `execute` phase で Write ツールが `allowedSkillRoot` 内のパスを指定した場合に allow されることを確認するテストを追加する。
4. `input` に `file_path` がない場合、tool-level 判定のみで動作することを確認するテストを追加する。
5. `improve` phase で Edit ツールが `allowedSkillRoot` 外のパスを指定した場合に deny されることを確認するテストを追加する。

#### 成果物

- `RuntimeSkillCreatorFacade.governance-path.test.ts` (Red 状態)

#### 完了条件

- [ ] テストが Red（失敗）状態であることを確認した
- [ ] テストが path-scoped denial の仕様を正しく表現している

---

### Phase 5: 実装（TDD: Green）

#### 目的

テストを Green にする最小の実装を行う。

#### 手順

1. `RuntimeSkillCreatorFacade.ts` の `createExecuteGovernanceCanUseTool()` を修正し、`allowedSkillRoot` 引数を追加する。
2. `input` から `targetPath` を抽出する処理を実装する（`file_path` → `path` の fallback 順序）。
3. `context` を構築し、`evaluateGovernanceToolUse(toolName, "execute", context)` に渡す。
4. `execute()` メソッド内で `this.getExplicitSkillCreatorRoot()` を取得し、`createExecuteGovernanceCanUseTool(allowedSkillRoot)` に渡す。
5. `improve()` メソッドに `canUseTool` callback を追加する（`createImproveGovernanceCanUseTool()` を作成し接続）。

#### 成果物

- 修正済み `RuntimeSkillCreatorFacade.ts`

#### 完了条件

- [ ] Phase 4 で作成したテストが全 Green である
- [ ] 既存テスト 64 件が全 PASS である

---

### Phase 6: テスト拡充

#### 目的

エッジケースのテストを追加し、coverage を向上させる。

#### 手順

1. `input.path` キーからの `targetPath` 抽出をテストする。
2. `allowedSkillRoot` が `undefined` の場合（tool-level のみ動作）をテストする。
3. `improve` phase での `allowedSkillRoot` 外 Edit が deny されることをテストする。
4. `NotebookEdit` が全 phase で deny されることを再確認するテストを追加する（回帰テスト）。

#### 成果物

- 追加テストケース

#### 完了条件

- [ ] 全テストが Green である
- [ ] エッジケースが網羅されている

---

### Phase 7: カバレッジ確認

#### 目的

変更箇所のテストカバレッジが十分であることを確認する。

#### 手順

1. `pnpm --filter @repo/desktop test` を実行しカバレッジレポートを確認する。
2. `createExecuteGovernanceCanUseTool()` の分岐（`file_path` あり / なし、`allowedSkillRoot` あり / なし）が全てカバーされていることを確認する。
3. `createImproveGovernanceCanUseTool()` も同様に確認する。

#### 成果物

- カバレッジレポート（対象関数のカバレッジ）

#### 完了条件

- [ ] 変更対象関数の branch coverage が 80% 以上である
- [ ] 新規テスト件数が 5 件以上追加されている

---

### Phase 8: リファクタリング

#### 目的

実装の可読性・保守性を向上させる。

#### 手順

1. `targetPath` 抽出ロジックを `extractTargetPath(input: Record<string, unknown>): string | undefined` として関数化する（同一ロジックが `execute` と `improve` で重複しないように）。
2. コードコメントに「**phase 追加チェックリスト**」を記載する（新 phase 追加時に確認すべき箇所一覧）。
3. `pnpm lint` / `pnpm typecheck` を実行しエラーがないことを確認する。

#### 成果物

- リファクタリング済み `RuntimeSkillCreatorFacade.ts`

#### 完了条件

- [ ] 全テストが Green である
- [ ] `pnpm lint` / `pnpm typecheck` がエラーなし

---

### Phase 9: 品質保証

#### 目的

全品質ゲートをクリアする。

#### 手順

1. `pnpm --filter @repo/desktop test` を実行し全テストが PASS することを確認する。
2. `pnpm --filter @repo/desktop typecheck` を実行しエラーがないことを確認する。
3. `pnpm --filter @repo/desktop lint` を実行しエラーがないことを確認する。
4. governance module の統合テスト `governance-bundle.test.ts` が PASS することを確認する。

#### 成果物

- 品質確認レポート（全テスト PASS、型・lint エラーなし）

#### 完了条件

- [ ] 全ユニットテストが PASS
- [ ] 型エラーなし
- [ ] lint エラーなし

---

### Phase 10: 最終レビュー

#### 目的

実装の完全性を確認し、AC-2 の昇格判定を行う。

#### 手順

1. `CanUseToolContext` の接続が `execute` と `improve` の両方で完了していることを確認する。
2. `SkillCreatorPermissionPolicy.evaluateContextPolicy()` が変更されていないことを確認する。
3. AC-2 PARTIAL → PASS の昇格条件（path-scoped enforcement が runtime で機能すること）を満たしていることを確認する。
4. 苦戦箇所 3 に記載した「phase 追加チェックリスト」がコード内に追加されていることを確認する。

#### 成果物

- 最終レビュー結果

#### 完了条件

- [ ] 全 AC が PASS 以上
- [ ] 配線層のみの変更であることが確認されている

---

### Phase 11: 手動テスト（非 Visual）

#### 目的

UI 変更なしのため、ユニットテストレベルでの動作確認のみ行う。

#### 手順

1. `pnpm --filter @repo/desktop test` を実行し全テストが PASS することを最終確認する。
2. path-scoped denial のテストケースが実際に deny メッセージを返すことをテスト出力で確認する。

#### 成果物

- 手動テスト結果（`NON_VISUAL` 判定）

#### 完了条件

- [ ] 全テスト PASS
- [ ] 非 Visual であることが確認されている（UI 変更なし）

---

### Phase 12: ドキュメント更新

#### 目的

TASK-P0-09 の実装ガイドと AC compliance matrix を更新する。

#### 手順

1. `implementation-guide.md` の AC compliance matrix において AC-2 を PARTIAL → PASS に更新する。
2. AC-2 の「実装」列を「path-scoped canUseTool は execute / improve で実配線済み」に更新する。
3. 「エラーハンドリングとエッジケース」テーブルの「path-scoped 判定用 context 不在」行を更新する。
4. 「残課題」セクションから `TASK-P0-09-U1` を削除する（完了のため）。
5. 本タスク仕様書（`TASK-P0-09-U1-governance-actual-enforcement-completion.md`）のステータスを「完了」に更新する。

#### 成果物

- 更新済み `implementation-guide.md`
- ステータス更新済みの本仕様書

#### 完了条件

- [ ] AC-2 が PASS に昇格している
- [ ] 残課題セクションから本タスクが除去されている
- [ ] 本仕様書のステータスが「完了」になっている

---

### Phase 12: 中学生レベルの概念説明

このタスクで何をしているか、身近な例で説明します。

**例え: 入場証と入れる部屋**

学校の文化祭を想像してください。各部屋には「どの道具を使ってよいか」のルールが決まっています。

- 「設計部屋 (plan)」: 設計図を読むだけ OK。鉛筆で書いたり削ったりは NG。
- 「制作部屋 (execute)」: 工具を使って実際にモノを作る。書いたり削ったりも OK。
- 「検査部屋 (verify)」: できあがりを確認するだけ。設計部屋と同じルール。
- 「修正部屋 (improve)」: 間違いを直すだけ。新しいものは作れない。

このルール自体は TASK-P0-09 で完成しました (「道具の許可リスト」)。

今回 (TASK-P0-09-U1) が追加するのは「**どの棚に触れるか**」というもう 1 段階のチェックです。

制作部屋で作業員が「ペンキを塗る」と言ったとき、今は「ペンキ缶は許可リストにある道具だから OK」とだけ確認しています。でも本当は「**塗る場所が許可されたエリア内か**」も確認すべきです。隣のクラスの展示物に勝手にペンキを塗ってはいけないからです。

この「場所の確認」をするコード (`evaluateContextPolicy`) はもう書けています。ただ、実際に「どの棚に塗ろうとしているか」という情報 (`targetPath`) を確認コードに渡すケーブルがまだ繋がっていません。このタスクはそのケーブルを繋ぐ作業です。

---

### Phase 13: PR 作成

#### 目的

変更を main ブランチにマージする PR を作成する。

#### 手順

1. ブランチが最新の main と同期されていることを確認する。
2. `pnpm lint` / `pnpm typecheck` / `pnpm test` が全 PASS であることを確認する。
3. PR を作成する。タイトル: `feat(governance): TASK-P0-09-U1 path-scoped enforcement 実配線`
4. PR 本文に変更概要、AC-2 昇格、テスト追加件数を記載する。
5. CI が全 PASS であることを確認する。

#### 成果物

- GitHub PR

#### 完了条件

- [ ] PR が作成されている
- [ ] CI が全 PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `execute` phase: Write/Edit が `allowedSkillRoot` 外のパスを指定した場合に deny される
- [ ] `execute` phase: Write/Edit が `allowedSkillRoot` 内のパスを指定した場合に allow される
- [ ] `execute` phase: `input` に `file_path` / `path` がない場合、tool-level 判定のみが適用される
- [ ] `improve` phase: Edit が `allowedSkillRoot` 外のパスを指定した場合に deny される
- [ ] `allowedSkillRoot` が未設定（`undefined`）の場合、path 制約なしで動作する（後方互換）

### 品質要件

- [ ] 既存テスト 64 件が全 PASS
- [ ] 新規テストが 5 件以上追加されている
- [ ] `pnpm typecheck` がエラーなし
- [ ] `pnpm lint` がエラーなし

### ドキュメント要件

- [ ] `implementation-guide.md` の AC-2 が PASS に昇格している
- [ ] 「残課題」セクションから `TASK-P0-09-U1` が除去されている
- [ ] 本仕様書のステータスが「完了」になっている

---

## 6. 検証方法

### テストケース

| テストケース                                                   | 期待結果                                           |
| -------------------------------------------------------------- | -------------------------------------------------- |
| `execute` phase / Write / `file_path` が `allowedSkillRoot` 外 | `deny`                                             |
| `execute` phase / Write / `file_path` が `allowedSkillRoot` 内 | `allow`                                            |
| `execute` phase / Write / `file_path` なし                     | tool-level 判定のみ（Write は execute では allow） |
| `execute` phase / Write / `allowedSkillRoot` 未設定            | `allow`（path 制約なし）                           |
| `improve` phase / Edit / `path` が `allowedSkillRoot` 外       | `deny`                                             |
| `improve` phase / Edit / `path` が `allowedSkillRoot` 内       | `allow`                                            |
| `execute` phase / `NotebookEdit`                               | `deny`（disallowedTools による）                   |

### 検証手順

```bash
# テスト実行
pnpm --filter @repo/desktop test

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

---

## 7. リスクと対策

| リスク                                                                     | 影響度 | 発生確率 | 対策                                                                                                            |
| -------------------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------- |
| SDK バージョンによる input キー名の揺れ                                    | 中     | 中       | `file_path` → `path` の fallback 順序で対応。それでも取得できない場合は context なし扱い                        |
| `allowedSkillRoot` が `undefined` の場合に意図せず path 制約が有効化される | 高     | 低       | `context` を渡すのは `targetPath` が取得できた場合のみに限定する                                                |
| `improve` への `canUseTool` 追加が既存テストを破壊する                     | 中     | 低       | Phase 4 で Red テストを先に作成し、既存テストへの影響を Phase 5 実装前に確認する                                |
| 判定ロジック層（`evaluateContextPolicy`）を誤って変更する                  | 高     | 低       | 変更対象を `RuntimeSkillCreatorFacade.ts` のみに限定し、 `SkillCreatorPermissionPolicy.ts` は読み取り専用とする |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                    | パス                                                                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| TASK-P0-09 実装ガイド           | `docs/30-workflows/skill-creator-agent-sdk-lane/step-10-seq-task-p0-09-claude-sdk-permission-hooks-governance/outputs/phase-12/implementation-guide.md`      |
| unassigned-task-detection       | `docs/30-workflows/skill-creator-agent-sdk-lane/step-10-seq-task-p0-09-claude-sdk-permission-hooks-governance/outputs/phase-12/unassigned-task-detection.md` |
| SkillCreatorPermissionPolicy.ts | `apps/desktop/src/main/services/runtime/governance/SkillCreatorPermissionPolicy.ts`                                                                          |
| SkillCreatorHooksFactory.ts     | `apps/desktop/src/main/services/runtime/governance/SkillCreatorHooksFactory.ts`                                                                              |
| RuntimeSkillCreatorFacade.ts    | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                                                                        |

### 参考資料

- Claude Agent SDK permissions: `https://platform.claude.com/docs/fr/agent-sdk/permissions`
- TASK-P0-09 Phase 1 requirements: `docs/30-workflows/skill-creator-agent-sdk-lane/step-10-seq-task-p0-09-claude-sdk-permission-hooks-governance/phase-1-requirements.md`

---

## 9. 備考

### 苦戦箇所の原文（unassigned-task-detection.md より）

```
| `TASK-P0-09-U1` | follow-up | `execute` / 将来の `improve` で `targetPath` と `allowedSkillRoot` を
SDK callback へ接続し、path-scoped deny を runtime で有効化する | 高 |
未タスクとして formalize し、close-out 文書と AC 表現を current facts へ同期 |
```

### 補足事項

- `SkillCreatorPermissionPolicy.evaluateContextPolicy()` は**既に正しく実装されている**。このタスクで変更してはならない。
- `createExecuteGovernanceCanUseTool()` は private メソッドであるため、外部 API の breaking change は発生しない。
- `improve` phase は現在 LLM が改善提案を生成するだけで、`SkillExecutor.execute()` は呼んでいない。ただし将来 `improve` で `execute` 相当の処理が追加される可能性があるため、同様の `canUseTool` 配線を先行して追加しておく。
