# エラーメッセージ一元管理 - タスク指示書

## メタ情報

| 項目             | 内容                          |
| ---------------- | ----------------------------- |
| タスクID         | DEBT-CODE-002                 |
| タスク名         | エラーメッセージ一元管理      |
| 分類             | リファクタリング              |
| 対象機能         | OAuth認証（Desktop）          |
| 優先度           | 低                            |
| 見積もり規模     | 小規模                        |
| ステータス       | 未実施                        |
| 発見元           | Phase 7（最終レビューゲート） |
| 発見日           | 2025-12-22                    |
| 発見エージェント | .claude/agents/code-quality.md                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在の認証関連エラーメッセージは、各ファイルに直接記述されており、一貫性の確保や国際化対応が困難です。

ログイン機能復旧プロジェクト（2025-12-22完了）の最終レビューゲートで、.claude/agents/code-quality.mdがエラーメッセージ の一元管理を推奨しました。

### 1.2 問題点・課題

**現在の実装状態**:

```typescript
// authHandlers.tsに直接記述
console.error("[Auth] OAuth initiation failed:", error.message);

// index.tsに直接記述
console.error("[Auth] Invalid state parameter");

// AuthGuardに直接記述
<p>認証に失敗しました。もう一度お試しください。</p>
```

**問題点**:

- エラーメッセージが各ファイルに散在
- 同じ意味のエラーでメッセージが微妙に異なる
- 国際化（i18n）対応が困難
- メッセージ修正時に複数ファイルを変更する必要

### 1.3 放置した場合の影響

| 影響領域     | 影響度 | 説明                               |
| ------------ | ------ | ---------------------------------- |
| 保守性       | Medium | エラーメッセージ修正時の手間が増加 |
| 国際化対応   | Medium | 将来的な多言語対応が困難           |
| ユーザー体験 | Low    | メッセージの一貫性不足             |
| コード品質   | Low    | DRY原則違反                        |

---

## 2. 何を達成するか（What）

### 2.1 目的

エラーメッセージを定数ファイルに一元管理し、保守性と国際化対応を向上させる。

### 2.2 最終ゴール

- ✅ エラーメッセージ定数ファイル作成
- ✅ エラーコードとメッセージのマッピング
- ✅ 既存コードのエラーメッセージを定数参照に置き換え
- ✅ 型安全なエラーメッセージ取得関数の実装

### 2.3 スコープ

#### 含むもの

- エラーメッセージ定数ファイル作成（errors.ts）
- 既存ファイルのリファクタリング
- エラーコード体系の定義
- 国際化準備（構造整備）

#### 含まないもの

- 実際の多言語翻訳（将来対応）
- エラーUI/UXの改善（UX-001として別タスク）
- エラーログの構造化（DEBT-CODE-001として別タスク）

### 2.4 成果物

| 種別 | 成果物               | 配置先                                            |
| ---- | -------------------- | ------------------------------------------------- |
| 実装 | エラーメッセージ定数 | `apps/desktop/src/renderer/constants/errors.ts`   |
| 実装 | authHandlers.ts修正  | `apps/desktop/src/main/ipc/authHandlers.ts`       |
| 実装 | index.ts修正         | `apps/desktop/src/main/index.ts`                  |
| 実装 | AuthGuard修正        | `apps/desktop/src/renderer/components/AuthGuard/` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] ログイン機能復旧プロジェクト（T-02-1〜T-09-1）が完了していること
- [ ] 既存の認証コードが正常に動作していること

### 3.2 依存タスク

**先に完了している必要があるタスク**:

- T-04-1: AuthGuard実装（完了済み）

**同時実施可能なタスク**:

- DEBT-CODE-001（構造化ログ）
- すべてのセキュリティ関連タスク

### 3.3 必要な知識・スキル

- TypeScript定数定義
- DRY原則
- エラーコード体系設計
- 国際化（i18n）の基礎知識

### 3.4 推奨アプローチ

1. **階層的エラーコード**: AUTH.LOGIN.FAILED のような階層構造
2. **型安全性**: TypeScriptの型システムで不正なエラーコードを防止
3. **拡張性**: 将来的な国際化対応を考慮した構造

---

## 4. 実行手順

### Phase構成

```
Phase 1: エラーメッセージ定数ファイル作成
  ↓
Phase 2: 既存コードのリファクタリング
  ↓
Phase 3: テスト実行確認
  ↓
Phase 4: ドキュメント更新
```

---

### Phase 1: エラーメッセージ定数ファイル作成

#### 目的

エラーコードとメッセージを定義した定数ファイルを作成する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@code-quality エラーメッセージ定数ファイルを作成してください。

要件:
- エラーコードの階層定義（AUTH.LOGIN.FAILED等）
- エラーメッセージのマッピング
- 型安全なgetErrorMessage()関数
- 国際化対応の構造（将来対応）

