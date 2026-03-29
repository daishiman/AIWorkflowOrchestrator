# [#1710] [UT-RT-06-ESBUILD-ARCH-MISMATCH-001] esbuild アーキテクチャ不整合の解消と再発防止手順整備

## メタ情報

```yaml
issue_number: 1710
task_id: UT-RT-06-ESBUILD-ARCH-MISMATCH-001
task_name: esbuild アーキテクチャ不整合の解消と再発防止手順整備
category: 改善
target_feature: esbuild / vitest / Node.js arm64 環境
priority: 高
scale: 小規模
status: 未実施
source_phase: TASK-RT-06 Phase 10 / Phase 11 / Phase 12
created_date: 2026-03-29
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-RT-06-ESBUILD-ARCH-MISMATCH-001.md
parent_workflow: docs/30-workflows/completed-tasks/step-08-par-task-rt-06-claude-sdk-message-contract-normalization/index.md
```

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | UT-RT-06-ESBUILD-ARCH-MISMATCH-001                   |
| タスク名     | esbuild アーキテクチャ不整合の解消と再発防止手順整備 |
| 分類         | 改善                                                 |
| 対象機能     | esbuild / vitest / Node.js arm64 環境                |
| 優先度       | 高                                                   |
| 見積もり規模 | 小規模                                               |
| ステータス   | 未実施                                               |
| 発見元       | TASK-RT-06 Phase 10 / Phase 11 / Phase 12            |
| 発見日       | 2026-03-29                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

RT-06 の vitest 実行において `@esbuild/darwin-arm64` と `@esbuild/darwin-x64` のアーキテクチャ不整合が発生し、`pnpm vitest` が完走できない状態になった。Rosetta 経由（x64）で動作する Node と native arm64 Node が混在する環境で再現する。

### 1.2 問題点・課題

- `RuntimeSkillCreatorFacade.sdk-normalization.test.ts` が実行できず、RT-06 の品質証跡を自動テストで確定できない
- Rosetta による透過的なアーキ切替で「どのプロセスが x64 か」が分かりにくく、再現条件の特定が困難

### 1.3 放置した場合の影響

- CI 実行時に同様の不整合が再発し、テストが完走しない
- RT-06 の品質証跡が historical evidence のみとなり、regression 検出が弱くなる

---

## 2. 何を達成するか（What）

### 2.1 目的

RT-06 対象テストが 1 回実行（non-watch モード）で完了でき、同様の環境不整合が再発しないよう再発防止手順を標準化する。

### 2.2 最終ゴール

- `pnpm vitest run` が arm64 Native Node 環境で完走する
- 再発防止手順が文書化されている

### 2.3 スコープ

#### 含むもの

- Node アーキテクチャ統一手順の確立
- node_modules 再インストール手順
- 再発防止手順の文書化

#### 含まないもの

- CI 設定の全面的な見直し
- esbuild バージョンのアップグレード

### 2.4 成果物

- 再発防止手順ドキュメント（`docs/` 以下）
- RT-06 テスト完走の証跡

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- macOS arm64 (Apple Silicon) 環境であること
- Node.js と pnpm がインストール済みであること

### 3.2 依存タスク

なし

### 3.3 必要な知識

- Node.js の Rosetta 2 / arm64 切替
- pnpm の依存関係インストール方法
- esbuild のアーキテクチャ別バイナリ仕組み

### 3.4 推奨アプローチ

1. `node -e "process.arch"` で現在のアーキテクチャを確認
2. arm64 Native Node に切替（nvm / nodenv を使用）
3. `node_modules` を削除して `pnpm install` で再インストール
4. テストを再実行して完走を確認
5. 手順を `docs/` に文書化

---

## 4. 実行手順

### Phase 1: 環境診断

```bash
node -e "process.arch"
file $(which node)
```

### Phase 2: 環境修正

```bash
rm -rf node_modules
pnpm install
```

### Phase 3: テスト実行確認

```bash
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts
```

### Phase 4: 再発防止手順文書化

---

## 5. 完了条件チェックリスト

- [ ] RT-06 対象テストが 1 回実行で完了できる
- [ ] esbuild arch 不整合エラーが発生しない
- [ ] 再発防止手順が `docs/` に文書化されている

---

## 6. 検証方法

```bash
node -e "process.arch"  # arm64 であること
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts
```

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                              |
| ------------------------------------ | ------ | -------- | ------------------------------------------------- |
| CI の Node が x64 のままで再発する   | 中     | 中       | CI の Node バージョン設定に `arch` 明示を追加する |
| arm64 切替後も別の binary 問題が残る | 低     | 低       | `pnpm install` を clean 状態から実施する          |

---

## 8. 参照情報

- spec: `docs/30-workflows/unassigned-task/UT-RT-06-ESBUILD-ARCH-MISMATCH-001.md`
- detection: `docs/30-workflows/completed-tasks/step-08-par-task-rt-06-claude-sdk-message-contract-normalization/outputs/phase-12/unassigned-task-detection.md`
- 対象テスト: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts`
