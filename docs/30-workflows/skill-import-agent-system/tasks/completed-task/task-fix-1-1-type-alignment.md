# 型定義統一 - タスク指示書

## メタ情報

| 項目         | 内容                               |
| ------------ | ---------------------------------- |
| タスクID     | TASK-FIX-1-1-TYPE-ALIGNMENT        |
| タスク名     | スキル型定義の統一（仕様書準拠）   |
| 分類         | リファクタリング                   |
| 対象機能     | スキル管理・実行機能全体           |
| 優先度       | 高                                 |
| 見積もり規模 | 中規模                             |
| ステータス   | 未実施                             |
| 発見元       | 無限ループ問題調査（Phase 12相当） |
| 発見日       | 2026-02-03                         |
| 関連Phase    | Phase 1（TASK-1-1の前提修正）      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

無限ループ問題の調査中に、スキル関連の型定義が複数箇所で重複・矛盾していることが発見された。仕様書（`skill-import-agent-system/specification.md`）では単一の`SkillMetadata`型を使用する設計だが、現在の実装では3種類の型が混在している。

### 1.2 問題点・課題

| 問題                                                   | 影響                                          |
| ------------------------------------------------------ | --------------------------------------------- |
| `Skill`, `ImportedSkill`, `SkillMetadata`の3種類が混在 | どの型を使うべきか不明確                      |
| `SkillStreamMessage`が2箇所で異なる定義                | `type`値が互換性なし（"text" vs "assistant"） |
| 型定義が`@repo/shared`とdesktop両方に存在              | 変更時の同期漏れリスク                        |

**SkillStreamMessageの型定義矛盾**:

```typescript
// skill-execution.ts
type: "text" | "tool_use" | "error" | "complete";

// skill.ts
type: "assistant" | "tool_use" | "tool_result" | "status" | "error";
```

### 1.3 放置した場合の影響

- 新機能追加時に誤った型を使用するリスク
- ストリームメッセージ処理でのランタイムエラー
- TASK-1-1（共通型定義）実行時に混乱が発生

---

## 2. 何を達成するか（What）

### 2.1 目的

仕様書に準拠した単一の型定義体系を確立する。

### 2.2 最終ゴール

1. `@repo/shared/src/types/skill.ts`に全スキル型を集約
2. `SkillStreamMessage`の定義を単一化
3. 不要な型定義ファイルを削除

### 2.3 スコープ

#### 含むもの

- `Skill`, `ImportedSkill`, `SkillMetadata`の統合
- `SkillStreamMessage`の定義統一
- `SkillExecutionRequest`, `SkillExecutionResponse`の整理
- 呼び出し元の型参照修正

#### 含まないもの

- 新しい型の追加（それはTASK-1-1で実施）
- ロジックの変更

### 2.4 成果物

| 成果物                 | 説明                              |
| ---------------------- | --------------------------------- |
| 統一された型定義       | `@repo/shared/src/types/skill.ts` |
| 削除対象ファイルリスト | 重複型定義ファイル                |
| 型参照修正リスト       | import文の変更一覧                |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 現在の型使用箇所を全て特定していること
- `@repo/shared`のビルドが成功すること

### 3.2 依存タスク

- なし（他の全タスクの前提）

### 3.3 必要な知識

- TypeScript型定義
- モノレポ構成（pnpm workspace）
- Electron IPC通信

### 3.4 推奨アプローチ

1. 仕様書（specification.md §4）の型定義を正とする
2. 既存の重複定義を特定
3. `@repo/shared`に集約
4. 呼び出し元を一括修正

---

## 4. 実行手順

### Phase構成

Phase 1-13の標準フローに従う。

### Step 1: 型定義の棚卸し

#### 目的

現在の型定義の全容を把握

#### 手順

1. `grep -rn "type Skill\|interface Skill" packages/ apps/`で定義箇所を特定
2. `grep -rn "SkillStreamMessage" packages/ apps/`で使用箇所を特定
3. 重複・矛盾をリストアップ

#### 成果物

- 型定義棚卸しリスト

### Step 2: 正となる型定義の決定

#### 目的

仕様書に基づく正しい型定義を確定

#### 手順

1. `specification.md`の§4（型定義）を読む
2. 正となる型定義を確定
3. 削除対象を特定

#### 成果物

- 正となる型定義仕様

### Step 3: @repo/sharedへの集約

#### 目的

型定義を単一ファイルに集約

#### 手順

1. `@repo/shared/src/types/skill.ts`を更新
2. 重複定義を削除
3. ビルド確認（`pnpm --filter @repo/shared build`）

#### 成果物

- 統一された`skill.ts`

### Step 4: 呼び出し元の修正

#### 目的

全ての型参照を新しい定義に向ける

#### 手順

1. import文を`@repo/shared`からの参照に変更
2. TypeScriptコンパイル確認
3. テスト実行

#### 成果物

- 修正されたimport文

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SkillStreamMessage`が単一定義
- [ ] `Skill`型が`@repo/shared`のみに存在
- [ ] 重複型定義ファイルが削除されている

### 品質要件

- [ ] TypeScriptコンパイルエラーなし
- [ ] 全テストがPASS
- [ ] `pnpm typecheck`がPASS

### ドキュメント要件

- [ ] 型定義変更の記録

---

## 6. 検証方法

### テストケース

1. `pnpm --filter @repo/shared build`が成功
2. `pnpm typecheck`がエラーなし
3. 既存の単体テストが全てPASS

### 検証手順

1. ビルド実行
2. 型チェック実行
3. テスト実行

---

## 7. リスクと対策

| リスク         | 影響度 | 発生確率 | 対策                       |
| -------------- | ------ | -------- | -------------------------- |
| 型の互換性破壊 | 高     | 中       | 段階的に移行、テストで検証 |
| import漏れ     | 中     | 中       | grepで全使用箇所を特定     |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-import-agent-system/specification.md` §4（型定義）
- `packages/shared/src/types/skill.ts`
- `packages/shared/src/types/skill-execution.ts`

### 参考資料

- TypeScript Handbook - Utility Types

---

## 9. 備考

### 発見経緯

無限ループ問題の調査中に、`SkillStreamMessage`型の矛盾（`type: "text"` vs `type: "assistant"`）を発見。これが状態管理の不整合を引き起こしていた。

### 補足事項

このタスクはTASK-1-1（共通型定義）の前提となる修正タスク。TASK-1-1では新しい型を追加するが、本タスクでは既存の重複を解消する。
