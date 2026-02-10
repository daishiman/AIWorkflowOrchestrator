# AgentView型アサーション解消 - タスク指示書

## メタ情報

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | UT-FIX-5-1-001                                                             |
| タスク名     | AgentView型アサーション解消                                                |
| 分類         | 改善（型安全性向上）                                                       |
| 対象機能     | AgentView コンポーネント                                                   |
| 優先度       | 中                                                                         |
| 見積もり規模 | 小規模                                                                     |
| ステータス   | 未実施                                                                     |
| 発見元       | Phase 10（TASK-FIX-5-1最終レビュー MINOR指摘）+ コードベースTODOコメント   |
| 発見日       | 2026-02-06                                                                 |
| 関連タスク   | TASK-FIX-5-1-SKILL-API-UNIFICATION, TASK-FIX-6-1（状態管理変更で包含予定） |
| issue_number | 754                                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-5-1-SKILL-API-UNIFICATIONにて、SkillAPIの二重定義（`window.skillAPI` + `window.electronAPI.skill`）を `window.electronAPI.skill` に統一した。統一後のAPIは `SkillMetadata[]` および `ImportedSkill` 型を返すが、AgentViewの既存コードは旧 `Skill` 型を前提としたagentSliceに依存している。

### 1.2 問題点・課題

- `apps/desktop/src/renderer/views/AgentView/index.tsx` の2箇所で `as unknown as Skill[]` 型アサーションが使用されている
- agentSliceが `Skill` 型を使用しているが、統一APIは `SkillMetadata`/`ImportedSkill` を返す
- 型アサーションにより、型システムの保護が無効化されている

### 1.3 放置した場合の影響

- **実行時影響なし**: 現在のSkillMetadataとSkillは互換性があるため動作に問題はない
- 型の不整合により、将来のフィールド変更時にコンパイルエラーで検出できないリスク
- コードレビュー時に型安全性の懸念が繰り返し指摘される可能性

---

## 2. 何を達成するか（What）

### 2.1 目的

AgentViewおよびagentSliceの型定義を `SkillMetadata`/`ImportedSkill` に移行し、`as unknown as Skill[]` 型アサーションを解消する。

### 2.2 最終ゴール

- AgentViewから `as unknown as Skill[]` アサーションが0件
- agentSliceが `SkillMetadata`/`ImportedSkill` 型を直接使用
- 全テストがPASSを維持
- TypeScript型チェック（tsc）がエラー0件

### 2.3 スコープ

| 範囲   | 内容                                                   |
| ------ | ------------------------------------------------------ |
| 対象内 | AgentView型アサーション解消、agentSlice型定義移行      |
| 対象外 | 新機能の追加、他コンポーネントの型修正、UIデザイン変更 |

### 2.4 成果物

| 成果物         | 説明                                            |
| -------------- | ----------------------------------------------- |
| 修正コード     | AgentView、agentSliceの型定義移行               |
| テスト更新     | 型変更に伴うテストファイル更新                  |
| Phase 12成果物 | 実装ガイド、仕様書更新、documentation-changelog |

---

## 3. どのように実装するか（How）

### 3.1 前提条件

- TASK-FIX-5-1-SKILL-API-UNIFICATION が完了していること（完了済み）
- `window.electronAPI.skill` が単一公開ポイントとして動作していること
- `SkillMetadata` / `ImportedSkill` 型が `packages/shared` で定義されていること

### 3.2 修正対象ファイル

| ファイル                                       | 修正内容                                           |
| ---------------------------------------------- | -------------------------------------------------- |
| `renderer/views/AgentView/index.tsx`           | `as unknown as Skill[]` アサーションを削除         |
| `renderer/store/slices/agentSlice.ts`          | `Skill` → `SkillMetadata`/`ImportedSkill` 型に変更 |
| `renderer/store/slices/agentSlice.ts` (テスト) | 型変更に伴うテスト更新                             |

### 3.3 推奨アプローチ

1. agentSliceの状態型定義で `Skill` → `SkillMetadata` に変更
2. agentSliceのアクションで使用する型を更新
3. AgentViewの型アサーションを削除
4. AgentViewが使用するプロパティが `SkillMetadata` に存在することを確認
5. 関連テストの型を更新
6. tsc 0エラー、全テストPASSを確認

