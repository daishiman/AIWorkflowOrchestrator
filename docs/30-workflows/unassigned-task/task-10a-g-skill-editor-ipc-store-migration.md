# SkillEditor 残存直接IPC呼び出しのStore移行 - タスク指示書

## メタ情報

```yaml
issue_number: 1041
```

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | UT-10A-G-SKILL-EDITOR-IPC-STORE-MIGRATION  |
| タスク名     | SkillEditor 残存直接IPC呼び出しのStore移行 |
| 分類         | リファクタリング                           |
| 対象機能     | SkillEditor（スキルファイル編集）          |
| 優先度       | 中                                         |
| 見積もり規模 | 中規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | Phase 12（TASK-10A-F 完了時の残存IPC検出） |
| 発見日       | 2026-03-07                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-F でスキルライフサイクルUI（useSkillAnalysis.ts / SkillCreateWizard.tsx）の直接IPC呼び出しをStore個別セレクタ経由に移行したが、SkillEditor.tsx には6箇所の直接IPC呼び出しが残存している。

### 1.2 問題点・課題

`SkillEditor.tsx` に以下の6箇所の `window.electronAPI.skill.*` 直接呼び出しが残存:

| #   | 行番号 | API                   | 用途                   |
| --- | ------ | --------------------- | ---------------------- |
| 1   | L233   | `skill.readFile`      | スキルファイル読み取り |
| 2   | L271   | `skill.writeFile`     | スキルファイル書き込み |
| 3   | L298   | `skill.listBackups`   | バックアップ一覧取得   |
| 4   | L412   | `skill.createFile`    | 新規ファイル作成       |
| 5   | L440   | `skill.deleteFile`    | ファイル削除           |
| 6   | L482   | `skill.restoreBackup` | バックアップ復元       |

### 1.3 放置した場合の影響

- SkillEditorの状態が他画面（SkillCenterView等）と同期されない
- Store駆動アーキテクチャの一貫性が崩れ、新規開発者に混乱を与える
- TASK-10A-G（全直接IPC排除）の未完了状態が継続

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillEditor.tsx の6箇所の直接IPC呼び出しを全てStore個別セレクタ経由に移行し、Store駆動アーキテクチャの一貫性を確保する。

### 2.2 最終ゴール

- `grep -rn "window.electronAPI" apps/desktop/src/renderer/components/skill/SkillEditor.tsx` の結果が0件
- 全テスト PASS
- カバレッジ基準充足（Line≥80%, Branch≥60%, Function≥80%）

### 2.3 スコープ

#### 含むもの

- SkillEditor.tsx の直接IPC呼び出し6箇所のStore移行
- agentSlice へのファイル操作アクション追加（readFile/writeFile/createFile/deleteFile/listBackups/restoreBackup）
- store/index.ts への個別セレクタexport追加
- SkillEditor.test.tsx のStore mockパターン移行

#### 含まないもの

- SkillEditor以外のコンポーネントの直接IPC排除（別タスク）
- IPC ハンドラ/Preload 層の変更
- SkillEditorView（親コンポーネント）の変更

### 2.4 成果物

- 修正済み `SkillEditor.tsx`
- 拡張済み `agentSlice.ts`（6アクション追加）
- 更新済み `store/index.ts`（6+αセレクタ追加）
- 更新済み `SkillEditor.test.tsx`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-10A-F が完了していること（完了済み: 2026-03-07）
- agentSlice に既存のスキルライフサイクルアクション（analyzeSkill等）が定義済み

### 3.2 依存タスク

| タスクID   | 内容                                          | ステータス |
| ---------- | --------------------------------------------- | ---------- |
| TASK-10A-D | agentSlice スキルライフサイクルアクション追加 | 完了       |
| TASK-10A-F | スキルライフサイクルUI Store移行              | 完了       |

### 3.3 必要な知識

- Zustand Store Slice設計（P31/P48対策含む）
- S26パターン（直接IPC→Store個別セレクタ移行パターン、architecture-implementation-patterns.md）
- SkillEditorのファイル操作フロー

### 3.4 推奨アプローチ

TASK-10A-F で確立した S26 パターン（architecture-implementation-patterns.md）に従い、以下の順序で移行:

