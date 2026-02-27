# スキルフィードバックレポート - TASK-9G

## 作成日

2026-02-27

---

## 対象スキル

- `task-specification-creator`
- `aiworkflow-requirements`

---

## 改善提案

### 提案1: artifacts.json と実体ファイルの自動突合

- **背景**: Phase 12 で `artifacts.json` の実装パス（`main/index.ts`）と実際のファイルパス（`main/ipc/index.ts`）にずれが発見された。手動で発見・補正したが、自動検出できなかった
- **提案**: Phase 12 開始時に `artifacts.json` の全 `path` フィールドについてファイル実在チェック（`fs.existsSync`）を自動実行するスクリプトを追加する
- **期待効果**: パス不整合を早期に検出し、ドキュメントの信頼性を向上させる

### 提案2: IPC 追加時の必須仕様書チェック半自動化

- **背景**: TASK-9G では IPC チャンネルを5つ追加したが、Phase 12 の Step 2 で6ファイルの同時更新が必要であり、更新漏れが起きやすかった（P31パターン）
- **提案**: `spec-update-workflow.md` に「IPC 追加タスク用」の grep テンプレートを固定化する

```bash
# IPC追加時の必須確認コマンド
grep -rn "TASK-ID" .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md
grep -rn "TASK-ID" .claude/skills/aiworkflow-requirements/references/arch-electron-services.md
grep -rn "TASK-ID" .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md
grep -rn "TASK-ID" .claude/skills/aiworkflow-requirements/references/architecture-overview.md
grep -rn "TASK-ID" .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md
grep -rn "TASK-ID" .claude/skills/aiworkflow-requirements/references/task-workflow.md
```

- **期待効果**: 6ファイル全てに TASK-ID が存在することを確認でき、更新漏れを防止できる

### 提案3: Phase 12 仕様書テンプレートに「簡易実装/プレースホルダー」検出ステップを追加

- **背景**: TASK-9G のコード内に TODO/FIXME は0件だったが、コメントに「簡易実装」「将来実装」と記載された箇所が3件あった。これらは `grep -rn "TODO"` では検出されない。実際、この拡張検出により未タスクが当初想定の3件から5件に増加した（UT-9G-003: sendNotification(), UT-9G-004: shutdown() を追加検出）
- **提案**: 未タスク検出コマンドに以下を追加する

```bash
# 簡易実装/プレースホルダー検索
grep -rn "簡易\|プレースホルダー\|将来\|placeholder\|workaround\|hack" <対象ファイル>
```

- **期待効果**: TODO/FIXME 以外の「暗黙の残課題」を検出できる。TASK-9G では UT-9G-003（sendNotification）と UT-9G-004（shutdown）がこの手法で検出された

### 提案4: Phase 2 設計書と実装の差分を Phase 12 で体系的に記録する

- **背景**: TASK-9G では Phase 2 設計書と実装の間に9件の変更が発生した（DI パターン変更、runHistory 上限変更、タイマー管理統合、メソッド分離、エラー挙動変更、インメモリキャッシュ追加、バリデーション簡略化、未実装メソッド2件）。これらの変更は Phase 5-8 の各 Phase で個別に判断されたが、Phase 12 まで体系的に記録されなかった
- **提案**: `spec-update-summary.md` のテンプレートに「Phase 2 設計との差分テーブル」セクションを必須化する。各差分について「Phase 2 設計」「実装」「変更理由」の3列で記録する
- **期待効果**: 設計と実装の乖離を可視化し、次回の設計精度向上に寄与する。Phase 10 のレビュー時にも参照資料として活用できる

---

## ワークフロー改善点

### WF-1: Phase 7-13 の outputs ディレクトリ早期作成

- **観察**: Phase 12 で `outputs/phase-12/` ディレクトリが事前に存在していたのは良かったが、`outputs/phase-7` 以降のファイルが Phase 毎に作成されているため、Phase 完了前に `artifacts.json` で実在検証を行うべき
- **提案**: Phase 完了時に `artifacts.json` の `path` に対して実在チェックを必須化する

### WF-2: DI インターフェース設計の早期確定

- **観察**: `SchedulerSkillExecutor` インターフェースは SkillScheduler 側で定義したが、実際の `SkillExecutor` クラスとの型互換性は手動で確認した。DIインターフェースを `@repo/shared` に配置することで、コンパイル時に型整合を自動検証できる
- **提案**: 新規サービスの DI インターフェースは Phase 2（設計）で `@repo/shared` への配置を検討する
- **TASK-9G での具体例**: `SchedulerSkillExecutor` インターフェースは ISP（Interface Segregation Principle）に基づき、`SkillExecutor` の全メソッドではなく `executeSkill(skillName, prompt)` のみを要求する最小インターフェースとして設計された。この設計判断は Phase 2 の Setter Injection から Constructor Injection への変更と連動している

