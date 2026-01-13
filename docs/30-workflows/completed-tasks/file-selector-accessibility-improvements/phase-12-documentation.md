# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 12                                                   |
| Phase名    | ドキュメント更新                                     |
| 前提Phase  | Phase 11                                             |
| 後続Phase  | Phase 13                                             |
| ステータス | 未実施                                               |
| 作成日     | 2026-01-14                                           |
| 機能名     | FileSelector アクセシビリティ改善（WCAG 2.1 AA準拠） |

---

## 目的

FileSelectorアクセシビリティ改善の実装内容をシステム仕様書およびAPIドキュメントに反映する。

## 背景

Phase 11で手動テスト検証が完了した。実装内容をドキュメントに反映し、将来のメンテナンスと参照を容易にする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成

**目的**: 今回の実装内容を理解しやすいガイドとしてまとめる

**実行手順**:

1. Part 1: 概念ガイド
   - アーキテクチャ概要図
   - WCAG要件と実装のマッピング
   - コンポーネント間のフォーカスフロー

2. Part 2: 技術リファレンス
   - useFocusTrapフックのAPI仕様
   - 各コンポーネントのaria属性詳細
   - キーボードイベント処理

**期待される成果物**:

- 実装ガイド（outputs/phase-12/implementation-guide.md）

---

### タスク2: システム仕様書更新

**目的**: システム仕様書（aiworkflow-requirements）に実装内容を反映する

**実行手順**:

1. 更新対象の特定:
   - `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md`

2. 追加セクション:
   - useFocusTrapフック仕様
   - aria属性実装詳細
   - キーボードナビゲーション仕様

3. 更新実行:
   - skill-creatorの update モードを使用
   - インデックス再生成

**期待される成果物**:

- 更新されたui-ux-file-selector.md

---

### タスク3: ドキュメント更新ログ作成

**目的**: 今回の更新内容を記録する

**実行手順**:

1. 更新ログに記載:
   - 更新対象ファイル一覧
   - 各ファイルの更新内容
   - 追加されたセクション

**期待される成果物**:

- ドキュメント更新ログ（outputs/phase-12/documentation-update-log.md）

---

## 参照資料

| 参照資料             | パス                                                                       | 内容                       |
| -------------------- | -------------------------------------------------------------------------- | -------------------------- |
| ファイルセレクターUI | `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md` | 既存のアクセシビリティ仕様 |
| Phase 5実装成果物    | `outputs/phase-5/`                                                         | 実装詳細                   |
| skill-creator        | `.claude/skills/skill-creator/SKILL.md`                                    | 仕様書更新ワークフロー     |

---

## 成果物

| 成果物               | パス                                           | 内容                  |
| -------------------- | ---------------------------------------------- | --------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | 概念+技術リファレンス |
| ドキュメント更新ログ | `outputs/phase-12/documentation-update-log.md` | 更新記録              |

---

## 完了条件

- [ ] 実装ガイドが作成されている
- [ ] システム仕様書（ui-ux-file-selector.md）が更新されている
- [ ] ドキュメント更新ログが作成されている
- [ ] インデックスが再生成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト検証）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/file-selector-accessibility-improvements/phase-13-pr-creation.md`
