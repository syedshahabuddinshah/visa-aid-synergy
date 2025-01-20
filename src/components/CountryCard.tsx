import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type CountryRecommendation = {
  name: string;
  score: number;
  requirements: string[];
  processingTime: string;
  visaType: string;
};

const CountryCard = ({ recommendation }: { recommendation: CountryRecommendation }) => {
  return (
    <Card className="w-full transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">{recommendation.name}</CardTitle>
          <Badge variant="secondary">{Math.round(recommendation.score * 100)}% Match</Badge>
        </div>
        <CardDescription>Recommended Visa: {recommendation.visaType}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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