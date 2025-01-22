import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export type VisaType = {
  type: string;
  requirements: string[];
  processingTime: string;
};

export type CountryRecommendation = {
  name: string;
  score: number;
  requirements: string[];
  processingTime: string;
  visaTypes: VisaType[];
  eligibilityFactors: string[];
  ineligibilityFactors: string[];
};

const CountryCard = ({ recommendation }: { recommendation: CountryRecommendation }) => {
  return (
    <Card className="w-full transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">{recommendation.name}</CardTitle>
          <Badge variant="secondary">{Math.round(recommendation.score)}% Match</Badge>
        </div>
        <CardDescription>Processing Time: {recommendation.processingTime}</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="requirements">
            <AccordionTrigger>General Requirements</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc list-inside space-y-1">
                {recommendation.requirements.map((req, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {req}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="visas">
            <AccordionTrigger>Available Visa Types</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {recommendation.visaTypes.map((visa, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <h4 className="font-semibold">{visa.type}</h4>
                    <p className="text-sm text-gray-600">Processing: {visa.processingTime}</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                      {visa.requirements.map((req, reqIndex) => (
                        <li key={reqIndex}>{req}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="eligibility">
            <AccordionTrigger>Eligibility Analysis</AccordionTrigger>
            <AccordionContent>
              {recommendation.eligibilityFactors.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-green-600 mb-2">Positive Factors:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {recommendation.eligibilityFactors.map((factor, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {recommendation.ineligibilityFactors.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">Areas of Concern:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {recommendation.ineligibilityFactors.map((factor, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default CountryCard;