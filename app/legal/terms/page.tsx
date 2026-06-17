import LegalDocumentPage from "../_components/LegalDocumentPage";
import { getLegalDocument } from "../_data/legalDocuments";

export default function TermsPage() {
  return <LegalDocumentPage document={getLegalDocument("terms")!} />;
}
