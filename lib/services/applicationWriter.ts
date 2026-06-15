export type ApplicationWriterProvider = "template" | "openai";

export type ApplicationTargetType = "job" | "property";

export type ApplicationTarget = {
  title: string;
  type?: ApplicationTargetType;
  url?: string | null;
  location?: string | null;
  address?: string | null;
  company?: string | null;
  ownerName?: string | null;
  description?: string | null;
  hourlyRate?: number | null;
  workHours?: number | null;
  rentWeekly?: number | null;
  desiredMoveInDate?: string | null;
  plannedStayDuration?: string | null;
  selfIntroductionMemo?: string | null;
};

export type ApplicationJob = ApplicationTarget;

export type ApplicationResume = {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  current_city?: string | null;
  visa_type?: string | null;
  available_from?: string | null;
  work_experience?: string | null;
  skills?: string | null;
  skills_list?: string[] | null;
  experience_items?: ExperienceItem[] | null;
  english_level?: string | null;
  self_introduction?: string | null;
};

export type ExperienceItem = {
  company?: string;
  role?: string;
  period?: string;
  description?: string;
  achievement?: string;
};

export type JobApplicationDetails = {
  fullName?: string;
  currentCity?: string;
  visaType?: string;
  availableFrom?: string;
  availability?: string;
  englishLevel?: string;
  relevantExperience?: string;
  experienceItems?: ExperienceItem[];
  skills?: string;
  skillsList?: string[];
  selfPromotion?: string;
  motivation?: string;
  attachResume?: boolean;
  interviewAvailability?: string;
  additionalMessage?: string;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
};

export type PropertyInquiryDetails = {
  fullName?: string;
  currentCity?: string;
  desiredMoveInDate?: string;
  plannedStayDuration?: string;
  occupants?: string;
  occupation?: string;
  selfIntroduction?: string;
  viewingAvailability?: string;
  questions?: string;
  additionalMessage?: string;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
};

type ApplicationWriterInput = {
  target?: ApplicationTarget;
  job?: ApplicationJob;
  resume: ApplicationResume;
};

type OptionalResumeWriterInput = {
  target: ApplicationTarget;
  resume?: ApplicationResume | null;
  jobDetails?: JobApplicationDetails;
  propertyDetails?: PropertyInquiryDetails;
};

type NormalizedApplicationWriterInput = {
  target: ApplicationTarget;
  resume: ApplicationResume;
};

type ApplicationWriter = {
  generateApplicationEmail: (input: NormalizedApplicationWriterInput) => string;
  generateCoverLetter: (input: NormalizedApplicationWriterInput) => string;
};

function valueOrPlaceholder(
  value: string | null | undefined,
  placeholder: string,
) {
  return value?.trim() ? value.trim() : placeholder;
}

function optionalLine(label: string, value: string | null | undefined) {
  if (!value?.trim()) return "";

  return `${label}: ${value.trim()}`;
}

function joinOptionalLines(lines: string[]) {
  return lines.filter(Boolean).join("\n");
}

function formatAvailableFrom(value: string | null | undefined) {
  if (!value) return "as soon as possible";

  return value;
}

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) return "";

  return `$${value}`;
}

function normalizeInput(
  input: ApplicationWriterInput,
): NormalizedApplicationWriterInput {
  return {
    target: input.target || input.job || { title: "[Target]", type: "job" },
    resume: input.resume,
  };
}

function mergeJobDetails(
  resume: ApplicationResume | null | undefined,
  details: JobApplicationDetails | undefined,
): Required<JobApplicationDetails> {
  return {
    fullName: valueOrPlaceholder(details?.fullName, resume?.full_name || ""),
    currentCity: valueOrPlaceholder(
      details?.currentCity,
      resume?.current_city || "",
    ),
    visaType: valueOrPlaceholder(details?.visaType, resume?.visa_type || ""),
    availableFrom: valueOrPlaceholder(
      details?.availableFrom,
      resume?.available_from || "",
    ),
    availability: valueOrPlaceholder(details?.availability, ""),
    englishLevel: valueOrPlaceholder(
      details?.englishLevel,
      resume?.english_level || "",
    ),
    relevantExperience: valueOrPlaceholder(
      details?.relevantExperience,
      resume?.work_experience || "",
    ),
    experienceItems:
      details?.experienceItems?.length
        ? details.experienceItems
        : resume?.experience_items || [],
    skills: valueOrPlaceholder(details?.skills, resume?.skills || ""),
    skillsList:
      details?.skillsList?.length ? details.skillsList : resume?.skills_list || [],
    selfPromotion: valueOrPlaceholder(
      details?.selfPromotion,
      resume?.self_introduction || "",
    ),
    motivation: valueOrPlaceholder(details?.motivation, ""),
    attachResume: details?.attachResume ?? true,
    interviewAvailability: valueOrPlaceholder(details?.interviewAvailability, ""),
    additionalMessage: valueOrPlaceholder(details?.additionalMessage, ""),
    currentLatitude: details?.currentLatitude ?? null,
    currentLongitude: details?.currentLongitude ?? null,
  };
}

