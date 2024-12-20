import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";
import { ModeToggle } from "./components/mode-toggle";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import RouteManager, { RoutesResponse } from "./RouteManager/RouteManager";
import Routes from "./Routes/Routes";

function App() {
  const [routes, setRoutes] = useState<RoutesResponse[]>([]);
  const [isAddingNewRoute, setIsAddingNewRoute] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RoutesResponse | null>();

  const handleAddNewRoute = () => {
    setIsAddingNewRoute(true);
    setSelectedRoute(null);
  };

  const viewRoute = (route: RoutesResponse) => {
    setSelectedRoute(route);
    setIsAddingNewRoute(false);
  };

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const { data } = await axios.get<RoutesResponse[]>(
          "http://localhost:3000/api"
        );

        setRoutes(data);
      } catch (error) {
        console.error("Error fetching routes:", error);
      }
    };

    fetchRoutes();
  }, [setRoutes, isAddingNewRoute]);

  return (
    <div className='flex h-screen'>
      <div className='flex'>
        <div className='w-72 border-gray-600 border-r-[1px] p-8'>
          <div className='flex justify-between mb-2'>
            <div className='flex h-16 text-xl font-bold'>CustomAPI</div>
            <ModeToggle />
          </div>

          <div className='flex mt-4 mb-2 font-thin'>Options</div>

          <Button
            variant={isAddingNewRoute ? "default" : "outline"}
            className='w-full mb-2'
            onClick={handleAddNewRoute}
          >
            Add new route
          </Button>

          <div className='flex mt-8 mb-2 font-thin'>Routes</div>

          {!routes.length && (
            <Card className='w-full p-4 text-center'>No routes found</Card>
          )}

          {routes.map((route) => (
            <Button
              key={route.id}
              className='w-full mb-2'
              variant={selectedRoute?.id === route.id ? "default" : "outline"}
              onClick={() => viewRoute(route)}
            >
              {route.path} ({route.method})
            </Button>
          ))}
        </div>
      </div>

      {isAddingNewRoute && (
        <RouteManager close={() => setIsAddingNewRoute(false)} />
      )}

      {selectedRoute && <Routes selectedRoute={selectedRoute} />}
    </div>
  );
}

export default App;
