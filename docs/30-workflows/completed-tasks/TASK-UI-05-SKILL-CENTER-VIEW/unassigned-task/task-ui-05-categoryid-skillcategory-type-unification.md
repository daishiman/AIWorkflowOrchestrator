# TASK-UI-05 CategoryId/SkillCategory 型統一 - タスク指示書

## メタ情報

```yaml
issue_number: 950
```

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| タスクID   | UT-UI-05-001                      |
| タスク名   | CategoryId / SkillCategory 型統一 |
| 分類       | 改善                              |
| 対象機能   | SkillCenterView カテゴリフィルタ  |
| 優先度     | 低                                |
| ステータス | 未実施                            |
| 発見元     | TASK-UI-05 Phase 10 MINOR-1       |
| 発見日     | 2026-03-01                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillCenterView` では UI用 `CategoryId` と Store用 `SkillCategory` が別ユニオン型で管理されており、変換時に型キャストが必要になっている。

### 1.2 問題点

- `useSkillCenter.ts` で `(setSkillCategory as (v: string | null) => void)` が必要。
- コンパイル時にカテゴリ不整合を検出しにくい。
- 仕様書と実装のカテゴリ語彙が分離し、保守コストが増える。

### 1.3 放置影響

- 新カテゴリ追加時に実装漏れを起こしやすい。
- 型安全性が低下し、回帰バグの温床になる。

---

## 2. 何を達成するか（What）

### 2.1 目的

カテゴリ型の定義を単一ソースに統一し、型キャストなしでカテゴリ変更を扱える状態にする。

### 2.2 完了イメージ

- `CategoryId` と `SkillCategory` の責務境界を整理。
- `useSkillCenter.ts` から型キャストを除去。
- 仕様書（`arch-state-management.md` / `ui-ux-feature-components.md`）へ同期。

### 2.3 スコープ

- 含む: 型定義統一、カテゴリ変換ロジックの整理、関連テスト更新。
- 含まない: カテゴリ表示ラベルの文言変更。

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop/src/renderer/store` の型定義を編集可能であること。
- SkillCenterView テストが実行可能であること。

### 3.2 推奨アプローチ

1. Store正本型を起点に UIカテゴリ型を再定義する。
2. マッピングテーブルを型安全（`Record<...>`）で表現する。
3. 既存テストでカテゴリ切替の回帰を確認する。

### 3.3 実装課題と解決策（親タスクからの教訓）

| 課題                                  | 解決策                                            |
| ------------------------------------- | ------------------------------------------------- |
| UI型とStore型の語彙差でキャストが発生 | 正本型をStore側に寄せ、UIは表示ラベル層へ限定する |
| カテゴリ追加時の更新漏れ              | `exhaustive check` とテストで未対応を検出する     |

---

## 4. 実行手順

1. 型定義ファイルを調査し、カテゴリ定義の正本を決定する。
2. `useSkillCenter.ts` の `handleSetCategory` を型キャストなし実装へ変更する。
3. `CATEGORY_KEYWORDS` のキー型を新定義に合わせる。
4. Hookテストを更新してカテゴリ切替を検証する。
5. 仕様書のカテゴリ定義表を同期する。

---

## 5. 完了条件チェックリスト

- [ ] 型キャストを削除してもビルドが通る。
- [ ] カテゴリ切替の既存テストがPASSする。
- [ ] 仕様書に型統一方針を反映した。

---

## 6. 検証方法

```bash
pnpm --filter @repo/desktop exec tsc --noEmit
pnpm --filter @repo/desktop exec vitest run src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts
```

---

## 7. リスクと対策

| リスク                       | 対策                                     |
| ---------------------------- | ---------------------------------------- |
| 既存カテゴリ値との互換性崩れ | 旧値を許容する移行レイヤーを暫定導入する |
| 表示カテゴリの崩れ           | UIテストでカテゴリラベルを固定検証する   |

---

## 8. 参照情報

- `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/outputs/phase-10/final-review-result.md`

---

## 9. 備考

優先度は低だが、型安全性改善の基盤タスクとして他の UT-UI-05 系より先行して実施すると後続の修正コストを下げられる。