function formatExperienceItems(items: ExperienceItem[] | undefined) {
  if (!items?.length) return "";

  return items
    .filter((item) => {
      return (
        item.company?.trim() ||
        item.role?.trim() ||
        item.period?.trim() ||
        item.description?.trim() ||
        item.achievement?.trim()
      );
    })
    .map((item) => {
      const title = [item.role, item.company].filter(Boolean).join(" at ");
      const period = item.period ? ` (${item.period})` : "";
      const lines = [
        title ? `- ${title}${period}` : "- Relevant experience",
        item.description ? `  Responsibilities: ${item.description}` : "",
        item.achievement ? `  Strengths/results: ${item.achievement}` : "",
      ];

      return lines.filter(Boolean).join("\n");
    })
    .join("\n");
}

function formatSkillsText(skills: string, skillsList: string[] | undefined) {
  const tags = skillsList?.filter(Boolean).join(", ");
  const freeText = skills?.trim();

  if (tags && freeText) return `${tags}. ${freeText}`;
  if (tags) return tags;
  if (freeText) return freeText;

  return "";
}

function mergePropertyDetails(
  details: PropertyInquiryDetails | undefined,
): Required<PropertyInquiryDetails> {
  return {
    fullName: valueOrPlaceholder(details?.fullName, ""),
    currentCity: valueOrPlaceholder(details?.currentCity, ""),
    desiredMoveInDate: valueOrPlaceholder(details?.desiredMoveInDate, ""),
    plannedStayDuration: valueOrPlaceholder(details?.plannedStayDuration, ""),
    occupants: valueOrPlaceholder(details?.occupants, ""),
    occupation: valueOrPlaceholder(details?.occupation, ""),
    selfIntroduction: valueOrPlaceholder(details?.selfIntroduction, ""),
    viewingAvailability: valueOrPlaceholder(details?.viewingAvailability, ""),
    questions: valueOrPlaceholder(details?.questions, ""),
    additionalMessage: valueOrPlaceholder(details?.additionalMessage, ""),
    currentLatitude: details?.currentLatitude ?? null,
    currentLongitude: details?.currentLongitude ?? null,
  };
}

function getConfiguredApplicationWriterProvider(): ApplicationWriterProvider {
  const provider = process.env.NEXT_PUBLIC_APPLICATION_WRITER_PROVIDER;

  if (provider === "template" || provider === "openai") {
    return provider;
  }

  return "template";
}

function buildJobConditionText(target: ApplicationTarget) {
  const lines = joinOptionalLines([
    optionalLine("Location", target.location || target.address),
    optionalLine("Hourly rate", formatMoney(target.hourlyRate)),
    optionalLine(
      "Weekly hours",
      target.workHours ? `${target.workHours} hours` : "",
    ),
    optionalLine("Job notes", target.description),
  ]);

  return lines ? `\nJob details I reviewed:\n${lines}\n` : "";
}

