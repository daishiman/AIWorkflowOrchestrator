# createSkill AbortSignal サポート追加 - タスク指示書

## メタ情報

```yaml
issue_number: 2350
```

## メタ情報

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| タスクID     | UT-CANCEL-004-01                                                   |
| タスク名     | createSkill AbortSignal サポート追加                               |
| 分類         | 改善（imp）                                                        |
| 対象機能     | skill-creator キャンセル機能（Renderer Store 層 AbortSignal 伝播） |
| 優先度       | 中                                                                 |
| 見積もり規模 | 小規模                                                             |
| ステータス   | 未実施                                                             |
| 発見元       | TASK-SW-CANCEL-004 Phase 12 未タスク検出レポート                   |
| 発見日       | 2026-04-20                                                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

skill-creator のキャンセル機能は以下のチェーンで段階的に構築されてきた：

| タスク                                | 層                              | 状態      |
| ------------------------------------- | ------------------------------- | --------- |
| TASK-SW-CANCEL-001                    | Main: AbortController 基盤      | ✅ 完了   |
| TASK-SW-CANCEL-002                    | Main: cancelCurrentOperation()  | ✅ 完了   |
| TASK-SW-CANCEL-003                    | Main: IPC ハンドラ登録          | ✅ 完了   |
| TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 | Main: private workflow 入口保証 | ✅ 完了   |
| TASK-SW-CANCEL-004                    | Renderer: IPC E2E 接続確認      | ✅ 完了   |
| **UT-CANCEL-004-01（本タスク）**      | **Renderer Store: signal 引数** | 🔲 未完成 |

TASK-SW-CANCEL-004 の Pattern B 実装では `useCancelGeneration.startGeneration()` が Renderer 内の `AbortController` を初期化する。しかし `agentSlice.createSkill()` の関数シグネチャに `signal` 引数が存在しないため、初期化した AbortController は `createSkill` を通じて IPC 呼び出し層に到達しない。

### 1.2 問題点・課題

**現状の断絶箇所:**

```
[初期化済み層]
Renderer hooks: useCancelGeneration.startGeneration() → AbortController 生成

[未接続層]
Renderer store: createSkill(description, options, context?) → signal なし
Preload IPC: window.electronAPI.skill.create({...}) → signal 渡せない
```

`SkillCreateWizard.tsx` の `handleGenerate` は `startGeneration()` で signal を初期化するが、直後に呼ぶ `createSkill()` に signal を渡す経路がない。結果として Main 側の AbortController（TASK-SW-CANCEL-001〜003 で構築）には到達するが、Renderer 側の AbortSignal は生成処理に参加していない。

### 1.3 放置した場合の影響

- Renderer 側の `AbortSignal` コントラクトが形骸化し、将来の開発者が「なぜ signal を渡さないのか」と混乱する
- IPC経由でのキャンセル（Main層 cancelCurrentOperation）は動作するが、Renderer から直接制御する経路が確立されない
- `startGeneration()` の返り値 `AbortSignal` が実質的に使われず、API 設計として不整合を生じる

---

## 2. 何を達成するか（What）

### 2.1 目的

`agentSlice.createSkill()` に `signal?: AbortSignal` 引数を追加し、Renderer 内で生成した AbortSignal を IPC 呼び出しまで透過的に渡せるようにする。

### 2.2 最終ゴール

以下の signal 伝播チェーンが完成している状態：

```
SkillCreateWizard.handleGenerate()
  → useCancelGeneration.startGeneration() → AbortSignal 取得
  → createSkill(description, options, context, signal)  ← signal 追加
  → window.electronAPI.skill.create({..., signal})       ← signal 渡す
```

### 2.3 スコープ

#### 含むもの

- `agentSlice.ts` の `createSkill` 型定義・実装への `signal?: AbortSignal` 追加
- `SkillCreateWizard.tsx` の `handleGenerate` での signal 取得・受け渡し実装
- `createSkill` の型シグネチャ更新（インターフェース定義）
- 既存テストの非回帰確認

#### 含まないもの

