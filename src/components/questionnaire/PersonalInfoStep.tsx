import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "../Questionnaire";

interface PersonalInfoStepProps {
  profile: UserProfile;
  onProfileChange: (updates: Partial<UserProfile>) => void;
}

const PersonalInfoStep = ({ profile, onProfileChange }: PersonalInfoStepProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="age">Age</Label>
        <Input
          id="age"
          type="number"
          value={profile.age}
          onChange={(e) => onProfileChange({ age: e.target.value })}
          placeholder="Enter your age"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="education">Highest Education Level</Label>
        <Select
          value={profile.education}
          onValueChange={(value) => onProfileChange({ education: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select education level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high-school">High School</SelectItem>
            <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
            <SelectItem value="masters">Master's Degree</SelectItem>
            <SelectItem value="phd">PhD</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default PersonalInfoStep;