import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "../Questionnaire";

interface PreferencesStepProps {
  profile: UserProfile;
  onProfileChange: (updates: Partial<UserProfile>) => void;
}

const PreferencesStep = ({ profile, onProfileChange }: PreferencesStepProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="purpose">Immigration Purpose</Label>
      <Select
        value={profile.purpose}
        onValueChange={(value) => onProfileChange({ purpose: value })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select purpose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="study">Study</SelectItem>
          <SelectItem value="work">Work</SelectItem>
          <SelectItem value="permanent">Permanent Residence</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PreferencesStep;