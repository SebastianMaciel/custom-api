import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import React, { useState } from "react";

type CreateRoute = {
  path: string;
  response: string;
  method: string;
};

export type RoutesResponse = {
  id: number;
  path: string;
  response: string;
  method: string;
};

type Props = {
  close: () => void;
};

const RouteManager = ({ close }: Props) => {
  const [path, setPath] = useState("");
  const [method, setMethod] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRoute = { path, method, response };

    try {
      await axios.post<CreateRoute>("http://localhost:3000/api/", newRoute);

      close();
    } catch (error) {
      console.error("Error creating route response:", error);
    }
  };

  return (
    <div className='p-4 pl-8'>
      <h1 className='text-xl font-semibold'>Route Manager</h1>

      <div className='mt-8'>
        <h3 className='text-lg mb-4'>Add New Route</h3>
        <form
          onSubmit={handleSubmit}
          className='space-y-4'
        >
          <Input
            type='text'
            placeholder='Path'
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className='w-full'
          />

          <Select
            value={method}
            onValueChange={setMethod}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select Method' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='GET'>GET</SelectItem>
              <SelectItem value='POST'>POST</SelectItem>
              <SelectItem value='PUT'>PUT</SelectItem>
              <SelectItem value='DELETE'>DELETE</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type='text'
            placeholder='Response'
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className='w-full'
          />

          <Button
            type='submit'
            className='w-full'
          >
            Create Route
          </Button>
        </form>
      </div>

      {response && (
        <div className='mt-8'>
          <h3 className='text-lg'>Generated Response</h3>
          <div className='p-4 rounded-md border'>
            <p>{response}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteManager;
