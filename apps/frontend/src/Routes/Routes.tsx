import { Button } from "@/components/ui/button";
import { RoutesResponse } from "@/RouteManager/RouteManager";
import axios from "axios";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nord } from "react-syntax-highlighter/dist/esm/styles/prism";

export type RoutesData = {
  id: number;
  name: string;
};

type Props = {
  selectedRoute: RoutesResponse;
};

const Routes = ({ selectedRoute }: Props) => {
  const [response, setResponse] = useState<
    string | RoutesData | RoutesData[] | null
  >(null);

  const [responseData, setResponseData] = useState<any[]>([]);

  const [jsonConfig, setJsonConfig] = useState<string>(
    JSON.stringify(
      {
        _id: "string.uuid",
        avatar: "image.avatar",
        birthday: "date.birthdate",
        email: "internet.email",
        firstName: "person.firstName",
        lastName: "person.lastName",
        sex: "person.sexType",
        // subscriptionTier: "helpers.arrayElement(['free', 'basic', 'business'])",
        // TODO: Probar de enviar un array de strings, con el método y las opciones:
        subscriptionTier: [
          "helpers.arrayElement",
          '["free", "basic", "business"]',
        ],
      },
      null,
      2
    )
  );

  const handleSubmit = async () => {
    console.log("jsonConfig", JSON.stringify(jsonConfig, null, 2));

    try {
      const response = await axios.post(
        "http://localhost:3000/api/generate-data",
        JSON.parse(jsonConfig)
      );

      setResponseData(response.data);
    } catch (error) {
      console.error("Error generating data:", error);
    }
  };

  // useEffect(() => {
  //   const fetchRoutes = async () => {
  //     try {
  //       const { data } = await axios.get<RoutesData | RoutesData[]>(
  //         `http://localhost:3000/api/${selectedRoute.path}`
  //       );

  //       setResponse(data);
  //     } catch (error) {
  //       console.error("Error fetching routes:", error);
  //     }
  //   };

  //   fetchRoutes();
  // }, [selectedRoute]);

  return (
    <div className='p-4 pl-8 w-full max-w-[1280px]'>
      <h1 className='text-xl font-semibold'>Route: {selectedRoute.path}</h1>

      {/* <div className='mt-8'>
        <h3 className='text-lg mb-4'>Configure response</h3>
      </div> */}

      {/* {response && (
        <div className='mt-8'>
          <h3 className='text-lg'>Generated Response</h3>
          <div className='p-4 rounded-md border'>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        </div>
      )} */}

      <h1 className='text-xl font-semibold mt-4'>JSON Configuration</h1>

      <textarea
        value={jsonConfig}
        onChange={(e) => setJsonConfig(e.target.value)}
        rows={10}
        className='w-full mt-4 p-2 border rounded'
      ></textarea>

      <Button
        onClick={handleSubmit}
        className='ml-auto mt-4 w-full'
        variant='secondary'
      >
        Generate Data
      </Button>

      <h1 className='text-xl font-semibold mt-4'>Generated Data</h1>

      <SyntaxHighlighter
        language='javascript'
        style={nord}
      >
        {JSON.stringify(responseData, null, 2)}
      </SyntaxHighlighter>

      <div className='mt-8'>
        <h3 className='text-lg font-semibold'>Generated Data:</h3>
        <pre className='p-4 rounded'>
          {JSON.stringify(responseData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Routes;
