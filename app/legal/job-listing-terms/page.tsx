import LegalDocumentPage from "../_components/LegalDocumentPage";
import { getLegalDocument } from "../_data/legalDocuments";

export default function JobListingTermsPage() {
  return <LegalDocumentPage document={getLegalDocument("job-listing-terms")!} />;
}
