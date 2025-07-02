import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LimeyLogo from "@/components/LimeyLogo";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <LimeyLogo />
        
        <div className="space-y-4">
          <h2 className="text-2xl text-foreground">
            Trinidad & Tobago's Home for Local Creators
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Share your moments, discover local talent, and connect with the Caribbean community.
          </p>
        </div>

        <div className="space-y-3">
          <Link to="/signup">
            <Button variant="neon" className="w-64">
              Join Limey
            </Button>
          </Link>
          
          <div>
            <Link to="/login">
              <Button variant="outline" className="w-64">
                Sign In
              </Button>
            </Link>
          </div>
          
          <div className="mt-6">
            <Link to="/" className="text-primary hover:underline text-sm">
              Continue as Guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
