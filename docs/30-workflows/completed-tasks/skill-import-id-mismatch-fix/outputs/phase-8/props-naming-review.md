# Phase 8: Props命名レビュー

## タスクID: UT-FIX-SKILL-IMPORT-ID-MISMATCH-001

## 実行日: 2026-02-22

## 結果: 1件リネーム実施 / 2件現状維持

## レビュー結果

| Props              | 命名                      | 実態           | 判断        | 理由                   |
| ------------------ | ------------------------- | -------------- | ----------- | ---------------------- |
| `onImport` 引数    | `skillIds` → `skillNames` | skill.name配列 | ✅ リネーム | 値がnameに変わったため |
| `importedSkillIds` | `importedSkillIds`        | skill.id配列   | ❌ 維持     | 実際にidを格納         |
| `availableSkills`  | `availableSkills`         | Skill[]配列    | ❌ 維持     | 命名が実態と一致       |

## 詳細分析

### `onImport` 引数名リネーム（実施）

**判断理由**: Phase 5の修正で`handleImport`がid→name変換を実装したため、`onImport`コールバックに渡される値は`skill.name`の配列に変わった。Props型の引数名`skillIds`は実態と不一致（P45: 契約ドリフト）のため`skillNames`にリネーム。

**影響範囲**: Props型の引数名のみ（実行時の挙動に影響なし）

### `importedSkillIds` 維持理由

`importedSkillIds`はAgentViewの`useImportedSkillIds()`から取得され、Zustand Store内で`skill.id`（SHA-256ハッシュプレフィックス）として管理されている。SkillImportDialog内では以下の用途で使用：

1. `importedSkillIds.includes(skill.id)` — インポート済み判定
2. `handleToggleSkill`のガード条件

いずれも`skill.id`で比較しており、命名が実態と一致。

### コンポーネント内部状態の分離設計

SkillImportDialogは以下の設計で`id`と`name`を使い分けている：

| 用途                 | 使用する値     | 変数名                        |
| -------------------- | -------------- | ----------------------------- |
| 内部選択状態         | skill.id       | `selectedIds`                 |
| インポート済み判定   | skill.id       | `importedSkillIds`            |
| React key            | skill.id       | `key={skill.id}`              |
| チェックボックス制御 | skill.id       | `handleToggleSkill(skill.id)` |
| **onImport出力**     | **skill.name** | **`onImport(selectedNames)`** |

この設計は、コンポーネント内部のユニークID管理と外部APIへの人間可読名出力を適切に分離している。