- Preload IPC ブリッジ層の変更（`window.electronAPI.skill.create` のシグネチャ変更は別タスク）
- Main 側の AbortController との接続（TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 で完了済み）
- 新規テストの追加（既存 E2E テスト TC-E2E-02 で確認可能な範囲）

### 2.4 成果物

- 修正済み `apps/desktop/src/renderer/store/slices/agentSlice.ts`
- 修正済み `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SW-CANCEL-004 が完了していること（`useCancelGeneration.startGeneration()` が実装済み）
- `useCancelGeneration` フックが `{ startGeneration, cancelGeneration }` を返すこと

### 3.2 依存タスク

| タスクID                              | 内容                           | 状態    |
| ------------------------------------- | ------------------------------ | ------- |
| TASK-SW-CANCEL-004                    | startGeneration() 実装         | ✅ 完了 |
| TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 | Main private workflow 入口保証 | ✅ 完了 |

### 3.3 必要な知識

- Zustand slice パターン（`StateCreator` 型定義と実装の更新方法）
- `AbortSignal` / `AbortController` の基本（signal は読み取り専用、controller.abort() で中断指示）
- `SkillCreateWizard.tsx` の `handleGenerate` フロー（現在 `startGeneration()` を呼んでいるが戻り値を使っていない）

### 3.4 推奨アプローチ

**Step 1**: `agentSlice.ts` の型インターフェース（createSkill の定義）に `signal?: AbortSignal` を追加

**Step 2**: 実装側（同ファイル line 1200付近）のシグネチャに `signal?: AbortSignal` を追加し、`window.electronAPI.skill.create()` の引数に含める

**Step 3**: `SkillCreateWizard.tsx` の `handleGenerate` で `startGeneration()` の戻り値（AbortSignal）を受け取り、`createSkill()` に渡す

---

## 4. 実行手順

### Phase構成

| Phase | 名称         | 目的                                |
| ----- | ------------ | ----------------------------------- |
| 1     | 実装         | agentSlice + SkillCreateWizard 修正 |
| 2     | 検証         | 型チェック・既存テスト確認          |
| 3     | ドキュメント | Phase 12 更新                       |

### Phase 1: 実装

#### 目的

`createSkill` に `signal` 引数を追加し、呼び出し側で渡す

#### 手順

1. `apps/desktop/src/renderer/store/slices/agentSlice.ts` を開く
2. `createSkill` の型定義（line 369付近）に `signal?: AbortSignal` を第4引数として追加
3. `createSkill` の実装（line 1200付近）に同様の `signal?: AbortSignal` を追加
4. `window.electronAPI.skill.create(...)` の引数オブジェクトに `signal` を含める
5. `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` を開く
6. `handleGenerate` 内の `const { cancelGeneration, startGeneration } = useCancelGeneration()` を確認
7. `startGeneration()` の戻り値を `const signal = startGeneration()` として受け取る
8. `createSkill(description, options, context, signal)` として signal を渡す

#### 成果物

修正された `agentSlice.ts` と `SkillCreateWizard.tsx`

#### 完了条件

- TypeScript の型エラーがないこと（`pnpm typecheck`）
- `createSkill` の型定義と実装が一致していること

### Phase 2: 検証

#### 目的

型安全性と既存テストの非回帰を確認

#### 手順

1. `pnpm --filter @repo/desktop typecheck` を実行し型エラーがないことを確認
2. 既存の cancel 関連テスト（`useCancelGeneration.e2e.test.ts`）が通ることを確認
3. TC-E2E-02: `startGeneration()` → `cancelGeneration()` フロー全体で signal が適切に流れることを確認

#### 成果物

型チェック結果・テスト実行結果

#### 完了条件

- `pnpm typecheck` がエラーなしで完了
- 既存 cancel テストが全て PASS

### Phase 3: ドキュメント

#### 目的

Phase 12 成果物の更新

#### 手順

1. このタスクの Phase 12 成果物（implementation-guide.md 等）を作成
2. `docs/30-workflows/unassigned-task/task-ut-cancel-004-01-create-skill-abort-signal.md` を完了済みとしてステータス更新

#### 成果物

Phase 12 ドキュメント一式

#### 完了条件

Phase 12 必須5ファイルが作成済み

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `agentSlice.createSkill()` が `signal?: AbortSignal` を第4引数として受け取る
- [ ] 受け取った signal が `window.electronAPI.skill.create()` に渡される
- [ ] `SkillCreateWizard.handleGenerate()` が `startGeneration()` の戻り値を `createSkill` に渡す

### 品質要件

- [ ] `pnpm typecheck` がエラーなしで完了
- [ ] 既存の cancel E2E テストが全て PASS
- [ ] `createSkill` の型定義（インターフェース）と実装のシグネチャが一致

### ドキュメント要件

- [ ] Phase 12 の implementation-guide.md が作成済み
- [ ] このタスク仕様書のステータスが「完了」に更新済み

---

## 6. 検証方法

### テストケース

| ID        | 内容                                                      | 検証方法         |
| --------- | --------------------------------------------------------- | ---------------- |
| TC-01     | `createSkill` に signal を渡した場合に IPC 引数に含まれる | ユニットテスト   |
| TC-02     | signal が undefined の場合も従来どおり動作する            | 既存テストで確認 |
| TC-E2E-02 | `startGeneration()` → `cancelGeneration()` フロー         | 既存 E2E テスト  |

### 検証手順

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# cancel 関連テスト実行
pnpm --filter @repo/desktop test -- useCancelGeneration
```

