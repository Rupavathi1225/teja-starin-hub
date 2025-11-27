import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BlogsTab } from "./BlogsTab";
import { CategoriesTab } from "./CategoriesTab";
import { RelatedSearchesTab } from "./RelatedSearchesTab";
import { PreLandingTab } from "./PreLandingTab";
import { WebResultsTab } from "./WebResultsTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { EmailCapturesTab } from "./EmailCapturesTab";
import { MingleRelatedSearchesTab } from "./mingle/MingleRelatedSearchesTab";
import { MingleWebResultsTab } from "./mingle/MingleWebResultsTab";
import { MingleLandingPagesTab } from "./mingle/MingleLandingPagesTab";
import { MingleAnalyticsTab } from "./mingle/MingleAnalyticsTab";
import { MinglePreLandingTab } from "./mingle/MinglePreLandingTab";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const AdminPanel = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
        
        <Tabs defaultValue="blogs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <TabsTrigger value="blogs">Blogs</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="searches">Related Searches</TabsTrigger>
            <TabsTrigger value="webresults">Web Results</TabsTrigger>
            <TabsTrigger value="prelanding">Pre-Landing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="emails">Email Captures</TabsTrigger>
            <TabsTrigger value="mingle-searches">Mingle: Searches</TabsTrigger>
            <TabsTrigger value="mingle-results">Mingle: Results</TabsTrigger>
            <TabsTrigger value="mingle-landing">Mingle: Landing</TabsTrigger>
            <TabsTrigger value="mingle-prelanding">Mingle: Pre-Landing</TabsTrigger>
            <TabsTrigger value="mingle-analytics">Mingle: Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="blogs">
            <BlogsTab />
          </TabsContent>
          
          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>
          
          <TabsContent value="searches">
            <RelatedSearchesTab />
          </TabsContent>
          
          <TabsContent value="webresults">
            <WebResultsTab />
          </TabsContent>
          
          <TabsContent value="prelanding">
            <PreLandingTab />
          </TabsContent>
          
        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="emails">
          <EmailCapturesTab />
        </TabsContent>

        <TabsContent value="mingle-searches">
          <MingleRelatedSearchesTab />
        </TabsContent>

        <TabsContent value="mingle-results">
          <MingleWebResultsTab />
        </TabsContent>

        <TabsContent value="mingle-landing">
          <MingleLandingPagesTab />
        </TabsContent>

        <TabsContent value="mingle-prelanding">
          <MinglePreLandingTab />
        </TabsContent>

        <TabsContent value="mingle-analytics">
          <MingleAnalyticsTab />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
