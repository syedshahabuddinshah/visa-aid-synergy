import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "../Questionnaire";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface PreferencesStepProps {
  profile: UserProfile;
  onProfileChange: (updates: Partial<UserProfile>) => void;
}

// List of countries for selection
const countries = [
  "Australia", "Canada", "United Kingdom", "United States", "New Zealand",
  "Germany", "France", "Spain", "Italy", "Netherlands", "Sweden", "Norway",
  "Denmark", "Finland", "Ireland", "Singapore", "Japan", "South Korea"
].sort();

const PreferencesStep = ({ profile, onProfileChange }: PreferencesStepProps) => {
  const handleCountrySelect = (country: string) => {
    if (profile.preferredCountries.includes(country)) return;
    if (profile.preferredCountries.length >= 3) return;
    
    onProfileChange({
      preferredCountries: [...profile.preferredCountries, country]
    });
  };

  const removeCountry = (country: string) => {
    onProfileChange({
      preferredCountries: profile.preferredCountries.filter(c => c !== country)
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Immigration Purpose</Label>
        <Select
          value={profile.purpose}
          onValueChange={(value) => onProfileChange({ purpose: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your main purpose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="study">Study (Student Visa)</SelectItem>
            <SelectItem value="work">Work (Work Visa)</SelectItem>
            <SelectItem value="permanent">Permanent Residence</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Select Up to 3 Preferred Countries</Label>
        <Select
          value=""
          onValueChange={handleCountrySelect}
          disabled={profile.preferredCountries.length >= 3}
        >
          <SelectTrigger>
            <SelectValue placeholder="Add a country" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              {countries.map((country) => (
                <SelectItem
                  key={country}
                  value={country}
                  disabled={profile.preferredCountries.includes(country)}
                >
                  {country}
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-2 mt-2">
          {profile.preferredCountries.map((country) => (
            <Badge key={country} variant="secondary" className="px-2 py-1">
              {country}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-2"
                onClick={() => removeCountry(country)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        {profile.preferredCountries.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Please select at least one country to get recommendations
          </p>
        )}
      </div>
    </div>
  );
};

export default PreferencesStep;