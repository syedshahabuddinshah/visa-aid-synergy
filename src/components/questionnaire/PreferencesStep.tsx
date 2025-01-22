import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "../Questionnaire";

interface PreferencesStepProps {
  profile: UserProfile;
  onProfileChange: (updates: Partial<UserProfile>) => void;
  availableCountries: string[];
}

const PreferencesStep = ({ profile, onProfileChange, availableCountries }: PreferencesStepProps) => {
  const handleSelectAllCountries = () => {
    onProfileChange({ preferredCountries: availableCountries });
  };

  const handleDeselectAllCountries = () => {
    onProfileChange({ preferredCountries: [] });
  };

  return (
    <>
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
      <div className="space-y-2">
        <Label>Preferred Countries</Label>
        <div className="flex gap-2 mb-2">
          <Button
            variant="outline"
            onClick={handleSelectAllCountries}
            className="w-1/2"
          >
            Select All
          </Button>
          <Button
            variant="outline"
            onClick={handleDeselectAllCountries}
            className="w-1/2"
          >
            Deselect All
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {availableCountries.map((country) => (
            <Button
              key={country}
              variant={profile.preferredCountries.includes(country) ? "default" : "outline"}
              onClick={() => {
                const newCountries = profile.preferredCountries.includes(country)
                  ? profile.preferredCountries.filter((c) => c !== country)
                  : [...profile.preferredCountries, country];
                onProfileChange({ preferredCountries: newCountries });
              }}
              className="w-full"
            >
              {country}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};

export default PreferencesStep;