import LegalDocumentPage from "../_components/LegalDocumentPage";
import { getLegalDocument } from "../_data/legalDocuments";

export default function CookiePolicyPage() {
  return <LegalDocumentPage document={getLegalDocument("cookies")!} />;
}
