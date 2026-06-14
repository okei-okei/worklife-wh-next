export type ApplicationJob = {
  title: string;
  url?: string | null;
};

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

function valueOrPlaceholder(value: string | null | undefined, placeholder: string) {
  return value?.trim() ? value.trim() : placeholder;
}

function formatAvailableFrom(value: string | null | undefined) {
  if (!value) return "as soon as possible";

  return value;
}

export function generateApplicationEmail({
  job,
  resume,
}: {
  job: ApplicationJob;
  resume: ApplicationResume;
}) {
  const fullName = valueOrPlaceholder(resume.full_name, "[Your Name]");
  const email = valueOrPlaceholder(resume.email, "[Your Email]");
  const phone = valueOrPlaceholder(resume.phone, "[Your Phone Number]");
  const visaType = valueOrPlaceholder(resume.visa_type, "a valid work visa");
  const availableFrom = formatAvailableFrom(resume.available_from);
  const introduction = valueOrPlaceholder(
    resume.self_introduction,
    "I am currently looking for a working holiday job opportunity and I am very interested in this role.",
  );
  const experience = valueOrPlaceholder(
    resume.work_experience,
    "I have relevant work experience and I am confident I can contribute positively to your team.",
  );
  const skills = valueOrPlaceholder(
    resume.skills,
    "I have strong communication skills, a positive attitude, and I am willing to learn quickly.",
  );
  const englishLevel = valueOrPlaceholder(
    resume.english_level,
    "conversational English",
  );

  // This is intentionally template-based for the MVP. Later, this function can
  // call an AI API from a server-side route while keeping the page UI unchanged.
  return `Subject: Application for ${job.title}

Dear Hiring Manager,

I am writing to apply for the ${job.title} position.

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
}

export function generateCoverLetter({
  job,
  resume,
}: {
  job: ApplicationJob;
  resume: ApplicationResume;
}) {
  const fullName = valueOrPlaceholder(resume.full_name, "[Your Name]");
  const email = valueOrPlaceholder(resume.email, "[Your Email]");
  const phone = valueOrPlaceholder(resume.phone, "[Your Phone Number]");
  const visaType = valueOrPlaceholder(resume.visa_type, "a valid work visa");
  const availableFrom = formatAvailableFrom(resume.available_from);
  const introduction = valueOrPlaceholder(
    resume.self_introduction,
    "I am motivated, reliable, and excited to contribute to a workplace in New Zealand.",
  );
  const experience = valueOrPlaceholder(
    resume.work_experience,
    "I have relevant work experience that has helped me build practical skills and a strong work ethic.",
  );
  const skills = valueOrPlaceholder(
    resume.skills,
    "My strengths include communication, teamwork, adaptability, and a willingness to learn quickly.",
  );

  // This is intentionally template-based for the MVP. Later, this function can
  // be replaced by an AI-backed implementation without changing the page UI.
  return `Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position.

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
}
