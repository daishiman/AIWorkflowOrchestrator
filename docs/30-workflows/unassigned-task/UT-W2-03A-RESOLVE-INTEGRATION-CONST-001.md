# SkillCreateWizard 外部連携判定定数化 - タスク指示書

## メタ情報

```yaml
issue_number: 2048
task_id: UT-W2-03A-RESOLVE-INTEGRATION-CONST-001
status: open
priority: low
scale: small
task_type: REFACTOR
```

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | UT-W2-03A-RESOLVE-INTEGRATION-CONST-001                        |
| タスク名     | SkillCreateWizard 外部連携判定ロジックの定数化・共通化         |
| 分類         | 改善（リファクタリング）                                       |
| 対象機能     | SkillCreateWizard / CompleteStep / 外部連携判定ロジック        |
| 優先度       | 低（`priority:low`）                                           |
| 見積もり規模 | 小規模（`scale:small`）                                        |
| ステータス   | 未実施（`status:open`）                                        |
| 発見元       | W2-seq-03a Phase 12 スキルフィードバックレポート（2026-04-08） |
| 発見日       | 2026-04-08                                                     |
| タスク分類   | REFACTOR タスク（ロジック変更なし、構造改善のみ）              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

W2-seq-03a の実装で `resolveExternalIntegration()` 関数に外部連携ツール（Slack / GitHub / Notion）の判定ロジックが集約された。判定は `purpose.toLowerCase()` で行われており、ロジック自体は正しく動作している。

しかし現状、「表示名」（例: `"Slack"`）と「判定値」（例: `"slack"`）の対応関係がコード内にハードコードされており、対応表としての定数が存在しない。

### 1.2 問題点・課題

1. **ツール追加時の修正箇所が分散する**: 新しい外部連携ツール（例: `notion`, `jira`）を追加する際、判定ロジックと表示名の対応を各所で手動管理する必要がある。

2. **テスト記述が冗長になる**: テストケースでツール名の文字列を直接記述するため、タイポや大小文字ミスが発生しやすい。

3. **将来の i18n 対応時の障壁**: 表示名を国際化する際に、判定値と表示名の対応が定数として管理されていないと対応コストが高くなる。

### 1.3 放置した場合の影響

- Slack / GitHub / Notion 以外のツール（Jira, Confluence, Linear 等）を追加する際に、修正箇所の特定に時間がかかる。
- 定数なしでの文字列比較が増加し、タイポによるバグリスクが上がる。

---

## 2. 何を達成するか（What）

### 2.1 目的

`resolveExternalIntegration()` で使用するツール名の判定値と表示名の対応を定数として切り出し、ツール追加時に1箇所の修正で済む構造にする。

### 2.2 最終ゴール

- `EXTERNAL_INTEGRATION_MAP` のような定数（`Record<string, string>` または型付き配列）を定義し、判定ロジックと表示名の両方がこの定数から導出される。
- `resolveExternalIntegration()` が定数を参照する形になり、新ツール追加時は定数への追記のみで済む。

### 2.3 スコープ

#### 含むもの

- `SkillCreateWizard.tsx` 内の `resolveExternalIntegration()` 関数の定数化リファクタリング
- 定数の型定義
- 既存テストが引き続き PASS することの確認

#### 含まないもの

- 新規ツールの追加（定数化が目的であり、機能追加は別タスク）
- i18n 対応（別タスク）
- `inferSmartDefaults` の変更

### 2.4 成果物

| 種別 | ファイルパス                                                                      | 変更内容                                        |
| ---- | --------------------------------------------------------------------------------- | ----------------------------------------------- |
| 修正 | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                | `EXTERNAL_INTEGRATION_MAP` 定数追加、関数参照化 |
| 確認 | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` | 既存テスト PASS 確認（変更なし想定）            |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- W2-seq-03a が完了していること（`resolveExternalIntegration()` が実装済みであること）
- `pnpm install` が完了していること

### 3.2 依存タスク

| タスクID   | 状態 | 内容                                        |
| ---------- | ---- | ------------------------------------------- |
| W2-seq-03a | 完了 | `resolveExternalIntegration()` の初期実装元 |

### 3.3 必要な知識

- TypeScript の `const` アサーション（`as const`）と型推論
- `Object.keys()` / `Object.entries()` を使った定数からの動的ロジック生成
- React コンポーネント外への定数切り出しパターン

### 3.4 推奨アプローチ

```typescript
// 定数例
const EXTERNAL_INTEGRATION_MAP = {
  slack: "Slack",
  github: "GitHub",
  notion: "Notion",
} as const;

