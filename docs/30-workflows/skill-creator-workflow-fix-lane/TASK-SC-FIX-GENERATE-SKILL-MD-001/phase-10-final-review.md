# Phase 10: 最終レビュー

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 10                                |
| Phase名    | 最終レビュー                      |
| 対象機能   | TASK-SC-FIX-GENERATE-SKILL-MD-001 |
| 前提Phase  | Phase 9: 品質保証                 |
| 次Phase    | Phase 11: 手動テスト              |
| ステータス | pending                           |
| 作成日     | 2026-04-14                        |

## 目的

AC-1〜AC-5・4条件・設計書との整合性の総合判定を行い、
手動テストへ進めるかを決める。

## 実行タスク

### Task 1: AC最終照合

- AC-1（generate_skill_md.jsが終了コード0で完了する）がtest・code・docの3面で閉じているか確認する
- AC-2（生成SKILL.mdに`## Task一覧`セクションが含まれる）がtest・code・docの3面で閉じているか確認する
- AC-3（生成SKILL.mdにYAMLフロントマターが含まれる）がtest・code・docの3面で閉じているか確認する
- AC-4（スクリプト不在時はensureSkillMdExistsフォールバックが機能する）がtest・code・docの3面で閉じているか確認する
- AC-5（tmpファイルがfinallyで削除される）がtest・code・docの3面で閉じているか確認する

### Task 2: 設計書との整合性確認

- B案（SkillCreatorService側でdescriptionから最小JSON組み立て→tmpファイル書き込み→`--plan`/`--output`で渡す→finally節でcleanup）が実装に正確に反映されていることを確認する
- 変更範囲が`SkillCreatorService.ts`の行152-165と`SkillCreatorService.test.ts`の2ファイルに収まっていることを確認する
- 過剰実装（設計外の変更）がないことを確認する

### Task 3: リグレッションなしの確認

- Phase 9のtestコマンド全PASSを最終エビデンスとして参照する
- `ensureSkillMdExists`フォールバックが従来通り動作することを確認する
- `generateSkillMd`メソッドの公開インターフェースが変わっていないことを確認する

### Task 4: gate判定

- PASS: 手動テスト（Phase 11）へ進む
- MINOR: 手動テストしながら観測する
- MAJOR: Phase 8へ戻す

## 参照資料

| 資料名           | パス                                       | 説明               |
| ---------------- | ------------------------------------------ | ------------------ |
| 設計書           | `outputs/phase-2/design-document.md`       | 設計原則と変更範囲 |
| 実装記録         | `outputs/phase-5/implementation-record.md` | 実装修正の要約     |
| 品質保証レポート | `phase-9-quality-assurance.md`             | gate入力           |

## 統合テスト連携

- ACとテスト対応表をレビュー結果へ持ち込む
- gate判定をdocumentationへ引き継ぐ

## 成果物

| 成果物           | パス                                      | 説明               |
| ---------------- | ----------------------------------------- | ------------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | gate判定と改善余地 |

## 完了条件

- [ ] AC-1〜AC-5の総合判定がある
- [ ] 設計書との整合性確認がある
- [ ] リグレッションなしの確認がある
- [ ] 4条件（矛盾なし・漏れなし・整合性あり・依存関係整合）の再判定がある
- [ ] 手動テスト（VISUAL）へのentry条件が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 11: 手動テスト](./phase-11-manual-test.md)
