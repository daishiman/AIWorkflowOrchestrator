# TASK-SDK-04-U3: Phase 11/12/13 証跡の path と説明を現行 code wave へ同期する

## メタ情報

```yaml
issue_number: 1679
task_id: TASK-SDK-04-U3
task_name: Phase 11/12/13 証跡の path と説明を現行 code wave へ同期する
category: ドキュメント改善
target_feature: TASK-SDK-04 系タスク仕様書の証跡整合
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-SDK-04 Phase 12 再監査
created_date: 2026-03-27
dependencies:
  - TASK-SDK-04
parent_workflow: docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui
spec_path: docs/30-workflows/unassigned-task/task-imp-task-sdk-04-evidence-path-sync-001.md
```

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | TASK-SDK-04-U3                                               |
| タスク名     | Phase 11/12/13 証跡の path と説明を現行 code wave へ同期する |
| 分類         | ドキュメント改善                                             |
| 対象機能     | TASK-SDK-04 系 Phase 11/12/13 証跡ファイル                   |
| 優先度       | 中                                                           |
| 見積もり規模 | 小規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | TASK-SDK-04 Phase 12 再監査                                  |
| 発見日       | 2026-03-27                                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Task04 の Phase 11/12/13 証跡は docs-heavy 前提で書かれており、実際の code wave（U1 の runtime semantics 修正、U2 の canonical binding 修正）が反映された後のファイルパスや説明と一致していない。

### 1.2 問題点・課題

- Phase 11 の手動テスト手順が旧ディレクトリ構成の path を参照している
- Phase 12 の implementation-guide が code wave 前の API シグネチャを記載している
- Phase 13 の change-summary が実際の diff と乖離する可能性がある
- artifacts.json の path entries が旧構成を指している箇所がある

### 1.3 放置した場合の影響

- 将来の開発者が Phase 11 手順を実行しても再現できない
- implementation-guide を参照した downstream task が誤った前提で設計する
- 証跡の信頼性が低下し、Phase 12 close-out の品質保証が形骸化する

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 11/12/13 の証跡ファイルを現行の code 状態と一致させ、証跡としての信頼性を回復する。

### 2.2 最終ゴール

1. Phase 11 手動テスト手順の path が現行ファイルを正しく指す
2. Phase 12 implementation-guide の API シグネチャ・パスが実装と一致する
3. Phase 13 change-summary が実際の変更を正確に反映する
4. artifacts.json の全 path entry が存在するファイルを指す

### 2.3 スコープ

#### 含むもの

- `step-03-par-task-04-user-interaction-bridge-and-phase-ui` の Phase 11/12/13 証跡更新
- artifacts.json の path 整合チェックと修正
- U1/U2 の実装反映に伴う説明テキストの更新

#### 含まないもの

- Phase 1-10 の証跡（影響なし）
- 新規機能の追加
- U1/U2 の実装そのもの

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SDK-04-U2 の実装が完了していること（canonical binding 修正済み）
- 旧 path と新 path のマッピングが把握できること

### 3.2 必要な知識

- `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` の現行 API

### 3.3 推奨アプローチ

1. Phase 11/12/13 内の全ファイルパス参照を grep で洗い出す
2. 各 path が現行ファイルシステムに存在するか検証する
3. 存在しない path を現行 path へ更新する
4. API シグネチャの記述を現行実装と照合・修正する

### 3.4 苦戦箇所

| ID   | 内容                                                      | 解決策                                                      |
| ---- | --------------------------------------------------------- | ----------------------------------------------------------- |
| U3-1 | 旧 path が複数ファイルに散在し見落としやすい              | grep による網羅的検出と artifacts.json の path 一括チェック |
| U3-2 | docs-heavy 前提の説明文を code-first に書き直す判断が曖昧 | 現行テストの describe 文を SSoT として説明を合わせる        |

---

## 4. 実行手順

### Step 1: 差分検出

1. Phase 11/12/13 証跡内の全パス参照を抽出する
2. artifacts.json の path entries を全件チェックする
3. 存在しない path・旧 API 記述をリスト化する

### Step 2: 証跡更新

1. path を現行ファイルシステムに合わせて更新する
2. API シグネチャの記述を現行実装に合わせる
3. 説明テキストの docs-heavy 前提を code-first に修正する

### Step 3: 検証

1. artifacts.json の全 path がファイルシステム上に存在することを確認する
2. Phase 11 手順の再実行可能性を確認する

---

## 5. 完了条件

- [ ] Phase 11 手動テスト手順の全 path が現行ファイルを指す
- [ ] Phase 12 implementation-guide の API 記述が実装と一致する
- [ ] Phase 13 change-summary が実際の diff を正確に反映する
- [ ] artifacts.json の全 path entry が存在するファイルを指す

## 6. 関連タスク

| タスクID       | 関係     | 説明                          |
| -------------- | -------- | ----------------------------- |
| TASK-SDK-04    | 親タスク | interaction bridge / phase UI |
| TASK-SDK-04-U1 | 近接課題 | review 回答の phase semantics |
| TASK-SDK-04-U2 | 近接課題 | canonical binding drift 是正  |

## 7. 検証方法

```bash
# artifacts.json の path 存在チェック
jq -r '.[] | .path' docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs/artifacts.json | while read p; do [ -f "$p" ] || echo "MISSING: $p"; done

# Phase 11/12/13 内のパス参照チェック
grep -rn 'src/' docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs/phase-1{1,2,3}/ | grep -v node_modules
```

## 8. リスクと対策

| リスク                                         | 影響度 | 対策                                      |
| ---------------------------------------------- | ------ | ----------------------------------------- |
| path 更新で別の証跡との整合が崩れる            | 低     | 更新前に全 cross-reference を確認する     |
| U1 未完了のため一部 API 記述が再度変わる可能性 | 中     | U1 完了後に最終同期を行う旨を NOTE に残す |

## 9. 参照情報

- `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/`
- `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs/artifacts.json`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
