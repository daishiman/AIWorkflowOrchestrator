# スキルフィードバックレポート

## メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| Phase    | 12 Task 12-5            |
| タスクID | TASK-SKILL-LIFECYCLE-07 |
| 作成日   | 2026-03-16              |

---

## 1. task-specification-creator スキルの改善点

### 1.1 設計タスク向け Phase 11 テンプレート（ウォークスルー）の有効性

**評価**: 有効。改善の余地あり。

Phase 11 テンプレートがウォークスルーシナリオ形式を採用したことで、docs-only タスクでも構造化された検証が可能になった。3つのシナリオ（A: 作成->評価->実行、B: フィードバック還流、C: Task08連携）に分割したことで、検証の漏れが減少した。

**改善点**:

- ウォークスルーシナリオのテンプレートに「発見事項の分類ガイド」を標準で含めるべき。現在は Phase 11 仕様書のタスク4 で初めて分類基準（Blocker/Note/Info）が提示されるが、シナリオ実行中にリアルタイムで分類できるよう、各シナリオの期待成果物テンプレートに分類欄を設けると効率的
- 「docs-only 検証チェックリスト」は Phase 11 仕様書に含まれているが、Phase 3（設計レビュー）でも同様のチェックリストがあると、設計段階で追跡可能性の問題を早期発見できる

**Next Action**: Phase 11 テンプレートのウォークスルーシナリオに「発見事項リアルタイム分類欄」を追加することを検討

### 1.2 Phase 3 MINOR -> Phase 5 解消の追跡フロー

**評価**: 追跡フロー自体は機能している。可視性に改善余地あり。

Phase 3 で検出された MINOR 4件（TECH-M-01, REQ-M-01, INT-M-01, INT-M-02）が Phase 5 で全て解消され、Phase 9 品質ゲートで検証、Phase 10 で最終確認された。この追跡チェーンは正常に機能した。

**改善点**:

- Phase 5 の各実装仕様書に「Phase 3 MINOR 解決セクション」を明示的に設けると、Phase 10 での追跡が効率化する。現在は Phase 5 の各ファイル内に解決内容が分散しており、Phase 10 レビューアーが全ファイルを横断確認する必要がある
- Phase 3 gate-decision.md の MINOR テーブルに「解決予定Phase」列を追加すると、追跡計画が明確になる

**Next Action**: Phase 3 gate-decision テンプレートの MINOR テーブルに「解決予定Phase」「解決確認Phase」列を追加することを検討

### 1.3 Phase 12 docs-only 判定基準の明確さ

**評価**: 明確。追加の判断ガイドがあるとより良い。

Phase 12 仕様書で `spec_created` ステータスの使用が明示されており、設計タスクと実装タスクの区別が明確だった。Step 2 の「条件付き」判定も、新規型定義4件が明示されたため判断に迷いがなかった。

**改善点**:

- Step 1-G の検証コマンド実行について、設計タスクの場合は「実行計画の記録」と「実際の実行」の境界が不明確。設計タスク用の Step 1-G テンプレートを分離し、「計画記録のみ」であることを明示すると混乱が減る

**Next Action**: Phase 12 テンプレートに「docs-only モード」フラグを追加し、Step 1-G の実行/計画記録を自動切り替えすることを検討

---

## 2. aiworkflow-requirements スキルの改善点

### 2.1 ライフサイクル履歴関連の仕様書構造

**評価**: 現状の構造で問題ないが、新規型定義の配置に関する指針が不足。

Task07 で新たに定義された4つの型（SkillLifecycleEvent / SkillAggregateView / SkillFeedback / PublishReadinessMetrics）は `packages/shared/src/skill/lifecycle/types.ts` に配置予定。しかし、aiworkflow-requirements の仕様書構造では以下の課題がある:

- `interfaces-agent-sdk-skill.md` はスキル管理の全般的なインターフェースを扱うが、ライフサイクル型定義を追加するとファイルが肥大化する
- `interfaces-agent-sdk-skill-advanced.md` が存在するが、ライフサイクル型がどちらに配置されるべきかのルールが不明確

**改善点**:

- 型定義の配置ルールを明文化すべき。「基本型 = skill.md」「拡張型 = skill-advanced.md」「新規ドメイン型 = 新規ファイル」のような分類基準を仕様書構造ガイドに追加する
- ライフサイクル型は独立したドメインなので、`interfaces-agent-sdk-skill-lifecycle.md` として新規ファイルを作成する案も検討に値する

**Next Action**: `interfaces-agent-sdk-skill-*.md` ファミリーの型配置ルールを明文化し、resource-map.md に追記することを検討

### 2.2 新規型定義の仕様書配置ルール

**評価**: 暗黙のルールはあるが明文化されていない。

現在、新規型定義が作成された場合に以下のどのファイルに配置するかの判断基準が仕様書化されていない:

- 既存の `interfaces-*.md` に追記するか
- 新規 `interfaces-*.md` を作成するか
- `arch-*.md`（アーキテクチャ仕様）に含めるか

**改善点**:

- 新規型定義の配置判断フローチャートを作成する:
  1. 既存インターフェースの拡張 -> 既存ファイルに追記
  2. 新規ドメイン（既存ファイルと異なる関心事） -> 新規ファイル作成
  3. アーキテクチャレベルの設計変更 -> `arch-*.md` に追記
  4. 1ファイルが500行を超える場合 -> 分割を検討

**Next Action**: `spec-update-workflow.md` に新規型定義の配置判断フローを追加することを検討

---

## 3. 改善点サマリー

| #   | スキル                     | 改善点                                              | 優先度 |
| --- | -------------------------- | --------------------------------------------------- | ------ |
| 1   | task-specification-creator | Phase 11 ウォークスルーに発見事項分類欄追加         | 中     |
| 2   | task-specification-creator | Phase 3 MINOR テーブルに解決予定Phase列追加         | 低     |
| 3   | task-specification-creator | Phase 12 docs-only モードフラグ追加                 | 低     |
| 4   | aiworkflow-requirements    | interfaces-agent-sdk-skill-\*.md 型配置ルール明文化 | 中     |
| 5   | aiworkflow-requirements    | spec-update-workflow.md に型配置判断フロー追加      | 低     |

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 12 Task 12-5_