function buildJobApplicationEmailTemplate(
  target: ApplicationTarget,
  resume: ApplicationResume | null | undefined,
  details: JobApplicationDetails | undefined,
) {
  const input = mergeJobDetails(resume, details);
  const fullName = valueOrPlaceholder(input.fullName, "[Your Name]");
  const companyLine = target.company ? ` at ${target.company}` : "";
  const currentCityLine = input.currentCity
    ? ` I am currently based in ${input.currentCity}.`
    : "";
  const availabilityLine = input.availability
    ? ` I am available to work ${input.availability}.`
    : "";
  const resumeLine = input.attachResume
    ? "I have attached my resume for your review."
    : "I can provide my resume or any further information if needed.";
  const motivationLine = input.motivation
    ? `\nI am interested in this role because ${input.motivation}\n`
    : "";
  const interviewLine = input.interviewAvailability
    ? `I am available for an interview ${input.interviewAvailability}.`
    : "I am flexible with interview times.";
  const additionalLine = input.additionalMessage
    ? `\nAdditional information:\n${input.additionalMessage}\n`
    : "";
  const experienceText =
    formatExperienceItems(input.experienceItems) || input.relevantExperience;
  const skillsText = formatSkillsText(input.skills, input.skillsList);

  return `Subject: Application for ${target.title}

Dear Hiring Manager,

I am writing to apply for the ${target.title} position${companyLine}.

${input.selfPromotion || "I am reliable, motivated, and eager to contribute to your team."}${currentCityLine}
${motivationLine}${buildJobConditionText(target)}
I currently hold ${input.visaType || "a valid visa"}, and I am available to start from ${formatAvailableFrom(input.availableFrom)}.${availabilityLine} My English level is ${input.englishLevel || "conversational"}.

My relevant experience includes:
${experienceText || "I have practical experience and I am confident I can learn quickly and work responsibly."}

My key skills include:
${skillsText || "communication, teamwork, reliability, and a positive attitude."}

${resumeLine}

${interviewLine} I would appreciate the opportunity to discuss my application and learn more about the role.
${additionalLine}
Thank you for your time and consideration.

Kind regards,
${fullName}`;
}

function buildJobCoverLetterTemplate(
  target: ApplicationTarget,
  resume: ApplicationResume | null | undefined,
  details: JobApplicationDetails | undefined,
) {
  const input = mergeJobDetails(resume, details);
  const fullName = valueOrPlaceholder(input.fullName, "[Your Name]");
  const companyLine = target.company ? ` at ${target.company}` : "";
  const currentCityLine = input.currentCity
    ? ` I am currently based in ${input.currentCity}.`
    : "";
  const resumeLine = input.attachResume
    ? "I have attached my resume for your review."
    : "I can provide my resume or additional information upon request.";
  const motivationLine = input.motivation
    ? `\nWhat interests me about this role is ${input.motivation}\n`
    : "";
  const additionalLine = input.additionalMessage
    ? `\nI would also like to add:\n${input.additionalMessage}\n`
    : "";
  const experienceText =
    formatExperienceItems(input.experienceItems) || input.relevantExperience;
  const skillsText = formatSkillsText(input.skills, input.skillsList);

  return `Dear Hiring Manager,

I am writing to express my interest in the ${target.title} position${companyLine}.

${input.selfPromotion || "I am a motivated and reliable applicant who is ready to work hard and learn quickly."}${currentCityLine}
${motivationLine}${buildJobConditionText(target)}
I currently hold ${input.visaType || "a valid visa"} and I am able to work legally in New Zealand. I am available to start from ${formatAvailableFrom(input.availableFrom)}${input.availability ? ` and I can work ${input.availability}` : ""}.

My relevant experience includes:
${experienceText || "I have experience that has helped me build responsibility, teamwork, and practical workplace skills."}

My key strengths and skills include:
${skillsText || "clear communication, punctuality, adaptability, and a willingness to learn."}

${resumeLine}

${input.interviewAvailability ? `I am available for an interview ${input.interviewAvailability}.` : "I would welcome the opportunity to discuss my application in an interview."}
${additionalLine}
Thank you for considering my application. I look forward to hearing from you.

Kind regards,
${fullName}`;
}

