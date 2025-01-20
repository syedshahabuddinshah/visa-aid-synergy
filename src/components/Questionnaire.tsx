import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export type UserProfile = {
  age: string;
  education: string;
  workExperience: string;
  languageScore: string;
  preferredCountries: string[];
  purpose: string;
};

const Questionnaire = ({ onComplete }: { onComplete: (profile: UserProfile) => void }) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    age: "",
    education: "",
    workExperience: "",
    languageScore: "",
    preferredCountries: [],
    purpose: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (step === 1 && (!profile.age || !profile.education)) {
      toast({
        title: "Please fill all fields",
        description: "Age and education are required to proceed.",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && (!profile.workExperience || !profile.languageScore)) {
      toast({
        title: "Please fill all fields",
        description: "Work experience and language score are required to proceed.",
        variant: "destructive",
      });
      return;
    }
    if (step === 3 && (!profile.purpose || profile.preferredCountries.length === 0)) {
      toast({
        title: "Please fill all fields",
        description: "Purpose and preferred countries are required to proceed.",
        variant: "destructive",
      });
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Authentication required",
            description: "Please sign in to save your profile.",
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase.from('profiles').upsert({
          id: user.id,
          age: parseInt(profile.age),
          education: profile.education,
          work_experience: parseInt(profile.workExperience),
          language_score: profile.languageScore,
          preferred_countries: profile.preferredCountries,
          purpose: profile.purpose,
        });

        if (error) throw error;

        toast({
          title: "Profile saved!",
          description: "Your immigration profile has been saved successfully.",
        });

        onComplete(profile);
      } catch (error) {
        console.error('Error saving profile:', error);
        toast({
          title: "Error",
          description: "Failed to save your profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // ... keep existing code (form rendering JSX)

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg animate-fadeIn">
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`w-1/3 h-2 rounded-full mx-1 ${
                num <= step ? "bg-accent" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <h2 className="text-2xl font-bold text-primary mb-4">
          {step === 1
            ? "Personal Information"
            : step === 2
            ? "Professional Background"
            : "Immigration Preferences"}
        </h2>
      </div>

      <div className="space-y-6">
        {step === 1 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                placeholder="Enter your age"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="education">Highest Education Level</Label>
              <Select
                value={profile.education}
                onValueChange={(value) => setProfile({ ...profile, education: value })}
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
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="workExperience">Work Experience (years)</Label>
              <Input
                id="workExperience"
                type="number"
                value={profile.workExperience}
                onChange={(e) => setProfile({ ...profile, workExperience: e.target.value })}
                placeholder="Years of work experience"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="languageScore">Language Score (IELTS/TOEFL)</Label>
              <Input
                id="languageScore"
                value={profile.languageScore}
                onChange={(e) => setProfile({ ...profile, languageScore: e.target.value })}
                placeholder="Enter your language score"
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="purpose">Immigration Purpose</Label>
              <Select
                value={profile.purpose}
                onValueChange={(value) => setProfile({ ...profile, purpose: value })}
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
              <div className="grid grid-cols-2 gap-2">
                {["Canada", "Australia", "UK", "USA", "New Zealand", "Germany"].map((country) => (
                  <Button
                    key={country}
                    variant={profile.preferredCountries.includes(country) ? "default" : "outline"}
                    onClick={() => {
                      const newCountries = profile.preferredCountries.includes(country)
                        ? profile.preferredCountries.filter((c) => c !== country)
                        : [...profile.preferredCountries, country];
                      setProfile({ ...profile, preferredCountries: newCountries });
                    }}
                    className="w-full"
                  >
                    {country}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button className="ml-auto" onClick={handleNext} disabled={isSubmitting}>
            {step === 3 ? (isSubmitting ? "Saving..." : "Get Recommendations") : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
