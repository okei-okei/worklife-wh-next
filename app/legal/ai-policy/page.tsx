import LegalDocumentPage from "../_components/LegalDocumentPage";
import { getLegalDocument } from "../_data/legalDocuments";

export default function AiPolicyPage() {
  return <LegalDocumentPage document={getLegalDocument("ai-policy")!} />;
}
