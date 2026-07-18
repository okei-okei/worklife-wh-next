# Home Image Guide

WorkLife WH のホームページでは、白い余白と大きな写真面を組み合わせるため、各シーン専用の PC / mobile 画像を使用します。
同じ画像のコピー、反転、色変更、単純トリミングによる使い回しは避けています。

## Image Usage

| Scene | Desktop | Mobile | Theme |
|---|---|---|---|
| Hero | `public/images/home/hero-desktop.webp` | `public/images/home/hero-mobile.webp` | ニュージーランドの都市と自然、広い空、海外生活の始まり |
| 求人 | `public/images/home/jobs-desktop.webp` | `public/images/home/jobs-mobile.webp` | カフェ、現地の職場、都市の日常 |
| 物件 | `public/images/home/properties-desktop.webp` | `public/images/home/properties-mobile.webp` | ニュージーランドの住宅街、シェアハウスや住居 |
| お試し収支シミュレーション | `public/images/home/simulator-desktop.webp` | `public/images/home/simulator-mobile.webp` | 住宅地と都市、道路、通勤と生活費 |
| 渡航準備 | `public/images/home/preparation-desktop.webp` | `public/images/home/preparation-mobile.webp` | スーツケース、渡航前の準備 |
| 役立ち情報 | `public/images/home/articles-desktop.webp` | `public/images/home/articles-mobile.webp` | カフェ、机、情報収集 |
| 比較・おすすめ | `public/images/home/partners-desktop.webp` | `public/images/home/partners-mobile.webp` | スマートフォン、カード決済、通信や送金の比較 |
| 最終CTA | `public/images/home/final-desktop.webp` | `public/images/home/final-mobile.webp` | ニュージーランドの夕景、海、山、広い空 |

## Generation Notes

- 画像は Codex の built-in `image_gen` でシーンごとに個別生成しました。
- 各画像は WebP に変換し、PC 用は約 1672px 幅、mobile 用は約 852-864px 幅に最適化しています。
- 画像内に企業ロゴ、読めるテキスト、透かし、A8.net広告コードは含めていません。
- Footer、法務リンク、既存データ、Supabase、migration、API は変更していません。

## Duplicate Check

`sha1` はファイル一致確認、`dhash` は簡易的な見た目の近さ確認です。
今回の16画像では同一 `dhash` はありません。

| file | size | bytes | sha1 | dhash |
|---|---:|---:|---|---|
| `hero-desktop.webp` | 1672x941 | 131082 | `e3a46fc5d286` | `ffffffffbffff921` |
| `hero-mobile.webp` | 864x1821 | 100146 | `16817e3ccca7` | `263cdcdaffff571f` |
| `jobs-desktop.webp` | 1672x941 | 66878 | `1317e27061b0` | `c74767a767e78fc7` |
| `jobs-mobile.webp` | 864x1821 | 88018 | `3d9d63aa7feb` | `1b1b7b3f39040000` |
| `properties-desktop.webp` | 1672x941 | 233894 | `53270b0999ac` | `3337b76fef2b3e04` |
| `properties-mobile.webp` | 864x1821 | 153182 | `357363f0fc21` | `403831875899d99a` |
| `simulator-desktop.webp` | 1672x941 | 238772 | `d701130d6448` | `7fe6e50e55112a27` |
| `simulator-mobile.webp` | 852x1846 | 182172 | `fe516e143223` | `f0f038d163677ffd` |
| `preparation-desktop.webp` | 1672x941 | 57802 | `12a0acc381c0` | `061e0d0c0c1d3e6b` |
| `preparation-mobile.webp` | 864x1821 | 67448 | `533ecb2ae52a` | `8f4f0ff38f3d3832` |
| `articles-desktop.webp` | 1672x941 | 87316 | `f8441c1abfc1` | `06268e5e0e0f3b0e` |
| `articles-mobile.webp` | 864x1821 | 88112 | `73c1f6b28489` | `ef3fbf2f369ff9df` |
| `partners-desktop.webp` | 1672x941 | 86594 | `89aa40d94e74` | `39381e1e87cdad95` |
| `partners-mobile.webp` | 864x1821 | 50190 | `42214afc939a` | `79fb871fdb2d1682` |
| `final-desktop.webp` | 1672x941 | 169210 | `c0728b114e21` | `fcfdff9ffffffcf9` |
| `final-mobile.webp` | 864x1821 | 106810 | `1fadbbe2d9c6` | `7ffffffefffffff9` |

## Route Notes

- ホームの一般ユーザー向け収支CTAは `/simulator` へ接続します。
- `/simulator` は未ログインで利用でき、入力値は React state の一時試算として扱われます。
- 保存求人・保存物件と連携する保存型ライフプランナー `/planner` は変更していません。
