# Home Image Guide

WorkLife WH のホームページは、白い余白と大きな写真面を組み合わせる前提で設計しています。
各ファイルは PC 用とスマホ用で別構図を想定し、`HomeImagePlane` から `picture` 要素で読み分けます。

## Final Assets

- `public/images/home/hero-desktop.webp`
  - 用途: Hero
  - 構図: 左側にコピーを置ける余白、右側にニュージーランドの街と自然。
- `public/images/home/hero-mobile.webp`
  - 用途: Hero mobile
  - 構図: 上部に景色、下部にコピーを置ける縦長構図。
- `public/images/home/jobs-desktop.webp`
  - 用途: 求人セクション
  - 構図: カフェ、レストラン、街で働く日常感。
- `public/images/home/jobs-mobile.webp`
  - 用途: 求人セクション mobile
  - 構図: 顔の大きなアップを避け、職場の空気が分かる縦長構図。
- `public/images/home/planner-desktop.webp`
  - 用途: ライフプランナー
  - 構図: 住宅街、道路、通勤を想起する風景。地図画像にはしない。
- `public/images/home/planner-mobile.webp`
  - 用途: ライフプランナー mobile
  - 構図: 住まいと移動の距離感が伝わる縦長構図。
- `public/images/home/preparation-desktop.webp`
  - 用途: 渡航準備
  - 構図: 空港、スーツケース、荷物、新生活用品。
- `public/images/home/preparation-mobile.webp`
  - 用途: 渡航準備 mobile
  - 構図: 写真の下に短いコピーを置ける縦長構図。
- `public/images/home/articles-desktop.webp`
  - 用途: 役立ち情報
  - 構図: 明るいカフェ、机、情報収集の雰囲気。
- `public/images/home/articles-mobile.webp`
  - 用途: 役立ち情報 mobile
  - 構図: 文字が読みやすい明るい縦長構図。
- `public/images/home/final-desktop.webp`
  - 用途: 最終 CTA
  - 構図: 海、山、広い空。未来を感じる落ち着いた夕景。
- `public/images/home/final-mobile.webp`
  - 用途: 最終 CTA mobile
  - 構図: 下部または上部にCTAを置ける縦長構図。

## Placeholder Assets To Replace

次の画像はファイルパスとレイアウト検証用に用意した仮素材です。
公開前に、テーマに合う別写真へ差し替えるのが理想です。

- `public/images/home/properties-desktop.webp`
  - TODO: ニュージーランドの住宅街、シェアハウス、家の外観が分かる写真へ差し替え。
- `public/images/home/properties-mobile.webp`
  - TODO: 住宅街や住居の縦長写真へ差し替え。
- `public/images/home/partners-desktop.webp`
  - TODO: スマートフォン、カード決済、保険・送金・銀行を連想できる生活小物写真へ差し替え。
- `public/images/home/partners-mobile.webp`
  - TODO: サービス比較の文脈に合う明るい縦長写真へ差し替え。

## Tone

- 自然光
- 彩度は控えめ
- 白、ベージュ、グレー、自然な緑を含む
- 強い青空加工やHDR感は避ける
- 観光広告よりも生活感を優先

## Layout Safety

- 写真は小さなカードとして並べない
- 各シーンで画面幅またはセクション幅いっぱいに近い写真面として扱う
- 文字は写真上に詰め込まず、白い余白側に置く
- 差し替え後も `object-fit: cover` で崩れない構造にする
