import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
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
    <div className='flex'>
      <div className='flex'>
        <div className='w-64 border-r border-gray-200 p-4'>
          <div className='flex text-xl h-16 font-bold'>YoukiAPI</div>

          <Button
            variant={isAddingNewRoute ? "secondary" : "default"}
            className='w-full mb-2'
            onClick={handleAddNewRoute}
          >
            Add new route
          </Button>

          <div className='flex font-thin mb-2'>Routes</div>

          {routes.map((route) => (
            <Button
              key={route.id}
              className='w-full mb-2'
              variant={selectedRoute === route ? "secondary" : "default"}
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