ファイル: apps/desktop/src/renderer/constants/errors.ts（新規）
```

#### 使用エージェント

- **エージェント**: .claude/agents/code-quality.md
- **選定理由**: コード品質改善の専門家。DRY原則に基づくリファクタリングに最適。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名               | 活用方法                               |
| ---------------------- | -------------------------------------- |
| .claude/skills/clean-code-practices/SKILL.md   | DRY原則に基づく定数ファイル設計        |
| .claude/skills/refactoring-techniques/SKILL.md | エラーメッセージ一元化リファクタリング |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物               | パス                                            | 内容                         |
| -------------------- | ----------------------------------------------- | ---------------------------- |
| エラーメッセージ定数 | `apps/desktop/src/renderer/constants/errors.ts` | エラーコード・メッセージ定義 |

#### 完了条件

- [ ] errors.ts実装完了
- [ ] エラーコード体系定義完了
- [ ] getErrorMessage()関数実装完了
- [ ] TypeScript型定義完了

---

### Phase 2: 既存コードのリファクタリング

#### 目的

既存の直接記述されたエラーメッセージを定数参照に置き換える。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@code-quality 認証関連ファイルのエラーメッセージを定数参照に置き換えてください。

対象ファイル:
- apps/desktop/src/main/ipc/authHandlers.ts
- apps/desktop/src/main/index.ts
- apps/desktop/src/renderer/components/AuthGuard/
- apps/desktop/src/renderer/views/AuthView/

置き換え方針:
- import { AUTH_ERRORS } from "../../constants/errors"
- 直接記述を定数参照に変更
```

#### 使用エージェント

- **エージェント**: .claude/agents/code-quality.md
- **選定理由**: リファクタリングの専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名               | 活用方法                                 |
| ---------------------- | ---------------------------------------- |
| .claude/skills/refactoring-techniques/SKILL.md | エラーメッセージ置き換えリファクタリング |
| .claude/skills/clean-code-practices/SKILL.md   | DRY原則の適用                            |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物              | パス                                              | 内容                     |
| ------------------- | ------------------------------------------------- | ------------------------ |
| authHandlers.ts修正 | `apps/desktop/src/main/ipc/authHandlers.ts`       | エラーメッセージ定数参照 |
| index.ts修正        | `apps/desktop/src/main/index.ts`                  | エラーメッセージ定数参照 |
| AuthGuard修正       | `apps/desktop/src/renderer/components/AuthGuard/` | エラーメッセージ定数参照 |

#### 完了条件

- [ ] 全ファイルのリファクタリング完了
- [ ] 直接記述のエラーメッセージがゼロ
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 3: テスト実行確認

#### 目的

リファクタリング後も全テストが成功することを確認する。

#### 実行コマンド

```bash
pnpm --filter @repo/desktop test:run
```

#### 完了条件

- [ ] 全テスト成功
- [ ] テストカバレッジ維持（85%以上）
- [ ] ESLint/TypeScriptエラーゼロ

---

### Phase 4: ドキュメント更新

#### 目的

ディレクトリ構造ドキュメントにエラーメッセージ定数ファイルを追加する。

#### 更新対象

`docs/00-requirements/04-directory-structure.md`

**更新箇所**: 4.5.3 renderer/（React UI）

```markdown
| constants/errors.ts | エラーメッセージ定数定義 |
```

#### 完了条件

- [ ] ディレクトリ構造ドキュメント更新完了

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] エラーメッセージ定数ファイル作成完了
- [ ] エラーコード体系定義完了
- [ ] 既存コードのリファクタリング完了

### 品質要件

- [ ] 全テスト成功
- [ ] テストカバレッジ維持
- [ ] ESLint/TypeScriptエラーゼロ
- [ ] 直接記述のエラーメッセージがゼロ

### ドキュメント要件

- [ ] ディレクトリ構造ドキュメント更新完了

---

## 6. 検証方法

### テストケース

#### リファクタリング検証

1. 全自動テストが成功する
2. エラーメッセージが正しく表示される
3. エラーコードが正しくマッピングされる

### 検証手順

```bash
# 全テスト実行
pnpm --filter @repo/desktop test:run

# 手動確認：エラーメッセージ表示確認
pnpm --filter @repo/desktop preview
# DevToolsで意図的にエラーを発生させ、メッセージを確認
```

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                         | 対応サブタスク |
| -------------------------- | ------ | -------- | ---------------------------- | -------------- |
| エラーコード漏れ           | Low    | Medium   | 全ファイルをGrep検索して確認 | Phase 2        |
| リファクタリングでバグ混入 | Medium | Low      | テスト実行で検証             | Phase 3        |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/login-recovery/step11-final-review.md` - 最終レビュー結果
- `docs/00-requirements/04-directory-structure.md` - ディレクトリ構造

### 参考資料

- [DRY Principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- [i18n Best Practices](https://www.i18next.com/principles/fallback)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
@code-quality:
"エラーメッセージが各ファイルに散在しています。
 定数ファイルに一元管理することで、保守性と国際化対応が向上します。"
```

### 補足事項

- 将来的な多言語対応を考慮した構造にする
- エラーコードは一意で、階層的な命名規則を採用
- ユーザーに表示するメッセージと、ログに出力するメッセージを分離することも検討