1. agentSlice にファイル操作アクション6つを追加
2. store/index.ts に個別セレクタをexport
3. SkillEditor.tsx の直接IPC呼び出しをStore経由に置換
4. テストをStore mockパターンに移行

---

## 4. 実行手順

### Phase構成

Phase 1-13 の標準フローに従う。

### Phase 4-5: テスト作成→実装

#### 目的

TDD で Store 移行を実施

#### 手順

1. agentSlice にファイル操作アクション6つを追加（P42準拠3段バリデーション）
2. store/index.ts に個別セレクタをexport
3. SkillEditor.tsx の各直接IPC呼び出しをStore action経由に置換
4. 全ハンドラに try/catch を追加（TASK-10A-F 教訓: UIクラッシュ防止）
5. テストを `vi.mock("../../../store")` パターンに移行

#### 成果物

修正済みソースコード + テスト

#### 完了条件

- `grep -rn "window.electronAPI" SkillEditor.tsx` が0件
- テスト全PASS
- カバレッジ基準充足

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 6箇所の直接IPC呼び出しが全てStore action経由に移行
- [ ] ファイル読み書き・バックアップ機能が正常動作
- [ ] 他画面との状態同期が可能（Store経由）

### 品質要件

- [ ] ESLint 0エラー
- [ ] TypeScript `tsc --noEmit` PASS
- [ ] any型使用0件
- [ ] テスト全PASS
- [ ] カバレッジ: Line≥80%, Branch≥60%, Function≥80%

### ドキュメント要件

- [ ] arch-state-management.md にセクション追加
- [ ] lessons-learned.md に教訓追記
- [ ] task-workflow.md に完了記録追加

---

## 6. 検証方法

### テストケース

- ファイル読み込み→Store state反映→UI表示
- ファイル書き込み→Store action呼び出し→成功通知
- バックアップ一覧→Store state→UI表示
- エラー時のUI表示（Store skillError経由）

### 検証手順

```bash
# 直接IPC残存チェック
grep -rn "window.electronAPI" apps/desktop/src/renderer/components/skill/SkillEditor.tsx

# テスト実行
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillEditor.test.tsx

# 型チェック
pnpm typecheck
```

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                                      |
| ---------------------------------- | ------ | -------- | --------------------------------------------------------- |
| ファイル操作の非同期エラー処理漏れ | 高     | 中       | TASK-10A-F教訓: 全Store action呼び出しにtry/catch必須     |
| agentSlice肥大化                   | 中     | 高       | ファイル操作を別Slice（skillFileSlice）に分離検討         |
| テストmockパターン不統一           | 中     | 中       | S26標準パターン（State用:値返却/Action用:関数返却）を徹底 |

---

## 8. 参照情報

### 関連ドキュメント

- `arch-state-management.md` - TASK-10A-F セクション（Case B方式、状態分類テーブル）
- `architecture-implementation-patterns.md` - S26（直接IPC→Store移行パターン）
- `lessons-learned.md` - TASK-10A-F 教訓（Store mock統一、try/catch欠落対策）
- `06-known-pitfalls.md` - P31（Zustand無限ループ）、P42（.trim()バリデーション）、P48（useShallow）

### 参考資料

- TASK-10A-F 完了成果物: `docs/30-workflows/store-driven-lifecycle-ui/outputs/`

---

## 9. 備考

### TASK-10A-F からの教訓（苦戦箇所）

1. **Store mock パターン統一**: `vi.mock` の State用/Action用で戻り値構造が異なる。S26標準パターンを参照
2. **try/catch 必須**: Store action 呼び出しは常に try/catch で包む（Store側でerror処理済みでもUIクラッシュ防止）
3. **isMountedRef不要**: Store action 内部で状態更新するため、アンマウント後のsetState問題は自動解消
4. **カバレッジ閾値**: グローバル閾値は変更範囲外ファイルの影響。対象ファイル個別カバレッジを確認

### 補足事項

- SkillEditorのファイル操作は読み書きが頻繁なため、Store state更新の粒度に注意（毎キーストロークでStore更新しない）
- バックアップ操作は破壊的のため、confirm ダイアログの連携も検証対象
