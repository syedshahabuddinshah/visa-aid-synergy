import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export type VisaOption = {
  name: string;
  description: string;
  points: {
    category: string;
    available: number;
    scored: number;
    details: string;
  }[];
  requiredFunds: {
    base: number;
    perDependent: number;
    spouse: number;
  };
};

export type CountryRecommendation = {
  name: string;
  score: number;
  requirements: string[];
  processingTime: string;
  visaTypes: VisaOption[];
  fundsRequired: number;
  eligibilityReason: string;
  isEligible: boolean;
  dependentFunds: {
    spouse: number;
    perDependent: number;
  };
};

const CountryCard = ({ recommendation }: { recommendation: CountryRecommendation }) => {
  const [expandedVisa, setExpandedVisa] = useState<string | null>(null);

  const totalDependentFunds = recommendation.dependentFunds.spouse + 
    (recommendation.dependentFunds.perDependent * recommendation.requirements.filter(r => r.includes('dependent')).length);

  return (
    <Card className="w-full transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">{recommendation.name}</CardTitle>
          <Badge variant={recommendation.isEligible ? "default" : "destructive"}>
            {Math.round(recommendation.score * 100)}% Match
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          {recommendation.isEligible ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
          {recommendation.eligibilityReason}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Available Visa Types:</h4>
            <div className="space-y-2">
              {recommendation.visaTypes.map((visa, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <Button
                    variant="ghost"
                    className="w-full flex justify-between items-center"
                    onClick={() => setExpandedVisa(expandedVisa === visa.name ? null : visa.name)}
                  >
                    <span className="font-medium">{visa.name}</span>
                    {expandedVisa === visa.name ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {expandedVisa === visa.name && (
                    <div className="mt-4 space-y-4">
                      <p className="text-sm text-gray-600">{visa.description}</p>
                      
                      <div>
                        <h5 className="font-medium mb-2">Points Breakdown:</h5>
                        <div className="space-y-2">
                          {visa.points.map((point, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span>{point.category}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">
                                  {point.scored}/{point.available}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {point.details}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Required Funds:</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Base requirement:</span>
                            <span>${visa.requiredFunds.base.toLocaleString()}</span>
                          </div>
                          {visa.requiredFunds.spouse > 0 && (
                            <div className="flex justify-between">
                              <span>Additional for spouse:</span>
                              <span>${visa.requiredFunds.spouse.toLocaleString()}</span>
                            </div>
                          )}
                          {visa.requiredFunds.perDependent > 0 && (
                            <div className="flex justify-between">
                              <span>Per dependent:</span>
                              <span>${visa.requiredFunds.perDependent.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Key Requirements:</h4>
            <ul className="list-disc list-inside space-y-1">
              {recommendation.requirements.map((req, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <Alert>
            <AlertDescription>
              <div className="space-y-1">
                <div>Base Required Funds: ${recommendation.fundsRequired.toLocaleString()}</div>
                {totalDependentFunds > 0 && (
                  <div>Additional Funds for Dependents: ${totalDependentFunds.toLocaleString()}</div>
                )}
                <div className="font-medium">
                  Total Required: ${(recommendation.fundsRequired + totalDependentFunds).toLocaleString()}
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Processing Time:</span>
            <span className="font-medium">{recommendation.processingTime}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountryCard;