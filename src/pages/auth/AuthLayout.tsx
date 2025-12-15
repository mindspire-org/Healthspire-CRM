import { useState } from "react";
import AdminLogin from "./AdminLogin";
import ClientSignup from "./ClientSignup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthLayout() {
  const logoCandidates = ["/HealthSpire logo image.png", "/HealthSpire logo.png", "/healthspire-logo.svg", "/healthspire-logo.png", "/logo.svg"]; 
  const [logoSrc, setLogoSrc] = useState(logoCandidates[0]);
  const onLogoError = () => { const i = logoCandidates.indexOf(logoSrc); if (i < logoCandidates.length - 1) setLogoSrc(logoCandidates[i+1]); };
  const heroCandidates = ["/CRM login.png", "/crm-login.jpg", "/login.png", "/login.jpg", "/auth.png", "/auth.jpg"]; 
  const [heroSrc, setHeroSrc] = useState(heroCandidates[0]);
  const onHeroError = () => { const i = heroCandidates.indexOf(heroSrc); if (i < heroCandidates.length - 1) setHeroSrc(heroCandidates[i+1]); };
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col items-center justify-center bg-muted/30 dark:bg-muted/20 p-10">
        <div className="max-w-xl w-full text-center space-y-6">
          <div className="rounded-2xl overflow-hidden shadow-sm w-full">
            <img src={heroSrc} onError={onHeroError} alt="Login" className="w-full h-[26rem] xl:h-[30rem] object-cover" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-lg">
          <div className="mb-6">
            <div className="lg:hidden flex items-center gap-2">
              <img src={logoSrc} onError={onLogoError} alt="HealthSpire" className="h-10" />
            </div>
            <div className="lg:hidden text-muted-foreground text-center">Enterprise CRM & Client Management Platform</div>
            <div className="hidden lg:flex flex-col items-center gap-2">
              <img src={logoSrc} onError={onLogoError} alt="HealthSpire" className="h-16 md:h-20" />
              <div className="text-muted-foreground text-center">Enterprise CRM & Client Management Platform</div>
            </div>
          </div>
          <div className="rounded-2xl border bg-card shadow-sm p-4 sm:p-6">
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="admin">Admin Login</TabsTrigger>
                <TabsTrigger value="client">Client Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="admin" className="mt-4">
                <AdminLogin />
              </TabsContent>
              <TabsContent value="client" className="mt-4">
                <ClientSignup />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
