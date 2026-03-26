# Phase 5: 実装計画

## 目的

実装着手順と child task 実行順を固定する。

## 実行タスク

- Task01 / 02 を foundation として先行
- Task03 / 04 を infrastructure として並列
- Task05 / 06 を UI / lifecycle として、shared lifecycle state contract 同期後に並列
- Task07 を governance / handoff hardening として後段化
- Task08 を persistence / compatibility contract として最終段に置く

## 実装順の理由

- Task01 がないと Task02 の engine 契約が固定できない
- Task03 / 04 は foundation 完了後の並列化余地として最も安全
- Task05 / 06 は UI 統合と lifecycle surface のため、foundation と infrastructure に加えて shared lifecycle state contract を前提にした方が手戻りが少ない
- Task07 は Task03 の degrade trigger、Task04 の interaction、Task05 / 06 の surface を受けて governance を hardening する方が自然
- Task08 は Task02 の state envelope と Task07 の route state が固まってから互換性を定義した方が品質を担保しやすい

## 並列化ポリシー

- 現行構成は、競合を抑えながら同時実行できる範囲を優先した最小構成とする
- 追加並列化は、IPC 契約、state owner、共通 UI component の衝突を増やすため初回は非推奨とする
- 実装段階で write scope を厳密に分離できるなら、Task05 / 06 の内部サブタスク並列化は再検討してよい

## 成果物

| 成果物   | パス                        | 説明       |
| -------- | --------------------------- | ---------- |
| 実装計画 | `phase-5-implementation.md` | 着手順定義 |

## 完了条件

- [ ] foundation → infrastructure → UI → governance の順序が明記されている
- [ ] 並列化ポリシーと制限理由が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
