import LegalDocumentPage from "../_components/LegalDocumentPage";
import { getLegalDocument } from "../_data/legalDocuments";

export default function PrivacyPage() {
  return <LegalDocumentPage document={getLegalDocument("privacy")!} />;
}
