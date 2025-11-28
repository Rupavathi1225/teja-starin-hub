import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MingleRelatedSearchesTab } from "./MingleRelatedSearchesTab";
import { MingleWebResultsTab } from "./MingleWebResultsTab";
import { MingleLandingPagesTab } from "./MingleLandingPagesTab";
import { MingleAnalyticsTab } from "./MingleAnalyticsTab";
import { MinglePreLandingTab } from "./MinglePreLandingTab";

type EditorType = "related-searches" | "web-results" | "landing-pages" | "analytics" | "pre-landing";

export const MingleMoodyTab = () => {
  const [selectedEditor, setSelectedEditor] = useState<EditorType>("related-searches");

  const renderEditor = () => {
    switch (selectedEditor) {
      case "related-searches":
        return <MingleRelatedSearchesTab />;
      case "web-results":
        return <MingleWebResultsTab />;
      case "landing-pages":
        return <MingleLandingPagesTab />;
      case "analytics":
        return <MingleAnalyticsTab />;
      case "pre-landing":
        return <MinglePreLandingTab />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 mingle-moody-theme">
      <Card className="bg-mingle-dark border-mingle-border">
        <CardHeader>
          <CardTitle className="text-mingle-cyan text-2xl">Mingle Moody Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="text-sm font-medium text-mingle-text">Select Editor</label>
            <Select value={selectedEditor} onValueChange={(value) => setSelectedEditor(value as EditorType)}>
              <SelectTrigger className="w-full bg-mingle-darker border-mingle-border text-mingle-text hover:bg-mingle-dark focus:ring-mingle-cyan">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-mingle-darker border-mingle-border">
                <SelectItem value="related-searches" className="text-mingle-text hover:bg-mingle-dark focus:bg-mingle-dark focus:text-mingle-cyan">
                  Related Searches
                </SelectItem>
                <SelectItem value="web-results" className="text-mingle-text hover:bg-mingle-dark focus:bg-mingle-dark focus:text-mingle-cyan">
                  Web Results
                </SelectItem>
                <SelectItem value="landing-pages" className="text-mingle-text hover:bg-mingle-dark focus:bg-mingle-dark focus:text-mingle-cyan">
                  Landing Pages
                </SelectItem>
                <SelectItem value="pre-landing" className="text-mingle-text hover:bg-mingle-dark focus:bg-mingle-dark focus:text-mingle-cyan">
                  Pre-Landing
                </SelectItem>
                <SelectItem value="analytics" className="text-mingle-text hover:bg-mingle-dark focus:bg-mingle-dark focus:text-mingle-cyan">
                  Analytics
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        {renderEditor()}
      </div>
    </div>
  );
};
