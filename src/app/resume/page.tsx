import { getBranding } from '@/data';
import {
  getEngineering,
  getResume,
  getResumeData,
  getSkills,
  getWorkExperience,
} from '@/data/resume';
import { ResumeView } from './ResumeView';

export default function ResumePage() {
  const resumeDoc = getResume();
  return (
    <ResumeView
      personalName={resumeDoc.name}
      personalTitle={resumeDoc.title}
      location={resumeDoc.contact.location}
      branding={getBranding()}
      resume={getResumeData()}
      jobs={getWorkExperience()}
      skills={getSkills()}
      engineering={getEngineering()}
    />
  );
}
