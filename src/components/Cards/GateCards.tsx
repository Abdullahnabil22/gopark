import { useQuery } from "@tanstack/react-query";
import { getGates, type Gate } from "../../services/api";
import Loading from "../Loading/loading";
import LoadingError from "../Error/LoadingError";
import { Link } from "react-router";
import { Card, CardContent } from "../ui/Card";

const getGateStyle = (location: string) => {
  const loc = location.toLowerCase();
  
  if (loc.includes('vip') || loc.includes('executive')) {
    return {
      icon: '👑',
      
    };
  } else if (loc.includes('north')) {
    return {
      icon: '↑',
     
    };
  } else if (loc.includes('south')) {
    return {
      icon: '↓',
     
    };
  } else if (loc.includes('west')) {
    return {
      icon: '←',
     
    };
  } else if (loc.includes('east')) {
    return {
      icon: '→',
    
    };
  } else {
    return {
      icon: '🚪',
    };
  }
};

export default function GateCards() {
    
    const { data, isLoading, isError, error, refetch } = useQuery<Gate[]>({
        queryKey: ["gates"],
        queryFn: () => getGates(),
        enabled: Boolean(true),
      });

    
      if (isLoading) return <Loading  itemCount={5} className="px-4" />;
      if (isError) return (
        <LoadingError 
          error={(error as Error).message} 
          onRetry={() => refetch()}
          className="px-4"
        />
      );
  
  return (
    <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.isArray(data) && data.length > 0 ? (
        data.map((gate) => {
          const style = getGateStyle(gate.location);
          
          return (
            <Card key={gate.id} className={`border-2`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{style.icon}</span>
                  <span className={`text-sm font-medium`}>
                    {gate.zoneIds.length} zones
                  </span>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg">{gate.name || gate.id}</h3>
                  <p className="text-sm text-gray-600">{gate.location}</p>
                </div>
                
                <Link 
                  to={`/gate/${gate.id}`} 
                  className="block w-full text-center bg-primary text-white px-3 py-2 rounded-md hover:bg-primary/80 transition-colors"
                >
                  View Zones
                </Link>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <div className="col-span-full text-center py-8 text-gray-500">
          No gates found.
        </div>
      )}
    </div>
  );
}