function buildPropertyInquiryEmailTemplate(
  target: ApplicationTarget,
  details: PropertyInquiryDetails | undefined,
) {
  const input = mergePropertyDetails(details);
  const fullName = valueOrPlaceholder(input.fullName, "[Your Name]");
  const propertyLocation = target.location || target.address;
  const ownerName = target.ownerName || "Property Manager";
  const rentLine = target.rentWeekly
    ? ` I understand the rent is around $${target.rentWeekly} per week.`
    : "";
  const moveInLine = input.desiredMoveInDate
    ? ` My preferred move-in date is ${input.desiredMoveInDate}.`
    : "";
  const stayLine = input.plannedStayDuration
    ? ` I am planning to stay for ${input.plannedStayDuration}.`
    : "";
  const occupantsLine = input.occupants
    ? ` The number of occupants would be ${input.occupants}.`
    : "";
  const occupationLine = input.occupation
    ? ` My current work or study situation is: ${input.occupation}.`
    : "";
  const viewingLine = input.viewingAvailability
    ? ` I am available for a viewing ${input.viewingAvailability}.`
    : " I would appreciate the opportunity to arrange a viewing.";
  const questionsLine = input.questions
    ? `\nI would also like to ask:\n${input.questions}\n`
    : "";
  const additionalLine = input.additionalMessage
    ? `\nAdditional information:\n${input.additionalMessage}\n`
    : "";

  return `Subject: Enquiry about ${target.title}

Dear ${ownerName},

I am writing to enquire about ${target.title}${propertyLocation ? ` in ${propertyLocation}` : ""}.

${input.selfIntroduction || "I am currently looking for a suitable place to live in New Zealand."} ${input.currentCity ? `I am currently based in ${input.currentCity}.` : ""}

I would like to ask whether this property is still available.${rentLine}${moveInLine}${stayLine}${occupantsLine}${occupationLine}

${viewingLine} Please let me know if there are any suitable times or any next steps for applying.
${questionsLine}${additionalLine}
Thank you for your time. I look forward to hearing from you.

Kind regards,
${fullName}`;
}

const templateApplicationWriter: ApplicationWriter = {
  generateApplicationEmail({ target, resume }) {
    if (target.type === "property") {
      return buildPropertyInquiryEmailTemplate(target, {
        fullName: resume.full_name || "",
        currentCity: resume.current_city || "",
        selfIntroduction: resume.self_introduction || "",
      });
    }

    return buildJobApplicationEmailTemplate(target, resume, undefined);
  },

  generateCoverLetter({ target, resume }) {
    return buildJobCoverLetterTemplate(target, resume, undefined);
  },
};

const openAiApplicationWriter: ApplicationWriter = {
  generateApplicationEmail(input) {
    // OpenAI API keys must never be stored in NEXT_PUBLIC_* variables or called
    // directly from the browser. This provider is a placeholder for the future
    // app/api/ai/application/route.ts server endpoint, where OPENAI_API_KEY can
    // be read securely and the response can be normalized for the UI.
    return templateApplicationWriter.generateApplicationEmail(input);
  },

  generateCoverLetter(input) {
    // Keep the UI unchanged: pages call generateCoverLetter() only. When AI is
    // introduced, this provider can route through a server action/API endpoint
    // while the template provider remains available as a free fallback.
    return templateApplicationWriter.generateCoverLetter(input);
  },
};

function getApplicationWriter(): ApplicationWriter {
  const provider = getConfiguredApplicationWriterProvider();

  if (provider === "openai") {
    return openAiApplicationWriter;
  }

  return templateApplicationWriter;
}

export function generateApplicationEmail(input: ApplicationWriterInput) {
  return getApplicationWriter().generateApplicationEmail(normalizeInput(input));
}

export function generateCoverLetter(input: ApplicationWriterInput) {
  return getApplicationWriter().generateCoverLetter(normalizeInput(input));
}

export function generateJobApplicationEmail(input: OptionalResumeWriterInput) {
  return buildJobApplicationEmailTemplate(
    {
      ...input.target,
      type: "job",
    },
    input.resume,
    input.jobDetails,
  );
}

export function generateJobCoverLetter(input: OptionalResumeWriterInput) {
  return buildJobCoverLetterTemplate(
    {
      ...input.target,
      type: "job",
    },
    input.resume,
    input.jobDetails,
  );
}

export function generatePropertyInquiryEmail(input: OptionalResumeWriterInput) {
  return buildPropertyInquiryEmailTemplate(
    {
      ...input.target,
      type: "property",
    },
    input.propertyDetails || {
      fullName: input.resume?.full_name || "",
      currentCity: input.resume?.current_city || "",
      selfIntroduction:
        input.target.selfIntroductionMemo ||
        input.resume?.self_introduction ||
        "",
      desiredMoveInDate: input.target.desiredMoveInDate || "",
      plannedStayDuration: input.target.plannedStayDuration || "",
    },
  );
}
