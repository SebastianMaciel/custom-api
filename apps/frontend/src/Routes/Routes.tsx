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

  // change from camelCase methods to separation by spaces and the first letter in uppercase. From "firstName" to "First Name"
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

  // a method for taking the method name like First Name and converting it to camelCase like firstName
  const camelCase = (str: string) =>
    str
      .replace(/\s(.)/g, ($1) => $1.toUpperCase())
      .replace(/\s/g, "")
      .replace(/^(.)/, ($1) => $1.toLowerCase());

  const formFieldsReducer = (
    state: { id: string; name: string; method: string }[],
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

  const [formFields, dispatch] = useReducer(formFieldsReducer, [
    {
      id: "1",
      name: "username",
      method: "person.firstName",
    },
  ]);

  const addField = (name: string, method: string) => {
    const randomId = Math.random().toString(36).substring(7);

    dispatch({
      type: "ADD_FIELD",
      payload: {
        id: randomId,
        name,
        method,
      },
    });
  };

  const editField = (id: string, name: string, method: string) => {
    dispatch({
      type: "EDIT_FIELD",
      payload: {
        id,
        name,
        method,
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

  const [jsonFormConfig, setJsonFormConfig] = useState<string>();

  const formattedJsonConfig = formFields.reduce<Record<string, string>>(
    (acc, field) => {
      acc[field.name] = field.method;
      return acc;
    },
    {}
  );

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/generate-data",
        formattedJsonConfig
      );

      setResponseData(response.data);
    } catch (error) {
      console.error("Error generating data:", error);
    }
  };

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

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
              {/* <Input
                type='text'
                onChange={(e) =>
                  editField(field.id, field.name, e.target.value)
                }
                value={field.method}
              /> */}

              <Popover
                open={open}
                onOpenChange={setOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant='secondary'
                    role='combobox'
                    aria-expanded={open}
                    className='max-w-[300px] justify-between'
                  >
                    {value
                      ? categories
                          .flatMap((category) => category.methods)
                          .find((method) => method === value)
                      : "Select method..."}
                    <ChevronsUpDown className='opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-[200px] p-0'>
                  <Command>
                    <CommandInput placeholder='Search framework...' />
                    <CommandList>
                      <CommandEmpty>No framework found.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((category) => (
                          <CommandGroup
                            key={category.category}
                            heading={category.category}
                          >
                            {category.methods.map((method) => (
                              <CommandItem
                                key={method}
                                value={method}
                                onSelect={(currentValue) => {
                                  setValue(
                                    currentValue === value ? "" : currentValue
                                  );

                                  editField(
                                    field.id,
                                    field.name,
                                    `${category.category}.${camelCase(
                                      currentValue
                                    )}`
                                  );

                                  setOpen(false);
                                }}
                              >
                                {method}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    value === method
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
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
        language='javascript'
        style={nord}
      >
        {JSON.stringify(
          Object.fromEntries(
            Object.entries(formattedJsonConfig).map(([key, value]) => {
              const [category, method] = value.split(".");
              return [
                key,
                (
                  faker as unknown as Record<
                    string,
                    Record<string, () => unknown>
                  >
                )[category][method]() as unknown,
              ];
            })
          ),
          null,
          2
        )}
      </SyntaxHighlighter>

      <h1 className='text-xl font-semibold mt-8'>JSON Configuration</h1>

      <textarea
        value={JSON.stringify(formattedJsonConfig, null, 2)}
        onChange={(e) => setJsonFormConfig(e.target.value)}
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

      <h1 className='text-xl font-semibold mt-8'>Generated Data</h1>

      <SyntaxHighlighter
        language='javascript'
        style={nord}
      >
        {JSON.stringify(responseData, null, 2)}
      </SyntaxHighlighter>
    </div>
  );
};

export default Routes;
