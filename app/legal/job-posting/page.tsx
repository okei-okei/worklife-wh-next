import LegalDocumentPage from "../_components/LegalDocumentPage";
import { getLegalDocument } from "../_data/legalDocuments";

export default function JobPostingPage() {
  return <LegalDocumentPage document={getLegalDocument("job-posting")!} />;
}