type ExternalIntegrationKey = keyof typeof EXTERNAL_INTEGRATION_MAP;

// resolveExternalIntegration 関数での利用
function resolveExternalIntegration(purpose: string): {
  hasExternal: boolean;
  toolName: string;
} {
  const lower = purpose.toLowerCase();
  const matched = (
    Object.keys(EXTERNAL_INTEGRATION_MAP) as ExternalIntegrationKey[]
  ).find((key) => lower.includes(key));
  return {
    hasExternal: !!matched,
    toolName: matched ? EXTERNAL_INTEGRATION_MAP[matched] : "",
  };
}
```

### 3.5 苦戦箇所（事前想定）

| 苦戦ポイント                | 詳細                                                         | 推奨対策                                                         |
| --------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| `as const` の型推論の複雑さ | `Object.keys()` の戻り値が `string[]` になり型安全性が下がる | キャスト `(Object.keys(...) as ExternalIntegrationKey[])` で対応 |
| 既存テストのツール名文字列  | テスト内の期待値文字列が定数と乖離しないか確認が必要         | 定数から期待値を導出するよう変更を検討                           |

---

## 4. 実行手順（Phase 1〜13）

### Phase 構成

| Phase | 名称             | ステータス | 概要                                             |
| ----- | ---------------- | ---------- | ------------------------------------------------ |
| 1     | 要件定義         | open       | 変更対象ファイル・受入条件確定                   |
| 2     | 設計             | open       | 定数構造・型定義・関数リファクタリング設計       |
| 3     | 設計レビュー     | open       | Phase 4 進行可否判定                             |
| 4     | テスト確認       | open       | 既存テストの網羅確認・追加テスト不要判定         |
| 5     | 実装             | open       | 定数切り出し・関数リファクタリング               |
| 6     | テスト拡充       | open       | 定数化後のエッジケース確認                       |
| 7     | カバレッジ確認   | open       | 変更ファイルの line/branch カバレッジ実測        |
| 8     | リファクタリング | open       | 命名整理・不要コード除去                         |
| 9     | 品質検証         | open       | typecheck / lint / test 通過確認                 |
| 10    | 最終レビュー     | open       | 受入条件チェック                                 |
| 11    | 手動テスト       | open       | REFACTOR タスクのため省略可（自動テストで代替）  |
| 12    | ドキュメント更新 | open       | 実装ガイド・未タスク検出・フィードバックレポート |
| 13    | PR 作成          | open       | ユーザー明示承認後のみ実施                       |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `EXTERNAL_INTEGRATION_MAP` 定数が `SkillCreateWizard.tsx` に定義されている
- [ ] `resolveExternalIntegration()` が定数を参照している
- [ ] 新ツール追加時に定数への追記のみで対応できる構造になっている

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop lint` が PASS
- [ ] `pnpm vitest run` で既存テストが全て PASS

---

## 6. 検証方法

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト
pnpm --filter @repo/desktop vitest run

# lint
pnpm --filter @repo/desktop lint
```

---

## 7. リスクと対策

| リスク                                       | 影響度 | 発生確率 | 対策                                             |
| -------------------------------------------- | ------ | -------- | ------------------------------------------------ |
| `Object.keys()` の型推論が `string[]` になる | 低     | 高       | `as ExternalIntegrationKey[]` でキャスト         |
| 定数化でロジックが読みにくくなる             | 低     | 低       | 変数名を `EXTERNAL_INTEGRATION_MAP` と明確にする |

---

## 8. 参照情報

- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` — 変更対象ファイル
- `docs/30-workflows/W2-seq-03a-skill-create-wizard/` — 発見元タスク仕様書
- `outputs/phase-12/skill-feedback-report.md` — 発見元フィードバックレポート

---

## 9. 備考

### 苦戦箇所【記録必須】

| 項目     | 内容                                                                                         |
| -------- | -------------------------------------------------------------------------------------------- |
| 発見経緯 | W2-seq-03a Phase 12 スキルフィードバックレポートで「ツール名解決ロジックの共通化」として提案 |
| 重要度   | 非ブロッカー（改善候補）                                                                     |
| 対応方針 | 定数 `EXTERNAL_INTEGRATION_MAP` の導入で、ツール追加時の変更箇所を1箇所に集約する            |