---

## 7. リスクと対策

| リスク                                       | 影響度 | 発生確率 | 対策                                                                       |
| -------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------- |
| Preload IPC が signal を受け取れない型エラー | 中     | 中       | `window.electronAPI.skill.create` の型定義を確認し、必要なら別タスクで対応 |
| startGeneration() の戻り値の型が不明         | 低     | 低       | `useCancelGeneration` の戻り値型を確認してから実装                         |
| 既存の createSkill 呼び出し元の型エラー      | 中     | 低       | signal はオプショナル引数のため既存コードへの影響は最小限                  |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                     | パス                                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| TASK-SW-CANCEL-004 Phase 12 未タスク検出レポート | `docs/30-workflows/TASK-SW-CANCEL-004/outputs/phase-12/unassigned-task-detection.md`              |
| useCancelGeneration フック                       | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`                                          |
| agentSlice（対象ファイル）                       | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                            |
| SkillCreateWizard（対象ファイル）                | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                |
| 完了済み関連タスク                               | `docs/30-workflows/completed-tasks/TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001/`                        |
| キャンセルチェーン lessons learned               | `.claude/skills/aiworkflow-requirements/references/lessons-learned-skill-creator-cancel-chain.md` |

### 参考資料

- [MDN AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
- Zustand StateCreator パターン: `apps/desktop/src/renderer/store/slices/` 内の既存 slice

---

## 9. 備考

### 苦戦箇所【記入必須】

TASK-SW-CANCEL-004 での苦戦箇所（このタスクの前提知識として記録）：

| 項目     | 内容                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| 症状     | Pattern B（Renderer 側 AbortController 初期化）の実装範囲が不明確で、どこまで実装すべきか判断に時間を要した   |
| 原因     | Renderer/Store/Action/API の4層にまたがる AbortSignal 契約が文書化されておらず、各層の責任境界が不明確だった  |
| 対応     | 「IPC cancel（Main層）は既に動作する」実用性を優先し、signal の層間整合は別タスクとして切り出す判断を採択した |
| 再発防止 | AbortSignal を導入する際は最初から「どの層まで透過させるか」の契約を設計ドキュメントに明記する                |

### 補足事項

`window.electronAPI.skill.create()` の型定義（Preload ブリッジ）が `signal` を受け入れない場合、別途 Preload 側の型拡張タスクが必要になる可能性がある。その場合は本タスクのスコープを「agentSlice の signal 引数追加のみ」に絞り、Preload 側は別タスクとして管理すること。
