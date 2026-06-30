import LegalDocumentPage from "../_components/LegalDocumentPage";
import {
  LEGAL_LAST_UPDATED,
  LEGAL_VERSION,
  OPERATOR_EMAIL,
  type LegalDocument,
} from "../_data/legalDocuments";

const disclaimerDocument: LegalDocument = {
  key: "disclaimer",
  slug: "disclaimer",
  title: "免責事項",
  description:
    "WorkLife WHの情報提供、比較情報、シミュレーション、外部リンクに関する免責事項です。",
  version: LEGAL_VERSION,
  lastUpdated: LEGAL_LAST_UPDATED,
  sections: [
    {
      heading: "1. 情報提供の位置づけ",
      paragraphs: [
        "WorkLife WHは、ワーホリ・海外生活の準備に役立つ情報を整理して提供するサービスです。雇用、入居、収入、ビザ取得、契約成立、生活費削減を保証するものではありません。",
      ],
    },
    {
      heading: "2. 専門助言ではないこと",
      paragraphs: [
        "本サービスは、法的助言、移民助言、不動産仲介、職業紹介、金融助言、保険助言を提供するものではありません。重要な判断を行う場合は、公式情報または専門家へ確認してください。",
      ],
    },
    {
      heading: "3. 掲載情報・外部リンク",
      paragraphs: [
        "求人、物件、比較サービス、記事、外部リンクの内容は変更される場合があります。応募、問い合わせ、契約、申込みの前には、必ず掲載元または公式サイトで最新条件を確認してください。",
      ],
    },
    {
      heading: "4. シミュレーション・地図・AI出力",
      paragraphs: [
        "生活費、収支、距離、移動時間、AI生成文などは参考情報です。実際の費用、交通状況、求人条件、契約条件、応募結果とは異なる場合があります。",
      ],
    },
    {
      heading: "5. 広告・紹介リンク",
      paragraphs: [
        "本サービスには広告・紹介リンクが含まれる場合があります。リンク経由で申込みや契約が行われた場合、WorkLife WHが報酬または紹介特典を受け取ることがあります。",
      ],
    },
    {
      heading: "6. 連絡先",
      paragraphs: [`お問い合わせ先: ${OPERATOR_EMAIL}`],
    },
  ],
};

export default function DisclaimerPage() {
  return <LegalDocumentPage document={disclaimerDocument} />;
}