### WF-3: node-cron と cron-parser の役割分担

- **観察**: `node-cron` はスケジュール実行（`schedule()` + `validate()`）に使用するが、次回実行時刻の算出はサポートしていない。`cron-parser` が補完的に必要だが、Phase 2 設計時に依存ライブラリの役割分担を明示していなかった
- **教訓**: 外部ライブラリの機能範囲を Phase 2 で詳細に調査し、「何ができて何ができないか」を設計書に記載すべき
- **具体的影響**: UT-9G-001 として未タスク化された。`calculateNextRun()` が「現在時刻 + 1分」を仮の次回実行時刻として返す簡易実装になっており、スケジュール一覧画面での表示精度が低下する

### WF-4: Phase 2 設計での未実装メソッドの明示的スコープ判定

- **観察**: Phase 2 設計書で定義された `sendNotification()` と `shutdown()` が実装されなかったが、Phase 5（実装）でスコープ外判定された経緯がドキュメントに残っていなかった。Phase 12 の未タスク検出で初めて体系的に記録された
- **教訓**: Phase 5 で設計書のメソッドを「実装しない」と判断した場合、その理由を Phase 5 仕様書に明示的に記録すべき。「実装しなかった」ことの記録は「実装した」ことの記録と同等に重要である
- **具体的影響**: UT-9G-003（sendNotification）と UT-9G-004（shutdown）として未タスク化された

---

## TASK-9G で活用した既知の落とし穴（Pitfall）

| Pitfall | 内容                       | TASK-9G での適用                                                                             |
| ------- | -------------------------- | -------------------------------------------------------------------------------------------- |
| P5      | リスナー二重登録           | `deactivateSchedule()` を `activateSchedule()` 前に呼び出して既存タイマーを停止              |
| P9      | テスト間の状態リーク       | `beforeEach` で `vi.clearAllMocks()` と `mockStoreGet.mockReturnValue([])` をリセット        |
| P19     | 型キャスト（as）バイパス   | `Array.isArray(raw)` と `.filter(item => typeof item.id === "string")` でランタイム検証      |
| P42     | .trim() バリデーション漏れ | IPC ハンドラの全文字列引数で3段バリデーション（型 -> 空 -> trim空）を実施                    |
| P44/P45 | IPC インターフェース不整合 | delete/toggle の引数を `{ id: string }` オブジェクト形式に統一し、セマンティクスと命名を一致 |

---

## 新たに検出された教訓候補

### 教訓候補1: Phase 2 設計の DI パターン変更記録

- **状況**: Phase 2 で Setter Injection を設計したが、Phase 5 で Constructor Injection に変更した。変更理由（生成タイミングが同時期、mainWindow を直接使用しない）は妥当だったが、Phase 5 仕様書に変更理由が十分に記録されていなかった
- **推奨**: Phase 5 仕様書に「設計書からの変更点と理由」セクションを追加することを `phase-templates.md` に反映する

### 教訓候補2: 外部ライブラリの機能限界の事前調査

- **状況**: `node-cron` に次回実行時刻算出機能がないことが Phase 5 で判明した。Phase 2 で `cron-parser` の併用を設計に含めるべきだった
- **推奨**: Phase 2 で外部ライブラリを採用する場合、「提供する機能」と「提供しない機能」を明示的にリストアップする

### 教訓候補3: 未実装判断の明示的記録

- **状況**: `sendNotification()` と `shutdown()` は Phase 2 で設計されたが、Phase 5 で暗黙的に実装対象外となった。Phase 12 まで体系的に記録されなかった
- **推奨**: Phase 5 仕様書に「設計書で定義されたが実装しなかったメソッド/機能」セクションを追加し、未実装の理由と影響を記録する

---

## 総合評価

TASK-9G の Phase 1-12 を通じて、スケジュール実行機能のバックエンド（Main Process + 永続化 + IPC + Preload API）を実装した。TDD アプローチにより 25 テストケース（ScheduleStore: 20件、型定義: 5件）で品質を担保し、P5/P9/P19/P42/P44/P45 の既知の落とし穴を事前に回避できた。

Phase 2 設計と実装の間に9件の変更が発生したが、いずれも品質向上または実装効率化のための妥当な判断であった。5件の未タスク（UT-9G-001: cron パース改善、UT-9G-002: event 方式の拡張、UT-9G-003: sendNotification 実装、UT-9G-004: shutdown 実装、UT-9G-005: Renderer push 通知）は機能の致命的な欠陥ではなく、UI タスク（task-031b）との統合時に対応可能である。

スキル改善として4件の提案と4件のワークフロー改善点を記録した。特に提案3（簡易実装/プレースホルダー検出ステップ）は TASK-9G で実際に未タスク2件の追加検出に寄与しており、Phase 12 テンプレートへの反映を強く推奨する。
