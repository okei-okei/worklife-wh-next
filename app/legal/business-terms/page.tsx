import LegalDocumentPage from "../_components/LegalDocumentPage";
import { getLegalDocument } from "../_data/legalDocuments";

export default function BusinessTermsPage() {
  return <LegalDocumentPage document={getLegalDocument("business-terms")!} />;
}
