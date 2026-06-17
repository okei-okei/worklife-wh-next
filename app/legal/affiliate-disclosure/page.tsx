import LegalDocumentPage from "../_components/LegalDocumentPage";
import { getLegalDocument } from "../_data/legalDocuments";

export default function AffiliateDisclosurePage() {
  return (
    <LegalDocumentPage document={getLegalDocument("affiliate-disclosure")!} />
  );
}
