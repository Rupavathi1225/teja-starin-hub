import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlogsTab } from "./BlogsTab";
import { CategoriesTab } from "./CategoriesTab";
import { RelatedSearchesTab } from "./RelatedSearchesTab";
import { PreLandingTab } from "./PreLandingTab";
import { AnalyticsTab } from "./AnalyticsTab";

const AdminPanel = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        
        <Tabs defaultValue="blogs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="blogs">Blogs</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="searches">Related Searches</TabsTrigger>
            <TabsTrigger value="prelanding">Pre-Landing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
          
          <TabsContent value="prelanding">
            <PreLandingTab />
          </TabsContent>
          
          <TabsContent value="analytics">
            <AnalyticsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
