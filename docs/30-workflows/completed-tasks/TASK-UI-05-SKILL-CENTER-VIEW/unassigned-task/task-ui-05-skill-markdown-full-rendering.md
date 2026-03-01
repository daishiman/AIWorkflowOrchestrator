# TASK-UI-05 SKILL.md 全文 Markdown レンダリング - タスク指示書

## メタ情報

```yaml
issue_number: 954
```

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | UT-UI-05-005                        |
| タスク名   | SKILL.md 全文 Markdown レンダリング |
| 分類       | 改善                                |
| 対象機能   | SkillDetailPanel 詳細説明セクション |
| 優先度     | 中                                  |
| ステータス | 未実施                              |
| 発見元     | TASK-UI-05 Phase 10 MINOR-5         |
| 発見日     | 2026-03-01                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現状の詳細パネルは概要情報中心で、`SKILL.md` の全文を閲覧できないため、利用前に十分な判断材料を提示できない。

### 1.2 問題点

- FR-5-6（折りたたみ内Markdown全文表示）未達。
- 権限や導入手順などの詳細がUI内で完結しない。
- ファイル参照を別導線に依存し、UXが分断される。

### 1.3 放置影響

- ツール選定の信頼性が下がる。
- ユーザーが「追加前に詳細確認できない」状態が続く。

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillDetailPanel` に「詳しい説明を見る」折りたたみを追加し、`SKILL.md` 本文をMarkdownとして安全に表示する。

### 2.2 完了イメージ

- `skill:readFile` 経由で `SKILL.md` を取得。
- 折りたたみUIで開閉可能。
- Markdown見出し/箇条書き/コードブロックが表示される。

### 2.3 スコープ

- 含む: IPC読取連携、Markdownレンダリング、折りたたみUI、エラー表示。
- 含まない: Markdown編集機能。

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Preload API で `skill:readFile` が利用可能であること。
- Markdownレンダラー導入方針（例: `react-markdown`）が合意済みであること。

### 3.2 推奨アプローチ

1. `SkillMarkdownCollapse` Molecule を追加し、開閉状態を管理する。
2. `onOpen` 時に `SKILL.md` を遅延取得し、読み込み状態を表示する。
3. Markdownレンダリングはサニタイズ方針を含めて実装する。

### 3.3 実装課題と解決策（親タスクからの教訓）

| 課題                             | 解決策                                                              |
| -------------------------------- | ------------------------------------------------------------------- |
| Rendererでの危険なHTML描画リスク | Markdownレンダラーを安全設定し `dangerouslySetInnerHTML` を使わない |
| IPC失敗時のUX劣化                | エラー文言と再試行導線を同一セクションに設置する                    |

---

## 4. 実行手順

1. `SkillDetailPanel` に折りたたみトリガーを追加する。
2. `skill:readFile` 呼び出しを追加し、`SKILL.md` テキストを取得する。
3. Markdownレンダラーを導入し、表示スタイルを整える。
4. 取得失敗時のメッセージと再試行動線を追加する。
5. テストで開閉・成功・失敗ケースを固定する。

---

## 5. 完了条件チェックリスト

- [ ] 折りたたみ開閉でMarkdown全文の表示切替ができる。
- [ ] `skill:readFile` 失敗時にエラー表示と再試行ができる。
- [ ] セキュアな表示方式でXSSリスクを増やさない。

---

## 6. 検証方法

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx
pnpm --filter @repo/desktop exec vitest run src/renderer/views/SkillCenterView/__tests__/SkillCenterView.test.tsx
```

---

## 7. リスクと対策

| リスク                   | 対策                                           |
| ------------------------ | ---------------------------------------------- |
| 大きいMarkdownで描画遅延 | 遅延ロードと折りたたみ初期閉状態で負荷分散する |
| Markdownパーサ依存増加   | バージョン固定とセキュリティレビューを実施する |

---

## 8. 参照情報

- `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx`
- `apps/desktop/src/preload/skill-api.ts`
- `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW/outputs/phase-10/final-review-result.md`

---

## 9. 備考

UT-UI-05-002（Molecule分離）と同時または直後に実装すると差分管理が容易。
