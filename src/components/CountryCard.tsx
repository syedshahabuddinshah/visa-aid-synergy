import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

export type CountryRecommendation = {
  name: string;
  score: number;
  requirements: string[];
  processingTime: string;
  visaTypes: string[];
  fundsRequired: number;
  eligibilityReason: string;
  isEligible: boolean;
};

const CountryCard = ({ recommendation }: { recommendation: CountryRecommendation }) => {
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
            <div className="flex flex-wrap gap-2">
              {recommendation.visaTypes.map((type, index) => (
                <Badge key={index} variant="secondary">
                  {type}
                </Badge>
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
              Required Funds: ${recommendation.fundsRequired.toLocaleString()}
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