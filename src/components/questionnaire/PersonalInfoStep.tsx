import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
      <div className="space-y-2">
        <Label htmlFor="fieldOfStudy">Field of Study</Label>
        <Input
          id="fieldOfStudy"
          value={profile.fieldOfStudy}
          onChange={(e) => onProfileChange({ fieldOfStudy: e.target.value })}
          placeholder="Enter your field of study"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maritalStatus">Marital Status</Label>
        <Select
          value={profile.maritalStatus}
          onValueChange={(value) => onProfileChange({ maritalStatus: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select marital status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single</SelectItem>
            <SelectItem value="married">Married</SelectItem>
            <SelectItem value="divorced">Divorced</SelectItem>
            <SelectItem value="widowed">Widowed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {profile.maritalStatus === "married" && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="spouseIncluded"
              checked={profile.spouseIncluded}
              onCheckedChange={(checked) => onProfileChange({ spouseIncluded: checked })}
            />
            <Label htmlFor="spouseIncluded">Include spouse in application</Label>
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="numberOfDependents">Number of Dependents</Label>
        <Input
          id="numberOfDependents"
          type="number"
          min="0"
          value={profile.numberOfDependents}
          onChange={(e) => onProfileChange({ numberOfDependents: e.target.value })}
          placeholder="Number of dependents"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="availableFunds">Available Funds (USD)</Label>
        <Input
          id="availableFunds"
          type="number"
          value={profile.availableFunds}
          onChange={(e) => onProfileChange({ availableFunds: e.target.value })}
          placeholder="Enter your available funds"
        />
      </div>
    </>
  );
};

export default PersonalInfoStep;