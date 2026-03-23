# Phase 2: 検証マトリクス

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| Phase    | 2                                                     |
| 作成日   | 2026-03-23                                            |

## 1. 検証タイプ別マトリクス

### Phase 3（設計レビュー）で検証する観点

| ID   | 検証観点                   | 検証方法                                      | 判定基準                                   |
| ---- | -------------------------- | --------------------------------------------- | ------------------------------------------ |
| V-01 | lane 分離の明確性          | 設計書に lane 分離表が存在する                | integrated/manual の入口・責務が一意に定義 |
| V-02 | 状態遷移の完全性           | 禁止遷移が全て列挙されている                  | 不正遷移4パターンが全て明記                |
| V-03 | DTO 互換性                 | ModifierResponse 拡張が既存消費箇所を壊さない | optional フィールドのみ追加                |
| V-04 | ownership 衝突の不在       | ownership テーブルに重複がない                | 各ファイルの変更権限が一意に決まる         |
| V-05 | cleanup 順序の依存関係     | 依存グラフに循環がない                        | 全エッジが前方参照のみ                     |
| V-06 | simpler alternative の比較 | 不採用理由が AC・仕様と照合されている         | 不採用理由に仕様参照先が明記               |

### Phase 4（テスト作成）で検証する観点

| ID   | 検証観点                       | テストタイプ | 対象                                       |
| ---- | ------------------------------ | ------------ | ------------------------------------------ |
| V-07 | 状態遷移の正当性               | unit         | SlideUIStatus の遷移関数                   |
| V-08 | 禁止遷移の拒否                 | unit         | 不正遷移4パターンのエラーハンドリング      |
| V-09 | ModifierResponse 後方互換      | contract     | 既存 consumer が拡張フィールド無しでも動作 |
| V-10 | SlideCapabilityDTO の IPC 整合 | integration  | Main → Preload → Renderer の DTO 伝搬      |
| V-11 | ManualBoundary 制約            | unit         | auto-send / hidden injection の禁止検証    |

### Phase 11（手動テスト）で検証する観点

| ID   | 検証観点                 | 手動検証方法                                           |
| ---- | ------------------------ | ------------------------------------------------------ |
| V-12 | UI 4領域の表示ルール     | 各状態で期待される領域のみ表示されていることを目視確認 |
| V-13 | fallback card CTA の動作 | CTA クリックで guidance 状態に遷移することを確認       |
| V-14 | terminal launcher の動作 | terminal 起動で外部ターミナルが開くことを確認          |
| V-15 | degraded 状態の表示品質  | UX-07 screenshot 契約に準拠した表示であることを確認    |

### Phase 12（ドキュメント）で検証する観点

| ID   | 検証観点                  | 検証方法                                            |
| ---- | ------------------------- | --------------------------------------------------- |
| V-16 | system spec 同期          | workflow 正本に Task08 完了記録が存在する           |
| V-17 | follow-up ルール記録      | Task09 governance の follow-up テーブルに全項目記載 |
| V-18 | implementation guide 品質 | Part 1（中学生レベル）+ Part 2（開発者向け）の構成  |

## 2. 検証コマンド一覧

### 自動検証（Phase 9 品質検証で使用）

| コマンド                                                         | 目的                           |
| ---------------------------------------------------------------- | ------------------------------ |
| `grep -rn "SlideUIStatus" apps/desktop/src/`                     | 状態型の使用箇所を網羅         |
| `grep -rn "ModifierResponse" apps/desktop/src/`                  | DTO 拡張の影響範囲を確認       |
| `grep -rn "agent-client\|@anthropic-ai/sdk" apps/desktop/src/`   | direct SDK path の残存を確認   |
| `grep -rn "ANTHROPIC_API_KEY" apps/desktop/src/`                 | 環境変数参照箇所を確認         |
| `grep -rn "fallback_reason\|suggested_action" apps/desktop/src/` | 拡張フィールドの実装箇所を確認 |

### 手動検証（Phase 11 手動テストで使用）

| チェック項目             | 確認方法                                     |
| ------------------------ | -------------------------------------------- |
| synced 状態の UI         | Electron アプリで slide 画面を開く           |
| degraded 状態の UI       | API key を無効化して同期を実行               |
| guidance 状態の UI       | fallback card の CTA をクリック              |
| terminal launcher の動作 | guidance 状態で terminal launcher をクリック |

## 3. Risk-Validation 対応表

| Risk                                | 関連 Validation ID | 緩和策                                      |
| ----------------------------------- | ------------------ | ------------------------------------------- |
| lane 分岐条件が曖昧化する           | V-01, V-07         | テストで全分岐を網羅                        |
| ModifierResponse 拡張で既存が壊れる | V-03, V-09         | optional フィールドのみ追加、後方互換テスト |
| UI 4領域の表示ルール不整合          | V-12, V-15         | screenshot 契約で視覚検証                   |
| cleanup 順序の依存違反              | V-05               | 依存グラフを Phase 10 で再検証              |
| silent fallback が再発する          | V-10, V-11         | capability DTO テストで source 検証         |
