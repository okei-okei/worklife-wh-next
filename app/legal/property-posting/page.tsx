import LegalDocumentPage from "../_components/LegalDocumentPage";
import { getLegalDocument } from "../_data/legalDocuments";

export default function PropertyPostingPage() {
  return <LegalDocumentPage document={getLegalDocument("property-posting")!} />;
}
