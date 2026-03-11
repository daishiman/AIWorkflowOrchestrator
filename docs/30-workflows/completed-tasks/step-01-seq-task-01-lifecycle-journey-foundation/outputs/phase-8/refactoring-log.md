# リファクタログ

- App.tsx の switch に残っていた skill-center case を削除し、入口で正規化する構造へ寄せた。
- 一次導線 / surface responsibility / advanced route を skillLifecycleJourney.ts に集約し、view へデータ参照で渡す形にした。
- screenshot 実行経路を workflow 専用 script に固定し、Phase 11 証跡の再現性を上げた。
