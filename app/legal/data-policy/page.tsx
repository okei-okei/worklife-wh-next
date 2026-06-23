import LegalDocumentPage from "../_components/LegalDocumentPage";
import { getLegalDocument } from "../_data/legalDocuments";

export default function DataPolicyPage() {
  return <LegalDocumentPage document={getLegalDocument("data-policy")!} />;
}
