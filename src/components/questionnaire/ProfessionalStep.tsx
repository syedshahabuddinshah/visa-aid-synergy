import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserProfile } from "../Questionnaire";

interface ProfessionalStepProps {
  profile: UserProfile;
  onProfileChange: (updates: Partial<UserProfile>) => void;
}

const ProfessionalStep = ({ profile, onProfileChange }: ProfessionalStepProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="workExperience">Work Experience (years)</Label>
        <Input
          id="workExperience"
          type="number"
          value={profile.workExperience}
          onChange={(e) => onProfileChange({ workExperience: e.target.value })}
          placeholder="Years of work experience"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="languageScore">Language Score (IELTS/TOEFL)</Label>
        <Input
          id="languageScore"
          value={profile.languageScore}
          onChange={(e) => onProfileChange({ languageScore: e.target.value })}
          placeholder="Enter your language score"
        />
      </div>
    </>
  );
};

export default ProfessionalStep;