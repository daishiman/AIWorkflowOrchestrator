# 実装ガイド

## タスクID: UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001

---

## Part 1: 中学生レベルの説明

### なぜこのクリーンアップが必要だったの？

ソフトウェアのテストコードには「スキップ」という機能があります。
`describe.skip` を使うと、特定のテストグループを一時的に無視することができます。

スキップしたテストの中に「もう画面に存在しないボタン（`skill-lifecycle-request-input`）」を
探しているコードが残っていました。今は画面が変わってそのボタンはなくなっています。

将来、スキップを解除したとき、このテストは「存在しないものを探す」ので
突然失敗してしまいます。今のうちに削除しておきました。

### 日常の例え話

お片付けのとき、「もう持っていないおもちゃ」の取り扱い手順が書かれたメモが
引き出しに入っていたとします。そのメモは将来誰かを混乱させるかもしれないので、
捨てたほうがよいです。

---

## Part 2: 技術者向け説明

### 問題の原因

`UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001` の実装で `skill-lifecycle-request-input` testid が
UI から削除された。しかし `describe.skip` ブロック内のテストは実行されないため CI では検出されず、
以下の2ファイルに参照が残存した:

- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx`

### 解決策

対象2ファイルの `describe.skip` ブロック内から `skill-lifecycle-request-input` への参照を削除した。

**llm-generation.test.tsx**: 11箇所の `const input = screen.getByTestId(...)` と
関連する `fireEvent.change(input, ...)` を削除。`describe.skip` ブロック構造は維持。

**auth-regression.test.tsx**: `fillCreateRequest` 関数（describe.skip ブロックからのみ呼ばれていた）の
本体を no-op に変更:

```typescript
// 変更後
function fillCreateRequest(_request = defaultCreateRequest): void {
  // 旧リクエスト入力 testid は UI リファクタリング（遷移ボタン化）により削除済み
  // describe.skip ブロック内でのみ使用されていたため、本体は no-op とする
}
```

### 影響範囲

| 項目                   | 内容                                                   |
| ---------------------- | ------------------------------------------------------ |
| 変更ファイル数         | 2ファイル（テストファイルのみ）                        |
| 実行時コードへの影響   | なし                                                   |
| スクリーンショット参照 | 不要（NON_VISUAL）                                     |
| CI への影響            | `describe.skip` 内のため現状 CI はスキップ→影響なし    |
| 将来の影響             | スキップ解除時に参照エラーが発生しなくなる（正の影響） |

### 再発防止

実装タスク完了時に「`describe.skip` 内も含めて testid 参照を一斉更新する」チェックを
Phase 5 完了チェックに組み込む:

```bash
# Phase 5 完了後チェック（describe.skip 内も含む全 testid 参照の確認）
grep -rn "削除対象の testid" apps/desktop/src/renderer/components/skill/__tests__/
```

---

_作成日: 2026-04-11_
