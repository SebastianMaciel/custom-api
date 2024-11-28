import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RoutesResponse } from "@/RouteManager/RouteManager";
import { faker } from "@faker-js/faker";
import axios from "axios";
import { Check, ChevronsUpDown } from "lucide-react";
import { useReducer, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nord } from "react-syntax-highlighter/dist/esm/styles/prism";

const camelCase = (str: string) =>
  str
    .replace(/\s(.)/g, ($1) => $1.toUpperCase())
    .replace(/\s/g, "")
    .replace(/^(.)/, ($1) => $1.toLowerCase());

export type RoutesData = {
  id: number;
  name: string;
};

type Props = {
  selectedRoute: RoutesResponse;
};

type Action =
  | { type: "ADD_FIELD"; payload: { id: string; name: string; method: string } }
  | {
      type: "EDIT_FIELD";
      payload: { id: string; name: string; method: string };
    }
  | { type: "REMOVE_FIELD"; payload: { id: string } };

const Routes = ({ selectedRoute }: Props) => {
  const getFakerMethodsByCategory = (): {
    category: string;
    methods: string[];
  }[] => {
    const categories: { category: string; methods: string[] }[] = [];

    for (const category in faker) {
      if (typeof faker[category] === "object") {
        const methods: string[] = [];

        for (const method in faker[category]) {
          if (typeof faker[category][method] === "function") {
            methods.push(method);
          }
        }

        if (methods.length > 0) {
          categories.push({ category, methods });
        }
      }
    }

    return categories;
  };

  const fakerCategories = getFakerMethodsByCategory();
  const alphabethicalCategories = fakerCategories.sort((a, b) =>
    a.category.localeCompare(b.category)
  );

  const capitalizedMethods = alphabethicalCategories.map((category) => ({
    category: category.category,
    methods: category.methods.map((method) =>
      method
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
    ),
  }));

  const categories = capitalizedMethods.filter(
    (category) => category.category !== "_randomizer"
  );

  const unifiedMethods = categories.flatMap((category) =>
    category.methods.map((method) => ({
      label: `${category.category.toUpperCase()} | ${method}`,
      value: `${category.category}.${camelCase(method)}`,
    }))
  );
  console.log("LOG | unifiedMethods:", unifiedMethods);

  const formFieldsReducer = (
    state: {
      id: string;
      name: string;
      method: string;
      value: string;
      open: boolean;
    }[],
    action: Action
  ) => {
    switch (action.type) {
      case "ADD_FIELD":
        return [...state, action.payload!];

      case "EDIT_FIELD":
        return state.map((field) =>
          field.id === action.payload?.id
            ? { ...field, ...action.payload }
            : field
        );

      case "REMOVE_FIELD":
        return state.filter((field) => field.id !== action.payload?.id);

      default:
        return state;
    }
  };

  const [formFields, dispatch] = useReducer(formFieldsReducer, []);

  const addField = (name: string, method: string) => {
    const randomId = Math.random().toString(36).substring(7);

    dispatch({
      type: "ADD_FIELD",
      payload: {
        id: randomId,
        name,
        method,
        value: "",
        open: false,
      },
    });
  };

  const editField = (
    id: string,
    name?: string,
    method?: string,
    value?: string,
    open?: boolean
  ) => {
    dispatch({
      type: "EDIT_FIELD",
      payload: {
        id,
        ...(name !== undefined && { name }),
        ...(method !== undefined && { method }),
        ...(value !== undefined && { value }),
        ...(open !== undefined && { open }),
      },
    });
  };

  const removeField = (id: string) => {
    dispatch({
      type: "REMOVE_FIELD",
      payload: {
        id,
      },
    });
  };

  const [response, setResponse] = useState<
    string | RoutesData | RoutesData[] | null
  >(null);

  const [responseData, setResponseData] = useState<any[]>([]);

  const [jsonFormConfig, setJsonFormConfig] = useState<string>();

  interface FormField {
    id: string;
    name: string;
    method: string;
    value: string;
    open: boolean;
  }

  interface FormattedJsonConfig {
    [key: string]: string;
  }

  const formattedJsonConfig: FormattedJsonConfig = formFields.reduce(
    (acc: FormattedJsonConfig, field: FormField) => {
      acc[field.name] = field.method;
      return acc;
    },
    {} as FormattedJsonConfig
  );

  const handleSubmit = async () => {
    const routeConfig = {
      path: "/clients",
      method: "GET",
      responseConfig: JSON.stringify(formattedJsonConfig),
      seedConfig: JSON.stringify(formattedJsonConfig),
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/api",
        routeConfig
      );

      setResponseData(response.data);
    } catch (error) {
      console.error("Error generating data:", error);
    }
  };

  const handleUpdate = async () => {
    const routeConfig = {
      path: selectedRoute.path,
      method: selectedRoute.method,
      responseConfig: JSON.stringify(formattedJsonConfig),
      seedConfig: JSON.stringify(formattedJsonConfig),
    };

    try {
      const response = await axios.put(
        `http://localhost:3000/api/${selectedRoute.id}`,
        routeConfig
      );

      setResponseData(response.data);
    } catch (error) {
      console.error("Error generating data:", error);
    }
  };

  // const [open, setOpen] = useState(false);
  // const [value, setValue] = useState("");

  return (
    <div className='p-4 pl-8 w-full max-w-[920px]'>
      <h1 className='text-3xl font-semibold'>Route: {selectedRoute.path}</h1>

      <h1 className='text-xl font-semibold mt-8 mb-4'>Configure response</h1>

      <div className='flex flex-col space-y-4'>
        {formFields.map((field) => (
          <div
            key={field.id}
            className='flex w-full items-center space-x-2'
          >
            <div className='flex flex-col space-y-2 max-w-[300px] w-full'>
              <Label htmlFor={`name-${field.id}`}>Field name</Label>
              <Input
                type='text'
                onChange={(e) =>
                  editField(field.id, e.target.value, field.method)
                }
                value={field.name}
              />
            </div>

            <div className='flex flex-col space-y-2 max-w-[300px] w-full'>
              <Label htmlFor={`method-${field.id}`}>Method</Label>

              <Popover
                open={field.open}
                onOpenChange={(isOpen) =>
                  editField(field.id, undefined, undefined, undefined, isOpen)
                }
              >
                <PopoverTrigger asChild>
                  <Button
                    variant='secondary'
                    role='combobox'
                    aria-expanded={field.open}
                    className='max-w-[300px] justify-between'
                  >
                    {field.value
                      ? unifiedMethods.find(
                          (method) => method.value === field.value
                        )?.label
                      : "Select method..."}
                    <ChevronsUpDown className='opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-[300px] p-0'>
                  <Command>
                    <CommandInput placeholder='Search method...' />
                    <CommandList>
                      <CommandEmpty>No method found.</CommandEmpty>

                      <CommandGroup>
                        {unifiedMethods.map((method) => (
                          <CommandItem
                            key={method.value}
                            value={method.value}
                            onSelect={(currentValue) => {
                              const newValue =
                                currentValue === field.value
                                  ? ""
                                  : currentValue;

                              editField(
                                field.id,
                                field.name,
                                method.value,
                                newValue,
                                false
                              );
                            }}
                          >
                            {method.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                field.value === method.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <Button
              variant='secondary'
              type='button'
              className='self-end'
              onClick={() => removeField(field.id)}
            >
              Remove
            </Button>
          </div>
        ))}

        <Button
          variant='secondary'
          type='button'
          className='max-w-[300px] w-full mt-4'
          onClick={() => addField("", "")}
        >
          Add new field
        </Button>
      </div>

      <h1 className='text-xl font-semibold mt-8'>Response example</h1>

      <SyntaxHighlighter
        language='json'
        style={nord}
      >
        {JSON.stringify(
          Object.fromEntries(
            Object.entries(formattedJsonConfig).map(([key, value]) => {
              const [category, method] = value.split(".");
              if (!category || !method) return [key, null];
              return [
                key,
                (
                  faker as unknown as Record<
                    string,
                    Record<string, () => unknown>
                  >
                )[category]?.[method]?.() ?? null,
              ];
            })
          ),
          null,
          2
        )}
      </SyntaxHighlighter>

      {/* <h1 className='text-xl font-semibold mt-8'>JSON Configuration</h1> */}

      <textarea
        value={JSON.stringify(formattedJsonConfig, null, 2)}
        onChange={(e) => setJsonFormConfig(e.target.value)}
        rows={10}
        className='w-full mt-4 p-2 border rounded'
      ></textarea>

      <Button
        onClick={handleUpdate}
        className='ml-auto mt-4 w-full'
        variant='default'
      >
        Update route
      </Button>

      <h1 className='text-xl font-semibold mt-8'>Generated Data</h1>

      <SyntaxHighlighter
        language='json'
        style={nord}
      >
        {JSON.stringify(responseData, null, 2)}
      </SyntaxHighlighter>
    </div>
  );
};

export default Routes;
