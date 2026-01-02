import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FraudDetectionResult {
  isSuspicious: boolean;
  riskLevel: "low" | "medium" | "high";
  flags: string[];
  recommendations: string[];
  score: number;
}

interface FraudDetectorProps {
  propertyId: string;
  propertyTitle: string;
  propertyDescription?: string;
  price?: number;
}

export const FraudDetector = ({
  propertyId,
  propertyTitle,
  propertyDescription,
  price,
}: FraudDetectorProps) => {
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FraudDetectionResult | null>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE}/api/fraud-detection/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          title: propertyTitle,
          description: propertyDescription,
          price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to analyze property");
      }

      setResult(data);

      toast({
        title: data.isSuspicious ? "⚠️ Suspicious Activity Detected" : "✅ Property Verified",
        description: `Risk Level: ${data.riskLevel.toUpperCase()}`,
        variant: data.isSuspicious ? "destructive" : "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fraud Detection</CardTitle>
        <CardDescription>AI-powered property verification</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Button onClick={handleAnalyze} disabled={analyzing} className="w-full">
          {analyzing ? "Analyzing..." : "Run Fraud Detection"}
        </Button>

        {result && (
          <>
            {/* Risk Level Alert */}
            <Alert
              className={`border-2 ${getRiskColor(result.riskLevel)}`}
              variant={result.isSuspicious ? "destructive" : "default"}
            >
              <div className="flex items-start gap-3">
                {result.isSuspicious ? (
                  <AlertTriangle className="w-5 h-5 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 mt-0.5" />
                )}
                <div>
                  <AlertDescription className="font-semibold">
                    {result.isSuspicious ? "Suspicious Activity Detected" : "Property Verified"}
                  </AlertDescription>
                  <AlertDescription className="text-xs mt-1">
                    Risk Level:{" "}
                    <Badge
                      variant="outline"
                      className={`ml-1 ${getRiskColor(result.riskLevel)}`}
                    >
                      {result.riskLevel.toUpperCase()}
                    </Badge>
                  </AlertDescription>
                </div>
              </div>
            </Alert>

            {/* Risk Score */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Fraud Risk Score</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      result.score < 33
                        ? "bg-green-500"
                        : result.score < 66
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
                <span className="font-bold">{Math.round(result.score)}%</span>
              </div>
            </div>

            {/* Red Flags */}
            {result.flags.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Red Flags
                </p>
                <ul className="space-y-1">
                  {result.flags.map((flag, idx) => (
                    <li key={idx} className="text-sm text-red-600 flex items-start gap-2">
                      <span className="text-red-400 mt-1">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Recommendations</p>
                <ul className="space-y-1">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-green-600 flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {!result && (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
              Click "Run Fraud Detection" to analyze this property for suspicious activity
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FraudDetector;
