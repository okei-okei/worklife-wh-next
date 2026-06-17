import LegalDocumentPage from "../_components/LegalDocumentPage";
import { getLegalDocument } from "../_data/legalDocuments";

export default function DataTransferPage() {
  return <LegalDocumentPage document={getLegalDocument("data-transfer")!} />;
}
