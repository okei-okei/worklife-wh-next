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
  english_level?: string | null;
  self_introduction?: string | null;
};

type ApplicationWriterInput = {
  target?: ApplicationTarget;
  job?: ApplicationJob;
  resume: ApplicationResume;
};

type OptionalResumeWriterInput = {
  target: ApplicationTarget;
  resume?: ApplicationResume | null;
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

function formatAvailableFrom(value: string | null | undefined) {
  if (!value) return "as soon as possible";

  return value;
}

function normalizeInput(
  input: ApplicationWriterInput,
): NormalizedApplicationWriterInput {
  return {
    target: input.target || input.job || { title: "[Target]", type: "job" },
    resume: input.resume,
  };
}

function normalizeOptionalResumeInput(
  input: OptionalResumeWriterInput,
): NormalizedApplicationWriterInput {
  return {
    target: input.target,
    resume: input.resume || {},
  };
}

function getConfiguredApplicationWriterProvider(): ApplicationWriterProvider {
  const provider = process.env.NEXT_PUBLIC_APPLICATION_WRITER_PROVIDER;

  if (provider === "template" || provider === "openai") {
    return provider;
  }

  return "template";
}

const templateApplicationWriter: ApplicationWriter = {
  generateApplicationEmail({ target, resume }) {
    const fullName = valueOrPlaceholder(resume.full_name, "[Your Name]");
    const email = valueOrPlaceholder(resume.email, "[Your Email]");
    const phone = valueOrPlaceholder(resume.phone, "[Your Phone Number]");
    const visaType = valueOrPlaceholder(resume.visa_type, "a valid visa");
    const availableFrom = formatAvailableFrom(resume.available_from);
    const introduction = valueOrPlaceholder(
      resume.self_introduction,
      "I am currently in New Zealand on a working holiday and I am looking for a suitable opportunity.",
    );
    const experience = valueOrPlaceholder(
      resume.work_experience,
      "I have relevant experience and I am confident I can communicate clearly and act responsibly.",
    );
    const skills = valueOrPlaceholder(
      resume.skills,
      "I have strong communication skills, a positive attitude, and I am willing to learn quickly.",
    );
    const englishLevel = valueOrPlaceholder(
      resume.english_level,
      "conversational English",
    );

    if (target.type === "property") {
      const locationLine = target.location || target.address;

      return `Subject: Enquiry about ${target.title}

Dear Property Manager,

I am writing to enquire about ${target.title}${locationLine ? ` in ${locationLine}` : ""}.

${introduction}

I currently hold ${visaType}, and I am available from ${availableFrom}. My English level is ${englishLevel}.

A little about me:
${experience}

My key strengths include:
${skills}

I would be grateful for the opportunity to arrange a viewing or discuss the next steps. I can provide any further information if needed.

Thank you for your time and consideration.

Kind regards,
${fullName}
${email}
${phone}`;
    }

    return `Subject: Application for ${target.title}

Dear Hiring Manager,

I am writing to apply for the ${target.title} position.

${introduction}

I currently hold ${visaType}, and I am available to start from ${availableFrom}. My English level is ${englishLevel}.

My experience includes:
${experience}

My key skills include:
${skills}

I would be grateful for the opportunity to discuss my application in an interview. I am flexible with interview times and can provide any further information if needed.

Thank you for your time and consideration.

Kind regards,
${fullName}
${email}
${phone}`;
  },

  generateCoverLetter({ target, resume }) {
    const fullName = valueOrPlaceholder(resume.full_name, "[Your Name]");
    const email = valueOrPlaceholder(resume.email, "[Your Email]");
    const phone = valueOrPlaceholder(resume.phone, "[Your Phone Number]");
    const visaType = valueOrPlaceholder(resume.visa_type, "a valid visa");
    const availableFrom = formatAvailableFrom(resume.available_from);
    const introduction = valueOrPlaceholder(
      resume.self_introduction,
      "I am motivated, reliable, and excited to build my life in New Zealand.",
    );
    const experience = valueOrPlaceholder(
      resume.work_experience,
      "I have relevant experience that has helped me build practical skills, reliability, and a strong sense of responsibility.",
    );
    const skills = valueOrPlaceholder(
      resume.skills,
      "My strengths include communication, teamwork, adaptability, and a willingness to learn quickly.",
    );

    if (target.type === "property") {
      return `Dear Property Manager,

I am writing to express my interest in ${target.title}.

${introduction}

I am currently looking for a comfortable and responsible living arrangement in New Zealand. I currently hold ${visaType}, and I am available from ${availableFrom}.

My background includes:
${experience}

My strengths as a tenant include:
${skills}

I would appreciate the opportunity to arrange a viewing or discuss the application process. I can provide further details or references if required.

Thank you for considering my enquiry. I look forward to hearing from you.

Kind regards,
${fullName}
${email}
${phone}`;
    }

    return `Dear Hiring Manager,

I am writing to express my interest in the ${target.title} position.

${introduction}

Through my previous experience, I have developed skills that I believe would be valuable for this role. My relevant experience includes:
${experience}

My key strengths include:
${skills}

I currently hold ${visaType}, and I am able to work legally in New Zealand. I am available to start from ${availableFrom}.

I would welcome the opportunity to discuss how my experience and attitude could contribute to your team. I am available for an interview at your convenience.

Thank you for considering my application. I look forward to hearing from you.

Kind regards,
${fullName}
${email}
${phone}`;
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
  return getApplicationWriter().generateApplicationEmail(
    normalizeOptionalResumeInput({
      ...input,
      target: {
        ...input.target,
        type: "job",
      },
    }),
  );
}

export function generateJobCoverLetter(input: OptionalResumeWriterInput) {
  return getApplicationWriter().generateCoverLetter(
    normalizeOptionalResumeInput({
      ...input,
      target: {
        ...input.target,
        type: "job",
      },
    }),
  );
}

export function generatePropertyInquiryEmail(input: OptionalResumeWriterInput) {
  const fullName = valueOrPlaceholder(input.resume?.full_name, "[Your Name]");
  const email = valueOrPlaceholder(input.resume?.email, "[Your Email]");
  const phone = valueOrPlaceholder(input.resume?.phone, "[Your Phone Number]");
  const target = input.target;
  const locationLine = target.location || target.address;

  return `Subject: Enquiry about ${target.title}

Dear Property Manager,

I am writing to enquire about ${target.title}${locationLine ? ` in ${locationLine}` : ""}.

I am interested in this property and would like to ask whether it is still available. If possible, I would also appreciate the opportunity to arrange a viewing or receive more details about the room, rent, bond, move-in date, and any house rules.

Please let me know the next steps for applying or arranging a viewing.

Thank you for your time. I look forward to hearing from you.

Kind regards,
${fullName}
${email}
${phone}`;
}
