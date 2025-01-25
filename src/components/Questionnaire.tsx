import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useRecommendations } from "@/contexts/RecommendationsContext";
import PersonalInfoStep from "./questionnaire/PersonalInfoStep";
import ProfessionalStep from "./questionnaire/ProfessionalStep";
import PreferencesStep from "./questionnaire/PreferencesStep";
import RecommendationsList from "./recommendations/RecommendationsList";
import { Button } from "@/components/ui/button";
import { QuestionnaireLogic } from "./questionnaire/QuestionnaireLogic";

export type UserProfile = {
  age: string;
  education: string;
  workExperience: string;
  languageScore: string;
  preferredCountries: string[];
  purpose: string;
  availableFunds: string;
  fieldOfStudy: string;
  maritalStatus: string;
  numberOfDependents: string;
  spouseIncluded: boolean;
};

const Questionnaire = ({ onComplete }: { onComplete: (profile: UserProfile) => void }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setRecommendations } = useRecommendations();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>(() => {
    // Try to restore profile from session storage
    const savedProfile = sessionStorage.getItem('tempProfile');
    const defaultProfile = {
      age: "",
      education: "",
      workExperience: "",
      languageScore: "",
      preferredCountries: [],
      purpose: "",
      availableFunds: "",
      fieldOfStudy: "",
      maritalStatus: "single",
      numberOfDependents: "0",
      spouseIncluded: false,
    };
    
    return savedProfile ? JSON.parse(savedProfile) : defaultProfile;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    const checkExistingProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          setIsLoading(false);
          return;
        }

        if (data) {
          const formattedProfile: UserProfile = {
            age: data.age?.toString() || "",
            education: data.education || "",
            workExperience: data.work_experience?.toString() || "",
            languageScore: data.language_score || "",
            preferredCountries: data.preferred_countries || [],
            purpose: data.purpose || "",
            availableFunds: data.available_funds?.toString() || "",
            fieldOfStudy: data.field_of_study || "",
            maritalStatus: data.marital_status || "single",
            numberOfDependents: data.number_of_dependents?.toString() || "0",
            spouseIncluded: data.spouse_included || false,
          };
          setProfile(formattedProfile);
          
          const questionnaireLogic = new QuestionnaireLogic();
          const recommendations = await questionnaireLogic.generateRecommendations(formattedProfile);
          setRecommendations(recommendations);
          setShowRecommendations(true);
          onComplete(formattedProfile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Check if we have a saved step in session storage
    const savedStep = sessionStorage.getItem('lastStep');
    if (savedStep) {
      setStep(parseInt(savedStep));
      sessionStorage.removeItem('lastStep');
    }

    checkExistingProfile();
  }, [setRecommendations, onComplete]);

  // Save profile to session storage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('tempProfile', JSON.stringify(profile));
  }, [profile]);

  const handleProfileChange = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!profile.age || !profile.education || !profile.availableFunds || !profile.fieldOfStudy) {
          toast({
            title: "Please fill all fields",
            description: "All personal information fields are required to proceed.",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 2:
        if (!profile.workExperience || !profile.languageScore) {
          toast({
            title: "Please fill all fields",
            description: "Work experience and language score are required to proceed.",
            variant: "destructive",
          });
          return false;
        }
        break;
      case 3:
        if (!profile.purpose) {
          toast({
            title: "Please fill all fields",
            description: "Immigration purpose is required to proceed.",
            variant: "destructive",
          });
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    
    if (step < 3) {
      setStep(step + 1);
      sessionStorage.setItem('lastStep', (step + 1).toString());
    } else {
      setIsSubmitting(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          sessionStorage.setItem('tempProfile', JSON.stringify(profile));
          sessionStorage.setItem('lastStep', step.toString());
          
          toast({
            title: "Authentication required",
            description: "Please sign in to save your profile and get recommendations.",
          });
          
          navigate("/login");
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
          available_funds: parseInt(profile.availableFunds),
          field_of_study: profile.fieldOfStudy,
          marital_status: profile.maritalStatus,
          number_of_dependents: parseInt(profile.numberOfDependents),
          spouse_included: profile.spouseIncluded,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error('Error saving profile:', error);
          throw error;
        }

        // Only clear session storage after successful save
        sessionStorage.removeItem('tempProfile');
        sessionStorage.removeItem('lastStep');

        toast({
          title: "Profile saved!",
          description: "Your immigration profile has been saved successfully.",
        });

        const questionnaireLogic = new QuestionnaireLogic();
        const recommendations = await questionnaireLogic.generateRecommendations(profile);
        setRecommendations(recommendations);
        setShowRecommendations(true);
        onComplete(profile);
      } catch (error: any) {
        console.error('Error saving profile:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to save your profile. Please try again.",
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
      sessionStorage.setItem('lastStep', (step - 1).toString());
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8">Loading...</div>;
  }

  if (showRecommendations) {
    return <RecommendationsList />;
  }

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
            : "Immigration Purpose"}
        </h2>
      </div>

      <div className="space-y-6">
        {step === 1 && (
          <PersonalInfoStep profile={profile} onProfileChange={handleProfileChange} />
        )}

        {step === 2 && (
          <ProfessionalStep profile={profile} onProfileChange={handleProfileChange} />
        )}

        {step === 3 && (
          <PreferencesStep 
            profile={profile} 
            onProfileChange={handleProfileChange}
          />
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