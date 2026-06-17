import LegalDocumentPage from "../_components/LegalDocumentPage";
import { getLegalDocument } from "../_data/legalDocuments";

export default function CookiesPage() {
  return <LegalDocumentPage document={getLegalDocument("cookies")!} />;
}
