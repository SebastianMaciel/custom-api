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

export type RoutesResponse = {
  id: number;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  responseConfig: string;
  seedConfig: string;
};

type Props = {
  close: () => void;
};

const RouteManager = ({ close }: Props) => {
  const [path, setPath] = useState("");
  const [method, setMethod] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:3000/api", {
        path: path,
        method: method,
        responseConfig: '{"example_field":"animal.dog"}',
        seedConfig: '{"example_field":"animal.dog"}',
      });

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

          <Button
            type='submit'
            className='w-full'
          >
            Create Route
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RouteManager;
