# Phase 9: 品質チェックリスト

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| Phase    | 9                                                     |
| 作成日   | 2026-03-23                                            |
| タイプ   | 設計タスク（プロダクションコード変更なし）            |

## 注記

本タスクはプロダクションコードを変更しない設計タスクのため、
Lint / TypeCheck / テスト実行は対象外。
品質検証は「設計ドキュメントの整合性確認」として実施する。

実装タスク（UT-SLIDE-IMPL-001 等）では本チェックリストの検証コマンドを実行すること。

---

## 1. UX / ビジュアル品質

| チェック項目                                          | 検証方法                                  | 期待結果                             |
| ----------------------------------------------------- | ----------------------------------------- | ------------------------------------ |
| UI 4領域の状態×表示ルールマトリクスが完備             | contract-matrix.md セクション2 を目視確認 | 4状態×4領域 = 16セルが全て定義済み   |
| 不正遷移4パターンが UX 観点で妥当                     | contract-matrix.md セクション1 を目視確認 | 各禁止理由が UX 原則に沿っている     |
| UX-07 TC-ID（S01〜S05）が screenshot 契約に紐付け済み | contract-matrix.md セクション5 を目視確認 | 5件全ての TC-ID に画面要素が定義済み |

**実装タスク向け検証コマンド（参考）**:

```bash
# SlideWorkspace の状態分岐が4状態をカバーしているか確認
grep -n "SlideUIStatus\|synced\|running\|degraded\|guidance" \
  apps/desktop/src/renderer/components/SlideWorkspace.tsx

# 不正遷移ガードが実装されているか確認
grep -n "INVALID_TRANSITION\|forbiddenTransition\|illegalState" \
  apps/desktop/src/renderer/stores/slideStore.ts
```

---

## 2. アーキテクチャ品質

| チェック項目                                     | 検証方法                                    | 期待結果                     |
| ------------------------------------------------ | ------------------------------------------- | ---------------------------- |
| lane 分離（integrated/manual）が設計で一意に定義 | design-summary.md セクション1 確認          | 2 lane の境界が明確          |
| Ownership テーブルで各ファイルの変更権限が一意   | contract-matrix.md セクション3 確認         | 重複 owner がないこと        |
| cleanup 順序9ステップの依存関係が非循環          | design-summary.md セクション Concern C 確認 | 循環依存なし                 |
| DIP 準拠（skill-executor が Port に依存）        | 設計意図を確認（実装時に検証）              | 具象クラス直接依存がないこと |

**実装タスク向け検証コマンド（参考）**:

```bash
# skill-executor が具象クラスに直接依存していないか確認
grep -n "import.*AgentClient\|new AgentClient\|new ModifierSkill" \
  apps/desktop/src/main/skills/skill-executor.ts

# 2 lane の分岐ロジックを確認
grep -n "integrated\|manual\|lane" \
  apps/desktop/src/main/skills/skill-executor.ts

# agent-client.ts の direct SDK 依存を確認
grep -n "import.*@anthropic-ai\|new Anthropic\|direct" \
  apps/desktop/src/main/agent-client.ts
```

---

## 3. IPC / セキュリティ品質

| チェック項目                                         | 検証方法                              | 期待結果                             |
| ---------------------------------------------------- | ------------------------------------- | ------------------------------------ |
| slide:settings:\* channel が allowlist に登録済み    | IPC allowlist ファイルを確認          | whitelist エントリが存在する         |
| slide:sync:\* legacy channel の扱いが明確            | contract-matrix.md セクション6 確認   | 整理方針が Task09 に委譲されている   |
| SlideCapabilityDTO の IPC channel 設計（MN-01 対応） | Phase 5 implementation-plan で確認    | channel 名が明示されている（実装時） |
| IPC 引数バリデーション（P42 準拠3段）                | 実装タスク（UT-SLIDE-IMPL-001）で確認 | 型・空文字・trim() の3段確認がある   |
| Renderer から直接 Node.js API を呼んでいないこと     | 実装後に確認                          | contextBridge 経由のみ               |

**実装タスク向け検証コマンド（参考）**:

```bash
# IPC allowlist の slide エントリを確認
grep -n "slide:" apps/desktop/src/preload/ipc-channels.ts

# P42 準拠バリデーション確認（型 → 空文字 → trim）
grep -A 5 "VALIDATION_ERROR\|must be a non-empty" \
  apps/desktop/src/main/handlers/slideSettingsHandlers.ts

# Renderer からの直接 Node.js 呼び出し確認
grep -rn "require\|process\.env\|fs\." \
  apps/desktop/src/renderer/components/SlideWorkspace.tsx
```

---

## 4. Workflow / タスク品質

| チェック項目                                           | 検証方法                                          | 期待結果                            |
| ------------------------------------------------------ | ------------------------------------------------- | ----------------------------------- |
| 全 AC（AC-1〜AC-4）に充足証跡がある                    | design-review-report.md セクション4 確認          | 全件 PASS                           |
| MINOR 指摘（MN-01）の追跡先が Phase 5 に明記           | phase-3/gate-decision.md 確認                     | implementation-plan.md への参照あり |
| cleanup 順序テーブルに全担当タスクID が記載            | design-summary.md Concern C 確認                  | 5件の担当タスクID が全て存在        |
| Phase 12 未タスク5件の指示書が unassigned-task/ に存在 | outputs/phase-12/ を確認                          | 5件のファイルが存在する             |
| P62 準拠（暗黙 fallback 禁止）が設計に反映             | contract-matrix.md 不正遷移 degraded→running 確認 | 禁止パターンに明記されている        |

**検証コマンド（設計ドキュメント検索）**:

```bash
# AC の充足確認
grep -n "AC-1\|AC-2\|AC-3\|AC-4" \
  outputs/phase-3/design-review-report.md

# MN-01 の追跡確認
grep -n "MN-01\|SlideCapabilityDTO" \
  outputs/phase-3/gate-decision.md

# 担当タスクID の網羅確認
grep -n "UT-SLIDE-IMPL-001\|UT-SLIDE-UI-001\|UT-SLIDE-P31-001\|UT-SLIDE-HANDOFF-DUP-001" \
  outputs/phase-2/design-summary.md

# P62 対策の確認
grep -n "P62\|degraded.*running\|auto-retry" \
  outputs/phase-2/contract-matrix.md
```

---

## 5. チェックリスト総合判定

| カテゴリ           | 判定             | 備考                                              |
| ------------------ | ---------------- | ------------------------------------------------- |
| UX / ビジュアル    | PASS             | 4状態 × 4領域 マトリクス完備                      |
| アーキテクチャ     | PASS             | lane 分離・Ownership・DAG 非循環を確認済み        |
| IPC / セキュリティ | PASS（条件付き） | MN-01（SlideCapabilityDTO channel）は実装時に確認 |
| Workflow           | PASS             | 全 AC 充足・MINOR 追跡先明記済み                  |

**総合**: PASS（条件付き）

- MN-01 の IPC channel 設計は UT-SLIDE-IMPL-001 の Phase 5 で確認する
- プロダクションコード検証は実装タスク完了後に再実施する