### 3.4 システム仕様書参照

| 仕様書                                    | 参照内容                                           |
| ----------------------------------------- | -------------------------------------------------- |
| `interfaces-agent-sdk-skill.md`           | Preload API定義、SkillMetadata/ImportedSkill型仕様 |
| `architecture-implementation-patterns.md` | SkillAPI統一パターン S1（型アサーション残存問題）  |
| `arch-state-management.md`                | agentSlice、skillSlice の状態管理仕様              |
| `security-skill-ipc.md`                   | IPCチャンネル定義、contextBridge公開API            |

### 3.5 実装課題と解決策（TASK-FIX-5-1からの学び）

| 課題ID | 課題                                                                       | 解決策                                                   | 参照                                                                                                                                          |
| ------ | -------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| S1     | Store型（Skill）とPreload型（ImportedSkill）の不一致で型アサーションが必要 | 共有型を`@repo/shared`に配置し、両層から参照             | [P24: 06-known-pitfalls.md](../../../.claude/rules/06-known-pitfalls.md#p24-store-型定義と-preload-型定義の不統一)                            |
| S2     | 型統合時にimport文の一括置換で誤置換リスク                                 | 正規表現で厳密マッチ、置換後のTypeScript型チェックで検証 | [architecture-implementation-patterns.md](../../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md) |

#### 詳細説明

TASK-FIX-5-1実装時に遭遇した以下の課題は、本タスク実行時にも関連する可能性がある。

#### S1: 型アサーション残存問題（本タスクの直接原因）

| 項目 | 内容                                                                                             |
| ---- | ------------------------------------------------------------------------------------------------ |
| 問題 | API統一時、呼び出し側のStore型定義（agentSlice）まで影響範囲が波及したが、スコープに含めなかった |
| 教訓 | API統一時は呼び出し側のStore型定義まで影響範囲を調査し、スコープに含めるか明示的に判断する       |

#### S4: OperationResult廃止の影響波及

| 項目 | 内容                                                                                    |
| ---- | --------------------------------------------------------------------------------------- |
| 問題 | `OperationResult<T>` ラッパー廃止で8ファイルに影響が波及し、使用箇所が分散していた      |
| 教訓 | 型ラッパー廃止時は `grep -rn` で全使用箇所をリストアップし、段階的置換プランを策定する  |
| 適用 | 本タスクでagentSliceの `Skill` 型を変更する際も、全使用箇所を事前にリストアップすること |

#### S2: テストモック設計の全面的再構築

| 項目 | 内容                                                                                     |
| ---- | ---------------------------------------------------------------------------------------- |
| 問題 | パスエイリアス（`@/`）と相対パスの両方でモックが必要となり、テスト623行→1092行に膨張     |
| 教訓 | `vi.hoisted()` でモック巻き上げ + フィクスチャファクトリ関数でリセット可能なモックを生成 |
| 適用 | agentSliceテスト更新時、既存モックパターンに従い `vi.hoisted()` を使用すること           |

#### S5: PostToolUseフックによる仕様書編集の未永続化

| 項目 | 内容                                                                                                                |
| ---- | ------------------------------------------------------------------------------------------------------------------- |
| 問題 | PostToolUseフック（Prettier/ESLint）がファイルを自動修正し、Edit操作の `old_string` が不一致に。10件中8件が未永続化 |
| 教訓 | 大量編集後は `git diff --stat` で変更ファイル数と期待値の一致を検証する                                             |
| 参照 | 06-known-pitfalls.md P11、skill-creator/patterns.md セッション間編集永続化検証パターン                              |

---

## 4. 実行手順

### Phase 1-3: 要件定義・設計・レビュー

1. agentSliceの `Skill` 型使用箇所を全件リストアップ（`grep -rn "Skill" renderer/store/slices/agentSlice`）
2. `SkillMetadata` と `Skill` の型差分を特定
3. 影響範囲マッピング（AgentView、テストファイル）

### Phase 4-5: テスト作成・実装

1. agentSliceの状態型を `Skill[]` → `SkillMetadata[]` に変更
2. AgentViewの `as unknown as Skill[]` を削除
3. コンポーネントが参照するプロパティの整合性を確認
4. テストの型定義を更新

### Phase 6-9: テスト拡充・品質保証

1. tsc 0エラーを確認
2. 全テストPASSを確認
3. ESLint 0エラーを確認

### Phase 10-13: レビュー・ドキュメント

1. Phase 10最終レビュー
2. Phase 12ドキュメント更新（interfaces-agent-sdk-skill.md 型アサーション解消記録）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `as unknown as Skill[]` がAgentView内に0件
- [ ] agentSliceが `SkillMetadata`/`ImportedSkill` を直接使用
- [ ] AgentViewのUI表示が変更前と同一

### 品質要件

- [ ] TypeScript型チェック（tsc）がエラー0件
- [ ] 全テストがPASS
- [ ] ESLintエラー0件
- [ ] `grep -rn "as unknown as Skill"` が0件

### ドキュメント要件

- [ ] interfaces-agent-sdk-skill.md の型アサーション解消記録
- [ ] architecture-implementation-patterns.md の S1 完了記録

---

## 6. 検証方法

| テスト種別       | 検証内容                 | 実行コマンド                                           |
| ---------------- | ------------------------ | ------------------------------------------------------ |
| 型チェック       | tsc 0エラー              | `pnpm --filter @repo/desktop typecheck`                |
| 単体テスト       | agentSlice関連テストPASS | `pnpm --filter @repo/desktop test -- --run agentSlice` |
| コンポーネント   | AgentViewテストPASS      | `pnpm --filter @repo/desktop test -- --run AgentView`  |
| リグレッション   | 全テストPASS             | `pnpm --filter @repo/desktop test`                     |
| コード品質       | ESLint 0エラー           | `pnpm --filter @repo/desktop lint`                     |
| アサーション検出 | 型アサーション残存0件    | `grep -rn "as unknown as Skill" apps/desktop/src/`     |

---

## 7. リスクと対策

| リスク                               | 影響度 | 確率 | 対策                                              |
| ------------------------------------ | ------ | ---- | ------------------------------------------------- |
| SkillMetadataとSkillのプロパティ差異 | 中     | 低   | 事前に型差分を比較し、不足プロパティを特定        |
| agentSlice利用箇所の見落とし         | 中     | 低   | `grep -rn` で全使用箇所をリストアップ（S4の教訓） |
| テストモック更新の複雑化             | 低     | 中   | `vi.hoisted()` パターンに従う（S2の教訓）         |
| PostToolUseフックによる編集未永続化  | 中     | 低   | 編集後 `git diff --stat` で検証（S5/P11の教訓）   |

---

## 8. 参照情報

| 項目             | 内容                                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| 検出タスク       | TASK-FIX-5-1-SKILL-API-UNIFICATION Phase 10 MINOR指摘                                                                |
| 検出レポート     | `docs/30-workflows/completed-tasks/TASK-FIX-5-1-SKILL-API-UNIFICATION/outputs/phase-12/unassigned-task-detection.md` |
| 包含候補         | TASK-FIX-6-1（状態管理変更タスク）で実施予定                                                                         |
| Preload API仕様  | `interfaces-agent-sdk-skill.md` - SkillMetadata/ImportedSkill型定義                                                  |
| 実装パターン参照 | `architecture-implementation-patterns.md` - SkillAPI統一パターン                                                     |
| 苦戦箇所パターン | `skill-creator/references/patterns.md` - IPC Bridge APIテストモック設計パターン                                      |
| 既知の落とし穴   | `06-known-pitfalls.md` - P11: PostToolUseフックによるEdit失敗                                                        |

---

## 9. 備考

- 本タスクはTASK-FIX-6-1（状態管理変更）で包含して実施することを推奨
- Skill型とSkillMetadata型の差分が小さいため、移行リスクは低い
- TASK-FIX-5-1のPhase 10でMINOR判定のため、即時対応は不要
- Section 3.5の「実装課題と解決策」は、TASK-FIX-5-1で実際に遭遇した課題から抽出。同様のIPC Bridge統一・型移行作業時に参照すること
