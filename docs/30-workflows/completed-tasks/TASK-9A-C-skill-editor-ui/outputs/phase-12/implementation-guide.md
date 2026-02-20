# TASK-9A-C SkillEditor - 実装ガイド

## メタ情報

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| タスク   | TASK-9A-C SkillEditor コンポーネント実装 |
| 作成日   | 2026-02-19                               |
| 文書種別 | 監査反映済み実装ガイド                   |

---

# Part 1: 概念的な説明（中学生でもわかる版）

## 1. SkillEditor って何？

SkillEditor は「本の目次と本文」のような画面です。
左側で読みたいページ（ファイル）を選ぶと、右側に中身（テキスト）が表示され、書き換えて保存できます。

## 2. なぜ必要？

スキルは `SKILL.md` や `references/*.md` など複数ファイルでできています。
毎回ファイルを探して手で編集するとミスしやすいため、1画面で選択・編集・保存できる仕組みが必要です。

## 3. 今回の監査で確定したこと

- TASK-9A-C の仕様書は Phase 1-13 まで作成済み
- 実装コード（`SkillEditor.tsx` / `SkillCodeEditor.tsx`）は未着手
- 先に仕様書と参照リンクを整えて、次の実装フェーズで迷わない状態にした

---

# Part 2: 技術的な詳細（開発者向け）

## 1. 目標コンポーネント

| コンポーネント  | 役割                             | 想定ファイル                                                     |
| --------------- | -------------------------------- | ---------------------------------------------------------------- |
| SkillEditor     | ファイル選択・読み込み・保存制御 | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`     |
| SkillCodeEditor | テキスト編集UI                   | `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx` |

## 2. 依存API

| API                                  | シグネチャ                                                                    | 用途             |
| ------------------------------------ | ----------------------------------------------------------------------------- | ---------------- |
| `window.electronAPI.skill.readFile`  | `(skillName: string, relativePath: string) => Promise<string>`                | ファイル読み込み |
| `window.electronAPI.skill.writeFile` | `(skillName: string, relativePath: string, content: string) => Promise<void>` | ファイル保存     |

## 3. 状態管理（想定）

| state          | 型        | 説明           |
| -------------- | --------- | -------------- |
| `selectedFile` | `string`  | 選択中ファイル |
| `content`      | `string`  | 編集中テキスト |
| `isLoading`    | `boolean` | 読み込み中表示 |
| `isSaving`     | `boolean` | 保存中表示     |
| `hasChanges`   | `boolean` | 未保存フラグ   |

## 4. エラーハンドリング指針

- `readFile` 失敗時は編集領域を更新せず、ユーザーへ失敗通知
- `writeFile` 失敗時は `hasChanges` を維持して再試行可能にする
- 例外内容は生のまま表示せず、ユーザー向けメッセージへ変換

## 5. 次アクション（実装フェーズ）

1. `SkillEditor.tsx` と `SkillCodeEditor.tsx` を追加
2. Rendererテスト（正常系/異常系/保存状態遷移）を追加
3. Phase 11 で手動テスト、Phase 12 で完了反映を実施
